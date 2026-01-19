const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

dotenv.config();

const verifyCredentials = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB.");

        const users = await User.find({});
        console.log(`\nVerifying ${users.length} Users against password 'admin123'...\n`);
        console.log("--------------------------------------------------------------------------------");
        console.log("| USERNAME            | EMAIL                     | ROLE            | PW VALID? |");
        console.log("--------------------------------------------------------------------------------");

        for (const user of users) {
            const isMatch = await bcrypt.compare('admin123', user.passwordHash);

            // Padding for alignment
            const uName = (user.username || 'N/A').padEnd(19);
            const uEmail = (user.email || 'N/A').padEnd(25);
            const uRole = (user.role || 'N/A').padEnd(15);
            const uValid = isMatch ? "✅ YES" : "❌ NO";

            console.log(`| ${uName} | ${uEmail} | ${uRole} | ${uValid}    |`);
        }
        console.log("--------------------------------------------------------------------------------");

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

verifyCredentials();
