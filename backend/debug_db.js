const mongoose = require('mongoose');
const Member = require('./models/Member');
require('dotenv').config();

const checkDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");
        const members = await Member.find({}).sort({ createdAt: -1 });
        console.log(`Found ${members.length} members`);
        if (members.length > 0) {
            console.log("LATEST Member Data:", JSON.stringify(members[0], null, 2));
        }
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkDB();
