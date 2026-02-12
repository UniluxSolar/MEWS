const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');
const Member = require('../models/Member');
const bcrypt = require('bcryptjs');
const { sendRegistrationNotification } = require('../utils/notificationService');

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const MOBILE = '6303109394';
        const HUZURNAGAR_ID = '697b250dc2ad8e106d22516b';
        const TELANGANA_ID = '697b2507c2ad8e106d2250ce';

        // 1. Raw Update to fix data corruption (Mongoose findOne fails otherwise)
        console.log('Attempting raw update to fix data corruption...');
        const rawCollection = mongoose.connection.db.collection('members');
        const updateResult = await rawCollection.updateOne(
            { mobileNumber: MOBILE, "address.constituency": "Huzurnagar" },
            { $set: { "address.constituency": new mongoose.Types.ObjectId(HUZURNAGAR_ID) } }
        );
        console.log('Raw update result:', updateResult.modifiedCount ? 'Fixed record' : 'No fix needed / record not found with corruption');

        // 2. Now find the member securely
        const member = await Member.findOne({ mobileNumber: MOBILE });
        if (!member) {
            console.error('Member not found even after fix attempt. Check if mobile number exists.');
            process.exit(1);
        }

        console.log('Member found:', member._id);
        member.name = 'Venky';
        member.surname = 'TS_State_Admin';
        member.email = 'uniluxsolar@gmail.com';
        member.role = 'STATE_ADMIN';
        member.assignedLocation = TELANGANA_ID;
        member.mewsId = 'MEWS-STATE-V01';

        await member.save();
        console.log('Member record updated and saved.');

        // 3. Create/Update User record
        let user = await User.findOne({ username: MOBILE });
        const defaultPassword = `Mews@${MOBILE}`;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(defaultPassword, salt);

        if (!user) {
            user = await User.create({
                username: MOBILE,
                email: member.email,
                passwordHash: hashedPassword,
                role: member.role,
                assignedLocation: member.assignedLocation,
                memberId: member._id,
                isActive: true
            });
            console.log('User record created:', user._id);
        } else {
            user.email = member.email;
            user.role = member.role;
            user.assignedLocation = member.assignedLocation;
            user.memberId = member._id;
            await user.save();
            console.log('User record updated:', user._id);
        }

        // 4. Send Notification Email
        console.log('Triggering welcome notification...');
        await sendRegistrationNotification(member);
        console.log('Welcome email sent successfully.');

        process.exit();
    } catch (error) {
        console.error('CRITICAL ERROR:', error);
        process.exit(1);
    }
};

createAdmin();
