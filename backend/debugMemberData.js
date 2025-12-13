const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Member = require('./models/Member');

dotenv.config();

const debugMembers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB.");

        const count = await Member.countDocuments({});
        console.log(`Total Members in DB: ${count}`);

        const members = await Member.find({}).limit(5);

        console.log("\nSample Members Data:");
        members.forEach(m => {
            console.log(`Name: ${m.firstName}, Address:`, m.address);
        });

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

debugMembers();
