/**
 * Pincode Mapping Utility
 * Maps "District-Mandal-Village" to specific Pincodes.
 * 
 * Data Format:
 * "DistrictName-MandalName-VillageName": "Pincode"
 * 
 * Note: Since exact names must match, we normalize keys to uppercase for easier matching.
 */

const PINCODE_MAP = {
    // Example Data - REPLACE with real data
    "NALGONDA-CHITYALA-PEDDAKAPARTHY": "508114",
    "NALGONDA-CHITYALA-VELIMINEDU": "508114",
    "NALGONDA-CHITYALA-CHITYALA": "508114",

    // Suryapet District
    "SURYAPET-MATTAMPALLE-ALLIPURAM": "508204",

    // Add more mappings here as needed
};

/**
 * Get Pincode for a given location
 * @param {string} district 
 * @param {string} mandal 
 * @param {string} village 
 * @returns {string} Pincode or empty string if not found
 */
export const getPincode = (district, mandal, village) => {
    if (!district || !mandal || !village) return "";

    // Normalize key
    const key = `${district.trim()}-${mandal.trim()}-${village.trim()}`.toUpperCase();

    return PINCODE_MAP[key] || "";
};
