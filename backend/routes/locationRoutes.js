const express = require('express');
const router = express.Router();
const { createLocation, getLocations, getLocationById } = require('../controllers/locationController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

router.post('/', authorize('SUPER_ADMIN', 'STATE_ADMIN', 'DISTRICT_ADMIN'), createLocation);
router.get('/', getLocations);
router.get('/:id', getLocationById);

module.exports = router;
