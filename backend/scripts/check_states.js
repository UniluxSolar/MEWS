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

const checkStates = async () => {
    await connectDB();
    const Location = require('../models/Location');

    console.log("--- Checking States ---");
    const count = await Location.countDocuments({ type: 'STATE' });
    console.log(`Count (type='STATE'): ${count}`);

    const countLower = await Location.countDocuments({ type: 'State' });
    console.log(`Count (type='State'): ${countLower}`);

    const countAll = await Location.countDocuments({ type: { $regex: /state/i } });
    console.log(`Count (type regex /state/i): ${countAll}`);

    const states = await Location.find({ type: { $regex: /state/i } });
    states.forEach(s => console.log(` - ${s.name} (Type: ${s.type}) ID: ${s._id}`));

    process.exit();
};

checkStates();
