const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const UserSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', UserSchema);

const run = async () => {
    await connectDB();

    const username = 'annaram_admin';
    const CORRECT_LOCATION_ID = '693ebf050f6afe0bb01aadf7'; // Annaram ID with 4 members

    console.log(`Finding user: ${username}...`);
    const user = await User.findOne({ username: username });

    if (!user) {
        console.log(`User '${username}' not found!`);
        process.exit(1);
    }

    console.log(`Current Location ID: ${user.assignedLocation}`);

    // Update
    user.assignedLocation = new mongoose.Types.ObjectId(CORRECT_LOCATION_ID);
    await user.save();

    console.log(`SUCCESS: Updated '${username}' to assign Location ID: ${CORRECT_LOCATION_ID}`);
    process.exit();
};

run();
