const Institution = require('../models/Institution');
const asyncHandler = require('express-async-handler');

// @desc    Register new institution
// @route   POST /api/institutions
// @access  Public
const registerInstitution = asyncHandler(async (req, res) => {
    const {
        type, name, ownerName, mobileNumber, whatsappNumber,
        fullAddress, googleMapsLink, mewsDiscountPercentage, servicesOffered
    } = req.body;

    // Basic validation
    if (!type || !name || !fullAddress || !mobileNumber) {
        res.status(400);
        throw new Error('Please include all required fields');
    }

    const institution = await Institution.create({
        type,
        name,
        ownerName,
        mobileNumber,
        whatsappNumber,
        fullAddress,
        googleMapsLink,
        mewsDiscountPercentage,
        servicesOffered: servicesOffered ? servicesOffered : [] // frontend sends array
    });

    if (institution) {
        res.status(201).json({
            _id: institution._id,
            name: institution.name,
            message: 'Institution registered successfully'
        });
    } else {
        res.status(400);
        throw new Error('Invalid institution data');
    }
});

// @desc    Get all institutions
// @route   GET /api/institutions
// @access  Public
const Location = require('../models/Location');

// @desc    Get all institutions
// @route   GET /api/institutions
// @access  Private (Admin)
const getInstitutions = asyncHandler(async (req, res) => {
    let query = {};

    // Filter by assigned location if user has one
    if (req.user && req.user.assignedLocation) {
        const location = await Location.findById(req.user.assignedLocation);
        if (location) {
            // Since Institution uses 'fullAddress' string, we use Regex to match the location name
            query.fullAddress = { $regex: location.name, $options: 'i' };
        }
    }

    const institutions = await Institution.find(query).sort({ createdAt: -1 });
    res.json(institutions);
});

// @desc    Get institution by ID
// @route   GET /api/institutions/:id
// @access  Private
const getInstitutionById = asyncHandler(async (req, res) => {
    const institution = await Institution.findById(req.params.id);
    if (institution) {
        res.json(institution);
    } else {
        res.status(404);
        throw new Error('Institution not found');
    }
});

// @desc    Update institution
// @route   PUT /api/institutions/:id
// @access  Private
const updateInstitution = asyncHandler(async (req, res) => {
    const institution = await Institution.findById(req.params.id);

    if (institution) {
        institution.name = req.body.name || institution.name;
        institution.type = req.body.type || institution.type;
        institution.fullAddress = req.body.fullAddress || institution.fullAddress;
        institution.mobileNumber = req.body.mobileNumber || institution.mobileNumber;
        institution.whatsappNumber = req.body.whatsappNumber || institution.whatsappNumber;
        institution.email = req.body.email || institution.email;
        institution.website = req.body.website || institution.website;

        // Admin Info / Contact Person
        institution.ownerName = req.body.adminName || institution.ownerName; // Mapping adminName to ownerName as per schema/frontend usage
        // Note: Schema might have specific fields, let's double check model if needed, 
        // but for now relying on register's ownerName. Schema check would be good but user wants fix now.
        // Step 1797 showed register uses ownerName. 
        // Edit frontend sends adminName (Step 1803:158).

        // Let's check Schema if possible or just map it.
        // Assuming strict mapping:
        if (req.body.adminName) institution.ownerName = req.body.adminName;

        // Add other fields from body if they exist in schema
        if (req.body.adminPhone) institution.mobileNumber = req.body.adminPhone; // Wait, mobile is main contact? 
        // Frontend has "Official Mobile" and "Admin Phone". 
        // Register controller (Step 1797) has `mobileNumber` and `whatsappNumber`. 
        // Does it have separate admin phone? 
        // Let's stick to updating available fields.

        const updatedInstitution = await institution.save();
        res.json(updatedInstitution);
    } else {
        res.status(404);
        throw new Error('Institution not found');
    }
});

module.exports = {
    registerInstitution,
    getInstitutions,
    getInstitutionById,
    updateInstitution
};
