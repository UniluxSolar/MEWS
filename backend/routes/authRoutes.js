const express = require('express');
const router = express.Router();
const { loginUser, changePassword, toggleTwoFactor } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', loginUser);
router.put('/password', protect, changePassword);
router.put('/2fa', protect, toggleTwoFactor);

module.exports = router;
