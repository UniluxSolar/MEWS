const Member = require('../models/Member');

// @desc    Register a new member (Self or by Admin)
// @route   POST /api/members
// @access  Public / Private (Admin)
const registerMember = async (req, res) => {
    // Extensive validation should happen here or using Zod/Joi middleware
    try {
        const memberData = req.body;

        // Generate a temporary ID or handle this after approval
        // For now, save as PENDING

        const member = await Member.create({
            ...memberData,
            verificationStatus: 'PENDING'
        });

        res.status(201).json(member);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all members (Filtered)
// @route   GET /api/members
// @access  Private (Admins)
const getMembers = async (req, res) => {
    try {
        const { village, mandal, district, status } = req.query;
        let query = {};

        // Role-based filtering constraints
        // If Village Admin, force village filter
        if (req.user.role === 'VILLAGE_ADMIN' && req.user.assignedLocation) {
            query['address.village'] = req.user.assignedLocation;
        }
        // If Mandal Admin, force mandal filter
        else if (req.user.role === 'MANDAL_ADMIN' && req.user.assignedLocation) {
            query['address.mandal'] = req.user.assignedLocation;
        }

        // Apply Filters from query params if allowed
        if (village) query['address.village'] = village;
        if (mandal) query['address.mandal'] = mandal;
        if (district) query['address.district'] = district;
        if (status) query.verificationStatus = status;

        const members = await Member.find(query)
            .populate('address.village', 'name')
            .populate('address.mandal', 'name')
            .populate('address.district', 'name');

        res.status(200).json(members);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Single Member
// @route   GET /api/members/:id
// @access  Private
const getMemberById = async (req, res) => {
    try {
        const member = await Member.findById(req.params.id);
        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }
        res.status(200).json(member);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update Member Status (Approve/Reject)
// @route   PUT /api/members/:id/status
// @access  Private (Admins)
const updateMemberStatus = async (req, res) => {
    const { status, adminNotes } = req.body;

    // Validate status based on role
    // Village Admin can only move to 'APPROVED_VILLAGE' or 'REJECTED'

    try {
        const member = await Member.findById(req.params.id);

        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }

        // Logic for MEWS ID Generation on final approval
        if (status === 'ACTIVE' && member.verificationStatus !== 'ACTIVE') {
            // Generate MEWS ID: Example: TL-HYD-AMR-VIL-0001 (State-Dist-Man-Vil-Seq)
            // Simplified for now:
            member.mewsId = `MEWS-${Date.now()}`;
        }

        member.verificationStatus = status;
        member.adminNotes = adminNotes;
        member.approvedBy = req.user._id;

        await member.save();
        res.status(200).json(member);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    registerMember,
    getMembers,
    getMemberById,
    updateMemberStatus
};
