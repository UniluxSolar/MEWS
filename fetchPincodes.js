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

            const telanganaData = allPincodes.filter(item => item.statename && item.statename.toUpperCase() === 'TELANGANA');
            console.log(`Telangana entries: ${telanganaData.length}`);

            const pinMap = {};

            telanganaData.forEach(item => {
                const district = item.Districtname ? item.Districtname.trim().toUpperCase() : '';
                const mandal = item.Taluk ? item.Taluk.trim().toUpperCase() : '';
                let village = item.officename ? item.officename.trim().toUpperCase() : '';
                const pincode = item.pincode;

                // Clean village name (remove B.O, S.O, H.O suffixes)
                village = village.replace(/\s+[BSH]\.O\.?$/i, '').trim();

                if (district && mandal && village && pincode) {
                    const key = `${district}-${mandal}-${village}`;
                    pinMap[key] = String(pincode);
                }
            });

            console.log(`Mapped ${Object.keys(pinMap).length} unique District-Mandal-Village combinations.`);

            const fileContent = `/**
 * Pincode Mapping Utility
 * Maps "District-Mandal-Village" to specific Pincodes.
 * 
 * Data Source: Open Source Pincode Directory (Filtered for Telangana)
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
    const c = clean(constituency);

    // Try specific match including Constituency (if map supports it - currently map is Dist-Mandal-Vill)
    if (c) {
        const keyWithConst = \`\${d}-\${c}-\${m}-\${v}\`;
        if (PINCODE_MAP[keyWithConst]) return PINCODE_MAP[keyWithConst];
    }

    // Fallback directly to District-Mandal-Village
    const key = \`\${d}-\${m}-\${v}\`;
    return PINCODE_MAP[key] || "";
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
