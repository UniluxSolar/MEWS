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

    // If user has an assigned location
    if (req.user.assignedLocation) {
        const location = await Location.findById(req.user.assignedLocation);
        if (location) {
            locationName = location.name;

            // Common regex filter for unstructured address fields (Institution/SOS)
            const locationRegex = { $regex: location.name, $options: 'i' };

            if (req.user.role === 'VILLAGE_ADMIN') {
                // STRICT: Use ID match for members to prevent CastError
                memberQuery = { 'address.village': location._id };

                // Use Regex for Institution (fullAddress is String)
                institutionQuery = { fullAddress: locationRegex };
                // Fix: SOS location is nested object with address string
                sosQuery = { 'location.address': locationRegex };

            } else if (req.user.role === 'MANDAL_ADMIN') {
                memberQuery = { 'address.mandal': location._id };

                institutionQuery = { fullAddress: locationRegex };
                sosQuery = { 'location.address': locationRegex };

                // Fetch child villages for Mandal Dashboard
                const villages = await Location.find({ parent: location._id, type: 'VILLAGE' });

                // Aggregate stats per village
                villagesData = await Promise.all(villages.map(async (village) => {
                    const mCount = await Member.countDocuments({
                        'address.village': village._id
                    });

                    const pCount = await Member.countDocuments({
                        'address.village': village._id,
                        verificationStatus: 'PENDING'
                    });

                    const instCount = await Institution.countDocuments({ fullAddress: { $regex: village.name, $options: 'i' } });
                    const sosCount = await SOSRequest.countDocuments({ 'location.address': { $regex: village.name, $options: 'i' }, status: 'OPEN' });

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

                // Build a regex that matches the District Name OR Any Mandal Name range
                const locationNames = [location.name, ...mandals.map(m => m.name)].map(name =>
                    name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                ).join('|');
                const locationRegexExtended = new RegExp(locationNames, 'i');

                institutionQuery = { fullAddress: locationRegexExtended };
                sosQuery = { 'location.address': locationRegexExtended };

                const mandalsData = await Promise.all(mandals.map(async (mandal) => {
                    const mCount = await Member.countDocuments({
                        'address.mandal': mandal._id
                    });
                    const instCount = await Institution.countDocuments({ fullAddress: { $regex: mandal.name, $options: 'i' } });
                    const sosCount = await SOSRequest.countDocuments({ 'location.address': { $regex: mandal.name, $options: 'i' }, status: 'ACTIVE' });
                    return {
                        id: mandal._id,
                        name: mandal.name,
                        members: mCount,
                        institutions: instCount,
                        sos: sosCount,
                        status: sosCount > 0 ? 'Action Required' : 'Active'
                    };
                }));
                // Attach to response object
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

const Donation = require('../models/Donation');

// @desc    Get detailed analytics
// @route   GET /api/admin/analytics
// @access  Private
const getAnalyticsData = asyncHandler(async (req, res) => {
    let memberQuery = {};
    let locationName = 'All Locations';

    // Standardized Role-Based Filtering (Matches memberController.js)
    if (req.user.assignedLocation) {
        const locationId = req.user.assignedLocation;
        // Fetch location name for naming
        const locationDoc = await Location.findById(locationId);
        if (locationDoc) locationName = locationDoc.name;

        if (req.user.role === 'VILLAGE_ADMIN') {
            memberQuery = { 'address.village': locationId };
        } else if (req.user.role === 'MANDAL_ADMIN') {
            memberQuery = { 'address.mandal': locationId };
        } else if (req.user.role === 'DISTRICT_ADMIN') {
            memberQuery = { 'address.district': locationId };
        } else if (req.user.role === 'STATE_ADMIN') {
            // Find all districts under this state
            const districts = await Location.find({ parent: locationId, type: 'DISTRICT' }).select('_id');
            const districtIds = districts.map(d => d._id);
            memberQuery = { 'address.district': { $in: districtIds } };
        }
        // SUPER_ADMIN (with assignedLocation??) -> Shows all or restricted?
        // memberController allows SUPER_ADMIN to see all despite assignedLocation.
        else if (req.user.role === 'SUPER_ADMIN') {
            memberQuery = {}; // Show All
        }

    } else {
        // No assigned location
        if (req.user.role !== 'SUPER_ADMIN') {
            // Force empty result for safety if non-super admin has no location
            // But if memberController allows it/blocks it... memberController blocks it.
            // Let's block it here too to be safe.
            memberQuery = { _id: null };
        }
        // If SUPER_ADMIN, memberQuery remains {} -> Show All
    }

    console.log(`[ANALYTICS] Role: ${req.user.role}, Query:`, JSON.stringify(memberQuery));

    // 1. Member Stats
    const totalMembers = await Member.countDocuments(memberQuery);

    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    const newMembers = await Member.countDocuments({
        ...memberQuery,
        createdAt: { $gte: last30Days }
    });

    const pendingMembers = await Member.countDocuments({ ...memberQuery, verificationStatus: 'PENDING' });

    // 2. Demographics - Gender
    const genderStats = await Member.aggregate([
        { $match: memberQuery },
        { $group: { _id: "$gender", count: { $sum: 1 } } }
    ]);

    // 3. Demographics - Occupation (Projecting to standardize)
    const occupationStats = await Member.aggregate([
        { $match: memberQuery },
        {
            $group: {
                _id: "$occupation",
                count: { $sum: 1 }
            }
        },
        { $sort: { count: -1 } },
        { $limit: 10 } // Top 10 occupations
    ]);

    // 4. Demographics - Caste
    const casteStats = await Member.aggregate([
        { $match: memberQuery },
        { $group: { _id: "$casteDetails.caste", count: { $sum: 1 } } }
    ]);

    // 5. Demographics - Marital Status
    const maritalStats = await Member.aggregate([
        { $match: memberQuery },
        { $group: { _id: "$maritalStatus", count: { $sum: 1 } } }
    ]);

    // 6. Demographics - Age Groups
    const ageStats = await Member.aggregate([
        { $match: memberQuery },
        {
            $project: {
                ageGroup: {
                    $switch: {
                        branches: [
                            { case: { $lte: ["$age", 18] }, then: "0-18" },
                            { case: { $lte: ["$age", 30] }, then: "19-30" },
                            { case: { $lte: ["$age", 50] }, then: "31-50" },
                            { case: { $lte: ["$age", 70] }, then: "51-70" },
                        ],
                        default: "70+"
                    }
                }
            }
        },
        { $group: { _id: "$ageGroup", count: { $sum: 1 } } },
        { $sort: { _id: 1 } } // Sort by age group label (lexicographically works ok for these: 0, 1, 3, 5, 7)
    ]);

    // 4. Funds (Global sum for now, can be refined to location based if needed)
    const fundsAgg = await Donation.aggregate([
        { $match: { status: 'SUCCESS' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalFunds = fundsAgg.length > 0 ? fundsAgg[0].total : 0;

    // 5. SOS
    // Re-calculating SOS query based on user role would duplicate code, 
    // for now we fetch total active stats loosely or reuse if we pull logic out.
    // Let's do a simple count globally for the location if possible, or just ignore location strictness for SOS in this detailed view 
    // to avoid complexity, OR replicate the regex logic.
    // Replicating regex logic safely:
    let sosCount = 0;
    if (req.user.assignedLocation) {
        const location = await Location.findById(req.user.assignedLocation);
        if (location) {
            const regex = new RegExp(location.name, 'i');
            sosCount = await SOSRequest.countDocuments({ 'location.address': { $regex: regex }, status: { $in: ['OPEN', 'IN_PROGRESS'] } });
        }
    } else {
        sosCount = await SOSRequest.countDocuments({ status: { $in: ['OPEN', 'IN_PROGRESS'] } });
    }

    console.log(`Analytics Debug: User=${req.user.role}, Loc=${locationName}, Members=${totalMembers}, Funds=${totalFunds}`);

    res.json({
        period: 'Last 30 Days',
        metrics: {
            totalMembers,
            newMembers,
            totalFunds,
            sosActive: sosCount,
            pending: pendingMembers
        },
        demographics: {
            gender: genderStats,
            occupation: occupationStats,
            caste: casteStats,
            marital: maritalStats,
            age: ageStats
        }
    });
});

module.exports = {
    getDashboardStats,
    getAnalyticsData
};
