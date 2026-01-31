const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const diagnoseOrphans = async () => {
    await connectDB();
    const User = require('../models/User');
    const Member = require('../models/Member');
    const Location = require('../models/Location');

    console.log(`\n--- Searching for Members with Admin Roles ---\n`);
    const adminMembers = await Member.find({ role: { $ne: 'MEMBER' } })
        .populate('assignedLocation', 'name type');

    console.log(`Found ${adminMembers.length} members with an assigned Admin Role in their profile.\n`);

    const orphans = [];
    const mismatched = [];

    for (const member of adminMembers) {
        // Check for User record by memberId or mobileNumber (Username)
        const user = await User.findOne({
            $or: [
                { memberId: member._id },
                { username: member.mobileNumber },
                { username: member.mewsId }
            ]
        }).populate('assignedLocation', 'name type');

        if (!user) {
            orphans.push(member);
        } else {
            // Check for role/location mismatch
            if (user.role !== member.role) {
                mismatched.push({ member, user, reason: 'Role Mismatch' });
            } else if (user.assignedLocation?.toString() !== member.assignedLocation?.toString()) {
                mismatched.push({ member, user, reason: 'Location Mismatch' });
            }
        }
    }

    if (orphans.length > 0) {
        console.log(`!!! Found ${orphans.length} ORPHANED Admin Roles (Member has role, but User record is MISSING):\n`);
        orphans.forEach(m => {
            const locName = m.assignedLocation ? `${m.assignedLocation.name} (${m.assignedLocation.type})` : 'None';
            console.log(`- Member: ${m.name} ${m.surname} (${m.mobileNumber})`);
            console.log(`  Role in Profile: ${m.role}`);
            console.log(`  Assigned Location: ${locName}`);
            console.log(`  Reason: This will block promotion but won't appear in Admin List.\n`);
        });
    } else {
        console.log("No orphaned admin roles found.\n");
    }

    if (mismatched.length > 0) {
        console.log(`!!! Found ${mismatched.length} MISMATCHED Admin Records:\n`);
        mismatched.forEach(item => {
            console.log(`- Member: ${item.member.name} ${item.member.surname} (${item.member.mobileNumber})`);
            console.log(`  Reason: ${item.reason}`);
            console.log(`  Member Record: Role=${item.member.role}, Location=${item.member.assignedLocation?.name}`);
            console.log(`  User Record:   Role=${item.user.role}, Location=${item.user.assignedLocation?.name}\n`);
        });
    } else {
        console.log("No mismatched admin records found.\n");
    }

    process.exit();
};

diagnoseOrphans();
