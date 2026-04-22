const asyncHandler = require('express-async-handler');
const Announcement = require('../models/Announcement');
const Member = require('../models/Member');
const Notification = require('../models/Notification');
const Location = require('../models/Location');

// Helper to process hierarchy and explicitly fetch Users mapped to the resolved locations
const processAndNotifyUsers = async (title, message, attachmentUrls, targetType, targetIds, areaType, createdBy, announcementId, recipientType = 'members') => {
    try {
        let allRecipientIds = new Set();
        const User = require('../models/User');
        const Member = require('../models/Member');
        const Location = require('../models/Location');
        const Notification = require('../models/Notification');

        // MODE 1: Direct Selection of Members (Custom Audience)
        if ((targetType === 'MEMBERS' || targetType === 'members') && targetIds && targetIds.length > 0) {
            // Fetch users/members directly by ID (Could be User ID or Member ID)
            const [users, uByMem] = await Promise.all([
                User.find({ _id: { $in: targetIds } }).select('_id'),
                User.find({ memberId: { $in: targetIds } }).select('_id')
            ]);
            users.forEach(u => allRecipientIds.add(u._id.toString()));
            uByMem.forEach(u => allRecipientIds.add(u._id.toString()));
        } 
        // MODE 2: Location-Based Targeting (State, District, Mandal, etc.)
        else {
            let validLocationIds = [];
            
            // Step 1: Resolve Target Locations
            if (targetType === 'STATE' || targetType === 'state') {
                // Global visibility - fetch all relevant recipients based on type
                if (recipientType === 'admins' || recipientType === 'both') {
                    const admins = await User.find({ role: { $ne: 'MEMBER' } }).select('_id');
                    admins.forEach(u => allRecipientIds.add(u._id.toString()));
                }
                if (recipientType === 'members' || recipientType === 'both') {
                    // For state-wide member broadcast, we typically target all Users with MEMBER role or tied to a Member
                    const members = await User.find({ role: 'MEMBER' }).select('_id');
                    members.forEach(u => allRecipientIds.add(u._id.toString()));
                }
            } else {
                if (targetIds && targetIds.length > 0) {
                    const locations = await Location.find({
                        $or: [
                            { _id: { $in: targetIds } },
                            { 'ancestors.locationId': { $in: targetIds } }
                        ]
                    }).select('_id');
                    validLocationIds = locations.map(loc => loc._id);
                } else {
                    return; // No target specified
                }

                if (recipientType === 'admins' || recipientType === 'both') {
                    // Direct Admin Accounts
                    const admins = await User.find({ 
                        assignedLocation: { $in: validLocationIds },
                        role: { $ne: 'MEMBER' }
                    }).select('_id');
                    admins.forEach(u => allRecipientIds.add(u._id.toString()));
                } 
                
                if (recipientType === 'members' || recipientType === 'both') {
                    // This is the CRITICAL part: Find USERS who live in these locations
                    // They might be linked via req.user.address in User model or memberId
                    const [membersInArea, usersWithRegion] = await Promise.all([
                        Member.find({
                            $or: [
                                { 'address.village': { $in: validLocationIds } },
                                { 'address.mandal': { $in: validLocationIds } },
                                { 'address.district': { $in: validLocationIds } },
                                { 'address.municipality': { $in: validLocationIds } },
                                { 'address.ward': { $in: validLocationIds } }
                            ]
                        }).select('_id'),
                        User.find({
                            role: 'MEMBER',
                            $or: [
                                { 'address.village': { $in: validLocationIds } },
                                { 'address.mandal': { $in: validLocationIds } },
                                { 'address.district': { $in: validLocationIds } }
                            ]
                        }).select('_id')
                    ]);

                    usersWithRegion.forEach(u => allRecipientIds.add(u._id.toString()));

                    // Also find Users linked to the found Members
                    if (membersInArea.length > 0) {
                        const linkedUsers = await User.find({ 
                            memberId: { $in: membersInArea.map(m => m._id) } 
                        }).select('_id');
                        linkedUsers.forEach(u => allRecipientIds.add(u._id.toString()));
                    }
                }
            }
        }

        if (allRecipientIds.size > 0) {
            const notifications = Array.from(allRecipientIds).map(recipientId => ({
                recipient: recipientId,
                type: 'alert',
                title: title,
                message: message.replace(/<[^>]*>?/gm, '').substring(0, 500),
                attachmentUrls: attachmentUrls,
                targetType: targetType,
                targetIds: targetIds,
                areaType: areaType,
                createdBy: createdBy,
                relatedId: announcementId,
                status: 'SENT',
                notificationType: 'ANNOUNCEMENT',
                relatedModel: 'Announcement'
            }));

            await Notification.insertMany(notifications, { ordered: false });
            console.log(`[NOTIFY] Created ${notifications.length} persistent notifications for announcement ${announcementId}`);
        }
    } catch (error) {
        console.error("Failed to process recipient list or insert notifications:", error);
    }
};

