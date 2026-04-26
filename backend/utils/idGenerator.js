const IdCounter = require('../models/IdCounter');
const DeletedId = require('../models/DeletedId');
const Location = require('../models/Location');
const mongoose = require('mongoose');
const { stateCodes, telanganaDistrictCodes } = require('./locationMappings');

/**
 * Generates a standardized Member ID: MEWS-YYYY-SS-DD-NNNNNN
 * @param {Object} memberDoc - The member document or data object
 * @returns {Promise<string>} - The generated ID
 */
const generateMemberId = async (memberDoc) => {
    const year = new Date().getFullYear();
    let stateCode = "24"; // Default TS
    let districtCode = "00";

    // 1. Resolve State and District Codes
    try {
        let districtId = memberDoc.address?.district;
        let districtName = "";
        let stateName = "";

        if (districtId) {
            let dLoc = null;
            if (typeof districtId === 'object' && districtId.name) {
                dLoc = districtId;
            } else if (mongoose.Types.ObjectId.isValid(districtId)) {
                dLoc = await Location.findById(districtId);
            }

            if (dLoc) {
                districtName = dLoc.name;
                // Get State Name from Parent if available
                if (dLoc.parent) {
                    let sLoc = null;
                    if (typeof dLoc.parent === 'object' && dLoc.parent.name) {
                        sLoc = dLoc.parent;
                    } else if (mongoose.Types.ObjectId.isValid(dLoc.parent)) {
                        sLoc = await Location.findById(dLoc.parent);
                    }
                    if (sLoc) stateName = sLoc.name;
                }
            }
        }

        // Fallback: check if state/district are strings in address (legacy/unmapped)
        if (!districtName && memberDoc.address?.district && typeof memberDoc.address.district === 'string') {
            districtName = memberDoc.address.district;
        }
        if (!stateName && memberDoc.address?.state) {
            stateName = memberDoc.address.state;
        }

        // MAP STATE
        if (stateName) {
            if (stateCodes[stateName]) stateCode = stateCodes[stateName];
            else {
                const key = Object.keys(stateCodes).find(k => k.toLowerCase() === stateName.toLowerCase().trim());
                if (key) stateCode = stateCodes[key];
            }
        }

        // MAP DISTRICT (Only for TS = 24)
        if (stateCode === "24" && districtName) {
            if (telanganaDistrictCodes[districtName]) districtCode = telanganaDistrictCodes[districtName];
            else {
                const key = Object.keys(telanganaDistrictCodes).find(k => k.toLowerCase() === districtName.toLowerCase().trim());
                if (key) districtCode = telanganaDistrictCodes[key];
            }
        }
    } catch (err) {
        console.error("[ID-GEN] Error resolving location codes:", err.message);
    }

    const key = `${stateCode}-${districtCode}-${year}`; // Unique Check Scope

    // 2. CHECK FOR REUSABLE IDs
    // Grouped by district code (SS-DD), assign the oldest (lowest) unused ID
    try {
        const reusedIdDoc = await DeletedId.findOneAndDelete(
            { stateCode, districtCode },
            { sort: { year: 1, mewsId: 1 } }
        );

        if (reusedIdDoc) {
            console.log(`[ID-REUSE] Reusing deleted ID: ${reusedIdDoc.mewsId} for district ${districtCode}`);
            return reusedIdDoc.mewsId;
        }
    } catch (reuseErr) {
        console.error("[ID-REUSE] Warning: Failed to check/claim reusable ID:", reuseErr.message);
    }

    // 3. ATOMIC INCREMENT (Fallback if no reusable ID)
    const counter = await IdCounter.findOneAndUpdate(
        { key: key },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );

    const seqStr = String(counter.seq).padStart(6, '0');

    return `MEWS-${year}-${stateCode}-${districtCode}-${seqStr}`;
};

module.exports = { generateMemberId };
