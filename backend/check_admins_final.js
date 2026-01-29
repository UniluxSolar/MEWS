const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Member = require('./models/Member');
const Location = require('./models/Location');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
    } catch (err) {
        process.exit(1);
    }
};

const checkFinal = async () => {
    await connectDB();
    try {
        // 1. System Admins
        const users = await User.find({}).populate('assignedLocation');
        console.log('\n--- SYSTEM ADMINS (User Collection) ---');
        users.forEach(u => {
            let loc = u.assignedLocation ? `${u.assignedLocation.name}` : 'N/A';
            console.log(`${u.username} | ${u.role} | ${loc}`);
        });

        // 2. Promoted Admins
        // Fetch all candidates (role != MEMBER)
        const candidates = await Member.find({ role: { $ne: 'MEMBER' } });

        // Filter in memory to handle "default" value behavior confusion
        // Only accept if role is explicitly one of the admin roles
        const validRoles = ['SUPER_ADMIN', 'STATE_ADMIN', 'DISTRICT_ADMIN', 'MANDAL_ADMIN', 'VILLAGE_ADMIN'];
        const realAdmins = candidates.filter(m => validRoles.includes(m.role));

        console.log(`\n--- PROMOTED ADMINS (Member Collection: ${realAdmins.length}) ---`);
        realAdmins.forEach(m => {
            console.log(`${m.name} ${m.surname} | ${m.role} | ${m.mobileNumber}`);
        });

    } catch (error) {
        console.error(error);
    } finally {
        mongoose.connection.close();
    }
};

checkFinal();
