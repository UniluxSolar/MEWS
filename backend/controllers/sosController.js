const SOSRequest = require('../models/SOSRequest');
const asyncHandler = require('express-async-handler');

// @desc    Create new SOS alert
// @route   POST /api/sos
// @access  Public
const createSOS = asyncHandler(async (req, res) => {
    const { name, type, location, description } = req.body;

    // Create simple alert
    const sos = await SOSRequest.create({
        name,
        type,
        location,
        description,
        status: 'ACTIVE'
    });

    res.status(201).json(sos);
});

// @desc    Get active SOS alerts
// @route   GET /api/sos
// @access  Public
const getActiveSOS = asyncHandler(async (req, res) => {
    const alerts = await SOSRequest.find({ status: 'ACTIVE' }).sort({ createdAt: -1 });
    res.json(alerts);
});

module.exports = {
    createSOS,
    getActiveSOS
};
