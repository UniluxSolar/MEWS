const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const inspectMembers = async () => {
    await connectDB();
    const Member = require('../models/Member');

    const members = await Member.find({ name: { $in: ['erew', 'kpp'] } });
    console.log(`Found ${members.length} members matching 'erew' or 'kpp'`);

    members.forEach(m => {
        console.log(`--- Member: ${m.name} ---`);
        console.log(JSON.stringify(m.address, null, 2));
    });

    process.exit();
};

inspectMembers();
