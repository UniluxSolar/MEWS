require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Member = require('../models/Member');
const { generateMemberId } = require('../utils/idGenerator');
const Location = require('../models/Location');

// Mock request-like object data
const testMemberData = {
    surname: 'Test',
    name: 'Member',
    fatherName: 'Father',
    gender: 'Male',
    mobileNumber: '9999999999',
    address: {
        district: '67890abcdef1234567890abc', // invalid ID, but let's see if it handles it or if I need a valid one
        state: 'Telangana'
    }
};

async function testRegistrationId() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        // 1. Need a valid district ID if possible, or Mock it
        // Let's try to find a district
        const district = await Location.findOne({ type: 'DISTRICT' });
        if (district) {
            testMemberData.address.district = district._id;
            console.log(`Using District: ${district.name}`);
        } else {
            console.log("No District found. Using fallback logic (may result in '00' code).");
            testMemberData.address.district = new mongoose.Types.ObjectId();
        }

        // 2. Mock the Member Document (in memory)
        const member = new Member(testMemberData);

        // 3. Generate ID
        console.log("Generating ID...");
        const id = await generateMemberId(member);

        console.log("GENERATED ID:", id);

        if (id.startsWith('MEWS-')) {
            console.log("SUCCESS: ID Format is correct.");
        } else {
            console.log("FAILURE: ID Format is incorrect.");
        }

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await mongoose.disconnect();
    }
}

testRegistrationId();
