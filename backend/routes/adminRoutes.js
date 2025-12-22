const express = require('express');
const router = express.Router();
const { getDashboardStats, getAnalyticsData } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');

router.get('/dashboard-stats', protect, getDashboardStats);
router.get('/analytics', protect, getAnalyticsData);

module.exports = router;
