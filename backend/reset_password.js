const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const resetPassword = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        const result = await User.findOneAndUpdate(
            { username: 'VillageAdmin1' },
            { passwordHash: hashedPassword },
            { new: true }
        );

        if (result) {
            console.log("Password updated for VillageAdmin1");
        } else {
            console.log("User not found!");
        }
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

resetPassword();
