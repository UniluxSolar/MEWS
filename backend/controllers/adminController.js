const asyncHandler = require('express-async-handler');
const Member = require('../models/Member');
const Institution = require('../models/Institution');
const SOSRequest = require('../models/SOSRequest');
const Location = require('../models/Location');

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard-stats
// @access  Private
const getDashboardStats = asyncHandler(async (req, res) => {
    let memberQuery = {};
    let locationName = 'All Locations';
    let villagesData = [];

    let institutionQuery = {};
    let sosQuery = {};
    // const totalFunds definition moved to bottom or reused

    // If user has an assigned location
    if (req.user.assignedLocation) {
        const location = await Location.findById(req.user.assignedLocation);
        if (location) {
            locationName = location.name;

            // Common regex filter for unstructured address fields
            const locationRegex = { $regex: location.name, $options: 'i' };

            if (req.user.role === 'VILLAGE_ADMIN') {
                // Use ID for member filtering (precise)
                memberQuery = { 'address.village': location._id };
                // Use Regex for Institution/SOS (best effort based on name)
                institutionQuery = { fullAddress: locationRegex };
                sosQuery = { location: locationRegex };

            } else if (req.user.role === 'MANDAL_ADMIN') {
                memberQuery = { 'address.mandal': location._id };
                institutionQuery = { fullAddress: locationRegex }; // A generic mandal search might strictly not work if address only says village, but best effort
                sosQuery = { location: locationRegex };

                // Fetch child villages for Mandal Dashboard
                const villages = await Location.find({ parent: location._id, type: 'VILLAGE' });

                // Aggregate stats per village
                // Aggregate stats per village
                villagesData = await Promise.all(villages.map(async (village) => {
                    // Robust query for members (ID vs String)
                    const mCount = await Member.countDocuments({
                        'address.village': { $in: [village._id, village._id.toString()] }
                    });

                    const pCount = await Member.countDocuments({
                        'address.village': { $in: [village._id, village._id.toString()] },
                        verificationStatus: 'PENDING'
                    });

                    // Approximate Institution count by Village Name
                    const instCount = await Institution.countDocuments({ fullAddress: { $regex: village.name, $options: 'i' } });
                    const sosCount = await SOSRequest.countDocuments({ location: { $regex: village.name, $options: 'i' }, status: 'OPEN' });

                    return {
                        id: village._id,
                        name: village.name,
                        members: mCount,
                        pending: pCount,
                        institutions: instCount,
                        sos: sosCount,
                        status: sosCount > 0 ? 'Action Required' : 'Active'
                    };
                }));
            } else if (req.user.role === 'DISTRICT_ADMIN') {
                memberQuery = { 'address.district': location._id };

                // Get Mandals for breakdown
                const mandals = await Location.find({ parent: location._id, type: 'MANDAL' });

                // Build a regex that matches the District Name OR Any Mandal Name
                // e.g. /Nalgonda|Chityal|Narketpally/i
                const locationNames = [location.name, ...mandals.map(m => m.name)].map(name =>
                    name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Escape regex special chars
                ).join('|');
                const locationRegexExtended = new RegExp(locationNames, 'i');

                institutionQuery = { fullAddress: locationRegexExtended };
                sosQuery = { location: locationRegexExtended };

                const mandalsData = await Promise.all(mandals.map(async (mandal) => {
                    // Match both ObjectId and String version of the ID to be safe
                    const mCount = await Member.countDocuments({
                        'address.mandal': { $in: [mandal._id, mandal._id.toString()] }
                    });
                    const instCount = await Institution.countDocuments({ fullAddress: { $regex: mandal.name, $options: 'i' } });
                    const sosCount = await SOSRequest.countDocuments({ location: { $regex: mandal.name, $options: 'i' }, status: 'ACTIVE' });
                    return {
                        id: mandal._id,
                        name: mandal.name,
                        members: mCount,
                        institutions: instCount,
                        sos: sosCount,
                        status: sosCount > 0 ? 'Action Required' : 'Active'
                    };
                }));
                // Attach to response object (will be used below)
                req.mandalsData = mandalsData;
            }
        }
    }

    const totalMembers = await Member.countDocuments(memberQuery);
    const pendingMembers = await Member.countDocuments({ ...memberQuery, verificationStatus: 'PENDING' });
    const totalInstitutions = await Institution.countDocuments(institutionQuery);
    const totalSOS = await SOSRequest.countDocuments(sosQuery);

    const totalFunds = 1250000;

    res.json({
        locationName, // Send location name to frontend
        villages: villagesData, // Send breakdown for Mandal Admin
        mandals: req.mandalsData, // Send breakdown for District Admin
        members: totalMembers,
        pendingMembers,
        institutions: totalInstitutions,
        sosAlerts: totalSOS,
        funds: totalFunds
    });
});

module.exports = {
    getDashboardStats
};
