const Member = require('../models/Member');
const Location = require('../models/Location');
const asyncHandler = require('express-async-handler');

// @desc    Register a member (Admin or Self)
// @route   POST /api/members
// @access  Public (for now)
const registerMember = asyncHandler(async (req, res) => {
    try {
        console.log("----- REGISTER MEMBER START -----");
        const data = req.body;

        // Auto-generate a temp ID
        const mewsId = `MEW${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`;
        const baseUrl = `${req.protocol}://${req.get('host')}/uploads/`;

        const getFilePath = (fieldname) => {
            return req.files && req.files[fieldname] ? baseUrl + req.files[fieldname][0].filename : undefined;
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
                vLocDoc = await Location.findOne({ name: { $regex: new RegExp(`^${villageId.trim()}$`, 'i') }, type: 'VILLAGE' });
            }

            if (vLocDoc) {
                console.log(`Mapping Village '${vLocDoc.name}' -> ${vLocDoc._id}`);
                villageId = vLocDoc._id; // Ensure consistent ID usage

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
            gender: clean(data.gender),
            mobileNumber: clean(data.mobileNumber),
            bloodGroup: clean(data.bloodGroup),
            email: clean(data.email),
            alternateMobile: clean(data.alternateMobile),
            aadhaarNumber: clean(data.aadhaarNumber),

            address: {
                district: districtId, // Still allow string if not mapped, but ideally ID
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
                annualIncome: incomeValue,
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
                fileUrl: getFilePath('voterIdFront')
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
            mewsId,
            verificationStatus: 'PENDING'
        };

        const member = await Member.create(memberData);
        res.status(201).json(member);
    } catch (error) {
        console.error("REGISTER MEMBER ERROR:", error);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get all members
// @route   GET /api/members
// @access  Private (Admin)
const getMembers = asyncHandler(async (req, res) => {
    let query = {};

    // Filter by assigned location if user has one
    // Filter by assigned location if user has one
    // Filter by assigned location if user has one
    if (req.user && req.user.assignedLocation) {
        // Use ObjectId directly (Mixed type field holds ObjectId)
        const locationId = req.user.assignedLocation;

        if (req.user.role === 'VILLAGE_ADMIN') {
            query['address.village'] = locationId;
        } else if (req.user.role === 'MANDAL_ADMIN') {
            query['address.mandal'] = locationId;
        } else if (req.user.role === 'DISTRICT_ADMIN') {
            query['address.district'] = locationId;
        }
    }

    const members = await Member.find(query).sort({ createdAt: -1 });
    res.json(members);
});

// @desc    Get member by ID
// @route   GET /api/members/:id
// @access  Private
const getMemberById = asyncHandler(async (req, res) => {
    const member = await Member.findById(req.params.id);
    if (member) {
        res.json(member);
    } else {
        res.status(404);
        throw new Error('Member not found');
    }
});
const updateMemberStatus = asyncHandler(async (req, res) => {
    const member = await Member.findById(req.params.id);

    if (member) {
        member.verificationStatus = req.body.status || member.verificationStatus;
        const updatedMember = await member.save();
        res.json(updatedMember);
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
        // Update basic fields
        member.surname = req.body.surname || member.surname;
        member.name = req.body.name || member.name;
        member.fatherName = req.body.fatherName || member.fatherName;
        member.dob = req.body.dob || member.dob;
        member.age = req.body.age || member.age;
        member.gender = req.body.gender || member.gender;
        member.mobileNumber = req.body.mobile || member.mobileNumber;
        member.bloodGroup = req.body.bloodGroup || member.bloodGroup;
        member.maritalStatus = req.body.maritalStatus || member.maritalStatus;

        // Update Address
        if (req.body.address) {
            member.address = {
                ...member.address,
                ...req.body.address
            };
        } else {
            // Handle flat fields if sent flattened from frontend
            if (req.body.presentDistrict) member.address.district = req.body.presentDistrict; // Note: Typically strictly ObjectId, ideally frontend sends IDs
            // However, existing schema allows Mixed for legacy specific fields, but we should be careful. 
            // The frontend form seems to send names? Or we should populate names.
            // Wait, registerMember ensures IDs are stored.
            // If frontend sends Names for updates, we might break the ID link if we overwrite.
            // Ideally, user shouldn't edit Location hierarchy easily without re-selection logic.
            // For now, let's assume specific basic fields update. 
            // If the user wants to Edit "District", they usually select from a dropdown.
        }

        // Manual updates for specific flattened address fields if passed
        if (req.body.presentHouseNo) member.address.houseNumber = req.body.presentHouseNo;
        if (req.body.presentStreet) member.address.street = req.body.presentStreet;
        if (req.body.presentLandmark) member.address.landmark = req.body.presentLandmark;
        if (req.body.presentPincode) member.address.pincode = req.body.presentPincode;

        const updatedMember = await member.save();
        res.json(updatedMember);
    } else {
        res.status(404);
        throw new Error('Member not found');
    }
});


module.exports = {
    registerMember,
    getMembers,
    getMemberById,
    updateMemberStatus,
    updateMember
};
