const mongoose = require('mongoose');
require('dotenv').config();

const Location = require('./models/Location');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
    } catch (err) {
        process.exit(1);
    }
};

const getHierarchy = async (locationId) => {
    if (!locationId) return 'Root';

    let current = await Location.findById(locationId);
    if (!current) return 'Unknown';

    const chain = [];
    chain.unshift(`${current.name} (${current.type})`);

    while (current.parent) {
        current = await Location.findById(current.parent);
        if (current) {
            chain.unshift(`${current.name} (${current.type})`);
        } else {
            break;
        }
    }
    // Remove the last item (self) to just show parent path, or keep it? 
    // User wants "hierarchy level", so full path is good.
    return chain.join(' > ');
};

const checkData = async () => {
    await connectDB();
    try {
        // 1. Municipalities
        const munCount = await Location.countDocuments({ type: 'MUNICIPALITY' });
        console.log(`\nTotal Municipalities found: ${munCount}`);

        if (munCount > 0) {
            const muns = await Location.find({ type: 'MUNICIPALITY' }).limit(20);
            for (const m of muns) {
                const hierarchy = await getHierarchy(m._id);
                console.log(` - ${hierarchy}`);
            }
        }

        // 2. Wards
        const wardCount = await Location.countDocuments({ type: 'WARD' });
        console.log(`\nTotal Wards found: ${wardCount}`);

        if (wardCount > 0) {
            const wards = await Location.find({ type: 'WARD' }).limit(50);
            for (const w of wards) {
                const hierarchy = await getHierarchy(w._id);
                console.log(` - ${hierarchy}`);
            }
        }

        if (munCount === 0 && wardCount === 0) {
            console.log('\nNo Municipality or Ward data found in the Location collection.');
        }

    } catch (error) {
        console.error(error);
    } finally {
        mongoose.connection.close();
    }
};

checkData();
