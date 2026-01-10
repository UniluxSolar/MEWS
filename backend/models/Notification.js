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
        enum: ['Job', 'Member', 'Institution', 'Announcement']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
