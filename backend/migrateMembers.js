const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Member = require('./models/Member');
const Location = require('./models/Location');

dotenv.config();

const migrateMembers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB.");

        const members = await Member.find({});
        console.log(`Found ${members.length} members to check...`);

        for (const member of members) {
            if (!member.address) continue;

            let updated = false;

            // Check District
            // If it looks like a Name (not an ObjectId), look it up
            if (member.address.district && !mongoose.Types.ObjectId.isValid(member.address.district)) {
                const loc = await Location.findOne({ name: { $regex: new RegExp(`^${member.address.district}$`, 'i') }, type: 'DISTRICT' });
                if (loc) {
                    console.log(`Mapping District '${member.address.district}' -> ${loc._id}`);
                    member.address.district = loc._id;
                    updated = true;
                }
            }

            // Check Mandal
            if (member.address.mandal && !mongoose.Types.ObjectId.isValid(member.address.mandal)) {
                // Mandal lookup might be tricky if names duplicate, but assuming uniqueness for now or parent filter if possible
                // Ideally we should filter by parent district if we had it converted first, but standard lookup is okay for now
                const loc = await Location.findOne({ name: { $regex: new RegExp(`^${member.address.mandal}$`, 'i') }, type: 'MANDAL' });
                if (loc) {
                    console.log(`Mapping Mandal '${member.address.mandal}' -> ${loc._id}`);
                    member.address.mandal = loc._id;
                    updated = true;
                } else {
                    // Try approximate match (e.g. Chityal vs Chityala)
                    const locApprox = await Location.findOne({ name: { $regex: new RegExp(`^${member.address.mandal}`, 'i') }, type: 'MANDAL' });
                    if (locApprox) {
                        console.log(`Mapping Mandal (Approx) '${member.address.mandal}' -> ${locApprox.name} (${locApprox._id})`);
                        member.address.mandal = locApprox._id;
                        updated = true;
                    }
                }
            }

            // Check Village
            if (member.address.village && !mongoose.Types.ObjectId.isValid(member.address.village)) {
                const loc = await Location.findOne({ name: { $regex: new RegExp(`^${member.address.village}$`, 'i') }, type: 'VILLAGE' });
                if (loc) {
                    console.log(`Mapping Village '${member.address.village}' -> ${loc._id}`);
                    member.address.village = loc._id;
                    updated = true;
                }
            }

            if (updated) {
                await member.save();
                console.log(`✅ Updated Member ${member._id}`);
            }
        }

        console.log("Migration Complete.");
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

migrateMembers();
