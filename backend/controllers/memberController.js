const Member = require('../models/Member');
const FundRequest = require('../models/FundRequest');
const Location = require('../models/Location');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const { getSignedUrl } = require('../utils/gcsSigner');
const { generateMemberId } = require('../utils/idGenerator');
const { sendRegistrationNotification } = require('../utils/notificationService');
const User = require('../models/User'); // For finding admins

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
    console.log("----- REGISTER MEMBER START -----");
    const data = req.body;

    // Helpers
    const getFilePath = (fieldname) => {
        if (req.files && req.files[fieldname]) {
            return req.files[fieldname][0].path;
        }
        return undefined;
    };
    const clean = (val) => (val === "" || val === "null" || val === "undefined" ? undefined : val);
    const cleanNum = (val) => (val === "" || val === null || isNaN(Number(val)) ? undefined : Number(val));

    // --- LOOKUP LOCATION IDs ---
    let villageId = clean(data.presentVillage);
    let mandalId = clean(data.presentMandal);
    let districtId = clean(data.presentDistrict);
    let municipalityId = clean(data.presentMunicipality);
    let wardNumber = clean(data.presentWardNumber) || clean(data.presentWard); // Handle keys

    if (req.user && req.user.assignedLocation) {
        if (req.user.role === 'VILLAGE_ADMIN') villageId = req.user.assignedLocation;
        else if (req.user.role === 'MANDAL_ADMIN') mandalId = req.user.assignedLocation;
        else if (req.user.role === 'DISTRICT_ADMIN') districtId = req.user.assignedLocation;
        else if (req.user.role === 'MUNICIPALITY_ADMIN') municipalityId = req.user.assignedLocation;
        else if (req.user.role === 'WARD_ADMIN') {
            // Ward Admin typically assigned a WARD location
            // We need to resolve the municipality from the ward location
            const wLoc = await Location.findById(req.user.assignedLocation);
            if (wLoc && wLoc.type === 'WARD') {
                wardNumber = wLoc.name; // Use name as number/string
                municipalityId = wLoc.parent;
            }
        }
    }

    if (villageId) {
        let vLocDoc = null;
        if (mongoose.Types.ObjectId.isValid(villageId)) {
            vLocDoc = await Location.findById(villageId);
        }
        if (!vLocDoc && !mongoose.Types.ObjectId.isValid(villageId)) {
            vLocDoc = await Location.findOne({ name: { $regex: new RegExp(`^${villageId.trim()}$`, 'i') }, type: 'VILLAGE' });
        }
        if (vLocDoc) {
            if (!(req.user && req.user.assignedLocation && req.user.role === 'VILLAGE_ADMIN')) {
                villageId = vLocDoc._id;
            }
            if (vLocDoc.parent) {
                mandalId = vLocDoc.parent;
                const mandalDoc = await Location.findById(vLocDoc.parent);
                if (mandalDoc && mandalDoc.parent) {
                    const parentLoc = await Location.findById(mandalDoc.parent);
                    if (parentLoc) {
                        if (parentLoc.type === 'DISTRICT') {
                            districtId = parentLoc._id;
                        } else if (parentLoc.type === 'CONSTITUENCY' && parentLoc.parent) {
                            districtId = parentLoc.parent; // Parent of Constituency is District
                        }
                    }
                }
            }
        }
    }

    // Resolve Municipality ID if string
    if (municipalityId && !mongoose.Types.ObjectId.isValid(municipalityId)) {
        const munLoc = await Location.findOne({ name: { $regex: new RegExp(`^${municipalityId.trim()}$`, 'i') }, type: 'MUNICIPALITY' });
        if (munLoc) {
            municipalityId = munLoc._id;
            if (!mongoose.Types.ObjectId.isValid(districtId) && munLoc.parent) {
                // Check if Municipality parent is Constituency or District
                const munParent = await Location.findById(munLoc.parent);
                if (munParent) {
                    if (munParent.type === 'DISTRICT') districtId = munParent._id;
                    else if (munParent.type === 'CONSTITUENCY' && munParent.parent) districtId = munParent.parent;
                }
            }
        }
    }

    if (mandalId && !mongoose.Types.ObjectId.isValid(mandalId)) {
        const mLoc = await Location.findOne({ name: { $regex: new RegExp(`^${mandalId.trim()}$`, 'i') }, type: 'MANDAL' });
        if (mLoc) {
            mandalId = mLoc._id;
            if (!mongoose.Types.ObjectId.isValid(districtId) && mLoc.parent) {
                const mParent = await Location.findById(mLoc.parent);
                if (mParent) {
                    if (mParent.type === 'DISTRICT') districtId = mParent._id;
                    else if (mParent.type === 'CONSTITUENCY' && mParent.parent) districtId = mParent.parent;
                }
            }
        }
    }

    if (districtId && !mongoose.Types.ObjectId.isValid(districtId)) {
        const dLoc = await Location.findOne({ name: { $regex: new RegExp(`^${districtId.trim()}$`, 'i') }, type: 'DISTRICT' });
        if (dLoc) districtId = dLoc._id;
    }

    // Check Existence
    const userExists = await Member.findOne({ aadhaarNumber: clean(data.aadhaarNumber) });
    if (userExists) {
        res.status(400);
        throw new Error('Member with this Aadhaar number already exists');
    }

    // Prepare Member Data
    const memberData = {
        surname: clean(data.surname),
        name: clean(data.name),
        fatherName: clean(data.fatherName),
        dob: data.dob ? new Date(data.dob) : undefined,
        age: cleanNum(data.age),
        occupation: clean(data.occupation),
        politicalDetails: {
            position: clean(data.politicalPosition),
            fromDate: data.politicalFromDate ? new Date(data.politicalFromDate) : undefined,
            toDate: data.politicalToDate ? new Date(data.politicalToDate) : undefined
        },
        jobSector: clean(data.jobSector),
        jobOrganization: clean(data.jobOrganization),
        jobDesignation: clean(data.jobDesignation),
        jobCategory: clean(data.jobCategory),
        jobSubCategory: clean(data.jobSubCategory),
        businessType: clean(data.businessType),
        educationLevel: clean(data.educationLevel),
        gender: clean(data.gender),
        mobileNumber: clean(data.mobileNumber),
        bloodGroup: clean(data.bloodGroup),
        email: clean(data.email),
        alternateMobile: clean(data.alternateMobile),
        aadhaarNumber: clean(data.aadhaarNumber),
        address: {
            district: districtId,
            constituency: clean(data.presentConstituency),
            mandal: mandalId,
            village: villageId,
            municipality: municipalityId,
            wardNumber: wardNumber,
            houseNumber: clean(data.presentHouseNo),
            street: clean(data.presentStreet),
            pinCode: clean(data.presentPincode),
            residencyType: clean(data.residenceType),
            landmark: clean(data.presentLandmark),
            state: 'Telangana' // Default to Telangana for now as per project context
        },
        permanentAddress: {
            district: clean(data.permDistrict),
            constituency: clean(data.permConstituency),
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
            annualIncome: clean(data.annualIncome),
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
        verificationStatus: 'ACTIVE', // Auto-Activate
        legalConsent: data.legalConsent === 'true'
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
                            return req.files[field][indexRef].path;
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
                        jobSector: clean(fm.jobSector),
                        jobOrganization: clean(fm.jobOrganization),
                        jobDesignation: clean(fm.jobDesignation),
                        jobCategory: clean(fm.jobCategory),
                        jobSubCategory: clean(fm.jobSubCategory),
                        businessType: clean(fm.businessType),
                        educationLevel: clean(fm.educationLevel),
                        mobileNumber: clean(fm.mobileNumber),
                        aadhaarNumber: clean(fm.aadhaarNumber),
                        memberId: new mongoose.Types.ObjectId(),
                        epicNumber: clean(fm.epicNumber),
                        voterName: clean(fm.voterName),
                        pollingBooth: clean(fm.pollingBooth),
                        // Files
                        photo: getFamilyFile('familyMemberPhotos', getIndex(fm.photo)),
                        aadhaarFront: getFamilyFile('familyMemberAadhaarFronts', getIndex(fm.aadhaarFront)),
                        aadhaarBack: getFamilyFile('familyMemberAadhaarBacks', getIndex(fm.aadhaarBack)),
                        voterIdFront: getFamilyFile('familyMemberVoterIdFronts', getIndex(fm.voterIdFront)),
                        voterIdBack: getFamilyFile('familyMemberVoterIdBacks', getIndex(fm.voterIdBack)),
                        // Inherit Address
                        presentAddress: { ...memberData.address, state: 'Telangana' },
                        permanentAddress: { ...memberData.permanentAddress, state: 'Telangana' }
                    };
                });
            }
        } catch (e) {
            console.error("Error parsing family members:", e);
        }
    }

    // --- TRANSACTION LOGIC ---
    let session = null;
    let transactionStarted = false;
    try {
        session = await mongoose.startSession();
        session.startTransaction();
        transactionStarted = true;
    } catch (err) {
        console.warn("[WARN] Transactions not supported, running in standalone mode.");
        if (session) await session.endSession();
        session = null;
    }

    try {
        const opts = session ? { session } : {};

        // 1. Create Head
        const [member] = await Member.create([memberData], opts);

        // 2. Generate ID
        try {
            member.mewsId = await generateMemberId(member);
            await member.save(opts);
            console.log(`[REG] Generated Permanent ID: ${member.mewsId}`);
        } catch (idErr) {
            // If ID generation fails, we must abort
            throw new Error('Failed to generate Member ID: ' + idErr.message);
        }

        // 3. Create Dependents
        const createdDependents = [];
        if (memberData.familyMembers && memberData.familyMembers.length > 0) {
            for (const fm of memberData.familyMembers) {
                const dependentData = {
                    // Shallow copy relevant fields
                    surname: fm.surname || memberData.surname,
                    name: fm.name,
                    fatherName: fm.fatherName,
                    dob: fm.dob,
                    age: fm.age,
                    gender: fm.gender,
                    occupation: fm.occupation,
                    jobSector: fm.jobSector,
                    jobOrganization: fm.jobOrganization,
                    jobDesignation: fm.jobDesignation,
                    jobCategory: fm.jobCategory,
                    jobSubCategory: fm.jobSubCategory,
                    educationLevel: fm.educationLevel,
                    mobileNumber: fm.mobileNumber,
                    aadhaarNumber: fm.aadhaarNumber,
                    address: memberData.address,
                    permanentAddress: memberData.permanentAddress,
                    verificationStatus: 'ACTIVE',
                    headOfFamily: member._id,
                    relationToHead: fm.relation,
                    photoUrl: fm.photo,
                    aadhaarCardUrl: fm.aadhaarFront,
                    aadhaarCardBackUrl: fm.aadhaarBack,
                    voterIdUrl: fm.voterIdFront,
                    voterIdBackUrl: fm.voterIdBack,
                    familyDetails: { ...memberData.familyDetails, memberCount: undefined, dependentCount: undefined },
                    rationCard: memberData.rationCard,
                    voterId: {
                        epicNumber: fm.epicNumber,
                        nameOnCard: fm.voterName,
                        pollingBooth: fm.pollingBooth
                    }
                };

                // GENERATE ID FOR DEPENDENT IMMEDIATELY
                try {
                    dependentData.mewsId = await generateMemberId(dependentData);
                    console.log(`[REG-DEP] Generated ID for Dependent ${dependentData.name}: ${dependentData.mewsId}`);
                } catch (depIdErr) {
                    console.error("Failed to generate dependent ID:", depIdErr);
                    // Decide: Fail whole tx or continue? User wants "Ensure ID generated". Fail is safer to ensure consistency.
                    throw new Error('Failed to generate Dependent ID: ' + depIdErr.message);
                }

                const [savedDep] = await Member.create([dependentData], opts);
                createdDependents.push(savedDep);

                // SYNC ID BACK TO EMBEDDED FAMILY MEMBER
                // We assume the order in member.familyMembers matches memberData.familyMembers
                // But better to match by name/dob or index if possible.
                // Since Mongoose pushes in order, we can try to match by index i.
                // However, 'for...of' doesn't give index easily without counter.
                // Let's rely on finding the matching embedded subdoc.
                if (member.familyMembers && member.familyMembers.length > 0) {
                    // Try to match by some unique fields (Name + Relation) or just update by index if we used loop counter
                    // Since we are inside a loop over memberData.familyMembers, we correspond to the same index 'i' if we had one.
                    // But we are using 'for of'. Let's assume order is preserved.
                    // Actually, we can use the loop index if we used memberData.familyMembers.entries()
                    // But let's just find it by name/relation which should be unique enough for this tx
                    const embeddedMember = member.familyMembers.find(em =>
                        em.name === fm.name &&
                        em.relation === fm.relation &&
                        (!em.mewsId || em.mewsId !== savedDep.mewsId)
                    );

                    if (embeddedMember) {
                        embeddedMember.mewsId = savedDep.mewsId;
                    }
                }
            }
        }

        if (transactionStarted) await session.commitTransaction();

        // Send Registration Notifications (SMS & Email)
        try {
            await sendRegistrationNotification(member);
        } catch (err) {
            console.error("[Notify] Registration Notification Warning:", err);
        }

        // Notify Dependents (if they have a different mobile number) - REMOVED per user request
        /*
        if (createdDependents.length > 0) {
            // Use a Set to avoid duplicate notifications if multiple dependents share a number (optional, but good practice? 
            // Request said "if the person is different from the head". 
            // Usually if 2 kids share a phone, maybe send 2 msgs? Or 1? 
            // "send text message for member and family members" implies individual messages.
            for (const dep of createdDependents) {
                if (dep.mobileNumber && dep.mobileNumber !== member.mobileNumber) {
                    sendRegistrationNotification(dep).catch(err =>
                        console.error(`[Notify] Warning: Failed to notify dependent ${dep.name}:`, err)
                    );
                }
            }
        }
        */

        // In-App Notification to Admins
        try {
            // Find relevant admins
            const adminQuery = {
                $or: [
                    { role: 'SUPER_ADMIN' },
                    { role: 'VILLAGE_ADMIN', assignedLocation: villageId },
                    { role: 'MANDAL_ADMIN', assignedLocation: mandalId },
                    { role: 'DISTRICT_ADMIN', assignedLocation: districtId }
                ]
            };
            const admins = await User.find(adminQuery).select('_id');
            for (const admin of admins) {
                await createNotification(
                    admin._id,
                    'member',
                    'New Member Registration',
                    `New member ${member.name} registered in your jurisdiction.`,
                    member._id,
                    'Member'
                );
            }
        } catch (notifErr) {
            console.error("Admin Notification Error:", notifErr);
        }

        // Return signed version for consistency
        const signedMember = await signMemberData(member);

        // Also sign dependents if any
        const signedDependents = await Promise.all(createdDependents.map(async (dep) => {
            return await signMemberData(dep);
        }));

        res.status(201).json({
            message: 'Member registered successfully',
            member: signedMember,
            dependents: signedDependents,
            username: member.mewsId
        });

    } catch (error) {
        if (transactionStarted) await session.abortTransaction();
        console.error("Registration Failed:", error);
        res.status(500);
        throw new Error('Failed to register member: ' + error.message);
    } finally {
        if (session) session.endSession();
    }
});

