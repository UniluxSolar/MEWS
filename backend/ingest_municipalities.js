const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
// const csv = require('csv-parser'); // Removed dependency
require('dotenv').config();

const Location = require('./models/Location');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI;
const CSV_PATH = path.join(__dirname, 'data', 'Muncipalities 2026.csv');

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('DB Connection Error:', err);
        process.exit(1);
    }
};

const parseLine = (line) => {
    // Simple CSV parser handling standard comma separation
    // Caveat: Doesn't handle commas inside quotes robustly, but sufficient for known data format
    return line.split(',').map(c => c.trim());
};

const runMigration = async () => {
    await connectDB();

    try {
        const fileContent = fs.readFileSync(CSV_PATH, 'utf8');
        const lines = fileContent.split('\n').filter(l => l.trim().length > 0);

        // Skip Header
        // Header: "S. No",District,Assembly constituency,Corporation/Municipality,Ward Number,...
        const dataLines = lines.slice(1);

        console.log(`Found ${dataLines.length} rows to process.`);

        const cache = {
            states: {},
            districts: {},
            acs: {},
            mandals: {},
            municipalities: {}
        };

        // 1. Get State (Assumption: Telangana)
        let state = await Location.findOne({ name: 'Telangana', type: 'STATE' });
        if (!state) {
            console.log("Creating State: Telangana");
            state = await Location.create({ name: 'Telangana', type: 'STATE' });
        }
        cache.states['Telangana'] = state._id;

        // Process Lines
        for (const line of dataLines) {
            const cols = parseLine(line);
            if (cols.length < 5) continue;

            const districtName = cols[1];
            const acName = cols[2];
            const munName = cols[3];       // e.g., "Adilabad Municipality"
            const wardNum = cols[4];       // e.g., "1"

            if (!districtName || !acName || !munName || !wardNum) continue;

            // --- RESOLVE DISTRICT ---
            let distId = cache.districts[districtName];
            if (!distId) {
                let dist = await Location.findOne({ name: new RegExp(`^${districtName}$`, 'i'), type: 'DISTRICT', parent: state._id });
                if (!dist) {
                    console.log(`Creating Missing District: ${districtName}`);
                    dist = await Location.create({ name: districtName, type: 'DISTRICT', parent: state._id });
                }
                distId = dist._id;
                cache.districts[districtName] = distId;
            }

            // --- RESOLVE AC ---
            const acKey = `${districtName}-${acName}`;
            let acId = cache.acs[acKey];
            if (!acId) {
                let ac = await Location.findOne({ name: new RegExp(`^${acName}$`, 'i'), type: 'CONSTITUENCY', parent: distId });
                if (!ac) {
                    console.log(`Creating Missing AC: ${acName} (Parent: ${districtName})`);
                    ac = await Location.create({ name: acName, type: 'CONSTITUENCY', parent: distId });
                }
                acId = ac._id;
                cache.acs[acKey] = acId;
            }

            // --- RESOLVE MANDAL (New Layer Requirement) ---
            // Strategy: Stripped name (e.g. "Adilabad")
            const baseName = munName.replace(/\s+(Municipality|Corporation|Municipal Corporation)$/i, '').trim();
            const mandalKey = `${acKey}-${baseName}`;

            let mandalId = cache.mandals[mandalKey];
            if (!mandalId) {
                // Try finding existing Mandal under this AC
                let mandal = await Location.findOne({ name: new RegExp(`^${baseName}$`, 'i'), type: 'MANDAL', parent: acId });

                // Fallback: Check 'Rural' or just base name existence
                if (!mandal) {
                    // Try to find ANY mandal with this name? No, risky.
                    // User requirement: MANDAL -> MUNICIPALITY.
                    // If missing, CREATE IT.
                    console.log(`Creating Missing/Bridge Mandal: ${baseName} (Parent: ${acName} AC)`);
                    mandal = await Location.create({ name: baseName, type: 'MANDAL', parent: acId });
                }
                mandalId = mandal._id;
                cache.mandals[mandalKey] = mandalId;
            }

            // --- RESOLVE MUNICIPALITY ---
            // Unique by Name + Mandal Parent
            const munKey = `${mandalKey}-${munName}`;
            let munId = cache.municipalities[munKey];
            if (!munId) {
                let mun = await Location.findOne({ name: munName, type: 'MUNICIPALITY', parent: mandalId });
                if (!mun) {
                    console.log(`Creating Municipality: ${munName} (Parent: ${baseName} Mandal)`);
                    mun = await Location.create({ name: munName, type: 'MUNICIPALITY', parent: mandalId });
                }
                munId = mun._id;
                cache.municipalities[munKey] = munId;
            }

            // --- CREATE WARD ---
            // Name: "Ward X"
            const wardName = `Ward ${wardNum}`;
            const wardExists = await Location.findOne({ name: wardName, type: 'WARD', parent: munId });
            if (!wardExists) {
                // Batch insert logic is faster, but for safety doing one by one or we could upsert.
                // Given uniqueness, check first is safer to avoid dupes on re-run.
                // process.stdout.write('.'); // progress dot
                await Location.create({ name: wardName, type: 'WARD', parent: munId });
            }
        }

        console.log('\n\nIngestion Complete.');

        // --- REASSIGN ADMINS ---
        console.log('Reassigning Municipality Admins...');
        // Find 'Miryalaguda' Municipality
        // We know structure: State -> District(Nalgonda) -> AC(Miryalaguda) -> Mandal(Miryalaguda) -> Municipality(Miryalaguda Municipality)
        // Or similar.
        // Let's search by Type=MUNICIPALITY, Name contains Miryalaguda
        const targetMun = await Location.findOne({
            name: /Miryalaguda Municipality/i,
            type: 'MUNICIPALITY'
        });

        if (targetMun) {
            console.log(`Found Target Municipality: ${targetMun.name} (${targetMun._id})`);
            const updateRes = await User.updateMany(
                { role: 'MUNICIPALITY_ADMIN', username: '9121817188' }, // Targeting specific migration user
                { assignedLocation: targetMun._id }
            );
            console.log(`Updated ${updateRes.modifiedCount} Admin(s) to new location.`);
        } else {
            console.error("Could not find Miryalaguda Municipality to reassign admin!");
        }

    } catch (err) {
        console.error('Migration Failed:', err);
    } finally {
        mongoose.connection.close();
    }
};

runMigration();
