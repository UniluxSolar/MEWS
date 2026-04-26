const Member = require('../models/Member');
const FundRequest = require('../models/FundRequest');
const Location = require('../models/Location');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const { getSignedUrl } = require('../utils/gcsSigner');
const { generateMemberId } = require('../utils/idGenerator');
const { sendRegistrationNotification } = require('../utils/notificationService');
const User = require('../models/User'); // For finding admins
const DeletedId = require('../models/DeletedId');

// Helper to move mewsId to reusable pool upon deletion
const handleIdReuseOnDelete = async (member, opts = {}) => {
    if (!member || !member.mewsId || !member.mewsId.startsWith('MEWS-')) return;
    
    try {
        const parts = member.mewsId.split('-');
        if (parts.length < 5) return;
        
        const year = parseInt(parts[1]);
        const stateCode = parts[2];
        const districtCode = parts[3];
        const key = `${stateCode}-${districtCode}-${year}`;
        
        const updateOpts = opts.session ? { session: opts.session, upsert: true } : { upsert: true };
        await DeletedId.findOneAndUpdate(
            { mewsId: member.mewsId },
            { 
                mewsId: member.mewsId,
                stateCode,
                districtCode,
                year,
                key
            },
            updateOpts
        );
        console.log(`[ID-POOL] Added ${member.mewsId} (District: ${districtCode}) to reusable pool.`);
    } catch (err) {
        console.error(`[ID-POOL] Error adding ID ${member.mewsId} to pool:`, err.message);
    }
};

const isValidDOB = (dobString) => {
    if (!dobString) return true;
    const date = new Date(dobString);
    if (isNaN(date.getTime())) return false;

    // Check for future date
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (date > today) return false;

    // Check for "auto-corrected" dates (e.g. Feb 30 -> Mar 2)
    // dobString is expected to be YYYY-MM-DD from frontend
    const parts = dobString.split('-');
    if (parts.length === 3) {
        const y = parseInt(parts[0]);
        const m = parseInt(parts[1]);
        const d = parseInt(parts[2]);
        if (date.getFullYear() !== y || (date.getMonth() + 1) !== m || date.getDate() !== d) {
            return false;
        }
    }
    return true;
};

