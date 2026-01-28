const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Can refer to 'Admin' or 'Member' depending on auth setup
        required: true
    },
    action: {
        type: String,
        required: true,
        uppercase: true // e.g., 'CREATE', 'UPDATE', 'DELETE', 'PUBLISH', 'UNPUBLISH'
    },
    module: {
        type: String,
        required: true, // e.g., 'CAROUSEL', 'MEMBER', 'DONATION'
    },
    details: {
        type: String,
        required: true
    },
    ip: {
        type: String
    },
    userAgent: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
