const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Member = require('./models/Member');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const checkRecentMembers = async () => {
    await connectDB();
    try {
        console.log('Fetching last 5 created members...');
        const members = await Member.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('mewsId name surname createdAt address verificationStatus');

        if (members.length > 0) {
            console.table(members.map(m => ({
                ID: m.mewsId,
                Name: `${m.name} ${m.surname}`,
                Created: m.createdAt,
                Status: m.verificationStatus,
                Address: m.address?.village // Just ID is enough to see
            })));
        } else {
            console.log('No members found in the database.');
        }

    } catch (error) {
        console.error(error);
    } finally {
        process.exit();
    }
};

checkRecentMembers();
