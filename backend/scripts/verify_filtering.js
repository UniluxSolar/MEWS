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

const verifyFiltering = async () => {
    await connectDB();
    const Member = require('../models/Member');
    const Location = require('../models/Location');

    const municipalityName = 'Miryalaguda Municipality';
    const municipality = await Location.findOne({ name: municipalityName });

    if (!municipality) {
        console.log("Municipality not found.");
        process.exit();
    }

    console.log(`Testing filtering for Municipality: ${municipality.name} (${municipality._id})`);

    // Simulate query: { 'address.municipality': ID }
    const members = await Member.find({ 'address.municipality': municipality._id });
    console.log(`Found ${members.length} members in this municipality.`);

    if (members.length > 0) {
        members.forEach(m => {
            console.log(` - ${m.name} (ID: ${m.mewsId})`);
        });
    }

    // Check for a member that SHOULD NOT be found (e.g. from Suryapet)
    const suryapetMember = await Member.findOne({ 'address.district': { $ne: municipality.parent } }); // Nalgonda id vs Suryapet
    if (suryapetMember) {
        console.log(`\nSample Member from another location: ${suryapetMember.name} (District: ${suryapetMember.address.district})`);
        // Verify they are NOT in the municipality query
        const check = await Member.findOne({ _id: suryapetMember._id, 'address.municipality': municipality._id });
        console.log(`Strict check (Should be null): ${check ? 'FAILED (Found unexpectedly)' : 'PASSED (Not found)'}`);
    }

    process.exit();
};

verifyFiltering();
