const asyncHandler = require('express-async-handler');
const Location = require('../models/Location');

// @desc    Get locations (filtered by type or parent)
// @route   GET /api/locations
// @access  Public
const getLocations = asyncHandler(async (req, res) => {
    const { type, parent } = req.query;
    let query = {};

    if (type) {
        query.type = type;
    }

    if (parent) {
        query.parent = parent;
    } else if (type !== 'STATE' && type) {
        // If type is requested but no parent, typically we might want top-level or return error.
        // For 'STATE', parent is null, so it's fine.
        // For 'DISTRICT', we usually want districts of a specific state. 
        // If parent is not provided for sub-levels, we might return all (or limit).
    }

    // Special case: If nothing provided, maybe return States
    if (!type && !parent) {
        query.type = 'STATE';
    }

    const locations = await Location.find(query).select('name _id type pincode').sort('name');
    res.json(locations);
});

// @desc    Get single location by ID
// @route   GET /api/locations/:id
// @access  Public
const getLocationById = asyncHandler(async (req, res) => {
    const location = await Location.findById(req.params.id);
    if (location) {
        res.json(location);
    } else {
        res.status(404);
        throw new Error('Location not found');
    }
});

module.exports = {
    getLocations,
    getLocationById
};
