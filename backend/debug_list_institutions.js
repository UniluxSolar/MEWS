const mongoose = require('mongoose');
const Institution = require('./models/Institution');
require('dotenv').config();

const inspectInstitutions = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const allInstitutions = await Institution.find({});
        console.log(`Found ${allInstitutions.length} institutions.`);

        allInstitutions.forEach(inst => {
            console.log(`- Name: ${inst.name}, Address: "${inst.fullAddress}"`);
        });

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

inspectInstitutions();
