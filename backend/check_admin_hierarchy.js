const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Location = require('./models/Location');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
    } catch (err) {
        process.exit(1);
    }
};

const getHierarchy = async (locationId) => {
    if (!locationId) return 'All India (Global)';

    let current = await Location.findById(locationId);
    if (!current) return 'Unknown Location';

    const chain = [];
    chain.push(`${current.name} (${current.type})`);

    while (current.parent) {
        current = await Location.findById(current.parent);
        if (current) {
            chain.unshift(`${current.name} (${current.type})`);
        } else {
            break;
        }
    }
    return chain.join(' > ');
};

const checkHierarchy = async () => {
    await connectDB();
    try {
        const users = await User.find({});
        console.log('\n--- ADMIN LOCATION HIERARCHY ---\n');

        // Sort by role for better readability
        const roleOrder = {
            'SUPER_ADMIN': 1,
            'STATE_ADMIN': 2,
            'DISTRICT_ADMIN': 3,
            'MUNICIPALITY_ADMIN': 4,
            'MANDAL_ADMIN': 5,
            'VILLAGE_ADMIN': 6
        };

        users.sort((a, b) => (roleOrder[a.role] || 99) - (roleOrder[b.role] || 99));

        for (const u of users) {
            const path = await getHierarchy(u.assignedLocation);
            console.log(`[${u.role}] ${u.username}`);
            console.log(`   Scope: ${path}`);
            console.log('------------------------------------------------');
        }

    } catch (error) {
        console.error(error);
    } finally {
        mongoose.connection.close();
    }
};

checkHierarchy();
