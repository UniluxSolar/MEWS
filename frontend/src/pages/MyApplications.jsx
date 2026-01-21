import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import { FaPlus, FaDownload, FaFilter, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaClock, FaEye, FaUniversity, FaHeartbeat, FaBalanceScale, FaRunning, FaSearch, FaChevronDown, FaArrowLeft } from 'react-icons/fa';

const StatCard = ({ icon: Icon, value, label, subtext, color, iconBg }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-full">
        <div className={`w-10 h-10 rounded-lg ${iconBg} ${color} flex items-center justify-center mb-4`}>
            <Icon size={18} />
        </div>
        <div>
            <div className="text-3xl font-bold text-gray-800 mb-1">{value}</div>
            <div className="text-sm font-semibold text-gray-600">{label}</div>
            {subtext && <div className="text-xs text-gray-400 mt-1">{subtext}</div>}
        </div>
    </div>
);

const StatusBadge = ({ status }) => {
    const styles = {
        'Submitted': 'bg-pink-100 text-pink-700',
        'Under Review': 'bg-yellow-100 text-yellow-700',
        'Approved': 'bg-green-100 text-green-700',
        'Disbursed': 'bg-blue-100 text-blue-700',
        'Rejected': 'bg-red-100 text-red-700'
    };
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
            {status}
        </span>
    );
};

const TypeIcon = ({ type }) => {
    const safeType = type || '';
    if (safeType.includes('Education')) return <FaUniversity className="text-blue-500" />;
    if (safeType.includes('Health') || safeType.includes('Medical')) return <FaHeartbeat className="text-red-500" />;
    if (safeType.includes('Legal')) return <FaBalanceScale className="text-purple-500" />;
    return <FaRunning className="text-orange-500" />;
}

