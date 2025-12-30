import React, { useState, useEffect } from 'react';
import API from '../api';
import { Link } from 'react-router-dom';
import { renderToStaticMarkup } from 'react-dom/server';
import {
    FaSearch, FaFilter, FaEye, FaEdit, FaPhoneAlt, FaFileDownload, FaFileUpload,
    FaChevronLeft, FaChevronRight, FaEllipsisV, FaCheckSquare, FaTrash, FaIdCard,
    FaThLarge, FaTable, FaMapMarkedAlt, FaUser, FaUserTie, FaMapMarkerAlt, FaPlus,
    FaSort, FaSortUp, FaSortDown
} from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import DashboardHeader from '../components/common/DashboardHeader';
// Map Imports
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom Icon Generator
const createCustomIcon = (color) => {
    const iconMarkup = renderToStaticMarkup(
        <div style={{ color: color, fontSize: '32px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>
            <FaMapMarkerAlt />
        </div>
    );
    return L.divIcon({
        html: iconMarkup,
        className: 'custom-marker-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
        tooltipAnchor: [16, -20]
    });
};

// Component to update map view when filters change
const MapUpdater = ({ locations }) => {
    const map = useMap();
    useEffect(() => {
        if (locations.length > 0) {
            const bounds = L.latLngBounds(locations.map(l => l.coords));
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [locations, map]);
    return null;
};

const MemberManagement = () => {
    // Helper to get safe village name
    const getVillageName = (villageData) => {
        if (villageData === null || villageData === undefined) return '';
        if (typeof villageData === 'string') return villageData;
        if (typeof villageData === 'object') {
            if (villageData.name) {
                return typeof villageData.name === 'object' ? JSON.stringify(villageData.name) : String(villageData.name);
            }
            return '';
        }
        return String(villageData);
    };

    const getCoordinates = (inputString) => {
        if (!inputString) return [17.0500, 79.2667];
        let hash = 0;
        for (let i = 0; i < inputString.length; i++) hash = inputString.charCodeAt(i) + ((hash << 5) - hash);
        const latOffset = (hash % 1000) / 2500;
        const lngOffset = ((hash >> 5) % 1000) / 2500;
        return [17.0500 + latOffset, 79.2667 + lngOffset];
    };

    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('table'); // 'table', 'cards', 'map'

    // Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedVillage, setSelectedVillage] = useState('');
    const [selectedAgeRange, setSelectedAgeRange] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedGenders, setSelectedGenders] = useState({ All: true, Male: false, Female: false, Other: false });

    const [appliedFilters, setAppliedFilters] = useState({ village: '', ageRange: '', category: '', genders: { All: true, Male: false, Female: false, Other: false } });
    const [activeFilters, setActiveFilters] = useState([]);
    const [activeMenuId, setActiveMenuId] = useState(null);

    // Selection Logic
    const [selectedMemberIds, setSelectedMemberIds] = useState([]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (activeMenuId && !event.target.closest('.action-menu-container')) {
                setActiveMenuId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => { document.removeEventListener('mousedown', handleClickOutside); };
    }, [activeMenuId]);

    const toggleMenu = (id) => {
        if (activeMenuId === id) setActiveMenuId(null);
        else setActiveMenuId(id);
    };

    const fetchMembers = async () => {
        try {
            setLoading(true);
            const { data } = await API.get('/members');
            setMembers(data);
        } catch (error) {
            console.error("Failed to fetch members", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);

    // Filter Logic
    const filteredMembers = members.filter(member => {
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            const safeVillage = getVillageName(member.address?.village).toLowerCase();
            const text = `${member.name} ${member.surname} ${member.mobileNumber} ${safeVillage}`.toLowerCase();
            if (!text.includes(term)) return false;
        }
        if (appliedFilters.village && getVillageName(member.address?.village) !== appliedFilters.village) return false;
        if (appliedFilters.ageRange) {
            const age = parseInt(member.age) || 0;
            const [min, max] = appliedFilters.ageRange.split('-').map(Number);
            if (max && (age < min || age > max)) return false;
        }
        if (appliedFilters.category) {
            const job = (member.occupation || '').toLowerCase();
            if (!job.includes(appliedFilters.category.toLowerCase())) return false;
        }
        if (!appliedFilters.genders.All) {
            const gender = (member.gender || '').toLowerCase();
            if (appliedFilters.genders.Male && gender === 'male') return true;
            if (appliedFilters.genders.Female && gender === 'female') return true;
            if (appliedFilters.genders.Other && gender !== 'male' && gender !== 'female') return true;
            return false;
        }
        return true;
    });


    // Sorting Logic
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedMembers = React.useMemo(() => {
        let sortableItems = [...filteredMembers];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                let aValue, bValue;

                // Extract values based on key
                switch (sortConfig.key) {
                    case 'name':
                        aValue = `${a.name} ${a.surname}`.toLowerCase();
                        bValue = `${b.name} ${b.surname}`.toLowerCase();
                        break;
                    case 'village':
                        aValue = getVillageName(a.address?.village).toLowerCase();
                        bValue = getVillageName(b.address?.village).toLowerCase();
                        break;
                    case 'mobileNumber':
                        aValue = a.mobileNumber || '';
                        bValue = b.mobileNumber || '';
                        break;
                    case 'age':
                        aValue = Number(a.age) || 0;
                        bValue = Number(b.age) || 0;
                        break;
                    case 'gender':
                        aValue = (a.gender || '').toLowerCase();
                        bValue = (b.gender || '').toLowerCase();
                        break;
                    case 'occupation':
                        aValue = (a.occupation || '').toLowerCase();
                        bValue = (b.occupation || '').toLowerCase();
                        break;
                    case 'family':
                        aValue = a.familyDetails?.memberCount || 0;
                        bValue = b.familyDetails?.memberCount || 0;
                        break;
                    case 'createdAt':
                        aValue = new Date(a.createdAt).getTime();
                        bValue = new Date(b.createdAt).getTime();
                        break;
                    default:
                        return 0;
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [filteredMembers, sortConfig]);

    const pageCount = Math.ceil(sortedMembers.length / itemsPerPage);
    const displayedMembers = sortedMembers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allIds = displayedMembers.map(m => m._id);
            setSelectedMemberIds(allIds);
        } else {
            setSelectedMemberIds([]);
        }
    };

    const handleSelectMember = (id) => {
        setSelectedMemberIds(prev => {
            if (prev.includes(id)) {
                return prev.filter(mid => mid !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    const handleGenderChange = (type) => {
        if (type === 'All') {
            setSelectedGenders({ All: true, Male: false, Female: false, Other: false });
        } else {
            setSelectedGenders(prev => {
                const newState = { ...prev, [type]: !prev[type], All: false };
                if (!newState.Male && !newState.Female && !newState.Other) newState.All = true;
                return newState;
            });
        }
    };

    const applyFilters = () => {
        setAppliedFilters({ village: selectedVillage, ageRange: selectedAgeRange, category: selectedCategory, genders: { ...selectedGenders } });
        const newFilters = [];
        if (selectedAgeRange) newFilters.push(`Age: ${selectedAgeRange}`);
        if (selectedVillage) newFilters.push(`Village: ${selectedVillage}`);
        if (selectedCategory) newFilters.push(`Category: ${selectedCategory}`);
        setActiveFilters(newFilters);
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedVillage('');
        setSelectedAgeRange('');
        setSelectedCategory('');
        setSelectedGenders({ All: true, Male: false, Female: false, Other: false });
        setAppliedFilters({ village: '', ageRange: '', category: '', genders: { All: true, Male: false, Female: false, Other: false } });
        setActiveFilters([]);
        setCurrentPage(1);
    };

    const exportToExcel = () => {
        const data = filteredMembers.map(m => ({
            "ID": m.mewsId || m._id, "Name": `${m.name} ${m.surname}`, "Mobile": m.mobileNumber, "Village": getVillageName(m.address?.village), "Age": m.age, "Gender": m.gender, "Occupation": m.occupation
        }));
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Members");
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        saveAs(new Blob([excelBuffer], { type: 'application/octet-stream' }), 'members.xlsx');
    };

    const villages = [...new Set(members.map(m => getVillageName(m.address?.village)).filter(Boolean))];

    const getOccupationColor = (occupation) => {
        const job = (occupation || '').toLowerCase();
        if (job.includes('farmer')) return '#16a34a'; // Green
        if (job.includes('student')) return '#2563eb'; // Blue
        if (job.includes('business')) return '#4f46e5'; // Indigo
        return '#64748b'; // Slate/Grey
    };

    // Prepare locations for MapUpdater
    const mapLocations = filteredMembers.map((member, index) => ({
        id: member._id,
        coords: getCoordinates(getVillageName(member.address?.village) || `mem-${index}`)
    }));

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
            <style>{`
                .leaflet-popup-content-wrapper { border-radius: 12px; padding: 0; overflow: hidden; }
                .leaflet-popup-content { margin: 0; width: 280px !important; }
                .custom-tooltip {
                    background: transparent;
                    border: none;
                    box-shadow: none;
                    padding: 0;
                    margin: 0;
                }
                .label-bubble {
                    padding: 4px 10px;
                    border-radius: 6px;
                    color: white;
                    font-weight: bold;
                    font-size: 11px;
                    white-space: nowrap;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.2);
                    position: relative;
                }
                .label-bubble::after {
                    content: '';
                    position: absolute;
                    top: 100%;
                    left: 20px; 
                    margin-left: -5px;
                    border-width: 5px;
                    border-style: solid;
                    border-color: inherit; 
                    border-bottom-color: transparent !important;
                    border-right-color: transparent !important; 
                    border-left-color: transparent !important;
                }
            `}</style>
            <AdminHeader />
            <div className="flex flex-1 overflow-hidden">
                <AdminSidebar activePage="members" />
                <main className="flex-1 overflow-y-auto">
                    <DashboardHeader
                        title="Member Management"
                        subtitle={
                            <div>
                                <div className="text-blue-100 opacity-80 mb-2">View and manage all members in your directory.</div>
                                {/* View Toggle */}
                                <div className="flex items-center gap-2 mt-2 bg-white/10 p-1 rounded-lg w-fit backdrop-blur-sm border border-white/20">
                                    <span className="text-xs font-bold text-white px-2">View:</span>
                                    <button onClick={() => setViewMode('table')} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'table' ? 'bg-white text-blue-900 shadow-sm' : 'text-blue-100 hover:bg-white/10'}`}><FaTable /> Table</button>
                                    <button onClick={() => setViewMode('cards')} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'cards' ? 'bg-white text-blue-900 shadow-sm' : 'text-blue-100 hover:bg-white/10'}`}><FaThLarge /> Cards</button>
                                    <button onClick={() => setViewMode('map')} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'map' ? 'bg-white text-blue-900 shadow-sm' : 'text-blue-100 hover:bg-white/10'}`}><FaMapMarkedAlt /> Map</button>
                                </div>
                            </div>
                        }
                        breadcrumb="Dashboard > Members"
                    >
                        {/* Actions */}
                        <div className="flex items-center gap-3">
                            <Link to="/admin/members/new" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg transition transform hover:scale-105">
                                <FaPlus /> Register New Member
                            </Link>
                            <button onClick={exportToExcel} className="bg-white bg-opacity-10 hover:bg-opacity-20 backdrop-blur-md text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 border border-white/20 transition"><FaFileDownload /> Export Data</button>
                            <button className="bg-[#1e2a4a] text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-900/30 hover:bg-[#2a3b66] transition"><FaFileUpload /> Bulk Import</button>
                        </div>
                    </DashboardHeader>

                    <div className="px-4 md:px-8 -mt-10 pb-12 w-full">
                        {/* Search & Filter Card (Condensed) */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                            <h3 className="text-slate-800 font-bold mb-4">Search & Filter</h3>
                            <div className="mb-6">
                                <div className="relative"><FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" placeholder="Search by name, phone, village..." className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div><label className="block text-xs font-bold text-slate-600 mb-1.5">Villages</label><select className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-blue-500 text-slate-700" value={selectedVillage} onChange={(e) => setSelectedVillage(e.target.value)}><option value="">Select Village</option>{villages.map(v => <option key={v} value={v}>{v}</option>)}</select></div>
                                <div><label className="block text-xs font-bold text-slate-600 mb-1.5">Age Range</label><select className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-blue-500 text-slate-700" value={selectedAgeRange} onChange={(e) => setSelectedAgeRange(e.target.value)}><option value="">Select Range</option><option value="18-25">18 - 25</option><option value="26-40">26 - 40</option><option value="41-60">41 - 60</option><option value="60-150">60+</option></select></div>
                                <div><label className="block text-xs font-bold text-slate-600 mb-1.5">Occupation</label><select className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-blue-500 text-slate-700" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}><option value="">Select Occupation</option><option value="Farmer">Farmer</option><option value="Student">Student</option><option value="Business">Business</option><option value="Private Job">Private Job</option></select></div>
                            </div>
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="flex flex-col gap-2"><span className="text-xs font-bold text-slate-600">Gender</span><div className="flex items-center gap-4">{['All', 'Male', 'Female', 'Other'].map(type => (<label key={type} className="flex items-center gap-2 cursor-pointer select-none"><div className={`w-4 h-4 border rounded flex items-center justify-center transition-colors ${selectedGenders[type] ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'}`} onClick={() => handleGenderChange(type)}>{selectedGenders[type] && <FaCheckSquare size={10} />}</div><span className="text-sm text-slate-600">{type}</span></label>))}</div></div>
                                <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0"><button onClick={applyFilters} className="bg-[#1e2a4a] text-white px-5 py-2 rounded-lg text-xs font-bold hover:bg-[#2a3b66] transition shadow-sm">Apply Filters</button><button onClick={clearFilters} className="bg-white border border-slate-200 text-slate-600 px-5 py-2 rounded-lg text-xs font-bold hover:bg-slate-50 transition">Clear All</button></div>
                            </div>
                            {activeFilters.length > 0 && (<div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100"><span className="text-xs font-bold text-slate-400 self-center mr-1">Active filters:</span>{activeFilters.map((filter, i) => (<div key={i} className="bg-blue-50 border border-blue-100 text-blue-600 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-2">{filter}<button onClick={() => setActiveFilters(activeFilters.filter(f => f !== filter))} className="hover:text-blue-800">×</button></div>))}</div>)}
                        </div>

                        {/* Views Content */}
                        <div className="min-h-[400px]">
                            {loading ? (<div className="text-center p-12 text-slate-500">Loading members...</div>) : displayedMembers.length === 0 ? (<div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-500">No members found matching your filters.</div>) : (
                                <>
                                    {/* TABLE VIEW (Condensed) */}
                                    {viewMode === 'table' && (
                                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                                                <span className="text-xs font-bold text-slate-500">Showing {filteredMembers.length} results</span>
                                                <div className="flex items-center gap-2 text-xs text-slate-500">Sort by: <select className="bg-transparent font-bold focus:outline-none cursor-pointer"><option>Name</option><option>Date Joined</option></select></div>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left border-collapse">
                                                    <thead>
                                                        <tr className="bg-slate-50/50 border-b border-slate-100 text-sm font-bold text-slate-400 uppercase tracking-wider">
                                                            <th className="px-6 py-4 w-10">
                                                                <input
                                                                    type="checkbox"
                                                                    className="rounded border-slate-300 w-4 h-4 cursor-pointer"
                                                                    checked={displayedMembers.length > 0 && selectedMemberIds.length === displayedMembers.length}
                                                                    onChange={handleSelectAll}
                                                                />
                                                            </th>
                                                            <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition select-none" onClick={() => requestSort('name')}>
                                                                <div className="flex items-center gap-1">Name {sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort className="text-slate-300" />}</div>
                                                            </th>
                                                            <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition select-none" onClick={() => requestSort('village')}>
                                                                <div className="flex items-center gap-1">Village {sortConfig.key === 'village' ? (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort className="text-slate-300" />}</div>
                                                            </th>
                                                            <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition select-none" onClick={() => requestSort('mobileNumber')}>
                                                                <div className="flex items-center gap-1">Phone {sortConfig.key === 'mobileNumber' ? (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort className="text-slate-300" />}</div>
                                                            </th>
                                                            <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition select-none" onClick={() => requestSort('age')}>
                                                                <div className="flex items-center gap-1">Age {sortConfig.key === 'age' ? (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort className="text-slate-300" />}</div>
                                                            </th>
                                                            <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition select-none" onClick={() => requestSort('gender')}>
                                                                <div className="flex items-center gap-1">Gender {sortConfig.key === 'gender' ? (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort className="text-slate-300" />}</div>
                                                            </th>
                                                            <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition select-none" onClick={() => requestSort('occupation')}>
                                                                <div className="flex items-center gap-1">Occupation {sortConfig.key === 'occupation' ? (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort className="text-slate-300" />}</div>
                                                            </th>
                                                            <th className="px-6 py-4 text-center cursor-pointer hover:bg-slate-100 transition select-none" onClick={() => requestSort('family')}>
                                                                <div className="flex items-center justify-center gap-1">Family {sortConfig.key === 'family' ? (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort className="text-slate-300" />}</div>
                                                            </th>
                                                            <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition select-none" onClick={() => requestSort('createdAt')}>
                                                                <div className="flex items-center gap-1">Joined {sortConfig.key === 'createdAt' ? (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort className="text-slate-300" />}</div>
                                                            </th>
                                                            <th className="px-6 py-4 text-center">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-50">
                                                        {displayedMembers.map(member => (
                                                            <tr key={member._id} className={`transition-colors group ${selectedMemberIds.includes(member._id) ? 'bg-blue-50/50' : 'hover:bg-slate-50/80'}`}>
                                                                <td className="px-6 py-4">
                                                                    <input
                                                                        type="checkbox"
                                                                        className="rounded border-slate-200 w-4 h-4 cursor-pointer"
                                                                        checked={selectedMemberIds.includes(member._id)}
                                                                        onChange={() => handleSelectMember(member._id)}
                                                                    />
                                                                </td>
                                                                <td className="px-6 py-4"><div className="flex flex-col"><Link to={`/admin/members/${member._id}`} className="text-base font-bold text-slate-800 hover:text-blue-600 cursor-pointer">{member.name} {member.surname}</Link><div className="text-xs text-slate-400 font-mono">ID: {member.mewsId || member._id.substring(0, 6)}</div></div></td>
                                                                <td className="px-6 py-4 text-sm font-semibold text-blue-600">{getVillageName(member.address?.village) || 'N/A'}</td>
                                                                <td className="px-6 py-4 text-sm text-slate-600 font-mono">{member.mobileNumber}</td>
                                                                <td className="px-6 py-4 text-sm text-slate-600">{member.age}</td>
                                                                <td className="px-6 py-4 text-sm text-slate-600">{member.gender}</td>
                                                                <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide ${(member.occupation || '').toLowerCase().includes('farmer') ? 'bg-green-50 text-green-600' : (member.occupation || '').toLowerCase().includes('student') ? 'bg-blue-50 text-blue-600' : (member.occupation || '').toLowerCase().includes('business') ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}>{member.occupation || 'Member'}</span></td>
                                                                <td className="px-6 py-4 text-sm text-slate-600 text-center">{member.familyDetails?.memberCount || 0}</td>
                                                                <td className="px-6 py-4 text-sm text-slate-500">{new Date(member.createdAt).toLocaleDateString()}</td>
                                                                <td className="px-6 py-4 text-center relative action-menu-container">
                                                                    <button onClick={(e) => { e.stopPropagation(); toggleMenu(member._id); }} className="p-2 text-slate-400 hover:text-blue-600 transition rounded-full hover:bg-slate-100"><FaEllipsisV /></button>
                                                                    {activeMenuId === member._id && (
                                                                        <div className="absolute right-8 top-8 w-40 bg-white rounded-lg shadow-xl border border-slate-100 z-10 overflow-hidden animate-in fade-in zoom-in duration-200">
                                                                            <Link to={`/admin/members/${member._id}`} className="w-full text-left px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2 border-b border-slate-50 transition" onClick={() => setActiveMenuId(null)}><FaEye className="text-slate-400" /> View Profile</Link>
                                                                            <Link to={`/admin/members/edit/${member._id}`} className="w-full text-left px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-amber-600 flex items-center gap-2 border-b border-slate-50 transition" onClick={() => setActiveMenuId(null)}><FaEdit className="text-slate-400" /> Edit Profile</Link>
                                                                            <Link to={`/admin/members/generate-id`} state={{ newMember: member }} className="w-full text-left px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2 border-b border-slate-50 transition" onClick={() => setActiveMenuId(null)}><FaIdCard className="text-slate-400" /> Generate ID</Link>
                                                                            {member.mobileNumber && (<a href={`tel:${member.mobileNumber}`} className="w-full text-left px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-green-600 flex items-center gap-2 border-b border-slate-50 transition" onClick={() => setActiveMenuId(null)}><FaPhoneAlt className="text-slate-400" /> Call Member</a>)}
                                                                            <button onClick={() => {
                                                                                if (window.confirm('Are you sure you want to delete this member? This action cannot be undone.')) {
                                                                                    API.delete(`/members/${member._id}`)
                                                                                        .then(() => {
                                                                                            alert('Member deleted successfully');
                                                                                            fetchMembers();
                                                                                        })
                                                                                        .catch(err => {
                                                                                            console.error(err);
                                                                                            alert('Failed to delete member');
                                                                                        });
                                                                                }
                                                                                setActiveMenuId(null);
                                                                            }} className="w-full text-left px-4 py-3 text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-2 transition"><FaTrash className="text-red-400" /> Delete Member</button>
                                                                        </div>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {/* CARDS VIEW (Condensed) */}
                                    {viewMode === 'cards' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                            {displayedMembers.map(member => (
                                                <div key={member._id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition relative group">
                                                    <div className="absolute top-4 right-4"><span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${(member.occupation || '').toLowerCase().includes('farmer') ? 'bg-green-50 text-green-600' : (member.occupation || '').toLowerCase().includes('student') ? 'bg-blue-50 text-blue-600' : (member.occupation || '').toLowerCase().includes('business') ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}>{member.occupation || 'Member'}</span></div>
                                                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-2xl font-bold text-slate-400 mb-4 border-2 border-white shadow-lg mx-auto overflow-hidden">
                                                        {(member.photoUrl || member.profileImage) ? (
                                                            <img
                                                                src={(member.photoUrl || member.profileImage).startsWith('http')
                                                                    ? (member.photoUrl || member.profileImage)
                                                                    : `${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000'}/${(member.photoUrl || member.profileImage).replace(/\\/g, '/')}`}
                                                                alt={member.name}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                                                            />
                                                        ) : (
                                                            <span>{(member.name || '').charAt(0)}</span>
                                                        )}
                                                    </div>
                                                    <div className="text-center mb-6"> <h3 className="font-bold text-slate-800 text-lg mb-1">{member.name} {member.surname}</h3> <p className="text-xs text-blue-500 font-bold mb-2">{getVillageName(member.address?.village)}</p> <p className="text-xs text-slate-400 font-mono">{member.mobileNumber}</p> </div>
                                                    <div className="grid grid-cols-2 gap-2 mb-6 text-center"> <div className="bg-slate-50 rounded-lg py-2"> <div className="text-[10px] text-slate-400 font-bold uppercase">Age</div> <div className="font-bold text-slate-700">{member.age}</div> </div> <div className="bg-slate-50 rounded-lg py-2"> <div className="text-[10px] text-slate-400 font-bold uppercase">Gender</div> <div className="font-bold text-slate-700">{member.gender?.charAt(0)}</div> </div> </div>
                                                    <div className="flex gap-2"> <Link to={`/admin/members/${member._id}`} className="flex-1 bg-[#1e2a4a] text-white py-2 rounded-lg text-xs font-bold hover:bg-[#2a3b66] transition flex items-center justify-center gap-2 shadow-sm"><FaEye /> View</Link> <Link to={`/admin/members/edit/${member._id}`} className="bg-slate-50 hover:bg-amber-50 hover:text-amber-600 text-slate-400 py-2 px-3 rounded-lg text-xs font-bold transition border border-slate-200 hover:border-amber-200"><FaEdit size={14} /></Link> </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* MAP VIEW WITH CUSTOM MARKERS */}
                                    {viewMode === 'map' && (
                                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-[600px] overflow-hidden relative">
                                            <MapContainer center={[17.0500, 79.2667]} zoom={10} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
                                                <TileLayer
                                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                />
                                                <MapUpdater locations={mapLocations} />
                                                {filteredMembers.map((member, index) => {
                                                    const coords = getCoordinates(getVillageName(member.address?.village) || `mem-${index}`);
                                                    const markerColor = getOccupationColor(member.occupation);

                                                    return (
                                                        <Marker key={member._id} position={coords} icon={createCustomIcon(markerColor)}>
                                                            <Tooltip direction="top" offset={[0, -28]} opacity={1} permanent className="custom-tooltip">
                                                                <div className="label-bubble" style={{ backgroundColor: markerColor, borderColor: markerColor }}>
                                                                    {member.name} {member.surname}
                                                                </div>
                                                            </Tooltip>
                                                        </Marker>
                                                    );
                                                })}
                                            </MapContainer>
                                        </div>
                                    )}

                                    {/* Pagination (Common) */}
                                    {viewMode !== 'map' && (
                                        <div className="p-4 flex items-center justify-between mt-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-slate-500">Show</span>
                                                <select
                                                    value={itemsPerPage}
                                                    onChange={(e) => {
                                                        setItemsPerPage(Number(e.target.value));
                                                        setCurrentPage(1);
                                                    }}
                                                    className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-bold text-slate-600 focus:outline-none"
                                                >
                                                    <option value={10}>10</option>
                                                    <option value={20}>20</option>
                                                    <option value={50}>50</option>
                                                    <option value={100}>100</option>
                                                </select>
                                                <span className="text-xs text-slate-500">per page</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-white disabled:opacity-50 text-sm bg-white shadow-sm transition"><FaChevronLeft /></button>
                                                <div className="text-xs font-bold text-slate-500 px-2">Page {currentPage} of {pageCount || 1}</div>
                                                <button onClick={() => setCurrentPage(p => Math.min(pageCount, p + 1))} disabled={currentPage === pageCount} className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-white disabled:opacity-50 text-sm bg-white shadow-sm transition"><FaChevronRight /></button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </main >
            </div >
        </div >
    );
};

export default MemberManagement;
