import React, { useState, useEffect } from 'react';
import {
    FaUserShield, FaEdit, FaTrash, FaSearch, FaEllipsisV, FaUserPlus,
    FaCheckCircle, FaTimesCircle, FaFileDownload, FaFilter, FaUsers, FaMapMarkedAlt,
    FaEye, FaChevronLeft, FaChevronRight, FaCheckSquare
} from 'react-icons/fa';
import API from '../api';
import AdminHeader from '../components/AdminHeader';
import AdminSidebar from '../components/AdminSidebar';
import DashboardHeader from '../components/common/DashboardHeader';
import StatCard from '../components/common/StatCard';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Link } from 'react-router-dom';

const AdminManagement = () => {
    const [admins, setAdmins] = useState([]);
    const [filteredAdmins, setFilteredAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        username: '', email: '', password: '', role: '', assignedLocation: '', isActive: true
    });
    const [editingId, setEditingId] = useState(null);
    const [locations, setLocations] = useState([]);

    // Promote Member States
    const [isPromoting, setIsPromoting] = useState(false);
    const [searchMobile, setSearchMobile] = useState('');
    const [memberToPromote, setMemberToPromote] = useState(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState('');

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // View Admin Details
    const [viewAdmin, setViewAdmin] = useState(null);
    const [activeMenuId, setActiveMenuId] = useState(null);

    // Auth info
    const adminInfo = JSON.parse(localStorage.getItem('adminInfo') || '{}');
    const userRole = adminInfo.role;

    // Hierarchy Permissions
    const HIERARCHY = {
        'SUPER_ADMIN': 5,
        'STATE_ADMIN': 4,
        'DISTRICT_ADMIN': 3,
        'MANDAL_ADMIN': 2,
        'VILLAGE_ADMIN': 1
    };

    const allowedRoles = Object.keys(HIERARCHY).filter(r => HIERARCHY[r] < HIERARCHY[userRole]);

    useEffect(() => {
        fetchAdmins();
        fetchLocations();
    }, []);

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

    // Apply filters whenever dependencies change
    useEffect(() => {
        let result = admins;

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(a =>
                a.username.toLowerCase().includes(term) ||
                (a.email && a.email.toLowerCase().includes(term)) ||
                (a.assignedLocation?.name && a.assignedLocation.name.toLowerCase().includes(term))
            );
        }

        if (selectedRole) {
            result = result.filter(a => a.role === selectedRole);
        }

        if (selectedStatus) {
            const isActive = selectedStatus === 'Active';
            result = result.filter(a => a.isActive === isActive);
        }

        setFilteredAdmins(result);
        setCurrentPage(1);

    }, [admins, searchTerm, selectedRole, selectedStatus]);

    const fetchAdmins = async () => {
        try {
            const { data } = await API.get('/admin/management');
            setAdmins(data);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch admins", error);
            setLoading(false);
        }
    };

    const fetchLocations = async () => {
        try {
            const { data } = await API.get('/admin/management/locations');
            setLocations(data);
        } catch (error) {
            console.error("Failed to fetch locations", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await API.put(`/admin/management/${editingId}`, formData);
            } else {
                await API.post('/admin/management', formData);
            }
            setShowModal(false);
            setFormData({ username: '', email: '', password: '', role: '', assignedLocation: '', isActive: true });
            setEditingId(null);
            fetchAdmins();
        } catch (error) {
            alert(error.response?.data?.message || 'Operation failed');
        }
    };

    // Promote Handler
    const handleSearchMember = async () => {
        setSearchLoading(true);
        setSearchError('');
        try {
            const { data } = await API.post('/admin/management/search-member', { mobileNumber: searchMobile });
            setMemberToPromote(data);
            // Pre-fill location if matches allowed locations? No, let user pick exact scope.
        } catch (error) {
            setMemberToPromote(null);
            setSearchError(error.response?.data?.message || 'Member not found');
        } finally {
            setSearchLoading(false);
        }
    };

    const handlePromoteSubmit = async (e) => {
        e.preventDefault();
        if (!memberToPromote) return;
        try {
            await API.post('/admin/management/promote-member', {
                memberId: memberToPromote._id,
                role: formData.role,
                assignedLocation: formData.assignedLocation
            });
            setShowModal(false);
            // Reset States
            setIsPromoting(false);
            setMemberToPromote(null);
            setSearchMobile('');
            setFormData({ username: '', email: '', password: '', role: '', assignedLocation: '', isActive: true });
            alert('Member Promoted Successfully! Default Password is "Mews@<Mobile>"');
            fetchAdmins();
        } catch (error) {
            alert(error.response?.data?.message || 'Promotion Failed');
        }
    };

    const handleEdit = (admin) => {
        setIsPromoting(false);
        setFormData({
            username: admin.username,
            email: admin.email || '',
            password: '', // Don't show hash
            role: admin.role,
            assignedLocation: admin.assignedLocation?._id || '',
            isActive: admin.isActive
        });
        setEditingId(admin._id);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to remove this admin?')) return;
        try {
            await API.delete(`/admin/management/${id}`);
            fetchAdmins();
        } catch (error) {
            alert('Failed to delete admin');
        }
    };

    const exportToExcel = () => {
        const data = filteredAdmins.map(a => ({
            "Username": a.username,
            "Email": a.email,
            "Role": a.role,
            "Location": a.assignedLocation?.name || 'N/A',
            "Status": a.isActive ? 'Active' : 'Inactive',
            "Joined": new Date(a.createdAt).toLocaleDateString()
        }));
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Admins");
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        saveAs(new Blob([excelBuffer], { type: 'application/octet-stream' }), 'admins_list.xlsx');
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedRole('');
        setSelectedStatus('');
    };

    // Stats
    const totalAdmins = admins.length;
    const activeAdmins = admins.filter(a => a.isActive).length;
    const locationsCovered = new Set(admins.map(a => a.assignedLocation?._id).filter(Boolean)).size;

    // Pagination Logic
    const pageCount = Math.ceil(filteredAdmins.length / itemsPerPage);
    const displayedAdmins = filteredAdmins.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const toggleMenu = (id) => {
        if (activeMenuId === id) {
            setActiveMenuId(null);
        } else {
            setActiveMenuId(id);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
            <AdminHeader />
            <div className="flex flex-1 overflow-hidden">
                <AdminSidebar activePage="admin-management" />
                <main className="flex-1 overflow-y-auto">
                    <DashboardHeader
                        title="Admin Management"
                        headerActions={
                            <div className="flex items-center gap-3">
                                <button onClick={exportToExcel} className="bg-white bg-opacity-10 hover:bg-opacity-20 backdrop-blur-md text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 border border-white/20 transition">
                                    <FaFileDownload /> Export Data
                                </button>
                                <button
                                    onClick={() => {
                                        setEditingId(null);
                                        setIsPromoting(true); // Enable Promote Mode
                                        setMemberToPromote(null);
                                        setSearchMobile('');
                                        setFormData({ username: '', email: '', password: '', role: '', assignedLocation: '', isActive: true });
                                        setShowModal(true);
                                    }}
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg transition transform hover:scale-105">
                                    <FaUserPlus /> Assign Admin
                                </button>
                            </div>
                        }
                        subtitle={
                            <div className="flex items-center gap-4">
                                <span>Dashboard &gt; Admins</span>
                                <div className="bg-white bg-opacity-10 backdrop-blur-md border border-white/20 rounded-lg px-3 py-1 flex items-center gap-2">
                                    <span className="text-white font-bold text-sm">{totalAdmins}</span>
                                    <span className="text-blue-200 text-[10px] font-bold uppercase tracking-wider">Admins</span>
                                </div>
                            </div>
                        }
                    />

                    <div className="px-4 md:px-8 -mt-10 pb-12 w-full">

                        {/* Stats Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <StatCard
                                title="Total Sub-Admins"
                                value={totalAdmins}
                                subtext="Across all levels"
                                icon={FaUserShield}
                                color="bg-blue-600"
                            />
                            <StatCard
                                title="Active Accounts"
                                value={activeAdmins}
                                subtext={`${Math.round((activeAdmins / totalAdmins) * 100 || 0)}% Operating`}
                                icon={FaCheckCircle}
                                color="bg-emerald-500"
                            />
                            <StatCard
                                title="Locations Covered"
                                value={locationsCovered}
                                subtext="Unique regions managed"
                                icon={FaMapMarkedAlt}
                                color="bg-indigo-500"
                            />
                        </div>

                        {/* Search & Filter Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                            <h3 className="text-slate-800 font-bold mb-4">Search & Filter</h3>

                            {/* Main Search */}
                            <div className="mb-6">
                                <div className="relative">
                                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by username, email, or location..."
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Dropdowns Row */}
                            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full md:w-2/3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 mb-1.5">Role</label>
                                        <select
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-blue-500 text-slate-700"
                                            value={selectedRole}
                                            onChange={(e) => setSelectedRole(e.target.value)}
                                        >
                                            <option value="">All Roles</option>
                                            {allowedRoles.map(r => (
                                                <option key={r} value={r}>{r.replace('_', ' ')}</option>
                                            ))}
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
                                            <option value="Inactive">Inactive</option>
                                        </select>
                                    </div>
                                </div>

                                <button onClick={clearFilters} className="bg-white border border-slate-200 text-slate-600 px-5 py-2.5 rounded-lg text-xs font-bold hover:bg-slate-50 transition min-w-[100px]">
                                    Clear All
                                </button>
                            </div>
                        </div>

                        {/* Admins Table */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                                <span className="text-xs font-bold text-slate-500">Showing {filteredAdmins.length} results</span>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    Sort by:
                                    <select className="bg-transparent font-bold focus:outline-none cursor-pointer">
                                        <option>Newest First</option>
                                        <option>Alphabetical</option>
                                    </select>
                                </div>
                            </div>

                            <div className="overflow-auto max-h-[calc(100vh-400px)] border-t border-slate-100">
                                <table className="w-full text-left border-collapse relative">
                                    <thead className="sticky top-0 z-20 shadow-sm bg-slate-50">
                                        <tr className="border-b border-slate-100 text-sm font-bold text-slate-400 uppercase tracking-wider">
                                            <th className="px-6 py-4 w-10">
                                                <input type="checkbox" className="rounded border-slate-300" />
                                            </th>
                                            <th className="px-6 py-4">Admin User</th>
                                            <th className="px-6 py-4">Role</th>
                                            <th className="px-6 py-4">Location</th>
                                            <th className="px-6 py-4">Joined</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {loading ? (
                                            <tr><td colSpan="7" className="p-8 text-center text-slate-500">Loading admins...</td></tr>
                                        ) : displayedAdmins.length === 0 ? (
                                            <tr><td colSpan="7" className="p-8 text-center text-slate-500">No admins found matching criteria.</td></tr>
                                        ) : displayedAdmins.map((admin) => (
                                            <tr key={admin._id} className="hover:bg-slate-50/80 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <input type="checkbox" className="rounded border-slate-200" />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                                                            {admin.username.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <div
                                                                onClick={() => setViewAdmin(admin)}
                                                                className="text-sm font-bold text-slate-800 hover:text-blue-600 cursor-pointer hover:underline"
                                                            >
                                                                {admin.memberId ? `${admin.memberId.name} ${admin.memberId.surname}` : admin.username}
                                                            </div>
                                                            <div className="text-xs text-slate-400">{admin.memberId ? admin.username : admin.email || 'No Email'}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg border border-slate-200">
                                                        {admin.role.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600">
                                                    {admin.assignedLocation ? admin.assignedLocation.name : <span className="text-slate-400 italic">N/A</span>}
                                                    {admin.assignedLocation?.type && <span className="ml-1 text-[10px] text-slate-400 uppercase font-bold">({admin.assignedLocation.type})</span>}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-500">
                                                    {new Date(admin.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {admin.isActive ? (
                                                        <span className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md text-xs font-bold w-fit">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                            Active
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1.5 px-2 py-1 bg-red-50 text-red-600 rounded-md text-xs font-bold w-fit">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                                            Inactive
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center relative action-menu-container">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleMenu(admin._id);
                                                        }}
                                                        className="p-2 text-slate-400 hover:text-blue-600 transition rounded-full hover:bg-slate-100"
                                                    >
                                                        <FaEllipsisV size={14} />
                                                    </button>

                                                    {activeMenuId === admin._id && (
                                                        <div className="absolute right-8 top-8 w-40 bg-white rounded-lg shadow-xl border border-slate-100 z-10 overflow-hidden animate-in fade-in zoom-in duration-200">
                                                            <button
                                                                onClick={() => { setViewAdmin(admin); setActiveMenuId(null); }}
                                                                className="w-full text-left px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2 border-b border-slate-50 transition"
                                                            >
                                                                <FaEye className="text-slate-400" /> View Profile
                                                            </button>
                                                            <button
                                                                onClick={() => { handleEdit(admin); setActiveMenuId(null); }}
                                                                className="w-full text-left px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-amber-600 flex items-center gap-2 border-b border-slate-50 transition"
                                                            >
                                                                <FaEdit className="text-slate-400" /> Edit Admin
                                                            </button>
                                                            <button
                                                                onClick={() => { handleDelete(admin._id); setActiveMenuId(null); }}
                                                                className="w-full text-left px-4 py-3 text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-2 transition"
                                                            >
                                                                <FaTrash className="text-red-400" /> Remove
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
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
            </div>

            {/* Create/Edit Modal */}
            {showModal && !isPromoting && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-lg text-slate-800">{editingId ? 'Edit Admin' : 'Create New Admin'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">×</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    value={formData.username}
                                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                                    disabled={!!editingId}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    {editingId ? 'New Password (leave blank to keep current)' : 'Password'}
                                </label>
                                <input
                                    type="password"
                                    required={!editingId}
                                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    placeholder={editingId ? '********' : 'Enter secure password'}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                                    <select
                                        required
                                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.role}
                                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                                    >
                                        <option value="">Select Role</option>
                                        {allowedRoles.map(role => (
                                            <option key={role} value={role}>{role.replace('_', ' ')}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Assigned Location</label>
                                    <select
                                        required
                                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.assignedLocation}
                                        onChange={e => setFormData({ ...formData, assignedLocation: e.target.value })}
                                    >
                                        <option value="">Select Location</option>
                                        {locations.map(loc => (
                                            <option key={loc._id} value={loc._id}>{loc.name} ({loc.type})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mt-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={formData.isActive}
                                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="isActive" className="text-sm text-slate-700">Account Active</label>
                            </div>

                            <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold hover:bg-blue-700 transition-colors mt-4 shadow-lg shadow-blue-200">
                                {editingId ? 'Update Admin' : 'Create Admin Account'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Promote Member Modal */}
            {showModal && isPromoting && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-lg text-slate-800">Promote Member to Admin</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">×</button>
                        </div>
                        <div className="p-6 space-y-4">
                            {/* Step 1: Search */}
                            {!memberToPromote ? (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Search Member by Mobile</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            className="flex-1 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="Enter 10-digit Mobile Number"
                                            value={searchMobile}
                                            onChange={(e) => setSearchMobile(e.target.value.replace(/\D/g, ''))}
                                        />
                                        <button
                                            onClick={handleSearchMember}
                                            disabled={searchLoading || searchMobile.length !== 10}
                                            className="bg-blue-600 text-white px-4 rounded-lg font-bold disabled:opacity-50"
                                        >
                                            {searchLoading ? '...' : <FaSearch />}
                                        </button>
                                    </div>
                                    {searchError && <p className="text-red-500 text-xs mt-2">{searchError}</p>}
                                </div>
                            ) : (
                                /* Step 2: Assign Role */
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-center gap-4">
                                        {memberToPromote.photoUrl ? (
                                            <img src={memberToPromote.photoUrl} alt="Profile" className="w-12 h-12 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center font-bold text-blue-700">
                                                {memberToPromote.name.charAt(0)}
                                            </div>
                                        )}
                                        <div>
                                            <h4 className="font-bold text-slate-800">{memberToPromote.name} {memberToPromote.surname}</h4>
                                            <p className="text-xs text-slate-500">{memberToPromote.mobileNumber}</p>
                                            <p className="text-xs text-blue-600 font-semibold">{memberToPromote.role.replace('_', ' ')}</p>
                                        </div>
                                        <button onClick={() => setMemberToPromote(null)} className="ml-auto text-xs text-red-500 underline">Change</button>
                                    </div>

                                    <form onSubmit={handlePromoteSubmit} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Assign Role</label>
                                                <select
                                                    required
                                                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={formData.role}
                                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                                >
                                                    <option value="">Select Role</option>
                                                    {allowedRoles.map(role => (
                                                        <option key={role} value={role}>{role.replace('_', ' ')}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Assign Location</label>
                                                <select
                                                    required
                                                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={formData.assignedLocation}
                                                    onChange={e => setFormData({ ...formData, assignedLocation: e.target.value })}
                                                >
                                                    <option value="">Select Location</option>
                                                    {locations.map(loc => (
                                                        <option key={loc._id} value={loc._id}>{loc.name} ({loc.type})</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <button type="submit" className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-bold hover:bg-emerald-700 transition-colors mt-2 shadow-lg shadow-emerald-200">
                                            Confirm Promotion
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* View Details Modal */}
            {viewAdmin && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-lg text-slate-800">Admin Details</h3>
                            <button onClick={() => setViewAdmin(null)} className="text-slate-400 hover:text-slate-600">×</button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl font-bold">
                                    {viewAdmin.username.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800">
                                        {viewAdmin.memberId ? `${viewAdmin.memberId.name} ${viewAdmin.memberId.surname}` : viewAdmin.username}
                                    </h2>
                                    <p className="text-slate-500 text-sm">
                                        {viewAdmin.memberId ? viewAdmin.username : viewAdmin.email || 'No email provided'}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <div className="text-xs text-slate-400 font-bold uppercase mb-1">Role</div>
                                    <div className="text-sm font-semibold text-slate-700">{viewAdmin.role.replace('_', ' ')}</div>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <div className="text-xs text-slate-400 font-bold uppercase mb-1">Status</div>
                                    <div className={`text-sm font-semibold ${viewAdmin.isActive ? 'text-emerald-600' : 'text-red-500'}`}>
                                        {viewAdmin.isActive ? 'Active' : 'Inactive'}
                                    </div>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <div className="text-xs text-slate-400 font-bold uppercase mb-1">Location</div>
                                    <div className="text-sm font-semibold text-slate-700">
                                        {viewAdmin.assignedLocation?.name || 'N/A'}
                                        {viewAdmin.assignedLocation?.type && <span className="text-xs text-slate-400 ml-1">({viewAdmin.assignedLocation.type})</span>}
                                    </div>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <div className="text-xs text-slate-400 font-bold uppercase mb-1">Joined</div>
                                    <div className="text-sm font-semibold text-slate-700">
                                        {new Date(viewAdmin.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
                                <button onClick={() => { handleEdit(viewAdmin); setViewAdmin(null); }} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-100 transition">
                                    Edit Profile
                                </button>
                                <button onClick={() => setViewAdmin(null)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-200 transition">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminManagement;
