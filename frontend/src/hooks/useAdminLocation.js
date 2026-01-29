
import { useState, useEffect } from 'react';
import API from '../api';

/**
 * Hook to get the current Admin's assigned location details and locking status.
 * Returns:
 * - adminLocation: Object { districtName, mandalName, etc. }
 * - isLoading: boolean
 * - isFieldLocked: (fieldName) => boolean
 * - userRole: string
 */
const useAdminLocation = () => {
    const [adminLocation, setAdminLocation] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        const info = localStorage.getItem('adminInfo');
        if (info) {
            const parsed = JSON.parse(info);
            const role = parsed.role || '';
            setUserRole(role);

            // Fetch full location details if assignedLocation exists
            if (parsed.assignedLocation && parsed.assignedLocation.length === 24) {
                API.get(`/locations/${parsed.assignedLocation}`)
                    .then(({ data: loc }) => {
                        const newLocation = {
                            districtName: '', districtId: null,
                            mandalName: '', mandalId: null,
                            villageName: '', villageId: null,
                            municipalityName: '', municipalityId: null,
                            wardName: '', wardId: null,
                            constituencyName: '', constituencyId: null,
                            stateName: 'Telangana' // Default
                        };

                        // Helper to map location to state
                        const mapLoc = (l) => {
                            if (!l) return;
                            const id = l.locationId || l._id; // Ancestors use locationId, self uses _id
                            if (l.type === 'DISTRICT') { newLocation.districtName = l.name; newLocation.districtId = id; }
                            if (l.type === 'MANDAL') { newLocation.mandalName = l.name; newLocation.mandalId = id; }
                            if (l.type === 'VILLAGE') { newLocation.villageName = l.name; newLocation.villageId = id; }
                            if (l.type === 'MUNICIPALITY') { newLocation.municipalityName = l.name; newLocation.municipalityId = id; }
                            if (l.type === 'WARD') { newLocation.wardName = l.name; newLocation.wardId = id; }
                            if (l.type === 'CONSTITUENCY') { newLocation.constituencyName = l.name; newLocation.constituencyId = id; }
                        };

                        mapLoc(loc);

                        // Map Ancestors
                        if (loc.ancestors && Array.isArray(loc.ancestors)) {
                            loc.ancestors.forEach(anc => mapLoc(anc));
                        }

                        // Debug: If current loc is District, ensure we have it set
                        if (loc.type === 'DISTRICT') { newLocation.districtName = loc.name; newLocation.districtId = loc._id; }

                        console.log("[useAdminLocation] Resolved:", newLocation);
                        setAdminLocation(newLocation);
                    })
                    .catch(err => {
                        console.error("[useAdminLocation] Failed to fetch hierarchy:", err);
                        // Fallback from localStorage flat fields if available
                        setAdminLocation({
                            districtName: parsed.district || '',
                            mandalName: parsed.mandal || '',
                            villageName: parsed.villageName || '',
                            municipalityName: parsed.municipalityName || '',
                            wardName: parsed.wardName || ''
                        });
                    })
                    .finally(() => setIsLoading(false));
            } else {
                // Super Admin or no location
                setIsLoading(false);
            }
        } else {
            setIsLoading(false);
        }
    }, []);

    const isFieldLocked = (fieldName) => {
        if (!userRole) return false;

        const roleHierarchy = {
            'SUPER_ADMIN': 0,
            'STATE_ADMIN': 1,
            'DISTRICT_ADMIN': 2,
            'MANDAL_ADMIN': 3,
            'MUNICIPALITY_ADMIN': 3,
            'VILLAGE_ADMIN': 4,
            'WARD_ADMIN': 4
        };
        const level = roleHierarchy[userRole] || 0;

        // Check against field names usually used in forms
        // Supporting both 'perm' prefix (Registration) and generic names (Filters)

        // State Level
        if ((fieldName === 'permState' || fieldName === 'state') && level >= 1) return true;

        // District Level
        if ((fieldName === 'permDistrict' || fieldName === 'district') && level >= 2) return true;

        // Mandal/Municipality Level
        if ((fieldName === 'permMandal' || fieldName === 'mandal' ||
            fieldName === 'permMunicipality' || fieldName === 'municipality' ||
            fieldName === 'permConstituency' || fieldName === 'constituency') && level >= 3) return true;

        // Village/Ward Level
        if ((fieldName === 'permVillage' || fieldName === 'village' ||
            fieldName === 'permWardNumber' || fieldName === 'ward') && level >= 4) return true;

        return false;
    };

    return { adminLocation, isLoading, isFieldLocked, userRole };
};

export default useAdminLocation;
