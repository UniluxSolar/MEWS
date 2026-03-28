const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

const checkUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const username = '8500626660';
        const user = await User.findOne({ 
            $or: [
                { username: username },
                { mobileNumber: username },
                { mobileNumber: `+91${username}` }
            ]
        });
        
        console.log(`Checking for user: ${username}`);
        if (user) {
            console.log(`✅ Found User: ${user.username} [${user.role}]`);
        } else {
            console.log(`❌ User NOT found.`);
        }

        const closeUser = await User.findOne({ username: '8500626600' });
        if (closeUser) {
            console.log(`💡 Note: User 8500626600 (one digit diff) EXISTS.`);
        }

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        process.exit(1);
    }
};

checkUser();