const MyApplications = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [filteredApplications, setFilteredApplications] = useState([]);

    const [stats, setStats] = useState({
        activeApplications: 0,
        approvedApplications: 0,
        totalAmountDisbursed: 0,
        pendingReviews: 0,
        applications: [], // Replaces the hardcoded list
        totalApplications: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Initial Load - Fetch Stats & Applications
    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Token is handled via cookie now
                const response = await API.get('/members/stats');

                if (response.data) {
                    const data = response.data;
                    setStats(data);
                    setFilteredApplications(data.applications); // Initialize filtered list
                } else {
                    console.error("Failed to fetch stats");
                }
            } catch (error) {
                console.error("Error fetching request stats:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    // Filter Logic
    useEffect(() => {
        // Use stats.applications as the source of truth
        let result = stats.applications || [];

        // Search Filter
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(app =>
                (app.mewsId || app._id || '').toLowerCase().includes(lowerQuery) ||
                (app.purpose || app.type || '').toLowerCase().includes(lowerQuery) ||
                (app.eventDate || app.createdAt || '').toString().toLowerCase().includes(lowerQuery)
            );
        }

        // Type Filter
        if (typeFilter !== 'All') {
            result = result.filter(app => {
                const appType = app.purpose || app.type;
                // Simple partial match for filter
                if (typeFilter === 'Education') return appType && appType.includes('Education');
                if (typeFilter === 'Sports') return appType && appType.includes('Sports');
                return appType === typeFilter;
            });
        }

        // Status Filter
        if (statusFilter !== 'All') {
            result = result.filter(app => app.status === statusFilter); // Backend uses UPPERCASE status
        }

        setFilteredApplications(result);
        setCurrentPage(1); // Reset to first page on filter change
    }, [searchQuery, typeFilter, statusFilter, stats.applications]);

    // Pagination Calculations
    const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentApplications = filteredApplications.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const clearFilters = () => {
        setSearchQuery('');
        setTypeFilter('All');
        setStatusFilter('All');
    };

    // Helper for formatting currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    return (
        <div className="w-full">
            {/* Back Button */}
            <div className="mb-4">
                <Link to="/dashboard" className="text-secondary hover:text-amber-600 flex items-center gap-2 text-sm font-bold transition-all w-fit">
                    <FaArrowLeft size={12} /> Back to Dashboard
                </Link>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-primary">Funding Request</h1>
                    <p className="text-gray-500 text-sm">{stats.totalApplications} Applications found</p>
                </div>
                <Link to="/dashboard/applications/new" className="bg-primary text-white text-sm font-bold px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-[#151f38] transition shadow-md">
                    <FaPlus size={12} /> New Application
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard icon={FaClock} value={stats.activeApplications} label="Active Applications" color="text-blue-500" iconBg="bg-blue-50" />
                <StatCard icon={FaCheckCircle} value={stats.approvedApplications} label="Approved Applications" color="text-green-500" iconBg="bg-green-50" />
                <StatCard icon={FaUniversity} value={formatCurrency(stats.totalAmountDisbursed)} label="Total Amount Disbursed" color="text-primary" iconBg="bg-gray-100" />
                <StatCard icon={FaEye} value={stats.pendingReviews} label="Pending Reviews" color="text-secondary" iconBg="bg-amber-50" />
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Filters */}
                <div className="p-5 border-b border-gray-100 flex flex-col lg:flex-row gap-4 justify-between items-center bg-gray-50/50">
                    <div className="relative w-full lg:w-96">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <FaSearch />
                        </span>
                        <input
                            type="text"
                            placeholder="Search by Type, Status, or Date..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border border-gray-300 text-sm rounded-lg py-2.5 pl-10 pr-4 text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                        <div className="relative">
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="appearance-none bg-white border border-gray-300 text-gray-700 text-sm rounded-lg py-2.5 pl-4 pr-10 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                            >
                                <option value="All">All Types</option>
                                <option value="Education">Education</option>
                                <option value="Health">Health</option>
                                <option value="Legal">Legal</option>
                                <option value="Sports">Sports</option>
                            </select>
                            <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                                <FaChevronDown size={10} />
                            </span>
                        </div>

                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="appearance-none bg-white border border-gray-300 text-gray-700 text-sm rounded-lg py-2.5 pl-4 pr-10 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                            >
                                <option value="All">Status: All</option>
                                <option value="Submitted">Submitted</option>
                                <option value="Under Review">Under Review</option>
                                <option value="Approved">Approved</option>
                                <option value="Disbursed">Disbursed</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                            <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                                <FaChevronDown size={10} />
                            </span>
                        </div>

                        <button className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-gray-50 transition">
                            <FaCalendarAlt className="text-gray-400" /> Date Range
                        </button>

                        <button
                            onClick={clearFilters}
                            className="text-secondary text-sm font-bold hover:underline px-2"
                        >
                            Clear Filters
                        </button>

                        <button className="ml-auto lg:ml-4 flex items-center gap-2 bg-white border border-gray-300 text-primary text-sm font-bold px-4 py-2.5 rounded-lg hover:bg-gray-50 transition">
                            <FaDownload /> Export
                        </button>
                    </div>
                </div>

                {/* Filter Tags */}
                {(typeFilter !== 'All' || statusFilter !== 'All' || searchQuery) && (
                    <div className="px-5 py-3 border-b border-gray-100 flex gap-2 flex-wrap">
                        {typeFilter !== 'All' && (
                            <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-2">
                                {typeFilter} <FaTimesCircle className="cursor-pointer hover:text-blue-900" onClick={() => setTypeFilter('All')} />
                            </span>
                        )}
                        {statusFilter !== 'All' && (
                            <span className="bg-amber-50 text-amber-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-2">
                                {statusFilter} <FaTimesCircle className="cursor-pointer hover:text-amber-900" onClick={() => setStatusFilter('All')} />
                            </span>
                        )}
                        {searchQuery && (
                            <span className="bg-gray-100 text-gray-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-2">
                                Search: {searchQuery} <FaTimesCircle className="cursor-pointer hover:text-gray-900" onClick={() => setSearchQuery('')} />
                            </span>
                        )}
                    </div>
                )}

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wide text-gray-500">
                                <th className="p-5 font-semibold">Type</th>
                                <th className="p-5 font-semibold">Applied Date</th>
                                <th className="p-5 font-semibold">Status</th>
                                <th className="p-5 font-semibold">Amount Requested</th>
                                <th className="p-5 font-semibold text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {currentApplications.length > 0 ? (
                                currentApplications.map((app) => (
                                    <tr key={app._id || app.id} className="hover:bg-gray-50/50 transition duration-150">
                                        {/* Removed Application ID column */}
                                        <td className="p-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                                                    <TypeIcon type={app.purpose || app.type} />
                                                </div>
                                                <span className="text-sm font-medium text-gray-700">{app.purpose || app.type}</span>
                                            </div>
                                        </td>
                                        <td className="p-5 text-sm text-gray-600">
                                            {new Date(app.createdAt || app.date).toLocaleDateString()}
                                        </td>
                                        <td className="p-5"><StatusBadge status={app.status} /></td>
                                        <td className="p-5 text-sm font-bold text-gray-800">{formatCurrency(app.amountRequired || app.amount)}</td>
                                        <td className="p-5 text-right">
                                            <Link to={`/dashboard/applications/${app._id || app.id}`} className="text-secondary hover:text-amber-600 text-xs font-bold uppercase tracking-wide">
                                                View Details
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="p-10 text-center text-gray-500 text-sm">
                                        No applications match your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-5 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                    <span>
                        Showing {filteredApplications.length > 0 ? indexOfFirstItem + 1 : 0} to {Math.min(indexOfLastItem, filteredApplications.length)} of {filteredApplications.length} applications
                    </span>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`px-3 py-1 border border-gray-200 rounded transition ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                        >
                            Previous
                        </button>

                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => paginate(i + 1)}
                                className={`px-3 py-1 rounded transition ${currentPage === i + 1 ? 'bg-primary text-white' : 'border border-gray-200 hover:bg-gray-50'}`}
                            >
                                {i + 1}
                            </button>
                        ))}

                        <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className={`px-3 py-1 border border-gray-200 rounded transition ${currentPage === totalPages || totalPages === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyApplications;
