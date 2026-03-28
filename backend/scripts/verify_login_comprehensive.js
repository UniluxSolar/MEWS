const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Member = require('../models/Member');

const verifyLoginComprehensive = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB.\n");

        const commonPasswords = ['admin123', 'Mews@123', 'mews123', 'password', '123456', 'mews@123'];

        // 1. CHECK ALL ADMINS
        const admins = await User.find({}).limit(10).lean();
        console.log(`--- ADMIN LOGIN CHECK (${admins.length} accounts sampled) ---`);
        for (const admin of admins) {
            let foundPass = null;
            for (const pass of commonPasswords) {
                if (await bcrypt.compare(pass, admin.passwordHash)) {
                    foundPass = pass;
                    break;
                }
            }
            console.log(`👤 Username: ${admin.username} [${admin.role}]`);
            console.log(`   Result: ${foundPass ? `✅ Password is '${foundPass}'` : '❌ Default passwords did not match'}`);
            console.log('-----------------------------------');
        }

        // 2. CHECK MEMBER LOGIN (9874563219 / Mews@9874563219)
        const memberMobile = '9874563219';
        const memberDefaultPass = `Mews@${memberMobile}`;
        const member = await Member.findOne({ mobileNumber: memberMobile });

        if (member && member.passwordHash) {
            const isMatch = await bcrypt.compare(memberDefaultPass, member.passwordHash);
            console.log(`\n--- MEMBER LOGIN CHECK ---`);
            console.log(`👤 Mobile: ${memberMobile}`);
            console.log(`   Expected Pass: ${memberDefaultPass}`);
            console.log(`   Result: ${isMatch ? '✅ SUCCESS' : '❌ FAILED'}`);
        }

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

verifyLoginComprehensive();
