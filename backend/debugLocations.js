const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Location = require('./models/Location');

dotenv.config();

const debugLocations = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB.");

        // 1. Find Telangana
        const state = await Location.findOne({ name: 'Telangana', type: 'STATE' });
        if (!state) {
            console.error("❌ State 'Telangana' not found!");
            process.exit(1);
        }
        console.log(`✅ Found State: ${state.name} (${state._id})`);

        // 2. Find Districts of Telangana
        const districts = await Location.find({ parent: state._id });
        console.log(`ℹ️ Found ${districts.length} districts.`);

        if (districts.length === 0) {
            console.error("❌ No districts found for Telangana.");
            process.exit(1);
        }

        // 3. Pick first district and find Mandals
        const district = districts[0];
        console.log(`🔍 Checking District: ${district.name} (${district._id})`);

        const mandals = await Location.find({ parent: district._id });
        console.log(`ℹ️ Found ${mandals.length} mandals for ${district.name}.`);

        if (mandals.length === 0) {
            console.warn(`⚠️ No mandals found for ${district.name}. Validation failed here.`);
        } else {
            console.log(`✅ Mandals linked correctly. Example: ${mandals[0].name}`);

            // 4. Check Villages
            const mandal = mandals[0];
            const villages = await Location.find({ parent: mandal._id });
            console.log(`ℹ️ Found ${villages.length} villages for ${mandal.name}.`);
        }

        process.exit(0);

    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

debugLocations();
