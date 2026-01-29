const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
require('dotenv').config();

const Location = require('./models/Location');
const Member = require('./models/Member');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI;

// --- CONFIG ---
const STATE_NAME = 'Telangana';
const VILLAGE_CSV_PATH = path.join(__dirname, 'data', 'Villages 2025  - Sarpanch 2025 .csv');
const MUNCIPALITY_CSV_PATH = path.join(__dirname, 'data', 'Muncipalities 2026.csv');

// --- HELPERS ---
const normalize = (str) => {
    if (!str) return '';
    return str.toString().trim();
};

const toTitleCase = (str) => {
    if (!str) return '';
    return str.toString().trim().replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

// Global Cache: Key -> Document
const cache = new Map();

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

const readCSV = (filePath) => {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', reject);
    });
};

// --- DATA STRUCTURES FOR AGGREGATION ---
// We need to group by levels to insert in order
// Sets to store unique signatures: "ParentID|NormalizedName"
const uniqueDistricts = new Map(); // Name -> { name }
const uniqueConstituencies = new Map(); // "DistrictName|ConstName" -> { district, name }
const uniqueMandals = new Map(); // "ConstName|MandalName" -> { constituency, name, district } (Note: Mandal depends on Constituency?)
// Wait, Mandal is child of Constituency? In schema?
// CSV: District, Assembly, Mandal.
// Yes, hierarchy: Dist -> Const -> Mandal.
// Note: Some Mandals might be in multiple constituencies? Unlikely.
const uniqueMunicipalities = new Map();
const uniqueVillages = new Map(); // "MandalName|VillageName"
const uniqueWards = new Map();

// --- STEP 1: BACKUP OLD MAPPINGS (Identical to v2) ---
// Old ID to Signature Map
const oldIdMap = new Map();
const backupOldMappings = async () => {
    console.log('--- Backup Old Signatures ---');
    const allLocations = await Location.find({}).lean();
    const idToDoc = new Map();
    allLocations.forEach(loc => idToDoc.set(loc._id.toString(), loc));

    const getSignature = (loc) => {
        if (!loc) return null;
        let sig = { type: loc.type, name: normalize(loc.name) };
        if (loc.parent) {
            const parent = idToDoc.get(loc.parent.toString());
            if (parent) {
                sig.parent = normalize(parent.name);
                sig.parentType = parent.type;
                if (parent.parent) {
                    const gp = idToDoc.get(parent.parent.toString());
                    if (gp) sig.grandParent = normalize(gp.name);
                }
            }
        }
        return sig;
    };

    allLocations.forEach(loc => {
        const sig = getSignature(loc);
        if (sig) oldIdMap.set(loc._id.toString(), sig);
    });
    console.log(`Backed up ${oldIdMap.size} signatures.`);
};

// --- STEP 3: CREATE / INSERT BATCH ---
const createLevel = async (items, type, getParentDoc) => {
    console.log(`Creating ${items.length} ${type}s...`);

    // We process in chunks to avoid memory/connection limits if massive
    const CHUNK_SIZE = 1000;
    const errors = [];

    for (let i = 0; i < items.length; i += CHUNK_SIZE) {
        const chunk = items.slice(i, i + CHUNK_SIZE);
        const docs = [];

        for (const item of chunk) {
            const name = toTitleCase(item.name);
            const parentDoc = getParentDoc(item);

            if (!parentDoc && type !== 'STATE') {
                // console.warn(`Missing parent for ${type} ${name}`);
                continue;
            }

            let ancestors = [];
            if (parentDoc) {
                ancestors = [...(parentDoc.ancestors || [])];
                ancestors.push({
                    locationId: parentDoc._id,
                    name: parentDoc.name,
                    type: parentDoc.type
                });
            }

            docs.push({
                name: name,
                type: type,
                parent: parentDoc ? parentDoc._id : null,
                ancestors: ancestors,
                uniqueKey: item.key // Temp for mapping back
            });
        }

        if (docs.length > 0) {
            const saved = await Location.insertMany(docs);
            // Update Cache
            // We need to map Input Item -> Saved Doc
            // Since insertMany returns docs in order (mostly), we can map.
            // BETTER: Store uniqueKey to map back. We added uniqueKey to schema? No.
            // We cannot rely on order 100%.
            // We must fetch back or assume/hope. 
            // ACTUALLY: Location schema doesn't have uniqueKey. 
            // We can add it temporarily OR just iterate and map.

            // Strategy: We have the docs with _ids now.
            // Map `Type:Name:ParentID` -> Doc.
            saved.forEach(doc => {
                const pId = doc.parent ? doc.parent.toString() : 'ROOT';
                // Check if we lost the original casing/normalization comparison?
                // doc.name is TitleCased.
                // Cache Key: item.key was generated how?
                // Let's rely on standard key generation.
                const key = `${type}:${doc.name}:${pId}`;
                cache.set(key, doc);
            });
        }
        // process.stdout.write('.');
    }
    console.log(`\nDone ${type}s.`);
};

