const mongoose = require('mongoose');

const SOSRequestSchema = new mongoose.Schema({
    // Option 1: Link to existing member
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },

    // Option 2: Fallback if not linked or guest (though usually only members)
    name: { type: String },
    contactNumber: { type: String },

    // Alert Details
    type: { type: String, required: true }, // 'Medical', 'Police', 'Fire', 'General'
    description: { type: String },

    // Location
    location: {
        latitude: Number,
        longitude: Number,
        address: String
    },

    // Status
    status: {
        type: String,
        enum: ['ACTIVE', 'ASSIGNED', 'RESOLVED', 'FALSE_ALARM'],
        default: 'ACTIVE'
    },

    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolutionNotes: String,

    // Timestamps
    resolvedAt: Date

}, {
    timestamps: true
});

module.exports = mongoose.model('SOSRequest', SOSRequestSchema);
