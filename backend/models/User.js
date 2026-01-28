const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    mobileNumber: {
        type: String,
        trim: true,
        unique: true, // Optional: if you want unique mobile numbers for admins
        sparse: true // Allows null/undefined to coexist with unique constraint
    },
    isPhoneVerified: {
        type: Boolean,
        default: false
    },
    passwordHash: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['SUPER_ADMIN', 'STATE_ADMIN', 'DISTRICT_ADMIN', 'MUNICIPALITY_ADMIN', 'MANDAL_ADMIN', 'VILLAGE_ADMIN', 'INSTITUTION'],
        required: true
    },
    // Link to the specific location they manage
    assignedLocation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location'
    },
    // For Institution logins
    institutionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Institution'
    },
    // For admins promoted from members
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    twoFactorEnabled: {
        type: Boolean,
        default: false
    },
    // OTP Fields for Admin Login
    otpHash: String,
    otpExpires: Date,
    otpLastSent: Date
}, {
    timestamps: true
});

module.exports = mongoose.model('User', UserSchema);
