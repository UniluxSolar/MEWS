const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Member = require('./models/Member');

dotenv.config();

const debugData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB Connected.');

        const member = await Member.findOne({});
        if (member) {
            console.log('Sample Member Village:', member.address?.village);
            console.log('Type of Village:', typeof member.address?.village);
        } else {
            console.log('No members found.');
        }

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

debugData();
