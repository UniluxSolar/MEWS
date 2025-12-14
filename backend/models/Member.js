const mongoose = require('mongoose');

const MemberSchema = new mongoose.Schema({
    // A. Basic Details
    surname: { type: String, required: true },
    name: { type: String, required: true },
    fatherName: { type: String },
    dob: { type: Date },
    age: { type: Number },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
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
        pinCode: String,
        residencyType: String // e.g., Owned, Rented
    },

    permanentAddress: {
        houseNumber: String,
        street: String,
        village: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
        mandal: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
        district: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
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
    maritalStatus: { type: String, enum: ['Single', 'Married', 'Widowed', 'Divorced'] },
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
        annualIncome: Number,
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
        fileUrl: { type: String, default: '' }
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

    // J. Admin Verification & System Fields
    mewsId: { type: String, unique: true }, // Generated after approval
    verificationStatus: {
        type: String,
        enum: ['PENDING', 'APPROVED_VILLAGE', 'APPROVED_MANDAL', 'ACTIVE', 'REJECTED'],
        default: 'PENDING'
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    adminNotes: String,

}, {
    timestamps: true
});

module.exports = mongoose.model('Member', MemberSchema);
