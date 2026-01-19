const express = require('express');
const router = express.Router();
const { loginUser, changePassword, toggleTwoFactor, requestOtp, verifyOtp } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', loginUser);
router.post('/request-otp', requestOtp);
router.post('/verify-otp', verifyOtp);
router.put('/password', protect, changePassword);
router.put('/2fa', protect, toggleTwoFactor);

module.exports = router;
