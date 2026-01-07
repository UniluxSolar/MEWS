const Member = require('../models/Member');
const FundRequest = require('../models/FundRequest');
const Location = require('../models/Location');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const { getSignedUrl } = require('../utils/gcsSigner');

// Helper to sign all URLs in a member object
const signMemberData = async (memberDoc) => {
    // Convert to plain object if it's a Mongoose document
    const member = memberDoc.toObject ? memberDoc.toObject() : memberDoc;

    // 1. Top Level Fields
    if (member.photoUrl) member.photoUrl = await getSignedUrl(member.photoUrl);
    if (member.aadhaarCardUrl) member.aadhaarCardUrl = await getSignedUrl(member.aadhaarCardUrl);

    // 2. Nested Objects
    if (member.casteDetails?.certificateUrl) {
        member.casteDetails.certificateUrl = await getSignedUrl(member.casteDetails.certificateUrl);
    }
    if (member.partnerDetails?.certificateUrl) {
        member.partnerDetails.certificateUrl = await getSignedUrl(member.partnerDetails.certificateUrl);
    }
    if (member.rationCard?.fileUrl) {
        member.rationCard.fileUrl = await getSignedUrl(member.rationCard.fileUrl);
    }
    if (member.voterId?.fileUrl) {
        member.voterId.fileUrl = await getSignedUrl(member.voterId.fileUrl);
    }
    if (member.bankDetails?.passbookUrl) {
        member.bankDetails.passbookUrl = await getSignedUrl(member.bankDetails.passbookUrl);
    }

    // 3. Family Members
    if (member.familyMembers && Array.isArray(member.familyMembers)) {
        for (const fam of member.familyMembers) {
            if (fam.photo) fam.photo = await getSignedUrl(fam.photo);
            if (fam.aadhaarFront) fam.aadhaarFront = await getSignedUrl(fam.aadhaarFront);
            if (fam.aadhaarBack) fam.aadhaarBack = await getSignedUrl(fam.aadhaarBack);
            if (fam.voterIdFront) fam.voterIdFront = await getSignedUrl(fam.voterIdFront);
            if (fam.voterIdBack) fam.voterIdBack = await getSignedUrl(fam.voterIdBack);
        }
    }

    return member;
};

