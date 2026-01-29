const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Location = require('./models/Location');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('Connection Error:', err);
        process.exit(1);
    }
};

const listAdmins = async () => {
    await connectDB();

    try {
        const admins = await User.find({}).populate('assignedLocation');

        console.log('\n--- Admin Users List ---\n');

        if (admins.length === 0) {
            console.log('No admin users found.');
        } else {
            admins.forEach(admin => {
                let locName = 'N/A';
                if (admin.assignedLocation) {
                    locName = admin.assignedLocation.name + ' (' + admin.assignedLocation.type + ')';
                }

                console.log(`ID: ${admin._id}`);
                console.log(`Username: ${admin.username}`);
                console.log(`Role: ${admin.role}`);
                console.log(`Mobile: ${admin.mobileNumber || 'N/A'}`);
                console.log(`Assigned Location: ${locName}`);
                console.log(`Status: ${admin.isActive ? 'Active' : 'Inactive'}`);
                console.log('-----------------------------------');
            });
        }

    } catch (error) {
        console.error('Error fetching admins:', error);
    } finally {
        mongoose.connection.close();
    }
};

listAdmins();
