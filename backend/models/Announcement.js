const mongoose = require('mongoose');

const announcementSchema = mongoose.Schema({
    subject: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    scope: {
        type: String,
        enum: ['whole', 'selected'],
        required: true
    },
    targetType: {
        type: String,
        enum: ['villages', 'mandals', 'districts', 'members', 'state', 'occupation'],
        required: true
    },
    targetDescription: {
        type: String
    },
    selectedTargets: [{
        type: mongoose.Schema.Types.Mixed, // Can be ObjectIds for locations/members
        default: []
    }],
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    senderRole: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['sent', 'draft', 'scheduled'],
        default: 'sent'
    },
    scheduledFor: {
        type: Date
    },
    attachments: [{
        type: String // Storage path or URL
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Announcement', announcementSchema);
