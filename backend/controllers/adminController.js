const asyncHandler = require('express-async-handler');
const Member = require('../models/Member');
const Institution = require('../models/Institution');
const Location = require('../models/Location');

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard-stats
// @access  Private
const getDashboardStats = asyncHandler(async (req, res) => {
    let memberQuery = {};
    let locationName = 'All Locations';
    let villagesData = [];

    let institutionQuery = {};

    // If user has an assigned location OR if a specific locationId is requested (Drill Down)
    let targetLocationId = req.user.assignedLocation;

    // DRILL DOWN OVERRIDE
    if (req.query.locationId) {
        // TODO: Validate if user is allowed to view this location (Hierarchy check)
        // For now, assuming UI only shows valid links for authorized users.
        targetLocationId = req.query.locationId;
        console.log(`[DASHBOARD] Drill Down requested for LocationID: ${targetLocationId}`);
    }

    if (targetLocationId) {
        const location = await Location.findById(targetLocationId);
        if (location) {
            locationName = location.name;
            console.log(`[DASHBOARD] User: ${req.user.email}, Role: ${req.user.role}, Target: ${locationName} (${location.type})`);

            // Determine Context Role based on Target Location Type
            // If I am State Admin viewing a District, I want "District Admin" style breakdown stats.
            let contextRole = req.user.role;
            if (location.type === 'DISTRICT') contextRole = 'DISTRICT_ADMIN';
            if (location.type === 'MUNICIPALITY') contextRole = 'MUNICIPALITY_ADMIN';
            if (location.type === 'MANDAL') contextRole = 'MANDAL_ADMIN';
            if (location.type === 'VILLAGE') contextRole = 'VILLAGE_ADMIN';

            // Common regex filter for unstructured address fields (Institution/SOS)
            const locationRegex = { $regex: location.name, $options: 'i' };

            if (contextRole === 'VILLAGE_ADMIN') {
                // STRICT: Use ID match for members to prevent CastError
                // Handle duplicate location entries (e.g. multiple "Annaram" IDs)
                // Use robust regex to match name with potential whitespace in DB
                const escapedName = location.name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const relatedLocations = await Location.find({
                    name: { $regex: new RegExp(`^\\s*${escapedName}\\s*$`, 'i') },
                    type: location.type // Ensure type matches (VILLAGE)
                });
                const locIds = relatedLocations.map(l => l._id);

                memberQuery = { 'address.village': { $in: locIds } };

                // Use Regex for Institution (fullAddress is String)
                institutionQuery = { fullAddress: locationRegex };

            } else if (contextRole === 'MUNICIPALITY_ADMIN') {
                // STRICT: Use ID match for members to prevent CastError
                const escapedName = location.name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const relatedLocations = await Location.find({
                    name: { $regex: new RegExp(`^\\s*${escapedName}\\s*$`, 'i') },
                    type: 'MUNICIPALITY'
                });
                const locIds = relatedLocations.map(l => l._id);

                memberQuery = { 'address.municipality': { $in: locIds } };
                institutionQuery = { fullAddress: locationRegex };

                // Aggregate active villages/wards with members inside Municipality
                const villageAgg = await Member.aggregate([
                    { $match: { 'address.municipality': { $in: locIds }, 'address.village': { $ne: null } } },
                    {
                        $group: {
                            _id: '$address.village',
                            members: { $sum: 1 },
                            pending: {
                                $sum: {
                                    $cond: [{ $eq: ['$verificationStatus', 'PENDING'] }, 1, 0]
                                }
                            }
                        }
                    },
                    {
                        $lookup: {
                            from: 'locations',
                            localField: '_id',
                            foreignField: '_id',
                            as: 'locationDetails'
                        }
                    },
                    { $match: { 'locationDetails.0': { $exists: true } } },
                    {
                        $project: {
                            _id: 1,
                            names: { $arrayElemAt: ['$locationDetails.name', 0] },
                            members: 1,
                            pending: 1
                        }
                    }
                ]);

                // Aggregate stats per active village
                villagesData = await Promise.all(villageAgg.map(async (village) => {
                    const instCount = await Institution.countDocuments({ fullAddress: { $regex: village.names, $options: 'i' } });

                    return {
                        id: village._id.toString(),
                        name: village.names,
                        members: village.members,
                        pending: village.pending,
                        institutions: instCount,
                        sos: 0,
                        status: 'Active'
                    };
                }));

            } else if (contextRole === 'MANDAL_ADMIN') {
                // Robust Fix: Handle duplicate Location IDs by Name
                const escapedName = location.name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const matchingMandals = await Location.find({
                    name: { $regex: new RegExp(`^\\s*${escapedName}\\s*$`, 'i') },
                    type: 'MANDAL'
                });
                const mandalIds = matchingMandals.map(m => m._id);
                console.log(`[DASHBOARD] Mandal Admin - Found ${mandalIds.length} matching Mandal IDs for name "${location.name}"`);

                memberQuery = { 'address.mandal': { $in: mandalIds } };

                institutionQuery = { fullAddress: locationRegex };

                // Aggregate active villages with members
                const villageAgg = await Member.aggregate([
                    { $match: { 'address.mandal': { $in: mandalIds }, 'address.village': { $ne: null } } },
                    {
                        $group: {
                            _id: '$address.village',
                            members: { $sum: 1 },
                            pending: {
                                $sum: {
                                    $cond: [{ $eq: ['$verificationStatus', 'PENDING'] }, 1, 0]
                                }
                            }
                        }
                    },
                    {
                        $lookup: {
                            from: 'locations',
                            localField: '_id',
                            foreignField: '_id',
                            as: 'locationDetails'
                        }
                    },
                    { $match: { 'locationDetails.0': { $exists: true } } },
                    {
                        $project: {
                            _id: 1,
                            names: { $arrayElemAt: ['$locationDetails.name', 0] },
                            members: 1,
                            pending: 1
                        }
                    }
                ]);

                // Aggregate stats per active village
                villagesData = await Promise.all(villageAgg.map(async (village) => {
                    const instCount = await Institution.countDocuments({ fullAddress: { $regex: village.names, $options: 'i' } });

                    return {
                        id: village._id.toString(),
                        name: village.names,
                        members: village.members,
                        pending: village.pending,
                        institutions: instCount,
                        sos: 0,
                        status: 'Active'
                    };
                }));
            } else if (contextRole === 'DISTRICT_ADMIN') {
                memberQuery = { 'address.district': location._id };

                // Aggregate to get active mandals with members
                const mandalAgg = await Member.aggregate([
                    { $match: { 'address.district': location._id, 'address.mandal': { $ne: null } } },
                    {
                        $group: {
                            _id: '$address.mandal',
                            members: { $sum: 1 },
                            pending: {
                                $sum: {
                                    $cond: [{ $eq: ['$verificationStatus', 'PENDING'] }, 1, 0]
                                }
                            }
                        }
                    },
                    {
                        $lookup: {
                            from: 'locations',
                            localField: '_id',
                            foreignField: '_id',
                            as: 'locationDetails'
                        }
                    },
                    { $match: { 'locationDetails.0': { $exists: true } } },
                    {
                        $project: {
                            _id: 1,
                            names: { $arrayElemAt: ['$locationDetails.name', 0] },
                            members: 1,
                            pending: 1
                        }
                    }
                ]);

                const mandalsData = await Promise.all(mandalAgg.map(async (m) => {
                    const instCount = await Institution.countDocuments({ fullAddress: { $regex: m.names, $options: 'i' } });
                    return {
                        id: m._id.toString(),
                        name: m.names,
                        members: m.members,
                        pending: m.pending,
                        institutions: instCount,
                        sos: 0,
                        status: 'Active'
                    };
                }));
                // Attach to response object
                req.mandalsData = mandalsData;

                // --- MUNICIPALITIES FETCHING ---
                const munAgg = await Member.aggregate([
                    { $match: { 'address.district': location._id, 'address.municipality': { $ne: null } } },
                    {
                        $group: {
                            _id: '$address.municipality',
                            members: { $sum: 1 },
                            pending: {
                                $sum: {
                                    $cond: [{ $eq: ['$verificationStatus', 'PENDING'] }, 1, 0]
                                }
                            }
                        }
                    },
                    {
                        $lookup: {
                            from: 'locations',
                            localField: '_id',
                            foreignField: '_id',
                            as: 'locationDetails'
                        }
                    },
                    { $match: { 'locationDetails.0': { $exists: true } } },
                    {
                        $project: {
                            _id: 1,
                            names: { $arrayElemAt: ['$locationDetails.name', 0] },
                            members: 1,
                            pending: 1
                        }
                    }
                ]);

                const municipalitiesData = await Promise.all(munAgg.map(async (mun) => {
                    const instCount = await Institution.countDocuments({ fullAddress: { $regex: mun.names, $options: 'i' } });
                    return {
                        id: mun._id.toString(),
                        name: mun.names,
                        members: mun.members,
                        pending: mun.pending,
                        institutions: instCount,
                        sos: 0,
                        status: 'Active'
                    };
                }));
                req.municipalitiesData = municipalitiesData;

            } else if (contextRole === 'STATE_ADMIN' || contextRole === 'SUPER_ADMIN') {
                // Determine logic for State Dashboard
                // Robust Fix: Get all districts populated with members using aggregation
                const districtsObjIds = await Location.find({ parent: location._id, type: 'DISTRICT' }).distinct('_id');
                const adminMemberQuery = { 'address.district': { $in: districtsObjIds } };
                memberQuery = adminMemberQuery;

                const districtAgg = await Member.aggregate([
                    { $match: adminMemberQuery },
                    {
                        $group: {
                            _id: '$address.district',
                            members: { $sum: 1 },
                            pending: {
                                $sum: {
                                    $cond: [{ $eq: ['$verificationStatus', 'PENDING'] }, 1, 0]
                                }
                            }
                        }
                    },
                    {
                        $lookup: {
                            from: 'locations',
                            localField: '_id',
                            foreignField: '_id',
                            as: 'locationDetails'
                        }
                    },
                    { $match: { 'locationDetails.0': { $exists: true } } },
                    {
                        $project: {
                            _id: 1,
                            names: { $arrayElemAt: ['$locationDetails.name', 0] },
                            members: 1,
                            pending: 1
                        }
                    }
                ]);

                // Institution Query: regex match state name or active district names
                const locationNames = [location.name, ...districtAgg.map(d => d.names)].map(name =>
                    name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                ).join('|');
                const locationRegexExtended = new RegExp(locationNames, 'i');
                institutionQuery = { fullAddress: locationRegexExtended };


                const districtsData = await Promise.all(districtAgg.map(async (district) => {
                    const instCount = await Institution.countDocuments({ fullAddress: { $regex: district.names, $options: 'i' } });

                    return {
                        id: district._id.toString(),
                        name: district.names,
                        members: district.members,
                        pending: district.pending,
                        institutions: instCount,
                        sos: 0,
                        status: 'Active'
                    };
                }));
                req.districtsData = districtsData;
            }
        }
    }

    // Aggregate Families (Unique Households)
    const familyStats = await Member.aggregate([
        { $match: memberQuery },
        {
            $group: {
                _id: {
                    $cond: {
                        if: { $and: [{ $ne: ["$rationCard.number", null] }, { $ne: ["$rationCard.number", ""] }] },
                        then: "$rationCard.number",
                        else: {
                            $concat: [
                                { $ifNull: ["$address.houseNumber", "UNK"] },
                                "_",
                                { $toString: "$address.village" }
                            ]
                        }
                    }
                },
                count: { $sum: 1 }
            }
        },
        { $count: "totalFamilies" }
    ]);

    const totalFamilies = familyStats.length > 0 ? familyStats[0].totalFamilies : 0;

    const totalMembers = await Member.countDocuments(memberQuery);
    const pendingMembers = await Member.countDocuments({ ...memberQuery, verificationStatus: 'PENDING' });
    const totalInstitutions = await Institution.countDocuments(institutionQuery);

    const totalFunds = 1250000;

    res.json({
        locationName, // Send location name to frontend
        villages: villagesData, // Send breakdown for Mandal Admin
        mandals: req.mandalsData, // Send breakdown for District Admin
        municipalities: req.municipalitiesData, // Send municipality breakdown for District Admin
        districts: req.districtsData, // Send breakdown for State Admin
        members: totalMembers,
        families: totalFamilies, // Corrected family count based on households
        pendingMembers,
        institutions: totalInstitutions,
        sosAlerts: 0,
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
    let targetLocationId = req.user.assignedLocation;

    // DRILL DOWN OVERRIDE
    if (req.query.locationId) {
        targetLocationId = req.query.locationId;
    }

    if (targetLocationId) {
        const locationDoc = await Location.findById(targetLocationId);

        if (locationDoc) {
            locationName = locationDoc.name;
            let contextRole = req.user.role;
            // Adjust scope based on target location type
            if (locationDoc.type === 'DISTRICT') contextRole = 'DISTRICT_ADMIN';
            if (locationDoc.type === 'MANDAL') contextRole = 'MANDAL_ADMIN';
            if (locationDoc.type === 'VILLAGE') contextRole = 'VILLAGE_ADMIN';

            if (contextRole === 'VILLAGE_ADMIN') {
                // STRICT: Use ID match for members to prevent CastError
                // Handle duplicate location entries (Resolve by Name) - ROBUST FIX
                const escapedName = locationDoc.name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const relatedLocations = await Location.find({
                    name: { $regex: new RegExp(`^\\s*${escapedName}\\s*$`, 'i') },
                    type: 'VILLAGE'
                });
                const locIds = relatedLocations.map(l => l._id);
                memberQuery = { 'address.village': { $in: locIds } };
            } else if (contextRole === 'MANDAL_ADMIN') {
                // Robust Fix: Handle duplicate Location IDs by Name
                const escapedName = locationDoc.name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const matchingMandals = await Location.find({
                    name: { $regex: new RegExp(`^\\s*${escapedName}\\s*$`, 'i') },
                    type: 'MANDAL'
                });
                const mandalIds = matchingMandals.map(m => m._id);
                memberQuery = { 'address.mandal': { $in: mandalIds } };
            } else if (contextRole === 'DISTRICT_ADMIN') {
                memberQuery = { 'address.district': targetLocationId };
            } else if (contextRole === 'STATE_ADMIN' || contextRole === 'SUPER_ADMIN') {
                // Find all districts under this state
                const districts = await Location.find({ parent: targetLocationId, type: 'DISTRICT' }).select('_id');
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
    }

    if (!targetLocationId && req.user.role !== 'SUPER_ADMIN') {
        memberQuery = { _id: null };
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

    // 4. Demographics - Caste (Now Subcaste/Community)
    const casteStats = await Member.aggregate([
        { $match: memberQuery },
        { $group: { _id: "$casteDetails.subCaste", count: { $sum: 1 } } }
    ]);

    // 5. Demographics - Marital Status
    // 4. Demographics - Marital Status
    const maritalStats = await Member.aggregate([
        { $match: memberQuery },
        {
            $project: {
                status: {
                    $switch: {
                        branches: [
                            { case: { $eq: ["$maritalStatus", "Married"] }, then: "Married" },
                            { case: { $eq: ["$maritalStatus", "Widowed"] }, then: "Widowed" },
                            { case: { $eq: ["$maritalStatus", "Divorced"] }, then: "Divorced" }
                        ],
                        default: "Unmarried" // Covers "Unmarried", null, undefined, ""
                    }
                }
            }
        },
        { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    // 5. Demographics - Age Groups
    const ageStats = await Member.aggregate([
        { $match: memberQuery },
        {
            $project: {
                ageGroup: {
                    $switch: {
                        branches: [
                            { case: { $lte: [{ $toInt: "$age" }, 14] }, then: "Children" },
                            { case: { $lte: [{ $toInt: "$age" }, 24] }, then: "Youth" },
                            { case: { $lte: [{ $toInt: "$age" }, 44] }, then: "Young Adults" },
                            { case: { $lte: [{ $toInt: "$age" }, 59] }, then: "Middle Age" },
                            { case: { $lte: [{ $toInt: "$age" }, 74] }, then: "Elderly" },
                        ],
                        default: "Senior"
                    }
                }
            }
        },
        { $group: { _id: "$ageGroup", count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
    ]);

    // 6. Demographics - Blood Group
    const bloodGroupStats = await Member.aggregate([
        { $match: memberQuery },
        {
            $project: {
                blood: { $ifNull: ["$bloodGroup", "Unknown"] }
            }
        },
        { $group: { _id: "$blood", count: { $sum: 1 } } }
    ]);
    if (bloodGroupStats.length === 0 && totalMembers > 0) {
        bloodGroupStats.push({ _id: 'Unknown', count: totalMembers });
    }

    // 7. Voter Stats (Voter vs Non-Voter)
    // 7. Voter Stats (Voter vs Non-Voter)
    const voterStats = await Member.aggregate([
        { $match: memberQuery },
        {
            $project: {
                hasVoterId: {
                    $cond: {
                        if: { $gte: [{ $toInt: "$age" }, 18] },
                        then: "Voter",
                        else: "Non-Voter"
                    }
                }
            }
        },
        { $group: { _id: "$hasVoterId", count: { $sum: 1 } } }
    ]);

    // 8. Employment Status (Employed vs Unemployed)
    const employmentStats = await Member.aggregate([
        { $match: memberQuery },
        {
            $project: {
                status: {
                    $cond: {
                        if: {
                            $in: [
                                { $toLower: { $ifNull: ["$occupation", ""] } },
                                ["student", "house wife", "housewife", "homemaker", "unemployed", "retired", "child", "nil", "none", ""]
                            ]
                        },
                        then: "Unemployed",
                        else: "Employed"
                    }
                }
            }
        },
        { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    // Funds
    const fundsAgg = await Donation.aggregate([
        { $match: { status: 'SUCCESS' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalFunds = fundsAgg.length > 0 ? fundsAgg[0].total : 0;

    let sosCount = 0;

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
            age: ageStats,
            bloodGroup: bloodGroupStats,
            voter: voterStats,
            employment: employmentStats
        }
    });
});

// @desc    Get village settings (hierarchy info)
// @route   GET /api/admin/settings
// @access  Private
const getVillageSettings = asyncHandler(async (req, res) => {
    // 1. Get user location
    console.log("--- DEBUG VILLAGE SETTINGS ---");
    console.log("User ID:", req.user._id);
    console.log("Assigned Location:", req.user.assignedLocation);

    if (!req.user.assignedLocation) {
        console.log("WARNING: User has no assigned location. Returning empty settings.");
        return res.json({
            villageName: '',
            mandal: '',
            municipalityName: '',
            district: '',
            stateName: '',
            email: req.user.email
        });
    }

    const getLocationHierarchy = async (locationId) => {
        const loc = await Location.findById(locationId);
        if (!loc) return null;

        let state = null;
        let district = null;
        let mandal = null;
        let municipality = null;
        let village = null;

        // Helper to map ancestor array to variables
        const mapLocation = (l) => {
            if (l.type === 'STATE') state = l;
            if (l.type === 'DISTRICT') district = l;
            if (l.type === 'MANDAL') mandal = l;
            if (l.type === 'MUNICIPALITY') municipality = l;
            if (l.type === 'VILLAGE') village = l;
        };

        // Map the current location
        mapLocation(loc);

        // Map ancestors
        if (loc.ancestors && loc.ancestors.length > 0) {
            loc.ancestors.forEach(a => {
                // Ancestors in DB are { locationId, name, type }
                // We map them to the same structure expected by UI (name property is key)
                mapLocation(a);
            });
        }

        return { village, mandal, municipality, district, state };
    };

    const hierarchy = await getLocationHierarchy(req.user.assignedLocation);
    console.log("Hierarchy Result:", JSON.stringify(hierarchy, null, 2));

    res.json({
        villageName: hierarchy.village ? hierarchy.village.name : '',
        mandal: hierarchy.mandal ? hierarchy.mandal.name : '',
        municipalityName: hierarchy.municipality ? hierarchy.municipality.name : '', // Add Municipality Name
        district: hierarchy.district ? hierarchy.district.name : '',
        stateName: hierarchy.state ? hierarchy.state.name : '',
        email: req.user.email
    });
});

module.exports = {
    getDashboardStats,
    getAnalyticsData,
    getVillageSettings
};
