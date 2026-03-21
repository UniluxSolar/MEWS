const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Member = require('../models/Member');
const Institution = require('../models/Institution');

const standardizePasswords = async () => {
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

            for (const doc of docs) {
                const rawMobile = doc[mobileField] || (name === 'User' ? doc.username : null);
                const cleanMobile = normalizeMobile(rawMobile);

                if (cleanMobile) {
                    const rawPassword = `Mews@${cleanMobile}`;
                    doc.passwordHash = await bcrypt.hash(rawPassword, 10);
                    // Use validateBeforeSave: false to avoid failure due to legacy invalid data (e.g. wrong location IDs)
                    await doc.save({ validateBeforeSave: false });
                    successCount++;
                } else {
                    console.error(`[Error] ${name} (${doc._id}) has missing or invalid mobile: ${rawMobile}`);
                    skipCount++;
                }
            }
            console.log(`✅ ${name}: Updated ${successCount}, Skipped ${skipCount}\n`);
        };

        await updateCollection(User, 'User');
        await updateCollection(Member, 'Member');
        await updateCollection(Institution, 'Institution');

        console.log("Migration Completed.");
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error("Migration Failed:", error);
        process.exit(1);
    }
};

standardizePasswords();
