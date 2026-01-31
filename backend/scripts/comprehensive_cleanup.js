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

const comprehensiveCleanup = async () => {
    await connectDB();
    const User = require('../models/User');
    const Member = require('../models/Member');
    const Institution = require('../models/Institution');

    console.log(`\n--- Cleaning up Orphaned Member Roles ---\n`);
    const membersWithRoles = await Member.find({ role: { $ne: 'MEMBER' } });
    let memberCleanCount = 0;

    for (const member of membersWithRoles) {
        const user = await User.findOne({
            $or: [
                { memberId: member._id },
                { username: member.mobileNumber }
            ]
        });

        if (!user) {
            console.log(`[CLEANUP] Reverting Member ${member.name} ${member.surname} (${member.mobileNumber}) to role 'MEMBER'.`);
            member.role = 'MEMBER';
            member.assignedLocation = null;
            await member.save();
            memberCleanCount++;
        }
    }
    console.log(`Reverted ${memberCleanCount} orphaned member roles.`);

    console.log(`\n--- Cleaning up Orphaned Institutions (No active User account) ---\n`);
    // Institutions are created, then an INSTITUTION user is created linking to it.
    // If the INSTITUTION user is deleted, the Institution record might linger.
    const institutions = await Institution.find({});
    let institutionCleanCount = 0;

    for (const inst of institutions) {
        const user = await User.findOne({ institutionId: inst._id });
        if (!user) {
            console.log(`[CLEANUP] Removing Orphaned Institution: ${inst.name} (No associated user found)`);
            await Institution.deleteOne({ _id: inst._id });
            institutionCleanCount++;
        }
    }
    console.log(`Removed ${institutionCleanCount} orphaned institution records.`);

    process.exit();
};

comprehensiveCleanup();
