const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

const verifyRemainingAdmins = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const commonPasswords = ['123456', 'admin123', 'Mews@123', 'mews123'];
        const admins = await User.find({}).skip(4).limit(10).lean();
        
        console.log(`--- REMAINING ADMIN LOGIN CHECK ---`);
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

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        process.exit(1);
    }
};

verifyRemainingAdmins();
