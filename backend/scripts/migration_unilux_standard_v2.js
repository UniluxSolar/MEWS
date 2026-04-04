const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Member = require('../models/Member');
const Institution = require('../models/Institution');

const migrateToUniluxStandards = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.error("MONGO_URI not found");
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB.\n");

        const normalizeMobile = (mobile) => {
            if (!mobile) return null;
            const cleaned = mobile.toString().trim().replace(/\D/g, '');
            return cleaned.length >= 10 ? cleaned.slice(-10) : null;
        };

        const updateCollection = async (Model, name, mobileField = 'mobileNumber') => {
            console.log(`--- Processing ${name} ---`);
            const docs = await Model.find({});
            let successCount = 0;
            let skipCount = 0;

            // Target password for all: Mews@6303109394
            const targetPassword = "Mews@6303109394";
            const targetPasswordHash = await bcrypt.hash(targetPassword, 10);
            
            // Standard email for all: uniluxsolar@gmail.com
            const targetEmail = "uniluxsolar@gmail.com";

            for (const doc of docs) {
                const rawMobile = doc[mobileField] || (name === 'User' ? doc.username : null);
                const cleanMobile = normalizeMobile(rawMobile || '');

                // 1. Set Password to Mews@6303109394
                doc.passwordHash = targetPasswordHash;
                
                // 2. Set Email to uniluxsolar@gmail.com
                doc.email = targetEmail;

                // 3. For User model, ensure username is the clean mobile if it was N/A
                if (name === 'User' && !doc.username) {
                    if (cleanMobile) doc.username = cleanMobile;
                    else doc.username = `user_${doc._id.toString().slice(-4)}`;
                }

                // Use validateBeforeSave: false to avoid failure due to legacy invalid data
                await doc.save({ validateBeforeSave: false });
                successCount++;
            }
            console.log(`\u2705 ${name}: Updated ${successCount}, Skipped ${skipCount}\n`);
        };

        await updateCollection(User, 'User');
        await updateCollection(Member, 'Member');
        await updateCollection(Institution, 'Institution');

        console.log("Migration Completed to Unilux Standards.");
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error("Migration Failed:", error);
        process.exit(1);
    }
};

migrateToUniluxStandards();
