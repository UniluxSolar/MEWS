const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Member = require('./models/Member');
const Location = require('./models/Location');

const listMembers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const numbers = ['7981585142', '8977760488', '6303109394'];
        console.log('Searching for mobile numbers:', numbers);

        const members = await Member.find({ mobileNumber: { $in: numbers } })
            .populate('address.village')
            .populate('address.mandal')
            .populate('address.district');

        if (members.length > 0) {
            console.log('--- Found Members ---');
            members.forEach(m => {
                console.log(`- Name: ${m.name} ${m.surname}`);
                console.log(`  Phone: ${m.mobileNumber}`);
                console.log(`  Role: ${m.role}`);
                console.log(`  Location: ${m.address?.village?.name || 'N/A'}, ${m.address?.mandal?.name || 'N/A'}, ${m.address?.district?.name || 'N/A'}`);
                console.log(`  Status: ${m.verificationStatus}`);
                console.log('---------------------');
            });
        } else {
            console.log('No members found with those mobile numbers.');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

listMembers();
