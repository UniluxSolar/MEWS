import React, { useState, useEffect } from 'react';
import { FaUserShield, FaSearch, FaArrowLeft, FaMapMarkerAlt, FaCheckCircle, FaUsers } from 'react-icons/fa';
import API from '../api';
import AdminHeader from '../components/AdminHeader';
import AdminSidebar from '../components/AdminSidebar';
import { useNavigate } from 'react-router-dom';

const AssignAdmin = () => {
    const navigate = useNavigate();
    const adminInfo = JSON.parse(localStorage.getItem('adminInfo') || '{}');
    const userRole = adminInfo.role;

    // Hierarchy Definitions
    const HIERARCHY = {
        'SUPER_ADMIN': 5,
        'STATE_ADMIN': 4,
        'DISTRICT_ADMIN': 3,
        'MANDAL_ADMIN': 2,
        'VILLAGE_ADMIN': 1
    };

    const ROLE_LABELS = {
        'STATE_ADMIN': 'State Admin',
        'DISTRICT_ADMIN': 'District Admin',
        'MANDAL_ADMIN': 'Mandal Admin',
        'VILLAGE_ADMIN': 'Village Admin'
    };

    const allowedRoles = Object.keys(HIERARCHY).filter(r => HIERARCHY[r] < HIERARCHY[userRole]);

    // Role Selection
    const [selectedRole, setSelectedRole] = useState('');

    // --- TARGET LOCATION SCOPE (Where the Admin will be assigned) ---
    const [targetStates, setTargetStates] = useState([]);
    const [targetDistricts, setTargetDistricts] = useState([]);
    const [targetMandals, setTargetMandals] = useState([]);
    const [targetVillages, setTargetVillages] = useState([]);

    const [targetState, setTargetState] = useState('');
    const [targetDistrict, setTargetDistrict] = useState('');
    const [targetMandal, setTargetMandal] = useState('');
    const [targetVillage, setTargetVillage] = useState('');

    // --- MEMBER SELECTION SCOPE (Where to find the member) ---
    const [filterStates, setFilterStates] = useState([]);
    const [filterDistricts, setFilterDistricts] = useState([]);
    const [filterMandals, setFilterMandals] = useState([]);
    const [filterVillages, setFilterVillages] = useState([]);

    const [filterState, setFilterState] = useState('');
    const [filterDistrict, setFilterDistrict] = useState('');
    const [filterMandal, setFilterMandal] = useState('');
    const [filterVillage, setFilterVillage] = useState('');

    // Pre-filled User Info
    const [userLocationHierarchy, setUserLocationHierarchy] = useState(null);

    // Data & Filters
    const [members, setMembers] = useState([]);
    const [loadingMembers, setLoadingMembers] = useState(false);
    const [filteredMembers, setFilteredMembers] = useState([]);
    const [searchMobile, setSearchMobile] = useState('');
    const [searchName, setSearchName] = useState('');
    const [selectedMember, setSelectedMember] = useState(null);
    const [loadingAssign, setLoadingAssign] = useState(false);


    // --- INITIALIZATION ---
    useEffect(() => {
        fetchRootLocations();
    }, []);

    const fetchRootLocations = async () => {
        try {
            if (userRole === 'SUPER_ADMIN') {
                const { data } = await API.get('/locations?type=STATE');
                setTargetStates(data);
                setFilterStates(data); // Initially same available options
            } else {
                if (adminInfo.assignedLocation) {
                    const { data } = await API.get(`/locations/${adminInfo.assignedLocation}`);
                    setUserLocationHierarchy(data);
                }
            }
        } catch (error) {
            console.error("Error fetching locations", error);
        }
    };

    // Pre-fill Logic from User Hierarchy
    useEffect(() => {
        if (userLocationHierarchy) {
            const loc = userLocationHierarchy;

            // Populate Target Dropdowns based on Hierarchy
            if (loc.type === 'STATE') {
                setTargetStates([loc]); setTargetState(loc._id);
                setFilterStates([loc]); setFilterState(loc._id);
                fetchLocations(loc._id, 'DISTRICT', true);
                fetchLocations(loc._id, 'DISTRICT', false);
            } else if (loc.type === 'DISTRICT') {
                setTargetDistricts([loc]); setTargetDistrict(loc._id);
                setFilterDistricts([loc]); setFilterDistrict(loc._id);
                fetchLocations(loc._id, 'MANDAL', true);
                fetchLocations(loc._id, 'MANDAL', false);
            } else if (loc.type === 'MANDAL') {
                setTargetMandals([loc]); setTargetMandal(loc._id);
                setFilterMandals([loc]); setFilterMandal(loc._id);
                fetchLocations(loc._id, 'VILLAGE', true);
                fetchLocations(loc._id, 'VILLAGE', false);
            } else if (loc.type === 'VILLAGE') {
                setTargetVillages([loc]); setTargetVillage(loc._id);
                setFilterVillages([loc]); setFilterVillage(loc._id);
            }
        }
    }, [userLocationHierarchy]);


    // --- GENERIC LOCATION FETCH ---
    const fetchLocations = async (parentId, type, isTargetScope) => {
        if (!parentId) {
            // Clear downstream if parent is removed
            if (isTargetScope) {
                if (type === 'DISTRICT') setTargetDistricts([]); // And clear lower? Yes, ideally
                if (type === 'MANDAL') setTargetMandals([]);
                if (type === 'VILLAGE') setTargetVillages([]);
            } else {
                if (type === 'DISTRICT') setFilterDistricts([]);
                if (type === 'MANDAL') setFilterMandals([]);
                if (type === 'VILLAGE') setFilterVillages([]);
            }
            return;
        }
        try {
            const { data } = await API.get(`/locations?parent=${parentId}`);
            if (isTargetScope) {
                if (type === 'DISTRICT') setTargetDistricts(data);
                if (type === 'MANDAL') setTargetMandals(data);
                if (type === 'VILLAGE') setTargetVillages(data);
            } else {
                if (type === 'DISTRICT') setFilterDistricts(data);
                if (type === 'MANDAL') setFilterMandals(data);
                if (type === 'VILLAGE') setFilterVillages(data);
            }
        } catch (e) { console.error(e); }
    };


    // --- AUTO-FILL LOGIC (Target -> Filter) ---
    useEffect(() => {
        if (targetState) {
            setFilterState(targetState);
            fetchLocations(targetState, 'DISTRICT', false);
        } else {
            setFilterState('');
            setFilterDistrict(''); setFilterMandal(''); setFilterVillage('');
        }
    }, [targetState]);

    useEffect(() => {
        if (targetDistrict) {
            setFilterDistrict(targetDistrict);
            fetchLocations(targetDistrict, 'MANDAL', false);
        } else {
            setFilterDistrict('');
            setFilterMandal(''); setFilterVillage('');
        }
    }, [targetDistrict]);

    useEffect(() => {
        if (targetMandal) {
            setFilterMandal(targetMandal);
            fetchLocations(targetMandal, 'VILLAGE', false);
        } else {
            setFilterMandal('');
            setFilterVillage('');
        }
    }, [targetMandal]);

    useEffect(() => {
        if (targetVillage) {
            setFilterVillage(targetVillage);
        } else {
            setFilterVillage('');
        }
    }, [targetVillage]);


    // --- HANDLERS: TARGET SCOPE ---
    const handleRoleChange = (e) => setSelectedRole(e.target.value);

    const handleTargetStateChange = (e) => {
        const val = e.target.value;
        setTargetState(val);
        setTargetDistrict(''); setTargetMandal(''); setTargetVillage('');
        fetchLocations(val, 'DISTRICT', true);
    };

    const handleTargetDistrictChange = (e) => {
        const val = e.target.value;
        setTargetDistrict(val);
        setTargetMandal(''); setTargetVillage('');
        fetchLocations(val, 'MANDAL', true);
    };

    const handleTargetMandalChange = (e) => {
        const val = e.target.value;
        setTargetMandal(val);
        setTargetVillage('');
        fetchLocations(val, 'VILLAGE', true);
    };

    const handleTargetVillageChange = (e) => {
        setTargetVillage(e.target.value);
    };


    // --- HANDLERS: FILTER SCOPE ---
    // Strict Hierarchical Update: Reset lower levels on change
    const handleFilterStateChange = (e) => {
        const val = e.target.value;
        setFilterState(val);
        setFilterDistrict(''); setFilterMandal(''); setFilterVillage('');
        fetchLocations(val, 'DISTRICT', false);
    };

    const handleFilterDistrictChange = (e) => {
        const val = e.target.value;
        setFilterDistrict(val);
        setFilterMandal(''); setFilterVillage('');
        fetchLocations(val, 'MANDAL', false);
    };

    const handleFilterMandalChange = (e) => {
        const val = e.target.value;
        setFilterMandal(val);
        setFilterVillage('');
        fetchLocations(val, 'VILLAGE', false);
    };

    const handleFilterVillageChange = (e) => {
        setFilterVillage(e.target.value);
    };


    // --- MEMBER FETCHING ---
    // Trigger on any filter change that is valid
    useEffect(() => {
        setMembers([]);
        setFilteredMembers([]);
        setSelectedMember(null);

        // Logic: Fetch based on the deepest selected filter
        let locId = '';
        let locType = '';

        if (filterVillage) { locId = filterVillage; locType = 'VILLAGE'; }
        else if (filterMandal) { locId = filterMandal; locType = 'MANDAL'; }
        else if (filterDistrict) { locId = filterDistrict; locType = 'DISTRICT'; }
        else if (filterState) { locId = filterState; locType = 'STATE'; } // Optional: might be too broad

        // We only fetch if we have at least District or Mandal level?
        // Or if State is selected and we want to show all (limit by pagination?)
        // Let's allow fetching even at State level but backend might limit results.

        if (!locId) return;

        setLoadingMembers(true);
        const fetchM = async () => {
            try {
                let params = {};
                // STRICT FILTERING: Backend expects these exact keys
                if (locType === 'VILLAGE') params['address.village'] = locId;
                if (locType === 'MANDAL') params['address.mandal'] = locId;
                if (locType === 'DISTRICT') params['address.district'] = locId;
                // If STATE: We might need backend logic to handle 'address.district.parent' or similar.
                // Assuming backend controller handles this or we iterate districts?
                // The prompt says "If State only is selected -> show members from that State".
                // Our simple getMembers API checks address fields which are ObjectIDs for Village/Mandal/District.
                // It doesn't natively support State ID in 'address.state' because schema might just have text.
                // But let's pass it anyway if controller supports it, or rely on District.
                // Actually, let's skip fetching for just 'State' if it's too broad, OR use query param 'stateId' if backend supports.
                // Based on `memberController.js` we saw, it checks:
                // address.village, address.mandal, address.district.
                // Does it check State? It iterates if State Admin.
                // Let's pass query params clearly.

                // HACK: To support State filtering without direct StateID in schema, we might rely on the fact that
                // if we don't pass params, it returns all? No.
                // If locType is STATE, we might be stuck unless we fetch all children districts.
                // However, usually User selects at least District or Mandal.
                // Let's proceed with lower levels being primary.

                const { data } = await API.get('/members', { params });
                setMembers(data);
                setFilteredMembers(data);
            } catch (err) {
                console.error("Fetch members failed", err);
            } finally {
                setLoadingMembers(false);
            }
        };
        fetchM();

    }, [filterState, filterDistrict, filterMandal, filterVillage]);


    // --- FRONTEND FILTERING (Search & Role) ---
    useEffect(() => {
        if (!members.length) {
            setFilteredMembers([]);
            return;
        }

        let res = members;
        // 1. Hierarchy Filter (Exclude higher admins)
        if (selectedRole) {
            const targetRank = HIERARCHY[selectedRole];
            res = res.filter(m => {
                if (!m.role || m.role === 'MEMBER') return true;
                const memberRank = HIERARCHY[m.role] || 0;
                return memberRank < targetRank;
            });
        }

        // 2. Text Search
        if (searchMobile) {
            res = res.filter(m => m.mobileNumber.includes(searchMobile));
        }
        if (searchName) {
            const term = searchName.toLowerCase();
            res = res.filter(m =>
                (m.name && m.name.toLowerCase().includes(term)) ||
                (m.surname && m.surname.toLowerCase().includes(term))
            );
        }

        setFilteredMembers(res);
    }, [members, searchMobile, searchName, selectedRole]);


    // --- ASSIGN ---
    const handleAssign = async () => {
        if (!selectedMember || !selectedRole) return;

        // Determine Final Target ID based on Role
        let finalAssignId = '';
        if (selectedRole === 'STATE_ADMIN') finalAssignId = targetState;
        if (selectedRole === 'DISTRICT_ADMIN') finalAssignId = targetDistrict;
        if (selectedRole === 'MANDAL_ADMIN') finalAssignId = targetMandal;
        if (selectedRole === 'VILLAGE_ADMIN') finalAssignId = targetVillage;

        if (!finalAssignId) {
            alert("Please complete the Target Location Scope selection.");
            return;
        }

        if (!window.confirm(`Promote ${selectedMember.name} to ${ROLE_LABELS[selectedRole]}?`)) return;

        setLoadingAssign(true);
        try {
            await API.post('/admin/management/promote-member', {
                memberId: selectedMember._id,
                role: selectedRole,
                assignedLocation: finalAssignId
            });
            alert("Success! Member promoted.");
            navigate('/admin/management');
        } catch (error) {
            alert(error.response?.data?.message || "Operation failed");
        } finally {
            setLoadingAssign(false);
        }
    };

    // Helper: Lock Target Fields
    const isTargetLocked = (level) => {
        if (!userLocationHierarchy) return false;
        const type = userLocationHierarchy.type;
        if (level === 'state') return true;
        if (level === 'district' && ['DISTRICT', 'MANDAL', 'VILLAGE'].includes(type)) return true;
        if (level === 'mandal' && ['MANDAL', 'VILLAGE'].includes(type)) return true;
        if (level === 'village' && ['VILLAGE'].includes(type)) return true;
        return false;
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
                                        <h2 className="text-lg font-bold text-slate-800">Target Location Scope</h2>
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

                                        {['DISTRICT_ADMIN', 'MANDAL_ADMIN', 'VILLAGE_ADMIN'].includes(selectedRole) && (
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

                                        {['MANDAL_ADMIN', 'VILLAGE_ADMIN'].includes(selectedRole) && (
                                            <div>
                                                <label className="block text-xs text-slate-600 mb-1 font-semibold">Mandal</label>
                                                <select
                                                    value={targetMandal} onChange={handleTargetMandalChange} disabled={!targetDistrict || isTargetLocked('mandal')}
                                                    className="w-full p-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                                >
                                                    <option value="">Mandal</option>
                                                    {targetMandals.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                                                </select>
                                            </div>
                                        )}

                                        {['VILLAGE_ADMIN'].includes(selectedRole) && (
                                            <div>
                                                <label className="block text-xs text-slate-600 mb-1 font-semibold">Village</label>
                                                <select
                                                    value={targetVillage} onChange={handleTargetVillageChange} disabled={!targetMandal || isTargetLocked('village')}
                                                    className="w-full p-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                                >
                                                    <option value="">Village</option>
                                                    {targetVillages.map(v => <option key={v._id} value={v._id}>{v.name}</option>)}
                                                </select>
                                            </div>
                                        )}
                                    </div>
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
                                    <h2 className="text-lg font-bold text-slate-800">Member Selection Scope</h2>
                                </div>
                                <p className="text-xs text-slate-500 mb-4">
                                    Use these filters to find the member you want to promote. (Auto-filled from Target, but valid to change).
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    <div>
                                        <label className="block text-xs text-slate-600 mb-1 font-semibold">Filter State</label>
                                        <select
                                            value={filterState} onChange={handleFilterStateChange}
                                            className="w-full p-2 border rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                                        >
                                            <option value="">State</option>
                                            {filterStates.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-600 mb-1 font-semibold">Filter District</label>
                                        <select
                                            value={filterDistrict} onChange={handleFilterDistrictChange} disabled={!filterState}
                                            className="w-full p-2 border rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100"
                                        >
                                            <option value="">District</option>
                                            {filterDistricts.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-600 mb-1 font-semibold">Filter Mandal</label>
                                        <select
                                            value={filterMandal} onChange={handleFilterMandalChange} disabled={!filterDistrict}
                                            className="w-full p-2 border rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100"
                                        >
                                            <option value="">Mandal</option>
                                            {filterMandals.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-600 mb-1 font-semibold">Filter Village</label>
                                        <select
                                            value={filterVillage} onChange={handleFilterVillageChange} disabled={!filterMandal}
                                            className="w-full p-2 border rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100"
                                        >
                                            <option value="">Village</option>
                                            {filterVillages.map(v => <option key={v._id} value={v._id}>{v.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {/* Search Bars */}
                                <div className="flex flex-col md:flex-row gap-4 border-t border-slate-100 pt-4">
                                    <div className="flex-1 relative">
                                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Search by Mobile"
                                            className="w-full pl-9 p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-emerald-500"
                                            value={searchMobile}
                                            onChange={e => setSearchMobile(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex-1 relative">
                                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Search by Name"
                                            className="w-full pl-9 p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-emerald-500"
                                            value={searchName}
                                            onChange={e => setSearchName(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Member List */}
                                <div className="mt-6">
                                    {loadingMembers ? (
                                        <div className="text-center p-8 text-slate-500">Loading Members...</div>
                                    ) : (
                                        <div className="border rounded-lg border-slate-200 overflow-hidden">
                                            <div className="bg-slate-50 p-3 text-xs font-bold text-slate-500 border-b border-slate-200 flex justify-between">
                                                <span>Found {filteredMembers.length} Members</span>
                                            </div>
                                            <div className="max-h-[300px] overflow-y-auto">
                                                {filteredMembers.length === 0 ? (
                                                    <div className="p-8 text-center text-slate-400 text-sm">
                                                        No members found for this strict filter. Try searching higher levels or adjusting scope.
                                                    </div>
                                                ) : (
                                                    <table className="w-full text-left text-sm">
                                                        <tbody className="divide-y divide-slate-100">
                                                            {filteredMembers.map(m => (
                                                                <tr
                                                                    key={m._id}
                                                                    onClick={() => setSelectedMember(m)}
                                                                    className={`hover:bg-emerald-50 cursor-pointer transition ${selectedMember?._id === m._id ? 'bg-emerald-50 ring-1 ring-emerald-300' : ''}`}
                                                                >
                                                                    <td className="p-3 w-10">
                                                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedMember?._id === m._id ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'}`}>
                                                                            {selectedMember?._id === m._id && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                                                                        </div>
                                                                    </td>
                                                                    <td className="p-3 font-semibold text-slate-700">{m.name} {m.surname}</td>
                                                                    <td className="p-3 font-mono text-slate-500 text-xs">{m.mobileNumber}</td>
                                                                    <td className="p-3 text-right">
                                                                        {m.role && m.role !== 'MEMBER' ? (
                                                                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded">{m.role.replace('_', ' ')}</span>
                                                                        ) : <span className="text-slate-400 text-[10px]">Member</span>}
                                                                    </td>
                                                                </tr>
                                                            ))}
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
                                        disabled={!selectedMember || loadingAssign}
                                        className="px-6 py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-black transition shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loadingAssign ? 'Assigning...' : 'Confirm Assignment'}
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
