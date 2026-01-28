const fs = require('fs');
const path = require('path');
const readline = require('readline');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Location = require('../models/Location');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const MUNICIPALITIES_FILE = path.join(__dirname, '../data', 'Muncipalities 2026.csv');
const VILLAGES_FILE = path.join(__dirname, '../data', 'Villages 2025  - Sarpanch 2025 .csv');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mews_db');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const processedLocations = {
    states: new Set(),
    districts: new Set(),
    constituencies: new Map(), // Key: "District-Constituency", Value: ID
    mandals: new Map(), // Key: "Constituency-Mandal", Value: ID
    municipalities: new Map(), // Key: "Constituency-Municipality", Value: ID
};

const getOrCreateLocation = async (name, type, parentId) => {
    const query = { name: name.trim(), type: type };
    if (parentId) query.parent = parentId;

    let location = await Location.findOne(query);

    if (!location) {
        location = await Location.create({
            name: name.trim(),
            type: type,
            parent: parentId
        });
        console.log(`Created ${type}: ${name}`);
    }
    return location._id;
};

// Custom CSV Parser to handle quoted fields
// Basic logic: split by comma, but ignore commas inside quotes
const parseCSVLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    return result;
};

const importData = async () => {
    await connectDB();

    // 1. Ensure State Exists
    const stateId = await getOrCreateLocation('Telangana', 'STATE', null);

    // Helper to get cache keys
    const getConstKey = (dist, constName) => `${dist}-${constName}`;
    const getMandalKey = (constId, name) => `${constId}-${name}`;

    // --- Process Villages CSV (Rural) ---
    // Header Line 1: S.No.,District,Assembly constituency,Mandal,Gram Panchayat,No of Wards,Male,Female,Others,Total Voters,AC No.,GP reserved for
    console.log('Processing Villages CSV...');

    const processVillages = async () => {
        const fileStream = fs.createReadStream(VILLAGES_FILE);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        let isHeader = true;
        let headerMap = {};

        for await (const line of rl) {
            if (!line.trim()) continue;
            const row = parseCSVLine(line);

            if (isHeader) {
                // Map header names to indices
                // S.No.,District,Assembly constituency,Mandal,Gram Panchayat...
                row.forEach((col, index) => {
                    headerMap[col.replace(/"/g, '')] = index;
                });
                isHeader = false;
                continue;
            }

            const districtName = row[headerMap['District']];
            const constituencyName = row[headerMap['Assembly constituency']];
            const mandalName = row[headerMap['Mandal']];
            const villageName = row[headerMap['Gram Panchayat']];

            if (!districtName || !constituencyName || !mandalName || !villageName) continue;

            // 1. District
            if (!processedLocations.districts.has(districtName)) {
                await getOrCreateLocation(districtName, 'DISTRICT', stateId);
                processedLocations.districts.add(districtName);
            }
            const district = await Location.findOne({ name: districtName, type: 'DISTRICT', parent: stateId });

            // 2. Constituency
            const constKey = getConstKey(districtName, constituencyName);
            let constId = processedLocations.constituencies.get(constKey);
            if (!constId) {
                constId = await getOrCreateLocation(constituencyName, 'CONSTITUENCY', district._id);
                processedLocations.constituencies.set(constKey, constId);
            }

            // 3. Mandal
            const mandalKey = getMandalKey(constId, mandalName);
            let mandalId = processedLocations.mandals.get(mandalKey);
            if (!mandalId) {
                mandalId = await getOrCreateLocation(mandalName, 'MANDAL', constId);
                processedLocations.mandals.set(mandalKey, mandalId);
            }

            // 4. Village
            await getOrCreateLocation(villageName, 'VILLAGE', mandalId);
        }
        console.log('Villages CSV processed.');
    };

    // --- Process Municipalities CSV (Urban) ---
    // File structure:
    // Line 1: "S.
    // Line 2: No",District,Assembly constituency,Corporation/Municipality,Ward Number,...
    console.log('Processing Municipalities CSV...');

    const processMunicipalities = async () => {
        const fileStream = fs.createReadStream(MUNICIPALITIES_FILE);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        let lineCount = 0;
        let headerMap = {};

        for await (const line of rl) {
            lineCount++;
            if (!line.trim()) continue;

            // Skip first line "S."
            if (lineCount === 1) continue;

            const row = parseCSVLine(line);

            if (lineCount === 2) {
                // Remove quotes from headers if present
                row.forEach((col, index) => {
                    headerMap[col.replace(/"/g, '')] = index;
                });
                console.log('Municipality Headers:', headerMap);
                continue;
            }

            // District,Assembly constituency,Corporation/Municipality,Ward Number
            const districtName = row[headerMap['District']];
            const constituencyName = row[headerMap['Assembly constituency']];
            const muniName = row[headerMap['Corporation/Municipality']];
            const wardNum = row[headerMap['Ward Number']];

            if (!districtName || !constituencyName || !muniName || !wardNum) continue;

            // 1. District
            if (!processedLocations.districts.has(districtName)) {
                await getOrCreateLocation(districtName, 'DISTRICT', stateId);
                processedLocations.districts.add(districtName);
            }
            const district = await Location.findOne({ name: districtName, type: 'DISTRICT', parent: stateId });

            // 2. Constituency
            const constKey = getConstKey(districtName, constituencyName);
            let constId = processedLocations.constituencies.get(constKey);
            if (!constId) {
                constId = await getOrCreateLocation(constituencyName, 'CONSTITUENCY', district._id);
                processedLocations.constituencies.set(constKey, constId);
            }

            // 3. Municipality
            const muniKey = getMandalKey(constId, muniName);
            let muniId = processedLocations.municipalities.get(muniKey);
            if (!muniId) {
                // Check if it exists in DB to be safe
                const checkMuni = await Location.findOne({ name: muniName, type: 'MUNICIPALITY', parent: constId });
                if (checkMuni) {
                    muniId = checkMuni._id;
                } else {
                    muniId = await getOrCreateLocation(muniName, 'MUNICIPALITY', constId);
                }
                processedLocations.municipalities.set(muniKey, muniId);
            }

            // 4. Ward
            // Some wards might be just numbers "1", ensure they are treated as names
            await getOrCreateLocation(wardNum, 'WARD', muniId);
        }
        console.log('Municipalities CSV processed.');
    };

    await processVillages();
    await processMunicipalities();

    console.log('Import Complete!');
    process.exit();
};

importData();
