const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Member = require('./models/Member');

dotenv.config();

const debugDistrictData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB.");

        // Check a few members to see their District field
        const members = await Member.find({}).limit(5);
        console.log("Sample Members Address:");
        members.forEach(m => {
            console.log(`- ${m.name}: District Type=${typeof m.address.district}, Value=${m.address.district}`);
        });

        // Check if we have any members with ObjectId districts
        const validCount = await Member.countDocuments({
            'address.district': { $type: "objectId" }
        });
        console.log(`Members with valid ObjectId District: ${validCount}`);

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

debugDistrictData();
