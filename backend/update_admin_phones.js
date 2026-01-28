const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const Member = require('./models/Member');

const updateAdminPhones = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const updates = [
            { username: 'telangana_state_admin', newPhone: '6303109394' },
            { username: 'nalgonda_district_admin', newPhone: '7981585142' },
            { username: '6303109394', newPhone: '1231231231' }
        ];

        for (const update of updates) {
            console.log(`Processing update for Admin: ${update.username}...`);
            const user = await User.findOne({ username: update.username });

            if (user) {
                const oldPhone = user.mobileNumber;
                user.mobileNumber = update.newPhone;

                // If the username looks like a phone number (10 digits), update it too
                if (/^\d{10}$/.test(user.username)) {
                    console.log(`  Updating username from ${user.username} to ${update.newPhone}`);
                    user.username = update.newPhone;
                }

                await user.save();
                console.log(`  User ${update.username}: Updated mobileNumber from ${oldPhone} to ${update.newPhone}`);

                // Also update linked Member if exists
                if (user.memberId) {
                    const member = await Member.findById(user.memberId);
                    if (member) {
                        member.mobileNumber = update.newPhone;
                        await member.save();
                        console.log(`  Linked Member ${member.name}: Updated mobileNumber to ${update.newPhone}`);
                    }
                }
            } else {
                console.log(`  User ${update.username} not found.`);
            }
            console.log('---------------------');
        }

        console.log('Updates complete.');
        process.exit(0);
    } catch (err) {
        console.error('Update failed:', err);
        process.exit(1);
    }
};

updateAdminPhones();
