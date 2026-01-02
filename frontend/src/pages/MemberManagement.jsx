import React, { useState, useEffect } from 'react';
import API from '../api';
import { Link, useLocation } from 'react-router-dom';
import { renderToStaticMarkup } from 'react-dom/server';
import {
    FaChevronLeft, FaChevronRight, FaEllipsisV, FaCheckSquare, FaTrash, FaIdCard,
    FaThLarge, FaTable, FaMapMarkedAlt, FaUser, FaUserTie, FaMapMarkerAlt, FaPlus,
    FaSort, FaSortUp, FaSortDown,
    FaSearch, FaEye, FaEdit, FaPhoneAlt, FaFileDownload
} from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import DashboardHeader from '../components/common/DashboardHeader';
// Map Imports
import { MapContainer, TileLayer, Marker, Tooltip, useMap, CircleMarker, Popup } from 'react-leaflet';
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
    // Helper to get safe location name (village, mandal, district)
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

    // Predefined Coordinates for Nalgonda villages
    const VILLAGE_COORDINATES = {
        'Nalgonda': [17.0500, 79.2667],
        'Adavdevulapally': [17.0908, 79.4161],
        'Addagudur': [17.3975, 79.3761],
        'Adloor': [16.6815, 79.9818],
        'Agamothkur': [17.0433, 79.5034],
        'Aipur': [17.2529, 79.3561],
        'Aitipamula': [17.1698, 79.3585],
        'Akaram': [17.3157, 79.3799],
        'Akkinepally': [17.0908, 79.4161],
        'Akupamula': [17.0092, 79.9015],
        'Nakrekal': [17.1666, 79.4299],
        'Miryalaguda': [16.8741, 79.5694],
        'Suryapet': [17.1415, 79.6236],
        'Devarakonda': [16.5938, 78.9328],
        'Munugode': [17.0667, 79.0833],
        'Chityal': [17.2244, 79.1378],
        'Kattangur': [17.1833, 79.3667],
        'Amangal': [16.8494, 78.5303],
        'Amanagal': [16.8494, 78.5303] // Handle typo/variation
    };

    const [fetchedCoordinates, setFetchedCoordinates] = useState(() => {
        const saved = localStorage.getItem('village_geo_cache');
        return saved ? JSON.parse(saved) : {};
    });

    // Save cache whenever it changes
    useEffect(() => {
        localStorage.setItem('village_geo_cache', JSON.stringify(fetchedCoordinates));
    }, [fetchedCoordinates]);

    const getCoordinates = (inputString, seed = '') => {
        if (!inputString) return [17.0500, 79.2667];

        let baseCoords = [17.0500, 79.2667];

        // 1. Check Predefined
        const villageKey = Object.keys(VILLAGE_COORDINATES).find(key =>
            inputString.toLowerCase().includes(key.toLowerCase())
        );

        // 2. Check Fetched Cache
        const fetchedKey = Object.keys(fetchedCoordinates).find(key =>
            inputString.toLowerCase() === key.toLowerCase()
        );

        if (villageKey) {
            baseCoords = VILLAGE_COORDINATES[villageKey];
        } else if (fetchedKey) {
            baseCoords = fetchedCoordinates[fetchedKey];
        } else {
            // Fallback: Hash
            let hash = 0;
            for (let i = 0; i < inputString.length; i++) hash = inputString.charCodeAt(i) + ((hash << 5) - hash);
            const latBase = (hash % 1000) / 2500;
            const lngBase = ((hash >> 5) % 1000) / 2500;
            baseCoords = [17.0500 + latBase, 79.2667 + lngBase];
        }

        // Jitter
        let seedHash = 0;
        const combinedSeed = seed || 'default';
        for (let i = 0; i < combinedSeed.length; i++) seedHash = combinedSeed.charCodeAt(i) + ((seedHash << 5) - seedHash);
        const latJitter = (seedHash % 100) / 50000;
        const lngJitter = ((seedHash >> 5) % 100) / 50000;

        return [baseCoords[0] + latJitter, baseCoords[1] + lngJitter];
    };

    const fetchVillageCoordinates = async (villageName) => {
        if (!villageName || VILLAGE_COORDINATES[villageName] || fetchedCoordinates[villageName]) return;

        try {
            // Debounce/Limit could be handled here, but for now simple fetch
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(villageName + ', Telangana, India')}`);
            const data = await response.json();
            if (data && data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lon = parseFloat(data[0].lon);
                setFetchedCoordinates(prev => ({
                    ...prev,
                    [villageName]: [lat, lon]
                }));
            }
        } catch (error) {
            console.error("Geocoding error:", error);
        }
    };

    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState(localStorage.getItem('memberViewMode') || 'table'); // 'table', 'cards', 'map'



    // Persist View Mode
    useEffect(() => {
        localStorage.setItem('memberViewMode', viewMode);
    }, [viewMode]);

    // Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedVillage, setSelectedVillage] = useState('');
    const [selectedAgeRange, setSelectedAgeRange] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedGenders, setSelectedGenders] = useState({ All: true, Male: false, Female: false, Other: false });
    const [selectedMaritalStatus, setSelectedMaritalStatus] = useState('');
    const [selectedBloodGroup, setSelectedBloodGroup] = useState('');
    const [selectedSubCaste, setSelectedSubCaste] = useState('');

    const location = useLocation();

    // Initialize filters from URL
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const gender = params.get('gender');
        const marital = params.get('maritalStatus');
        const blood = params.get('bloodGroup');
        const subCaste = params.get('subCaste');
        const ageRange = params.get('ageRange');
        const occupation = params.get('occupation');

        if (gender) {
            setSelectedGenders({
                All: false,
                Male: gender === 'Male',
                Female: gender === 'Female',
                Other: gender === 'Other'
            });
        }
        if (marital) setSelectedMaritalStatus(marital);
        if (blood) setSelectedBloodGroup(blood);
        if (subCaste) setSelectedSubCaste(subCaste);
        if (ageRange) setSelectedAgeRange(ageRange);
        if (occupation) setSelectedCategory(occupation);

    }, [location.search]);

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
            const safeVillage = getLocationName(member.address?.village).toLowerCase();
            const text = `${member.name} ${member.surname} ${member.mobileNumber} ${safeVillage}`.toLowerCase();
            if (!text.includes(term)) return false;
        }
        if (selectedVillage && getLocationName(member.address?.village) !== selectedVillage) return false;
        if (selectedAgeRange) {
            const age = parseInt(member.age) || 0;
            const [min, max] = selectedAgeRange.split('-').map(Number);
            if (max && (age < min || age > max)) return false;
        }
        if (selectedCategory) {
            const job = (member.occupation || '').toLowerCase();
            if (!job.includes(selectedCategory.toLowerCase())) return false;
        }
        if (!selectedGenders.All) {
            const gender = (member.gender || '').toLowerCase();
            if (selectedGenders.Male && gender === 'male') return true;
            if (selectedGenders.Female && gender === 'female') return true;
            if (selectedGenders.Other && gender !== 'male' && gender !== 'female') return true;
            return false;
        }
        if (selectedMaritalStatus) {
            if ((member.maritalStatus || 'Unmarried').toLowerCase() !== selectedMaritalStatus.toLowerCase()) return false;
        }
        if (selectedBloodGroup) {
            const memberBlood = (member.bloodGroup || 'Unknown').toLowerCase();
            if (memberBlood !== selectedBloodGroup.toLowerCase()) return false;
        }
        if (selectedSubCaste) {
            const sub = (member.casteDetails?.subCaste || '').toLowerCase();
            const caste = (member.casteDetails?.caste || '').toLowerCase();
            // Check both or specific? Usually subcaste chart passes subcaste name.
            if (!sub.includes(selectedSubCaste.toLowerCase()) && !caste.includes(selectedSubCaste.toLowerCase())) return false;
        }
        return true;
    });



    // Trigger geocoding when switching to map view or filtering
    useEffect(() => {
        if (viewMode === 'map' && members.length > 0) {
            const uniqueVillages = [...new Set(filteredMembers.map(m => getLocationName(m.address?.village)).filter(Boolean))];
            uniqueVillages.forEach((village, index) => {
                // Stagger requests slightly to be polite to the API
                setTimeout(() => {
                    fetchVillageCoordinates(village);
                }, index * 1200); // 1.2 second delay between requests
            });
        }
    }, [viewMode, members, searchTerm, selectedVillage, selectedAgeRange, selectedCategory, selectedGenders]);

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
                        aValue = getLocationName(a.address?.village).toLowerCase();
                        bValue = getLocationName(b.address?.village).toLowerCase();
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

    useEffect(() => {
        const newFilters = [];
        if (selectedAgeRange) newFilters.push(`Age: ${selectedAgeRange}`);
        if (selectedVillage) newFilters.push(`Village: ${selectedVillage}`);
        if (selectedCategory) newFilters.push(`Category: ${selectedCategory}`);
        if (selectedBloodGroup) newFilters.push(`Blood: ${selectedBloodGroup}`);
        setActiveFilters(newFilters);
        setCurrentPage(1);
    }, [selectedVillage, selectedAgeRange, selectedCategory, selectedGenders, selectedBloodGroup]);

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedVillage('');
        setSelectedAgeRange('');
        setSelectedCategory('');
        setSelectedBloodGroup('');
        setSelectedGenders({ All: true, Male: false, Female: false, Other: false });
        setActiveFilters([]);
        setCurrentPage(1);
    };


    const exportToExcel = () => {
        const data = filteredMembers.map(m => ({
            "ID": m.mewsId || m._id, "Name": `${m.name} ${m.surname}`, "Mobile": m.mobileNumber, "Village": getLocationName(m.address?.village), "Age": m.age, "Gender": m.gender, "Occupation": m.occupation
        }));
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Members");
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        saveAs(new Blob([excelBuffer], { type: 'application/octet-stream' }), 'members.xlsx');
    };

    const villages = [...new Set(members.map(m => getLocationName(m.address?.village)).filter(Boolean))];

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
        coords: getCoordinates(getLocationName(member.address?.village) || `mem-${index}`, member._id)
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
                        subtitle={null}
                        breadcrumb="Dashboard > Members"
                    >
                        <div className="flex flex-col items-end gap-3">
                            {/* View Toggle */}
                            <div className="flex items-center gap-2 bg-white/10 p-1 rounded-lg w-fit backdrop-blur-sm border border-white/20">
                                <span className="text-xs font-bold text-white px-2">View:</span>
                                <button onClick={() => setViewMode('table')} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'table' ? 'bg-white text-blue-900 shadow-sm' : 'text-blue-100 hover:bg-white/10'}`}><FaTable /> Table</button>
                                <button onClick={() => setViewMode('cards')} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'cards' ? 'bg-white text-blue-900 shadow-sm' : 'text-blue-100 hover:bg-white/10'}`}><FaThLarge /> Cards</button>
                                <button onClick={() => setViewMode('map')} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'map' ? 'bg-white text-blue-900 shadow-sm' : 'text-blue-100 hover:bg-white/10'}`}><FaMapMarkedAlt /> Map</button>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3">
                                <Link to="/admin/members/new" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg transition transform hover:scale-105">
                                    <FaPlus /> Add Member
                                </Link>
                                <button onClick={exportToExcel} className="bg-white bg-opacity-10 hover:bg-opacity-20 backdrop-blur-md text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 border border-white/20 transition"><FaFileDownload /> Export Data</button>
                            </div>
                        </div>
                    </DashboardHeader>

                    <div className="px-4 md:px-8 -mt-10 pb-12 w-full">
                        {/* Search & Filter Card (Condensed) */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                            <div className="flex justify-start items-center gap-4 mb-4">
                                <h3 className="text-slate-800 font-bold">Search & Filter</h3>
                                <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-sm font-bold shadow-sm border border-blue-100">
                                    Total: {filteredMembers.length} Members
                                </div>
                            </div>
                            <div className="mb-6">
                                <div className="relative"><FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" placeholder="Search by name, phone, village..." className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                <div><label className="block text-xs font-bold text-slate-600 mb-1.5">Villages</label><select className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-blue-500 text-slate-700" value={selectedVillage} onChange={(e) => setSelectedVillage(e.target.value)}><option value="">Select Village</option>{villages.map(v => <option key={v} value={v}>{v}</option>)}</select></div>
                                <div><label className="block text-xs font-bold text-slate-600 mb-1.5">Age Range</label><select className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-blue-500 text-slate-700" value={selectedAgeRange} onChange={(e) => setSelectedAgeRange(e.target.value)}><option value="">Select Range</option><option value="18-25">18 - 25</option><option value="26-40">26 - 40</option><option value="41-60">41 - 60</option><option value="60-150">60+</option></select></div>
                                <div><label className="block text-xs font-bold text-slate-600 mb-1.5">Occupation</label><select className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-blue-500 text-slate-700" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}><option value="">Select Occupation</option><option value="Farmer">Farmer</option><option value="Student">Student</option><option value="Business">Business</option><option value="Private Job">Private Job</option></select></div>
                                <div><label className="block text-xs font-bold text-slate-600 mb-1.5">Blood Group</label><select className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-blue-500 text-slate-700" value={selectedBloodGroup} onChange={(e) => setSelectedBloodGroup(e.target.value)}><option value="">Select Group</option><option value="A+">A+</option><option value="A-">A-</option><option value="B+">B+</option><option value="B-">B-</option><option value="AB+">AB+</option><option value="AB-">AB-</option><option value="O+">O+</option><option value="O-">O-</option></select></div>
                            </div>
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="flex flex-col gap-2"><span className="text-xs font-bold text-slate-600">Gender</span><div className="flex items-center gap-4">{['All', 'Male', 'Female', 'Other'].map(type => (<label key={type} className="flex items-center gap-2 cursor-pointer select-none"><div className={`w-4 h-4 border rounded flex items-center justify-center transition-colors ${selectedGenders[type] ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'}`} onClick={() => handleGenderChange(type)}>{selectedGenders[type] && <FaCheckSquare size={10} />}</div><span className="text-sm text-slate-600">{type}</span></label>))}</div></div>
                                <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0"><button onClick={clearFilters} className="bg-white border border-slate-200 text-slate-600 px-5 py-2 rounded-lg text-xs font-bold hover:bg-slate-50 transition">Clear All</button></div>
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
                                            <div className="overflow-auto max-h-[calc(100vh-320px)] border-t border-slate-100">
                                                <table className="w-full text-left border-collapse relative">
                                                    <thead className="sticky top-0 z-20 shadow-sm">
                                                        <tr className="bg-slate-50 border-b border-slate-200 text-sm font-bold text-slate-400 uppercase tracking-wider">
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
                                                                <td className="px-6 py-4 text-sm font-semibold text-blue-600">{getLocationName(member.address?.village) || 'N/A'}</td>
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
                                        <div className="overflow-auto max-h-[calc(100vh-320px)] p-1">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                                {displayedMembers.map(member => (
                                                    <div key={member._id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 hover:shadow-md transition relative group">
                                                        <div className="absolute top-3 right-3"><span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide ${(member.occupation || '').toLowerCase().includes('farmer') ? 'bg-green-50 text-green-600' : (member.occupation || '').toLowerCase().includes('student') ? 'bg-blue-50 text-blue-600' : (member.occupation || '').toLowerCase().includes('business') ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}>{member.occupation || 'Member'}</span></div>
                                                        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-400 mb-3 border-2 border-white shadow-md mx-auto overflow-hidden mt-2">
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
                                                        <div className="text-center mb-4">
                                                            <h3 className="font-bold text-slate-800 text-sm mb-0.5 truncate px-1" title={`${member.name} ${member.surname}`}>
                                                                <Link to={`/admin/members/${member._id}`} className="hover:text-blue-600 hover:underline">{member.name} {member.surname}</Link>
                                                            </h3>
                                                            <p className="text-[10px] text-blue-500 font-bold mb-1 truncate px-2" title={`${getLocationName(member.address?.village)} (V), ${getLocationName(member.address?.mandal) || ''} (M), ${getLocationName(member.address?.district) || ''} (D)`}>
                                                                {getLocationName(member.address?.village)} (V)
                                                                {member.address?.mandal && `, ${getLocationName(member.address.mandal)} (M)`}
                                                                {member.address?.district && `, ${getLocationName(member.address.district)} (D)`}
                                                            </p>
                                                            <p className="text-[10px] text-slate-400 font-mono flex items-center justify-center gap-1">
                                                                <FaPhoneAlt size={9} /> <a href={`tel:${member.mobileNumber}`} className="hover:text-blue-600 hover:underline">{member.mobileNumber}</a>
                                                            </p>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2 mb-4 text-center"> <div className="bg-slate-50 rounded py-1.5"> <div className="text-[9px] text-slate-400 font-bold uppercase">Age</div> <div className="font-bold text-xs text-slate-700">{member.age}</div> </div> <div className="bg-slate-50 rounded py-1.5"> <div className="text-[9px] text-slate-400 font-bold uppercase">Gender</div> <div className="font-bold text-xs text-slate-700">{member.gender?.charAt(0)}</div> </div> </div>
                                                        <div className="flex gap-2"> <Link to={`/admin/members/${member._id}`} className="flex-1 bg-[#1e2a4a] text-white py-2 rounded-lg text-xs font-bold hover:bg-[#2a3b66] transition flex items-center justify-center gap-2 shadow-sm"><FaEye /> View</Link> <Link to={`/admin/members/edit/${member._id}`} className="bg-slate-50 hover:bg-amber-50 hover:text-amber-600 text-slate-400 py-2 px-3 rounded-lg text-xs font-bold transition border border-slate-200 hover:border-amber-200"><FaEdit size={14} /></Link> </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* MAP VIEW WITH CUSTOM MARKERS */}
                                    {/* MAP VIEW WITH SIDEBAR */}
                                    {viewMode === 'map' && (
                                        <div className="flex flex-col lg:flex-row gap-6">
                                            {/* Map Container */}
                                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 w-full lg:w-9/12 aspect-square lg:aspect-auto lg:h-[600px] overflow-hidden relative">
                                                <MapContainer center={[17.0500, 79.2667]} zoom={10} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
                                                    <TileLayer
                                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                    />
                                                    <MapUpdater locations={mapLocations} />
                                                    {filteredMembers.map((member, index) => {
                                                        const coords = getCoordinates(getLocationName(member.address?.village) || `mem-${index}`, member._id);
                                                        const markerColor = getOccupationColor(member.occupation);

                                                        return (
                                                            <Marker key={member._id} position={coords} icon={createCustomIcon(markerColor)}>
                                                                <Popup>
                                                                    <div className="text-center p-2">
                                                                        <div className="font-bold text-slate-800">{member.name} {member.surname}</div>
                                                                        <div className="text-xs text-blue-500 font-bold mb-1">{getLocationName(member.address?.village)}</div>
                                                                        <div className="text-xs text-slate-500">{member.mobileNumber}</div>
                                                                        <Link to={`/admin/members/${member._id}`} className="block mt-2 bg-blue-600 !text-white py-2 px-3 rounded-lg text-xs font-bold hover:bg-blue-700 text-center shadow-md no-underline">View Profile</Link>
                                                                    </div>
                                                                </Popup>
                                                                <Tooltip direction="top" offset={[0, -28]} opacity={1} className="custom-tooltip">
                                                                    <div className="label-bubble" style={{ backgroundColor: markerColor, borderColor: markerColor }}>
                                                                        <span className="block">{member.name}</span>
                                                                        <span className="block text-[9px] opacity-80">{getLocationName(member.address?.village)}</span>
                                                                    </div>
                                                                </Tooltip>
                                                            </Marker>
                                                        );
                                                    })}
                                                </MapContainer>
                                            </div>

                                            {/* Map Sidebar */}
                                            <div className="w-full lg:w-3/12 flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-1">
                                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                                                    <h3 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">Location Insights</h3>
                                                    <div className="space-y-3">
                                                        {/* Village Stats */}
                                                        <div>
                                                            <div className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Members by Village</div>
                                                            <div className="space-y-1.5 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                                                                {Object.entries(filteredMembers.reduce((acc, curr) => {
                                                                    const v = getLocationName(curr.address?.village) || 'Unknown';
                                                                    acc[v] = (acc[v] || 0) + 1;
                                                                    return acc;
                                                                }, {})).sort((a, b) => b[1] - a[1]).map(([village, count]) => (
                                                                    <div key={village} className="flex justify-between items-center text-xs">
                                                                        <span className="text-slate-700 font-medium truncate w-3/4" title={village}>{village}</span>
                                                                        <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold text-[10px]">{count}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                                                    <h3 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">Occupation Summary</h3>
                                                    <div className="space-y-2">
                                                        {Object.entries(filteredMembers.reduce((acc, curr) => {
                                                            const occ = curr.occupation || 'Unspecified';
                                                            acc[occ] = (acc[occ] || 0) + 1;
                                                            return acc;
                                                        }, {})).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([occ, count]) => (
                                                            <div key={occ} className="flex items-center gap-2">
                                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getOccupationColor(occ) }}></div>
                                                                <div className="flex-1 flex justify-between items-center text-xs">
                                                                    <span className="text-slate-600 truncate">{occ}</span>
                                                                    <span className="font-bold text-slate-800">{count}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
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
