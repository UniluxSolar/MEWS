const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Location = require('./models/Location');
const fs = require('fs');
const path = require('path');
const locationsData = require('./data/telanganaLocations.json');

dotenv.config();

const seedUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('MongoDB Connected...');

        // Clear existing locations and users
        await Location.deleteMany({});
        console.log('Existing locations cleared.');
        await User.deleteMany({});
        console.log('Existing users cleared.');

        // Recursive function to seed locations
        // Returns a map of location names to IDs for user assignment
        const locationMap = {};

        const seedLocation = async (data, type, parentId = null) => {
            const location = await Location.create({
                name: data.name,
                type: type,
                parent: parentId
            });
            locationMap[data.name] = location._id;
            console.log(`Created ${type}: ${data.name}`);

            if (type === 'STATE' && data.districts) {
                for (const dist of data.districts) {
                    await seedLocation(dist, 'DISTRICT', location._id);
                }
            } else if (type === 'DISTRICT' && data.mandals) {
                for (const mandal of data.mandals) {
                    await seedLocation(mandal, 'MANDAL', location._id);
                }
            } else if (type === 'MANDAL' && data.villages) {
                for (const villageName of data.villages) {
                    // Villages are just strings in the JSON based on current file structure
                    await Location.create({
                        name: villageName,
                        type: 'VILLAGE',
                        parent: location._id
                    });
                }
            }
        };

        await seedLocation(locationsData, 'STATE');
        console.log('Location hierarchy seeded successfully.');

        // Helper to find ID by name
        const getId = async (name) => {
            if (!name) return null;
            const loc = await Location.findOne({ name: name });
            return loc ? loc._id : null;
        };

        // Define Admins with their assigned Location Names
        // UPDATED: Using 'admin123' for all users
        const usersList = [
            {
                username: 'VillageAdmin1',
                email: 'village1@mews.com',
                password: 'admin123',
                role: 'VILLAGE_ADMIN',
                locationName: 'Peddakaparthy'
            },
            {
                username: 'VillageAdmin2',
                email: 'village2@mews.com',
                password: 'admin123',
                role: 'VILLAGE_ADMIN',
                locationName: 'Veliminedu'
            },
            {
                username: 'GundlapallyAdmin',
                email: 'gundlapally@mews.com',
                password: 'admin123',
                role: 'VILLAGE_ADMIN',
                locationName: 'Gundlapally'
            },
            {
                username: 'MandalAdmin',
                email: 'mandal@mews.com',
                password: 'admin123',
                role: 'MANDAL_ADMIN',
                locationName: 'Chityala'
            },
            {
                username: 'MandalAdmin2',
                email: 'mandal2@mews.com',
                password: 'admin123',
                role: 'MANDAL_ADMIN',
                locationName: 'Narketpalle'
            },
            {
                username: 'DistrictAdmin1',
                email: 'district1@mews.com',
                password: 'admin123',
                role: 'DISTRICT_ADMIN',
                locationName: 'Nalgonda'
            },
            {
                username: 'SuperAdmin',
                email: 'super@mews.com',
                password: 'admin123',
                role: 'SUPER_ADMIN',
                locationName: null
            }
        ];

        for (const user of usersList) {
            let assignedLocation = null;
            if (user.locationName) {
                assignedLocation = await getId(user.locationName);
                if (!assignedLocation) {
                    console.warn(`Warning: Location '${user.locationName}' not found for user '${user.username}'`);
                }
            }

            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(user.password, salt);

            await User.create({
                username: user.username,
                email: user.email,
                passwordHash,
                role: user.role,
                assignedLocation
            });
            console.log(`Created User: ${user.username}`);
        }

        console.log('Admin users seeded successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding users:', error);
        process.exit(1);
    }
};

seedUsers();
