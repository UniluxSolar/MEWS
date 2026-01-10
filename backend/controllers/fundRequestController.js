const asyncHandler = require('express-async-handler');
const FundRequest = require('../models/FundRequest');

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

module.exports = {
    createFundRequest,
    getFundRequests,
    getFundRequestById
};