// @desc    Get all members
// @route   GET /api/members
// @access  Private (Admin)
const getMembers = asyncHandler(async (req, res) => {
    let query = {};
    const toId = (id) => {
        if (!id) return null;
        try {
            if (mongoose.Types.ObjectId.isValid(id)) return new mongoose.Types.ObjectId(id);
            return id;
        } catch (e) { return id; }
    };
    console.log(`[GET MEMBERS] req.query:`, JSON.stringify(req.query, null, 2));
    console.log(`[GET MEMBERS] req.user:`, req.user ? { id: req.user._id, role: req.user.role, assignedLoc: req.user.assignedLocation } : 'No User');
    // --- Pagination Params ---
    const page = parseInt(req.query.page) || 1;
    const rawLimit = req.query.limit === 'all' ? 0 : parseInt(req.query.limit);
    const limit = (rawLimit === 0 || rawLimit === -1) ? 0 : (rawLimit || 50);
    const skip = (page - 1) * limit;

    // --- Search Logic (Broad Text Search) ---
    if (req.query.search) {
        const search = req.query.search;
        const searchRegex = new RegExp(search, 'i');
        query.$or = [
            { name: { $regex: searchRegex } },
            { surname: { $regex: searchRegex } },
            { mobileNumber: { $regex: searchRegex } },
            { mewsId: { $regex: searchRegex } }
        ];
    }

    // --- Standard Filters ---
    const filterFields = ['gender', 'maritalStatus', 'bloodGroup', 'educationLevel', 'occupation'];
    filterFields.forEach(field => {
        if (req.query[field]) {
            query[field] = req.query[field];
        }
    });

    // --- Location Filters (Cumulative) ---
    const q = req.query;
    const getParam = (path) => {
        if (q[path]) return q[path];
        const parts = path.split('.');
        let val = q;
        for (const p of parts) {
            if (!val || typeof val !== 'object') return null;
            val = val[p];
        }
        return val;
    };

    const district = getParam('address.district');
    const municipality = getParam('address.municipality');
    const wardParam = getParam('address.wardNumber') || getParam('address.ward');
    const stateID = getParam('address.stateID');
    const village = getParam('address.village');
    const mandal = getParam('address.mandal');

    if (stateID) {
        if (mongoose.Types.ObjectId.isValid(stateID)) {
            const stateLoc = await Location.findById(stateID);
            if (stateLoc) query['address.state'] = stateLoc.name;
        } else {
            query['address.state'] = stateID;
        }
    }
    if (district) query['address.district'] = toId(district);
    if (mandal) query['address.mandal'] = toId(mandal);
    if (village) query['address.village'] = toId(village);
    if (municipality) query['address.municipality'] = toId(municipality);

    if (wardParam) {
        if (mongoose.Types.ObjectId.isValid(wardParam)) {
            const wardLoc = await Location.findById(wardParam);
            if (wardLoc) {
                const shortName = wardLoc.name.replace(/Ward\s+/i, '').trim();
                query['address.wardNumber'] = { $in: [wardLoc.name, shortName] };
            }
        } else {
            query['address.wardNumber'] = { $regex: new RegExp(`^${wardParam}$`, 'i') };
        }
    }

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

        // -- VILLAGE ADMIN --
        if (req.user.role === 'VILLAGE_ADMIN') {
            const assignedLoc = await Location.findById(locationId);
            if (assignedLoc) {
                // Strict: Only members in this specific village ID
                // But handle name-based matching cautiously if needed for legacy data
                // For strict security, we should prefer ID match. 
                // However, to match previous logic's robustness:
                const escapedName = assignedLoc.name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

                // Criteria: Name matches, Type is VILLAGE, and Parent matches (if exists)
                const criteria = {
                    name: { $regex: new RegExp(`^${escapedName}$`, 'i') }, // Strict start/end match
                    type: 'VILLAGE'
                };
                if (assignedLoc.parent) {
                    criteria.parent = assignedLoc.parent;
                }

                const relatedLocations = await Location.find(criteria);
                const locIds = relatedLocations.map(l => l._id);
                if (!locIds.some(id => id.toString() === locationId.toString())) {
                    locIds.push(locationId);
                }

                query['address.village'] = { $in: locIds };
            } else {
                query['address.village'] = locationId;
            }
        }

        // -- WARD ADMIN --
        else if (req.user.role === 'WARD_ADMIN') {
            const assignedWard = await Location.findById(locationId);
            if (assignedWard && assignedWard.type === 'WARD') {
                query['address.municipality'] = assignedWard.parent;
                const shortWard = assignedWard.name.replace(/Ward\s+/i, '').trim();
                query['address.wardNumber'] = { $in: [assignedWard.name, shortWard] };
            } else {
                query = { _id: null };
            }
        }

        // -- MUNICIPALITY ADMIN --
        else if (req.user.role === 'MUNICIPALITY_ADMIN') {
            query['address.municipality'] = locationId;
        }

        // -- MANDAL ADMIN --
        else if (req.user.role === 'MANDAL_ADMIN') {
            query['address.mandal'] = locationId;
        }

        // -- DISTRICT ADMIN --
        else if (req.user.role === 'DISTRICT_ADMIN') {
            query['address.district'] = locationId;
        }

        // -- STATE ADMIN --
        else if (req.user.role === 'STATE_ADMIN') {
            const assignedState = await Location.findById(locationId);
            const districts = await Location.find({ parent: locationId, type: 'DISTRICT' }).select('_id');
            const districtIds = districts.map(d => d._id);

            // Query: (District IN Ids) OR (State Name matches)
            const orConditions = [
                { 'address.district': { $in: districtIds } }
            ];

            if (assignedState) {
                // Also match strict State Name if field exists
                orConditions.push({ 'address.state': { $regex: new RegExp(`^${assignedState.name}$`, 'i') } });
            }

            // Apply OR condition
            if (!query.$and) query.$and = [];
            query.$and.push({ $or: orConditions });

            // Explicitly ignore any conflicting stateID from query if it doesn't match
            delete query['address.stateID'];
        }

        // -- SUPER ADMIN --
        else if (req.user.role === 'SUPER_ADMIN') {
            // No restriction.
            // If they requested a specific drill-down via query params, that is respected by standard filters above.
            // If not, they see all.
        } else {
            // Unknown role with location? Block.
            query = { _id: null };
        }
    }

    console.log(`[GET MEMBERS] Final Mongoose Query:`, JSON.stringify(query, null, 2));

    const total = await Member.countDocuments(query);

    let membersQuery = Member.find(query)
        .populate('address.village', 'name')
        .populate('address.mandal', 'name')
        .populate('address.municipality', 'name')
        .populate('address.district', 'name')
        .populate('address.constituency', 'name')
        .populate('permanentAddress.village', 'name')
        .populate('permanentAddress.mandal', 'name')
        .populate('permanentAddress.municipality', 'name')
        .populate('permanentAddress.district', 'name')
        .populate('permanentAddress.constituency', 'name')
        .sort({ createdAt: -1 });

    if (limit > 0) {
        membersQuery = membersQuery.skip(skip).limit(limit);
    }

    const members = await membersQuery;

    // SIGN URLs for all members (Fault Tolerant)
    const signedMembers = await Promise.all(members.map(async (m) => {
        try {
            return await signMemberData(m);
        } catch (e) {
            console.error(`[GET MEMBERS] Signing failed for ${m._id}:`, e.message);
            return m; // Return unsigned member as fallback
        }
    }));

    res.json({
        members: signedMembers,
        total,
        page: limit > 0 ? page : 1,
        pages: limit > 0 ? Math.ceil(total / limit) : 1,
        debugQuery: query // Added for troubleshooting
    });
});

