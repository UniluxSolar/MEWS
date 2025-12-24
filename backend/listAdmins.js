const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Location = require('./models/Location');

dotenv.config();

const listAdmins = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB.");

        const users = await User.find({});
        console.log(`\nFound ${users.length} Users:\n`);

        for (const user of users) {
            let locationName = "N/A (Super Admin)";
            if (user.assignedLocation) {
                const loc = await Location.findById(user.assignedLocation);
                locationName = loc ? `${loc.name} (${loc.type})` : `ID: ${user.assignedLocation} (Not Found)`;
            }

            // Use 'username' and 'passwordHash' as per Schema
            const displayName = user.username || user.name || 'Unknown';
            const displayHash = user.passwordHash ? user.passwordHash.substring(0, 10) : (user.password ? user.password.substring(0, 10) : 'No Password');

            console.log(`👤 User: ${displayName}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Role: ${user.role}`);
            console.log(`   Location: ${locationName}`);
            console.log(`   Pass Hash: ${displayHash}...`);
            console.log('-----------------------------------');
        }

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

listAdmins();
