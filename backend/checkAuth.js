const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

dotenv.config();

const checkUser = async () => {
    try {
        console.log('Connecting to DB at:', process.env.MONGO_URI ? 'URI Found' : 'URI Missing');
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB Connected.');

        const username = 'VillageAdmin1';
        const password = 'password123';

        const user = await User.findOne({ username });

        if (!user) {
            console.log(`User '${username}' NOT FOUND.`);
        } else {
            console.log(`User '${username}' FOUND.`);
            console.log('Role:', user.role);
            console.log('Password Hash:', user.passwordHash);

            const isMatch = await bcrypt.compare(password, user.passwordHash);
            console.log(`Password '${password}' match result:`, isMatch);
        }

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkUser();
