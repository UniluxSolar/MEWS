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

const inspectWards = async () => {
    await connectDB();
    const Location = require('../models/Location');

    const municipalityName = 'Miryalaguda Municipality';
    const municipality = await Location.findOne({ name: { $regex: new RegExp(municipalityName, 'i') }, type: 'MUNICIPALITY' });

    if (!municipality) {
        console.log(`Municipality "${municipalityName}" not found.`);
        process.exit();
    }

    console.log(`Found Municipality: ${municipality.name} (_id: ${municipality._id})`);

    const wards = await Location.find({
        $or: [
            { parent: municipality._id },
            { 'ancestors.locationId': municipality._id.toString() },
            { 'ancestors.locationId': municipality._id }
        ],
        type: 'WARD'
    });

    console.log(`Total Wards found under this Municipality: ${wards.length}`);
    if (wards.length > 0) {
        console.log("Sample Wards:");
        wards.slice(0, 5).forEach(w => {
            console.log(` - ${w.name} (_id: ${w._id})`);
            console.log(`   Ancestors:`, JSON.stringify(w.ancestors, null, 2));
        });
    } else {
        console.log("No Wards found.");
        const anyChildren = await Location.find({ parent: municipality._id });
        console.log(`Any children:`, anyChildren.map(c => `${c.name} (${c.type})`));
    }

    process.exit();
};

inspectWards();
