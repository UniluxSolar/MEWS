const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const Location = require('../models/Location');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Connect to MongoDB
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
};

const importData = async () => {
    try {
        await connectDB();

        console.log('Reading TSV file...');
        const filePath = path.join(__dirname, '../../District_mandal_Village wise Data.txt');
        const fileContent = fs.readFileSync(filePath, 'utf-8');

        // Split by new line, remove header, and filter empty lines
        const lines = fileContent.split('\n').filter(line => line.trim() !== '');
        // const header = lines[0]; // Skip header
        const rows = lines.slice(1);

        console.log(`Found ${rows.length} rows of data.`);

        // Clear existing locations
        console.log('Clearing existing locations...');
        await Location.deleteMany({});
        console.log('Locations cleared.');

        const states = new Map(); // Name -> { name, type: 'STATE' }
        const districts = new Map(); // "State-District" -> { name, type: 'DISTRICT', parentName: State }
        const mandals = new Map(); // "State-District-Mandal" -> { name, type: 'MANDAL', parentKey: "State-District", stateName, districtName }
        const villages = []; // { name, type: 'VILLAGE', parentKey: "State-District-Mandal", stateName, districtName, mandalName }

        console.log('Parsing data structures...');
        for (const row of rows) {
            const cols = row.split('\t');
            if (cols.length < 7) continue;

            const stateName = cols[2].trim();
            const districtName = cols[3].trim();
            const mandalName = cols[5].trim();
            const villageName = cols[6].trim();
            // Optional Pincode from column 7 (if exists in updated file)
            const pincode = cols[7] ? cols[7].trim() : "";

            // Collect unique entities
            states.set(stateName, { name: stateName, type: 'STATE', ancestors: [] });

            const districtKey = `${stateName}-${districtName}`;
            if (!districts.has(districtKey)) {
                districts.set(districtKey, {
                    name: districtName,
                    type: 'DISTRICT',
                    parentName: stateName
                });
            }

            const mandalKey = `${districtKey}-${mandalName}`;
            if (!mandals.has(mandalKey)) {
                mandals.set(mandalKey, {
                    name: mandalName,
                    type: 'MANDAL',
                    parentKey: districtKey,
                    stateName,
                    districtName
                });
            }

            villages.push({
                name: villageName,
                type: 'VILLAGE',
                parentKey: mandalKey,
                stateName,
                districtName,
                districtName,
                mandalName,
                pincode
            });
        }

        // 1. Bulk Insert States
        console.log(`Inserting ${states.size} States...`);
        const stateDocs = await Location.insertMany(Array.from(states.values()));
        const stateMap = new Map(); // name -> _id
        stateDocs.forEach(doc => stateMap.set(doc.name, doc._id));

        // 2. Bulk Insert Districts
        console.log(`Inserting ${districts.size} Districts...`);
        const districtArray = Array.from(districts.values()).map(d => ({
            name: d.name,
            type: d.type,
            parent: stateMap.get(d.parentName),
            ancestors: [{ locationId: stateMap.get(d.parentName), name: d.parentName, type: 'STATE' }]
        }));
        const districtDocs = await Location.insertMany(districtArray);
        const districtMap = new Map(); // "State-District" -> _id
        districtDocs.forEach(doc => {
            // Reconstruct key: We know parent is state. But easier is to iterate input map again if needed.
            // Better: stateMap name is unique? Yes.
            // Wait, we need to map back to the key "State-District".
            // Since we inserted in order (map values), let's rely on matching logic or more robustly:
            // We can store a temp key in the doc but schema is strict.
            // Let's loop created docs and find their state name.
        });

        // Re-mapping strategy: 
        // Build a lookup: districtMap Key -> ID.
        // Since we iterate `districts.values()` to create array, the index matches.
        const districtKeys = Array.from(districts.keys());
        districtDocs.forEach((doc, index) => {
            districtMap.set(districtKeys[index], doc._id);
        });

        // 3. Bulk Insert Mandals
        console.log(`Inserting ${mandals.size} Mandals...`);
        const mandalArray = Array.from(mandals.values()).map(m => {
            const stateId = stateMap.get(m.stateName);
            const districtId = districtMap.get(m.parentKey);
            return {
                name: m.name,
                type: m.type,
                parent: districtId,
                ancestors: [
                    { locationId: stateId, name: m.stateName, type: 'STATE' },
                    { locationId: districtId, name: m.districtName, type: 'DISTRICT' }
                ]
            };
        });
        const mandalDocs = await Location.insertMany(mandalArray);
        const mandalMap = new Map(); // "State-District-Mandal" -> _id
        const mandalKeys = Array.from(mandals.keys());
        mandalDocs.forEach((doc, index) => {
            mandalMap.set(mandalKeys[index], doc._id);
        });

        // 4. Bulk Insert Villages
        console.log(`Inserting ${villages.length} Villages...`);
        const villageArray = villages.map(v => {
            const stateId = stateMap.get(v.stateName);
            const districtId = districtMap.get(`${v.stateName}-${v.districtName}`);
            const mandalId = mandalMap.get(v.parentKey);
            return {
                name: v.name,
                type: 'VILLAGE',
                parent: mandalId,
                ancestors: [
                    { locationId: stateId, name: v.stateName, type: 'STATE' },
                    { locationId: districtId, name: v.districtName, type: 'DISTRICT' },
                    { locationId: mandalId, name: v.mandalName, type: 'MANDAL' }
                ]
            };
        });

        // Insert villages in chunks to avoid memory/packet size issues
        const chunkSize = 1000;
        for (let i = 0; i < villageArray.length; i += chunkSize) {
            const chunk = villageArray.slice(i, i + chunkSize);
            await Location.insertMany(chunk);
            process.stdout.write(`Inserted villages ${Math.min(i + chunkSize, villageArray.length)} / ${villageArray.length}\r`);
        }

        console.log(`\nImport Completed! Processed ${villages.length} villages.`);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

importData();
