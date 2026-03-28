const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });
const User = require('../models/User');

const checkAdminsNear = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({ username: /^8500/ }).lean();
        console.log("Admins starting with 8500:");
        users.forEach(u => console.log(` - ${u.username}`));
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        process.exit(1);
    }
};

checkAdminsNear();
