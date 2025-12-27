const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const checkUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");
        
        const user = await User.findOne({ username: 'VillageAdmin1' });
        if (user) {
            console.log("User found:", user);
            console.log("Role:", user.role);
            console.log("Password Hash:", user.passwordHash ? "Exists" : "Missing");
        } else {
            console.log("User 'VillageAdmin1' NOT found.");
        }
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkUser();
