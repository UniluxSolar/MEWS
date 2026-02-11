const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const Member = require('./models/Member');
const User = require('./models/User');

const setAndVerifyMpin = async (mobile, newMpin) => {
    await connectDB();

    try {
        console.log(`\nSetting MPIN for Mobile: ${mobile}, New MPIN: ${newMpin}`);

        // 1. Find User
        let user = await Member.findOne({ mobileNumber: mobile });
        if (!user) {
            console.log("User not found!");
            return;
        }

        console.log(`User Found: ${user.name}`);

        // 2. Set MPIN manually using updateOne to bypass full document validation (e.g. constituency mismatch)
        const salt = await bcrypt.genSalt(10);
        const mpinHash = await bcrypt.hash(newMpin, salt);
        const mpinDigest = crypto.createHash('sha256').update(newMpin).digest('hex');

        await Member.updateOne(
            { _id: user._id },
            {
                $set: {
                    mpinHash: mpinHash,
                    mpinDigest: mpinDigest,
                    isMpinEnabled: true,
                    mpinCreated: true
                }
            }
        );
        // user.mpinHash = await bcrypt.hash(newMpin, salt);
        // user.mpinDigest = crypto.createHash('sha256').update(newMpin).digest('hex');
        // user.isMpinEnabled = true;
        // user.mpinCreated = true;
        // await user.save();
        console.log("✅ MPIN Set Successfully in DB (via updateOne).");

        // 3. Simulate Login Lookup
        console.log("\n--- Simulating Login ---");
        const loginDigest = crypto.createHash('sha256').update(newMpin).digest('hex');

        const candidate = await Member.findOne({ mpinDigest: loginDigest });
        if (candidate) {
            console.log(`✅ Lookup by Digest SUCCESS! Found: ${candidate.name}`);
            const isMatch = await bcrypt.compare(newMpin, candidate.mpinHash);
            console.log(`Bcrypt Verification: ${isMatch ? "✅ PASS" : "❌ FAIL"}`);
        } else {
            console.log("❌ Lookup by Digest FAILED!");
        }

    } catch (err) {
        console.error("Error:", err);
    } finally {
        mongoose.disconnect();
    }
};

const TEST_MOBILE = '9676021721';
const TEST_MPIN = '1234';

setAndVerifyMpin(TEST_MOBILE, TEST_MPIN);
