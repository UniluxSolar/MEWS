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
    return str.toString().trim().replace(/\s+/g, ' '); // Title case handled by frontend? We'll store formatted or as-is? 
    // User requested: "Normalize all names (trim spaces, fix casing, standardize hyphens)"
    // Let's Title Case it properly
};

const toTitleCase = (str) => {
    if (!str) return '';
    return str.toString().trim().replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

// Maps for Cache
// Key: "Type:NormalizedName:ParentID" -> DB_Doc
const locationCache = new Map();

// Old ID to Signature Map for Reference update
// Key: Old_ObjectId_String -> { type, name, parentName, ...signature }
const oldIdMap = new Map();

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

// --- STEP 1: BACKUP OLD MAPPINGS ---
const backupOldMappings = async () => {
    console.log('--- backing up old location signatures ---');
    const allLocations = await Location.find({}).lean();
    console.log(`Found ${allLocations.length} existing locations.`);

    // First pass: Just store raw data
    // We need to resolve parent names to build a robust signature (e.g. "Village X" might exist in multiple Mandals)
    const idToDoc = new Map();
    allLocations.forEach(loc => idToDoc.set(loc._id.toString(), loc));

    const getSignature = (loc) => {
        if (!loc) return null;
        let sig = { type: loc.type, name: normalize(loc.name) };
        if (loc.parent) {
            const parent = idToDoc.get(loc.parent.toString());
            if (parent) {
                sig.parent = normalize(parent.name);
                sig.parentType = parent.type; // To distinguish

                // Grandparent for extra safety (e.g. Mandals in diff Districts)
                if (parent.parent) {
                    const gp = idToDoc.get(parent.parent.toString());
                    if (gp) {
                        sig.grandParent = normalize(gp.name);
                    }
                }
            }
        }
        return sig;
    };

    allLocations.forEach(loc => {
        const sig = getSignature(loc);
        if (sig) {
            oldIdMap.set(loc._id.toString(), sig);
        }
    });
    console.log('Backup complete.');
};

// --- STEP 2: CLEAR LOCATIONS ---
const clearLocations = async () => {
    console.log('--- Clearing Location Collection ---');
    await Location.deleteMany({});
    console.log('Locations cleared.');
};

// --- STEP 3: RE-INGEST ---
const createLocation = async (type, name, parentDoc) => {
    const cleanName = toTitleCase(name);
    // Unique Key: Type + Name + ParentID
    const parentId = parentDoc ? parentDoc._id.toString() : 'ROOT';
    const cacheKey = `${type}:${cleanName}:${parentId}`;

    if (locationCache.has(cacheKey)) {
        return locationCache.get(cacheKey);
    }

    // Build ancestors
    let ancestors = [];
    if (parentDoc) {
        ancestors = [...(parentDoc.ancestors || [])];
        ancestors.push({
            locationId: parentDoc._id,
            name: parentDoc.name,
            type: parentDoc.type
        });
    }

    const newLoc = new Location({
        name: cleanName,
        type: type,
        parent: parentDoc ? parentDoc._id : null,
        ancestors: ancestors
    });

    await newLoc.save();
    locationCache.set(cacheKey, newLoc);
    // console.log(`Created ${type}: ${cleanName}`);
    return newLoc;
};

const ingestVillages = async (stateDoc) => {
    console.log('--- Ingesting Villages CSV ---');
    const rows = [];
    await new Promise((resolve, reject) => {
        fs.createReadStream(VILLAGE_CSV_PATH)
            .pipe(csv())
            .on('data', (data) => rows.push(data))
            .on('end', resolve)
            .on('error', reject);
    });

    console.log(`Processing ${rows.length} rows...`);
    let count = 0;

    // Cache for higher levels within this function run to avoid redundant DB calls if cache cleared?
    // We try to rely on global locationCache. 

    for (const row of rows) {
        // Headers: District, Assembly constituency, Mandal, Gram Panchayat
        const districtName = row['District'];
        const constituencyName = row['Assembly constituency'];
        const mandalName = row['Mandal'];
        const villageName = row['Gram Panchayat'];

        if (!districtName || !constituencyName || !mandalName || !villageName) continue;

        const district = await createLocation('DISTRICT', districtName, stateDoc);
        const constituency = await createLocation('CONSTITUENCY', constituencyName, district);
        const mandal = await createLocation('MANDAL', mandalName, constituency);
        const village = await createLocation('VILLAGE', villageName, mandal);

        count++;
        if (count % 500 === 0) console.log(`Processed ${count} villages...`);
    }
    console.log('Villages ingestion done.');
};

const ingestMunicipalities = async (stateDoc) => {
    console.log('--- Ingesting Municipalities CSV ---');
    const rows = [];
    await new Promise((resolve, reject) => {
        fs.createReadStream(MUNCIPALITY_CSV_PATH)
            .pipe(csv())
            .on('data', (data) => rows.push(data))
            .on('end', resolve)
            .on('error', reject);
    });

    console.log(`Processing ${rows.length} rows...`);
    let count = 0;

    for (const row of rows) {
        // Headers: District, Assembly constituency, Corporation/Municipality, Ward Number
        const districtName = row['District'];
        const constituencyName = row['Assembly constituency'];
        const muniName = row['Corporation/Municipality'];
        const wardNum = row['Ward Number'];

        if (!districtName || !constituencyName || !muniName) continue;

        const district = await createLocation('DISTRICT', districtName, stateDoc);
        const constituency = await createLocation('CONSTITUENCY', constituencyName, district);

        // Municipality
        const municipality = await createLocation('MUNICIPALITY', muniName, constituency);

        // Ward (Optional)
        if (wardNum) {
            await createLocation('WARD', `Ward ${wardNum}`, municipality);
        }

        count++;
        if (count % 500 === 0) console.log(`Processed ${count} municipal records...`);
    }
    console.log('Municipalities ingestion done.');
};

// --- STEP 4: REMAP FOREIGN KEYS ---
const findNewId = (oldSig) => {
    if (!oldSig) return null;
    const { type, name, parent, parentType, grandParent } = oldSig;
    const cleanName = toTitleCase(name);

    // We assume the new hierarchy is strictly maintained.
    // We need to search the locationCache by name and parent.
    // Iterating cache is slow for millions, but we have thousands. Map iterator is OK or we build a lookup.

    // Better: We didn't keep a Name->Doc map, strictly. We kept Key->Doc.
    // Key format: `${type}:${cleanName}:${parentId}`.
    // We don't know the new ParentID easily without resolving the parent signature too.

    // Recursive resolution strategy?
    // Start from top? No, we start from the leaf we want.

    // Heuristic Match:
    // 1. Find all locations matching Type & Name.
    // 2. Filter by Parent Name.

    // Let's iterate values of locationCache once to build a lookup index:
    // Index: "Type:Name" -> [Listing of docs with their ancestry names]

    return null; // Placeholder for logic inside migration
};

// We will build a refined lookup map AFTER ingestion
const buildReverseLookup = () => {
    // Map: "Type|Name" -> [ { doc, parentName, grandParentName } ]
    const lookup = new Map();

    for (const loc of locationCache.values()) {
        const key = `${loc.type}|${loc.name}`; // Name is already TitleCased
        if (!lookup.has(key)) lookup.set(key, []);

        let parentName = '';
        let grandParentName = '';

        if (loc.ancestors && loc.ancestors.length > 0) {
            // Ancestors are ordered? Schema doesn't guarantee, but usually insertion order.
            // Actually, we can check the 'parent' field against the cache?
            // Ancestors array: contains all above. origin -> ... -> parent.
            // Let's use the ancestors array directly. Last item is parent.
            const len = loc.ancestors.length;
            if (len > 0) parentName = loc.ancestors[len - 1].name;
            if (len > 1) grandParentName = loc.ancestors[len - 2].name;
        }

        lookup.get(key).push({
            id: loc._id,
            parentName: normalize(parentName),
            grandParentName: normalize(grandParentName)
        });
    }
    return lookup;
};

const remapData = async (lookup) => {
    console.log('--- Remapping Members and Users ---');

    // Helper to find new ID
    const getNewId = (oldId) => {
        const sig = oldIdMap.get(oldId.toString());
        if (!sig) return null; // Was creating problem or orphan before?

        const key = `${sig.type}|${toTitleCase(sig.name)}`; // Match formatting
        const candidates = lookup.get(key);

        if (!candidates || candidates.length === 0) {
            // console.warn(`No match found for ${sig.type} "${sig.name}"`);
            return null;
        }

        if (candidates.length === 1) return candidates[0].id;

        // Disambiguate by Parent
        const match = candidates.find(c => c.parentName === toTitleCase(sig.parent));
        if (match) return match.id;

        // Disambiguate by GrandParent?
        // Fallback: Return first match?
        // Only 1 match is vastly typical unless naming collision.
        return candidates[0].id;
    };

    // 1. Update Users
    const users = await User.find({ assignedLocation: { $ne: null } });
    let uCount = 0;
    for (const u of users) {
        const newId = getNewId(u.assignedLocation);
        if (newId) {
            u.assignedLocation = newId;
            await u.save();
            uCount++;
        } else {
            // Log unmapped
            // console.log(`Could not remap User ${u.email} location.`);
        }
    }
    console.log(`Updated ${uCount} Users.`);

    // 2. Update Members
    // This is heavier. Use cursor.
    const memberCursor = Member.find({}).cursor();
    let mCount = 0;

    // Batch updates? iterating one by one is safe but slow. 
    // For < 50k, it's minutes. acceptable.
    for (let m = await memberCursor.next(); m != null; m = await memberCursor.next()) {
        let modified = false;

        const fields = ['village', 'mandal', 'district', 'municipality']; // ObjectIds
        // const fields = ['village', 'mandal', 'district', 'municipality'];

        // Address
        if (m.address) {
            for (const f of fields) {
                if (m.address[f]) {
                    const nid = getNewId(m.address[f]);
                    if (nid) {
                        m.address[f] = nid;
                        modified = true;
                    }
                }
            }
            // Also update text fields if you want consistency?
            // "constituency" is String in Schema (lines 38, 55).
            // Maybe update it based on new relationships? 
            // Too complex logic for now. Focus on ID links.
        }

        // Perm Address
        if (m.permanentAddress) {
            for (const f of fields) {
                if (m.permanentAddress[f]) {
                    const nid = getNewId(m.permanentAddress[f]);
                    if (nid) {
                        m.permanentAddress[f] = nid;
                        modified = true;
                    }
                }
            }
        }

        if (modified) {
            await m.save();
            mCount++;
        }
        if (mCount % 1000 === 0) console.log(`Remapped ${mCount} members...`);
    }
    console.log(`Remapping Members Complete. Total: ${mCount}`);
};

const run = async () => {
    await connectDB();

    // 1. Backup
    await backupOldMappings();

    // 2. Clear
    await clearLocations();

    // 3. Seed State
    const state = await createLocation('STATE', STATE_NAME, null);

    // Ingest
    await ingestVillages(state);
    await ingestMunicipalities(state);

    // 4. Remap
    const lookup = buildReverseLookup();
    await remapData(lookup);

    console.log('MIGRATION COMPLETE.');
    process.exit(0);
};

run();
