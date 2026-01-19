const asyncHandler = require('express-async-handler');
const FundRequest = require('../models/FundRequest');
const User = require('../models/User');
const Member = require('../models/Member');
const { createNotification } = require('./notificationController');

// @desc    Create a new fund request (Application)
// @route   POST /api/fund-requests
// @access  Private
const createFundRequest = asyncHandler(async (req, res) => {
    const {
        type,
        studentName,
        institutionName,
        courseName,
        bankName,
        branchName,
        accountNumber,
        ifscCode,
        reason,
        amountRequired
    } = req.body;

    // Map frontend 'type' to Schema 'purpose'
    let purpose = 'Education'; // Default
    if (type === 'education' || type === 'sports' || type === 'coaching') {
        purpose = 'Education';
    } else if (['Medical', 'Emergency', 'Legal', 'Community'].includes(type)) {
        purpose = type;
    }

    const fundRequest = await FundRequest.create({
        purpose,
        amountRequired: amountRequired || 50000,
        description: reason || `Application for ${type} scholarship`,
        courseName,
        beneficiary: req.user._id, // The logged-in member
        requestedBy: req.user._id, // Self-requested
        bankDetails: {
            bankName,
            branchName,
            accountNumber,
            ifscCode
        },
        status: 'PENDING_APPROVAL'
    });

    // Notify Admins
    try {
        // Fetch Member to get location
        const member = await Member.findById(req.user._id);
        if (member) {
            const villageId = member.address?.village;
            const mandalId = member.address?.mandal;
            const districtId = member.address?.district;

            const adminQuery = {
                $or: [
                    { role: 'SUPER_ADMIN' },
                    { role: 'VILLAGE_ADMIN', assignedLocation: villageId },
                    { role: 'MANDAL_ADMIN', assignedLocation: mandalId },
                    { role: 'DISTRICT_ADMIN', assignedLocation: districtId }
                ]
            };
            const admins = await User.find(adminQuery).select('_id');
            const notifMessage = `New ${purpose} Application request from ${member.name}.`;

            for (const admin of admins) {
                await createNotification(
                    admin._id,
                    'application',
                    'New Fund Application',
                    notifMessage,
                    fundRequest._id,
                    'FundRequest'
                );
            }
        }
    } catch (notifErr) {
        console.error("FundRequest Notification Error:", notifErr);
    }

    res.status(201).json(fundRequest);
});

// @desc    Get all fund requests (Admin) or My Requests (User)
// @route   GET /api/fund-requests
// @access  Private
const getFundRequests = asyncHandler(async (req, res) => {
    let query = {};

    // If simple member, only show their own
    if (req.user.role === 'MEMBER') {
        query.beneficiary = req.user._id;
    }
    // If Admin, implementation depends on hierarchy (Village/Mandal/District)
    // For now, let's keep it simple or expand if needed. 
    // If just verifying submission, simple create is enough.

    const requests = await FundRequest.find(query).sort({ createdAt: -1 });
    res.json(requests);
});

// @desc    Get fund request by ID
// @route   GET /api/fund-requests/:id
// @access  Private
const getFundRequestById = asyncHandler(async (req, res) => {
    const request = await FundRequest.findById(req.params.id)
        .populate('beneficiary', 'name surname email phoneNumber photo')
        .populate('requestedBy', 'name surname')
        .populate('approvalHistory.actionBy', 'name surname role');

    if (request) {
        res.json(request);
    } else {
        res.status(404);
        throw new Error('Fund Request not found');
    }
});

// @desc    Update fund request status (Approve/Reject)
// @route   PUT /api/fund-requests/:id/status
// @access  Private (Admin)
const updateFundRequestStatus = asyncHandler(async (req, res) => {
    const { status, remarks } = req.body;
    const request = await FundRequest.findById(req.params.id);

    if (request) {
        const oldStatus = request.status;
        request.status = status;

        // Add to history
        request.approvalHistory = request.approvalHistory || [];
        request.approvalHistory.push({
            actionBy: req.user._id,
            status,
            date: Date.now(),
            remarks
        });

        const updatedRequest = await request.save();

        // Notify Member
        if (oldStatus !== status) {
            try {
                // Find User linked to beneficiary (Member)
                // Beneficiary field in FundRequest usually points to Member model
                // We need to find the User for that Member to notify them.
                // Assuming simple mapping or self-request where beneficiary == user._id (if Member is User)
                // In createFundRequest, we set beneficiary = req.user._id. So it IS the user.

                await createNotification(
                    request.beneficiary,
                    status === 'ACTIVE' || status === 'COMPLETED' ? 'success' : 'info',
                    `Application ${status}`,
                    `Your application for ${request.purpose} has been marked as ${status}.`,
                    request._id,
                    'FundRequest'
                );
            } catch (notifErr) {
                console.error("FundRequest Status Notification Error:", notifErr);
            }
        }

        res.json(updatedRequest);
    } else {
        res.status(404);
        throw new Error('Fund Request not found');
    }
});

module.exports = {
    createFundRequest,
    getFundRequests,
    getFundRequestById,
    updateFundRequestStatus
};
