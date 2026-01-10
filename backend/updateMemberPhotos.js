const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Member = require('./models/Member');

dotenv.config();

// New Photos (Paths relative to frontend public folder)
const pElderMan = '/profiles/telugu_man_elder.png';
const pElderMan2 = '/profiles/telugu_man_elder_2.png';
const pYoungMan = '/profiles/telugu_man_young.png';
const pYoungMan2 = '/profiles/telugu_man_young_2.png';
const pYoungMan3 = '/profiles/telugu_man_young_3.png';
const pWomanSaree = '/profiles/telugu_woman_saree.png';
const pWomanElder = '/profiles/telugu_woman_elder.png';

const updates = {
    '693cfc781bfe23ca376d121c': pElderMan,   // Yadaiah
    '693d15200a24996f2233d148': pElderMan2,  // Mallaiah (New Photo)
    '693d156c0a24996f2233d152': pYoungMan,   // Swamy
    '693d170ba0d1bfbcfccdbc22': pYoungMan2,  // Narsimha (New Photo)
    '693d28d12aa7b73792d7a2bb': pYoungMan3,  // Raju (New Photo)
    '693d32be2d9857eaa41668e6': pYoungMan2,   // Venkatesh (Shared with Narsimha - acceptable for now or rotate)
    '693d32be2d9857eaa41668e7': pYoungMan,   // Sai (Shared with Swamy)
    '693d32be2d9857eaa41668e8': pWomanSaree, // Ellamma
    '693d4bbda5eff0c2eadcaac7': pElderMan    // Odelu (Shared with Yadaiah)
};

// Fix typo locally before running
const finalUpdates = {
    ...updates,
    '693d32be2d9857eaa41668e6': pYoungMan
};

const updatePhotos = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB.");

        for (const [id, url] of Object.entries(finalUpdates)) {
            const member = await Member.findById(id);
            if (member) {
                console.log(`Updating Photo for ${member.name} ${member.surname}`);
                member.photoUrl = url;
                await member.save();
            }
        }

        console.log("All photos updated.");
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

updatePhotos();
