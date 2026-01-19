const express = require('express');
const router = express.Router();
const { createFundRequest, getFundRequests, getFundRequestById, updateFundRequestStatus } = require('../controllers/fundRequestController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createFundRequest)
    .get(protect, getFundRequests);

router.route('/:id')
    .get(protect, getFundRequestById);

router.route('/:id/status')
    .put(protect, updateFundRequestStatus);

module.exports = router;
