const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Member = require('./models/Member');

const updateNumbers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const oldNumbers = ['7981585142', '8977760488', '6303109394'];
        const newNumber = '9988774455';

        console.log(`Updating members with numbers ${oldNumbers} to ${newNumber}...`);

        // 1. Update top-level mobileNumber
        const topLevelResult = await Member.updateMany(
            { mobileNumber: { $in: oldNumbers } },
            { $set: { mobileNumber: newNumber } }
        );
        console.log(`Updated ${topLevelResult.modifiedCount} top-level member records.`);

        // 2. Update nested familyMembers mobileNumber
        // This is trickier in MongoDB updateMany for all array elements that match.
        // We'll fetch and iterate if there are any matches in nested arrays, or use arrayFilters if supported/simple.
        // For simplicity and safety in this migration, let's find documents containing these numbers in familyMembers first.
        const membersWithNested = await Member.find({ "familyMembers.mobileNumber": { $in: oldNumbers } });

        let nestedCount = 0;
        for (let m of membersWithNested) {
            let changed = false;
            m.familyMembers.forEach(fm => {
                if (oldNumbers.includes(fm.mobileNumber)) {
                    fm.mobileNumber = newNumber;
                    changed = true;
                    nestedCount++;
                }
            });
            if (changed) {
                await m.save();
            }
        }
        console.log(`Updated ${nestedCount} nested family member phone numbers across ${membersWithNested.length} documents.`);

        console.log('Update complete.');
        process.exit(0);
    } catch (err) {
        console.error('Update failed:', err);
        process.exit(1);
    }
};

updateNumbers();
