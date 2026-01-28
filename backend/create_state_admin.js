const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');
const Location = require('./models/Location');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const createStateAdmin = async () => {
    await connectDB();

    try {
        // Find the State Location
        const stateLocation = await Location.findOne({ type: 'STATE' });

        if (!stateLocation) {
            console.error('❌ No STATE location found in the database. Please seed locations first.');
            process.exit(1);
        }

        console.log(`Phase 1: Found State - ${stateLocation.name}`);

        const username = 'telangana_state_admin';
        const password = 'Pass@123';
        const role = 'STATE_ADMIN';
        const mobileNumber = '8977760488';

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Check/Update User
        let user = await User.findOne({ username });

        if (user) {
            console.log(`⚠️ User ${username} already exists. Updating credentials...`);
            user.passwordHash = passwordHash;
            user.role = role;
            user.assignedLocation = stateLocation._id;
            user.mobileNumber = mobileNumber;
            await user.save();
            console.log(`✅ State Admin Updated Successfully!`);
        } else {
            user = await User.create({
                username,
                email: 'state_admin@mews.org',
                passwordHash,
                role,
                assignedLocation: stateLocation._id,
                isActive: true,
                mobileNumber
            });
            console.log(`✅ State Admin Created Successfully!`);
        }

        console.log('\n-----------------------------------');
        console.log(`Username: ${username}`);
        console.log(`Password: ${password}`);
        console.log(`Location: ${stateLocation.name}`);
        console.log('-----------------------------------');

    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
    } finally {
        process.exit();
    }
};

createStateAdmin();
