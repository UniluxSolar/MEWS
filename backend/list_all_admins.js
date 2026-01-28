const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Member = require('./models/Member');
const User = require('./models/User');
const Location = require('./models/Location');

const listAdmins = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const adminRoles = ['SUPER_ADMIN', 'STATE_ADMIN', 'DISTRICT_ADMIN', 'MANDAL_ADMIN', 'VILLAGE_ADMIN'];

        console.log('--- Admins from User Collection ---');
        const users = await User.find({ role: { $in: adminRoles } });
        for (const u of users) {
            console.log(`- Username: ${u.username}`);
            console.log(`  Role: ${u.role}`);
            console.log(`  Location ID: ${u.assignedLocation || 'Global'}`);
            console.log('---------------------');
        }

        console.log('\n--- Admins from Member Collection ---');
        const members = await Member.find({ role: { $in: adminRoles } })
            .populate('address.village')
            .populate('address.mandal')
            .populate('address.district');

        if (members.length > 0) {
            members.forEach(m => {
                console.log(`- Name: ${m.name} ${m.surname}`);
                console.log(`  Phone: ${m.mobileNumber}`);
                console.log(`  Role: ${m.role}`);
                console.log(`  Location: ${m.address?.village?.name || 'N/A'}, ${m.address?.mandal?.name || 'N/A'}, ${m.address?.district?.name || 'N/A'}`);
                console.log('---------------------');
            });
        } else {
            console.log('No members found with admin roles.');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

listAdmins();
