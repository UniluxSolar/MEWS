const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { generateMemberId } = require('../utils/idGenerator');
const Location = require('../models/Location');
const IdCounter = require('../models/IdCounter');

dotenv.config({ path: '../.env' });

const run = async () => {
    try {
        console.log("Connecting to DB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected.");

        const timestamp = Date.now();
        // 1. Create Dummy Locations
        console.log("Creating Dummy Locations...");
        const telangana = await Location.create({
            name: `Telangana_${timestamp}`,
            type: 'STATE'
        });

        // Use a known district name to verify mapping
        const district = await Location.create({
            name: "Warangal", // Should map to 32
            type: 'DISTRICT',
            parent: telangana._id
        });

        console.log(`Created District: Warangal (${district._id})`);

        // 2. Mock Member Object (Partial)
        const mockMember1 = {
            _id: new mongoose.Types.ObjectId(),
            address: {
                district: district._id,
                state: "Telangana" // Optional if parent logic works
            }
        };

        // 3. Generate ID 1
        console.log("Generating ID for Member 1...");
        const id1 = await generateMemberId(mockMember1);
        console.log(`Generated ID 1: ${id1}`);

        if (!id1.includes('MEWS-2026-24-32-')) { // Assuming 2026
            console.error("FAIL: ID format mismatch! Expected to contain MEWS-2026-24-32-");
        } else {
            console.log("PASS: ID format correct.");
        }

        // 4. Generate ID 2 (Verify Increment)
        const mockMember2 = {
            _id: new mongoose.Types.ObjectId(),
            address: {
                district: district._id
            }
        };

        console.log("Generating ID for Member 2...");
        const id2 = await generateMemberId(mockMember2);
        console.log(`Generated ID 2: ${id2}`);

        const seq1 = parseInt(id1.split('-').pop());
        const seq2 = parseInt(id2.split('-').pop());

        if (seq2 === seq1 + 1) {
            console.log("PASS: Auto-increment verified.");
        } else {
            console.error(`FAIL: Auto-increment failed! ${seq1} -> ${seq2}`);
        }

        // Cleanup
        console.log("Cleaning up...");
        await Location.deleteOne({ _id: telangana._id });
        await Location.deleteOne({ _id: district._id });
        // Optionally delete counter for this key to keep environment clean?
        // await IdCounter.deleteOne({ key: `24-32-2026` }); 

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await mongoose.disconnect();
    }
};

run();
