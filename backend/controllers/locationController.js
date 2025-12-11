const Location = require('../models/Location');

// @desc    Create a new location
// @route   POST /api/locations
// @access  Private (Admin)
const createLocation = async (req, res) => {
    const { name, type, parent } = req.body;

    // Basic validation
    if (!name || !type) {
        return res.status(400).json({ message: 'Name and Type are required' });
    }

    try {
        const location = await Location.create({
            name,
            type,
            parent: parent || null
        });
        res.status(201).json(location);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all locations (optionally filter by type or parent)
// @route   GET /api/locations
// @access  Private
const getLocations = async (req, res) => {
    const { type, parent } = req.query;
    let query = {};

    if (type) query.type = type;
    if (parent) query.parent = parent;

    try {
        const locations = await Location.find(query);
        res.status(200).json(locations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single location
// @route   GET /api/locations/:id
// @access  Private
const getLocationById = async (req, res) => {
    try {
        const location = await Location.findById(req.params.id).populate('parent');
        if (!location) {
            return res.status(404).json({ message: 'Location not found' });
        }
        res.status(200).json(location);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createLocation,
    getLocations,
    getLocationById
};
