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

const debugMpin = async (mobile, mpinInput) => {
    await connectDB();

    try {
        console.log(`\nDebugging MPIN for Mobile: ${mobile}, Input: ${mpinInput}`);

        // 1. Generate Digest
        const mpinDigest = crypto.createHash('sha256').update(mpinInput).digest('hex');
        console.log(`Generated Digest: ${mpinDigest}`);

        // 2. Lookup User by Mobile first to see what's in DB
        let user = await Member.findOne({ mobileNumber: mobile });
        let type = 'MEMBER';
        if (!user) {
            user = await User.findOne({ mobileNumber: mobile });
            type = 'ADMIN';
        }

        if (!user) {
            console.log("User not found by mobile number!");
            return;
        }

        console.log(`\nUser Found: [${type}] ${user.name || user.username} (${user._id})`);
        console.log(`DB mpinDigest: ${user.mpinDigest}`);
        console.log(`DB mpinHash: ${user.mpinHash}`);
        console.log(`isMpinEnabled: ${user.isMpinEnabled}`);

        // 3. Check Digest Match
        if (user.mpinDigest === mpinDigest) {
            console.log("✅ SHA256 Digests MATCH!");
        } else {
            console.log("❌ SHA256 Digests DO NOT MATCH!");
            console.log(`Expected: ${user.mpinDigest}`);
            console.log(`Actual:   ${mpinDigest}`);
        }

        // 4. Check Bcrypt Match
        if (user.mpinHash) {
            const isMatch = await bcrypt.compare(mpinInput, user.mpinHash);
            console.log(`Bcrypt Compare Result: ${isMatch ? "✅ APPROVED" : "❌ DENIED"}`);
        } else {
            console.log("⚠️ No MPIN Hash found in DB.");
        }

    } catch (err) {
        console.error("Error:", err);
    } finally {
        mongoose.disconnect();
    }
};

// CHANGE THIS TO A KNOWN USER MOBILE AND MPIN FROM YOUR DB OR TESTING
const TEST_MOBILE = '9676021721'; // Example member from previous fetch
const TEST_MPIN = '1234'; // Assume this is what I am testing

debugMpin(TEST_MOBILE, TEST_MPIN);