// @desc    Get member by ID
// @route   GET /api/members/:id
// @access  Private
const getMemberById = asyncHandler(async (req, res) => {
    const member = await Member.findById(req.params.id)
        .populate('address.village', 'name')
        .populate('address.mandal', 'name')
        .populate('address.municipality', 'name')
        .populate('address.district', 'name')
        .populate('address.constituency', 'name')
        .populate('permanentAddress.village', 'name')
        .populate('permanentAddress.mandal', 'name')
        .populate('permanentAddress.municipality', 'name')
        .populate('permanentAddress.district', 'name')
        .populate('permanentAddress.constituency', 'name');
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
    const session = await mongoose.startSession();
    session.startTransaction();
    let notificationMember = null; // Store member for notification after commit

    try {
        const member = await Member.findById(req.params.id).session(session);

        if (member) {
            const oldStatus = member.verificationStatus;
            member.verificationStatus = req.body.status || member.verificationStatus;

            // NEW: Generate Permanent ID if ACTIVE
            // Only if it doesn't already have one (check for 'MEWS-YYYY' pattern)
            if (member.verificationStatus === 'ACTIVE' && (!member.mewsId || !member.mewsId.startsWith('MEWS-'))) {
                try {
                    member.mewsId = await generateMemberId(member);
                    console.log(`[APPROVAL] Generated Permanent ID for ${member._id}: ${member.mewsId}`);
                } catch (err) {
                    console.error(`[APPROVAL] Failed to generate ID for ${member._id}:`, err);
                    throw new Error('Failed to generate Member ID: ' + err.message);
                }
            }

            const updatedMember = await member.save({ session });

            // CASCADE STATUS UPDATE to Dependents
            if (oldStatus !== member.verificationStatus) {
                const updateResult = await Member.updateMany(
                    { headOfFamily: member._id },
                    { $set: { verificationStatus: member.verificationStatus } },
                    { session }
                );
                console.log(`[APPROVAL] Cascaded status ${member.verificationStatus} to ${updateResult.modifiedCount} dependents.`);
            }

            await session.commitTransaction();

            // Notify if status became ACTIVE (and ID was generated)
            if (member.verificationStatus === 'ACTIVE' && member.mewsId) {
                // Execute async notification without blocking response
                sendRegistrationNotification(member).catch(err => console.error("Notification Error:", err));
            }

            // In-App Notification to Member (On any status change)
            try {
                // Find User linked to this Member
                const linkedUser = await User.findOne({
                    $or: [
                        { _id: member._id }, // If ID matches (Self Reg)
                        { username: member.mewsId } // If username is ID
                    ]
                });

                if (linkedUser) {
                    await createNotification(
                        linkedUser._id,
                        'info',
                        'Membership Status Updated',
                        `Your membership status is now ${member.verificationStatus}.`,
                        member._id,
                        'Member'
                    );
                }
            } catch (notifErr) {
                console.error("Member Notification Error:", notifErr);
            }

            // Return signed version for consistency
            const signedMember = await signMemberData(updatedMember);
            res.json(signedMember);
        } else {
            await session.abortTransaction();
            res.status(404);
            throw new Error('Member not found');
        }
    } catch (error) {
        await session.abortTransaction();
        console.error("[APPROVAL] Transaction failed:", error);
        res.status(500);
        throw error;
    } finally {
        session.endSession();
    }
});

