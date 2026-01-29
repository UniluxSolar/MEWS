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
        'MUNICIPALITY_ADMIN': 3, // New Role
        'MANDAL_ADMIN': 2,
        'VILLAGE_ADMIN': 1
    };

    const ROLE_LABELS = {
        'STATE_ADMIN': 'State Admin',
        'DISTRICT_ADMIN': 'District Admin',
        'MUNICIPALITY_ADMIN': 'Municipality Admin',
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
    const [targetMunicipality, setTargetMunicipality] = useState(''); // New

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

                // Default auto-select Telangana for Super Admin if not already set
                if (sortedStates.length > 0 && !targetState) {
                    const ts = sortedStates.find(s => s.name === 'Telangana' || s.name.toUpperCase() === 'TELANGANA') || sortedStates[0];
                    setTargetState(ts._id);
                    fetchLocations(ts._id, 'DISTRICT');
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
        }
    }, [adminLocation, userRole]);

    // Generic pre-fill logic removed in favor of adminLocation hook effect


    // --- GENERIC LOCATION FETCH ---
    const fetchLocations = async (parentId, type) => {
        if (!parentId) {
            // Clear downstream if parent is removed area-specifically
            if (type === 'DISTRICT') setTargetDistricts([]);
            if (type === 'MANDAL') setTargetMandals([]);
            if (type === 'VILLAGE') setTargetVillages([]);
            if (type === 'MUNICIPALITY') setTargetMunicipalities([]);
            return;
        }
        try {
            const { data } = await API.get(`/locations?parent=${parentId}`);
            // Filter by type to be safe
            const filteredData = data.filter(d => d.type === type);
            const sortedData = [...filteredData].sort((a, b) => a.name.localeCompare(b.name));

            if (type === 'DISTRICT') setTargetDistricts(sortedData);
            if (type === 'MANDAL') setTargetMandals(sortedData);
            if (type === 'VILLAGE') setTargetVillages(sortedData);
            if (type === 'MUNICIPALITY') setTargetMunicipalities(sortedData);
        } catch (e) {
            console.error(e);
        }
    };

    // --- HANDLERS: TARGET SCOPE ---
    const handleRoleChange = (e) => {
        const role = e.target.value;
        setSelectedRole(role);

        // Auto-switch area types based on role intent
        if (role === 'MUNICIPALITY_ADMIN') setAreaType('Urban');
        if (['MANDAL_ADMIN', 'VILLAGE_ADMIN'].includes(role)) setAreaType('Rural');
    };

    const handleTargetStateChange = (e) => {
        const val = e.target.value;
        setTargetState(val);
        setTargetDistrict(''); setTargetMandal(''); setTargetVillage(''); setTargetMunicipality('');
        fetchLocations(val, 'DISTRICT');
    };

    const handleTargetDistrictChange = (e) => {
        const val = e.target.value;
        setTargetDistrict(val);
        setTargetMandal(''); setTargetVillage(''); setTargetMunicipality('');
        fetchLocations(val, 'MANDAL');
        fetchLocations(val, 'MUNICIPALITY');
    };

    const handleTargetMandalChange = (e) => {
        const val = e.target.value;
        setTargetMandal(val);
        setTargetVillage('');
        fetchLocations(val, 'VILLAGE');
    };

    const handleTargetVillageChange = (e) => {
        setTargetVillage(e.target.value);
    };

    const handleTargetMunicipalityChange = (e) => {
        setTargetMunicipality(e.target.value);
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

            // Hierarchical Location Filtering from Target Scope
            // Depends on Area Type
            if (areaType === 'Rural') {
                if (targetVillage) params['address.village'] = targetVillage;
                else if (targetMandal) params['address.mandal'] = targetMandal;
            } else if (areaType === 'Urban') {
                if (targetMunicipality) params['address.municipality'] = targetMunicipality;
            }

            // Fallback to District/State if lower levels not selected
            // But only if we haven't selected a specific leaf yet
            // If explicit Municipality or Village isn't selected, check higher levels
            const hasLeafSelection = (areaType === 'Rural' && (targetVillage || targetMandal)) || (areaType === 'Urban' && targetMunicipality);

            if (!hasLeafSelection) {
                if (targetDistrict) params['address.district'] = targetDistrict;
                else if (targetState) params['address.stateID'] = targetState;
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
    }, [currentPage, targetState, targetDistrict, targetMandal, targetVillage, targetMunicipality, areaType, selectedAgeRanges, selectedCategories, selectedBloodGroups, selectedGenders]);

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

    // Helper: Lock Target Fields (Unified via useAdminLocation) - Already declared at line 114



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

                                        {['DISTRICT_ADMIN', 'MUNICIPALITY_ADMIN', 'MANDAL_ADMIN', 'VILLAGE_ADMIN'].includes(selectedRole) && (
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
                                    {(targetDistrict && ['MANDAL_ADMIN', 'VILLAGE_ADMIN', 'MUNICIPALITY_ADMIN'].includes(selectedRole)) && (
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
                                                        disabled={selectedRole === 'MUNICIPALITY_ADMIN'} // Locked for Muni Admin
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
                                                        {/* Future: Ward Selection here if we have Ward Admins? For now, Municipality Admin manages the whole Muni */}
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
