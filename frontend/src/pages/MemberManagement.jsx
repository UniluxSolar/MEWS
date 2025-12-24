import React, { useState, useEffect } from 'react';
import API from '../api';
import { Link } from 'react-router-dom';
import {
    FaSearch, FaFilter, FaEye, FaEdit, FaPhoneAlt, FaFileDownload, FaFileUpload,
    FaChevronLeft, FaChevronRight, FaEllipsisV, FaCheckSquare, FaTrash, FaIdCard
} from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import DashboardHeader from '../components/common/DashboardHeader';

const MemberManagement = () => {
    // Helper to get safe village name - Defined early to avoid ReferenceError
    const getVillageName = (villageData) => {
        if (villageData === null || villageData === undefined) return '';
        if (typeof villageData === 'string') return villageData;
        if (typeof villageData === 'object') {
            // Check if name exists and is primitive
            if (villageData.name) {
                return typeof villageData.name === 'object'
                    ? JSON.stringify(villageData.name)
                    : String(villageData.name);
            }
            return '';
        }
        return String(villageData);
    };
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0 });

    // Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedVillage, setSelectedVillage] = useState('');
    const [selectedAgeRange, setSelectedAgeRange] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedGenders, setSelectedGenders] = useState({
        All: true, Male: false, Female: false, Other: false
    });

    // Validated filters that are actually applied to the list
    const [appliedFilters, setAppliedFilters] = useState({
        village: '',
        ageRange: '',
        category: '',
        genders: { All: true, Male: false, Female: false, Other: false }
    });

    const [activeFilters, setActiveFilters] = useState([]);

    // Action Menu State
    const [activeMenuId, setActiveMenuId] = useState(null);

    // Close menu when clicking outside (simplistic approach or just toggle)
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
    const itemsPerPage = 10;

    // Filter Logic
    const filteredMembers = members.filter(member => {
        // Search
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            const safeVillage = getVillageName(member.address?.village).toLowerCase();
            const text = `${member.name} ${member.surname} ${member.mobileNumber} ${safeVillage}`.toLowerCase();
            if (!text.includes(term)) return false;
        }

        // Village
        if (appliedFilters.village && getVillageName(member.address?.village) !== appliedFilters.village) return false;

        // Age Range
        if (appliedFilters.ageRange) {
            const age = parseInt(member.age) || 0;
            const [min, max] = appliedFilters.ageRange.split('-').map(Number);
            if (max && (age < min || age > max)) return false;
            // Handle "60+" etc if needed, simplified for now
        }

        // Category (Occupation/Caste mapping for demo)
        if (appliedFilters.category) {
            // Mapping "Farmer", "Student" etc from backend data if available. 
            // Checking occupation matches for now.
            const job = (member.occupation || '').toLowerCase();
            if (!job.includes(appliedFilters.category.toLowerCase())) return false;
        }

        // Gender
        if (!appliedFilters.genders.All) {
            const gender = (member.gender || '').toLowerCase(); // male, female
            if (appliedFilters.genders.Male && gender === 'male') return true;
            if (appliedFilters.genders.Female && gender === 'female') return true;
            if (appliedFilters.genders.Other && gender !== 'male' && gender !== 'female') return true;
            return false; // If All is off and no specific gender matches
        }

        return true;
    });

    const pageCount = Math.ceil(filteredMembers.length / itemsPerPage);
    const displayedMembers = filteredMembers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
        // Update the applied filters state with the current selected values
        setAppliedFilters({
            village: selectedVillage,
            ageRange: selectedAgeRange,
            category: selectedCategory,
            genders: { ...selectedGenders }
        });

        // Update visual tags
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

        // Reset applied filters too
        setAppliedFilters({
            village: '',
            ageRange: '',
            category: '',
            genders: { All: true, Male: false, Female: false, Other: false }
        });

        setActiveFilters([]);
        setCurrentPage(1);
    };

    const exportToExcel = () => {
        const data = filteredMembers.map(m => ({
            "ID": m.mewsId || m._id,
            "Name": `${m.name} ${m.surname}`,
            "Mobile": m.mobileNumber,
            "Village": getVillageName(m.address?.village),
            "Age": m.age,
            "Gender": m.gender,
            "Occupation": m.occupation
        }));
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Members");
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        saveAs(new Blob([excelBuffer], { type: 'application/octet-stream' }), 'members.xlsx');
    };



    // Extract unique villages
    const villages = [...new Set(members.map(m => getVillageName(m.address?.village)).filter(Boolean))];

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
            <AdminHeader />
            <div className="flex flex-1 overflow-hidden">
                <AdminSidebar activePage="members" />
                <main className="flex-1 overflow-y-auto">
                    <DashboardHeader
                        title="Member Management"
                        subtitle={
                            <div className="flex items-center gap-4">
                                <span>Dashboard &gt; Members</span>
                                <div className="bg-white bg-opacity-10 backdrop-blur-md border border-white/20 rounded-lg px-3 py-1 flex items-center gap-2">
                                    <span className="text-white font-bold text-sm">{filteredMembers.length.toLocaleString()}</span>
                                    <span className="text-blue-200 text-[10px] font-bold uppercase tracking-wider">Members</span>
                                </div>
                            </div>
                        }
                    >
                        <div className="flex items-center gap-3">
                            <button onClick={exportToExcel} className="bg-white bg-opacity-10 hover:bg-opacity-20 backdrop-blur-md text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 border border-white/20 transition">
                                <FaFileDownload /> Export Data
                            </button>
                            <button className="bg-[#1e2a4a] text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-900/30 hover:bg-[#2a3b66] transition">
                                <FaFileUpload /> Bulk Import
                            </button>
                        </div>
                    </DashboardHeader>

                    <div className="px-4 md:px-8 -mt-10 pb-12 w-full">

                        {/* Search & Filter Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                            <h3 className="text-slate-800 font-bold mb-4">Search & Filter</h3>

                            {/* Main Search */}
                            <div className="mb-6">
                                <div className="relative">
                                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by name, phone, village..."
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Dropdowns Row */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Villages</label>
                                    <select
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-blue-500 text-slate-700"
                                        value={selectedVillage}
                                        onChange={(e) => setSelectedVillage(e.target.value)}
                                    >
                                        <option value="">Select Village</option>
                                        {villages.map(v => <option key={v} value={v}>{v}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Age Range</label>
                                    <select
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-blue-500 text-slate-700"
                                        value={selectedAgeRange}
                                        onChange={(e) => setSelectedAgeRange(e.target.value)}
                                    >
                                        <option value="">Select Range</option>
                                        <option value="18-25">18 - 25</option>
                                        <option value="26-40">26 - 40</option>
                                        <option value="41-60">41 - 60</option>
                                        <option value="60-150">60+</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Occupation</label>
                                    <select
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-blue-500 text-slate-700"
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                    >
                                        <option value="">Select Occupation</option>
                                        <option value="Farmer">Farmer</option>
                                        <option value="Student">Student</option>
                                        <option value="Business">Business</option>
                                        <option value="Private Job">Private Job</option>
                                    </select>
                                </div>
                            </div>

                            {/* Gender Checkboxes & Action Buttons */}
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="flex flex-col gap-2">
                                    <span className="text-xs font-bold text-slate-600">Gender</span>
                                    <div className="flex items-center gap-4">
                                        {['All', 'Male', 'Female', 'Other'].map(type => (
                                            <label key={type} className="flex items-center gap-2 cursor-pointer select-none">
                                                <div
                                                    className={`w-4 h-4 border rounded flex items-center justify-center transition-colors ${selectedGenders[type] ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'}`}
                                                    onClick={() => handleGenderChange(type)}
                                                >
                                                    {selectedGenders[type] && <FaCheckSquare size={10} />}
                                                </div>
                                                <span className="text-sm text-slate-600">{type}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
                                    <button onClick={applyFilters} className="bg-[#1e2a4a] text-white px-5 py-2 rounded-lg text-xs font-bold hover:bg-[#2a3b66] transition shadow-sm">
                                        Apply Filters
                                    </button>
                                    <button onClick={clearFilters} className="bg-white border border-slate-200 text-slate-600 px-5 py-2 rounded-lg text-xs font-bold hover:bg-slate-50 transition">
                                        Clear All
                                    </button>
                                </div>
                            </div>

                            {/* Active Filters Tags */}
                            {activeFilters.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
                                    <span className="text-xs font-bold text-slate-400 self-center mr-1">Active filters:</span>
                                    {activeFilters.map((filter, i) => (
                                        <div key={i} className="bg-blue-50 border border-blue-100 text-blue-600 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-2">
                                            {filter}
                                            <button onClick={() => setActiveFilters(activeFilters.filter(f => f !== filter))} className="hover:text-blue-800">×</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Members Table */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                                <span className="text-xs font-bold text-slate-500">Showing {filteredMembers.length} results</span>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    Sort by:
                                    <select className="bg-transparent font-bold focus:outline-none cursor-pointer">
                                        <option>Name</option>
                                        <option>Date Joined</option>
                                    </select>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-100 text-sm font-bold text-slate-400 uppercase tracking-wider">
                                            <th className="px-6 py-4 w-10">
                                                <input type="checkbox" className="rounded border-slate-300" />
                                            </th>
                                            <th className="px-6 py-4">Name</th>
                                            <th className="px-6 py-4">Village</th>
                                            <th className="px-6 py-4">Phone</th>
                                            <th className="px-6 py-4">Age</th>
                                            <th className="px-6 py-4">Gender</th>
                                            <th className="px-6 py-4">Occupation</th>
                                            <th className="px-6 py-4 text-center">Family</th>
                                            <th className="px-6 py-4">Joined</th>
                                            <th className="px-6 py-4 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {loading ? (
                                            <tr><td colSpan="10" className="p-8 text-center text-slate-500">Loading...</td></tr>
                                        ) : displayedMembers.length > 0 ? (
                                            displayedMembers.map(member => (
                                                <tr key={member._id} className="hover:bg-slate-50/80 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <input type="checkbox" className="rounded border-slate-200" />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <Link to={`/admin/members/${member._id}`} className="text-base font-bold text-slate-800 hover:text-blue-600 cursor-pointer">{member.name} {member.surname}</Link>
                                                            <div className="text-xs text-slate-400 font-mono">ID: {member.mewsId || member._id.substring(0, 6)}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-semibold text-blue-600">
                                                        {getVillageName(member.address?.village) || 'N/A'}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-slate-600 font-mono">
                                                        {member.mobileNumber}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-slate-600">
                                                        {member.age}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-slate-600">
                                                        {member.gender}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide 
                                                            ${(member.occupation || '').toLowerCase().includes('farmer') ? 'bg-green-50 text-green-600' :
                                                                (member.occupation || '').toLowerCase().includes('student') ? 'bg-blue-50 text-blue-600' :
                                                                    (member.occupation || '').toLowerCase().includes('business') ? 'bg-indigo-50 text-indigo-600' :
                                                                        'bg-slate-100 text-slate-600'}`}>
                                                            {member.occupation || 'Member'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-slate-600 text-center">
                                                        {member.familyDetails?.memberCount || 0}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-slate-500">
                                                        {new Date(member.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 text-center relative action-menu-container">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleMenu(member._id);
                                                            }}
                                                            className="p-2 text-slate-400 hover:text-blue-600 transition rounded-full hover:bg-slate-100"
                                                        >
                                                            <FaEllipsisV />
                                                        </button>

                                                        {activeMenuId === member._id && (
                                                            <div className="absolute right-8 top-8 w-40 bg-white rounded-lg shadow-xl border border-slate-100 z-10 overflow-hidden animate-in fade-in zoom-in duration-200">
                                                                <Link
                                                                    to={`/admin/members/${member._id}`}
                                                                    className="w-full text-left px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2 border-b border-slate-50 transition"
                                                                    onClick={() => setActiveMenuId(null)}
                                                                >
                                                                    <FaEye className="text-slate-400" /> View Profile
                                                                </Link>
                                                                <Link
                                                                    to={`/admin/members/edit/${member._id}`}
                                                                    className="w-full text-left px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-amber-600 flex items-center gap-2 border-b border-slate-50 transition"
                                                                    onClick={() => setActiveMenuId(null)}
                                                                >
                                                                    <FaEdit className="text-slate-400" /> Edit Profile
                                                                </Link>

                                                                <Link
                                                                    to={`/admin/members/generate-id`}
                                                                    state={{ memberId: member._id }}
                                                                    className="w-full text-left px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2 border-b border-slate-50 transition"
                                                                    onClick={() => setActiveMenuId(null)}
                                                                >
                                                                    <FaIdCard className="text-slate-400" /> Generate ID
                                                                </Link>

                                                                {member.mobileNumber && (
                                                                    <a
                                                                        href={`tel:${member.mobileNumber}`}
                                                                        className="w-full text-left px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-green-600 flex items-center gap-2 border-b border-slate-50 transition"
                                                                        onClick={() => setActiveMenuId(null)}
                                                                    >
                                                                        <FaPhoneAlt className="text-slate-400" /> Call Member
                                                                    </a>
                                                                )}

                                                                <button
                                                                    onClick={() => {
                                                                        if (window.confirm('Are you sure you want to delete this member?')) {
                                                                            // Handle delete API call here
                                                                            alert('Delete functionality to be implemented');
                                                                        }
                                                                        setActiveMenuId(null);
                                                                    }}
                                                                    className="w-full text-left px-4 py-3 text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-2 transition"
                                                                >
                                                                    <FaTrash className="text-red-400" /> Delete Member
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr><td colSpan="10" className="p-8 text-center text-slate-400">No members match your filters.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Footer / Pagination */}
                            <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-500">Show</span>
                                    <select className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-bold text-slate-600 focus:outline-none">
                                        <option>10</option>
                                        <option>20</option>
                                        <option>50</option>
                                    </select>
                                    <span className="text-xs text-slate-500">per page</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 text-slate-500 hover:bg-white disabled:opacity-50 text-xs"
                                    >
                                        <FaChevronLeft />
                                    </button>
                                    {[...Array(Math.min(5, pageCount))].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`w-8 h-8 flex items-center justify-center rounded border text-xs font-bold ${currentPage === i + 1 ? 'bg-[#1e2a4a] text-white border-[#1e2a4a]' : 'border-slate-200 text-slate-600 hover:bg-white'}`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(pageCount, p + 1))}
                                        disabled={currentPage === pageCount}
                                        className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 text-slate-500 hover:bg-white disabled:opacity-50 text-xs"
                                    >
                                        <FaChevronRight />
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </main>
            </div >
        </div >
    );
};

export default MemberManagement;
