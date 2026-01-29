const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Member = require('./models/Member');
const Location = require('./models/Location');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('Connection Error:', err);
        process.exit(1);
    }
};

const checkAllAdmins = async () => {
    await connectDB();

    try {
        // 1. Check User Collection
        const userCount = await User.countDocuments({});
        console.log(`\nTotal Documents in 'users' collection: ${userCount}`);

        const users = await User.find({}).populate('assignedLocation');
        console.log('\n--- USERS COLLECTION (System Admins) ---');
        users.forEach(u => {
            let loc = u.assignedLocation ? `${u.assignedLocation.name} (${u.assignedLocation.type})` : 'N/A';
            console.log(`[USER] ${u.username} | Role: ${u.role} | Mobile: ${u.mobileNumber} | Loc: ${loc}`);
        });

        // 2. Check Member Collection for Admin Roles
        const memberAdminCount = await Member.countDocuments({ role: { $ne: 'MEMBER' } });
        console.log(`\nTotal Members with Admin Role: ${memberAdminCount}`);

        if (memberAdminCount > 0) {
            const memberAdmins = await Member.find({ role: { $ne: 'MEMBER' } });
            console.log('\n--- MEMBERS COLLECTION (Promoted Admins?) ---');
            memberAdmins.forEach(m => {
                console.log(`[MEMBER] ${m.name} ${m.surname} | Role: ${m.role} | Mobile: ${m.mobileNumber}`);
            });
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.connection.close();
    }
};

checkAllAdmins();
