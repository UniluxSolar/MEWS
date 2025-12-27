const express = require('express');
const router = express.Router();
const { getLocations, getLocationById } = require('../controllers/locationController');

router.route('/').get(getLocations);
router.route('/:id').get(getLocationById);

module.exports = router;
