const EmailVerification = require('../models/EmailVerification');
const asyncHandler = require('express-async-handler');
const { generateOTP, hashCode, verifyCodeHash } = require('../utils/otpUtils');
const { sendVerificationEmail } = require('../utils/emailService');

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 5 * 60 * 1000; // 5 minutes
const MAX_REQUESTS = 3;
const RESEND_COOLDOWN = 60 * 1000; // 60 seconds
const CODE_EXPIRY = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS = 3;

/**
 * @desc    Send verification code to email
 * @route   POST /api/email-verification/send
 * @access  Public
 */
const sendVerificationCode = asyncHandler(async (req, res) => {
    const { email, name } = req.body;

    // Validate email
    if (!email) {
        res.status(400);
        throw new Error('Email is required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        res.status(400);
        throw new Error('Invalid email format');
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check rate limiting - count requests in last 5 minutes
    const rateLimitTime = new Date(Date.now() - RATE_LIMIT_WINDOW);
    const recentRequests = await EmailVerification.countDocuments({
        email: normalizedEmail,
        createdAt: { $gte: rateLimitTime }
    });

    if (recentRequests >= MAX_REQUESTS) {
        res.status(429);
        throw new Error('Too many verification requests. Please try again in 5 minutes.');
    }

    // Check resend cooldown - find most recent request
    const lastRequest = await EmailVerification.findOne({
        email: normalizedEmail
    }).sort({ createdAt: -1 });

    if (lastRequest) {
        const timeSinceLastSend = Date.now() - lastRequest.lastSentAt.getTime();
        if (timeSinceLastSend < RESEND_COOLDOWN) {
            const remainingSeconds = Math.ceil((RESEND_COOLDOWN - timeSinceLastSend) / 1000);
            res.status(429);
            throw new Error(`Please wait ${remainingSeconds} seconds before requesting a new code`);
        }
    }

    // Generate OTP
    const code = generateOTP();
    const hashedCode = hashCode(code);

    // Create or update verification record
    const expiresAt = new Date(Date.now() + CODE_EXPIRY);

    // Delete any existing unverified records for this email
    await EmailVerification.deleteMany({
        email: normalizedEmail,
        verified: false
    });

    // Create new verification record
    await EmailVerification.create({
        email: normalizedEmail,
        code: hashedCode,
        expiresAt,
        lastSentAt: new Date()
    });

    // Send email
    try {
        await sendVerificationEmail(normalizedEmail, code, name || 'User');
        console.log(`[Email Verification] Code sent to ${normalizedEmail}`);
    } catch (emailError) {
        console.error('[Email Verification] Failed to send email:', emailError);
        res.status(500);
        throw new Error('Failed to send verification email. Please check your email address and try again.');
    }

    res.status(200).json({
        success: true,
        message: 'Verification code sent to your email',
        expiresIn: CODE_EXPIRY / 1000 // seconds
    });
});

/**
 * @desc    Verify email code
 * @route   POST /api/email-verification/verify
 * @access  Public
 */
const verifyCode = asyncHandler(async (req, res) => {
    const { email, code } = req.body;

    // Validate inputs
    if (!email || !code) {
        res.status(400);
        throw new Error('Email and verification code are required');
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Validate code format (6 digits)
    if (!/^\d{6}$/.test(code)) {
        res.status(400);
        throw new Error('Invalid verification code format');
    }

    // Find verification record
    const verification = await EmailVerification.findOne({
        email: normalizedEmail,
        verified: false
    }).sort({ createdAt: -1 });

    if (!verification) {
        res.status(404);
        throw new Error('No verification request found. Please request a new code.');
    }

    // Check if code is expired
    if (new Date() > verification.expiresAt) {
        res.status(400);
        throw new Error('Verification code has expired. Please request a new code.');
    }

    // Check max attempts
    if (verification.attempts >= MAX_ATTEMPTS) {
        res.status(400);
        throw new Error('Maximum verification attempts exceeded. Please request a new code.');
    }

    // Verify code
    const isValid = verifyCodeHash(code, verification.code);

    if (!isValid) {
        // Increment attempts
        verification.attempts += 1;
        await verification.save();

        const remainingAttempts = MAX_ATTEMPTS - verification.attempts;
        res.status(400);
        throw new Error(`Invalid verification code. ${remainingAttempts} attempt(s) remaining.`);
    }

    // Mark as verified
    verification.verified = true;
    await verification.save();

    console.log(`[Email Verification] Email verified: ${normalizedEmail}`);

    res.status(200).json({
        success: true,
        message: 'Email verified successfully',
        email: normalizedEmail
    });
});

/**
 * @desc    Resend verification code
 * @route   POST /api/email-verification/resend
 * @access  Public
 */
const resendCode = asyncHandler(async (req, res) => {
    // Resend is essentially the same as send, just call sendVerificationCode
    return sendVerificationCode(req, res);
});

/**
 * @desc    Check if email is verified
 * @route   POST /api/email-verification/check
 * @access  Public
 */
const checkVerification = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        res.status(400);
        throw new Error('Email is required');
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find most recent verified record
    const verification = await EmailVerification.findOne({
        email: normalizedEmail,
        verified: true,
        expiresAt: { $gt: new Date() } // Still valid
    }).sort({ createdAt: -1 });

    res.status(200).json({
        verified: !!verification,
        email: normalizedEmail
    });
});

module.exports = {
    sendVerificationCode,
    verifyCode,
    resendCode,
    checkVerification
};
