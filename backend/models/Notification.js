const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['job', 'application', 'alert', 'success', 'info'],
        default: 'info'
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    relatedId: {
        type: mongoose.Schema.Types.ObjectId, // Optional: Link to Job, Application, etc.
        refPath: 'relatedModel'
    },
    relatedModel: {
        type: String,
        enum: ['Job', 'Member', 'Institution', 'Announcement', 'FundRequest']
    },
    attachments: [{
        type: String
    }],
    targetAudience: {
        type: String
    },
    mandal_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location'
    },
    village_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location'
    },
    municipality_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location'
    },
    ward_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location'
    },
    attachmentUrls: [{ type: String }],
    targetType: { type: String },
    targetIds: [{ type: mongoose.Schema.Types.Mixed }],
    areaType: { type: String },
    status: { type: String, enum: ['SENT', 'SCHEDULED'], default: 'SENT' },
    notificationType: { type: String, enum: ['USER_REQUEST', 'ANNOUNCEMENT', 'SYSTEM'], default: 'SYSTEM' }
}, {
    timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