const run = async () => {
    await connectDB();
    await backupOldMappings(); // Do this before clear!

    // Read CSVs
    console.log('Reading CSVs...');
    const vRows = await readCSV(VILLAGE_CSV_PATH); // Villages
    const mRows = await readCSV(MUNCIPALITY_CSV_PATH); // Municipalities
    console.log(`Villages: ${vRows.length}, Municipalities: ${mRows.length}`);

    // clear
    console.log('Clearing DB...');
    await Location.deleteMany({});

    // 1. STATE
    console.log('Creating State...');
    const stateDoc = await new Location({
        name: STATE_NAME,
        type: 'STATE',
        ancestors: []
    }).save();
    cache.set(`STATE:${STATE_NAME}:ROOT`, stateDoc); // Key: TYPE:NAME:PARENTID

    // 2. PARSE & AGGREGATE
    // We normalize everything to Title Case for the sets to avoid dupes ("Adilabad" vs "adilabad")
    // Keys will store TitleCased versions.

    // DISTRICTS
    const districtSet = new Set();
    const processDistricts = (rows, src) => {
        rows.forEach(r => {
            const d = toTitleCase(r['District']);
            if (d) districtSet.add(d);
        });
    };
    processDistricts(vRows);
    processDistricts(mRows);

    // CONSTITUENCIES
    // Key: "District|Constituency"
    const constituencySet = new Map(); // Key -> { districtName, constName }
    const processConst = (rows) => {
        rows.forEach(r => {
            const d = toTitleCase(r['District']);
            const c = toTitleCase(r['Assembly constituency']); // Ensure header matches
            if (d && c) {
                const key = `${d}|${c}`;
                if (!constituencySet.has(key)) constituencySet.set(key, { d, c });
            }
        });
    }
    processConst(vRows);
    processConst(mRows); // Assuming same header "Assembly constituency"

    // MANDALS
    const mandalSet = new Map(); // "District|Const|Mandal"
    vRows.forEach(r => {
        const d = toTitleCase(r['District']);
        const c = toTitleCase(r['Assembly constituency']);
        const m = toTitleCase(r['Mandal']);
        if (d && c && m) {
            const key = `${d}|${c}|${m}`;
            mandalSet.set(key, { d, c, m });
        }
    });

    // MUNICIPALITIES
    const muniSet = new Map();
    mRows.forEach(r => {
        const d = toTitleCase(r['District']);
        const c = toTitleCase(r['Assembly constituency']);
        const m = toTitleCase(r['Corporation/Municipality']);
        if (d && c && m) {
            const key = `${d}|${c}|${m}`;
            muniSet.set(key, { d, c, m });
        }
    });

    // VILLAGES
    const villageSet = new Map(); // "Dist|Const|Mandal|Village" (Full path for uniqueness)
    // Why full path? Because same village name can exist in diff mandals.
    vRows.forEach(r => {
        const d = toTitleCase(r['District']);
        const c = toTitleCase(r['Assembly constituency']);
        const m = toTitleCase(r['Mandal']);
        const v = toTitleCase(r['Gram Panchayat']);
        if (d && c && m && v) {
            const key = `${d}|${c}|${m}|${v}`;
            villageSet.set(key, { d, c, m, v });
        }
    });

    // WARDS
    const wardSet = new Map();
    mRows.forEach(r => {
        const d = toTitleCase(r['District']);
        const c = toTitleCase(r['Assembly constituency']);
        const m = toTitleCase(r['Corporation/Municipality']);
        const w = r['Ward Number']; // Keep as is, maybe prepend "Ward"
        if (d && c && m && w) {
            const wName = `Ward ${w}`;
            const key = `${d}|${c}|${m}|${wName}`;
            wardSet.set(key, { d, c, m, w: wName });
        }
    });

    // 3. INSERT - LEVELS
    // Districts
    await createLevel(Array.from(districtSet).map(d => ({ name: d })), 'DISTRICT', () => stateDoc);

    // Constituencies
    const constItems = Array.from(constituencySet.values()).map(o => ({
        name: o.c,
        district: o.d
    }));
    await createLevel(constItems, 'CONSTITUENCY', (item) => cache.get(`DISTRICT:${item.district}:${stateDoc._id}`));

    // Mandals
    const mandalItems = Array.from(mandalSet.values()).map(o => ({ name: o.m, c: o.c, d: o.d }));
    await createLevel(mandalItems, 'MANDAL', (item) => {
        // Need parent ID (Constituency).
        // Parent of Const is District.
        // We look up Const ID. Unique Const is by Dist+Const.
        const distDoc = cache.get(`DISTRICT:${item.d}:${stateDoc._id}`);
        if (!distDoc) return null;
        return cache.get(`CONSTITUENCY:${item.c}:${distDoc._id}`);
    });

    // Municipalities
    const muniItems = Array.from(muniSet.values()).map(o => ({ name: o.m, c: o.c, d: o.d }));
    await createLevel(muniItems, 'MUNICIPALITY', (item) => {
        const distDoc = cache.get(`DISTRICT:${item.d}:${stateDoc._id}`);
        if (!distDoc) return null;
        return cache.get(`CONSTITUENCY:${item.c}:${distDoc._id}`);
    });

    // Villages
    const villageItems = Array.from(villageSet.values()).map(o => ({ name: o.v, m: o.m, c: o.c, d: o.d }));
    await createLevel(villageItems, 'VILLAGE', (item) => {
        const distDoc = cache.get(`DISTRICT:${item.d}:${stateDoc._id}`);
        if (!distDoc) return null;
        const constDoc = cache.get(`CONSTITUENCY:${item.c}:${distDoc._id}`);
        if (!constDoc) return null;
        return cache.get(`MANDAL:${item.m}:${constDoc._id}`);
    });

    // Wards
    const wardItems = Array.from(wardSet.values()).map(o => ({ name: o.w, m: o.m, c: o.c, d: o.d }));
    await createLevel(wardItems, 'WARD', (item) => {
        const distDoc = cache.get(`DISTRICT:${item.d}:${stateDoc._id}`);
        if (!distDoc) return null;
        const constDoc = cache.get(`CONSTITUENCY:${item.c}:${distDoc._id}`);
        if (!constDoc) return null;
        return cache.get(`MUNICIPALITY:${item.m}:${constDoc._id}`);
    });


    // --- 4. REMAP ---
    console.log('Building Reverse Lookup for Remapping...');
    // Traverse Cache
    // Map "Type:Name:ParentName" -> NewID
    // Since we keys include ParentID, we need to resolve that back to name for lookup?
    // ACTUALLY: oldIdMap keys off Type, Name, ParentName.
    // So we need a lookup: "Type|Name|ParentName" -> ID.

    // We can build this by iterating `cache.values()`.
    const newLookup = new Map(); // "Type|Name|ParentName|GrandParentName" -> ID

    // Since cache keys are IDs, we look at the docs.
    for (const doc of cache.values()) {
        const t = doc.type;
        const n = normalize(doc.name); // TitleCase already from create
        // Parent Name?
        let pName = '';
        let gpName = '';
        if (doc.ancestors && doc.ancestors.length > 0) {
            pName = normalize(doc.ancestors[doc.ancestors.length - 1].name);
        }
        if (doc.ancestors && doc.ancestors.length > 1) {
            gpName = normalize(doc.ancestors[doc.ancestors.length - 2].name);
        }

        // Key signatures
        // Level 1 (District): D|Name||
        // Level 2: C|Name|D|
        // Level 3: M|Name|C|D
        const key = `${t}|${n}|${pName}|${gpName}`;
        newLookup.set(key, doc._id);

        // Also simpler keys for fallback? "Type|Name|ParentName"
        newLookup.set(`${t}|${n}|${pName}`, doc._id);
        newLookup.set(`${t}|${n}`, doc._id); // Least specific (risk of collision)
    }

    // Remap Function (Copied/Adapted)
    const getNewId = (oldId) => {
        const sig = oldIdMap.get(oldId.toString());
        if (!sig) return null;

        // Try Most Specific First
        const k3 = `${sig.type}|${toTitleCase(sig.name)}|${toTitleCase(sig.parent || '')}|${toTitleCase(sig.grandParent || '')}`;
        if (newLookup.has(k3)) return newLookup.get(k3);

        const k2 = `${sig.type}|${toTitleCase(sig.name)}|${toTitleCase(sig.parent || '')}`;
        if (newLookup.has(k2)) return newLookup.get(k2);

        const k1 = `${sig.type}|${toTitleCase(sig.name)}`;
        // Only use k1 for Districts/State where uniqueness is high. For Villages avoiding it is safer?
        // But if we fail above, k1 is better than nothing?
        if (newLookup.has(k1)) return newLookup.get(k1);

        return null;
    };

    console.log('Remapping Users and Members...');

    // Update Users
    const users = await User.find({ assignedLocation: { $ne: null } });
    let uCount = 0;
    for (const u of users) {
        const nid = getNewId(u.assignedLocation);
        if (nid) { u.assignedLocation = nid; await u.save(); uCount++; }
    }
    console.log(`Updated ${uCount} Users.`);

    // Update Members
    const memberCursor = Member.find({}).cursor();
    let mCount = 0;
    const locFields = ['village', 'mandal', 'district', 'municipality'];

    for (let m = await memberCursor.next(); m != null; m = await memberCursor.next()) {
        let modified = false;

        // Address
        if (m.address) {
            for (const f of locFields) {
                if (m.address[f]) {
                    const nid = getNewId(m.address[f]);
                    if (nid) { m.address[f] = nid; modified = true; }
                }
            }
        }
        // Perm Address
        if (m.permanentAddress) {
            for (const f of locFields) {
                if (m.permanentAddress[f]) {
                    const nid = getNewId(m.permanentAddress[f]);
                    if (nid) { m.permanentAddress[f] = nid; modified = true; }
                }
            }
        }

        if (modified) {
            await m.save();
            mCount++;
        }
        if (mCount % 2000 === 0) console.log(`Remapped ${mCount} members...`);
    }

    console.log(`Migration Complete. Remapped ${mCount} Members.`);
    process.exit(0);
};

run();
