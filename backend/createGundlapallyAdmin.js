const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Location = require('./models/Location');
const bcrypt = require('bcryptjs');

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB.");

        // 1. Find the Location
        // We know it's a Village named Gundlapally
        const location = await Location.findOne({ name: 'Gundlapally', type: 'VILLAGE' });

        if (!location) {
            console.error("❌ Location 'Gundlapally' not found!");
            process.exit(1);
        }
        console.log(`✅ Found Location: ${location.name} (${location._id})`);

        // 2. Create the User
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        const newUser = new User({
            username: 'GundlapallyAdmin',
            email: 'gundlapally@mews.com',
            passwordHash: hashedPassword,
            role: 'VILLAGE_ADMIN',
            assignedLocation: location._id
        });

        const savedUser = await newUser.save();
        console.log("\n✅ User Created Successfully!");
        console.log(`👤 Username: ${savedUser.username}`);
        console.log(`📧 Email: ${savedUser.email}`);
        console.log(`🔑 Password: admin123`);
        console.log(`📍 LocationLink: ${savedUser.assignedLocation}`);

        process.exit(0);

    } catch (error) {
        console.error("Error creating user:", error);
        process.exit(1);
    }
};

createAdmin();
