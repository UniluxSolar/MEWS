const asyncHandler = require('express-async-handler');
const Announcement = require('../models/Announcement');

// @desc    Create a new announcement
// @route   POST /api/announcements
// @access  Private (Admin only)
const createAnnouncement = asyncHandler(async (req, res) => {
    const { subject, body, targetScope, targetType, selectedTargets, schedule, scheduledDate, status } = req.body;

    if (!subject || !body || !targetScope || !targetType) {
        res.status(400);
        throw new Error('Please fill in all required fields');
    }

    // Process attachments if any
    let attachmentPaths = [];
    if (req.files && req.files.length > 0) {
        attachmentPaths = req.files.map(file => file.path || file.location || file.key);
    }

    const announcement = await Announcement.create({
        subject,
        body,
        scope: targetScope,
        targetType,
        selectedTargets: targetScope === 'whole' ? [] : (typeof selectedTargets === 'string' ? JSON.parse(selectedTargets) : selectedTargets),
        sender: req.user._id,
        senderRole: req.user.role,
        status: status || (schedule === 'later' ? 'scheduled' : 'sent'),
        scheduledFor: (status === 'scheduled' || schedule === 'later') ? scheduledDate : null,
        attachments: attachmentPaths
    });

    res.status(201).json(announcement);
});

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Private
const getAnnouncements = asyncHandler(async (req, res) => {
    // Optionally filter by sender or visibility logic here
    // For now, return all announcements sorted by date
    const announcements = await Announcement.find({})
        .sort({ createdAt: -1 })
        .populate('sender', 'username role');

    res.json(announcements);
});

module.exports = {
    createAnnouncement,
    getAnnouncements
};
