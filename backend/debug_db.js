const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env
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

// Define minimal schemas to avoid import issues
const UserSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', UserSchema);

const MemberSchema = new mongoose.Schema({}, { strict: false });
const Member = mongoose.model('Member', MemberSchema);

const LocationSchema = new mongoose.Schema({}, { strict: false });
const Location = mongoose.model('Location', LocationSchema);

const run = async () => {
    await connectDB();

    console.log('\n--- DEBUG DIAGNOSIS ---\n');

    // 1. Find Admin User (assuming role matches or just list recent users)
    const admins = await User.find({ role: { $in: ['VILLAGE_ADMIN', 'MANDAL_ADMIN'] } }).limit(5);
    console.log('--- ADMIN USERS ---');
    for (const u of admins) {
        console.log(`User: ${u.username} (${u.role})`);
        console.log(`  AssignedLoc ID: ${u.assignedLocation}`);
        if (u.assignedLocation) {
            const loc = await Location.findById(u.assignedLocation);
            console.log(`  -> Location Name: '${loc ? loc.name : 'NOT FOUND'}' Type: ${loc ? loc.type : 'N/A'}`);

            // Search for variants
            if (loc) {
                const variants = await Location.find({ name: { $regex: loc.name.trim(), $options: 'i' } });
                console.log(`  -> Variants found in DB for '${loc.name.trim()}':`);
                variants.forEach(v => console.log(`     - Name: '${v.name}' (ID: ${v._id}) Type: ${v.type}`));
            }
        }
    }

    // 2. Member Distribution
    console.log('\n--- MEMBER DISTRIBUTION BY VILLAGE ---');
    // Aggregate members by address.village
    const distribution = await Member.aggregate([
        { $group: { _id: "$address.village", count: { $sum: 1 } } }
    ]);

    for (const group of distribution) {
        let locName = 'Unknown/Null';
        if (group._id) {
            const loc = await Location.findById(group._id);
            locName = loc ? loc.name : 'Invalid ID';
        }
        console.log(`Village ID: ${group._id} | Name: '${locName}' | Count: ${group.count}`);
    }

    console.log('\n--- END DEBUG ---');
    process.exit();
};

run();
