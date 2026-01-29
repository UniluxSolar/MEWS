
const mongoose = require('mongoose');
const Member = require('../models/Member');
const Location = require('../models/Location');
require('dotenv').config();

const verifyStateAdminAccess = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // 1. Find Telangana State
        const telangana = await Location.findOne({ name: 'Telangana', type: 'STATE' });
        if (!telangana) {
            console.log('Telangana State not found in Locations.');
            return;
        }
        console.log(`Found State: ${telangana.name} (${telangana._id})`);

        // 2. Find All Districts in Telangana
        const districts = await Location.find({ parent: telangana._id, type: 'DISTRICT' });
        console.log(`Found ${districts.length} Districts in Telangana:`, districts.map(d => d.name).join(', '));
        const districtIds = districts.map(d => d._id);

        // 3. Find Members in these Districts
        // Logic mimics memberController: query['address.district'] = { $in: districtIds }
        const members = await Member.find({ 'address.district': { $in: districtIds } })
            .select('name surname mewsId address.village address.district')
            .populate('address.village', 'name')
            .populate('address.district', 'name');

        console.log(`\n--- MEMBERS UNDER TELANGANA STATE ADMIN ---`);
        console.log(`Total Members Found: ${members.length}`);

        if (members.length > 0) {
            console.table(members.map(m => ({
                ID: m.mewsId || 'PENDING',
                Name: `${m.name} ${m.surname}`,
                District: m.address?.district?.name || 'Unknown',
                Village: m.address?.village?.name || 'Unknown'
            })));
        } else {
            console.log("No members found assigned to districts in Telangana.");
            // Debug: Check if there are any members at all
            const totalMembers = await Member.countDocuments({});
            console.log(`(Total Members in System: ${totalMembers})`);
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.connection.close();
    }
};

verifyStateAdminAccess();
