const Donation = require('../models/Donation');
const mongoose = require('mongoose');

// @desc    Get logged in user's donations
// @route   GET /api/donations/my-donations
// @access  Private
const getMyDonations = async (req, res) => {
    try {
        const donations = await Donation.find({ donor: req.user._id })
            .sort({ createdAt: -1 });
        res.json(donations);
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching donations', error: error.message });
    }
};

// @desc    Get donation stats for user
// @route   GET /api/donations/stats
// @access  Private
const getDonationStats = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user._id);

        const stats = await Donation.aggregate([
            { $match: { donor: userId, status: 'SUCCESS' } },
            {
                $group: {
                    _id: null,
                    totalDonated: { $sum: '$amount' },
                    activeSponsorships: {
                        $sum: { $cond: [{ $eq: ['$type', 'Sponsorship'] }, 1, 0] }
                    }
                }
            }
        ]);

        const result = stats[0] || { totalDonated: 0, activeSponsorships: 0 };

        // 80G Calculation (50% of total)
        const taxDeduction = Math.floor(result.totalDonated * 0.5);

        // Lives Touched (Simple logic: 1 per sponsorship + 1 per every 5000 general)
        const livesTouched = result.activeSponsorships + Math.floor(result.totalDonated / 5000);

        res.json({
            totalDonated: result.totalDonated,
            activeSponsorships: result.activeSponsorships,
            taxDeduction,
            livesTouched
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching stats', error: error.message });
    }
};

// @desc    Create a new donation (for testing/flow)
// @route   POST /api/donations
// @access  Private
const createDonation = async (req, res) => {
    try {
        const { amount, type, purpose, paymentMethod, transactionId } = req.body;

        const donation = new Donation({
            donor: req.user._id,
            donorName: req.user.name + ' ' + req.user.surname,
            amount,
            type,
            purpose,
            paymentMethod: paymentMethod || 'UPI',
            transactionId: transactionId || 'TXN' + Date.now(),
            status: 'SUCCESS' // Auto-complete for demo
        });

        const createdDonation = await donation.save();
        res.status(201).json(createdDonation);
    } catch (error) {
        res.status(400).json({ message: 'Invalid data', error: error.message });
    }
};

module.exports = { getMyDonations, getDonationStats, createDonation };
