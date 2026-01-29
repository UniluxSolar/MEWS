const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Member = require('./models/Member');
const Location = require('./models/Location');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('Connection Error:', err);
        process.exit(1);
    }
};

const resetAdmins = async () => {
    await connectDB();

    try {
        console.log('--- STARTING ADMIN RESET ---');

        // 1. DELETE ALL USERS (ADMINS)
        const deleteResult = await User.deleteMany({});
        console.log(`Deleted ${deleteResult.deletedCount} existing User/Admin records.`);

        // 2. RESET ALL MEMBERS TO 'MEMBER' ROLE
        const updateResult = await Member.updateMany(
            { role: { $ne: 'MEMBER' } },
            { $set: { role: 'MEMBER' } }
        );
        console.log(`Reset role for ${updateResult.modifiedCount} Members to 'MEMBER'.`);

        // 3. FETCH LOCATIONS
        console.log('Fetching Location IDs...');

        // Helper to find location
        const findLoc = async (name, type) => {
            const regex = new RegExp(`^${name}$`, 'i');
            const loc = await Location.findOne({ name: regex, type: type });
            if (!loc) {
                console.warn(`WARNING: Location '${name}' (${type}) not found!`);
                return null;
            }
            return loc._id;
        };

        const stateId = await findLoc('Telangana', 'STATE');
        const districtId = await findLoc('Nalgonda', 'DISTRICT');
        const mandalId = await findLoc('Vemulapalle', 'MANDAL'); // Note: Spelling from user request

        let municipalityId = await findLoc('Miryalaguda', 'MUNICIPALITY');
        if (!municipalityId) {
            console.log('Miryalaguda Municipality not found, falling back to Mandal...');
            municipalityId = await findLoc('Miryalaguda', 'MANDAL');
        }

        const villageId = await findLoc('Shettipalem', 'VILLAGE');

        // 4. PREPARE ADMIN DATA
        // Default password '123456' hashed
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('123456', salt);

        const newAdmins = [
            {
                role: 'SUPER_ADMIN',
                mobile: '8500626600',
                username: '8500626600', // Username same as mobile for consistency
                location: null, // Global
                locationName: 'All India'
            },
            {
                role: 'STATE_ADMIN',
                mobile: '8977760488',
                username: '8977760488',
                location: stateId,
                locationName: 'Telangana'
            },
            {
                role: 'DISTRICT_ADMIN',
                mobile: '7981585142',
                username: '7981585142',
                location: districtId,
                locationName: 'Nalgonda'
            },
            {
                role: 'MANDAL_ADMIN',
                mobile: '9398412240',
                username: '9398412240',
                location: mandalId,
                locationName: 'Vemulapalle'
            },
            {
                role: 'MUNICIPALITY_ADMIN',
                mobile: '9121817188',
                username: '9121817188',
                location: municipalityId,
                locationName: 'Miryalaguda'
            },
            {
                role: 'VILLAGE_ADMIN',
                mobile: '6303109394',
                username: '6303109394',
                location: villageId,
                locationName: 'Shettipalem'
            }
        ];

        // 5. CREATE ADMINS
        console.log('Creating new Admin accounts...');
        for (const admin of newAdmins) {
            // Check if user already exists (sanity check)
            const exists = await User.findOne({ mobileNumber: admin.mobile });
            if (exists) {
                console.log(`Skipping ${admin.role} (${admin.mobile}) - Already exists ??`);
                continue;
            }

            // Check for Member linking
            const member = await Member.findOne({ mobileNumber: admin.mobile });
            let memberId = null;
            if (member) {
                memberId = member._id;
                console.log(`  -> Linked to Member: ${member.name} ${member.surname}`);

                // OPTIONAL: Update Member Role to match (Requested behavior unclear, but likely safe to keep synced)
                // The request said "Remove all existing Admin records... Do NOT delete regular Member records"
                // It didn't explicitly say "Update Member.role", but usually it's good practice.
                // However, 'checkAllAdmins' looks for Members with role != MEMBER.
                // So if we want them to show up as "Promoted Admins" logic, we should update.
                // But this creates dual entry (User + Member).
                // I will NOT update Member role to avoid confusion, keeping them as 'MEMBER' in member collection
                // but giving them 'User' doc with Admin privileges. 
                // Wait, logic says "Each Admin is linked to an existing Member record".
                // User said "Reset Member roles to MEMBER" initially? 
                // "Remove all existing Admin records ... Reset Member roles" -> This implies we want a clean slate.
                // I will update the Member role to match the new Admin role so they are consistent.

                /* 
                   UPDATE: Re-reading "Remove all existing Admin records ... This should delete only Admin-role mappings".
                   If I update Member.role, I am recreating the mapping.
                   For "Promoted Admin" style login (where they login as Member), this is needed.
                   For "System Admin" login (User collection), it's not strictly needed but good for UI.
                   I will update it.
                */
                member.role = admin.role;
                await member.save();
                console.log(`  -> Updated Member role to ${admin.role}`);
            } else {
                console.log(`  -> No matching Member found for ${admin.mobile}`);
            }

            const newUser = new User({
                username: admin.username,
                mobileNumber: admin.mobile,
                role: admin.role,
                assignedLocation: admin.location,
                passwordHash: passwordHash,
                isActive: true,
                isPhoneVerified: true,
                memberId: memberId
            });

            await newUser.save();
            console.log(`Success: Created ${admin.role} [${admin.mobile}] for ${admin.locationName}`);
        }

        console.log('--- ADMIN RESET COMPLETE ---');

    } catch (error) {
        console.error('CRITICAL ERROR:', error);
    } finally {
        mongoose.connection.close();
    }
};

resetAdmins();
