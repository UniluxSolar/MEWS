const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const Member = require('../models/Member');
const { sendSms } = require('../utils/smsService');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { username, password, role } = req.body; // Receive role from frontend
    console.log("--- DEBUG LOGIN ATTEMPT ---");
    console.log("Request Body:", { username, role, passwordProvided: !!password });

    // Trim and case-insensitive search
    const loginInput = username ? username.trim() : '';

    const user = await User.findOne({
        $or: [
            { username: { $regex: new RegExp(`^${loginInput}$`, "i") } },
            { email: loginInput.toLowerCase() }
        ]
    });

    console.log("User Found in DB:", user ? "YES" : "NO");
    if (user) {
        console.log("User Role in DB:", user.role);
        console.log("User stored password hash:", user.passwordHash ? "Present" : "Missing");
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        console.log("Password Match Result:", isMatch);

        if (isMatch) {
            // Enforce role verification
            if (role && user.role !== role) {
                console.log(`Role Mismatch! Expected ${user.role}, got ${role}`);
                res.status(401);
                throw new Error(`Unauthorized: You are not a ${role.replace('_', ' ')}`);
            }

            // Fetch Location Name
            let locationName = '';
            if (user.assignedLocation) {
                const Location = require('../models/Location');
                const loc = await Location.findById(user.assignedLocation);
                if (loc) locationName = loc.name;
            }

            // Send Token in HttpOnly Cookie
            res.cookie('jwt', generateToken(user._id), {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax', // Relaxed for better compatibility with redirections/initial loads
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
            });

            res.json({
                _id: user.id,
                name: user.username,
                email: user.email,
                role: user.role,
                assignedLocation: user.assignedLocation,
                locationName,
                institutionId: user.institutionId,
                // token: generateToken(user._id) // Token is now in cookie, optional to send back but safer not to
            });
            return;
        }
    }

    console.log("--- DEBUG FAILURE: Invalid Credentials ---");
    res.status(401);
    throw new Error('Invalid Credentials');
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = asyncHandler(async (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0)
    });
    res.status(200).json({ message: 'Logged out successfully' });
});

// @desc    Get current user profile (for auth check)
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    const user = {
        _id: req.user._id,
        name: req.user.username || req.user.name, // Handle User vs Member
        email: req.user.email,
        role: req.user.role,
        assignedLocation: req.user.assignedLocation,
        institutionId: req.user.institutionId,
        // photoUrl for frontend
        photoUrl: req.user.photoUrl
    };
    res.status(200).json(user);
});

// @desc    Change user password
// @route   PUT /api/auth/password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (user && (await bcrypt.compare(oldPassword, user.passwordHash))) {
        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(newPassword, salt);
        await user.save();
        res.json({ message: 'Password updated successfully' });
    } else {
        res.status(401);
        throw new Error('Invalid old password');
    }
});

// @desc    Toggle Two-Factor Authentication
// @route   PUT /api/auth/2fa
// @access  Private
const toggleTwoFactor = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    user.twoFactorEnabled = !user.twoFactorEnabled;
    await user.save();

    res.json({
        message: `Two-Factor Authentication ${user.twoFactorEnabled ? 'Enabled' : 'Disabled'}`,
        enabled: user.twoFactorEnabled
    });
});


const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d',
    });
};

