const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Location = require('./models/Location');
const Member = require('./models/Member');

dotenv.config();

const debugBreakdown = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB.");

        // 1. Find District
        const district = await Location.findOne({ name: 'Nalgonda', type: 'DISTRICT' });
        if (!district) { console.log('District not found'); process.exit(1); }
        console.log(`District: ${district.name} (${district._id})`);

        // 2. Find Mandals
        const mandals = await Location.find({ parent: district._id, type: 'MANDAL' });
        console.log(`Found ${mandals.length} Mandals.`);

        // 3. Iterate and Count
        for (const mandal of mandals) {
            const count = await Member.countDocuments({ 'address.mandal': mandal._id });
            const instCount = await Member.countDocuments({ 'address.mandal': mandal._id.toString() }); // Check string version
            console.log(`Mandal: ${mandal.name} (${mandal._id})`);
            console.log(`   -> Count (ObjectId): ${count}`);
            console.log(`   -> Count (String):   ${instCount}`);

            // 4. Debug a sample member if count is 0 but expected > 0
            if (mandal.name === 'Chityala') {
                const sample = await Member.findOne({ 'address.district': district._id });
                if (sample) {
                    console.log(`   Samples Member Mandal ID: ${sample.address.mandal} (Type: ${typeof sample.address.mandal})`);
                    console.log(`   Equal? ${sample.address.mandal.toString() === mandal._id.toString()}`);
                }
            }
        }

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

debugBreakdown();
