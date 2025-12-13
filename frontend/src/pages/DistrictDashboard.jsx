import React, { useState, useEffect } from 'react';
import API from '../api';
import { Link } from 'react-router-dom';
import {
    FaThLarge, FaUsers, FaBuilding, FaExclamationTriangle, FaFileAlt,
    FaHandHoldingUsd, FaChartLine, FaCog, FaQuestionCircle, FaBullhorn,
    FaSignOutAlt, FaSearch, FaBell, FaChevronDown, FaMapMarkedAlt, FaPlus,
    FaCheckCircle, FaClock, FaShieldAlt
} from 'react-icons/fa';

// Reusable Components (Local to keep file self-contained for now)
const StatCard = ({ title, value, subtext, subColor, icon: Icon, iconBg, statusColor }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-lg ${iconBg} text-white`}>
                <Icon size={18} />
            </div>
            <div className={`w-2 h-2 rounded-full ${statusColor}`}></div>
        </div>
        <div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
            <p className="text-sm font-medium text-gray-500 mb-2">{title}</p>
            <p className={`text-xs font-bold ${subColor}`}>{subtext}</p>
        </div>
    </div>
);

const ActionCard = ({ title, desc, icon: Icon, bgClass, iconColor, to }) => (
    <Link to={to || '#'} className={`p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all cursor-pointer group ${bgClass || 'bg-white'}`}>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center shadow-sm ${iconColor || 'bg-blue-100 text-blue-600'}`}>
            <Icon size={20} />
        </div>
        <div>
            <h3 className="text-base font-bold text-gray-900 leading-tight">{title}</h3>
            <p className="text-xs text-gray-500 mt-1">{desc}</p>
        </div>
    </Link>
);

const SidebarItem = ({ icon: Icon, label, active, to }) => (
    <Link to={to || '#'} className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors mb-1 ${active ? 'bg-[#1e2a4a] text-white font-bold' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 font-medium'}`}>
        <Icon size={18} className={active ? 'text-white' : 'text-gray-400'} />
        <span className="text-sm">{label}</span>
    </Link>
);

const SimpleBarChart = () => {
    // Mock Data for "New Registrations (Last 7 Days)"
    const data = [
        { day: 'Mon', val: 45 },
        { day: 'Tue', val: 38 },
        { day: 'Wed', val: 52 },
        { day: 'Thu', val: 61 },
        { day: 'Fri', val: 48 },
        { day: 'Sat', val: 39 },
        { day: 'Sun', val: 42 },
    ];
    const max = 70;

    return (
        <div className="flex items-end justify-between h-48 gap-2 pt-4">
            {data.map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
                    <div className="w-full bg-blue-50 rounded-t-lg relative h-full flex items-end overflow-hidden">
                        <div
                            style={{ height: `${(d.val / max) * 100}%` }}
                            className="w-full bg-[#1e2a4a] rounded-t-md group-hover:bg-blue-600 transition-all duration-500"
                        ></div>
                        {/* Tooltip */}
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            {d.val}
                        </div>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">{d.day}</span>
                </div>
            ))}
        </div>
    );
};

