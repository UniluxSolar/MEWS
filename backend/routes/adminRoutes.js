const express = require('express');
const router = express.Router();
console.log("-> Loading adminRoutes...");
const { getDashboardStats, getAnalyticsData, getVillageSettings } = require('../controllers/adminController');
const { getSubordinateAdmins, createAdmin, updateAdmin, deleteAdmin, getChildLocations } = require('../controllers/adminManagementController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/dashboard-stats', protect, getDashboardStats);
router.get('/analytics', protect, getAnalyticsData);
router.get('/settings', protect, getVillageSettings);

// Admin Management Routes
// Only Super, State, District, Mandal admins can manage others. Village Admin is leaf.
router.get('/management', protect, authorize('SUPER_ADMIN', 'STATE_ADMIN', 'DISTRICT_ADMIN', 'MANDAL_ADMIN'), getSubordinateAdmins);
router.post('/management', protect, authorize('SUPER_ADMIN', 'STATE_ADMIN', 'DISTRICT_ADMIN', 'MANDAL_ADMIN'), createAdmin);
router.put('/management/:id', protect, authorize('SUPER_ADMIN', 'STATE_ADMIN', 'DISTRICT_ADMIN', 'MANDAL_ADMIN'), updateAdmin);
router.delete('/management/:id', protect, authorize('SUPER_ADMIN', 'STATE_ADMIN', 'DISTRICT_ADMIN', 'MANDAL_ADMIN'), deleteAdmin);

// New: Helper to fetch locations for dropdown
router.get('/management/locations', protect, getChildLocations);

module.exports = router;
