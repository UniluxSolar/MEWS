const asyncHandler = require('express-async-handler');
const FundRequest = require('../models/FundRequest');
const User = require('../models/User');
const Member = require('../models/Member');
const Location = require('../models/Location');
const Notification = require('../models/Notification');
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
    if (type === 'Education' || type === 'education' || type === 'scholarship') {
        purpose = 'Education';
    } else if (type === 'Health' || type === 'Medical' || type === 'Emergency') {
        purpose = 'Health';
    } else if (['Legal', 'Welfare', 'Employment', 'Community'].includes(type)) {
        purpose = type;
    }

    const memberId = req.loggedInMemberId || req.user._id;

    const fundRequest = await FundRequest.create({
        purpose,
        amountRequired: amountRequired || 50000,
        description: reason || `Application for ${type} scholarship`,
        courseName,
        beneficiary: memberId, // The specific member (Head or Dependent)
        requestedBy: memberId, // Self-requested
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
        // Fetch Member to get location (Handle Head or Dependent)
        const memberId = req.loggedInMemberId || req.user._id;
        const member = await Member.findById(memberId);
        
        if (member) {
            const villageId = member.address?.village;
            const mandalId = member.address?.mandal;
            const districtId = member.address?.district;
            const municipalityId = member.address?.municipality;
            const wardId = member.address?.ward;

            console.log(`[NOTIFY] Member ${member.name} location: Mandal=${mandalId}, Municipality=${municipalityId}, District=${districtId}`);

            // Target Admins: Specifically Scrutiny Admin for this Mandal OR Municipality
            const scrutinyLocationIds = [mandalId, municipalityId].filter(id => id);

            const query = {
                $or: [
                    { role: 'SUPER_ADMIN' },
                    { role: 'STATE_ADMIN' },
                    { role: 'SCRUTINY_ADMIN', assignedLocation: { $in: scrutinyLocationIds } }
                ]
            };

            // Include other regional admins if they exist
            if (mandalId) query.$or.push({ role: 'MANDAL_ADMIN', assignedLocation: mandalId });
            if (municipalityId) query.$or.push({ role: 'MUNICIPALITY_ADMIN', assignedLocation: municipalityId });
            if (villageId) query.$or.push({ role: 'VILLAGE_ADMIN', assignedLocation: villageId });
            if (districtId) query.$or.push({ role: 'DISTRICT_ADMIN', assignedLocation: districtId });

            const admins = await User.find(query).select('_id role assignedLocation');
            console.log(`[NOTIFY] Found ${admins.length} matching admins for targeting.`);
            
            // Create list of unique recipient IDs to ensure no duplicate notifications are generated
            const recipientIds = new Set(admins.map(a => a._id.toString()));

            // Fetch Mandal Name for display
            let mandalName = 'General';
            const locId = mandalId || municipalityId;
            if (locId) {
                const loc = await Location.findById(locId).select('name');
                if (loc) mandalName = loc.name;
            }

            const notifMessage = `New ${purpose} Application request from ${member.surname} ${member.name} in ${mandalName}.`;

            for (const adminId of recipientIds) {
                await createNotification(
                    adminId,
                    'application',
                    'New Fund Application',
                    notifMessage,
                    fundRequest._id,
                    'FundRequest',
                    mandalName, 
                    mandalId,
                    'USER_REQUEST',
                    villageId,
                    municipalityId,
                    wardId
                );
            }
            console.log(`[NOTIFY] Final: Created notifications for ${recipientIds.size} admins.`);
        }
    } catch (notifErr) {
        console.error("FundRequest Submission Notification Warning:", notifErr);
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

    const requests = await FundRequest.find(query)
        .populate('requestedBy', 'name surname')
        .sort({ createdAt: -1 });
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
    // Explicit Backend validation restricted to User Requests
    const notificationForEval = await Notification.findOne({ relatedId: req.params.id });
    if (notificationForEval && notificationForEval.notificationType !== 'USER_REQUEST' && notificationForEval.relatedModel !== 'FundRequest') {
        res.status(403);
        throw new Error('Authorization allowed only for user requests');
    }

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

// @desc    Approve a fund request
// @route   PUT /api/fund-requests/:id/approve
// @access  Private
const approveFundRequest = asyncHandler(async (req, res) => {
    // Explicit Backend validation restricted to User Requests
    const notificationForEval = await Notification.findOne({ relatedId: req.params.id });
    if (notificationForEval && notificationForEval.notificationType !== 'USER_REQUEST' && notificationForEval.relatedModel !== 'FundRequest') {
        res.status(403);
        throw new Error('Authorization allowed only for user requests');
    }

    const fundRequest = await FundRequest.findById(req.params.id);

    if (fundRequest) {
        // Step 2: Automatic Escalate or Approve Logic
        if (fundRequest.amountRequired && fundRequest.amountRequired > 50000) {
            fundRequest.status = 'ESCALATED';
            fundRequest.approvalLevel = 'DISTRICT';
            fundRequest.forwarded_to = 'DISTRICT';
            fundRequest.forwarded_by = req.user._id;
            fundRequest.is_forwarded = true;
            fundRequest.forwarded_at = new Date();
            
            fundRequest.approvalHistory.push({
                level: 'SCRUTINY',
                status: 'ESCALATED',
                actionBy: req.user._id,
                date: Date.now(),
                notes: 'Insufficient funds at Scrutiny - Escalated to District Admin'
            });

            const updatedFundRequest = await fundRequest.save();

            try {
                const beneficiary = await require('../models/Member').findById(fundRequest.beneficiary);
                const applicantName = beneficiary ? `${beneficiary.surname} ${beneficiary.name}` : 'Unknown';
                
                let targetAdmins = [];
                if (beneficiary && beneficiary.address?.district) {
                    targetAdmins = await require('../models/User').find({ 
                        role: 'DISTRICT_ADMIN', 
                        assignedLocation: beneficiary.address.district 
                    }).select('_id');
                } else {
                    targetAdmins = await require('../models/User').find({ role: 'DISTRICT_ADMIN' }).select('_id');
                }

                let mandalName = 'General';
                if (beneficiary && beneficiary.address?.mandal) {
                    const loc = await require('../models/Location').findById(beneficiary.address.mandal).select('name');
                    if (loc) mandalName = loc.name;
                }

                const message = `[ESCALATED from Scrutiny Admin]
                Timestamp: ${new Date().toLocaleString()}
                Applicant: ${applicantName}
                Fund Type: ${fundRequest.purpose}
                Amount Required: ₹${fundRequest.amountRequired.toLocaleString()}
                Reason: Insufficient funds allowed at Scrutiny level
                
                Please review and authorize.`;

                const { createNotification } = require('./notificationController');
                for (const admin of targetAdmins) {
                    await createNotification(
                        admin._id,
                        'alert',
                        `Escalated User Request: ${applicantName}`,
                        message,
                        fundRequest._id,
                        'FundRequest',
                        mandalName,
                        null,
                        'USER_REQUEST'
                    );
                }
            } catch (err) {
                console.error("Escalation notification failed", err);
            }

            res.json(updatedFundRequest);
        } else {
            fundRequest.status = 'APPROVED';
            fundRequest.approvalLevel = 'SUPER'; // Mark scrutiny phase as done
            fundRequest.approvalHistory.push({
                level: 'SCRUTINY',
                status: 'APPROVED',
                actionBy: req.user._id,
                date: Date.now(),
                notes: req.body.notes || 'Approved by Scrutiny Admin'
            });

            const updatedFundRequest = await fundRequest.save();

            // Send notification to member
            const beneficiaryId = fundRequest.beneficiary;
            if (beneficiaryId) {
                try {
                    const { createNotification } = require('./notificationController');
                    await createNotification(
                        beneficiaryId,
                        'success',
                        'Application Approved',
                        `Your fund application for ${fundRequest.purpose} has been approved by Scrutiny.`,
                        fundRequest._id,
                        'FundRequest',
                        null,
                        null,
                        'SYSTEM'
                    );
                } catch (notifErr) {
                    console.error("FundRequest Approval Notification Error:", notifErr);
                }
            }

            res.json(updatedFundRequest);
        }
    } else {
        res.status(404);
        throw new Error('Fund request not found');
    }
});

// @desc    Forward fund requests to District or State
// @route   POST /api/fund-requests/forward
// @access  Private (Scrutiny Admin)
const forwardFundRequests = asyncHandler(async (req, res) => {
    const { notificationIds, forwardTo } = req.body;

    if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
        res.status(400);
        throw new Error('No notifications selected');
    }

    if (!['DISTRICT', 'STATE'].includes(forwardTo)) {
        res.status(400);
        throw new Error('Invalid forward destination');
    }

    const results = [];
    const errors = [];

    for (const notifId of notificationIds) {
        const notification = await Notification.findById(notifId);
        if (!notification || notification.relatedModel !== 'FundRequest') {
            errors.push(`Notification ${notifId} not found or not a fund request`);
            continue;
        }

        const fundRequest = await FundRequest.findById(notification.relatedId);
        if (!fundRequest) {
            errors.push(`Fund Request for notification ${notifId} not found`);
            continue;
        }

        // --- VALIDATION: Insufficient fund condition ---
        // Requirement: Enable forwarding only when fund amount is insufficient at scrutiny level
        // Validation: If condition fails -> show error message: "Insufficient condition not met for forwarding"
        // Logic: Assuming scrutiny level (Mandal) can handle requests up to 50,000. 
        // Requests above this are "insufficiently funded" at this level and need forwarding.
        if (fundRequest.amountRequired < 50000) {
            errors.push(`Insufficient condition not met for forwarding: ${fundRequest._id}`);
            continue;
        }

        fundRequest.status = 'FORWARDED';
        fundRequest.forwarded_to = forwardTo;
        fundRequest.forwarded_by = req.user._id;
        fundRequest.is_forwarded = true;
        fundRequest.forwarded_at = new Date();
        fundRequest.approvalLevel = forwardTo; // Level up
        
        fundRequest.approvalHistory.push({
            level: 'SCRUTINY',
            status: 'FORWARDED',
            actionBy: req.user._id,
            date: Date.now(),
            notes: `Forwarded to ${forwardTo} by Scrutiny Admin`
        });

        await fundRequest.save();

        // Notify District/State Admins
        try {
            // Find target admins
            let targetAdmins = [];
            const beneficiary = await Member.findById(fundRequest.beneficiary);
            const applicantName = beneficiary ? `${beneficiary.surname} ${beneficiary.name}` : 'Unknown';
            
            if (forwardTo === 'STATE') {
                targetAdmins = await User.find({ role: 'STATE_ADMIN' }).select('_id');
            } else if (forwardTo === 'DISTRICT') {
                // For District, we need the district ID from the beneficiary address
                if (beneficiary && beneficiary.address?.district) {
                    targetAdmins = await User.find({ 
                        role: 'DISTRICT_ADMIN', 
                        assignedLocation: beneficiary.address.district 
                    }).select('_id');
                }
            }

            const mandalName = notification.targetAudience || 'General';
            const message = `[Forwarded from Scrutiny Admin]
            Source: Forwarded from Scrutiny Admin
            Timestamp: ${new Date().toLocaleString()}
            Applicant: ${applicantName}
            Mandal: ${mandalName}
            Fund Type: ${fundRequest.purpose}
            Amount Required: ₹${fundRequest.amountRequired.toLocaleString()}
            Description: ${fundRequest.description}
            
            Please review and take action.`;

            for (const admin of targetAdmins) {
                await createNotification(
                    admin._id,
                    'application',
                    `Forwarded Fund Application: ${applicantName}`,
                    message,
                    fundRequest._id,
                    'FundRequest',
                    mandalName,
                    null,
                    'USER_REQUEST'
                );
            }
        } catch (notifErr) {
            console.error("Forwarding Notification Error:", notifErr);
        }

        results.push(fundRequest._id);
    }

    res.json({
        message: `Successfully forwarded ${results.length} requests to ${forwardTo}`,
        results,
        errors
    });
});

// @desc    Update forwarded fund request status (Approve/Reject by District/State)
// @route   PUT /api/fund-requests/:id/forward-status
// @access  Private (District/State Admin)
const updateForwardedStatus = asyncHandler(async (req, res) => {
    // Explicit Backend validation restricted to User Requests
    const notificationForEval = await Notification.findOne({ relatedId: req.params.id });
    if (notificationForEval && notificationForEval.notificationType !== 'USER_REQUEST' && notificationForEval.relatedModel !== 'FundRequest') {
        res.status(403);
        throw new Error('Only user requests can be authorized');
    }

    const { status, remarks } = req.body;
    const fundRequest = await FundRequest.findById(req.params.id);

    if (!fundRequest) {
        res.status(404);
        throw new Error('Fund Request not found');
    }

    if (fundRequest.status !== 'FORWARDED' && fundRequest.status !== 'ESCALATED') {
        res.status(400);
        throw new Error('This request is not in an escalated state');
    }

    const oldStatus = fundRequest.status;
    const finalStatus = status === 'APPROVED' ? 'APPROVED' : 'REJECTED';
    fundRequest.status = finalStatus;

    fundRequest.approvalHistory.push({
        level: req.user.role.replace('_ADMIN', ''),
        status: finalStatus,
        actionBy: req.user._id,
        date: Date.now(),
        notes: remarks || `${finalStatus} by ${req.user.role}`
    });

    await fundRequest.save();

    // Notify Scrutiny Admin
    try {
        const scrutinyAdminId = fundRequest.forwarded_by || '507f191e810c19729de860ea'; // Fallback to hardcoded ID if missing
        const msg = `Your forwarded request has been ${finalStatus} by ${req.user.role.replace('_ADMIN', '').toLowerCase()} admin.`;
        
        await createNotification(
            scrutinyAdminId,
            finalStatus === 'APPROVED' ? 'success' : 'alert',
            `Forwarded Request ${finalStatus}`,
            msg,
            fundRequest._id,
            'FundRequest',
            'Forwarded'
        );

        // Also notify the beneficiary
        await createNotification(
            fundRequest.beneficiary,
            finalStatus === 'APPROVED' ? 'success' : 'info',
            `Forwarded Application ${finalStatus}`,
            `Your forwarded application has been ${finalStatus} by ${req.user.role.replace('_ADMIN', '').toLowerCase()} admin.`,
            fundRequest._id,
            'FundRequest'
        );
    } catch (notifErr) {
        console.error("Forwarded Status Notification Error:", notifErr);
    }

    res.json({ message: `Request ${finalStatus} successfully`, fundRequest });
});

module.exports = {
    createFundRequest,
    getFundRequests,
    getFundRequestById,
    updateFundRequestStatus,
    approveFundRequest,
    forwardFundRequests,
    updateForwardedStatus
};
