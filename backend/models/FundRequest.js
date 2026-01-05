const mongoose = require('mongoose');

const FundRequestSchema = new mongoose.Schema({
    // Basic Info
    purpose: {
        type: String,
        enum: ['Medical', 'Education', 'Emergency', 'Legal', 'Community'],
        required: true
    },
    amountRequired: { type: Number, required: true },
    amountCollected: { type: Number, default: 0 },
    eventDate: { type: Date },
    description: { type: String, required: true },
    courseName: { type: String },

    // Beneficiary
    beneficiary: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' }, // Can be null if it's a community fund
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Village Admin usually

    // Location Scope (e.g., Is this fund only for a specific village?)
    locationScope: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },

    // Bank Details
    bankDetails: {
        accountNumber: { type: String },
        bankName: { type: String },
        ifscCode: { type: String },
        branchName: { type: String }
    },

    // Docs
    supportingDocuments: [String], // URLs (Photos, Budget, etc.)

    // Workflow
    status: {
        type: String,
        enum: ['DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'COMPLETED', 'REJECTED', 'FROZEN'],
        default: 'PENDING_APPROVAL'
    },
    approvalLevel: {
        type: String,
        enum: ['VILLAGE', 'MANDAL', 'DISTRICT', 'STATE', 'SUPER'],
        default: 'MANDAL' // Assuming starts at Mandal level check
    },
    approvalHistory: [{
        level: String,
        status: String, // APPROVED, REJECTED, MODIFY
        actionBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        date: { type: Date, default: Date.now },
        notes: String
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('FundRequest', FundRequestSchema);
