const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Member = require('./models/Member');

dotenv.config();

// Map of ID to New Details (SC Community Names - Telangana)
const updates = {
    '693cfc781bfe23ca376d121c': { surname: 'Gaddam', name: 'Yadaiah' },
    '693d15200a24996f2233d148': { surname: 'Durgam', name: 'Mallaiah' },
    '693d156c0a24996f2233d152': { surname: 'Mekala', name: 'Swamy' },
    '693d170ba0d1bfbcfccdbc22': { surname: 'Thalla', name: 'Narsimha' },
    '693d28d12aa7b73792d7a2bb': { surname: 'Katta', name: 'Raju' },
    '693d32be2d9857eaa41668e6': { surname: 'Bandi', name: 'Venkatesh' }, // Was Goud
    '693d32be2d9857eaa41668e7': { surname: 'Palle', name: 'Sai' },       // Was Reddy
    '693d32be2d9857eaa41668e8': { surname: 'Mothe', name: 'Ellamma' },
    '693d4bbda5eff0c2eadcaac7': { surname: 'Goleti', name: 'Odelu' }
};

const updateNames = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB.");

        for (const [id, data] of Object.entries(updates)) {
            const member = await Member.findById(id);
            if (member) {
                console.log(`Updating ${member.name} ${member.surname} -> ${data.name} ${data.surname}`);
                member.name = data.name;
                member.surname = data.surname;
                await member.save();
            } else {
                console.log(`Member ${id} not found.`);
            }
        }

        console.log("All names updated.");
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

updateNames();
