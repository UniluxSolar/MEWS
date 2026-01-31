
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Location = require('../models/Location');

const debugLocations = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const adilabad = await Location.findOne({ name: /Adilabad/i, type: 'DISTRICT' });
        if (!adilabad) {
            console.log('Adilabad district not found');
        } else {
            console.log('Found Adilabad District:', adilabad._id, adilabad.name);

            const mandals = await Location.find({ parent: adilabad._id });
            console.log(`Found ${mandals.length} mandals with parent Adilabad`);
            mandals.forEach(m => console.log(` - ${m.name} (${m.type})`));

            if (mandals.length === 0) {
                console.log('Checking mandals by ancestors...');
                const mandalsByAnc = await Location.find({ 'ancestors.locationId': adilabad._id, type: 'MANDAL' });
                console.log(`Found ${mandalsByAnc.length} mandals by ancestors`);
                mandalsByAnc.forEach(m => console.log(` - ${m.name} (Parent: ${m.parent})`));
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

debugLocations();
