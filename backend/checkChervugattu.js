const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Location = require('./models/Location');

dotenv.config();

const checkLocation = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB.");

        const chervugattu = await Location.findOne({ name: { $regex: 'Chervugattu', $options: 'i' } });
        if (chervugattu) {
            console.log(`✅ Found Chervugattu: ${chervugattu._id} (Parent: ${chervugattu.parentLocation})`);
        } else {
            console.log("❌ Chervugattu Not Found.");
            // List available Mandals to decide where to put it
            const mandals = await Location.find({ type: 'MANDAL' });
            console.log("Available Mandals:", mandals.map(m => `${m.name} (${m._id})`).join(', '));
        }

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

checkLocation();
