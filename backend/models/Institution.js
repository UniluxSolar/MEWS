const mongoose = require('mongoose');

const InstitutionSchema = new mongoose.Schema({
    type: {
        type: String, // e.g., 'Hospital', 'School', etc.
        required: true
    },
    name: { type: String, required: true },
    ownerName: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    whatsappNumber: { type: String },

    // Address
    fullAddress: { type: String, required: true },
    googleMapsLink: { type: String },

    // Services & details
    mewsDiscountPercentage: { type: String }, // stored as string e.g. "10", "15-20"
    servicesOffered: [String],

    institutionPhotos: [String], // Array of URLs or paths

    // OTP Fields for Login
    otpHash: { type: String },
    otpExpires: { type: Date },
    otpLastSent: { type: Date },

    // MPIN Fields
    mpinHash: { type: String },
    mpinDigest: { type: String, select: false }, // SHA256 of MPIN for lookup
    mpinLockedUntil: { type: Date },
    mpinFailedAttempts: { type: Number, default: 0 },
    mpinCreated: { type: Boolean, default: false },
    isMpinEnabled: { type: Boolean, default: false },
    deviceId: { type: String },

    // Verification
    verificationStatus: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'PENDING'
    },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: true
});

module.exports = mongoose.model('Institution', InstitutionSchema);
