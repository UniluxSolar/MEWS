const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Member = require('./models/Member');

dotenv.config();

const listMembersForUpdate = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB.");

        const members = await Member.find({});
        console.log("Current Members:");
        members.forEach(m => {
            console.log(`ID: ${m._id} | Surname: ${m.surname} | Name: ${m.name}`);
        });

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

listMembersForUpdate();
