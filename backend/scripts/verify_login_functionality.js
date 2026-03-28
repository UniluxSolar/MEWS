const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Member = require('../models/Member');

const verifyLogin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB.\n");

        // 1. VERIFY ADMIN LOGIN (GundlapallyAdmin / admin123)
        const adminUsername = 'GundlapallyAdmin';
        const adminDefaultPass = 'admin123';
        const admin = await User.findOne({ username: adminUsername });

        if (admin) {
            const isMatch = await bcrypt.compare(adminDefaultPass, admin.passwordHash);
            console.log(`[ADMIN] User: ${adminUsername}`);
            console.log(`        Expected Pass: ${adminDefaultPass}`);
            console.log(`        Result: ${isMatch ? '✅ SUCCESS' : '❌ FAILED'}\n`);
        } else {
            console.log(`[ADMIN] User ${adminUsername} not found.\n`);
        }

        // 2. VERIFY MEMBER LOGIN (9874563219 / Mews@9874563219)
        const memberMobile = '9874563219';
        const memberDefaultPass = `Mews@${memberMobile}`;
        const member = await Member.findOne({ mobileNumber: memberMobile });

        if (member && member.passwordHash) {
            const isMatch = await bcrypt.compare(memberDefaultPass, member.passwordHash);
            console.log(`[MEMBER] Mobile: ${memberMobile}`);
            console.log(`         Expected Pass: ${memberDefaultPass}`);
            console.log(`         Result: ${isMatch ? '✅ SUCCESS' : '❌ FAILED'}\n`);
        } else {
            console.log(`[MEMBER] Member with mobile ${memberMobile} not found or has no password hash.\n`);
        }

        // 3. VERIFY ANOTHER ADMIN LOGIN (8500626600 / admin123)
        const superAdminUser = '8500626600';
        const superAdmin = await User.findOne({ username: superAdminUser });
        if (superAdmin) {
            const isMatch = await bcrypt.compare(adminDefaultPass, superAdmin.passwordHash);
             console.log(`[SUPER ADMIN] User: ${superAdminUser}`);
             console.log(`              Expected Pass: ${adminDefaultPass}`);
             console.log(`              Result: ${isMatch ? '✅ SUCCESS' : '❌ FAILED'}\n`);
        }

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

verifyLogin();