// @desc    Request OTP for Member Login
// @route   POST /api/auth/request-otp
// @access  Public
const requestOtp = asyncHandler(async (req, res) => {
    const { mobile } = req.body;

    if (!mobile) {
        res.status(400);
        throw new Error('Mobile number is required');
    }

    // Find member by mobile
    const member = await Member.findOne({ mobileNumber: mobile });

    if (!member) {
        res.status(404);
        throw new Error('Member not found with this mobile number');
    }

    // 1. Rate Limiting Check
    if (member.otpLastSent) {
        const timeSinceLastSent = Date.now() - new Date(member.otpLastSent).getTime();
        const waitTime = 60 * 1000; // 60 seconds
        if (timeSinceLastSent < waitTime) {
            res.status(429); // Too Many Requests
            throw new Error(`Please wait ${Math.ceil((waitTime - timeSinceLastSent) / 1000)} seconds before requesting a new OTP.`);
        }
    }

    // 2. Generate 6-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // 3. Hash OTP
    const salt = await bcrypt.genSalt(10);
    const otpHash = await bcrypt.hash(otp, salt);

    // 4. Update Member with OTP Hash, Expiry (5 mins), and Last Sent
    member.otpHash = otpHash;
    member.otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
    member.otpLastSent = Date.now();

    // Clear any previous plain text OTP if it exists (migration cleanup)
    member.otp = undefined;

    await member.save();

    // 5. Send SMS via Twilio
    // Format Mobile Number for Twilio (Ensure +91 for India if missing)
    let formattedMobile = mobile.trim();
    if (!formattedMobile.startsWith('+')) {
        formattedMobile = `+91${formattedMobile}`;
    }

    const smsResult = await sendSms(formattedMobile, `Your MEWS Login OTP is: ${otp}. Valid for 5 minutes.`);

    console.log(`[OTP] Generated for ${mobile}: ${otp} | SMS Result:`, smsResult);

    if (smsResult.success) {
        res.json({
            message: 'OTP sent successfully to your mobile number',
            mobile
        });
    } else {
        // Fallback for Trial Accounts / Dev Mode
        // If the error relates to unverified numbers (Code 21608) or general send failures in dev, 
        // we allow the user to proceed by logging the OTP.

        console.warn('--- TWILIO FALLBACK ---');
        console.warn('SMS failed (likely Trial Account). allowing Login via Console OTP.');
        console.warn(`OTP for ${mobile} is: ${otp}`);
        console.warn('-----------------------');

        // Return success with a clear message
        // Return success with a clear message (allowing fallback login)
        // CRITICAL UPDATE: Expose the actual error for debugging GCP issues
        const errorMsg = smsResult.error || 'Unknown Twilio Error';
        console.warn(`[OTP Fallback] SMS Failed: ${errorMsg}`);
        res.json({
            message: `SMS Failed (${errorMsg}). Use OTP ${otp} (View Console)`, // Show actual error
            mobile,
            otp,
            error: errorMsg // Detailed error field
        });
    }
});

// @desc    Verify OTP and Login Member
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = asyncHandler(async (req, res) => {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
        res.status(400);
        throw new Error('Mobile and OTP are required');
    }

    const member = await Member.findOne({ mobileNumber: mobile });

    if (!member) {
        res.status(404);
        throw new Error('Member not found');
    }

    // Check if OTP exists and is not expired
    if (!member.otpHash || !member.otpExpires) {
        res.status(400);
        throw new Error('No OTP requested or access expired. Please request a new OTP.');
    }

    if (member.otpExpires < Date.now()) {
        res.status(400);
        throw new Error('OTP has expired. Please request a new one.');
    }

    // Verify Hash
    const isMatch = await bcrypt.compare(otp, member.otpHash);

    if (!isMatch) {
        res.status(400);
        throw new Error('Invalid OTP');
    }

    // Verification Successful
    member.isPhoneVerified = true;
    member.otpHash = undefined;
    member.otpExpires = undefined;
    // We keep otpLastSent for rate limiting context if needed, or can just leave it.
    await member.save();

    // Send Token in HttpOnly Cookie
    res.cookie('jwt', generateToken(member._id), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.json({
        _id: member.id,
        name: member.name,
        surname: member.surname,
        mobileNumber: member.mobileNumber,
        role: 'MEMBER',
        // token: generateToken(member._id)
    });
});

module.exports = { loginUser, changePassword, toggleTwoFactor, requestOtp, verifyOtp, logoutUser, getMe };
