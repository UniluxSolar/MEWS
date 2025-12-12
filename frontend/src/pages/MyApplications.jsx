import React from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaDownload, FaFilter, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaClock, FaEye, FaUniversity, FaHeartbeat, FaBalanceScale, FaRunning, FaSearch, FaChevronDown } from 'react-icons/fa';

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
    if (type.includes('Education')) return <FaUniversity className="text-blue-500" />;
    if (type.includes('Health')) return <FaHeartbeat className="text-red-500" />;
    if (type.includes('Legal')) return <FaBalanceScale className="text-purple-500" />;
    return <FaRunning className="text-orange-500" />;
}

const MyApplications = () => {
    const applications = [
        { id: 'MEWS-2025-1234', type: 'Education Scholarship', date: '15 Nov 2025', status: 'Submitted', amount: '₹50,000' },
        { id: 'MEWS-2025-0987', type: 'Health Assistance', date: '10 Nov 2025', status: 'Under Review', amount: '₹25,000' },
        { id: 'MEWS-2025-0756', type: 'Legal Aid', date: '05 Nov 2025', status: 'Approved', amount: '₹15,000' },
        { id: 'MEWS-2025-0543', type: 'Sports Coaching', date: '01 Oct 2025', status: 'Disbursed', amount: '₹30,000' },
        { id: 'MEWS-2025-0321', type: 'Education Scholarship', date: '28 Oct 2025', status: 'Rejected', amount: '₹40,000' },
    ];

    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-primary">My Applications</h1>
                    <p className="text-gray-500 text-sm">15 Applications found</p>
                </div>
                <Link to="/dashboard/applications/new" className="bg-primary text-white text-sm font-bold px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-[#151f38] transition shadow-md">
                    <FaPlus size={12} /> New Application
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard icon={FaClock} value="5" label="Active Applications" color="text-blue-500" iconBg="bg-blue-50" />
                <StatCard icon={FaCheckCircle} value="8" label="Approved Applications" color="text-green-500" iconBg="bg-green-50" />
                <StatCard icon={FaUniversity} value="₹2,45,000" label="Total Amount Disbursed" color="text-primary" iconBg="bg-gray-100" />
                <StatCard icon={FaEye} value="2" label="Pending Reviews" color="text-secondary" iconBg="bg-amber-50" />
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
                            placeholder="Search by Application ID, Type, or Date..."
                            className="w-full bg-white border border-gray-300 text-sm rounded-lg py-2.5 pl-10 pr-4 text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                        <div className="relative">
                            <select className="appearance-none bg-white border border-gray-300 text-gray-700 text-sm rounded-lg py-2.5 pl-4 pr-10 focus:outline-none focus:ring-1 focus:ring-primary">
                                <option>All Applications</option>
                                <option>Education</option>
                                <option>Health</option>
                            </select>
                            <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                                <FaChevronDown size={10} />
                            </span>
                        </div>

                        <div className="relative">
                            <select className="appearance-none bg-white border border-gray-300 text-gray-700 text-sm rounded-lg py-2.5 pl-4 pr-10 focus:outline-none focus:ring-1 focus:ring-primary">
                                <option>Status: All</option>
                                <option>Approved</option>
                                <option>Pending</option>
                            </select>
                            <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                                <FaChevronDown size={10} />
                            </span>
                        </div>

                        <button className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-gray-50 transition">
                            <FaCalendarAlt className="text-gray-400" /> Date Range
                        </button>

                        <button className="text-secondary text-sm font-bold hover:underline px-2">
                            Clear Filters
                        </button>

                        <button className="ml-auto lg:ml-4 flex items-center gap-2 bg-white border border-gray-300 text-primary text-sm font-bold px-4 py-2.5 rounded-lg hover:bg-gray-50 transition">
                            <FaDownload /> Export
                        </button>
                    </div>
                </div>

                {/* Filter Tags */}
                <div className="px-5 py-3 border-b border-gray-100 flex gap-2">
                    <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-2">
                        Education <FaTimesCircle className="cursor-pointer hover:text-blue-900" />
                    </span>
                    <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-2">
                        Last 30 days <FaTimesCircle className="cursor-pointer hover:text-blue-900" />
                    </span>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wide text-gray-500">
                                <th className="p-5 font-semibold">Application ID</th>
                                <th className="p-5 font-semibold">Type</th>
                                <th className="p-5 font-semibold">Applied Date</th>
                                <th className="p-5 font-semibold">Status</th>
                                <th className="p-5 font-semibold">Amount Requested</th>
                                <th className="p-5 font-semibold text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {applications.map((app) => (
                                <tr key={app.id} className="hover:bg-gray-50/50 transition duration-150">
                                    <td className="p-5 text-sm font-bold text-primary">{app.id}</td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                                                <TypeIcon type={app.type} />
                                            </div>
                                            <span className="text-sm font-medium text-gray-700">{app.type}</span>
                                        </div>
                                    </td>
                                    <td className="p-5 text-sm text-gray-600">{app.date}</td>
                                    <td className="p-5"><StatusBadge status={app.status} /></td>
                                    <td className="p-5 text-sm font-bold text-gray-800">{app.amount}</td>
                                    <td className="p-5 text-right">
                                        <Link to={`/dashboard/applications/${app.id}`} className="text-secondary hover:text-amber-600 text-xs font-bold uppercase tracking-wide">
                                            View Details
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-5 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                    <span>Showing 1-10 of 15 applications</span>
                    <div className="flex items-center gap-2">
                        <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50">Previous</button>
                        <button className="px-3 py-1 bg-primary text-white rounded">1</button>
                        <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50">2</button>
                        <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyApplications;
