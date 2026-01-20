const mongoose = require('mongoose');
const User = require('./backend/models/User');
const Member = require('./backend/models/Member');
const Location = require('./backend/models/Location');
const dotenv = require('dotenv');

dotenv.config({ path: './backend/.env' });

const debugParams = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const targetUser = "villageadmin1";
        const admin = await User.findOne({ username: targetUser }).populate('assignedLocation');

        if (!admin) {
            console.log(`User ${targetUser} not found!`);
            return;
        }

        console.log(`\n=== ADMIN: ${admin.username} (${admin.role}) ===`);
        if (!admin.assignedLocation) {
            console.log("No assigned location.");
        } else {
            console.log(`Assigned Location: ${admin.assignedLocation.name} (ID: ${admin.assignedLocation._id}, Type: ${admin.assignedLocation.type})`);

            const locId = admin.assignedLocation._id;
            const locName = admin.assignedLocation.name;

            // 1. Strict Count (ID match)
            const strictCount = await Member.countDocuments({ 'address.village': locId });
            console.log(`Strict Count (ID): ${strictCount}`);

            // 2. Loose Count (String match) - what dashboard might be seeing if buggy
            const looseCount = await Member.countDocuments({ 'address.village': { $regex: locName, $options: 'i' } });
            console.log(`Loose Count (Regex): ${looseCount}`);

            // 3. Check for Members with Missing IDs but String Names
            const missingIdCount = await Member.countDocuments({ 'address.village': { $type: 'string' } }); // mixed type check?
            // Actually, in schema it's ObjectId usually, but maybe it was saved as null?

            // Let's sample a few members to see their data structure
            const sampleMembers = await Member.find().limit(5).select('name address');
            console.log("\n--- Sample Member Data ---");
            sampleMembers.forEach(m => {
                console.log(`${m.name}: Village=${m.address.village}`);
            });
        }

    } catch (e) {
        console.error(e);
    } finally {
        mongoose.connection.close();
    }
};

debugParams();
