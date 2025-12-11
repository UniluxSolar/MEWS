const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
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
    ancestors: [{
        _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
        name: String,
        type: String
    }]
}, {
    timestamps: true
});

// Index for faster lookups based on parent
LocationSchema.index({ parent: 1 });
LocationSchema.index({ type: 1 });

module.exports = mongoose.model('Location', LocationSchema);
