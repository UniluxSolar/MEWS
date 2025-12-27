const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema({
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', default: null }, // Null if anonymous/guest
    donorName: { type: String }, // Captured if guest or explicitly provided

    fundRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'FundRequest' },
    type: {
        type: String,
        enum: ['CAMPAIGN', 'COMMUNITY_POOL'],
        required: true
    },

    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },

    // Payment Gateway Details
    transactionId: { type: String },
    paymentMethod: { type: String, enum: ['UPI', 'CARD', 'NET_BANKING', 'OFFLINE'] },
    status: {
        type: String,
        enum: ['INITIATED', 'SUCCESS', 'FAILED'],
        default: 'INITIATED'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Donation', DonationSchema);
