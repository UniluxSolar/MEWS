const mongoose = require('mongoose');

const InstitutionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Health', 'Education', 'Legal', 'Employment'],
        required: true
    },
    name: { type: String, required: true },
    ownerName: { type: String },
    mobileNumber: { type: String },
    whatsappNumber: { type: String },

    // Address
    address: {
        fullAddress: String,
        googleMapsLink: String,
        village: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' }
    },

    // Services
    servicesOffered: [String],
    discountDetails: { type: String, required: true }, // "MEWS Discount Offered"
    photos: [String], // Array of URLs

    // Verification
    verificationStatus: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'PENDING'
    },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: true
});

module.exports = mongoose.model('Institution', InstitutionSchema);
