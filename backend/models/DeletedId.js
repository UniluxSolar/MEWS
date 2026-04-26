const mongoose = require('mongoose');

const DeletedIdSchema = new mongoose.Schema({
    mewsId: { type: String, required: true, unique: true },
    stateCode: { type: String, required: true },
    districtCode: { type: String, required: true },
    year: { type: Number, required: true },
    key: { type: String, required: true } // format "SS-DD-YYYY"
}, { timestamps: true });

// Index for fast lookup of reusable IDs for a specific state/district
DeletedIdSchema.index({ stateCode: 1, districtCode: 1, mewsId: 1 });

module.exports = mongoose.model('DeletedId', DeletedIdSchema);