// @desc    Update member details
// @route   PUT /api/members/:id
// @access  Private (Admin)
const updateMember = asyncHandler(async (req, res) => {
    let session = null;
    let transactionStarted = false;
    try {
        session = await mongoose.startSession();
        session.startTransaction();
        transactionStarted = true;
    } catch (err) {
        console.warn("[WARN] Transactions not supported, running in standalone mode.");
        if (session) await session.endSession();
        session = null;
    }

    try {
        // Find Member
        const member = await Member.findById(req.params.id).session(session);

        if (member) {
            console.log(`----- UPDATE MEMBER START: ${member._id} (Tx=${transactionStarted}) -----`);
            const data = req.body;
            const opts = session ? { session } : undefined;

            // Parse JSON strings
            try {
                if (typeof data.address === 'string') data.address = JSON.parse(data.address);
                if (typeof data.removedFiles === 'string') {
                    // Line 756 uses JSON.parse(data.removedFiles) -> Expects string. OK.
                }
            } catch (e) {
                console.error("Error parsing FormData JSON fields:", e);
            }

            // Helpers
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
            // Update Political Details
            if (data.politicalPosition !== undefined || data.politicalFromDate !== undefined) {
                if (!member.politicalDetails) member.politicalDetails = {};
                if (data.politicalPosition !== undefined) member.politicalDetails.position = clean(data.politicalPosition);
                if (data.politicalFromDate) member.politicalDetails.fromDate = new Date(data.politicalFromDate);
                if (data.politicalToDate) member.politicalDetails.toDate = new Date(data.politicalToDate);
            }
            if (data.businessType !== undefined) member.businessType = clean(data.businessType); // Update Business Type
            if (data.jobSector !== undefined) member.jobSector = clean(data.jobSector);
            if (data.jobOrganization !== undefined) member.jobOrganization = clean(data.jobOrganization);
            if (data.jobDesignation !== undefined) member.jobDesignation = clean(data.jobDesignation);
            if (data.jobCategory !== undefined) member.jobCategory = clean(data.jobCategory);
            if (data.jobSubCategory !== undefined) member.jobSubCategory = clean(data.jobSubCategory);
            if (data.educationLevel !== undefined) member.educationLevel = clean(data.educationLevel);
            if (data.gender !== undefined) member.gender = clean(data.gender);
            if (data.mobileNumber !== undefined) member.mobileNumber = clean(data.mobileNumber);
            if (data.bloodGroup !== undefined) member.bloodGroup = clean(data.bloodGroup);
            if (data.email !== undefined) member.email = clean(data.email);
            if (data.alternateMobile !== undefined) member.alternateMobile = clean(data.alternateMobile);
            if (data.aadhaarNumber !== undefined) member.aadhaarNumber = clean(data.aadhaarNumber);
            if (data.maritalStatus !== undefined) member.maritalStatus = clean(data.maritalStatus);

            // Update Files
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
                const loc = await Location.findOne(query).session(session);
                return loc ? loc._id : undefined;
            };

            // Update Address
            if (!member.address) member.address = {};
            if (data.address && typeof data.address === 'object') { // Ensure it's object
                if (data.address.district !== undefined) member.address.district = await resolveLocation(data.address.district, 'DISTRICT');
                if (data.address.mandal !== undefined) member.address.mandal = await resolveLocation(data.address.mandal, 'MANDAL');
                if (data.address.village !== undefined) member.address.village = await resolveLocation(data.address.village, 'VILLAGE');
                if (data.address.houseNumber !== undefined) member.address.houseNumber = clean(data.address.houseNumber);
                if (data.address.street !== undefined) member.address.street = clean(data.address.street);
                if (data.address.pinCode !== undefined) member.address.pinCode = clean(data.address.pinCode);
                if (data.address.state !== undefined) member.address.state = clean(data.address.state);
                if (data.address.constituency !== undefined) member.address.constituency = clean(data.address.constituency);
                if (data.address.residencyType !== undefined) member.address.residencyType = clean(data.address.residencyType);
                if (data.address.landmark !== undefined) member.address.landmark = clean(data.address.landmark);
            }
            // Legacy/Flat Support
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
            if (data.holderName !== undefined) member.bankDetails.holderName = clean(data.holderName);
            const newPassbook = getFilePath('bankPassbook');
            if (newPassbook) member.bankDetails.passbookUrl = newPassbook;

            // --- Explicit Document Removals ---
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
                } catch (e) { console.error("Error parsing removedFiles:", e); }
            }

            // Family Members List Update
            if (data.familyMembers) {
                try {
                    const parsedMembers = JSON.parse(data.familyMembers);
                    if (Array.isArray(parsedMembers)) {
                        const getIndex = (val) => {
                            if (typeof val === 'string' && val.startsWith('INDEX:')) return parseInt(val.split(':')[1], 10);
                            return -1;
                        };
                        const extractPathFromUrl = (url) => { // Compact
                            if (!url) return undefined;
                            try {
                                const urlObj = new URL(url);
                                let p = decodeURIComponent(urlObj.pathname);
                                if (p.startsWith('/')) p = p.substring(1);
                                if (urlObj.hostname === 'storage.googleapis.com') {
                                    const parts = p.split('/');
                                    if (parts.length > 1) { parts.shift(); p = parts.join('/'); }
                                }
                                if (p.includes('proxy-image')) {
                                    const ps = new URLSearchParams(urlObj.search);
                                    const o = ps.get('url');
                                    if (o) return extractPathFromUrl(o);
                                }
                                return p;
                            } catch (e) { return url; }
                        };
                        const resolveFile = (fieldVal, fileField, index, existingVal) => {
                            if (index !== -1 && req.files && req.files[fileField] && req.files[fileField][index]) {
                                return req.files[fileField][index].path;
                            }
                            if (fieldVal === "" || fieldVal === null || fieldVal === "null") return undefined;
                            const valToUse = (fieldVal && !fieldVal.startsWith('INDEX:')) ? fieldVal : existingVal;
                            return extractPathFromUrl(valToUse);
                        };

                        member.familyMembers = parsedMembers.map(fm => {
                            const photoIndex = getIndex(fm.photo);
                            const aadhaarFrontIndex = getIndex(fm.aadhaarFront);
                            const aadhaarBackIndex = getIndex(fm.aadhaarBack);
                            const voterIdFrontIndex = getIndex(fm.voterIdFront);
                            const voterIdBackIndex = getIndex(fm.voterIdBack);
                            const relation = clean(fm.relation);
                            let fMaritalStatus = clean(fm.maritalStatus);
                            if (relation === 'Father' || relation === 'Mother') fMaritalStatus = 'Married';

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
                                jobSector: clean(fm.jobSector),
                                jobOrganization: clean(fm.jobOrganization),
                                jobDesignation: clean(fm.jobDesignation),
                                jobCategory: clean(fm.jobCategory),
                                jobSubCategory: clean(fm.jobSubCategory),
                                mobileNumber: clean(fm.mobileNumber),
                                aadhaarNumber: clean(fm.aadhaarNumber),
                                annualIncome: member.familyDetails ? member.familyDetails.annualIncome : undefined,
                                memberCount: member.familyDetails ? member.familyDetails.memberCount : undefined,
                                dependentCount: member.familyDetails ? member.familyDetails.dependentCount : undefined,
                                rationCardNumber: member.rationCard ? member.rationCard.number : undefined,
                                epicNumber: clean(fm.epicNumber),
                                voterName: clean(fm.voterName),
                                pollingBooth: clean(fm.pollingBooth),
                                photo: resolveFile(fm.photo, 'familyMemberPhotos', photoIndex),
                                aadhaarFront: resolveFile(fm.aadhaarFront, 'familyMemberAadhaarFronts', aadhaarFrontIndex),
                                aadhaarBack: resolveFile(fm.aadhaarBack, 'familyMemberAadhaarBacks', aadhaarBackIndex),
                                voterIdFront: resolveFile(fm.voterIdFront, 'familyMemberVoterIdFronts', voterIdFrontIndex),
                                voterIdBack: resolveFile(fm.voterIdBack, 'familyMemberVoterIdBacks', voterIdBackIndex),
                                presentAddress: member.address,
                                permanentAddress: member.permanentAddress
                            };
                        });
                    }
                } catch (e) {
                    console.error("Error parsing family members update:", e);
                    throw e;
                }
            }

            const updatedMember = await member.save(opts); // SAVE HEAD

            // --- SYNC DEPENDENT MEMBERS ---
            const existingDependents = await Member.find({ headOfFamily: member._id }).session(session);

            if (updatedMember.familyMembers) {
                const matchedDependentIds = new Set();
                for (const fm of updatedMember.familyMembers) {
                    try {
                        let dependentDoc = existingDependents.find(d => d.name === fm.name && d.relationToHead === fm.relation);
                        if (!dependentDoc && fm.aadhaarNumber) dependentDoc = existingDependents.find(d => d.aadhaarNumber === fm.aadhaarNumber);

                        if (dependentDoc) {
                            // UPDATE
                            matchedDependentIds.add(dependentDoc._id.toString());
                            dependentDoc.maritalStatus = fm.maritalStatus;
                            dependentDoc.age = fm.age;
                            dependentDoc.occupation = fm.occupation;
                            dependentDoc.jobSector = fm.jobSector;
                            dependentDoc.jobOrganization = fm.jobOrganization;
                            dependentDoc.jobDesignation = fm.jobDesignation;
                            dependentDoc.jobCategory = fm.jobCategory;
                            dependentDoc.jobSubCategory = fm.jobSubCategory;
                            dependentDoc.mobileNumber = fm.mobileNumber;
                            if (fm.dob) dependentDoc.dob = fm.dob;
                            dependentDoc.address = updatedMember.address;
                            dependentDoc.permanentAddress = updatedMember.permanentAddress;
                            if (fm.photo) dependentDoc.photoUrl = fm.photo;
                            if (fm.aadhaarFront) dependentDoc.aadhaarCardUrl = fm.aadhaarFront;
                            await dependentDoc.save(opts);
                        } else {
                            // CREATE
                            const depMewsId = `MEW${new Date().getFullYear()}${Math.floor(10000 + Math.random() * 90000)}`;
                            const dependentData = {
                                surname: fm.surname || updatedMember.surname,
                                name: fm.name,
                                fatherName: fm.fatherName,
                                dob: fm.dob,
                                age: fm.age,
                                gender: fm.gender,
                                occupation: fm.occupation,
                                jobSector: fm.jobSector,
                                jobOrganization: fm.jobOrganization,
                                jobDesignation: fm.jobDesignation,
                                jobCategory: fm.jobCategory,
                                jobSubCategory: fm.jobSubCategory,
                                mobileNumber: fm.mobileNumber,
                                aadhaarNumber: fm.aadhaarNumber,
                                address: updatedMember.address,
                                permanentAddress: updatedMember.permanentAddress,
                                casteDetails: updatedMember.casteDetails,
                                headOfFamily: updatedMember._id,
                                relationToHead: fm.relation,
                                maritalStatus: fm.maritalStatus,
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
                            await Member.create([dependentData], opts);
                        }
                    } catch (err) {
                        console.error(`[UPDATE] Error syncing dependent ${fm.name}:`, err.message);
                        throw err;
                    }
                }
                // ORPHANS
                const orphans = existingDependents.filter(d => !matchedDependentIds.has(d._id.toString()));
                if (orphans.length > 0) {
                    const orphanIds = orphans.map(d => d._id);
                    await Member.deleteMany({ _id: { $in: orphanIds } }, opts);
                }
            }

            if (transactionStarted) await session.commitTransaction();

            // Notify
            if (member.verificationStatus === 'ACTIVE' && member.mewsId) {
                sendRegistrationNotification(member).catch(err => console.error("Notification Error:", err));
            }

            await updatedMember.populate([
                { path: 'address.district' },
                { path: 'address.mandal' },
                { path: 'address.village' },
                { path: 'address.constituency' },
                { path: 'permanentAddress.district' },
                { path: 'permanentAddress.mandal' },
                { path: 'permanentAddress.village' },
                { path: 'permanentAddress.constituency' }
            ]);

            const signedMember = await signMemberData(updatedMember);
            res.json(signedMember);
        } else {
            if (transactionStarted) await session.abortTransaction();
            res.status(404);
            throw new Error('Member not found');
        }
    } catch (error) {
        if (transactionStarted) await session.abortTransaction();
        console.error(error);
        res.status(500);
        throw new Error(error.message);
    } finally {
        if (session) session.endSession();
    }
});


