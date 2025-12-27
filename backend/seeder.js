require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Location = require('./models/Location');
const User = require('./models/User');

const seedData = async () => {
    await connectDB();

    try {
        await Location.deleteMany();
        await User.deleteMany();

        console.log('Data destroyed...');

        // 1. Create State
        const state = await Location.create({
            name: 'Telangana',
            type: 'STATE'
        });

        // 2. Create District
        const district = await Location.create({
            name: 'Hyderabad',
            type: 'DISTRICT',
            parent: state._id
        });

        // 3. Create Mandal
        const mandal = await Location.create({
            name: 'Ameerpet',
            type: 'MANDAL',
            parent: district._id
        });

        // 4. Create Village
        const village = await Location.create({
            name: 'Ameerpet Village',
            type: 'VILLAGE',
            parent: mandal._id
        });

        // 5. Create Super Admin
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('123456', salt);

        await User.create({
            username: 'superadmin',
            email: 'admin@mews.com',
            passwordHash: hashedPassword,
            role: 'SUPER_ADMIN'
        });

        console.log('Sample Hierarchy Created!');
        console.log(`State: ${state.name} -> District: ${district.name} -> Mandal: ${mandal.name} -> Village: ${village.name}`);

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedData();