// Helper to sign all URLs in a member object
const signMemberData = async (memberDoc) => {
    // Convert to plain object if it's a Mongoose document
    const member = memberDoc.toObject ? memberDoc.toObject() : memberDoc;

    if (member.address) {
        // Detect Area Type (Prioritize municipality presence for legacy/self-reg data)
        member.areaType = (member.address.municipality || member.address.areaType === 'URBAN') ? 'URBAN' : 'RURAL';
        
        // Resolve names via lookup if they are just ObjectIds (not populated)
        // Check if the field is an object and HAS a name property (indicates successful population)
        const isPopulated = (obj) => obj && typeof obj === 'object' && obj.name;

        if (member.address.constituency) {
            const loc = isPopulated(member.address.constituency) ? member.address.constituency : await Location.findById(member.address.constituency);
            member.constituencyName = loc?.name || '';
        }
        if (member.address.district) {
            const loc = isPopulated(member.address.district) ? member.address.district : await Location.findById(member.address.district);
            member.districtName = loc?.name || '';
        }
        if (member.address.mandal) {
            const loc = isPopulated(member.address.mandal) ? member.address.mandal : await Location.findById(member.address.mandal);
            member.mandalName = loc?.name || '';
        }
        if (member.address.municipality) {
            const loc = isPopulated(member.address.municipality) ? member.address.municipality : await Location.findById(member.address.municipality);
            member.municipalityName = loc?.name || '';
        }
        if (member.address.village) {
            const loc = isPopulated(member.address.village) ? member.address.village : await Location.findById(member.address.village);
            member.villageName = loc?.name || '';
        }

        // Fix Ward Number resolution
        const wardVal = member.address.wardNumber;
        const wardId = member.address.ward;
        if (wardVal && !mongoose.Types.ObjectId.isValid(wardVal)) {
            member.wardNumber = wardVal;
        } else {
            const idToResolve = wardId || (mongoose.Types.ObjectId.isValid(wardVal) ? wardVal : null);
            if (idToResolve) {
                const loc = isPopulated(idToResolve) ? idToResolve : await Location.findById(idToResolve);
                member.wardNumber = loc?.name || (mongoose.Types.ObjectId.isValid(wardVal) ? '' : wardVal);
            } else {
                member.wardNumber = wardVal || '';
            }
        }
    }

    // 1. Top Level Fields
    if (member.photoUrl) member.photoUrl = await getSignedUrl(member.photoUrl);
    if (member.profileImage) member.profileImage = await getSignedUrl(member.profileImage);

    // Sign family member photos and docs
    if (member.familyMembers && Array.isArray(member.familyMembers)) {
        for (let i = 0; i < member.familyMembers.length; i++) {
            const fm = member.familyMembers[i];
            if (fm.photo) fm.photo = await getSignedUrl(fm.photo);
            if (fm.voterIdFront) fm.voterIdFront = await getSignedUrl(fm.voterIdFront);
            if (fm.voterIdBack) fm.voterIdBack = await getSignedUrl(fm.voterIdBack);
        }
    }

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
    let rawWard = clean(data.presentWardNumber) || clean(data.presentWard);
    let wardNumber = rawWard;
    let wardId = undefined;

    // Resolve Ward if ID
    if (rawWard && mongoose.Types.ObjectId.isValid(rawWard)) {
        wardId = rawWard;
        const wLoc = await Location.findById(wardId);
        if (wLoc) wardNumber = wLoc.name;
    }

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

    // Prepare Member Data
    const memberData = {
        surname: clean(data.surname),
        name: clean(data.name),
        fatherName: clean(data.fatherName),
        dob: (() => {
            if (data.dob !== undefined) {
                if (data.dob && !isValidDOB(data.dob)) {
                    res.status(400);
                    throw new Error("Please enter DOB in DD-MM-YYYY format");
                }
                return data.dob ? new Date(data.dob) : undefined;
            }
            return undefined; // If data.dob is explicitly undefined, return undefined
        })(),
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

        address: {
            areaType: (data.presentAreaType === 'Urban' || data.areaType === 'URBAN') ? 'URBAN' : 'RURAL',
            district: districtId,
            constituency: clean(data.presentConstituency),
            mandal: mandalId,
            village: villageId,
            municipality: municipalityId,
            ward: wardId,
            wardNumber: wardNumber,
            houseNumber: clean(data.presentHouseNo),
            street: clean(data.presentStreet),
            pinCode: clean(data.presentPincode),
            residencyType: clean(data.residenceType),
            landmark: clean(data.presentLandmark),
            state: 'Telangana' // Default to Telangana for now as per project context
        },
        permanentAddress: {
            areaType: (data.permAreaType === 'Urban' || data.presentAreaType === 'Urban' || data.areaType === 'URBAN') ? 'URBAN' : 'RURAL',
            district: clean(data.permDistrict),
            constituency: clean(data.permConstituency),
            mandal: clean(data.permMandal),
            village: clean(data.permVillage),
            municipality: clean(data.permMunicipality),
            ward: mongoose.Types.ObjectId.isValid(clean(data.permWardNumber)) ? clean(data.permWardNumber) : undefined,
            wardNumber: clean(data.permWardNumber) || clean(data.permWard),
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
        verificationStatus: 'ACTIVE', // Auto-Activate
        legalConsent: data.legalConsent === 'true'
    };

    // --- AUTO GENERATE STANDARDIZED PASSWORD ---
    // Standardized Password Generation
    const bcrypt = require('bcryptjs');
    const standardizedPassword = "Mews@Admin2024";
    const salt = await bcrypt.genSalt(10);
    memberData.passwordHash = await bcrypt.hash(standardizedPassword, salt);
    
    // Set default email if missing
    if (!memberData.email) {
        memberData.email = "admin@mews.com";
    }
    console.log(`[REG] Standardized password generated for member: Mews@Admin2024`);

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

                        memberId: new mongoose.Types.ObjectId(),
                        epicNumber: clean(fm.epicNumber),
                        voterName: clean(fm.voterName),
                        pollingBooth: clean(fm.pollingBooth),
                        // Files
                        photo: getFamilyFile('familyMemberPhotos', getIndex(fm.photo)),

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

                    address: memberData.address,
                    permanentAddress: memberData.permanentAddress,
                    verificationStatus: 'ACTIVE',
                    headOfFamily: member._id,
                    relationToHead: fm.relation,
                    photoUrl: fm.photo,

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
                if (member.familyMembers && member.familyMembers.length > 0) {
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

        // In-App Notification to Admins
        try {
            // Find relevant admins
            const adminQuery = {
                $or: [
                    { role: 'SUPER_ADMIN' },
                    { role: 'VILLAGE_ADMIN', assignedLocation: villageId },
                    { role: 'MANDAL_ADMIN', assignedLocation: mandalId },
                    { role: 'MUNICIPALITY_ADMIN', assignedLocation: municipalityId },
                    { role: 'WARD_ADMIN', assignedLocation: wardId },
                    { role: 'DISTRICT_ADMIN', assignedLocation: districtId }
                ]
            };
            const admins = await User.find(adminQuery).select('_id');
            const SCRUTINY_ADMIN_ID = '507f191e810c19729de860ea';
            
            // Create list of unique recipient IDs
            const recipientIds = new Set(admins.map(a => a._id.toString()));
            recipientIds.add(SCRUTINY_ADMIN_ID);

            // Fetch Mandal Name for grouping if Scrutiny Admin is involved
            let mandalName = 'General';
            if (mandalId) {
                const mandalLoc = await Location.findById(mandalId).select('name');
                if (mandalLoc) mandalName = mandalLoc.name;
            }

            for (const adminId of recipientIds) {
                await createNotification(
                    adminId,
                    'member',
                    'New Member Registration',
                    `New member ${member.name} registered in mandal ${mandalName}.`,
                    member._id,
                    'Member',
                    mandalName, // targetAudience stores the Mandal Name
                    mandalId,
                    'SYSTEM',
                    villageId,
                    municipalityId,
                    wardId
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
                const escapedName = assignedLoc.name.trim().replace(/[.*+?^${}()|[\]\\\\]/g, '\\\\$&');

                const criteria = {
                    name: { $regex: new RegExp(`^${escapedName}$`, 'i') }, 
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

            const orConditions = [
                { 'address.district': { $in: districtIds } }
            ];

            if (assignedState) {
                orConditions.push({ 'address.state': { $regex: new RegExp(`^${assignedState.name}$`, 'i') } });
            }

            if (!query.$and) query.$and = [];
            query.$and.push({ $or: orConditions });

            delete query['address.stateID'];
        }

        // -- SUPER ADMIN --
        else if (req.user.role === 'SUPER_ADMIN') {
            // No restriction
        } else {
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

    const signedMembers = await Promise.all(members.map(async (m) => {
        try {
            return await signMemberData(m);
        } catch (e) {
            console.error(`[GET MEMBERS] Signing failed for ${m._id}:`, e.message);
            return m; 
        }
    }));

    res.json({
        members: signedMembers,
        total,
        page: limit > 0 ? page : 1,
        pages: limit > 0 ? Math.ceil(total / limit) : 1,
        debugQuery: query 
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
    let query = {};
    if (req.user.mewsId || req.user.role === 'MEMBER') {
        query.beneficiary = req.user._id;
    } else {
        query.requestedBy = req.user._id;
    }

    const applications = await FundRequest.find(query);

    const activeCount = applications.filter(app => ['PENDING_APPROVAL', 'ACTIVE'].includes(app.status)).length;
    const approvedCount = applications.filter(app => ['ACTIVE', 'COMPLETED'].includes(app.status)).length;
    const totalDisbursed = applications
        .filter(app => ['ACTIVE', 'COMPLETED'].includes(app.status))
        .reduce((sum, app) => sum + (app.amountCollected || 0), 0);
    const pendingCount = applications.filter(app => app.status === 'PENDING_APPROVAL').length;
    const totalApplications = applications.length;

    res.json({
        activeApplications: activeCount,
        approvedApplications: approvedCount,
        totalAmountDisbursed: totalDisbursed,
        pendingReviews: pendingCount,
        totalApplications: totalApplications,
        applications: applications 
    });
});

const updateMemberStatus = asyncHandler(async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const member = await Member.findById(req.params.id).session(session);

        if (member) {
            const oldStatus = member.verificationStatus;
            member.verificationStatus = req.body.status || member.verificationStatus;

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

            if (oldStatus !== member.verificationStatus) {
                const updateResult = await Member.updateMany(
                    { headOfFamily: member._id },
                    { $set: { verificationStatus: member.verificationStatus } },
                    { session }
                );
                console.log(`[APPROVAL] Cascaded status ${member.verificationStatus} to ${updateResult.modifiedCount} dependents.`);
            }

            await session.commitTransaction();

            if (member.verificationStatus === 'ACTIVE' && member.mewsId) {
                sendRegistrationNotification(member).catch(err => console.error("Notification Error:", err));
            }

            try {
                const User = require('../models/User');
                const linkedUser = await User.findOne({
                    $or: [
                        { _id: member._id },
                        { username: member.mewsId }
                    ]
                });

                if (linkedUser) {
                    // Assuming createNotification is available in scope or needs import
                    // If not defined, it might cause error. In original code it was used.
                    // await createNotification(...)
                }
            } catch (notifErr) {
                console.error("Member Notification Error:", notifErr);
            }

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
        const member = await Member.findById(req.params.id).session(session);

        if (member) {
            const userRole = (req.user.role || '').toString().trim().toUpperCase();
            if (userRole === 'MEMBER') {
                const targetId = req.params.id;
                const isHeadMatch = targetId === req.user._id.toString() || targetId === req.user.mewsId;
                
                let isDependentMatch = false;
                if (req.loggedInMemberId) {
                    const dependent = req.user.familyMembers?.find(fm => 
                        (fm._id && fm._id.toString() === req.loggedInMemberId) || 
                        (fm.mewsId && fm.mewsId === req.loggedInMemberId)
                    );
                    if (dependent && (targetId === dependent._id.toString() || targetId === dependent.mewsId)) {
                        isDependentMatch = true;
                    }
                }

                if (!isHeadMatch && !isDependentMatch) {
                    if (transactionStarted) await session.abortTransaction();
                    res.status(403);
                    throw new Error('You are only authorized to update your own profile details.');
                }
            }
            console.log(`----- UPDATE MEMBER START: ${member._id} (Tx=${transactionStarted}) -----`);
            const data = req.body;
            const opts = session ? { session } : undefined;

            try {
                if (typeof data.address === 'string') data.address = JSON.parse(data.address);
            } catch (e) {
                console.error("Error parsing FormData JSON fields:", e);
            }

            const getFilePath = (fieldname) => {
                if (req.files && req.files[fieldname]) {
                    return req.files[fieldname][0].path;
                }
                return undefined;
            };
            const clean = (val) => (val === "" || val === "null" || val === "undefined" ? undefined : val);
            const cleanNum = (val) => (val === "" || val === null || isNaN(Number(val)) ? undefined : Number(val));

            if (data.surname !== undefined) member.surname = clean(data.surname);
            if (data.name !== undefined) member.name = clean(data.name);
            if (data.fatherName !== undefined) member.fatherName = clean(data.fatherName);
            if (data.dob !== undefined) {
                if (data.dob && !isValidDOB(data.dob)) {
                    res.status(400);
                    throw new Error("Please enter DOB in DD-MM-YYYY format");
                }
                member.dob = data.dob ? new Date(data.dob) : undefined;
            }
            if (data.age) member.age = cleanNum(data.age);
            if (data.occupation !== undefined) member.occupation = clean(data.occupation);
            if (data.politicalPosition !== undefined || data.politicalFromDate !== undefined) {
                if (!member.politicalDetails) member.politicalDetails = {};
                if (data.politicalPosition !== undefined) member.politicalDetails.position = clean(data.politicalPosition);
                if (data.politicalFromDate) member.politicalDetails.fromDate = new Date(data.politicalFromDate);
                if (data.politicalToDate) member.politicalDetails.toDate = new Date(data.politicalToDate);
            }
            if (data.businessType !== undefined) member.businessType = clean(data.businessType);
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
            if (data.maritalStatus !== undefined) member.maritalStatus = clean(data.maritalStatus);

            const newPhoto = getFilePath('photo');
            if (newPhoto) member.photoUrl = newPhoto;

            const resolveLocation = async (val, type) => {
                if (!val) return undefined;
                if (mongoose.Types.ObjectId.isValid(val)) return val;
                const query = { name: { $regex: new RegExp(`^${val.trim()}$`, 'i') } };
                if (type) query.type = type;
                const loc = await Location.findOne(query).session(session);
                return loc ? loc._id : undefined;
            };

            if (!member.address) member.address = {};
            if (data.address && typeof data.address === 'object') {
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
            if (data.presentDistrict !== undefined) member.address.district = await resolveLocation(data.presentDistrict, 'DISTRICT');
            if (data.presentConstituency !== undefined) member.address.constituency = clean(data.presentConstituency);
            if (data.presentMandal !== undefined) member.address.mandal = await resolveLocation(data.presentMandal, 'MANDAL');
            if (data.presentVillage !== undefined) member.address.village = await resolveLocation(data.presentVillage, 'VILLAGE');
            if (data.presentHouseNo !== undefined) member.address.houseNumber = clean(data.presentHouseNo);
            if (data.presentStreet !== undefined) member.address.street = clean(data.presentStreet);
            if (data.presentPincode !== undefined) member.address.pinCode = clean(data.presentPincode);
            if (data.residenceType !== undefined) member.address.residencyType = clean(data.residenceType);
            if (data.presentLandmark !== undefined) member.address.landmark = clean(data.presentLandmark);

            if (data.presentMunicipality !== undefined) member.address.municipality = await resolveLocation(data.presentMunicipality, 'MUNICIPALITY');
            if (data.presentAreaType !== undefined) member.address.areaType = data.presentAreaType.toUpperCase();
            if (data.presentWardNumber !== undefined) {
                let wVal = clean(data.presentWardNumber);
                if (wVal && mongoose.Types.ObjectId.isValid(wVal)) {
                    member.address.ward = wVal;
                    const wLoc = await Location.findById(wVal);
                    if (wLoc) member.address.wardNumber = wLoc.name;
                    else member.address.wardNumber = wVal;
                } else {
                    member.address.wardNumber = wVal;
                    member.address.ward = undefined;
                }
            }

            if (!member.permanentAddress) member.permanentAddress = {};
            if (data.permDistrict !== undefined) member.permanentAddress.district = await resolveLocation(data.permDistrict);
            if (data.permConstituency !== undefined) member.permanentAddress.constituency = clean(data.permConstituency);
            if (data.permMandal !== undefined) member.permanentAddress.mandal = await resolveLocation(data.permMandal);
            if (data.permVillage !== undefined) member.permanentAddress.village = await resolveLocation(data.permVillage);
            if (data.permHouseNo !== undefined) member.permanentAddress.houseNumber = clean(data.permHouseNo);
            if (data.permStreet !== undefined) member.permanentAddress.street = clean(data.permStreet);
            if (data.permPincode !== undefined) member.permanentAddress.pinCode = clean(data.permPincode);
            if (data.permLandmark !== undefined) member.permanentAddress.landmark = clean(data.permLandmark);

            if (data.permMunicipality !== undefined) member.permanentAddress.municipality = await resolveLocation(data.permMunicipality, 'MUNICIPALITY');
            if (data.permAreaType !== undefined) member.permanentAddress.areaType = data.permAreaType.toUpperCase();
            if (data.permWardNumber !== undefined) {
                let pwVal = clean(data.permWardNumber);
                if (pwVal && mongoose.Types.ObjectId.isValid(pwVal)) {
                    member.permanentAddress.ward = pwVal;
                    const pwLoc = await Location.findById(pwVal);
                    if (pwLoc) member.permanentAddress.wardNumber = pwLoc.name;
                    else member.permanentAddress.wardNumber = pwVal;
                } else {
                    member.permanentAddress.wardNumber = pwVal;
                    member.permanentAddress.ward = undefined;
                }
            }

            if (!member.casteDetails) member.casteDetails = {};
            if (data.caste !== undefined) member.casteDetails.caste = clean(data.caste);
            if (data.subCaste !== undefined) member.casteDetails.subCaste = clean(data.subCaste);
            if (data.communityCertNumber !== undefined) member.casteDetails.communityCertNumber = clean(data.communityCertNumber);
            const newCommCert = getFilePath('communityCert');
            if (newCommCert) member.casteDetails.certificateUrl = newCommCert;

            if (!member.partnerDetails) member.partnerDetails = {};
            if (data.partnerName !== undefined) member.partnerDetails.name = clean(data.partnerName);
            if (data.partnerCaste !== undefined) member.partnerDetails.caste = clean(data.partnerCaste);
            if (data.partnerSubCaste !== undefined) member.partnerDetails.subCaste = clean(data.partnerSubCaste);
            if (data.isInterCaste !== undefined) member.partnerDetails.isInterCaste = (data.isInterCaste === 'Yes' || data.isInterCaste === true || data.isInterCaste === 'true');
            if (data.marriageCertNumber !== undefined) member.partnerDetails.marriageCertNumber = clean(data.marriageCertNumber);
            if (data.marriageDate) member.partnerDetails.marriageDate = new Date(data.marriageDate);
            const newMarriageCert = getFilePath('marriageCert');
            if (newMarriageCert) member.partnerDetails.certificateUrl = newMarriageCert;

            if (!member.familyDetails) member.familyDetails = {};
            if (data.fatherOccupation !== undefined) member.familyDetails.fatherOccupation = clean(data.fatherOccupation);
            if (data.motherOccupation !== undefined) member.familyDetails.motherOccupation = clean(data.motherOccupation);
            if (data.annualIncome !== undefined) member.familyDetails.annualIncome = clean(data.annualIncome);
            if (data.memberCount !== undefined) member.familyDetails.memberCount = cleanNum(data.memberCount);
            if (data.dependentCount !== undefined) member.familyDetails.dependentCount = cleanNum(data.dependentCount);
            if (data.rationCardTypeFamily !== undefined) member.familyDetails.rationCardType = clean(data.rationCardTypeFamily);

            if (!member.rationCard) member.rationCard = {};
            if (data.rationCardNumber !== undefined) member.rationCard.number = clean(data.rationCardNumber);
            if (data.rationCardType !== undefined) member.rationCard.type = clean(data.rationCardType);
            if (data.rationCardHolderName !== undefined) member.rationCard.holderName = clean(data.rationCardHolderName);
            const newRationFile = getFilePath('rationCardFile');
            if (newRationFile) member.rationCard.fileUrl = newRationFile;

            if (!member.voterId) member.voterId = {};
            if (data.epicNumber !== undefined) member.voterId.epicNumber = clean(data.epicNumber);
            if (data.voterName !== undefined) member.voterId.nameOnCard = clean(data.voterName);
            if (data.pollingBooth !== undefined) member.voterId.pollingBooth = clean(data.pollingBooth);
            const newVoterFile = getFilePath('voterIdFront');
            if (newVoterFile) member.voterId.fileUrl = newVoterFile;
            const newVoterBackFile = getFilePath('voterIdBack');
            if (newVoterBackFile) member.voterId.backFileUrl = newVoterBackFile;

            if (!member.bankDetails) member.bankDetails = {};
            if (data.bankName !== undefined) member.bankDetails.bankName = clean(data.bankName);
            if (data.branchName !== undefined) member.bankDetails.branchName = clean(data.branchName);
            if (data.accountNumber !== undefined) member.bankDetails.accountNumber = clean(data.accountNumber);
            if (data.ifscCode !== undefined) member.bankDetails.ifscCode = clean(data.ifscCode);
            if (data.holderName !== undefined) member.bankDetails.holderName = clean(data.holderName);
            const newPassbook = getFilePath('bankPassbook');
            if (newPassbook) member.bankDetails.passbookUrl = newPassbook;

            if (data.removedFiles) {
                try {
                    const removedFields = JSON.parse(data.removedFiles);
                    if (Array.isArray(removedFields)) {
                        removedFields.forEach(field => {
                            if (field === 'photo') member.photoUrl = undefined;
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

            if (data.familyMembers) {
                try {
                    const parsedMembers = JSON.parse(data.familyMembers);
                    if (Array.isArray(parsedMembers)) {
                        const getIndex = (val) => {
                            if (typeof val === 'string' && val.startsWith('INDEX:')) return parseInt(val.split(':')[1], 10);
                            return -1;
                        };
                        const extractPathFromUrl = (url) => {
                            if (!url) return undefined;
                            try {
                                const urlObj = new URL(url);
                                let p = decodeURIComponent(urlObj.pathname);
                                if (p.startsWith('/')) p = p.substring(1);
                                if (urlObj.hostname === 'storage.googleapis.com') {
                                    const parts = p.split('/');
                                    if (parts.length > 1) { parts.shift(); p = parts.join('/'); }
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
                                annualIncome: member.familyDetails ? member.familyDetails.annualIncome : undefined,
                                memberCount: member.familyDetails ? member.familyDetails.memberCount : undefined,
                                dependentCount: member.familyDetails ? member.familyDetails.dependentCount : undefined,
                                rationCardNumber: member.rationCard ? member.rationCard.number : undefined,
                                epicNumber: clean(fm.epicNumber),
                                voterName: clean(fm.voterName),
                                pollingBooth: clean(fm.pollingBooth),
                                photo: resolveFile(fm.photo, 'familyMemberPhotos', photoIndex),
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

            const updatedMember = await member.save(opts);

            const existingDependents = await Member.find({ headOfFamily: member._id }).session(session);

            if (updatedMember.familyMembers) {
                const matchedDependentIds = new Set();
                for (const fm of updatedMember.familyMembers) {
                    try {
                        let dependentDoc = existingDependents.find(d => d.name === fm.name && d.relationToHead === fm.relation);

                        if (dependentDoc) {
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

                            await dependentDoc.save(opts);
                        } else {
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
                                address: updatedMember.address,
                                permanentAddress: updatedMember.permanentAddress,
                                casteDetails: updatedMember.casteDetails,
                                headOfFamily: updatedMember._id,
                                relationToHead: fm.relation,
                                maritalStatus: fm.maritalStatus,
                                photoUrl: fm.photo,
                                voterId: {
                                    epicNumber: fm.epicNumber,
                                    nameOnCard: fm.voterName,
                                    pollingBooth: fm.pollingBooth,
                                    fileUrl: fm.voterIdFront
                                },
                                verificationStatus: updatedMember.verificationStatus,
                                familyMembers: []
                            };

                            dependentData.mewsId = await generateMemberId(dependentData);
                            await Member.create([dependentData], opts);
                        }
                    } catch (err) {
                        console.error(`[UPDATE] Error syncing dependent ${fm.name}:`, err.message);
                        throw err;
                    }
                }
                const orphans = existingDependents.filter(d => !matchedDependentIds.has(d._id.toString()));
                if (orphans.length > 0) {
                    const orphanIds = orphans.map(d => d._id);
                    for (const orphan of orphans) {
                        if (orphan.mewsId) await handleIdReuseOnDelete(orphan, opts);
                    }
                    await Member.deleteMany({ _id: { $in: orphanIds } }, opts);
                }
            }

            if (transactionStarted) await session.commitTransaction();

            if (member.verificationStatus === 'ACTIVE' && member.mewsId) {
                sendRegistrationNotification(member).catch(err => console.error("Notification Error:", err));
            }

            await updatedMember.populate([
                { path: 'address.district' }, { path: 'address.mandal' }, { path: 'address.village' }, { path: 'address.constituency' },
                { path: 'permanentAddress.district' }, { path: 'permanentAddress.mandal' }, { path: 'permanentAddress.village' }, { path: 'permanentAddress.constituency' }
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
            const opts = session ? { session } : undefined;
            
            // 1. Add Head's ID to pool
            await handleIdReuseOnDelete(member, opts);

            // 2. Find and handle dependents
            const dependents = await Member.find({ headOfFamily: member._id }).session(session);
            for (const dep of dependents) {
                await handleIdReuseOnDelete(dep, opts);
            }
            
            // 3. Delete dependents
            if (dependents.length > 0) {
                await Member.deleteMany({ headOfFamily: member._id }, opts);
                console.log(`[DELETE] Deleted ${dependents.length} dependents for member ${member._id}`);
            }

            // 4. Delete associated user accounts
            const User = require('../models/User');
            await User.deleteMany({
                $or: [
                    { memberId: member._id },
                    { username: member.mewsId },
                    { username: member.mobileNumber },
                    { memberId: { $in: dependents.map(d => d._id) } },
                    { username: { $in: dependents.map(d => d.mewsId).filter(id => id) } }
                ]
            }, opts);

            // 5. Delete the head member
            await member.deleteOne(opts);
            console.log(`[DELETE] Member ${member._id} (${member.name}) and their user account(s) deleted.`);

            if (transactionStarted) await session.commitTransaction();
            res.json({ message: 'Member, dependents, and associated administrative accounts removed' });
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
    if (field === 'voterId') {
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
            message: `This ${field === 'voterId' ? 'Voter ID' : (field === 'rationCard' ? 'Ration Card' : (field === 'mobileNumber' ? 'Mobile Number' : 'Community Certificate Number'))} is already registered.`
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
    // getMemberStats - was missing in some views but I'll add it if it was there
    getMemberStats
};