// @desc    Delete member
// @route   DELETE /api/members/:id
// @access  Private (Admin)
const deleteMember = asyncHandler(async (req, res) => {
    let session = null;
    let transactionStarted = false;
    try {
        session = await mongoose.startSession();
        session.startTransaction();
        transactionStarted = true;
    } catch (err) {
        console.warn("[WARN] Transactions not supported, running in standalone mode (deleteMember).");
        if (session) await session.endSession();
        session = null;
    }

    try {
        const member = await Member.findById(req.params.id).session(session);

        if (member) {
            // Optional: Check permissions

            // 1. Delete associated User record(s)
            // A member might be linked by ID or by username (mewsId/mobile)
            const opts = session ? { session } : undefined;
            const User = require('../models/User');
            await User.deleteMany({
                $or: [
                    { memberId: member._id },
                    { username: member.mewsId },
                    { username: member.mobileNumber }
                ]
            }, opts);

            // 2. Delete the member themselves
            await member.deleteOne(opts);
            console.log(`[DELETE] Member ${member._id} (${member.name}) and their user account(s) deleted.`);

            if (transactionStarted) await session.commitTransaction();
            res.json({ message: 'Member and associated administrative accounts removed' });
        } else {
            if (transactionStarted) await session.abortTransaction();
            res.status(404);
            throw new Error('Member not found');
        }
    } catch (error) {
        if (transactionStarted) await session.abortTransaction();
        console.error("[DELETE] Transaction failed:", error);
        throw error;
    } finally {
        if (session) session.endSession();
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
    } else if (field === 'mobileNumber') {
        query.mobileNumber = value;
    } else if (field === 'communityCert') {
        query['casteDetails.communityCertNumber'] = value;
    } else {
        return res.status(400).json({ message: "Invalid field type" });
    }

    const exists = await Member.findOne(query);

    if (exists) {
        return res.status(200).json({
            isDuplicate: true,
            message: `This ${field === 'voterId' ? 'Voter ID' : (field === 'rationCard' ? 'Ration Card' : (field === 'mobileNumber' ? 'Mobile Number' : (field === 'communityCert' ? 'Community Certificate Number' : 'Aadhaar Number')))} is already registered.`
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
