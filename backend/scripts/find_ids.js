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

const findIds = async () => {
    await connectDB();
    const Location = require('../models/Location');

    const district = await Location.findOne({ name: 'Nalgonda', type: 'DISTRICT' });
    const municipality = await Location.findOne({ name: 'Miryalaguda Municipality', type: 'MUNICIPALITY' });
    const ward = await Location.findOne({ name: 'Ward 23', parent: municipality ? municipality._id : null });

    console.log(`Nalgonda District: ${district ? district._id : 'Not Found'}`);
    console.log(`Miryalaguda Municipality: ${municipality ? municipality._id : 'Not Found'}`);
    console.log(`Ward 23: ${ward ? ward._id : 'Not Found'}`);

    process.exit();
};

findIds();