const createAnnouncement = asyncHandler(async (req, res) => {
    // Read from both old and new payload keys for safety
    const title = req.body.title || req.body.subject;
    const message = req.body.message || req.body.body;
    let targetType = req.body.targetType ? req.body.targetType.toUpperCase() : 'STATE';

    const rawTargetIds = req.body.targetIds || req.body.selectedTargets;
    let targetIds = rawTargetIds ? (typeof rawTargetIds === 'string' ? JSON.parse(rawTargetIds) : rawTargetIds) : [];

    // IMPORTANT: Identify Global Admins for targeting flexibility
    const isGlobalAdmin = req.user.role === 'SUPER_ADMIN' || req.user.role === 'STATE_ADMIN';
    if (isGlobalAdmin && (req.body.targetScope === 'whole' || req.body.targetScope === 'STATE')) {
        targetType = 'STATE';
    }

    // Fix: Local Jurisdictional Validation
    // Enforcement: Admins can only target their own jurisdiction or descendants.
    if (!isGlobalAdmin && req.user.assignedLocation) {
        const adminLocId = req.user.assignedLocation.toString();
        
        if (req.body.targetScope === 'whole' || req.body.targetScope === 'STATE') {
            // Force targeting to the admin's own assigned location
            targetIds = [adminLocId];
            // Normalize targetType based on admin role
            const roleBase = req.user.role.replace('_ADMIN', '').toLowerCase();
            targetType = roleBase === 'super' || roleBase === 'state' ? 'STATE' : roleBase.toUpperCase();
        } else if (targetType !== 'MEMBERS') {
            // "Selected" scope for locations: Verify selected targets are descendants of the admin's location
            const validDescendants = await require('../models/Location').find({
                $or: [
                    { _id: req.user.assignedLocation },
                    { 'ancestors.locationId': req.user.assignedLocation }
                ]
            }).select('_id');
            const validDescendantIds = validDescendants.map(d => d._id.toString());
            
            // Filter targetIds to only include valid descendant IDs
            targetIds = targetIds.filter(id => validDescendantIds.includes(id.toString()));
            
            // Fallback: If no valid targets left, default to assigned location
            if (targetIds.length === 0) {
                targetIds = [adminLocId];
            }
        }
    }

    const areaType = req.body.areaType ? req.body.areaType.toUpperCase() : 'RURAL';
    const scheduleType = req.body.scheduleType === 'SCHEDULED' || req.body.schedule === 'later' ? 'SCHEDULED' : 'IMMEDIATE';
    const scheduledAt = req.body.scheduledAt || req.body.scheduledDate || null;

    if (!title || !message || !targetType) {
        res.status(400);
        throw new Error('Please fill in all required fields');
    }

    let attachmentUrls = [];
    if (req.files && req.files.length > 0) {
        attachmentUrls = req.files.map(file => file.path || file.location || file.key);
    }

    const currentStatus = scheduleType === 'SCHEDULED' ? 'SCHEDULED' : 'SENT';

    // Safe DB Value mapping for targetType enum ['villages', 'mandals', 'districts', 'constituencies', 'members', 'state', 'occupation']
    let dbTargetType = targetType.toLowerCase();
    if (dbTargetType === 'wards' || dbTargetType === 'municipalities' || dbTargetType === 'ward' || dbTargetType === 'municipality') {
        dbTargetType = 'villages'; // Enum failsafe mapping
    } else if (dbTargetType !== 'state' && !dbTargetType.endsWith('s')) {
        dbTargetType += 's'; // Enum typically expects plural (districts, mandals, villages)
    }

    // Double check valid enums
    const validEnums = ['villages', 'mandals', 'districts', 'constituencies', 'members', 'state', 'occupation'];
    if (!validEnums.includes(dbTargetType)) {
         dbTargetType = 'districts'; // Failsafe
    }

    const announcement = await require('../models/Announcement').create({
        subject: title, 
        body: message,  
        scope: targetType === 'STATE' ? 'whole' : 'selected',
        targetType: dbTargetType,
        targetDescription: req.body.targetDescription || targetType,
        selectedTargets: targetIds,
        sender: req.user._id,
        senderRole: req.user.role,
        status: currentStatus.toLowerCase(),
        scheduledFor: scheduledAt,
        areaType: areaType.toLowerCase(),
        recipientType: req.body.recipientType || 'members',
        attachments: attachmentUrls
    });

    if (currentStatus === 'SENT') {
        const effectiveRecipientType = req.body.recipientType || announcement.recipientType || 'members';
        await processAndNotifyUsers(title, message, attachmentUrls, targetType, targetIds, areaType, req.user._id, announcement._id, effectiveRecipientType);
    }

    res.status(201).json({ message: "Announcement sent successfully", announcement });
});

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Private
const getAnnouncements = asyncHandler(async (req, res) => {
    let query = {};
    const userRole = (req.user.role || '').toString().trim().toUpperCase();
    const isGlobalAdmin = ['SUPER_ADMIN', 'STATE_ADMIN'].includes(userRole);
    // Global admins see everything
    if (!isGlobalAdmin) {
        // Build a list of location IDs relevant to this user
        let relevantLocationIds = [];
        if (req.user.assignedLocation) {
            relevantLocationIds.push(req.user.assignedLocation.toString());
            
            // Fetch the location to get its ancestors
            const location = await Location.findById(req.user.assignedLocation);
            if (location && location.ancestors) {
                location.ancestors.forEach(anc => {
                    relevantLocationIds.push(anc.locationId.toString());
                });
            }
        }

        query = {
            $or: [
                { sender: req.user._id }, // Announcements sent by the user
                { scope: 'whole' },       // State-wide announcements
                { selectedTargets: { $in: relevantLocationIds } } // Targeted at user's location or its parents
            ]
        };
    }

    const announcements = await Announcement.find(query)
        .sort({ createdAt: -1 })
        .populate('sender', 'name surname username role assignedLocation');

    res.json(announcements);
});

module.exports = {
    createAnnouncement,
    getAnnouncements
};
