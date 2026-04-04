// Official State Codes (Census 2011/LGD based)
export const stateCodes = {
    "Andhra Pradesh": "01",
    "Arunachal Pradesh": "02",
    "Assam": "03",
    "Bihar": "04",
    "Chhattisgarh": "05",
    "Goa": "06",
    "Gujarat": "07",
    "Haryana": "08",
    "Himachal Pradesh": "09",
    "Jharkhand": "10",
    "Karnataka": "11",
    "Kerala": "12",
    "Madhya Pradesh": "13",
    "Maharashtra": "14",
    "Manipur": "15",
    "Meghalaya": "16",
    "Mizoram": "17",
    "Nagaland": "18",
    "Odisha": "19",
    "Punjab": "20",
    "Rajasthan": "21",
    "Sikkim": "22",
    "Tamil Nadu": "23",
    "Telangana": "24",
    "Tripura": "25",
    "Uttar Pradesh": "26",
    "Uttarakhand": "27",
    "West Bengal": "28",
    "Andaman and Nicobar Islands": "29",
    "Chandigarh": "30",
    "Dadra and Nagar Haveli and Daman and Diu": "31",
    "Delhi": "32",
    "Jammu and Kashmir": "33",
    "Ladakh": "34",
    "Lakshadweep": "35",
    "Puducherry": "36"
};

// TS Specific District Codes (Only for State Code 24)
export const telanganaDistrictCodes = {
    "Adilabad": "01",
    "Bhadradri Kothagudem": "02",
    "Hanumakonda": "03",
    "Hanamkonda": "03", // Alias for common spelling
    "Hyderabad": "04",
    "Jagtial": "05",
    "Jangaon": "06",
    "Jayashankar Bhupalpally": "07",
    "Jogulamba Gadwal": "08",
    "Kamareddy": "09",
    "Karimnagar": "10",
    "Khammam": "11",
    "Kumuram Bheem Asifabad": "12",
    "Mahabubabad": "13",
    "Mahabubnagar": "14",
    "Mancherial": "15",
    "Medak": "16",
    "Medchal–Malkajgiri": "17",
    "Medchal Malkajgiri": "17",
    "Medchal": "17",
    "Mulugu": "18",
    "Nagarkurnool": "19",
    "Nalgonda": "20",
    "Narayanpet": "21",
    "Nirmal": "22",
    "Nizamabad": "23",
    "Peddapalli": "24",
    "Rajanna Sircilla": "25",
    "Ranga Reddy": "26",
    "Rangareddy": "26", // Alias
    "Sangareddy": "27",
    "Siddipet": "28",
    "Suryapet": "29",
    "Vikarabad": "30",
    "Wanaparthy": "31",
    "Warangal": "32",
    "Yadadri Bhuvanagiri": "33",
    "Yadadri": "33",
    "Warangal (Urban)": "03", // Handle urban/rural for Hanumakonda area if needed
    "Warangal (Rural)": "32"
};

/**
 * Generates a formatted segment-based ID: MEWS-YYYY-SS-DD-NNNNNN
 * Applied only during ID card generation per user request.
 */
export const formatMewsId = (member, year = 2026) => {
    // 1. Determine State Code
    const stateName = member.state || 'Telangana';
    let sCode = "24"; 
    const sKey = Object.keys(stateCodes).find(k => k.toLowerCase() === stateName.toLowerCase().trim());
    if (sKey) sCode = stateCodes[sKey];

    // 2. Determine District Code
    const districtName = member.district || '';
    let dCode = "00";
    if (sCode === "24" && districtName) {
        // Safe check for variants like "District Name (D)" or "District Name "
        const cleanName = districtName.split('(')[0].trim().toLowerCase();
        const dKey = Object.keys(telanganaDistrictCodes).find(k => k.toLowerCase() === cleanName);
        if (dKey) dCode = telanganaDistrictCodes[dKey];
        else {
            // Further fallback for partial matches if needed
            const dKeyPartial = Object.keys(telanganaDistrictCodes).find(k => cleanName.includes(k.toLowerCase()) || k.toLowerCase().includes(cleanName));
            if (dKeyPartial) dCode = telanganaDistrictCodes[dKeyPartial];
        }
    }

    // 3. Extract last 6 digits from original ID (Previous implementation logic)
    const originalId = member.mewsId || '';
    const parts = originalId.split('-');
    const lastPart = parts[parts.length - 1] || '';
    
    // Ensure we have exactly 6 digits from the last segment
    const seqStr = lastPart.replace(/[^0-9]/g, '').slice(-6).padStart(6, '0');

    return `MEWS-${year}-${sCode}-${dCode}-${seqStr}`;
};
