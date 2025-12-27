const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Member = require('./models/Member');

dotenv.config();

const gundlapallyId = '693d4e18a3515ea44efe03bf'; // From debug log

// Members to move to Gundlapally
const targetMembers = [
    '693d15200a24996f2233d148', // Mallaiah Durgam
    '693d156c0a24996f2233d152', // Swamy Mekala
    '693d170ba0d1bfbcfccdbc22', // Narsimha Thalla
    '693d32be2d9857eaa41668e6'  // Venkatesh Bandi
];

const populate = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB.");

        for (const id of targetMembers) {
            const member = await Member.findById(id);
            if (member) {
                console.log(`Moving ${member.name} ${member.surname} to Gundlapally...`);
                member.address.village = gundlapallyId;
                // Also update Mandal/District to match Gundlapally's parent if needed, 
                // but for now Village assignment is the key for Village Admin Dashboard.
                // Assuming Gundlapally is in Chityal (Mandal) -> Nalgonda (District) based on context,
                // but ID linkage is most important for the specific dashboard query.
                await member.save();
            }
        }

        console.log("✅ Gundlapally Population Complete.");
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

populate();
