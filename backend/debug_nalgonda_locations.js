const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Location = require('./models/Location');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const debug = async () => {
    await connectDB();

    const nalgonda = await Location.findOne({ name: 'Nalgonda', type: 'DISTRICT' });
    if (!nalgonda) {
        console.log('Nalgonda District NOT FOUND');
        process.exit();
    }

    console.log(`\nDistrict: ${nalgonda.name} (${nalgonda._id})`);
    console.log('Ancestors:', JSON.stringify(nalgonda.ancestors));

    // Check direct children (Mandals)
    const mandals = await Location.find({ parent: nalgonda._id });
    console.log(`\nFound ${mandals.length} Mandals under Nalgonda:`);

    for (const m of mandals) {
        console.log(`- ${m.name} (${m._id}) [Parent: ${m.parent}]`);
        console.log(`  Ancestors: ${JSON.stringify(m.ancestors)}`);

        // Check Villages
        const villages = await Location.find({ parent: m._id });
        console.log(`  > Found ${villages.length} Villages:`);
        villages.forEach(v => console.log(`    - ${v.name} (${v._id}) [Parent: ${v.parent}]`));
    }

    process.exit();
};

debug();
