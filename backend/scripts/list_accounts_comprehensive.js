const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Member = require('../models/Member');
const Institution = require('../models/Institution');
const Location = require('../models/Location');

const listAccounts = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.error("MONGO_URI not found in .env");
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB.\n");

        // 1. LIST USERS (Admins)
        const users = await User.find({}).lean();
        console.log(`--- USERS / ADMINS (${users.length}) ---`);
        for (const user of users) {
            console.log(`👤 Username: ${user.username}`);
            console.log(`   Email: ${user.email || 'N/A'}`);
            console.log(`   Role: ${user.role}`);
            console.log(`   Password Hash: ${user.passwordHash}`);
            console.log('-----------------------------------');
        }

        // 2. LIST MEMBERS
        const members = await Member.find({}).lean();
        console.log(`\n--- MEMBERS (${members.length}) ---`);
        for (const member of members) {
            console.log(`👤 ID: ${member.mewsId || 'N/A'}`);
            console.log(`   Name: ${member.name} ${member.surname}`);
            console.log(`   Mobile: ${member.mobileNumber || 'N/A'}`);
            console.log(`   Email: ${member.email || 'N/A'}`);
            console.log(`   Role: ${member.role || 'MEMBER'}`);
            console.log(`   Password Hash: ${member.passwordHash || 'N/A'}`);
            console.log('-----------------------------------');
        }

        // 3. LIST INSTITUTIONS
        const institutions = await Institution.find({}).lean();
        console.log(`\n--- INSTITUTIONS (${institutions.length}) ---`);
        for (const inst of institutions) {
            console.log(`🏢 Name: ${inst.name}`);
            console.log(`   Type: ${inst.type}`);
            console.log(`   Email: ${inst.email || 'N/A'}`);
            console.log(`   Mobile: ${inst.mobileNumber}`);
            console.log(`   Password Hash: ${inst.passwordHash || 'N/A'}`);
            console.log('-----------------------------------');
        }

        await mongoose.connection.close();
        console.log("\nDone.");
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

listAccounts();
