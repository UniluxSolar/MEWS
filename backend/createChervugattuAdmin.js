const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB.");

        const chervugattuId = '693d4e18a3515ea44efe03c9';

        // Check if exists
        const exists = await User.findOne({ email: 'chervugattu@mews.com' });
        if (exists) {
            console.log("User already exists. Updating location...");
            exists.assignedLocation = chervugattuId;
            exists.role = 'VILLAGE_ADMIN';
            exists.passwordHash = await bcrypt.hash('admin123', 10);
            await exists.save();
            console.log("User Updated.");
        } else {
            console.log("Creating new user...");
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await User.create({
                username: 'ChervugattuAdmin',
                email: 'chervugattu@mews.com',
                passwordHash: hashedPassword,
                role: 'VILLAGE_ADMIN',
                assignedLocation: chervugattuId,
                isActive: true
            });
            console.log("User Created.");
        }

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

createAdmin();
