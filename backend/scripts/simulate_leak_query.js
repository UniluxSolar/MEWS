const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const simulateQuery = async () => {
    await connectDB();
    const Member = require('../models/Member');

    // Exact IDs from screenshot selection
    const nalgondaId = '697b250cc2ad8e106d2250e1';
    const miryalagudaMuniId = '697b250dc2ad8e106d225418';
    const ward23Id = '697b2512c2ad8e106d228c22'; // Ward ID

    console.log("--- Simulating Miryalaguda Municipality Search ---");
    const query1 = {
        'address.district': new mongoose.Types.ObjectId(nalgondaId),
        'address.municipality': new mongoose.Types.ObjectId(miryalagudaMuniId)
    };
    console.log("Query 1:", JSON.stringify(query1, null, 2));
    const results1 = await Member.find(query1);
    console.log(`Results 1: Found ${results1.length} members.`);

    console.log("\n--- Simulating Ward 23 Search (Strict ID) ---");
    // Note: My backend currently maps ward ID to wardNumber string match.
    // Let's check how the backend builds it.
    const wardLoc = { name: "Ward 23" }; // Mocked fetch
    const shortName = "23";
    const query2 = {
        'address.district': new mongoose.Types.ObjectId(nalgondaId),
        'address.municipality': new mongoose.Types.ObjectId(miryalagudaMuniId),
        'address.wardNumber': { $in: [wardLoc.name, shortName] }
    };
    console.log("Query 2:", JSON.stringify(query2, null, 2));
    const results2 = await Member.find(query2);
    console.log(`Results 2: Found ${results2.length} members.`);

    // Check if the leaking members match EITHER query
    const leakingMembers = await Member.find({ name: { $in: ['erew', 'kpp'] } });
    for (const m of leakingMembers) {
        console.log(`\nChecking Leaking Member: ${m.name}`);
        const matches1 = await Member.findOne({ _id: m._id, ...query1 });
        const matches2 = await Member.findOne({ _id: m._id, ...query2 });
        console.log(`Matches Query 1 (Municipality): ${!!matches1}`);
        console.log(`Matches Query 2 (Ward): ${!!matches2}`);
    }

    process.exit();
};

simulateQuery();
