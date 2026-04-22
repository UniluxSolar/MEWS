const express = require('express');
const router = express.Router();
const { 
    createFundRequest, 
    getFundRequests, 
    getFundRequestById, 
    updateFundRequestStatus, 
    approveFundRequest,
    forwardFundRequests,
    updateForwardedStatus
} = require('../controllers/fundRequestController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createFundRequest)
    .get(protect, getFundRequests);

router.route('/forward')
    .post(protect, forwardFundRequests);

router.route('/:id')
    .get(protect, getFundRequestById);

router.route('/:id/status')
    .put(protect, updateFundRequestStatus);

router.route('/:id/forward-status')
    .put(protect, updateForwardedStatus);

router.route('/:id/approve')
    .put(protect, approveFundRequest);

module.exports = router;
