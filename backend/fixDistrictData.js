const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Location = require('./models/Location');
const Member = require('./models/Member');

dotenv.config();

const fixDistrictData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB.");

        const members = await Member.find({});

        for (const member of members) {
            let updated = false;

            // If Village is an ID but District/Mandal are missing
            if (member.address.village && mongoose.Types.ObjectId.isValid(member.address.village)) {

                // 1. Fetch Village
                const village = await Location.findById(member.address.village);
                if (village && village.parent) {

                    // 2. Fetch Mandal (Village Parent)
                    // If user has no mandal set, set it.
                    if (!member.address.mandal || !mongoose.Types.ObjectId.isValid(member.address.mandal)) {
                        console.log(`Fixing Mandal for ${member.name}: ${village.parent}`);
                        member.address.mandal = village.parent;
                        updated = true;
                    }

                    // 3. Fetch District (Mandal Parent)
                    const mandal = await Location.findById(village.parent);
                    if (mandal && mandal.parent) {
                        if (!member.address.district || !mongoose.Types.ObjectId.isValid(member.address.district)) {
                            console.log(`Fixing District for ${member.name}: ${mandal.parent}`);
                            member.address.district = mandal.parent;
                            updated = true;
                        }
                    }
                }
            }

            if (updated) {
                await member.save();
                console.log(`✅ Saved ${member.name}`);
            }
        }

        console.log("All member locations normalized.");
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

fixDistrictData();
