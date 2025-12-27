const mongoose = require('mongoose');
const Institution = require('./models/Institution');
require('dotenv').config();

const checkInstitutions = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const count = await Institution.countDocuments();
        console.log(`Total Institutions found: ${count}`);

        if (count > 0) {
            const list = await Institution.find().limit(5);
            console.log("Sample Institutions:", list);
        } else {
            console.log("No institutions found in database.");
        }
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkInstitutions();
