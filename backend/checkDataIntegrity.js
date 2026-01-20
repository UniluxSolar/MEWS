const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Location = require('./models/Location');
const Member = require('./models/Member');

dotenv.config();

const checkIntegrity = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB.");

        const members = await Member.find({});
        let issues = 0;
        let fixed = 0;

        for (const member of members) {
            let hasIssue = false;
            let log = `Checking ${member.name}: `;

            // Check if Village is valid ObjectId
            if (member.address.village && mongoose.Types.ObjectId.isValid(member.address.village)) {

                const village = await Location.findById(member.address.village);
                if (village) {
                    // Check Mandal Match
                    if (!member.address.mandal || !member.address.mandal.toString().match(/^[0-9a-fA-F]{24}$/) || member.address.mandal.toString() !== village.parent.toString()) {
                        log += `[Fixing Mandal] `;
                        member.address.mandal = village.parent;
                        hasIssue = true;
                    }

                    // Check District Match
                    const mandal = await Location.findById(village.parent);
                    if (mandal) {
                        if (!member.address.district || !member.address.district.toString().match(/^[0-9a-fA-F]{24}$/) || member.address.district.toString() !== mandal.parent.toString()) {
                            log += `[Fixing District] `;
                            member.address.district = mandal.parent;
                            hasIssue = true;
                        }
                    }
                } else {
                    log += `[Invalid Village ID] `;
                    issues++;
                }
            } else {
                log += `[Village is String/Null: ${member.address.village}]`;
                // If village is string, we can't auto-fix easily without lookup, but assume migrated.
                issues++;
            }

            if (hasIssue) {
                await member.save();
                console.log(log + " -> FIXED");
                fixed++;
            }
        }

        console.log("---------------------------------------------------");
        console.log(`Total Members: ${members.length}`);
        console.log(`Issues Found & Fixed: ${fixed}`);
        console.log(`Unresolved Issues (e.g. String Villages): ${issues}`);
        console.log("---------------------------------------------------");

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

checkIntegrity();
