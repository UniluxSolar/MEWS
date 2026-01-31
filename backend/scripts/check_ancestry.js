const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Location = require('../models/Location');

async function checkAncestors() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        // Find a Mandal or Village
        const sample = await Location.findOne({ type: { $in: ['MANDAL', 'VILLAGE', 'DISTRICT'] }, parent: { $ne: null } });

        if (sample) {
            console.log(`Location: ${sample.name} (${sample.type})`);
            console.log("Ancestors:", JSON.stringify(sample.ancestors, null, 2));
        } else {
            console.log("No sub-level locations found.");
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkAncestors();
