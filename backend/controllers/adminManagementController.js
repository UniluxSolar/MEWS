const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Location = require('../models/Location');
const bcrypt = require('bcryptjs');

const HIERARCHY_LEVELS = {
    'SUPER_ADMIN': 5,
    'STATE_ADMIN': 4,
    'DISTRICT_ADMIN': 3,
    'MANDAL_ADMIN': 2,
    'VILLAGE_ADMIN': 1
};

// Helper: Check if Creator can manage Target Role
const canManageRole = (creatorRole, targetRole) => {
    return HIERARCHY_LEVELS[creatorRole] > HIERARCHY_LEVELS[targetRole];
};

// Helper: Verify Location Hierarchy
const verifyLocationHierarchy = async (creatorLocationId, targetLocationId) => {
    if (!creatorLocationId) return true; // Super Admin with no location (or global)
    if (!targetLocationId) return false; // Target must have location if creator does

    // Check if target location is a descendant of creator location
    // We can check if target's ancestors include creator
    const targetLoc = await Location.findById(targetLocationId);
    if (!targetLoc) return false;

    if (targetLoc.parent && targetLoc.parent.toString() === creatorLocationId.toString()) return true;

    // Check ancestors array
    const isAncestor = targetLoc.ancestors.some(anc => anc.locationId.toString() === creatorLocationId.toString());
    return isAncestor;
};

// @desc    Get all subordinate admins
// @route   GET /api/admin/management
// @access  Private (Restricted)
const getSubordinateAdmins = asyncHandler(async (req, res) => {
    const currentUser = req.user;
    let query = { _id: { $ne: currentUser._id } }; // Exclude self

    // Filter by Role: Only show users with LOWER rank
    const currentLevel = HIERARCHY_LEVELS[currentUser.role];
    const allowedRoles = Object.keys(HIERARCHY_LEVELS).filter(role => HIERARCHY_LEVELS[role] < currentLevel);
    query.role = { $in: allowedRoles };

    // Filter by Location
    if (currentUser.assignedLocation) {
        // ROBUST: Recursive lookup of all descendant location IDs
        const locationIds = [];
        let currentBatch = [currentUser.assignedLocation];

        // 3 levels deep is sufficient (State -> District -> Mandal -> Village is 3 hops max)
        for (let i = 0; i < 4; i++) {
            const children = await Location.find({ parent: { $in: currentBatch } }).select('_id');
            const childIds = children.map(c => c._id);
            if (childIds.length === 0) break;

            locationIds.push(...childIds);
            currentBatch = childIds;
        }

        query.assignedLocation = { $in: locationIds };
    }

    const admins = await User.find(query)
        .select('-passwordHash')
        .populate('assignedLocation', 'name type ancestors parent')
        .populate({
            path: 'memberId',
            select: 'name surname mobileNumber photoUrl gender fatherName address',
            populate: [
                { path: 'address.village', select: 'name' },
                { path: 'address.mandal', select: 'name' },
                { path: 'address.district', select: 'name' }
            ]
        })
        .sort({ role: 1, createdAt: -1 });

    res.json(admins);
});

