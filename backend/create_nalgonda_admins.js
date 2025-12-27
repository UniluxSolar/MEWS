const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');
const Location = require('./models/Location');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const createAdmin = async (username, password, role, locationName, locationType, parentName = null) => {
    try {
        let locationQuery = { name: { $regex: new RegExp(`^${locationName}$`, 'i') }, type: locationType };

        // If parent provided, verify parent location to avoid ambiguity 
        // (e.g. multiple villages with same name in different mandals)
        // For simplicity in this script, we'll try to find by name first.

        const location = await Location.findOne(locationQuery);

        if (!location) {
            console.error(`❌ Location not found: ${locationName} (${locationType})`);
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Check if user exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            console.log(`⚠️ User ${username} already exists. Updating...`);
            existingUser.passwordHash = passwordHash;
            existingUser.role = role;
            existingUser.assignedLocation = location._id;
            await existingUser.save();
            console.log(`✅ User updated: ${username}`);
        } else {
            const newUser = await User.create({
                username,
                email: `${username.toLowerCase()}@example.com`,
                passwordHash,
                role,
                assignedLocation: location._id,
                isActive: true
            });
            console.log(`✅ User created: ${username} (Role: ${role}, Location: ${location.name})`);
        }
    } catch (error) {
        console.error(`❌ Error creating ${username}:`, error.message);
    }
};

const seed = async () => {
    await connectDB();

    console.log('\n--- Seeding Nalgonda Admins ---\n');

    // 1. District Admin
    await createAdmin('nalgonda_district_admin', 'Pass@123', 'DISTRICT_ADMIN', 'Nalgonda', 'DISTRICT');

    // 2. Mandal Admins
    await createAdmin('vemulapalle_mandal_admin', 'Pass@123', 'MANDAL_ADMIN', 'Vemulapalle', 'MANDAL');
    await createAdmin('anumula_mandal_admin', 'Pass@123', 'MANDAL_ADMIN', 'Anumula', 'MANDAL');

    // 3. Village Admins
    // Under Vemulapalle
    await createAdmin('amanagal_village_admin', 'Pass@123', 'VILLAGE_ADMIN', 'Amanagal', 'VILLAGE');
    await createAdmin('shettipalem_village_admin', 'Pass@123', 'VILLAGE_ADMIN', 'Shettipalem', 'VILLAGE');

    // Under Anumula
    await createAdmin('annaram_admin', 'Pass@123', 'VILLAGE_ADMIN', 'Annaram', 'VILLAGE');

    console.log('\n--- Seeding Complete ---\n');
    process.exit();
};

seed();
