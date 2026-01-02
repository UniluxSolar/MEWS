import React, { useState, useEffect } from 'react';
import API from '../api';
import { Link } from 'react-router-dom';
import {
    FaSearch, FaFilter, FaEye, FaEdit, FaPhoneAlt, FaFileDownload, FaPlus,
    FaSchool, FaHospital, FaClinicMedical, FaUniversity,
    FaCheckCircle, FaClock, FaChevronLeft, FaChevronRight, FaMapMarkerAlt, FaEllipsisV, FaTrash,
    FaThLarge, FaTable, FaMapMarkedAlt, FaExclamationTriangle
} from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import DashboardHeader from '../components/common/DashboardHeader';
// Map Imports
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const InstitutionManagement = () => {
    const [institutions, setInstitutions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('table'); // 'table', 'cards', 'map'

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [activeFilters, setActiveFilters] = useState([]);

    // Action Menu State
    const [activeMenuId, setActiveMenuId] = useState(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (activeMenuId && !event.target.closest('.action-menu-container')) {
                setActiveMenuId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [activeMenuId]);

    const toggleMenu = (id) => {
        if (activeMenuId === id) {
            setActiveMenuId(null);
        } else {
            setActiveMenuId(id);
        }
    };

    const fetchInstitutions = async () => {
        try {
            setLoading(true);
            const { data } = await API.get('/institutions');
            setInstitutions(data);
        } catch (error) {
            console.error("Failed to fetch institutions", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInstitutions();
    }, []);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = viewMode === 'cards' ? 12 : 10;

    // Filter Logic
    const filteredInstitutions = institutions.filter(inst => {
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            const text = `${inst.name} ${inst.fullAddress} ${inst.mobileNumber}`.toLowerCase();
            if (!text.includes(term)) return false;
        }

        if (selectedType && inst.type !== selectedType) return false;

        if (selectedStatus) {
            const status = inst.verificationStatus || 'PENDING';
            if (selectedStatus === 'Active' && status !== 'APPROVED') return false;
            if (selectedStatus === 'Pending' && status !== 'PENDING') return false;
            if (selectedStatus === 'Inactive' && status !== 'REJECTED') return false;
        }

        return true;
    });

    const pageCount = Math.ceil(filteredInstitutions.length / itemsPerPage);
    const displayedInstitutions = filteredInstitutions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    useEffect(() => {
        const newFilters = [];
        if (selectedType) newFilters.push(`Type: ${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}`);
        if (selectedStatus) newFilters.push(`Status: ${selectedStatus}`);
        setActiveFilters(newFilters);
        setCurrentPage(1);
    }, [selectedType, selectedStatus]);

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedType('');
        setSelectedStatus('');
        setActiveFilters([]);
        setCurrentPage(1);
    };

    // Helper to remove a single filter tag
    const removeFilter = (filterString) => {
        const [key, value] = filterString.split(': ');
        if (key === 'Type') setSelectedType('');
        if (key === 'Status') setSelectedStatus('');
        setActiveFilters(prev => prev.filter(f => f !== filterString));
    };

    const exportToExcel = () => {
        const data = filteredInstitutions.map(i => ({
            "Name": i.name,
            "Type": i.type,
            "Mobile": i.mobileNumber,
            "Address": i.fullAddress,
            "Status": i.verificationStatus
        }));
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Institutions");
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        saveAs(new Blob([excelBuffer], { type: 'application/octet-stream' }), 'institutions.xlsx');
    };

    // Icons
    const getIcon = (type) => {
        switch (type) {
            case 'hospital': return FaHospital;
            case 'school': return FaSchool;
            case 'college': return FaUniversity;
            case 'pharmacy': return FaClinicMedical;
            default: return FaSchool;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'APPROVED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'PENDING': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'REJECTED': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    // Helper for Map Coordinates (Simulated based on string hash)
    const getCoordinates = (inputString) => {
        if (!inputString) return [17.0500, 79.2667]; // Default Nalgonda Center

        let hash = 0;
        for (let i = 0; i < inputString.length; i++) {
            hash = inputString.charCodeAt(i) + ((hash << 5) - hash);
        }

        // Base center: Nalgonda (17.0500, 79.2667)
        // Spread: +/- 0.15 degrees
        const latOffset = (hash % 1000) / 3000; // -0.15 to +0.15 approx
        const lngOffset = ((hash >> 5) % 1000) / 3000;

        return [17.0500 + latOffset, 79.2667 + lngOffset];
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
            <AdminHeader />
            <div className="flex flex-1 overflow-hidden">
                <AdminSidebar activePage="institutions" />
                <main className="flex-1 overflow-y-auto">
                    <DashboardHeader
                        title="Institutions Management"
                        subtitle={
                            <div>
                                <div className="text-blue-100">Dashboard &gt; Institutions</div>
                                {/* View Toggle */}
                                <div className="flex items-center gap-2 mt-4 bg-white/10 p-1 rounded-lg w-fit backdrop-blur-sm border border-white/20">
                                    <span className="text-xs font-bold text-white px-2">View:</span>
                                    <button
                                        onClick={() => setViewMode('table')}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'table' ? 'bg-white text-blue-900 shadow-sm' : 'text-blue-100 hover:bg-white/10'}`}
                                    >
                                        <FaTable /> Table
                                    </button>
                                    <button
                                        onClick={() => setViewMode('cards')}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'cards' ? 'bg-white text-blue-900 shadow-sm' : 'text-blue-100 hover:bg-white/10'}`}
                                    >
                                        <FaThLarge /> Cards
                                    </button>
                                    <button
                                        onClick={() => setViewMode('map')}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'map' ? 'bg-white text-blue-900 shadow-sm' : 'text-blue-100 hover:bg-white/10'}`}
                                    >
                                        <FaMapMarkedAlt /> Map
                                    </button>
                                </div>
                            </div>
                        }
                        breadcrumb="Dashboard > Institutions"
                    >
                        <div className="flex items-center gap-3">

                            <button onClick={exportToExcel} className="bg-white bg-opacity-10 hover:bg-opacity-20 backdrop-blur-md text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 border border-white/20 transition">
                                <FaFileDownload /> Export Data
                            </button>
                            <Link to="/admin/institutions/new" className="bg-[#e85d04] hover:bg-[#d05304] text-white px-5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg shadow-orange-900/20 transition">
                                <FaPlus /> Add Institution
                            </Link>
                        </div>
                    </DashboardHeader>

                    <div className="px-4 md:px-8 -mt-10 pb-12 w-full">

                        {/* Search & Filter Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                            <div className="flex justify-start items-center gap-4 mb-4">
                                <h3 className="text-slate-800 font-bold">Search & Filter</h3>
                                <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-sm font-bold shadow-sm border border-blue-100">
                                    Total: {filteredInstitutions.length} Institutions
                                </div>
                            </div>

                            <div className="mb-6">
                                <div className="relative">
                                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by name, type, location..."
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 transition"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-4 items-end">
                                <div className="flex-1 w-full md:w-auto grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 mb-1.5">Institution Type</label>
                                        <select
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-blue-500 text-slate-700"
                                            value={selectedType}
                                            onChange={(e) => setSelectedType(e.target.value)}
                                        >
                                            <option value="">All Types</option>
                                            <option value="school">School</option>
                                            <option value="college">College</option>
                                            <option value="hospital">Hospital</option>
                                            <option value="pharmacy">Pharmacy</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 mb-1.5">Status</label>
                                        <select
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-blue-500 text-slate-700"
                                            value={selectedStatus}
                                            onChange={(e) => setSelectedStatus(e.target.value)}
                                        >
                                            <option value="">All Statuses</option>
                                            <option value="Active">Active</option>
                                            <option value="Pending">Pending</option>
                                            <option value="Inactive">Inactive</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    <button onClick={clearFilters} className="bg-white border border-slate-200 text-slate-600 px-5 py-2.5 rounded-lg text-xs font-bold hover:bg-slate-50 transition">
                                        Clear
                                    </button>
                                </div>
                            </div>

                            {activeFilters.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
                                    <span className="text-xs font-bold text-slate-400 self-center mr-1">Active filters:</span>
                                    {activeFilters.map((filter, i) => (
                                        <div key={i} className="bg-blue-50 border border-blue-100 text-blue-600 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-2">
                                            {filter}
                                            <button onClick={() => removeFilter(filter)} className="hover:text-blue-800 font-bold">×</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Views Content */}
                        <div className="min-h-[400px]">
                            {loading ? (
                                <div className="text-center p-12 text-slate-500">Loading institutions...</div>
                            ) : filteredInstitutions.length === 0 ? (
                                <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-500">
                                    No institutions found matching your criteria.
                                </div>
                            ) : (
                                <>
                                    {/* TABLE VIEW */}
                                    {viewMode === 'table' && (
                                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                                                <span className="text-xs font-bold text-slate-500">Showing {filteredInstitutions.length} results</span>
                                            </div>

                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left border-collapse">
                                                    <thead>
                                                        <tr className="bg-slate-50/50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                                            <th className="px-6 py-4 w-10"><input type="checkbox" className="rounded border-slate-300" /></th>
                                                            <th className="px-6 py-4">Institution Name</th>
                                                            <th className="px-6 py-4">Type</th>
                                                            <th className="px-6 py-4">Location</th>
                                                            <th className="px-6 py-4">Contact</th>
                                                            <th className="px-6 py-4">Status</th>
                                                            <th className="px-6 py-4 text-center">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-50">
                                                        {displayedInstitutions.map(inst => {
                                                            const Icon = getIcon(inst.type);
                                                            const status = inst.verificationStatus || 'PENDING';
                                                            return (
                                                                <tr key={inst._id} className="hover:bg-slate-50/80 transition-colors">
                                                                    <td className="px-6 py-4"><input type="checkbox" className="rounded border-slate-200" /></td>
                                                                    <td className="px-6 py-4">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100"><Icon size={14} /></div>
                                                                            <div>
                                                                                <Link to={`/admin/institutions/${inst._id}`} className="text-sm font-bold text-slate-800 hover:text-blue-600 cursor-pointer block transition-colors">{inst.name}</Link>
                                                                                <div className="text-[10px] text-slate-400 font-mono">ID: {inst._id.substring(0, 6)}</div>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-6 py-4 text-xs font-semibold capitalize text-slate-600">{inst.type}</td>
                                                                    <td className="px-6 py-4"><div className="flex items-center gap-1.5 text-xs text-slate-600 max-w-[200px] truncate"><FaMapMarkerAlt className="text-slate-400 shrink-0" />{inst.fullAddress || 'N/A'}</div></td>
                                                                    <td className="px-6 py-4 text-xs text-slate-600 font-mono">{inst.mobileNumber}</td>
                                                                    <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${getStatusColor(status)}`}>{status}</span></td>
                                                                    <td className="px-6 py-4 text-center relative action-menu-container">
                                                                        <button onClick={(e) => { e.stopPropagation(); toggleMenu(inst._id); }} className="p-2 text-slate-400 hover:text-blue-600 transition rounded-full hover:bg-slate-100"><FaEllipsisV /></button>
                                                                        {activeMenuId === inst._id && (
                                                                            <div className="absolute right-8 top-8 w-40 bg-white rounded-lg shadow-xl border border-slate-100 z-10 overflow-hidden animate-in fade-in zoom-in duration-200">
                                                                                <Link to={`/admin/institutions/${inst._id}`} className="w-full text-left px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2 border-b border-slate-50 transition" onClick={() => setActiveMenuId(null)}><FaEye className="text-slate-400" /> View Details</Link>
                                                                                <Link to={`/admin/institutions/edit/${inst._id}`} className="w-full text-left px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-amber-600 flex items-center gap-2 border-b border-slate-50 transition" onClick={() => setActiveMenuId(null)}><FaEdit className="text-slate-400" /> Edit Details</Link>
                                                                                <button onClick={() => {
                                                                                    if (window.confirm('Are you sure you want to delete this institution? This action cannot be undone.')) {
                                                                                        API.delete(`/institutions/${inst._id}`)
                                                                                            .then(() => {
                                                                                                alert('Institution deleted successfully');
                                                                                                fetchInstitutions();
                                                                                            })
                                                                                            .catch(err => {
                                                                                                console.error(err);
                                                                                                alert('Failed to delete institution');
                                                                                            });
                                                                                    }
                                                                                    setActiveMenuId(null);
                                                                                }} className="w-full text-left px-4 py-3 text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-2 transition"><FaTrash className="text-red-400" /> Delete</button>
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {/* CARDS VIEW */}
                                    {viewMode === 'cards' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                            {displayedInstitutions.map(inst => {
                                                const Icon = getIcon(inst.type);
                                                const status = inst.verificationStatus || 'PENDING';
                                                return (
                                                    <div key={inst._id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition group relative">
                                                        <div className="absolute top-4 right-4"><span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${getStatusColor(status)}`}>{status === 'APPROVED' ? 'Active' : status}</span></div>
                                                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 border border-blue-100 shadow-sm"><Icon size={20} /></div>
                                                        <div>
                                                            <h3 className="font-bold text-slate-800 text-lg mb-1 truncate" title={inst.name}>{inst.name}</h3>
                                                            <p className="text-xs font-bold uppercase text-slate-400 mb-4">{inst.type}</p>
                                                            <div className="space-y-2 mb-6">
                                                                <div className="flex items-start gap-2 text-xs text-slate-600"><FaMapMarkerAlt className="text-slate-400 mt-0.5 shrink-0" /><span className="line-clamp-2">{inst.fullAddress || 'No address'}</span></div>
                                                                <div className="flex items-center gap-2 text-xs text-slate-600"><FaPhoneAlt className="text-slate-400" /><span>{inst.mobileNumber}</span></div>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <Link to={`/admin/institutions/${inst._id}`} className="flex-1 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 text-slate-600 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 border border-slate-200 hover:border-blue-200"><FaEye /> View</Link>
                                                                <Link to={`/admin/institutions/edit/${inst._id}`} className="bg-slate-50 hover:bg-amber-50 hover:text-amber-600 text-slate-400 py-2 px-3 rounded-lg text-xs font-bold transition border border-slate-200 hover:border-amber-200"><FaEdit size={14} /></Link>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* MAP VIEW */}
                                    {viewMode === 'map' && (
                                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-[600px] overflow-hidden relative">
                                            {/* IMPORTANT: MapContainer needs height */}
                                            <MapContainer center={[17.0500, 79.2667]} zoom={10} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
                                                <TileLayer
                                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                />
                                                {filteredInstitutions.map((inst, index) => {
                                                    const coords = getCoordinates(inst.fullAddress || inst.name || `inst-${index}`);
                                                    const Icon = getIcon(inst.type);
                                                    return (
                                                        <Marker key={inst._id} position={coords}>
                                                            <Popup>
                                                                <div className="p-1">
                                                                    <h3 className="font-bold text-sm mb-1">{inst.name}</h3>
                                                                    <p className="text-xs text-slate-500 mb-1 capitalize">{inst.type}</p>
                                                                    <p className="text-xs">{inst.fullAddress}</p>
                                                                    <Link to={`/admin/institutions/${inst._id}`} className="block mt-2 text-xs font-bold text-blue-600 hover:underline">View Details</Link>
                                                                </div>
                                                            </Popup>
                                                        </Marker>
                                                    );
                                                })}
                                            </MapContainer>
                                        </div>
                                    )}

                                    {/* Pagination (Common) */}
                                    {viewMode !== 'map' && (
                                        <div className="p-4 flex items-center justify-between mt-4">
                                            <div className="text-xs text-slate-500 font-bold">Page {currentPage} of {pageCount || 1}</div>
                                            <div className="flex gap-2">
                                                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent text-sm bg-white shadow-sm transition"><FaChevronLeft /></button>
                                                <button onClick={() => setCurrentPage(p => Math.min(pageCount, p + 1))} disabled={currentPage === pageCount} className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent text-sm bg-white shadow-sm transition"><FaChevronRight /></button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
};

export default InstitutionManagement;
