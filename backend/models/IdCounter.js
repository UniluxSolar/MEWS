const mongoose = require('mongoose');

const IdCounterSchema = new mongoose.Schema({
    // key will be in format "StateCode-DistrictCode-Year", e.g. "24-04-2026"
    // or just "DistrictCode-Year" if state is implicit? 
    // The requirement says "auto-increment per district per year".
    // State is part of the ID, but uniqueness is likely per district/year block.
    // Let's use "SS-DD-YYYY" as the key to be safe and explicit.
    key: { type: String, required: true, unique: true },
    seq: { type: Number, default: 0 }
});

module.exports = mongoose.model('IdCounter', IdCounterSchema);
