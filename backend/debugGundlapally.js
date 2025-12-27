const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Location = require('./models/Location');
const Member = require('./models/Member');

dotenv.config();

const debugGundlapally = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB.");

        // 1. Find Gundlapally ID
        const gundlapally = await Location.findOne({ name: { $regex: 'Gundlapally', $options: 'i' } });
        if (!gundlapally) {
            console.log("❌ Gundlapally Not Found!");
            process.exit(1);
        }
        console.log(`✅ Gundlapally Found: ${gundlapally.name} (${gundlapally._id})`);

        // 2. Count current members
        const count = await Member.countDocuments({ 'address.village': gundlapally._id });
        console.log(`Current Gundlapally Members: ${count}`);

        // 3. List candidates to move (currently in Peddakaparthy or unassigned)
        const candidates = await Member.find({ 'address.village': { $ne: gundlapally._id } }).limit(10);
        console.log("Candidates to move:");
        candidates.forEach(m => {
            console.log(`- ${m.name} ${m.surname} (Current Loc: ${m.address.village})`);
        });

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

debugGundlapally();
