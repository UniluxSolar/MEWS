const express = require('express');
const router = express.Router();
const {
    loginUser, changePassword, toggleTwoFactor, requestOtp, verifyOtp, logoutUser, getMe,
    createMpin, loginMpin, checkMpinStatus, forgotMpin, resetMpin
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', loginUser);
router.post('/request-otp', requestOtp);
router.post('/verify-otp', verifyOtp);
router.post('/logout', logoutUser);
router.get('/me', protect, getMe);
router.put('/password', protect, changePassword);
router.put('/2fa', protect, toggleTwoFactor);

// MPIN Routes
router.post('/create-mpin', protect, createMpin);
router.post('/login-mpin', loginMpin);
router.get('/check-mpin', protect, checkMpinStatus);
router.post('/forgot-mpin', forgotMpin);
router.post('/reset-mpin', protect, resetMpin);

module.exports = router;
