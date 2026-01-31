import React, { useState, useEffect } from 'react';
import API from '../api';
import AdminHeader from '../components/AdminHeader';
import AdminSidebar from '../components/AdminSidebar';
import { useNavigate } from 'react-router-dom';
import MultiSelect from '../components/common/MultiSelect';
import { FaUserShield, FaSearch, FaArrowLeft, FaMapMarkerAlt, FaCheckCircle, FaUsers, FaCheckSquare, FaCity, FaTree } from 'react-icons/fa';
import useAdminLocation from '../hooks/useAdminLocation';

const AssignAdmin = () => {
    const navigate = useNavigate();
    const adminInfo = JSON.parse(localStorage.getItem('adminInfo') || '{}');
    const { adminLocation, userRole, isFieldLocked, isLoading: isLocLoading } = useAdminLocation();

    // Hierarchy Definitions
    const HIERARCHY = {
        'SUPER_ADMIN': 6,
        'STATE_ADMIN': 5,
        'DISTRICT_ADMIN': 4,
        'MUNICIPALITY_ADMIN': 3,
        'MANDAL_ADMIN': 3,
        'WARD_ADMIN': 2,
        'VILLAGE_ADMIN': 1
    };

    const ROLE_LABELS = {
        'STATE_ADMIN': 'State Admin',
        'DISTRICT_ADMIN': 'District Admin',
        'MUNICIPALITY_ADMIN': 'Municipality Admin',
        'WARD_ADMIN': 'Ward Admin',
        'MANDAL_ADMIN': 'Mandal Admin',
        'VILLAGE_ADMIN': 'Village Admin'
    };

    const allowedRoles = Object.keys(HIERARCHY)
        .filter(r => HIERARCHY[r] < HIERARCHY[userRole])
        .sort((a, b) => ROLE_LABELS[a].localeCompare(ROLE_LABELS[b]));

    // Role Selection
    const [selectedRole, setSelectedRole] = useState('');

    // --- TARGET LOCATION SCOPE (Where the Admin will be assigned) ---
    const [targetStates, setTargetStates] = useState([]);
    const [targetDistricts, setTargetDistricts] = useState([]);
    const [targetMandals, setTargetMandals] = useState([]);
    const [targetVillages, setTargetVillages] = useState([]);
    const [targetMunicipalities, setTargetMunicipalities] = useState([]); // New

    const [targetState, setTargetState] = useState('');
    const [targetDistrict, setTargetDistrict] = useState('');
    const [targetMandal, setTargetMandal] = useState('');
    const [targetVillage, setTargetVillage] = useState('');
    const [targetMunicipality, setTargetMunicipality] = useState('');
    const [targetWard, setTargetWard] = useState('');
    const [targetWards, setTargetWards] = useState([]);

    // Area Type Toggle (Rural vs Urban)
    const [areaType, setAreaType] = useState('Rural'); // 'Rural' or 'Urban'

    // Data & Filters
    const [members, setMembers] = useState([]);
    const [loadingMembers, setLoadingMembers] = useState(false);
    const [totalResults, setTotalResults] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit, setLimit] = useState(10);

    // Member Search & Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAgeRanges, setSelectedAgeRanges] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedBloodGroups, setSelectedBloodGroups] = useState([]);
    const [selectedGenders, setSelectedGenders] = useState({ All: true, Male: false, Female: false, Other: false });

    // Member Search Location Filters (Decoupled from Target Scope)
    const [searchStates, setSearchStates] = useState([]);
    const [searchDistricts, setSearchDistricts] = useState([]);
    const [searchMandals, setSearchMandals] = useState([]);
    const [searchVillages, setSearchVillages] = useState([]);
    const [searchMunicipalities, setSearchMunicipalities] = useState([]);
    const [searchWards, setSearchWards] = useState([]);

    const [searchState, setSearchState] = useState('');
    const [searchDistrict, setSearchDistrict] = useState('');
    const [searchMandal, setSearchMandal] = useState('');
    const [searchVillage, setSearchVillage] = useState('');
    const [searchMunicipality, setSearchMunicipality] = useState('');
    const [searchWard, setSearchWard] = useState('');
    const [searchAreaType, setSearchAreaType] = useState('Rural');

    const [selectedMembers, setSelectedMembers] = useState([]);
    const [loadingAssign, setLoadingAssign] = useState(false);

    // Helper to get safe location name
    const getLocationName = (data) => {
        if (data === null || data === undefined) return '';
        if (typeof data === 'string') return data;
        if (typeof data === 'object') {
            if (data.name) {
                return typeof data.name === 'object' ? JSON.stringify(data.name) : String(data.name);
            }
            return '';
        }
        return String(data);
    };


    // --- INITIALIZATION ---
    useEffect(() => {
        fetchRootLocations();
    }, []);

    const fetchRootLocations = async () => {
        try {
            // Fetch ALL states if Super Admin or state not locked
            if (userRole === 'SUPER_ADMIN' || !isFieldLocked('state')) {
                console.log("Fetching States for Super Admin/Fallback...");
                const { data } = await API.get('/locations?type=STATE');
                const sortedStates = [...data].sort((a, b) => a.name.localeCompare(b.name));
                setTargetStates(sortedStates);
                setSearchStates(sortedStates); // Also for search

                // Default auto-select Telangana for Super Admin if not already set
                if (sortedStates.length > 0 && !targetState) {
                    const ts = sortedStates.find(s => s.name === 'Telangana' || s.name.toUpperCase() === 'TELANGANA') || sortedStates[0];
                    setTargetState(ts._id);
                    fetchLocations(ts._id, 'DISTRICT');

                    // Also for search
                    setSearchState(ts._id);
                    fetchSearchLocations(ts._id, 'DISTRICT');
                }
            }
        } catch (error) {
            console.error("Error fetching locations", error);
        }
    };

    const isTargetLocked = (level) => isFieldLocked(level);

    // Pre-fill Logic from Admin Location Hook
    useEffect(() => {
        if (adminLocation && userRole !== 'SUPER_ADMIN') {
            console.log("[AssignAdmin] Pre-filling from adminLocation:", adminLocation);

            if (adminLocation.stateName) {
                // We usually only have Telangana, but let's be safe
                // If we don't have the State ID yet, we might need a quick fetch or just use a known constant/ref
                // But typically if locked, it's already in the dropdowns if we fetch root
            }

            if (adminLocation.districtId) {
                setTargetDistrict(adminLocation.districtId);
                fetchLocations(adminLocation.districtId, 'MANDAL');
                fetchLocations(adminLocation.districtId, 'MUNICIPALITY');
            }
            if (adminLocation.mandalId) {
                setAreaType('Rural');
                setTargetMandal(adminLocation.mandalId);
                fetchLocations(adminLocation.mandalId, 'VILLAGE');
            }
            if (adminLocation.municipalityId) {
                setAreaType('Urban');
                setTargetMunicipality(adminLocation.municipalityId);
            }
            if (adminLocation.villageId) {
                setAreaType('Rural');
                setTargetVillage(adminLocation.villageId);
            }

            // Sync Search Filters initially
            setSearchState(adminLocation.stateId || targetState);
            if (adminLocation.districtId) {
                setSearchDistrict(adminLocation.districtId);
                fetchSearchLocations(adminLocation.districtId, 'MANDAL');
                fetchSearchLocations(adminLocation.districtId, 'MUNICIPALITY');
            }
            if (adminLocation.mandalId) {
                setSearchAreaType('Rural');
                setSearchMandal(adminLocation.mandalId);
                fetchSearchLocations(adminLocation.mandalId, 'VILLAGE');
            }
            if (adminLocation.municipalityId) {
                setSearchAreaType('Urban');
                setSearchMunicipality(adminLocation.municipalityId);
            }
            if (adminLocation.villageId) {
                setSearchAreaType('Rural');
                setSearchVillage(adminLocation.villageId);
            }
        }
    }, [adminLocation, userRole]);

    // Sync Search Filters when Target changes (Auto-fill from Target)
    useEffect(() => {
        console.log("[AssignAdmin] Syncing Search Filters from Target Selection...");
        if (targetState) {
            setSearchState(targetState);
            // We should only fetch if not already populated, but for sync, we re-fetch search options
            fetchSearchLocations(targetState, 'DISTRICT');
        }
    }, [targetState]);

    useEffect(() => {
        if (targetDistrict) {
            setSearchDistrict(targetDistrict);
            fetchSearchLocations(targetDistrict, 'MANDAL');
            fetchSearchLocations(targetDistrict, 'MUNICIPALITY');
        }
    }, [targetDistrict]);

    useEffect(() => {
        if (targetMandal) {
            setSearchAreaType('Rural');
            setSearchMandal(targetMandal);
            fetchSearchLocations(targetMandal, 'VILLAGE');
        }
    }, [targetMandal]);

    useEffect(() => {
        if (targetMunicipality) {
            setSearchAreaType('Urban');
            setSearchMunicipality(targetMunicipality);
        }
    }, [targetMunicipality]);

    useEffect(() => {
        setSearchAreaType(areaType);
    }, [areaType]);

    useEffect(() => {
        if (targetVillage) {
            setSearchAreaType('Rural');
            setSearchVillage(targetVillage);
        }
    }, [targetVillage]);

    // Generic pre-fill logic removed in favor of adminLocation hook effect


    // --- GENERIC LOCATION FETCH ---
    const fetchLocations = async (ancestorId, type) => {
        console.log(`[AssignAdmin] fetchLocations(ancestor: ${ancestorId}, type: ${type})`);
        if (!ancestorId) {
            if (type === 'DISTRICT') setTargetDistricts([]);
            if (type === 'MANDAL') setTargetMandals([]);
            if (type === 'VILLAGE') setTargetVillages([]);
            if (type === 'MUNICIPALITY') setTargetMunicipalities([]);
            if (type === 'WARD') setTargetWards([]);
            return;
        }
        try {
            // Use ancestor instead of parent to handle intermediate layers like CONSTITUENCY
            const { data } = await API.get(`/locations?ancestor=${ancestorId}&type=${type}`);
            const sortedData = [...data].sort((a, b) => a.name.localeCompare(b.name));
            console.log(`[AssignAdmin] Fetched ${sortedData.length} ${type}s`);

            if (type === 'DISTRICT') { setTargetDistricts(sortedData); setSearchDistricts(sortedData); }
            if (type === 'MANDAL') { setTargetMandals(sortedData); setSearchMandals(sortedData); }
            if (type === 'VILLAGE') { setTargetVillages(sortedData); setSearchVillages(sortedData); }
            if (type === 'MUNICIPALITY') { setTargetMunicipalities(sortedData); setSearchMunicipalities(sortedData); }
            if (type === 'WARD') { setTargetWards(sortedData); setSearchWards(sortedData); }
        } catch (e) {
            console.error(`[AssignAdmin] fetchLocations error (${type}):`, e);
        }
    };

    // --- SEARCH LOCATION FETCH ---
    const fetchSearchLocations = async (ancestorId, type) => {
        console.log(`[AssignAdmin] fetchSearchLocations(ancestor: ${ancestorId}, type: ${type})`);
        if (!ancestorId) {
            if (type === 'DISTRICT') setSearchDistricts([]);
            if (type === 'MANDAL') setSearchMandals([]);
            if (type === 'VILLAGE') setSearchVillages([]);
            if (type === 'MUNICIPALITY') setSearchMunicipalities([]);
            if (type === 'WARD') setSearchWards([]);
            return;
        }
        try {
            // Use ancestor instead of parent to handle intermediate layers like CONSTITUENCY
            const { data } = await API.get(`/locations?ancestor=${ancestorId}&type=${type}`);
            const sortedData = [...data].sort((a, b) => a.name.localeCompare(b.name));
            console.log(`[AssignAdmin] Fetched ${sortedData.length} Search ${type}s`);

            if (type === 'DISTRICT') setSearchDistricts(sortedData);
            if (type === 'MANDAL') setSearchMandals(sortedData);
            if (type === 'VILLAGE') setSearchVillages(sortedData);
            if (type === 'MUNICIPALITY') setSearchMunicipalities(sortedData);
            if (type === 'WARD') setSearchWards(sortedData);
        } catch (e) {
            console.error(`[AssignAdmin] fetchSearchLocations error (${type}):`, e);
        }
    };

    // --- HANDLERS: TARGET SCOPE ---
    const handleRoleChange = (e) => {
        const val = e.target.value;
        setSelectedRole(val);

        // Auto-switch area types based on role intent
        if (['MUNICIPALITY_ADMIN', 'WARD_ADMIN'].includes(val)) {
            setAreaType('Urban');
            setSearchAreaType('Urban');
        }
        if (['MANDAL_ADMIN', 'VILLAGE_ADMIN'].includes(val)) {
            setAreaType('Rural');
            setSearchAreaType('Rural');
        }

        // Clear lower level target selections if role changes to a higher level
        if (val === 'STATE_ADMIN') {
            setTargetDistrict(''); setTargetMandal(''); setTargetVillage(''); setTargetMunicipality(''); setTargetWard('');
            setTargetDistricts([]); setTargetMandals([]); setTargetVillages([]); setTargetMunicipalities([]); setTargetWards([]);
        } else if (val === 'DISTRICT_ADMIN') {
            setTargetMandal(''); setTargetVillage(''); setTargetMunicipality(''); setTargetWard('');
            setTargetMandals([]); setTargetVillages([]); setTargetMunicipalities([]); setTargetWards([]);
        } else if (val === 'MANDAL_ADMIN') {
            setTargetVillage(''); setTargetMunicipality(''); setTargetWard('');
            setTargetVillages([]); setTargetMunicipalities([]); setTargetWards([]);
        } else if (val === 'MUNICIPALITY_ADMIN') {
            setTargetMandal(''); setTargetVillage(''); setTargetWard('');
            setTargetMandals([]); setTargetVillages([]); setTargetWards([]);
        } else if (val === 'VILLAGE_ADMIN') {
            setTargetMunicipality(''); setTargetWard('');
            setTargetMunicipalities([]); setTargetWards([]);
        } else if (val === 'WARD_ADMIN') {
            setTargetMandal(''); setTargetVillage('');
            setTargetMandals([]); setTargetVillages([]);
        }
    };

    const handleTargetStateChange = (e) => {
        const val = e.target.value;
        setTargetState(val);
        setSearchState(val);
        setTargetDistrict(''); setTargetMandal(''); setTargetVillage(''); setTargetMunicipality(''); setTargetWard('');
        setSearchDistrict(''); setSearchMandal(''); setSearchVillage(''); setSearchMunicipality(''); setSearchWard('');
        setTargetDistricts([]); setTargetMandals([]); setTargetVillages([]); setTargetMunicipalities([]); setTargetWards([]);
        setSearchDistricts([]); setSearchMandals([]); setSearchVillages([]); setSearchMunicipalities([]); setSearchWards([]);
        if (val) fetchLocations(val, 'DISTRICT');
    };

    const handleTargetDistrictChange = (e) => {
        const val = e.target.value;
        setTargetDistrict(val);
        setSearchDistrict(val);
        setTargetMandal(''); setTargetVillage(''); setTargetMunicipality(''); setTargetWard('');
        setSearchMandal(''); setSearchVillage(''); setSearchMunicipality(''); setSearchWard('');
        setTargetMandals([]); setTargetVillages([]); setTargetMunicipalities([]); setTargetWards([]);
        setSearchMandals([]); setSearchVillages([]); setSearchMunicipalities([]); setSearchWards([]);
        if (val) {
            fetchLocations(val, 'MANDAL');
            fetchLocations(val, 'MUNICIPALITY');
        }
    };

    const handleTargetMandalChange = (e) => {
        const val = e.target.value;
        setTargetMandal(val);
        setSearchMandal(val);
        setTargetVillage('');
        setSearchVillage('');
        setTargetVillages([]);
        setSearchVillages([]);
        if (val) fetchLocations(val, 'VILLAGE');
    };

    const handleTargetVillageChange = (e) => {
        const val = e.target.value;
        setTargetVillage(val);
        setSearchVillage(val);
    };

    const handleTargetMunicipalityChange = (e) => {
        const val = e.target.value;
        setTargetMunicipality(val);
        setSearchMunicipality(val);
        setTargetWard('');
        setSearchWard('');
        setTargetWards([]);
        setSearchWards([]);
        if (val) fetchLocations(val, 'WARD');
    };

    const handleTargetWardChange = (e) => {
        const val = e.target.value;
        setTargetWard(val);
        setSearchWard(val);
    };

    // --- HANDLERS: SEARCH SCOPE ---
    const handleSearchStateChange = (e) => {
        const val = e.target.value;
        setSearchState(val);
        setSearchDistrict(''); setSearchMandal(''); setSearchVillage(''); setSearchMunicipality(''); setSearchWard('');
        setSearchDistricts([]); setSearchMandals([]); setSearchVillages([]); setSearchMunicipalities([]); setSearchWards([]);
        if (val) fetchSearchLocations(val, 'DISTRICT');
    };

    const handleSearchDistrictChange = (e) => {
        const val = e.target.value;
        setSearchDistrict(val);
        setSearchMandal(''); setSearchVillage(''); setSearchMunicipality(''); setSearchWard('');
        setSearchMandals([]); setSearchVillages([]); setSearchMunicipalities([]); setSearchWards([]);
        if (val) {
            fetchSearchLocations(val, 'MANDAL');
            fetchSearchLocations(val, 'MUNICIPALITY');
        }
    };

    const handleSearchMandalChange = (e) => {
        const val = e.target.value;
        setSearchMandal(val);
        setSearchVillage('');
        setSearchVillages([]);
        if (val) fetchSearchLocations(val, 'VILLAGE');
    };

    const handleSearchVillageChange = (e) => {
        setSearchVillage(e.target.value);
    };

    const handleSearchMunicipalityChange = (e) => {
        const val = e.target.value;
        setSearchMunicipality(val);
        setSearchWard('');
        setSearchWards([]);
        if (val) fetchSearchLocations(val, 'WARD');
    };

    const handleSearchWardChange = (e) => {
        setSearchWard(e.target.value);
    };

    const handleGenderChange = (type) => {
        setSelectedGenders(prev => {
            if (type === 'All') return { All: true, Male: false, Female: false, Other: false };
            const newState = { ...prev, All: false, [type]: !prev[type] };
            if (!newState.Male && !newState.Female && !newState.Other) newState.All = true;
            return newState;
        });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedAgeRanges([]);
        setSelectedCategories([]);
        setSelectedBloodGroups([]);
        setSelectedGenders({ All: true, Male: false, Female: false, Other: false });
        setSearchState(targetState); // Reset to target selection
        setSearchDistrict(targetDistrict);
        setSearchMandal(targetMandal);
        setSearchVillage(targetVillage);
        setSearchMunicipality(targetMunicipality);
        setSearchWard(targetWard);
        setSearchWards(targetWards); // Reset search wards to target wards
        setSearchAreaType(areaType);
        setCurrentPage(1);
    };


    // --- MEMBER FETCHING (Server Side) ---
    const fetchMembers = async () => {
        setLoadingMembers(true);
        try {
            let params = {
                page: currentPage,
                limit: limit,
                search: searchTerm
            };

            // Hierarchical Location Filtering from Search Scope
            // Depends on Search Area Type
            // Cumulative Hierarchical Location Filtering
            if (searchState) params['address.stateID'] = searchState;
            if (searchDistrict) params['address.district'] = searchDistrict;

            if (searchAreaType === 'Rural') {
                if (searchMandal) params['address.mandal'] = searchMandal;
                if (searchVillage) params['address.village'] = searchVillage;
            } else if (searchAreaType === 'Urban') {
                if (searchMunicipality) params['address.municipality'] = searchMunicipality;
                if (searchWard) params['address.wardNumber'] = searchWard;
            }

            // Extra Filters
            if (selectedAgeRanges.length > 0) params.ageRange = selectedAgeRanges[0];
            if (selectedCategories.length > 0) params.occupation = selectedCategories[0];
            if (selectedBloodGroups.length > 0) params.bloodGroup = selectedBloodGroups[0];

            if (!selectedGenders.All) {
                if (selectedGenders.Male) params.gender = 'Male';
                else if (selectedGenders.Female) params.gender = 'Female';
                else if (selectedGenders.Other) params.gender = 'Other';
            }

            const { data } = await API.get('/members', { params });
            console.log("[DEBUG] Members API Response:", data);
            setMembers(data.members || []);
            setTotalResults(data.total || 0);
            setTotalPages(data.pages || 1);
        } catch (err) {
            console.error("Fetch members failed", err);
        } finally {
            setLoadingMembers(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, [currentPage, searchState, searchDistrict, searchMandal, searchVillage, searchMunicipality, searchWard, searchAreaType, selectedAgeRanges, selectedCategories, selectedBloodGroups, selectedGenders]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (currentPage !== 1) setCurrentPage(1);
            else fetchMembers();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // --- HANDLERS: SELECTION ---
    const handleToggleMember = (member) => {
        if (member.role && member.role !== 'MEMBER') {
            alert(`This person is already an Admin at ${member.role.replace('_', ' ')}. Cannot assign as Admin again.`);
            return;
        }

        setSelectedMembers(prev => {
            const exists = prev.find(m => m._id === member._id);
            if (exists) {
                return prev.filter(m => m._id !== member._id);
            } else {
                // SNAP TO MEMBER ADDRESS (Like Permanent Address auto-fill)
                // Only snap if fields are NOT locked by admin's own jurisdiction
                if (member.address) {
                    console.log("[AssignAdmin] Snapping Target Location to Member Address...");
                    const addr = member.address;

                    if (!isFieldLocked('district') && addr.district) {
                        const dId = addr.district._id || addr.district;
                        setTargetDistrict(dId);
                        fetchLocations(dId, 'MANDAL');
                        fetchLocations(dId, 'MUNICIPALITY');
                    }
                    if (!isFieldLocked('mandal') && addr.mandal) {
                        const mId = addr.mandal._id || addr.mandal;
                        setAreaType('Rural');
                        setTargetMandal(mId);
                        fetchLocations(mId, 'VILLAGE');
                    }
                    if (!isFieldLocked('municipality') && addr.municipality) {
                        const muId = addr.municipality._id || addr.municipality;
                        setAreaType('Urban');
                        setTargetMunicipality(muId);
                        fetchLocations(muId, 'WARD');
                    }
                    if (!isFieldLocked('ward') && addr.ward) { // Changed from wardNumber to ward (ID)
                        const wId = addr.ward._id || addr.ward;
                        setAreaType('Urban');
                        setTargetWard(wId);
                    }
                    if (!isFieldLocked('village') && addr.village) {
                        const vId = addr.village._id || addr.village;
                        setAreaType('Rural');
                        setTargetVillage(vId);
                    }
                }
                return [...prev, member];
            }
        });
    };

    // --- ASSIGN ---
    const handleAssign = async () => {
        if (selectedMembers.length === 0 || !selectedRole) return;

        let finalAssignId = '';
        if (selectedRole === 'STATE_ADMIN') finalAssignId = targetState;
        if (selectedRole === 'DISTRICT_ADMIN') finalAssignId = targetDistrict;

        if (selectedRole === 'MUNICIPALITY_ADMIN') finalAssignId = targetMunicipality;
        if (selectedRole === 'WARD_ADMIN') finalAssignId = targetWard;

        if (selectedRole === 'MANDAL_ADMIN') finalAssignId = targetMandal;
        if (selectedRole === 'VILLAGE_ADMIN') finalAssignId = targetVillage;

        if (!finalAssignId) {
            alert("Please complete the Target Location selection.");
            return;
        }

        if (!window.confirm(`Promote ${selectedMembers.length} member(s) to ${ROLE_LABELS[selectedRole]}?`)) return;

        setLoadingAssign(true);
        let successCount = 0;
        let failCount = 0;

        try {
            // Parallel Execution
            const results = await Promise.allSettled(selectedMembers.map(member =>
                API.post('/admin/management/promote-member', {
                    memberId: member._id,
                    role: selectedRole,
                    assignedLocation: finalAssignId
                })
            ));

            results.forEach(res => {
                if (res.status === 'fulfilled') successCount++;
                else {
                    failCount++;
                    console.error("Promotion failed for a member:", res.reason);
                }
            });

            if (failCount === 0) {
                alert(`Success! All ${successCount} members promoted.`);
                navigate('/admin/management');
            } else {
                alert(`Operation Complete.\nSuccess: ${successCount}\nFailed: ${failCount}\nCheck console for details.`);
                if (successCount > 0) {
                    navigate('/admin/management');
                }
            }

        } catch (error) {
            alert("System Error: " + (error.response?.data?.message || error.message));
        } finally {
            setLoadingAssign(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
            <AdminHeader />
            <div className="flex flex-1 overflow-hidden">
                <AdminSidebar activePage="admin-management" />
                <main className="flex-1 overflow-y-auto p-4 md:p-8">

                    {/* Header */}
                    <div className="flex items-center gap-4 mb-6">
                        <button onClick={() => navigate('/admin/management')} className="text-slate-500 hover:text-slate-800 transition">
                            <FaArrowLeft />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Assign New Admin</h1>
                            <p className="text-sm text-slate-500">Define role, scope, and select member</p>
                        </div>
                    </div>

                    <div className="max-w-5xl mx-auto space-y-6">

                        {/* 1. ROLE & TARGET SCOPE */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Role to Assign</label>
                            <select
                                value={selectedRole}
                                onChange={handleRoleChange}
                                className="w-full md:w-1/2 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 font-bold text-slate-800 mb-6"
                            >
                                <option value="">-- Select Role --</option>
                                {allowedRoles.map(r => (
                                    <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                                ))}
                            </select>

                            {selectedRole && (
                                <div className="animate-in fade-in slide-in-from-top-2">
                                    <div className="flex items-center gap-2 mb-4 border-t border-slate-100 pt-4">
                                        <FaUserShield className="text-blue-600 text-lg" />
                                        <h2 className="text-lg font-bold text-slate-800">Target Location</h2>
                                    </div>
                                    <p className="text-xs text-slate-500 mb-4">Select the exact location this new admin will manage.</p>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className={selectedRole === 'SUPER_ADMIN' ? 'hidden' : ''}>
                                            <label className="block text-xs text-slate-600 mb-1 font-semibold">State</label>
                                            <select
                                                value={targetState} onChange={handleTargetStateChange} disabled={isTargetLocked('state')}
                                                className="w-full p-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                            >
                                                <option value="">State</option>
                                                {targetStates.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                            </select>
                                        </div>

                                        {['DISTRICT_ADMIN', 'MUNICIPALITY_ADMIN', 'MANDAL_ADMIN', 'VILLAGE_ADMIN', 'WARD_ADMIN'].includes(selectedRole) && (
                                            <div>
                                                <label className="block text-xs text-slate-600 mb-1 font-semibold">District</label>
                                                <select
                                                    value={targetDistrict} onChange={handleTargetDistrictChange} disabled={!targetState || isTargetLocked('district')}
                                                    className="w-full p-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                                >
                                                    <option value="">District</option>
                                                    {targetDistricts.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                                                </select>
                                            </div>
                                        )}

                                    </div>

                                    {/* Sub-Location Selection (Mandal/Village OR Municipality) */}
                                    {(targetDistrict && ['MANDAL_ADMIN', 'VILLAGE_ADMIN', 'MUNICIPALITY_ADMIN', 'WARD_ADMIN'].includes(selectedRole)) && (
                                        <div className="mt-4 bg-slate-50 p-4 rounded-lg">
                                            {/* Area Type Toggle (Only if Role allows choice or for Member Search context) - Actually Role dictates it largely */}
                                            <div className="flex items-center gap-6 mb-4">
                                                <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Area Type:</span>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="areaType"
                                                        value="Rural"
                                                        checked={areaType === 'Rural'}
                                                        onChange={() => setAreaType('Rural')}
                                                        disabled={['MUNICIPALITY_ADMIN', 'WARD_ADMIN'].includes(selectedRole)} // Locked for Muni/Ward Admin
                                                        className="text-emerald-500 focus:ring-emerald-500"
                                                    />
                                                    <span className={`text-sm font-bold ${areaType === 'Rural' ? 'text-emerald-700' : 'text-slate-500'} flex items-center gap-1`}><FaTree size={12} /> Rural (Mandal/Village)</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="areaType"
                                                        value="Urban"
                                                        checked={areaType === 'Urban'}
                                                        onChange={() => setAreaType('Urban')}
                                                        disabled={['MANDAL_ADMIN', 'VILLAGE_ADMIN'].includes(selectedRole)} // Locked for Rural Admins
                                                        className="text-blue-500 focus:ring-blue-500"
                                                    />
                                                    <span className={`text-sm font-bold ${areaType === 'Urban' ? 'text-blue-700' : 'text-slate-500'} flex items-center gap-1`}><FaCity size={12} /> Urban (Municipality)</span>
                                                </label>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {/* RURAL PATH */}
                                                {areaType === 'Rural' && (
                                                    <>
                                                        <div>
                                                            <label className="block text-xs text-slate-600 mb-1 font-semibold">Mandal</label>
                                                            <select
                                                                value={targetMandal} onChange={handleTargetMandalChange} disabled={!targetDistrict || isTargetLocked('mandal')}
                                                                className="w-full p-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100"
                                                            >
                                                                <option value="">Select Mandal</option>
                                                                {targetMandals.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                                                            </select>
                                                        </div>
                                                        {selectedRole === 'VILLAGE_ADMIN' && (
                                                            <div>
                                                                <label className="block text-xs text-slate-600 mb-1 font-semibold">Village</label>
                                                                <select
                                                                    value={targetVillage} onChange={handleTargetVillageChange} disabled={!targetMandal || isTargetLocked('village')}
                                                                    className="w-full p-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100"
                                                                >
                                                                    <option value="">Select Village</option>
                                                                    {targetVillages.map(v => <option key={v._id} value={v._id}>{v.name}</option>)}
                                                                </select>
                                                            </div>
                                                        )}
                                                    </>
                                                )}

                                                {/* URBAN PATH */}
                                                {areaType === 'Urban' && (
                                                    <>
                                                        <div>
                                                            <label className="block text-xs text-slate-600 mb-1 font-semibold">Municipality</label>
                                                            <select
                                                                value={targetMunicipality} onChange={handleTargetMunicipalityChange} disabled={!targetDistrict || isTargetLocked('municipality')}
                                                                className="w-full p-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                                            >
                                                                <option value="">Select Municipality</option>
                                                                {targetMunicipalities.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                                                            </select>
                                                        </div>
                                                        {selectedRole === 'WARD_ADMIN' && (
                                                            <div>
                                                                <label className="block text-xs text-slate-600 mb-1 font-semibold">Ward Number</label>
                                                                <select
                                                                    value={targetWard} onChange={handleTargetWardChange} disabled={!targetMunicipality || isTargetLocked('ward')}
                                                                    className="w-full p-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                                                >
                                                                    <option value="">Select Ward</option>
                                                                    {targetWards.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
                                                                </select>
                                                            </div>
                                                        )}
                                                    </>
                                                )}

                                            </div>
                                        </div>
                                    )}

                                </div>
                            )}
                        </div>

                        {/* 2. MEMBER SELECTION SCOPE */}
                        {selectedRole && (
                            <div className="bg-white rounded-xl shadow-sm border border-emerald-500 ring-1 ring-emerald-500 p-6 animate-in fade-in slide-in-from-bottom-2 relative">
                                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                                    MEMBER SEARCH
                                </div>
                                <div className="flex items-center gap-2 mb-4">
                                    <FaUsers className="text-emerald-600 text-lg" />
                                    <h2 className="text-lg font-bold text-slate-800">Target Member Selection</h2>
                                </div>
                                <p className="text-xs text-slate-500 mb-4">
                                    Use these filters to find the member you want to promote. (Auto-filled from Target, but valid to change).
                                </p>

                                <div className="space-y-6">
                                    {/* Hierarchical Address Filters for Search */}
                                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                            <div>
                                                <label className="block text-[10px] text-slate-500 mb-1 font-bold uppercase">State</label>
                                                <select
                                                    value={searchState} onChange={handleSearchStateChange}
                                                    className="w-full p-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500"
                                                >
                                                    <option value="">All States</option>
                                                    {searchStates.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] text-slate-500 mb-1 font-bold uppercase">District</label>
                                                <select
                                                    value={searchDistrict} onChange={handleSearchDistrictChange} disabled={!searchState}
                                                    className="w-full p-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100"
                                                >
                                                    <option value="">All Districts</option>
                                                    {searchDistricts.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4 border-t border-slate-200 pt-4">
                                            <div>
                                                <label className="block text-[10px] text-slate-500 mb-1 font-bold uppercase">Search Area Type</label>
                                                <select
                                                    value={searchAreaType}
                                                    onChange={(e) => setSearchAreaType(e.target.value)}
                                                    className="w-full p-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500"
                                                >
                                                    <option value="Rural">Rural (Mandal/Village)</option>
                                                    <option value="Urban">Urban (Municipality)</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {searchAreaType === 'Rural' ? (
                                                <>
                                                    <div>
                                                        <label className="block text-[10px] text-slate-500 mb-1 font-bold uppercase">Mandal</label>
                                                        <select
                                                            value={searchMandal} onChange={handleSearchMandalChange}
                                                            disabled={!searchDistrict}
                                                            className="w-full p-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100 disabled:text-slate-400"
                                                        >
                                                            <option value="">{searchDistrict ? 'All Mandals' : 'Select District First'}</option>
                                                            {searchMandals.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] text-slate-500 mb-1 font-bold uppercase">Village</label>
                                                        <select
                                                            value={searchVillage} onChange={handleSearchVillageChange}
                                                            disabled={!searchMandal}
                                                            className="w-full p-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100 disabled:text-slate-400"
                                                        >
                                                            <option value="">{searchMandal ? 'All Villages' : 'Select Mandal First'}</option>
                                                            {searchVillages.map(v => <option key={v._id} value={v._id}>{v.name}</option>)}
                                                        </select>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div>
                                                        <label className="block text-[10px] text-slate-500 mb-1 font-bold uppercase">Municipality</label>
                                                        <select
                                                            value={searchMunicipality} onChange={handleSearchMunicipalityChange}
                                                            disabled={!searchDistrict}
                                                            className="w-full p-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
                                                        >
                                                            <option value="">{searchDistrict ? 'All Municipalities' : 'Select District First'}</option>
                                                            {searchMunicipalities.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                                                        </select>
                                                    </div>
                                                    <div className="flex-1">
                                                        <label className="block text-[10px] text-slate-400 mb-1 font-bold uppercase tracking-wider">Ward Number</label>
                                                        <select
                                                            value={searchWard}
                                                            onChange={handleSearchWardChange}
                                                            disabled={!searchMunicipality}
                                                            className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                                                        >
                                                            <option value="">Select Ward</option>
                                                            {searchWards.map(w => (
                                                                <option key={w._id} value={w._id}>{w.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Search by name, phone..."
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div>
                                            <MultiSelect
                                                label="Age Range"
                                                options={['18-25', '26-40', '41-60', '60+']}
                                                selected={selectedAgeRanges}
                                                onChange={setSelectedAgeRanges}
                                                placeholder="Select Age Ranges"
                                            />
                                        </div>
                                        <div>
                                            <MultiSelect
                                                label="Occupation"
                                                options={['Farmer', 'Student', 'Business', 'Private Job']}
                                                selected={selectedCategories}
                                                onChange={setSelectedCategories}
                                                placeholder="Select Occupations"
                                            />
                                        </div>
                                        <div>
                                            <MultiSelect
                                                label="Blood Group"
                                                options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']}
                                                selected={selectedBloodGroups}
                                                onChange={setSelectedBloodGroups}
                                                placeholder="Select Blood Groups"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <span className="text-xs font-bold text-slate-600">Gender</span>
                                            <div className="flex items-center gap-2 flex-wrap h-auto min-h-[40px]">
                                                {['All', 'Male', 'Female', 'Other'].map(type => (
                                                    <label key={type} className="flex items-center gap-2 cursor-pointer select-none">
                                                        <div
                                                            className={`w-4 h-4 border rounded flex items-center justify-center transition-colors ${selectedGenders[type] ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'}`}
                                                            onClick={(e) => { e.preventDefault(); handleGenderChange(type); }}
                                                        >
                                                            {selectedGenders[type] && <FaCheckSquare size={10} />}
                                                        </div>
                                                        <span className="text-sm text-slate-600">{type}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-2">
                                        <button onClick={clearFilters} className="bg-white border border-slate-200 text-slate-600 px-5 py-2 rounded-lg text-xs font-bold hover:bg-slate-50 transition h-10">Clear All Filters</button>
                                    </div>
                                </div>

                                {/* Member List */}
                                <div className="mt-6">
                                    {loadingMembers ? (
                                        <div className="text-center p-8 text-slate-500">Loading Members...</div>
                                    ) : (
                                        <div className="border rounded-lg border-slate-200 overflow-hidden">
                                            <div className="bg-slate-50 p-3 text-xs font-bold text-slate-500 border-b border-slate-200 flex justify-between items-center">
                                                <span>Showing {members.length} of {totalResults} Members</span>
                                                {totalPages > 1 && (
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            disabled={currentPage === 1}
                                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                            className="px-2 py-1 border rounded hover:bg-white disabled:opacity-30"
                                                        >Prev</button>
                                                        <span>Page {currentPage} of {totalPages}</span>
                                                        <button
                                                            disabled={currentPage === totalPages}
                                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                            className="px-2 py-1 border rounded hover:bg-white disabled:opacity-30"
                                                        >Next</button>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="max-h-[500px] overflow-y-auto">
                                                {members.length === 0 ? (
                                                    <div className="p-8 text-center text-slate-400 text-sm">
                                                        No members found for this strict filter. Try searching higher levels or adjusting scope.
                                                    </div>
                                                ) : (
                                                    <table className="w-full text-left text-sm border-collapse">
                                                        <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200">
                                                            <tr>
                                                                <th className="p-3 w-10"></th>
                                                                <th className="p-3 font-bold text-slate-600">Name</th>
                                                                <th className="p-3 font-bold text-slate-600">Phone</th>
                                                                <th className="p-3 font-bold text-slate-600">State</th>
                                                                <th className="p-3 font-bold text-slate-600">District</th>
                                                                <th className="p-3 font-bold text-slate-600">Mandal/Muni.</th>
                                                                <th className="p-3 font-bold text-slate-600">Village/Ward</th>
                                                                <th className="p-3 font-bold text-slate-600 text-right">Role</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-100 bg-white">
                                                            {members.map(m => {
                                                                const isSelected = selectedMembers.some(sel => sel._id === m._id);
                                                                const isAlreadyAdmin = m.role && m.role !== 'MEMBER';

                                                                return (
                                                                    <tr
                                                                        key={m._id}
                                                                        onClick={() => handleToggleMember(m)}
                                                                        className={`transition border-b border-slate-50 last:border-0
                                                                            ${isAlreadyAdmin
                                                                                ? 'bg-slate-50 opacity-60 cursor-not-allowed hover:bg-slate-50'
                                                                                : `hover:bg-emerald-50 cursor-pointer ${isSelected ? 'bg-emerald-50 ring-1 ring-emerald-300' : ''}`
                                                                            }
                                                                        `}
                                                                    >
                                                                        <td className="p-3 w-10">
                                                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all 
                                                                                ${isAlreadyAdmin ? 'border-slate-200 bg-slate-100' :
                                                                                    isSelected ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300 bg-white'
                                                                                }
                                                                            `}>
                                                                                {isSelected && <FaCheckCircle size={12} />}
                                                                            </div>
                                                                        </td>
                                                                        <td className="p-3">
                                                                            <div className="font-semibold text-slate-700">{m.name} {m.surname}</div>
                                                                            <div className="text-[10px] text-slate-400">{m.mewsId || 'No ID'}</div>
                                                                        </td>
                                                                        <td className="p-3 font-mono text-slate-500 text-xs">{m.mobileNumber}</td>
                                                                        <td className="p-3 text-xs text-slate-600">{m.address?.state || 'TS'}</td>
                                                                        <td className="p-3 text-xs text-slate-600">{getLocationName(m.address?.district)}</td>
                                                                        <td className="p-3 text-xs text-slate-600">
                                                                            {m.address?.municipality ? getLocationName(m.address.municipality) : getLocationName(m.address?.mandal)}
                                                                        </td>
                                                                        <td className="p-3 text-xs text-slate-600">
                                                                            {m.address?.municipality ? (m.address.wardNumber ? `Ward ${m.address.wardNumber}` : 'Urban') : getLocationName(m.address?.village)}
                                                                        </td>
                                                                        <td className="p-3 text-right">
                                                                            {m.role && m.role !== 'MEMBER' ? (
                                                                                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded whitespace-nowrap">{m.role.replace('_', ' ')}</span>
                                                                            ) : <span className="text-slate-400 text-[10px]">Member</span>}
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Action Button */}
                                <div className="mt-6 flex justify-end">
                                    <button
                                        onClick={handleAssign}
                                        disabled={selectedMembers.length === 0 || loadingAssign}
                                        className="px-6 py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-black transition shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loadingAssign ? 'Assigning...' : `Confirm Role Assignment (${selectedMembers.length})`}
                                        <FaCheckCircle className={loadingAssign ? 'hidden' : ''} />
                                    </button>
                                </div>

                            </div>
                        )}

                    </div>
                </main>
            </div>
        </div>
    );
};

export default AssignAdmin;
