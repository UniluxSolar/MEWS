const mongoose = require('mongoose');

const AncestorSchema = new mongoose.Schema({
    locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
    name: { type: String },
    type: { type: String }
}, { _id: false });

const LocationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    pincode: {
        type: String,
        trim: true,
        default: ''
    },
    type: {
        type: String,
        enum: ['STATE', 'DISTRICT', 'MANDAL', 'VILLAGE'],
        required: true
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location',
        default: null
    },
    // Optional: Ancestors array for faster queries (Materialized Path pattern)
    ancestors: [AncestorSchema]
}, {
    timestamps: true
});

// Index for faster lookups based on parent
LocationSchema.index({ parent: 1 });
LocationSchema.index({ type: 1 });

module.exports = mongoose.model('Location', LocationSchema);