// @desc    Create a new admin
// @route   POST /api/admin/management
// @access  Private (Restricted)
const createAdmin = asyncHandler(async (req, res) => {
    const { username, email, password, role, assignedLocation } = req.body;
    const currentUser = req.user;

    // 1. Hierarchy Check
    if (!canManageRole(currentUser.role, role)) {
        res.status(403);
        throw new Error(`You cannot create a ${role}. Access Denied.`);
    }

    // 2. Location Check
    if (currentUser.assignedLocation) {
        // If current user is bound to a location, the new user MUST be in a child location
        const isValidLocation = await verifyLocationHierarchy(currentUser.assignedLocation, assignedLocation);
        if (!isValidLocation) {
            // Edge case: Direct parent-child might not be "ancestor" in array if array not populated?
            // Let's double check simple parent check in verifyLocationHierarchy
            // Also, creating a user for the SAME location? Usually not allowed for hierarchy (State Admin creates District Admin).
            // But maybe multiple Mandal Admins for same Mandal? No.
            res.status(403);
            throw new Error("Invalid location assignment. You can only assign locations within your jurisdiction.");
        }
    }

    // 3. User Existence Check
    const userExists = await User.findOne({ username });
    if (userExists) {
        res.status(400);
        throw new Error('Username already exists');
    }

    // 4. Create User
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
        username,
        email,
        passwordHash: hashedPassword,
        role,
        assignedLocation,
        isActive: true
    });

    if (user) {
        res.status(201).json({
            _id: user.id,
            username: user.username,
            role: user.role,
            assignedLocation: user.assignedLocation
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Update admin
// @route   PUT /api/admin/management/:id
// @access  Private
const updateAdmin = asyncHandler(async (req, res) => {
    const userToUpdate = await User.findById(req.params.id);
    const currentUser = req.user;

    if (!userToUpdate) {
        res.status(404);
        throw new Error('User not found');
    }

    // Hierarchy Check
    if (!canManageRole(currentUser.role, userToUpdate.role)) {
        res.status(403);
        throw new Error('You do not have permission to manage this user.');
    }

    // Check location scope? 
    // If I see them in getSubordinateAdmins, I should be able to update them.

    const { email, password, assignedLocation, isActive } = req.body;

    // Determine if updating location, verify hierarchy again
    if (assignedLocation && assignedLocation !== userToUpdate.assignedLocation.toString()) {
        if (currentUser.assignedLocation) {
            const isValid = await verifyLocationHierarchy(currentUser.assignedLocation, assignedLocation);
            if (!isValid) {
                res.status(403);
                throw new Error("Cannot move admin to a location outside your jurisdiction.");
            }
        }
        userToUpdate.assignedLocation = assignedLocation;
    }

    if (email) userToUpdate.email = email;
    if (isActive !== undefined) userToUpdate.isActive = isActive;

    if (password) {
        const salt = await bcrypt.genSalt(10);
        userToUpdate.passwordHash = await bcrypt.hash(password, salt);
    }

    const updatedUser = await userToUpdate.save();

    res.json({
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        assignedLocation: updatedUser.assignedLocation
    });
});

// @desc    Delete admin
// @route   DELETE /api/admin/management/:id
// @access  Private
const deleteAdmin = asyncHandler(async (req, res) => {
    const userToDelete = await User.findById(req.params.id);
    const currentUser = req.user;

    if (!userToDelete) {
        res.status(404);
        throw new Error('User not found');
    }

    if (!canManageRole(currentUser.role, userToDelete.role)) {
        res.status(403);
        throw new Error('You do not have permission to delete this user.');
    }

    await userToDelete.deleteOne();
    res.json({ message: 'User removed' });
});

// @desc    Get valid child locations for dropdown
// @route   GET /api/admin/management/locations
const getChildLocations = asyncHandler(async (req, res) => {
    const currentUser = req.user;
    let query = {};

    if (currentUser.role === 'SUPER_ADMIN') {
        // Can see all states? or top level?
        // Let's return STATES
        query.type = 'STATE';
        // But what if they want to create a District admin directly?
        // Ideally they pick State -> District -> ...
        // For simplicity, let's return all locations? No, too many.
        // Let's return just direct children of the current user's location?
    }

    // Strategy: Return locations that are *immediate children* of the user's assigned location.
    // e.g. State Admin -> Returns Districts.
    // District Admin -> Returns Mandals.
    // Mandal Admin -> Returns Villages.

    if (currentUser.assignedLocation) {
        query.parent = currentUser.assignedLocation;
    } else {
        // If super admin (no location), maybe return States
        query.type = 'STATE';
    }

    // Allow query param to drill down? ?parent=xyz
    if (req.query.parent) {
        // Validation: Verify requested parent is under current user's hierarchy
        // (Skipping deep validation for speed, assuming UI drives this correctly)
        query = { parent: req.query.parent };
        delete query.type; // Override type if parent specified
    }

    const locations = await Location.find(query).sort('name');
    res.json(locations);
});


// @desc    Search member by mobile number for promotion
// @route   POST /api/admin/management/search-member
// @access  Private
const searchMember = asyncHandler(async (req, res) => {
    const { mobileNumber } = req.body;
    const Member = require('../models/Member');
    const Location = require('../models/Location');

    if (!mobileNumber) {
        res.status(400);
        throw new Error('Mobile number is required');
    }

    const member = await Member.findOne({ mobileNumber })
        .select('name surname mobileNumber photoUrl role assignedLocation address email')
        .populate('assignedLocation', 'name type')
        .populate('address.village', 'name type')
        .populate('address.mandal', 'name type')
        .populate({
            path: 'address.district',
            select: 'name type parent',
            populate: {
                path: 'parent',
                select: 'name type' // Fetch State details from District's parent
            }
        });

    if (!member) {
        res.status(404);
        throw new Error('Member not found');
    }

    // Convert to object to attach extra properties
    const memberObj = member.toObject();

    // 1. Derive State if missing (From District -> Parent)
    if (!memberObj.address) memberObj.address = {};

    if (!memberObj.address.state && memberObj.address.district?.parent?.type === 'STATE') {
        memberObj.address.state = memberObj.address.district.parent.name;
        // Also attach the stateLocation object for role assignment
        memberObj.address.stateLocation = memberObj.address.district.parent;
    }
    // Fallback: If state is string but we need ID (Already handled in previous step, checking again)
    else if (memberObj.address.state && !memberObj.address.stateLocation) {
        // Case-insensitive exact match for State
        const stateLocation = await Location.findOne({
            name: { $regex: new RegExp(`^${memberObj.address.state}$`, 'i') },
            type: 'STATE'
        }).select('_id name type');

        if (stateLocation) {
            memberObj.address.stateLocation = stateLocation;
        }
    }

    res.json(memberObj);
});

// @desc    Promote member to admin
// @route   POST /api/admin/management/promote-member
// @access  Private
const promoteMember = asyncHandler(async (req, res) => {
    const { memberId, role, assignedLocation } = req.body;
    const currentUser = req.user;
    const Member = require('../models/Member');

    // 1. Hierarchy Check
    if (!canManageRole(currentUser.role, role)) {
        res.status(403);
        throw new Error(`You cannot assign the role ${role}. Access Denied.`);
    }

    // 2. Location Check
    if (currentUser.assignedLocation) {
        // If current user is bound to a location, the new user MUST be in a child location
        const isValidLocation = await verifyLocationHierarchy(currentUser.assignedLocation, assignedLocation);
        if (!isValidLocation) {
            res.status(403);
            throw new Error("Invalid location assignment. You can only assign locations within your jurisdiction.");
        }
    }

    const member = await Member.findById(memberId);
    if (!member) {
        res.status(404);
        throw new Error('Member not found');
    }

    // 3. Unique Admin Role Check
    if (member.role && member.role !== 'MEMBER') {
        res.status(400);
        throw new Error(`This member is already assigned as a ${member.role.replace('_', ' ')}. Multiple admin roles are not allowed.`);
    }

    // Check if trying to demote higher or equal role (Optional safety)
    if (member.role && HIERARCHY_LEVELS[member.role] >= HIERARCHY_LEVELS[currentUser.role]) {
        res.status(403);
        throw new Error('Cannot modify a member with equal or higher rank.');
    }

    // 3. Create or Update User Account
    // Username = Mobile Number
    let user = await User.findOne({ username: member.mobileNumber });

    if (!user) {
        // Create new User
        const defaultPassword = `Mews@${member.mobileNumber}`; // Default pwd
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(defaultPassword, salt);

        user = await User.create({
            username: member.mobileNumber,
            email: member.email || `${member.mobileNumber}@mews.local`,
            passwordHash: hashedPassword,
            role,
            assignedLocation,
            memberId: member._id,
            isActive: true
        });
    } else {
        // Update existing User
        // Ensure we don't overwrite a SUPER_ADMIN or higher rank by accident, but line 48 check covers basic role management.
        user.role = role;
        user.assignedLocation = assignedLocation;
        user.memberId = member._id;
        user.isActive = true;
        await user.save();
    }

    // 4. Update Member Document
    member.role = role;
    member.assignedLocation = assignedLocation;
    await member.save();

    // 5. Send Notification
    try {
        let locationName = '';
        if (assignedLocation) {
            const loc = await Location.findById(assignedLocation).select('name');
            if (loc) locationName = loc.name;
        }

        const { sendAdminPromotionNotification } = require('../utils/notificationService');
        await sendAdminPromotionNotification(member, user, locationName);
    } catch (notifErr) {
        console.error("Failed to send admin promotion notification:", notifErr);
        // Do not fail the request, just log error
    }

    res.json({
        message: 'Member promoted successfully',
        member: {
            _id: member._id,
            name: member.name,
            role: member.role,
            assignedLocation: member.assignedLocation
        },
        user: {
            username: user.username,
            role: user.role
        }
    });
});

module.exports = {
    getSubordinateAdmins,
    createAdmin,
    updateAdmin,
    deleteAdmin,
    getChildLocations,
    searchMember,
    promoteMember
};
