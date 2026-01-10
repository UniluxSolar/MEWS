const mongoose = require('mongoose');

const MemberSchema = new mongoose.Schema({
    // A. Basic Details
    surname: { type: String, required: true },
    name: { type: String, required: true },
    fatherName: { type: String },
    dob: { type: Date },
    age: { type: Number },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    occupation: { type: String }, // New Field
    jobSector: { type: String },
    jobOrganization: { type: String },
    jobDesignation: { type: String },
    educationLevel: { type: String },
    mobileNumber: { type: String }, // Made optional per request for testing
    bloodGroup: { type: String },
    email: { type: String },
    alternateMobile: { type: String },
    aadhaarNumber: { type: String, unique: true, sparse: true }, // Sparse allows multiple documents to have no value

    // B. Address Details
    address: {
        houseNumber: String,
        street: String,
        village: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
        mandal: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
        district: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
        constituency: String, // New Field
        pinCode: String,
        state: String, // Added state field
        residencyType: String // e.g., Owned, Rented
    },

    permanentAddress: {
        houseNumber: String,
        street: String,
        village: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
        mandal: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
        district: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
        constituency: String, // New Field
        pinCode: String,
        landmark: String
    },

    // C. Caste & Community
    casteDetails: {
        caste: String,
        subCaste: String,
        communityCertNumber: String,
        certificateUrl: String // File upload
    },

    // D. Marriage & Partner
    maritalStatus: { type: String, enum: ['Unmarried', 'Married', 'Widowed', 'Divorced'] },
    partnerDetails: {
        name: String,
        caste: String,
        subCaste: String,
        isInterCaste: Boolean,
        marriageCertNumber: String,
        certificateUrl: String, // File upload
        marriageDate: Date
    },

    // E. Family & Economic
    familyDetails: {
        fatherOccupation: String,
        motherOccupation: String,
        annualIncome: String,
        memberCount: Number,
        dependentCount: Number,
        rationCardType: String
    },

    // F. Ration Card
    rationCard: {
        number: { type: String, default: '' },
        type: { type: String, default: '' },
        holderName: { type: String, default: '' },
        fileUrl: { type: String, default: '' }
    },

    // G. Voter ID
    voterId: {
        epicNumber: { type: String, default: '' },
        nameOnCard: { type: String, default: '' },
        pollingBooth: { type: String, default: '' },
        fileUrl: { type: String, default: '' },
        backFileUrl: { type: String, default: '' }
    },

    // H. Bank Account
    bankDetails: {
        bankName: { type: String, default: '' },
        branchName: { type: String, default: '' },
        accountNumber: { type: String, default: '' },
        ifscCode: { type: String, default: '' },
        holderName: { type: String, default: '' },
        passbookUrl: { type: String, default: '' }
    },

    // I. Other Docs
    photoUrl: String,
    aadhaarCardUrl: String,
    aadhaarCardBackUrl: String,

    // J. Admin Verification & System Fields
    mewsId: { type: String, unique: true }, // Generated after approval
    verificationStatus: {
        type: String,
        enum: ['PENDING', 'APPROVED_VILLAGE', 'APPROVED_MANDAL', 'ACTIVE', 'REJECTED'],
        default: 'PENDING'
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    adminNotes: String,

    // K. Family Linking
    headOfFamily: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
    relationToHead: { type: String, default: 'Head' }, // 'Head', 'Spouse', 'Son', 'Daughter', etc.

    familyMembers: [{
        relation: { type: String, enum: ['Spouse', 'Son', 'Daughter', 'Father', 'Mother', 'Brother', 'Sister'] }, // Added relation
        maritalStatus: { type: String, enum: ['Unmarried', 'Married', 'Widowed', 'Divorced'] }, // Added maritalStatus
        surname: String,
        name: String,
        fatherName: String,
        dob: Date,
        age: Number,
        gender: String,
        occupation: String,
        mobileNumber: String,
        aadhaarNumber: String,
        annualIncome: String, // Propagated from Head
        memberCount: Number,  // Propagated from Head
        dependentCount: Number, // Propagated from Head

        rationCardNumber: String, // Propagated from Head


        // Voter ID
        epicNumber: String,
        voterName: String,
        pollingBooth: String,

        // Documents (Paths)
        photo: String,
        aadhaarFront: String,
        aadhaarBack: String,
        voterIdFront: String,
        voterIdBack: String,

        // Addresses (Snapshotted from main member)
        presentAddress: {
            houseNumber: String,
            street: String,
            village: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
            mandal: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
            district: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
            constituency: String,
            pinCode: String,
            residencyType: String
        },
        permanentAddress: {
            houseNumber: String,
            street: String,
            village: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
            mandal: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
            district: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
            constituency: String,
            pinCode: String,
            landmark: String
        }
    }],
    // K1. Family Linking End (Already closed in line 165)

    // L. Authentication (OTP)
    // L. Authentication (OTP)
    otpHash: { type: String },
    otpExpires: { type: Date },
    otpLastSent: { type: Date },
    isPhoneVerified: { type: Boolean, default: false }
}, {
    timestamps: true
});

module.exports = mongoose.model('Member', MemberSchema);
