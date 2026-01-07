const express = require('express');
const router = express.Router();
const { createFundRequest, getFundRequests, getFundRequestById } = require('../controllers/fundRequestController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createFundRequest)
    .get(protect, getFundRequests);

router.route('/:id')
    .get(protect, getFundRequestById);

module.exports = router;
