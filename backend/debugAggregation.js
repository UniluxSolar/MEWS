const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Location = require('./models/Location');
const Institution = require('./models/Institution');
const Member = require('./models/Member');

dotenv.config();

const debugAggregation = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB.");

        // 1. Get District Info (assuming Nalgonda based on context)
        const district = await Location.findOne({ name: 'Nalgonda', type: 'DISTRICT' });
        if (!district) {
            console.log("Nalgonda District not found.");
            process.exit(1);
        }
        console.log(`District: ${district.name} (${district._id})`);

        // 2. Count Members by strict ID match
        const membersStrict = await Member.countDocuments({ 'address.district': district._id });
        console.log(`Members (Strict ID Match): ${membersStrict}`);

        // 3. Count Institutions
        // Logic in controller: fullAddress regex
        const regex = new RegExp(district.name, 'i');
        const institutionsRegex = await Institution.countDocuments({ fullAddress: { $regex: regex } });
        console.log(`Institutions (Regex '${district.name}'): ${institutionsRegex}`);

        // 4. List sample institutions to see why they might fail
        const allInsts = await Institution.find({}).limit(5);
        console.log("Sample Institutions:");
        allInsts.forEach(i => console.log(`- ${i.name}: ${i.fullAddress}`));

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

debugAggregation();