// @desc    Register a member (Admin or Self)
// @route   POST /api/members
// @access  Public (for now)
const registerMember = asyncHandler(async (req, res) => {
    try {
        console.log("----- REGISTER MEMBER START -----");
        const data = req.body;

        // Auto-generate a temp ID
        const mewsId = `MEW${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`;
        // For GCS, 'req.files[fieldname][0].path' usually contains the public URL
        const getFilePath = (fieldname) => {
            // Note: multer-google-storage populates 'path' with the public link if acl is public
            // or we might need to construct it manually if it returns gs://...
            // Let's assume it returns the http url or we fallback.
            if (req.files && req.files[fieldname]) {
                return req.files[fieldname][0].path;
            }
            return undefined;
        };

        // Helper to clean empty strings
        const clean = (val) => (val === "" || val === "null" || val === "undefined" ? undefined : val);
        const cleanNum = (val) => (val === "" || val === null || isNaN(Number(val)) ? undefined : Number(val));

        // Income Logic: Frontend now sends numeric strings in value (e.g. "50000")
        let incomeValue = 0;
        if (!isNaN(Number(data.annualIncome))) {
            incomeValue = Number(data.annualIncome);
        }

        // --- LOOKUP LOCATION IDs ---
        // The dashboard filters by ObjectId, so we must try to convert names to IDs.
        let villageId = clean(data.presentVillage);
        let mandalId = clean(data.presentMandal);
        let districtId = clean(data.presentDistrict);

        // ENFORCE ADMIN JURISDICTION
        // Ensure admins can only create members in their assigned location
        if (req.user && req.user.assignedLocation) {
            console.log(`[REG] Enforcing jurisdiction for ${req.user.role}: ${req.user.assignedLocation}`);
            if (req.user.role === 'VILLAGE_ADMIN') {
                villageId = req.user.assignedLocation;
            } else if (req.user.role === 'MANDAL_ADMIN') {
                mandalId = req.user.assignedLocation;
            } else if (req.user.role === 'DISTRICT_ADMIN') {
                districtId = req.user.assignedLocation;
            }
        }

        if (villageId) {
            const vLoc = await Location.findById(villageId);
            // Note: The frontend might send an ID if the dropdown is smart, OR a name. 
            // Let's handle both. If it's a valid ID, use it. If name, search.
            let vLocDoc = null;
            if (mongoose.Types.ObjectId.isValid(villageId)) {
                vLocDoc = await Location.findById(villageId);
            }
            // If not found by ID, try name
            if (!vLocDoc) {
                // BUG FIX: If villageId matches Assigned Location, do NOT search by name logic which might find duplicates
                // Only search by name if it's NOT a valid ID yet.
                if (!mongoose.Types.ObjectId.isValid(villageId)) {
                    vLocDoc = await Location.findOne({ name: { $regex: new RegExp(`^${villageId.trim()}$`, 'i') }, type: 'VILLAGE' });
                }
            }

            if (vLocDoc) {
                console.log(`Mapping Village '${vLocDoc.name}' -> ${vLocDoc._id}`);
                // Only update villageId if it wasn't already enforced by Jurisdiction
                // Wait, if it WAS enforced, it is already an ID.
                // So vLocDoc matching that ID is fine.
                // But if vLocDoc was found by NAME from req.body value (which might differ), we must be careful.

                // CRITICAL FIX: If Jurisdiction Enforced, DO NOT ALLOW vLocDoc to change it based on Name Search from body
                if (req.user && req.user.assignedLocation && req.user.role === 'VILLAGE_ADMIN') {
                    // Keep established ID
                } else {
                    villageId = vLocDoc._id;
                }

                // AUTO-SYNC: Traverse Up Hierarchy
                if (vLocDoc.parent) {
                    mandalId = vLocDoc.parent; // Set Mandal ID
                    const mandalDoc = await Location.findById(vLocDoc.parent);
                    if (mandalDoc && mandalDoc.parent) {
                        districtId = mandalDoc.parent; // Set District ID
                        console.log(`Auto-mapped Mandal: ${mandalDoc.name}, District ID: ${districtId}`);
                    }
                }
            }
        }
        // (Similarly could do Mandal/District, but Village is the key filter for Village Admin)

        const memberData = {
            surname: clean(data.surname),
            name: clean(data.name),
            fatherName: clean(data.fatherName),
            dob: data.dob ? new Date(data.dob) : undefined,
            age: cleanNum(data.age),
            age: cleanNum(data.age),
            occupation: clean(data.occupation), // New Field
            jobSector: clean(data.jobSector),
            jobOrganization: clean(data.jobOrganization),
            jobDesignation: clean(data.jobDesignation),
            educationLevel: clean(data.educationLevel),
            gender: clean(data.gender),
            mobileNumber: clean(data.mobileNumber),
            bloodGroup: clean(data.bloodGroup),
            email: clean(data.email),
            alternateMobile: clean(data.alternateMobile),
            aadhaarNumber: clean(data.aadhaarNumber),

            address: {
                district: districtId, // Still allow string if not mapped, but ideally ID
                constituency: clean(data.presentConstituency), // New Field
                mandal: mandalId,
                village: villageId, // Now an ObjectId if found!
                houseNumber: clean(data.presentHouseNo),
                street: clean(data.presentStreet),
                pinCode: clean(data.presentPincode),
                residencyType: clean(data.residenceType),
                landmark: clean(data.presentLandmark)
            },
            permanentAddress: {
                district: clean(data.permDistrict),
                constituency: clean(data.permConstituency), // New Field
                mandal: clean(data.permMandal),
                village: clean(data.permVillage),
                houseNumber: clean(data.permHouseNo),
                street: clean(data.permStreet),
                pinCode: clean(data.permPincode),
                landmark: clean(data.permLandmark)
            },
            casteDetails: {
                caste: clean(data.caste),
                subCaste: clean(data.subCaste),
                communityCertNumber: clean(data.communityCertNumber),
                certificateUrl: getFilePath('communityCert')
            },
            maritalStatus: clean(data.maritalStatus),
            partnerDetails: {
                name: clean(data.partnerName),
                caste: clean(data.partnerCaste),
                subCaste: clean(data.partnerSubCaste),
                isInterCaste: data.isInterCaste === 'Yes',
                marriageCertNumber: clean(data.marriageCertNumber),
                certificateUrl: getFilePath('marriageCert'),
                marriageDate: data.marriageDate ? new Date(data.marriageDate) : undefined
            },
            familyDetails: {
                fatherOccupation: clean(data.fatherOccupation),
                motherOccupation: clean(data.motherOccupation),
                annualIncome: clean(data.annualIncome), // Stored as String
                memberCount: cleanNum(data.memberCount),
                dependentCount: cleanNum(data.dependentCount),
                rationCardType: clean(data.rationCardTypeFamily)
            },
            rationCard: {
                number: clean(data.rationCardNumber),
                type: clean(data.rationCardType),
                holderName: clean(data.rationCardHolderName),
                fileUrl: getFilePath('rationCardFile')
            },
            voterId: {
                epicNumber: clean(data.epicNumber),
                nameOnCard: clean(data.voterName),
                pollingBooth: clean(data.pollingBooth),
                fileUrl: getFilePath('voterIdFront'),
                backFileUrl: getFilePath('voterIdBack')
            },
            bankDetails: {
                bankName: clean(data.bankName),
                branchName: clean(data.branchName),
                accountNumber: clean(data.accountNumber),
                ifscCode: clean(data.ifscCode),
                holderName: clean(data.holderName),
                passbookUrl: getFilePath('bankPassbook')
            },
            photoUrl: getFilePath('photo'),
            aadhaarCardUrl: getFilePath('aadhaarFront'),
            aadhaarCardBackUrl: getFilePath('aadhaarBack'),
            mewsId,
            verificationStatus: (req.user && req.user.role === 'VILLAGE_ADMIN') ? 'APPROVED_VILLAGE' : 'PENDING'
        };

        // Process Family Members
        if (data.familyMembers) {
            try {
                const parsedMembers = JSON.parse(data.familyMembers);
                if (Array.isArray(parsedMembers)) {
                    memberData.familyMembers = parsedMembers.map(fm => {
                        const getIndex = (val) => {
                            if (typeof val === 'string' && val.startsWith('INDEX:')) {
                                return parseInt(val.split(':')[1], 10);
                            }
                            return -1;
                        };

                        const getFamilyFile = (field, indexRef) => {
                            if (indexRef >= 0 && req.files && req.files[field] && req.files[field][indexRef]) {
                                return req.files[field][indexRef].path; // GCS URL
                            }
                            return undefined;
                        };

                        const relation = clean(fm.relation);
                        let fMaritalStatus = clean(fm.maritalStatus);
                        if (relation === 'Father' || relation === 'Mother') {
                            fMaritalStatus = 'Married';
                        }

                        return {
                            relation: relation,
                            maritalStatus: fMaritalStatus,
                            surname: clean(fm.surname),
                            name: clean(fm.name),
                            fatherName: clean(fm.fatherName),
                            dob: fm.dob ? new Date(fm.dob) : undefined,
                            age: cleanNum(fm.age),
                            gender: clean(fm.gender),
                            occupation: clean(fm.occupation),
                            mobileNumber: clean(fm.mobileNumber),
                            aadhaarNumber: clean(fm.aadhaarNumber),
                            annualIncome: clean(data.annualIncome), // Propagated from Head
                            memberCount: cleanNum(data.memberCount), // Propagated from Head
                            dependentCount: cleanNum(data.dependentCount), // Propagated from Head
                            rationCardNumber: clean(data.rationCardNumber), // Propagated from Head
                            epicNumber: clean(fm.epicNumber),
                            voterName: clean(fm.voterName),
                            pollingBooth: clean(fm.pollingBooth),
                            // Files
                            photo: getFamilyFile('familyMemberPhotos', getIndex(fm.photo)),
                            aadhaarFront: getFamilyFile('familyMemberAadhaarFronts', getIndex(fm.aadhaarFront)),
                            aadhaarBack: getFamilyFile('familyMemberAadhaarBacks', getIndex(fm.aadhaarBack)),
                            voterIdFront: getFamilyFile('familyMemberVoterIdFronts', getIndex(fm.voterIdFront)),
                            voterIdBack: getFamilyFile('familyMemberVoterIdBacks', getIndex(fm.voterIdBack)),

                            // Addresses (Copy from main member)
                            presentAddress: memberData.address,
                            permanentAddress: memberData.permanentAddress
                        };
                    });
                }
            } catch (e) {
                console.error("Error parsing family members:", e);
            }
        }

        const member = await Member.create(memberData);

        // --- POST-REGISTRATION ACTIONS ---
        // 1. Generate Username (e.g. MEWS ID or Mobile)
        const username = member.mewsId; // or mobileNumber

        // 2. Generate Reset Link (Mock - in real app, generate a JWT token)
        const resetLink = `${req.protocol}://${req.get('host')}/reset-password?user=${member.mewsId}`;

        // 3. Send SMS
        // 3. Send SMS (REMOVED)


        console.log(`[REG] Member Created: ${member.mewsId}`);

        // Populate for frontend (ID Card)
        const populatedMember = await Member.findById(member._id)
            .populate('address.district')
            .populate('address.mandal')
            .populate('address.village')
            .populate('permanentAddress.district')
            .populate('permanentAddress.mandal')
            .populate('permanentAddress.village');

        // --- CHECKPOINT: CREATE INDIVIDUAL DOCUMENTS FOR FAMILY MEMBERS ---
        if (memberData.familyMembers && memberData.familyMembers.length > 0) {
            console.log(`[REG] Creating ${memberData.familyMembers.length} dependent members...`);

            for (const fm of memberData.familyMembers) {
                try {
                    // Generate Unique MEWS ID for Dependent
                    const depMewsId = `MEW${new Date().getFullYear()}${Math.floor(10000 + Math.random() * 90000)}`;

                    const dependentData = {
                        // 1. Inherited Fields (Use memberData for clean POJO copy)
                        surname: fm.surname || memberData.surname,
                        name: fm.name,
                        fatherName: fm.fatherName,
                        dob: fm.dob,
                        age: fm.age,
                        gender: fm.gender,
                        occupation: fm.occupation,
                        mobileNumber: fm.mobileNumber,
                        aadhaarNumber: fm.aadhaarNumber,

                        // Address (Inherit from Head)
                        address: memberData.address,
                        permanentAddress: memberData.permanentAddress,

                        // Caste (Inherit from Head)
                        casteDetails: memberData.casteDetails,

                        // Ration Card (Inherit from Head)
                        rationCard: memberData.rationCard,

                        // Family Links
                        familyDetails: memberData.familyDetails, // Inherit Income/Counts
                        headOfFamily: member._id, // Use the Created ID
                        headOfFamily: member._id, // Use the Created ID
                        relationToHead: fm.relation,
                        maritalStatus: fm.maritalStatus,

                        // Files
                        photoUrl: fm.photo,
                        aadhaarCardUrl: fm.aadhaarFront,

                        voterId: {
                            epicNumber: fm.epicNumber,
                            nameOnCard: fm.voterName,
                            pollingBooth: fm.pollingBooth,
                            fileUrl: fm.voterIdFront
                        },

                        // System Fields
                        mewsId: depMewsId,
                        verificationStatus: member.verificationStatus,

                        // Empty Family Array for Dependent to prevent recursion
                        familyMembers: []
                    };

                    await Member.create(dependentData);
                    console.log(`[REG] Created Dependent: ${depMewsId} (${fm.name})`);

                } catch (depError) {
                    console.error(`[REG] Failed to create dependent ${fm.name}:`, depError.message);
                }
            }
        }

        // SIGN URLs
        const signedMember = await signMemberData(populatedMember);

        res.status(201).json(signedMember);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
});

// @desc    Get all members
// @route   GET /api/members
// @access  Private (Admin)
const getMembers = asyncHandler(async (req, res) => {
    let query = {};

    // --- Standard Filters ---
    const filterFields = ['gender', 'maritalStatus', 'bloodGroup', 'educationLevel', 'occupation'];
    filterFields.forEach(field => {
        if (req.query[field]) {
            query[field] = req.query[field];
        }
    });

    // Caste Filter (Deep match)
    if (req.query.subCaste) {
        query['casteDetails.subCaste'] = req.query.subCaste;
    }
    if (req.query.caste) {
        query['casteDetails.caste'] = req.query.caste;
    }

    // Age Range Filter
    if (req.query.ageRange) {
        if (req.query.ageRange === '50+') {
            query['age'] = { $gt: 50 };
        } else {
            const parts = req.query.ageRange.split('-');
            if (parts.length === 2) {
                query['age'] = { $gte: Number(parts[0]), $lte: Number(parts[1]) };
            }
        }
    }

    // Voter Status Filter (Based on Age >= 18)
    if (req.query.voterStatus) {
        if (req.query.voterStatus === 'Voter') {
            // Age >= 18
            query['age'] = { $gte: 18 };
        } else if (req.query.voterStatus === 'Non-Voter') {
            // Age < 18
            query['age'] = { $lt: 18 };
        }
    }

    // Employment Status Filter
    if (req.query.employmentStatus) {
        const unemployedKeywords = ["student", "house wife", "housewife", "homemaker", "unemployed", "retired", "child", "nil", "none", ""];
        const unemployedRegex = unemployedKeywords.map(k => new RegExp(`^${k}$`, 'i'));

        // Add empty string check for regex
        // Logic: Unemployed = matches keywords OR is empty/null
        const unemployedQuery = {
            $or: [
                { occupation: { $in: unemployedRegex } },
                { occupation: null },
                { occupation: '' }
            ]
        };

        if (req.query.employmentStatus === 'Unemployed') {
            Object.assign(query, unemployedQuery);
        } else if (req.query.employmentStatus === 'Employed') {
            // Employed = NOT Unemployed
            query['$and'] = [
                { occupation: { $nin: unemployedRegex } },
                { occupation: { $ne: null } },
                { occupation: { $ne: '' } }
            ];
        }
    }

    // Allow filtering by Head of Family (for fetching dependents)
    if (req.query.headOfFamily) {
        query['headOfFamily'] = req.query.headOfFamily;
    }

    // Filter by assigned location if user has an assigned location
    if (req.user && req.user.assignedLocation) {
        console.log(`[GET MEMBERS] User: ${req.user.username}, Role: ${req.user.role}, AssignedLoc: ${req.user.assignedLocation}`);

        const locationId = req.user.assignedLocation;

        if (req.user.role === 'VILLAGE_ADMIN') {
            // STRICT: Must match the assigned Village ID
            // Handle duplicate location entries (Resolve by Name, Scoped to Parent/Mandal)
            const assignedLoc = await Location.findById(locationId);
            if (assignedLoc) {
                const escapedName = assignedLoc.name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

                // Robust Query: Match Name (Partial OK) AND Same Parent (Mandal)
                // This handles "Amanagal", "Amanagal (V)", "  Amanagal  " etc. without crossing Mandals
                const criteria = {
                    name: { $regex: new RegExp(escapedName, 'i') }, // Unanchored for flexibility
                    type: 'VILLAGE'
                };

                // If the assigned location has a parent, restrict duplicates to that parent
                if (assignedLoc.parent) {
                    criteria.parent = assignedLoc.parent;
                }

                const relatedLocations = await Location.find(criteria);
                const locIds = relatedLocations.map(l => l._id);

                // SAFEGUARD: Explicitly include the assigned ID itself
                if (!locIds.some(id => id.toString() === locationId.toString())) {
                    locIds.push(locationId);
                }

                // Add debug log
                console.log(`[GET MEMBERS] Resolved ${assignedLoc.name} to IDs:`, locIds);
                query['address.village'] = { $in: locIds };
            } else {
                query['address.village'] = locationId; // Fallback
            }
        }
        else if (req.user.role === 'MANDAL_ADMIN') {
            // STRICT: Must match the assigned Mandal ID
            query['address.mandal'] = locationId;
        }
        else if (req.user.role === 'DISTRICT_ADMIN') {
            // STRICT: Must match the assigned District ID
            query['address.district'] = locationId;
        }
        else if (req.user.role === 'STATE_ADMIN') {
            // STRICT: Must match any District under the assigned State
            // Find all districts where parent is the State ID
            const districts = await Location.find({ parent: locationId, type: 'DISTRICT' }).select('_id');
            const districtIds = districts.map(d => d._id);
            query['address.district'] = { $in: districtIds };
        }
        else if (req.user.role === 'SUPER_ADMIN') {
            // Show All - No Filter
        }

        console.log(`[GET MEMBERS] Query applied:`, JSON.stringify(query));
    } else {
        // If no assigned location but restricted role, return empty or error?
        // Assuming Super Admin might not have assignedLocation.
        if (req.user.role !== 'SUPER_ADMIN') {
            console.warn(`[GET MEMBERS] User ${req.user.username} (${req.user.role}) has no assigned location. Showing nothing.`);
            // query = { _id: null }; // Force empty result? Or just let them see all if misconfigured? 
            // Better to fail safe.
            // But for now, let's assume valid configuration.
            if (req.user.role === 'VILLAGE_ADMIN' || req.user.role === 'MANDAL_ADMIN' || req.user.role === 'DISTRICT_ADMIN') {
                query = { _id: null }; // Block access
            }
        }
    }

    const members = await Member.find(query)
        .populate('address.village')
        .populate('address.mandal')
        .populate('address.district') // Populate to show names
        .sort({ createdAt: -1 });

    // SIGN URLs for all members
    const signedMembers = await Promise.all(members.map(m => signMemberData(m)));

    res.json(signedMembers);
});

// @desc    Get member by ID
// @route   GET /api/members/:id
// @access  Private
const getMemberById = asyncHandler(async (req, res) => {
    const member = await Member.findById(req.params.id)
        .populate({
            path: 'address.district',
            populate: { path: 'parent' } // Populate State from District
        })
        .populate('address.mandal')
        .populate('address.village');
    if (member) {
        const signedMember = await signMemberData(member);
        res.json(signedMember);
    } else {
        res.status(404);
        throw new Error('Member not found');
    }
});

// @desc    Get member application stats
// @route   GET /api/members/stats
// @access  Private (Member/User)
const getMemberStats = asyncHandler(async (req, res) => {
    // Determine user type and query key
    // If the user is a Member, they are the beneficiary.
    // If the user is a Village Admin (User), they might be the requester.
    // For 'My Applications', we usually mean applications where I am the focus.

    let query = {};
    if (req.user.mewsId || req.user.role === 'MEMBER') {
        // Logged in as Member
        query.beneficiary = req.user._id;
    } else {
        // Logged in as Admin/User
        query.requestedBy = req.user._id;
    }

    const applications = await FundRequest.find(query);

    // Calculate Stats
    // 1. Active: Not Rejected, Not Completed? Or just total Active?
    // Let's assume Status: ['DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'COMPLETED', 'REJECTED', 'FROZEN']
    // User wants "Active Applications". Usually means currently in progress (Pending or Active).
    const activeCount = applications.filter(app => ['PENDING_APPROVAL', 'ACTIVE'].includes(app.status)).length;

    // 2. Approved Applications
    const approvedCount = applications.filter(app => ['ACTIVE', 'COMPLETED'].includes(app.status)).length;

    // 3. Total Amount Disbursed
    // Sum of amountCollected for Approved/Completed applications
    const totalDisbursed = applications
        .filter(app => ['ACTIVE', 'COMPLETED'].includes(app.status))
        .reduce((sum, app) => sum + (app.amountCollected || 0), 0);

    // 4. Pending Reviews
    const pendingCount = applications.filter(app => app.status === 'PENDING_APPROVAL').length;

    // 5. Total Applications (For the "15 Applications found" text)
    const totalApplications = applications.length;

    res.json({
        activeApplications: activeCount,
        approvedApplications: approvedCount,
        totalAmountDisbursed: totalDisbursed,
        pendingReviews: pendingCount,
        totalApplications: totalApplications,
        applications: applications // Return full list for the table too!
    });
});

const updateMemberStatus = asyncHandler(async (req, res) => {
    const member = await Member.findById(req.params.id);

    if (member) {
        member.verificationStatus = req.body.status || member.verificationStatus;
        const updatedMember = await member.save();

        // Return signed version for consistency
        const signedMember = await signMemberData(updatedMember);
        res.json(signedMember);
    } else {
        res.status(404);
        throw new Error('Member not found');
    }
});

// @desc    Update member details
// @route   PUT /api/members/:id
// @access  Private (Admin)
const updateMember = asyncHandler(async (req, res) => {
    const member = await Member.findById(req.params.id);

    if (member) {
        console.log(`----- UPDATE MEMBER START: ${member._id} -----`);
        const data = req.body;

        // Parse JSON strings if coming from FormData (e.g., address, familyMembers, removedFiles)
        try {
            if (typeof data.address === 'string') data.address = JSON.parse(data.address);
            if (typeof data.familyMembers === 'string') {
                // Determine if double encoded or just string? usually just string.
                // But registerMember and updateMember logic below expects 'data.familyMembers' to be the string itself? 
                // Wait, lines 781 uses JSON.parse(data.familyMembers). So if it's ALREADY a string, we don't need to parse it here?
                // Actually, if it's from JSON body, it's an array/object. If FormData, it's a string.
                // But lines 781 does: const parsedMembers = JSON.parse(data.familyMembers);
                // This implies lines 781 EXPECTS it to be a string.
                // If I send it as a string in FormData, it works for line 781.
                // If I send it as Array in JSON body, line 781 throws Error?
                // Let's check line 205 (register): const parsedMembers = JSON.parse(data.familyMembers);
                // So the backend ALREADY EXPECTS A STRING for familyMembers.
                // So NO parsing needed for familyMembers here.

                // DATA.ADDRESS however:
                // Line 659: if (data.address) ...
                // Line 660: data.address.district ...
                // If data.address is string "{}", data.address.district is undefined.
                // So we MUST parse data.address.
            }
            if (typeof data.removedFiles === 'string') {
                // Line 756 uses JSON.parse(data.removedFiles) -> Expects string. OK.
            }
        } catch (e) {
            console.error("Error parsing FormData JSON fields:", e);
        }

        // Helpers (Duplicate from register for isolation)
        const getFilePath = (fieldname) => {
            if (req.files && req.files[fieldname]) {
                return req.files[fieldname][0].path;
            }
            return undefined;
        };
        const clean = (val) => (val === "" || val === "null" || val === "undefined" ? undefined : val);
        const cleanNum = (val) => (val === "" || val === null || isNaN(Number(val)) ? undefined : Number(val));

        // Update Top Level Fields
        if (data.surname !== undefined) member.surname = clean(data.surname);
        if (data.name !== undefined) member.name = clean(data.name);
        if (data.fatherName !== undefined) member.fatherName = clean(data.fatherName);
        if (data.dob) member.dob = new Date(data.dob);
        if (data.age) member.age = cleanNum(data.age);
        if (data.occupation !== undefined) member.occupation = clean(data.occupation);
        if (data.jobSector !== undefined) member.jobSector = clean(data.jobSector);
        if (data.jobOrganization !== undefined) member.jobOrganization = clean(data.jobOrganization);
        if (data.jobDesignation !== undefined) member.jobDesignation = clean(data.jobDesignation);
        if (data.educationLevel !== undefined) member.educationLevel = clean(data.educationLevel);
        if (data.gender !== undefined) member.gender = clean(data.gender);
        if (data.mobileNumber !== undefined) member.mobileNumber = clean(data.mobileNumber);
        if (data.bloodGroup !== undefined) member.bloodGroup = clean(data.bloodGroup);
        if (data.email !== undefined) member.email = clean(data.email);
        if (data.alternateMobile !== undefined) member.alternateMobile = clean(data.alternateMobile);
        if (data.aadhaarNumber !== undefined) member.aadhaarNumber = clean(data.aadhaarNumber);
        if (data.maritalStatus !== undefined) member.maritalStatus = clean(data.maritalStatus);

        // Update Files (Only if new file uploaded)
        const newPhoto = getFilePath('photo');
        if (newPhoto) member.photoUrl = newPhoto;

        const newAadhaarFront = getFilePath('aadhaarFront');
        if (newAadhaarFront) member.aadhaarCardUrl = newAadhaarFront;

        const newAadhaarBack = getFilePath('aadhaarBack');
        if (newAadhaarBack) member.aadhaarCardBackUrl = newAadhaarBack;

        // Helper to resolve location (Name -> ID)
        const resolveLocation = async (val, type) => {
            if (!val) return undefined;
            if (mongoose.Types.ObjectId.isValid(val)) return val;
            const query = { name: { $regex: new RegExp(`^${val.trim()}$`, 'i') } };
            if (type) query.type = type;
            const loc = await Location.findOne(query);
            return loc ? loc._id : undefined; // Return undefined if not found to avoid CastError
        };

        // Update Address (Support Nested & Flat)
        if (!member.address) member.address = {};

        // Nested (New Frontend)
        if (data.address) {
            if (data.address.district !== undefined) member.address.district = await resolveLocation(data.address.district, 'DISTRICT');
            if (data.address.mandal !== undefined) member.address.mandal = await resolveLocation(data.address.mandal, 'MANDAL');
            if (data.address.village !== undefined) member.address.village = await resolveLocation(data.address.village, 'VILLAGE');
            if (data.address.houseNumber !== undefined) member.address.houseNumber = clean(data.address.houseNumber);
            if (data.address.street !== undefined) member.address.street = clean(data.address.street);
            if (data.address.pinCode !== undefined) member.address.pinCode = clean(data.address.pinCode);
            if (data.address.state !== undefined) member.address.state = clean(data.address.state);
        }

        // Flat (Legacy Support)
        if (data.presentDistrict !== undefined) member.address.district = await resolveLocation(data.presentDistrict, 'DISTRICT');
        if (data.presentConstituency !== undefined) member.address.constituency = clean(data.presentConstituency);
        if (data.presentMandal !== undefined) member.address.mandal = await resolveLocation(data.presentMandal, 'MANDAL');
        if (data.presentVillage !== undefined) member.address.village = await resolveLocation(data.presentVillage, 'VILLAGE');
        if (data.presentHouseNo !== undefined) member.address.houseNumber = clean(data.presentHouseNo);
        if (data.presentStreet !== undefined) member.address.street = clean(data.presentStreet);
        if (data.presentPincode !== undefined) member.address.pinCode = clean(data.presentPincode);
        if (data.residenceType !== undefined) member.address.residencyType = clean(data.residenceType);
        if (data.presentLandmark !== undefined) member.address.landmark = clean(data.presentLandmark);

        // Update Permanent Address
        if (!member.permanentAddress) member.permanentAddress = {};
        if (data.permDistrict !== undefined) member.permanentAddress.district = await resolveLocation(data.permDistrict);
        if (data.permConstituency !== undefined) member.permanentAddress.constituency = clean(data.permConstituency);
        if (data.permMandal !== undefined) member.permanentAddress.mandal = await resolveLocation(data.permMandal);
        if (data.permVillage !== undefined) member.permanentAddress.village = await resolveLocation(data.permVillage);
        if (data.permHouseNo !== undefined) member.permanentAddress.houseNumber = clean(data.permHouseNo);
        if (data.permStreet !== undefined) member.permanentAddress.street = clean(data.permStreet);
        if (data.permPincode !== undefined) member.permanentAddress.pinCode = clean(data.permPincode);
        if (data.permLandmark !== undefined) member.permanentAddress.landmark = clean(data.permLandmark);

        // Caste Details
        if (!member.casteDetails) member.casteDetails = {};
        if (data.caste !== undefined) member.casteDetails.caste = clean(data.caste);
        if (data.subCaste !== undefined) member.casteDetails.subCaste = clean(data.subCaste);
        if (data.communityCertNumber !== undefined) member.casteDetails.communityCertNumber = clean(data.communityCertNumber);

        const newCommCert = getFilePath('communityCert');
        if (newCommCert) member.casteDetails.certificateUrl = newCommCert;

        // Partner Details
        if (!member.partnerDetails) member.partnerDetails = {};
        if (data.partnerName !== undefined) member.partnerDetails.name = clean(data.partnerName);
        if (data.partnerCaste !== undefined) member.partnerDetails.caste = clean(data.partnerCaste);
        if (data.partnerSubCaste !== undefined) member.partnerDetails.subCaste = clean(data.partnerSubCaste);
        if (data.isInterCaste !== undefined) member.partnerDetails.isInterCaste = (data.isInterCaste === 'Yes' || data.isInterCaste === true || data.isInterCaste === 'true');
        if (data.marriageCertNumber !== undefined) member.partnerDetails.marriageCertNumber = clean(data.marriageCertNumber);
        if (data.marriageDate) member.partnerDetails.marriageDate = new Date(data.marriageDate);

        const newMarriageCert = getFilePath('marriageCert');
        if (newMarriageCert) member.partnerDetails.certificateUrl = newMarriageCert;

        // Family Details (Economic)
        if (!member.familyDetails) member.familyDetails = {};
        if (data.fatherOccupation !== undefined) member.familyDetails.fatherOccupation = clean(data.fatherOccupation);
        if (data.motherOccupation !== undefined) member.familyDetails.motherOccupation = clean(data.motherOccupation);
        if (data.annualIncome !== undefined) member.familyDetails.annualIncome = clean(data.annualIncome);
        if (data.memberCount !== undefined) member.familyDetails.memberCount = cleanNum(data.memberCount);
        if (data.dependentCount !== undefined) member.familyDetails.dependentCount = cleanNum(data.dependentCount);
        if (data.rationCardTypeFamily !== undefined) member.familyDetails.rationCardType = clean(data.rationCardTypeFamily);

        // Ration Card
        if (!member.rationCard) member.rationCard = {};
        if (data.rationCardNumber !== undefined) member.rationCard.number = clean(data.rationCardNumber);
        if (data.rationCardType !== undefined) member.rationCard.type = clean(data.rationCardType);
        if (data.rationCardHolderName !== undefined) member.rationCard.holderName = clean(data.rationCardHolderName);

        const newRationFile = getFilePath('rationCardFile');
        if (newRationFile) member.rationCard.fileUrl = newRationFile;

        // Voter ID
        if (!member.voterId) member.voterId = {};
        if (data.epicNumber !== undefined) member.voterId.epicNumber = clean(data.epicNumber);
        if (data.voterName !== undefined) member.voterId.nameOnCard = clean(data.voterName);
        if (data.pollingBooth !== undefined) member.voterId.pollingBooth = clean(data.pollingBooth);

        const newVoterFile = getFilePath('voterIdFront');
        if (newVoterFile) member.voterId.fileUrl = newVoterFile;

        const newVoterBackFile = getFilePath('voterIdBack');
        if (newVoterBackFile) member.voterId.backFileUrl = newVoterBackFile;

        // Bank Details
        if (!member.bankDetails) member.bankDetails = {};
        if (data.bankName !== undefined) member.bankDetails.bankName = clean(data.bankName);
        if (data.branchName !== undefined) member.bankDetails.branchName = clean(data.branchName);
        if (data.accountNumber !== undefined) member.bankDetails.accountNumber = clean(data.accountNumber);
        if (data.ifscCode !== undefined) member.bankDetails.ifscCode = clean(data.ifscCode);
        if (data.holderName !== undefined) member.bankDetails.holderName = clean(data.holderName); // Frontend might send holderName? check mapping. register uses data.holderName

        const newPassbook = getFilePath('bankPassbook');
        if (newPassbook) member.bankDetails.passbookUrl = newPassbook;

        // --- NEW: Handle Explicit Document Removals ---
        if (data.removedFiles) {
            try {
                const removedFields = JSON.parse(data.removedFiles);
                if (Array.isArray(removedFields)) {
                    removedFields.forEach(field => {
                        if (field === 'photo') member.photoUrl = undefined;
                        if (field === 'aadhaarFront') member.aadhaarCardUrl = undefined;
                        if (field === 'aadhaarBack') member.aadhaarCardBackUrl = undefined;
                        if (field === 'communityCert') member.casteDetails.certificateUrl = undefined;
                        if (field === 'marriageCert') member.partnerDetails.certificateUrl = undefined;
                        if (field === 'rationCardFile') member.rationCard.fileUrl = undefined;
                        if (field === 'voterIdFront') member.voterId.fileUrl = undefined;
                        if (field === 'voterIdBack') member.voterId.backFileUrl = undefined;
                        if (field === 'bankPassbook') member.bankDetails.passbookUrl = undefined;
                    });
                }
            } catch (e) {
                console.error("Error parsing removedFiles:", e);
            }
        }
        // ----------------------------------------------

        // Family Members List Update
        // Logic: if familyMembers string is passed, we replace the whole list? Or merge?
        // Typically form sends the full current state of family members. So replacing is safer.
        if (data.familyMembers) {
            try {
                const parsedMembers = JSON.parse(data.familyMembers);
                if (Array.isArray(parsedMembers)) {
                    // We need to preserve existing file URLs if no new file is uploaded for them
                    // But wait, the frontend sends "familyMemberPhotos" as one array of files for ALL members who have new photos.
                    // The 'photo' field in parsedMembers might contain "INDEX:0" string if new file, or the old URL if existing.

                    const getIndex = (val) => {
                        if (typeof val === 'string' && val.startsWith('INDEX:')) {
                            return parseInt(val.split(':')[1], 10);
                        }
                        return -1;
                    };

                    const getFamilyFile = (field, indexRef, existingUrl) => {
                        if (indexRef >= 0 && req.files && req.files[field] && req.files[field][indexRef]) {
                            return req.files[field][indexRef].path; // New File
                        }
                        // If no new file, but we have an existing URL (which might be passed back? or we need to find it from DB?)
                        // The frontend logic for updates usually sends the OLD URL if not changed. 
                        // If the frontend sends the old URL string in the JSON, we should just use that.
                        // However, 'parsedMembers' element comes from frontend state.
                        return existingUrl;
                    };

                    member.familyMembers = parsedMembers.map(fm => {
                        // Determine if we need to look up a new file
                        const photoIndex = getIndex(fm.photo);
                        const aadhaarFrontIndex = getIndex(fm.aadhaarFront);
                        const aadhaarBackIndex = getIndex(fm.aadhaarBack);
                        const voterIdFrontIndex = getIndex(fm.voterIdFront);
                        const voterIdBackIndex = getIndex(fm.voterIdBack);

                        // If index is -1, it means 'fm.photo' holds the existing URL or is empty. 
                        // We can just use fm.photo directly as the value if it's not an index string.

                        const resolveFile = (fieldVal, fileField, index, existingVal) => {
                            if (index !== -1) {
                                // New file uploaded
                                if (req.files && req.files[fileField] && req.files[fileField][index]) {
                                    return req.files[fileField][index].path;
                                }
                            }
                            // If index is -1, it means 'fieldVal' holds the existing URL OR is empty (removed)
                            // If the field is explicitly set to empty/null by the frontend, return undefined to clear it.
                            if (fieldVal === "" || fieldVal === null || fieldVal === "null") {
                                return undefined;
                            }

                            // No new file. Use the value passed from frontend (which should be the URL) 
                            // UNLESS it was the INDEX string and we failed to find file (shouldn't happen).
                            return (fieldVal && !fieldVal.startsWith('INDEX:')) ? fieldVal : existingVal;
                        };

                        // Note: 'existingVal' is tricky because we are mapping over new list. 
                        // But since we are replacing the list, the 'fm' object from frontend *should* have the URL if it wasn't changed.
                        // Let's trust frontend sends the URL if not changed.

                        const relation = clean(fm.relation);
                        let fMaritalStatus = clean(fm.maritalStatus);
                        if (relation === 'Father' || relation === 'Mother') {
                            fMaritalStatus = 'Married';
                        }

                        return {
                            relation: relation,
                            maritalStatus: fMaritalStatus,
                            surname: clean(fm.surname),
                            name: clean(fm.name),
                            fatherName: clean(fm.fatherName),
                            dob: fm.dob ? new Date(fm.dob) : undefined,
                            age: cleanNum(fm.age),
                            gender: clean(fm.gender),
                            occupation: clean(fm.occupation),
                            mobileNumber: clean(fm.mobileNumber),
                            aadhaarNumber: clean(fm.aadhaarNumber),
                            annualIncome: member.familyDetails ? member.familyDetails.annualIncome : undefined, // Propagated from Head
                            memberCount: member.familyDetails ? member.familyDetails.memberCount : undefined, // Propagated from Head
                            dependentCount: member.familyDetails ? member.familyDetails.dependentCount : undefined, // Propagated from Head
                            rationCardNumber: member.rationCard ? member.rationCard.number : undefined, // Propagated from Head
                            epicNumber: clean(fm.epicNumber),
                            voterName: clean(fm.voterName),
                            pollingBooth: clean(fm.pollingBooth),

                            // Files
                            photo: resolveFile(fm.photo, 'familyMemberPhotos', photoIndex),
                            aadhaarFront: resolveFile(fm.aadhaarFront, 'familyMemberAadhaarFronts', aadhaarFrontIndex),
                            aadhaarBack: resolveFile(fm.aadhaarBack, 'familyMemberAadhaarBacks', aadhaarBackIndex),
                            voterIdFront: resolveFile(fm.voterIdFront, 'familyMemberVoterIdFronts', voterIdFrontIndex),
                            voterIdBack: resolveFile(fm.voterIdBack, 'familyMemberVoterIdBacks', voterIdBackIndex),

                            // Addresses (Copy from main member)
                            presentAddress: member.address,
                            permanentAddress: member.permanentAddress
                        };
                    });
                }
            } catch (e) {
                console.error("Error parsing family members update:", e);
            }
        }

        const updatedMember = await member.save();

        // --- CHECKPOINT: SYNC DEPENDENT MEMBERS (Create/Update) ---
        // Fetch existing dependent documents for this head
        const existingDependents = await Member.find({ headOfFamily: member._id });

        if (updatedMember.familyMembers && updatedMember.familyMembers.length > 0) {
            console.log(`[UPDATE] Syncing ${updatedMember.familyMembers.length} family members...`);

            for (const fm of updatedMember.familyMembers) {
                try {
                    // 1. Try to find existing dependent document
                    // Heuristic: Name + Relation (since we don't have a direct ID link)
                    let dependentDoc = existingDependents.find(d =>
                        d.name === fm.name && d.relationToHead === fm.relation
                    );

                    // If not found by name/relation, maybe try Aadhaar if available?
                    if (!dependentDoc && fm.aadhaarNumber) {
                        dependentDoc = existingDependents.find(d => d.aadhaarNumber === fm.aadhaarNumber);
                    }

                    if (dependentDoc) {
                        // UPDATE Existing Dependent
                        console.log(`[UPDATE] Updating Dependent: ${dependentDoc.mewsId} (${fm.name})`);
                        dependentDoc.maritalStatus = fm.maritalStatus; // Sync Critical Field

                        // Sync other fields that should match the current state
                        dependentDoc.age = fm.age;
                        dependentDoc.occupation = fm.occupation;
                        dependentDoc.mobileNumber = fm.mobileNumber;
                        if (fm.dob) dependentDoc.dob = fm.dob;

                        // Sync Address from Head
                        dependentDoc.address = updatedMember.address;
                        dependentDoc.permanentAddress = updatedMember.permanentAddress;

                        await dependentDoc.save();

                    } else {
                        // CREATE New Dependent
                        // Generate Unique MEWS ID for Dependent
                        const depMewsId = `MEW${new Date().getFullYear()}${Math.floor(10000 + Math.random() * 90000)}`;

                        const dependentData = {
                            surname: fm.surname || updatedMember.surname,
                            name: fm.name,
                            fatherName: fm.fatherName,
                            dob: fm.dob,
                            age: fm.age,
                            gender: fm.gender,
                            occupation: fm.occupation,
                            mobileNumber: fm.mobileNumber,
                            aadhaarNumber: fm.aadhaarNumber,

                            // Address (Inherit)
                            address: updatedMember.address,
                            permanentAddress: updatedMember.permanentAddress,

                            // Caste (Inherit)
                            casteDetails: updatedMember.casteDetails,

                            // Family Links
                            headOfFamily: updatedMember._id,
                            relationToHead: fm.relation,
                            maritalStatus: fm.maritalStatus, // This comes from the mapped fm ensuring logic is applied

                            // Files (from fm object in array - paths should be there)
                            photoUrl: fm.photo,
                            aadhaarCardUrl: fm.aadhaarFront,
                            voterId: {
                                epicNumber: fm.epicNumber,
                                nameOnCard: fm.voterName,
                                pollingBooth: fm.pollingBooth,
                                fileUrl: fm.voterIdFront
                            },

                            mewsId: depMewsId,
                            verificationStatus: updatedMember.verificationStatus,
                            familyMembers: []
                        };

                        await Member.create(dependentData);
                        console.log(`[UPDATE] Created New Dependent: ${depMewsId} (${fm.name})`);
                    }
                } catch (err) {
                    console.error(`[UPDATE] Error syncing dependent ${fm.name}:`, err.message);
                }
            }
        }

        // Populate for frontend (ID Card / Application Form)
        await updatedMember.populate([
            { path: 'address.district' },
            { path: 'address.mandal' },
            { path: 'address.village' },
            { path: 'permanentAddress.district' },
            { path: 'permanentAddress.mandal' },
            { path: 'permanentAddress.village' }
        ]);

        // Return signed version
        const signedMember = await signMemberData(updatedMember);
        res.json(signedMember);
    } else {
        res.status(404);
        throw new Error('Member not found');
    }
});


// @desc    Delete member
// @route   DELETE /api/members/:id
// @access  Private (Admin)
const deleteMember = asyncHandler(async (req, res) => {
    const member = await Member.findById(req.params.id);

    if (member) {
        // Optional: Check permissions (e.g., only Super Admin or same location admin)
        // For now, assuming middleware handles role-based access generally

        await member.deleteOne();
        res.json({ message: 'Member removed' });
    } else {
        res.status(404);
        throw new Error('Member not found');
    }
});

// @desc    Check for duplicate unique fields
// @route   POST /api/members/check-duplicate
// @access  Public
const checkDuplicate = asyncHandler(async (req, res) => {
    const { field, value } = req.body;

    if (!field || !value) {
        return res.status(400).json({ message: "Field and value are required" });
    }

    let query = {};
    if (field === 'aadhaarNumber') {
        query.aadhaarNumber = value;
    } else if (field === 'voterId') {
        query['voterId.epicNumber'] = value;
    } else if (field === 'rationCard') {
        query['rationCard.number'] = value;
    } else {
        return res.status(400).json({ message: "Invalid field type" });
    }

    const exists = await Member.findOne(query);

    if (exists) {
        return res.status(200).json({
            isDuplicate: true,
            message: `This ${field === 'voterId' ? 'Voter ID' : (field === 'rationCard' ? 'Ration Card' : 'Aadhaar Number')} is already registered.`
        });
    }

    res.status(200).json({ isDuplicate: false });
});

module.exports = {
    checkDuplicate,
    registerMember,
    getMembers,
    getMemberById,
    updateMemberStatus,
    updateMember,
    deleteMember,
    getMemberStats
};
