const asyncHandler = require('express-async-handler');
const Location = require('../models/Location');

// @desc    Get locations (filtered by type or parent)
// @route   GET /api/locations
// @access  Public
const getLocations = asyncHandler(async (req, res) => {
    const { type, parent } = req.query;
    let query = {};

    if (type) {
        query.type = Array.isArray(type) ? { $in: type } : type;
    }

    if (parent) {
        query.parent = parent.includes(',') ? { $in: parent.split(',') } : parent;
    }

    if (req.query.ancestor) {
        const ancestorVal = req.query.ancestor;
        query['ancestors.locationId'] = ancestorVal.includes(',') ? { $in: ancestorVal.split(',') } : ancestorVal;
    }

    // Special case: If nothing provided, maybe return States
    if (!type && !parent && !req.query.ancestor) {
        query.type = 'STATE';
    }

    const locations = await Location.find(query).select('name _id type pincode parent').sort('name');
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
