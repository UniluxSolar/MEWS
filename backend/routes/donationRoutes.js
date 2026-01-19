const express = require('express');
const router = express.Router();
const { getMyDonations, getDonationStats, createDonation } = require('../controllers/donationController');
const { protect } = require('../middleware/authMiddleware');

router.route('/my-donations').get(protect, getMyDonations);
router.route('/stats').get(protect, getDonationStats);
router.route('/').post(protect, createDonation);

module.exports = router;
