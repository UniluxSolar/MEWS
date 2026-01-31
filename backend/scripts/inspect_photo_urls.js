const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`[DB] Connected`);
    } catch (error) {
        console.error(`[DB] Error: ${error.message}`);
        process.exit(1);
    }
};

const inspectPhotos = async () => {
    await connectDB();
    const Member = require('../models/Member');

    const members = await Member.find({ photoUrl: { $exists: true, $ne: null } }).select('name surname photoUrl').limit(10);

    if (members.length === 0) {
        console.log("No members with photoUrl found.");
    } else {
        console.log(`Inspecting photoUrl for ${members.length} member(s):\n`);
        members.forEach(m => {
            console.log(`- ${m.name} ${m.surname}: ${m.photoUrl}`);
        });
    }

    process.exit();
};

inspectPhotos();
