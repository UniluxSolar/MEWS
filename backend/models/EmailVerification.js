const mongoose = require('mongoose');

const EmailVerificationSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    },
    code: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: true
    },
    attempts: {
        type: Number,
        default: 0
    },
    verified: {
        type: Boolean,
        default: false
    },
    lastSentAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// TTL index to auto-delete expired records after 10 minutes
EmailVerificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 });

module.exports = mongoose.model('EmailVerification', EmailVerificationSchema);
