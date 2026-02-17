const express = require('express');
const router = express.Router();
const {
    sendVerificationCode,
    verifyCode,
    resendCode,
    checkVerification
} = require('../controllers/emailVerificationController');

// @route   POST /api/email-verification/send
// @desc    Send verification code to email
// @access  Public
router.post('/send', sendVerificationCode);

// @route   POST /api/email-verification/verify
// @desc    Verify email code
// @access  Public
router.post('/verify', verifyCode);

// @route   POST /api/email-verification/resend
// @desc    Resend verification code
// @access  Public
router.post('/resend', resendCode);

// @route   POST /api/email-verification/check
// @desc    Check if email is verified
// @access  Public
router.post('/check', checkVerification);

module.exports = router;
