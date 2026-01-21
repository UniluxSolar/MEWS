const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Member = require('../models/Member');
const Location = require('../models/Location'); // Needed if we populate

async function checkMembers() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected.");

        const members = await Member.find({}).limit(5).populate('address.district');
        console.log(`Found ${members.length} members.`);

        members.forEach(m => {
            console.log("---------------------------------------------------");
            console.log(`Name: ${m.name} ${m.surname}`);
            console.log(`ID: ${m.mewsId || 'PENDING'}`); // Check for updated format
            console.log(`Photo URL: ${m.photoUrl || 'N/A'}`);
            console.log(`Status: ${m.verificationStatus}`);
            if (m.address && m.address.district) {
                console.log(`District: ${m.address.district.name} (Code check needed)`);
            }
        });

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
}

checkMembers();
