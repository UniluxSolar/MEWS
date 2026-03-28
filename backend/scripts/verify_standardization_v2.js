const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Member = require('../models/Member');
const Institution = require('../models/Institution');

const verifyStandardization = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB.\n");

        const testAccounts = [
            { model: User, id: '8500626600', field: 'username', name: 'Admin (8500626600)' },
            { model: Member, id: '9874563219', field: 'mobileNumber', name: 'Member (9874563219)' },
            { model: Institution, id: '9245458215', field: 'mobileNumber', name: 'Institution (9245458215)' }
        ];

        console.log("--- FINAL VERIFICATION ---");
        for (const test of testAccounts) {
            const query = {};
            query[test.field] = test.id;
            const doc = await test.model.findOne(query);

            if (doc && doc.passwordHash) {
                const pass = `Mews@${test.id.slice(-10)}`;
                const isMatch = await bcrypt.compare(pass, doc.passwordHash);
                console.log(`👤 ${test.name}`);
                console.log(`   Expected Pass: ${pass}`);
                console.log(`   Result: ${isMatch ? '✅ SUCCESS' : '❌ FAILED'}`);
            } else {
                console.log(`❌ ${test.name} not found or missing hash.`);
            }
            console.log('---------------------------');
        }

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error("Verification error:", error);
        process.exit(1);
    }
};

verifyStandardization();
