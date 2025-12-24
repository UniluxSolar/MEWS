const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Member = require('./models/Member');

dotenv.config();

const debugGetMembers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB.");

        // Simulate VillageAdmin1 (Peddakaparthy)
        // ID obtained from previous migration logs: 693d4e18a3515ea44efe03bb (example, likely dynamic)
        // I'll assume the string from the migration log was accurate or lookup "Peddakaparthy" dynamically
        const Location = require('./models/Location');
        const village = await Location.findOne({ name: 'Peddakaparthy' });

        if (!village) {
            console.log("❌ Peddakaparthy village not found!");
            process.exit(1);
        }

        console.log(`Testing for Village: ${village.name} (ID: ${village._id})`);

        // Test 1: Query with ObjectId
        const queryObjectId = { 'address.village': village._id };
        const countObjectId = await Member.countDocuments(queryObjectId);
        console.log(`Query with ObjectId: Found ${countObjectId} members.`);

        // Test 2: Query with String
        const queryString = { 'address.village': village._id.toString() };
        const countString = await Member.countDocuments(queryString);
        console.log(`Query with String: Found ${countString} members.`);

        // Test 3: Log actual member address types
        const member = await Member.findOne({ 'address.village': village._id });
        if (member) {
            console.log("Sample Member Village Type:", typeof member.address.village);
            console.log("Sample Member Village Value:", member.address.village);
        } else {
            console.log("No member found to inspect.");
        }

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

debugGetMembers();
