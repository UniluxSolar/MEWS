const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/User');
const Member = require('./models/Member');
const Location = require('./models/Location');

dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const debugQuery = async () => {
    await connectDB();

    const username = 'amanagal_village_admin';
    const user = await User.findOne({ username });

    if (!user) {
        console.log(`User ${username} not found!`);
        process.exit();
    }

    console.log(`User Found: ${user.username}, Role: ${user.role}, LocID: ${user.assignedLocation}`);

    const locationId = user.assignedLocation;
    let query = {};

    // Logic from memberController.js
    const assignedLoc = await Location.findById(locationId);
    if (assignedLoc) {
        console.log(`Assigned Location Found: ${assignedLoc.name} (${assignedLoc.type})`);

        const escapedName = assignedLoc.name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const relatedLocations = await Location.find({
            name: { $regex: new RegExp(`^\\s*${escapedName}\\s*$`, 'i') },
            type: 'VILLAGE'
        });

        const locIds = relatedLocations.map(l => l._id);
        if (!locIds.some(id => id.toString() === locationId.toString())) {
            locIds.push(locationId);
        }

        console.log(`Resolved Village IDs for Query:`, locIds);
        query['address.village'] = { $in: locIds };
    } else {
        console.log('Assigned Location NOT FOUND in DB');
        query['address.village'] = locationId;
    }

    console.log('Executing Member Query:', JSON.stringify(query));

    // Check total members
    const count = await Member.countDocuments(query);
    console.log(`Total Members Found: ${count}`);

    // Check latest member details
    const latestMember = await Member.findOne(query).sort({ createdAt: -1 });
    if (latestMember) {
        console.log('Latest Member:', {
            id: latestMember._id,
            mewsId: latestMember.mewsId,
            name: latestMember.name,
            village: latestMember.address.village,
            status: latestMember.verificationStatus
        });

        // Check strict match
        if (latestMember.address.village.toString() === locationId.toString()) {
            console.log('MATCH: Member village ID matches Admin Assigned Location ID');
        } else {
            console.log('MISMATCH: Member village ID differs from Admin ID');
            console.log(`Member Village: ${latestMember.address.village}`);
            console.log(`Admin Location: ${locationId}`);
        }
    } else {
        console.log('No members found.');
    }

    // DEBUG: Look for users with name 'Narender' globally to see where they went
    const globalSearch = await Member.findOne({ name: { $regex: /narender/i } });
    if (globalSearch) {
        console.log('\n--- GLOBAL SEARCH for "Narender" ---');
        console.log({
            id: globalSearch._id,
            name: globalSearch.name,
            village: globalSearch.address.village
        });
    }

    process.exit();
};

debugQuery();
