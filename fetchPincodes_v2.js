const https = require('https');
const fs = require('fs');
const path = require('path');

const url = 'https://raw.githubusercontent.com/saravanakumargn/All-India-Pincode-Directory/master/all-india-pincode-json-array.json';
const outputPath = path.join(__dirname, 'frontend/src/utils/pincodeData.js');

console.log(`Fetching data from ${url}...`);

https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('Data fetched. Parsing JSON...');
        try {
            const allPincodes = JSON.parse(data);
            console.log(`Total entries: ${allPincodes.length}`);

            // DEBUG: Search for Khammam irrespective of state
            const khammamCheck = allPincodes.filter(item =>
                (item.Districtname && item.Districtname.toUpperCase().includes('KHAMMAM')) ||
                (item.Taluk && item.Taluk.toUpperCase().includes('KHAMMAM'))
            );
            console.log(`Found ${khammamCheck.length} entries for KHAMMAM globally.`);
            if (khammamCheck.length > 0) {
                console.log('Sample Khammam entry:', khammamCheck[0]);
            }

            // Broader Filter: State is Telangana OR District is known Telangana district
            const telanganaDistricts = [
                "ADILABAD", "BHADRADRI KOTHAGUDEM", "HYDERABAD", "JAGTIAL", "JANGAON",
                "JAYASHANKAR BHUPALPALLY", "JOGULAMBA GADWAL", "KAMAREDDY", "KARIMNAGAR", "KHAMMAM",
                "KOMARAM BHEEM", "MAHABUBABAD", "MAHABUBNAGAR", "MANCHERIAL", "MEDAK", "MEDCHAL",
                "MULUGU", "NAGARKURNOOL", "NALGONDA", "NARAYANPET", "NIRMAL", "NIZAMABAD",
                "PEDDAPALLI", "RAJANNA SIRCILLA", "RANGAREDDY", "SANGAREDDY", "SIDDIPET",
                "SURYAPET", "VIKARABAD", "WANAPARTHY", "WARANGAL", "YADADRI BHUVANAGIRI"
            ];

            const telanganaData = allPincodes.filter(item => {
                const state = item.statename ? item.statename.toUpperCase() : '';
                const district = item.Districtname ? item.Districtname.toUpperCase() : '';

                // Check State or District (some legacy data lists TG districts under AP)
                return state === 'TELANGANA' || telanganaDistricts.some(d => district.includes(d));
            });

            console.log(`Telangana (Broad Filter) entries: ${telanganaData.length}`);

            const pinMap = {};
            let matchCount = 0;

            telanganaData.forEach(item => {
                const district = item.Districtname ? item.Districtname.trim().toUpperCase() : '';
                const mandal = item.Taluk ? item.Taluk.trim().toUpperCase() : '';
                let village = item.officename ? item.officename.trim().toUpperCase() : '';
                const pincode = item.pincode;

                // Clean village name
                village = village.replace(/\s+[BSH]\.O\.?$/i, '').trim();

                if (district && mandal && village && pincode) {
                    const key = `${district}-${mandal}-${village}`;
                    pinMap[key] = String(pincode);
                    matchCount++;
                }
            });

            console.log(`Mapped ${Object.keys(pinMap).length} unique District-Mandal-Village combinations.`);

            const fileContent = `/**
 * Pincode Mapping Utility
 * Maps "District-Mandal-Village" to specific Pincodes.
 * 
 * Data Source: Open Source Pincode Directory (Filtered for Telangana & Legacy AP Districts)
 */

const PINCODE_MAP = ${JSON.stringify(pinMap, null, 4)};

/**
 * Get Pincode for a given location
 * @param {string} district 
 * @param {string} mandal 
 * @param {string} village 
 * @param {string} [constituency] - Optional constituency
 * @returns {string} Pincode or empty string if not found
 */
export const getPincode = (district, mandal, village, constituency) => {
    if (!district || !mandal || !village) return "";

    const clean = (str) => str ? str.trim().toUpperCase() : "";

    const d = clean(district);
    const m = clean(mandal);
    const v = clean(village);
    const c = clean(constituency); // Currently unused in map keys but kept for future

    if (!PINCODE_MAP) return "";

    // 1. Direct Match
    const key = \`\${d}-\${m}-\${v}\`;
    if (PINCODE_MAP[key]) return PINCODE_MAP[key];

    // 2. Fuzzy / Cleaned Match
    // Sometimes Mandal names vary (e.g. Chinthakani vs Chintakani)
    // We can iterate keys if strict match fails (Performance cost, but acceptable for client-side action)
    
    // Normalized check: Remove spaces and non-chars for comparison
    const normalize = (s) => s.replace(/[^A-Z]/g, '');
    const searchD = normalize(d);
    const searchM = normalize(m);
    const searchV = normalize(v);
    
    // Optimisation: Limit search to keys starting with District to avoid scanning 5000 entries
    const keys = Object.keys(PINCODE_MAP).filter(k => k.startsWith(d));
    
    for (const k of keys) {
        const parts = k.split('-');
        if (parts.length >= 3) {
             const mapD = parts[0];
             const mapM = parts[1];
             const mapV = parts[2];
             
             if (normalize(mapM) === searchM && normalize(mapV) === searchV) {
                 return PINCODE_MAP[k];
             }
        }
    }

    return "";
};
`;

            fs.writeFileSync(outputPath, fileContent);
            console.log(`Successfully wrote to ${outputPath}`);

        } catch (error) {
            console.error('Error parsing or processing data:', error);
        }
    });

}).on('error', (err) => {
    console.error('Error fetching data:', err);
});
