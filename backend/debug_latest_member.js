const mongoose = require('mongoose');
require('dotenv').config();
const Member = require('./models/Member');
const Location = require('./models/Location');

const checkLatest = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const members = await Member.find({}).sort({ createdAt: -1 }).limit(5);
        console.log(`Found ${members.length} recent members.`);

        for (const m of members) {
            console.log("---------------------------------------------------");
            console.log(`ID: ${m._id}, Name: ${m.name} ${m.surname}, CreatedAt: ${m.createdAt}`);
            console.log(`VerificationStatus: ${m.verificationStatus}`);
            console.log("Address:", JSON.stringify(m.address, null, 2));

            // Check if village is an ObjectId
            const isVillageObjectId = mongoose.Types.ObjectId.isValid(m.address.village);
            console.log(`Village is Valid ObjectId? ${isVillageObjectId}`);

            if (isVillageObjectId) {
                const loc = await Location.findById(m.address.village);
                console.log(`Village Lookup: ${loc ? loc.name : 'NOT FOUND IN LOCATIONS'}`);
            }
        }
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkLatest();
