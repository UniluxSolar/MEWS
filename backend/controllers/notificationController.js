const Notification = require('../models/Notification');
const Announcement = require('../models/Announcement');
const FundRequest = require('../models/FundRequest');
const Member = require('../models/Member');
const Institution = require('../models/Institution');
const Location = require('../models/Location');
const asyncHandler = require('express-async-handler');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
    const userRole = (req.user.role || '').toString().trim().toUpperCase().replace(/-/g, '_');
    const userId = req.user._id;
    const memberId = req.loggedInMemberId || userId;
    
    // 1. Resolve Location IDs for regional/targeted filtering
    let relevantLocationIds = [];

    // Handle high-level admins (Broad visibility)
    const isGlobalAdmin = ['SUPER_ADMIN', 'STATE_ADMIN', 'STATE-ADMIN'].includes(userRole);
    
    if (isGlobalAdmin) {
       console.log('[NOTIF] Global Admin detected');
    } else if (req.user.assignedLocation) {
        relevantLocationIds.push(req.user.assignedLocation.toString());
        
        const descendants = await Location.find({ 
            $or: [
                { _id: req.user.assignedLocation },
                { "ancestors.locationId": req.user.assignedLocation }
            ]
        }).select('_id');
        
        descendants.forEach(d => relevantLocationIds.push(d._id.toString()));
        console.log(`[NOTIF] Resolved ${relevantLocationIds.length} descendant locations`);

        const location = await Location.findById(req.user.assignedLocation);
        if (location && location.ancestors) {
            location.ancestors.forEach(anc => {
                if (anc.locationId) relevantLocationIds.push(anc.locationId.toString());
            });
        }
    }
    
    // Fallback/Supplement from address (robust for Members and elevated roles)
    const addr = req.user.address || {};
    if (addr.village) relevantLocationIds.push(addr.village.toString());
    if (addr.mandal) relevantLocationIds.push(addr.mandal.toString());
    if (addr.district) relevantLocationIds.push(addr.district.toString());
    
    if (req.user.mandal_id) relevantLocationIds.push(req.user.mandal_id.toString());
    if (req.user.village_id) relevantLocationIds.push(req.user.village_id.toString());

    // Include IDs for direct targeting
    relevantLocationIds.push(userId.toString());
    relevantLocationIds.push(memberId.toString());

    // Deduplicate
    const normalizedIds = [];
    const mongoose = require('mongoose');
    relevantLocationIds.forEach(id => {
        if (!id) return;
        normalizedIds.push(id.toString());
        try { normalizedIds.push(new mongoose.Types.ObjectId(id)); } catch (e) {}
    });
    relevantLocationIds = [...new Set(normalizedIds)];

    // 2. Build Query
    let query = {};
    if (isGlobalAdmin) {
        // High-level admins see everything matching these general types or models
        query = {
            $or: [
                { recipient: userId },
                { recipient: memberId },
                { notificationType: { $in: ['ANNOUNCEMENT', 'SYSTEM', 'USER_REQUEST'] } },
                { type: { $in: ['member', 'application', 'job', 'success', 'info', 'alert'] } },
                { relatedModel: { $in: ['Announcement', 'FundRequest', 'Member', 'Institution'] } }
            ]
        };
    } else {
        const regionalFilter = {
            $or: [
                { district_id: { $in: relevantLocationIds } },
                { mandal_id: { $in: relevantLocationIds } },
                { village_id: { $in: relevantLocationIds } },
                { municipality_id: { $in: relevantLocationIds } },
                { ward_id: { $in: relevantLocationIds } },
                { targetAudience: { $in: relevantLocationIds } },
                { targetIds: { $in: relevantLocationIds } },
                { recipient: userId }
            ]
        };

        query = {
            $or: [
                { recipient: userId },
                { notificationType: 'SYSTEM' },
                { $and: [{ type: { $in: ['member', 'application', 'job', 'success', 'info', 'alert'] } }, regionalFilter] },
                { $and: [{ notificationType: 'USER_REQUEST' }, regionalFilter] },
                { 
                    $and: [
                        { notificationType: 'ANNOUNCEMENT' },
                        { $or: [
                            { targetType: { $in: ['STATE', 'state', 'DISTRICT', 'district'] } },
                            { targetIds: { $in: relevantLocationIds } },
                            { targetAudience: { $in: relevantLocationIds } },
                            { scope: 'whole' }
                        ]}
                    ]
                }
            ]
        };
    }

    console.log('[NOTIF] Querying Notifications...');
    const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .populate({
            path: 'relatedId',
            strictPopulate: false,
            populate: {
                path: 'beneficiary',
                select: 'name surname photo'
            }
        });
    console.log(`[NOTIF] Found ${notifications.length} persistent notifications`);

    // 3. Fetch Relevant Announcements dynamically
    let announcements = [];
    try {
        let annQuery = isGlobalAdmin ? { status: { $ne: 'draft' } } : {
            status: { $in: ['sent', 'SENT'] },
            $or: [
                { scope: 'whole' },
                { selectedTargets: { $in: relevantLocationIds } },
                { targetIds: { $in: relevantLocationIds } },
                { sender: userId }
            ]
        };

        announcements = await Announcement.find(annQuery)
            .sort({ createdAt: -1 })
            .limit(200) 
            .populate('sender', 'name surname username role');
        console.log(`[NOTIF] Found ${announcements.length} dynamic announcements`);
    } catch (error) {
        console.error("[NOTIF] Announcement fetch failed:", error.message);
    }

    // 4. Merge (Avoid Duplicates)
    const mergedNotifications = [...notifications];
    const existingAnnIds = new Set(
        notifications.filter(n => n.relatedModel === 'Announcement').map(n => (n.relatedId?._id || n.relatedId || '').toString())
    );
    
    announcements.forEach(ann => {
        if (existingAnnIds.has(ann._id.toString())) return;
        mergedNotifications.push({
            _id: ann._id,
            isVirtual: true,
            recipient: userId,
            type: 'alert',
            title: ann.subject || ann.title || 'Official Announcement',
            message: ann.body || ann.message || '',
            isRead: false,
            relatedId: ann,
            relatedModel: 'Announcement',
            createdAt: ann.createdAt || new Date(),
            notificationType: 'ANNOUNCEMENT',
            senderInfo: ann.sender ? `${ann.sender.name || ann.sender.username} (${ann.sender.role || 'Staff'})` : 'System'
        });
    });

    const finalNotifications = [...mergedNotifications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // ALWAYS include system status message for debugging
    finalNotifications.unshift({
        _id: 'status-' + Date.now(),
        title: 'Notification System Online',
        message: `Active. [Audience IDs: ${relevantLocationIds.length}] [DB Notifications: ${notifications.length}] [Announcements: ${announcements.length}].`,
        type: 'info',
        notificationType: 'SYSTEM',
        isRead: false,
        createdAt: new Date()
    });

    res.json(finalNotifications);
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
    let notification = await Notification.findById(req.params.id);

    // [VIRTUAL ANNOUNCEMENT SUPPORT]
    // If notification not found, check if the ID belongs to an Announcement (virtual notification)
    if (!notification) {
        const announcement = await Announcement.findById(req.params.id);
        if (announcement) {
            // Create a persistent Notification record to store the 'read' state for this user
            notification = await Notification.create({
                recipient: req.user._id,
                type: 'alert',
                title: announcement.subject,
                message: announcement.body,
                relatedId: announcement._id,
                relatedModel: 'Announcement',
                notificationType: 'ANNOUNCEMENT',
                isRead: true
            });
            return res.json(notification);
        }
    }

    if (notification) {
        // Security check: only the recipient can mark as read
        if (notification.recipient.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized');
        }

        notification.isRead = true;
        const updatedNotification = await notification.save();
        res.json(updatedNotification);
    } else {
        res.status(404);
        throw new Error('Notification not found');
    }
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = asyncHandler(async (req, res) => {
    await Notification.updateMany(
        { recipient: req.user._id, isRead: false },
        { $set: { isRead: true } }
    );
    res.json({ message: 'All notifications marked as read' });
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.id);

    if (notification) {
        if (notification.recipient.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized');
        }

        await notification.deleteOne();
        res.json({ message: 'Notification removed' });
    } else {
        res.status(404);
        throw new Error('Notification not found');
    }
});

// Internal helper to create notification
const createNotification = async (recipientId, type, title, message, relatedId = null, relatedModel = null, targetAudience = null, mandal_id = null, notificationType = 'SYSTEM', village_id = null, municipality_id = null, ward_id = null) => {
    try {
        await Notification.create({
            recipient: recipientId,
            type,
            title,
            message,
            relatedId,
            relatedModel,
            targetAudience,
            mandal_id,
            village_id,
            municipality_id,
            ward_id,
            notificationType
        });
    } catch (error) {
        console.error('Failed to create notification:', error);
    }
};

module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification
};
