import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import DashboardHeader from '../components/common/DashboardHeader';
import {
    FaPlus, FaSearch, FaFilter, FaCheck, FaTimes, FaEye,
    FaMoneyBillWave, FaGraduationCap, FaHeartbeat, FaStore, FaEllipsisV
} from 'react-icons/fa';

// Mock Data
const MOCK_REQUESTS = [
    {
        id: 'FR-2024-001',
        applicant: 'Raju Goud',
        village: 'Gundlapally',
        category: 'Education',
        amount: 25000,
        purpose: 'College Fees for B.Tech 1st Year',
        date: '2024-12-20',
        status: 'Pending',
        avatar: 'R'
    },
    {
        id: 'FR-2024-002',
        applicant: 'Laxmi Palle',
        village: 'Kothapeta',
        category: 'Medical',
        amount: 50000,
        purpose: 'Emergency Surgery Support',
        date: '2024-12-18',
        status: 'Approved',
        avatar: 'L'
    },
    {
        id: 'FR-2024-003',
        applicant: 'Mahesh Kumar',
        village: 'Gundlapally',
        category: 'Small Business',
        amount: 10000,
        purpose: 'Vegetable Cart Setup',
        date: '2024-12-15',
        status: 'Rejected',
        avatar: 'M'
    },
    {
        id: 'FR-2024-004',
        applicant: 'Srinivals',
        village: 'Chandampet',
        category: 'Education',
        amount: 15000,
        purpose: 'School Books & Uniforms',
        date: '2024-12-22',
        status: 'Pending',
        avatar: 'S'
    },
    {
        id: 'FR-2024-005',
        applicant: 'Kavitha R',
        village: 'Kothapeta',
        category: 'Medical',
        amount: 5000,
        purpose: 'Medicine Costs',
        date: '2024-12-23',
        status: 'Pending',
        avatar: 'K'
    }
];

const FundingRequests = () => {
    const [activeTab, setActiveTab] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    // Filter Logic
    const filteredRequests = MOCK_REQUESTS.filter(req => {
        const matchesTab = activeTab === 'All' || req.status === activeTab;
        const matchesSearch = req.applicant.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.id.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesTab && matchesSearch;
    });

    // Stats Logic
    const totalAmount = MOCK_REQUESTS.reduce((sum, req) => sum + req.amount, 0);
    const pendingCount = MOCK_REQUESTS.filter(r => r.status === 'Pending').length;
    const approvedCount = MOCK_REQUESTS.filter(r => r.status === 'Approved').length;

    // Helper for Category Icon
    const getCategoryIcon = (cat) => {
        switch (cat) {
            case 'Education': return <FaGraduationCap className="text-blue-500" />;
            case 'Medical': return <FaHeartbeat className="text-red-500" />;
            case 'Small Business': return <FaStore className="text-emerald-500" />;
            default: return <FaMoneyBillWave className="text-slate-500" />;
        }
    };

    // Helper for Status Badge
    const getStatusBadge = (status) => {
        const styles = {
            'Pending': 'bg-amber-50 text-amber-700 border-amber-100',
            'Approved': 'bg-green-50 text-green-700 border-green-100',
            'Rejected': 'bg-red-50 text-red-700 border-red-100',
        };
        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${styles[status] || styles['Pending']}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
            <AdminHeader />
            <div className="flex flex-1 overflow-hidden">
                <AdminSidebar activePage="funding" />
                <main className="flex-1 overflow-y-auto">
                    <DashboardHeader
                        title="Funding Requests"
                        subtitle="Manage funding proposals and disbursements."
                        breadcrumb={
                            <>
                                <Link to="/admin/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
                                <span className="opacity-70">&gt;</span>
                                <span>Funding Requests</span>
                            </>
                        }
                    >
                        <button className="bg-white bg-opacity-10 hover:bg-opacity-20 backdrop-blur-md text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all border border-white/20 shadow-sm">
                            <FaPlus /> New Request
                        </button>
                    </DashboardHeader>

                    <div className="px-4 md:px-8 -mt-10 pb-12 w-full">

                        {/* Stats Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                                <div>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Requested</p>
                                    <h3 className="text-2xl font-bold text-slate-800 mt-1">₹{totalAmount.toLocaleString()}</h3>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                                    <FaMoneyBillWave size={20} />
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                                <div>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Pending Action</p>
                                    <h3 className="text-2xl font-bold text-amber-600 mt-1">{pendingCount} Requests</h3>
                                </div>
                                <div className="p-3 bg-amber-50 rounded-full text-amber-600">
                                    <FaEllipsisV size={20} />
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                                <div>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Approved</p>
                                    <h3 className="text-2xl font-bold text-green-600 mt-1">{approvedCount} Requests</h3>
                                </div>
                                <div className="p-3 bg-green-50 rounded-full text-green-600">
                                    <FaCheck size={20} />
                                </div>
                            </div>
                        </div>

                        {/* Controls Row */}
                        <div className="bg-white rounded-t-2xl border-b border-slate-100 p-4 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
                            {/* Tabs */}
                            <div className="flex bg-slate-100 p-1 rounded-lg">
                                {['All', 'Pending', 'Approved', 'Rejected'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${activeTab === tab
                                            ? 'bg-white text-blue-700 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            {/* Search */}
                            <div className="relative w-full md:w-64">
                                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                                <input
                                    type="text"
                                    placeholder="Search requests..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-blue-500 transition"
                                />
                            </div>
                        </div>

                        {/* Table */}
                        <div className="bg-white rounded-b-2xl shadow-sm border-x border-b border-slate-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50/50">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">ID</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Applicant</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Category</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Amount</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {filteredRequests.map(req => (
                                            <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                                                <td className="px-6 py-4 text-xs font-mono text-slate-500">{req.id}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold border border-blue-200">
                                                            {req.avatar}
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-bold text-slate-700">{req.applicant}</div>
                                                            <div className="text-xs text-slate-400">{req.village}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        {getCategoryIcon(req.category)}
                                                        <span className="text-sm text-slate-600 font-medium">{req.category}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-bold text-slate-800">₹{req.amount.toLocaleString()}</div>
                                                    <div className="text-[10px] text-slate-400 max-w-[150px] truncate" title={req.purpose}>{req.purpose}</div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-500">
                                                    {new Date(req.date).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {getStatusBadge(req.status)}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="View Details">
                                                            <FaEye />
                                                        </button>
                                                        {req.status === 'Pending' && (
                                                            <>
                                                                <button className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition" title="Approve">
                                                                    <FaCheck />
                                                                </button>
                                                                <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Reject">
                                                                    <FaTimes />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {filteredRequests.length === 0 && (
                                    <div className="p-12 text-center text-slate-400">
                                        No requests found matching your filters.
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
};

export default FundingRequests;