const DistrictDashboard = () => {
    const [stats, setStats] = useState({
        locationName: 'District',
        members: 0,
        pendingMembers: 0,
        institutions: 0,
        sos: 0,
        mandals: []
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await API.get('/admin/dashboard-stats');
                setStats({
                    locationName: data.locationName || 'District',
                    members: data.members,
                    pendingMembers: data.pendingMembers,
                    institutions: data.institutions,
                    sos: data.sosAlerts,
                    mandals: data.mandals || []
                });
            } catch (error) {
                console.error("Error fetching dashboard stats", error);
            }
        };
        fetchStats();
    }, []);

    // Calculate total villages covered (mock or derive from mandals)
    const totalVillages = stats.mandals.length * 12; // Approximation: 12 villages per mandal on average? Or just fetch real village count later.
    // For now, let's just use a static mock or derived number if backend sent it. Backend didn't send 'totalVillages', so we'll mock or sum.

    return (
        <div className="min-h-screen bg-[#f3f4f6] font-sans flex flex-col">
            {/* Top Header - Same as AdminDashboard but customized */}
            <header className="bg-[#0f172a] text-white h-16 flex items-center justify-between px-4 z-20 shadow-md">
                <div className="flex items-center gap-12">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-500/50">
                            <FaShieldAlt className="text-blue-400" />
                        </div>
                        <div>
                            <div className="font-bold text-lg leading-none">MEWS 2.0</div>
                            <div className="text-[10px] text-gray-400 leading-none mt-1">District Admin Portal</div>
                        </div>
                    </div>
                    <div className="relative hidden md:block w-96">
                        <FaSearch className="absolute left-3 top-2.5 text-gray-400 text-sm" />
                        <input
                            type="text"
                            placeholder="Search institutions, members, activities..."
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-9 pr-4 text-sm text-gray-300 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="px-3 py-1 bg-amber-500 text-slate-900 rounded font-bold text-xs flex items-center gap-2">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                        {stats.locationName}
                    </div>
                    {/* ... other header items ... */}
                    <div className="flex items-center gap-2 pl-4 border-l border-slate-700 cursor-pointer">
                        <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Admin" className="w-8 h-8 rounded-full border border-slate-500" />
                        <FaChevronDown size={10} className="text-gray-400" />
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col overflow-y-auto">
                    <div className="p-4 space-y-1">
                        <SidebarItem to="/admin/dashboard" icon={FaThLarge} label="District Dashboard" active={true} />
                        <SidebarItem to="/admin/members" icon={FaUsers} label="Member Management" />
                        <SidebarItem to="/admin/institutions" icon={FaBuilding} label="Institution Management" />
                        <SidebarItem to="/admin/sos" icon={FaExclamationTriangle} label="SOS Management" />
                        <SidebarItem to="/admin/funding" icon={FaHandHoldingUsd} label="Funding Requests" />
                        <SidebarItem to="/admin/reports" icon={FaFileAlt} label="Reports & Analytics" />
                    </div>
                    <div className="mt-auto p-4 border-t border-gray-100">
                        <Link to="/admin/login" className="flex items-center gap-3 px-4 py-2 text-red-600 cursor-pointer hover:bg-red-50 rounded-lg transition-colors font-medium text-sm">
                            <FaSignOutAlt />
                            <span>Logout</span>
                        </Link>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{stats.locationName} District Dashboard</h1>
                            <p className="text-sm text-gray-500 mt-1">Manage district operations and monitor activities | Last updated: Today, 14:30 IST</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-2 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100 flex items-center gap-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div> {stats.sos} Active SOS
                            </span>
                            <button className="bg-[#1e2a4a] hover:bg-[#2a3b66] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition">
                                <FaBullhorn size={12} /> Quick Broadcast
                            </button>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard
                            title="Total Registered Members"
                            value={stats.members.toLocaleString()}
                            subtext={`+${stats.pendingMembers} today`}
                            subColor="text-green-600"
                            icon={FaUsers}
                            iconBg="bg-[#1e2a4a]"
                            statusColor="bg-green-500"
                        />
                        <StatCard
                            title="Total Mandals Covered"
                            value={stats.mandals.length}
                            subtext="100% coverage"
                            subColor="text-green-600"
                            icon={FaMapMarkedAlt}
                            iconBg="bg-[#1e2a4a]"
                            statusColor="bg-green-500"
                        />
                        <StatCard
                            title="Verified Institutions"
                            value={stats.institutions.toLocaleString()}
                            subtext="+3 this week"
                            subColor="text-green-600"
                            icon={FaBuilding}
                            iconBg="bg-[#1e2a4a]"
                            statusColor="bg-green-500"
                        />
                        <StatCard
                            title="Active SOS Right Now"
                            value={stats.sos}
                            subtext="Requires attention"
                            subColor="text-red-500"
                            icon={FaExclamationTriangle}
                            iconBg="bg-red-500"
                            statusColor="bg-red-500"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                        {/* Chart Section */}
                        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">New Registrations (Last 7 Days)</h3>
                            <SimpleBarChart />
                        </div>

                        {/* Quick Actions */}
                        <div className="flex flex-col gap-4">
                            <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
                            <ActionCard
                                title="View Live SOS"
                                desc="Monitor active emergencies"
                                icon={FaExclamationTriangle}
                                iconColor="bg-red-100 text-red-500"
                                bgClass="bg-red-50 border-red-100"
                            />
                            <ActionCard
                                title="Open Institution Map"
                                desc="View district-wide institutions"
                                icon={FaMapMarkedAlt}
                                iconColor="bg-[#1e2a4a] text-white"
                                bgClass="bg-gray-50 border-gray-200"
                            />
                            <ActionCard
                                title="Raise Funding Request"
                                desc="Submit new funding proposal"
                                icon={FaHandHoldingUsd}
                                iconColor="bg-[#1e2a4a] text-white"
                                bgClass="bg-gray-50 border-gray-200"
                            />
                        </div>
                    </div>

                    {/* Mandal Breakdown Table */}
                    {stats.mandals && stats.mandals.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">District Overview (Mandal Wise)</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Mandal Name</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Total Members</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Institutions</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.mandals.map((mandal) => (
                                            <tr key={mandal.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 font-bold text-gray-800">{mandal.name}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600 font-bold">{mandal.members}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{mandal.institutions}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${mandal.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {mandal.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default DistrictDashboard;
