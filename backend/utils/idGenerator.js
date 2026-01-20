const IdCounter = require('../models/IdCounter');
const Location = require('../models/Location');
const { stateCodes, telanganaDistrictCodes } = require('./locationMappings');

/**
 * Generates a standardized Member ID: MEWS-YYYY-SS-DD-NNNNNN
 * @param {Object} member - The member document (must verify address.district is populated or fetch it)
 * @returns {Promise<string>} - The generated ID
 */
const generateMemberId = async (memberDoc) => {
    // 1. Resolve State and District Names
    // Requires memberDoc to have address populated or at least IDs accessible to fetch
    // We assume memberDoc might NOT be fully populated, so we fetch details if needed.

    // Reload member with population to be safe
    const Member = require('../models/Member'); // Circular dependency if top-level?
    // Using simple approach: if district is ID, fetch Location.

    let districtName = "";
    let stateName = "";

    // Helper to get location name
    const getLocationName = async (idOrObj) => {
        if (!idOrObj) return null;
        if (typeof idOrObj === 'object' && idOrObj.name) return idOrObj.name; // Already populated
        try {
            const loc = await Location.findById(idOrObj);
            return loc ? loc.name : null;
        } catch (e) { return null; }
    };

    // Prefer ID from address
    let districtId = memberDoc.address?.district;

    // FETCH District Location to get Name
    if (districtId) {
        const dLoc = await Location.findById(districtId);
        if (dLoc) {
            districtName = dLoc.name;
            // Get State Name from Parent if available, or assume Telangana if code 24 logic applies?
            // Wait, we need State Name to map to State Code.
            // If district has parent, that is State.
            if (dLoc.parent) {
                const sLoc = await Location.findById(dLoc.parent);
                if (sLoc) stateName = sLoc.name;
            }
        }
    }

    // fallback: check if state/district are strings in address (legacy/unmapped)
    if (!districtName && memberDoc.address?.district && typeof memberDoc.address.district === 'string') {
        districtName = memberDoc.address.district;
    }
    if (!stateName && memberDoc.address?.state) {
        stateName = memberDoc.address.state;
    }

    // DEFAULT TO TELANGANA if State not found (Project context seems TS focused)
    // But let's try to find code.
    let stateCode = "24"; // Default TS
    let districtCode = "00";

    // MAP STATE
    if (stateName) {
        // Try exact match
        if (stateCodes[stateName]) stateCode = stateCodes[stateName];
        else {
            // Case insensitive search
            const key = Object.keys(stateCodes).find(k => k.toLowerCase() === stateName.toLowerCase().trim());
            if (key) stateCode = stateCodes[key];
        }
    }

    // MAP DISTRICT
    // Only map if State is TS (24) or we implement others later. Requirement: "Apply these district codes only when State Code = 24"
    if (stateCode === "24") {
        if (districtName) {
            if (telanganaDistrictCodes[districtName]) districtCode = telanganaDistrictCodes[districtName];
            else {
                const key = Object.keys(telanganaDistrictCodes).find(k => k.toLowerCase() === districtName.toLowerCase().trim());
                if (key) districtCode = telanganaDistrictCodes[key];
            }
        }
    } else {
        // For other states, we don't have district codes. Requirement doesn't specify.
        // Assuming "DD" is required for format.
        // Could use "00" or random or hash? 
        // "DD -> District Code (2 digits, zero-padded if required)"
        // "Apply these district codes only when State Code = 24". 
        // Implies for others, we might strictly follow requirement OR generic?
        // Let's stick to "00" for non-TS districts for now unless user clarifies.
        districtCode = "00";
    }

    const year = new Date().getFullYear();
    const key = `${stateCode}-${districtCode}-${year}`; // Unique Check Scope

    // ATOMIC INCREMENT
    const counter = await IdCounter.findOneAndUpdate(
        { key: key },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );

    const seqStr = String(counter.seq).padStart(6, '0');

    return `MEWS-${year}-${stateCode}-${districtCode}-${seqStr}`;
};

module.exports = { generateMemberId };
