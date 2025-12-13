const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');

router.get('/dashboard-stats', protect, getDashboardStats);

module.exports = router;
