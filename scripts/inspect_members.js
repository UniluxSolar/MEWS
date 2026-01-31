const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

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

    const Member = require('../backend/models/Member');
    const Location = require('../backend/models/Location');

    console.log("--- Inspecting Members ---");
    const count = await Member.countDocuments();
    console.log(`Total Members: ${count}`);

    if (count === 0) {
        console.log("No members found.");
        process.exit();
    }

    const members = await Member.find().limit(5).sort({ createdAt: -1 })
        .populate('address.village')
        .populate('address.mandal')
        .populate('address.district')
        .populate('address.municipality'); // Check if populated

    members.forEach((m, i) => {
        console.log(`\n[${i + 1}] Data: ${m.name} ${m.surname} (ID: ${m.mewsId || m._id})`);
        console.log(`    Role: ${m.role}`);
        console.log(`    Address Raw:`, m.address);
        console.log(`    Village Name: ${m.address.village?.name}`);
        console.log(`    Mandal Name: ${m.address.mandal?.name}`);
        console.log(`    Municipality: ${m.address.municipality}`); // Log raw or populated
        console.log(`    Ward Number: ${m.address.wardNumber}`);
    });

    // Check Locations Count
    const locCount = await Location.countDocuments();
    console.log(`\nTotal Locations: ${locCount}`);

    process.exit();
};

inspectMembers();
