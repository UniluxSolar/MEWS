import React, { useState, useEffect } from 'react';
import API from '../api';
import { Link, useNavigate } from 'react-router-dom';
import {
    FaThLarge, FaUsers, FaBuilding, FaExclamationTriangle, FaFileAlt,
    FaHandHoldingUsd, FaChartLine, FaCog, FaQuestionCircle, FaBullhorn,
    FaSignOutAlt, FaSearch, FaBell, FaChevronDown, FaShieldAlt,
    FaMapMarkerAlt, FaBriefcaseMedical, FaGraduationCap, FaArrowRight, FaClock
} from 'react-icons/fa';

// Sidebar Components
const SidebarItem = ({ icon: Icon, label, active, to }) => (
    <Link to={to || '#'} className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors mb-1 ${active ? 'bg-[#1e2a4a] text-white font-bold' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 font-medium'}`}>
        <Icon size={18} className={active ? 'text-white' : 'text-gray-400'} />
        <span className="text-sm">{label}</span>
    </Link>
);

const QuickActionCard = ({ icon: Icon, title, subtext, color, onClick }) => (
    <div onClick={onClick} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition cursor-pointer flex items-center gap-4 mb-4">
        <div className={`w-10 h-10 rounded-lg ${color} text-white flex items-center justify-center shrink-0`}>
            <Icon size={18} />
        </div>
        <div>
            <h4 className="font-bold text-gray-900 text-sm">{title}</h4>
            <p className="text-xs text-gray-500">{subtext}</p>
        </div>
    </div>
);

const ModernStatCard = ({ title, value, subtext, icon: Icon, iconBg, statusColor, trend }) => (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden">
        <div className="flex justify-between items-start">
            <div className={`p-2 rounded-lg ${iconBg} text-white`}>
                <Icon size={16} />
            </div>
            <div className={`w-2 h-2 rounded-full ${statusColor}`}></div>
        </div>
        <div>
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            <p className="text-sm text-gray-500">{title}</p>
            <p className={`text-xs font-bold mt-1 ${trend.includes('+') ? 'text-green-600' : trend === 'Needs review' || trend === 'Requires attention' ? 'text-red-500' : 'text-gray-500'}`}>{trend}</p>
        </div>
    </div>
);

const VillagePerformanceCard = ({ name, members, institutions, status }) => (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition relative overflow-hidden group">
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <div className="flex justify-between items-start mb-3">
            <h3 className="font-bold text-gray-900 text-lg">{name}</h3>
            <div className={`w-2 h-2 rounded-full ${status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
        </div>
        <div className="space-y-2">
            <div className="flex justify-between text-sm">
                <span className="text-gray-500">Members</span>
                <span className="font-bold text-gray-900">{members.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
                <span className="text-gray-500">Institutions</span>
                <span className="font-bold text-gray-900">{institutions}</span>
            </div>
            <div className="flex justify-between text-sm">
                <span className="text-gray-500">Status</span>
                <span className={`font-bold text-xs uppercase ${status === 'Active' ? 'text-green-600' : 'text-red-600'}`}>{status}</span>
            </div>
        </div>
    </div>
);

const MandalDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        locationName: 'Mandal',
        members: 0,
        institutions: 0,
        sos: 0,
        villages: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await API.get('/admin/dashboard-stats');
                setStats({
                    locationName: data.locationName,
                    members: data.members,
                    institutions: data.institutions || 0,
                    sos: data.sosAlerts || 0,
                    villages: data.villages || []
                });
            } catch (error) {
                console.error("Error fetching mandal stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('adminInfo');
        navigate('/admin/login');
    };

    return (
        <div className="min-h-screen bg-[#f8f9fa] font-sans">
            {/* Top Navbar */}
            <nav className="bg-[#0f172a] text-white h-16 flex items-center justify-between px-6 sticky top-0 z-50 shadow-md">
                <div className="flex items-center gap-12">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center border border-white/20">
                            <FaShieldAlt className="text-blue-400" size={18} />
                        </div>
                        <div>
                            <div className="font-bold text-lg leading-none tracking-tight">MEWS 2.0</div>
                            <div className="text-[10px] text-gray-400 leading-none mt-1 uppercase tracking-wider">Mandal Admin Portal</div>
                        </div>
                    </div>
                    {/* Search Bar */}
                    <div className="relative hidden lg:block w-96">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                        <input
                            type="text"
                            placeholder="Search institutions, members, activities..."
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm text-gray-200 focus:outline-none focus:border-blue-500 focus:bg-slate-800 transition-all placeholder-gray-500"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center gap-3 bg-[#f59e0b] text-slate-900 px-4 py-1.5 rounded-full text-xs font-bold shadow-lg shadow-amber-900/20">
                        <span className="w-2 h-2 bg-slate-900 rounded-full animate-pulse"></span>
                        {stats.locationName} Region
                    </div>
                    <div className="relative cursor-pointer hover:bg-white/10 p-2 rounded-full transition">
                        <FaBell size={18} className="text-gray-300" />
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0f172a]"></span>
                    </div>
                    <div className="flex items-center gap-2 pl-4 border-l border-slate-700 cursor-pointer">
                        <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Admin" className="w-9 h-9 rounded-full border-2 border-slate-600" />
                        <FaChevronDown size={10} className="text-gray-400" />
                    </div>
                </div>
            </nav>

            <div className="flex">
                {/* Sidebar - Simplified for layout */}
                <aside className="w-64 bg-white border-r border-gray-200 hidden xl:block min-h-[calc(100vh-64px)] p-4 space-y-1">
                    <SidebarItem to="/admin/dashboard" icon={FaThLarge} label="Mandal Dashboard" active={true} />
                    <SidebarItem to="/admin/members" icon={FaUsers} label="Member Management" />
                    <SidebarItem to="/admin/institutions" icon={FaBuilding} label="Institution Management" />
                    <SidebarItem to="/admin/sos" icon={FaExclamationTriangle} label="SOS Management" />
                    <SidebarItem to="/admin/funding" icon={FaHandHoldingUsd} label="Funding Requests" />
                    <SidebarItem to="/admin/reports" icon={FaFileAlt} label="Reports & Analytics" />
                    <div className="pt-8 mt-8 border-t border-gray-100">
                        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition w-full text-left">
                            <FaSignOutAlt />
                            <span className="text-sm font-medium">Logout</span>
                        </button>
                    </div>
                </aside>

                <main className="flex-1 p-8 overflow-y-auto h-[calc(100vh-64px)]">
                    {/* Page Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{stats.locationName} Mandal Dashboard</h1>
                            <p className="text-sm text-gray-500 mt-1">Manage mandal operations and monitor village activities | Last updated: Today, 16:15 IST</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="px-4 py-2 bg-red-50 text-red-600 text-sm font-bold rounded-lg border border-red-100 flex items-center gap-2 hover:bg-red-100 transition shadow-sm">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div> {stats.sos} Active SOS
                            </button>
                            <button className="bg-[#1e2a4a] hover:bg-[#2a3b66] text-white px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-900/20 transition">
                                <FaBullhorn size={14} /> Quick Broadcast
                            </button>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                        <ModernStatCard
                            title="Total Registered Members"
                            value={stats.members.toLocaleString()}
                            trend="+18 today"
                            icon={FaUsers}
                            iconBg="bg-[#1e2a4a]"
                            statusColor="bg-green-500"
                        />
                        <ModernStatCard
                            title="Total Institutions"
                            value={stats.institutions.toLocaleString()}
                            trend="Verified"
                            icon={FaBuilding}
                            iconBg="bg-[#1e2a4a]"
                            statusColor="bg-green-500"
                        />
                        <ModernStatCard
                            title="Pending Verifications"
                            value={stats.villages.reduce((acc, v) => acc + (v.pending || 0), 0).toLocaleString()}
                            trend="Needs review"
                            icon={FaClock}
                            iconBg="bg-[#c2410c]"
                            statusColor="bg-orange-500"
                        />
                        <ModernStatCard
                            title="Active SOS Alerts"
                            value={stats.sos}
                            trend="Requires attention"
                            icon={FaExclamationTriangle}
                            iconBg="bg-red-500"
                            statusColor="bg-red-500"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Village Performance Overview (2/3 width) */}
                        <div className="lg:col-span-2">
                            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                Village Performance Overview
                            </h2>
                            {loading ? (
                                <div className="p-12 text-center text-gray-500">Loading villages...</div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {stats.villages.length > 0 ? (
                                        stats.villages.map((village, idx) => (
                                            <VillagePerformanceCard
                                                key={idx}
                                                name={village.name}
                                                members={village.members}
                                                institutions={village.institutions}
                                                status={village.status}
                                            />
                                        ))
                                    ) : (
                                        <div className="col-span-2 text-center py-10 bg-white rounded-xl border border-dashed border-gray-300">
                                            No villages found.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Quick Actions Sidebar (1/3 width) */}
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h2>
                            <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
                                <QuickActionCard
                                    icon={FaExclamationTriangle}
                                    title="View Live SOS"
                                    subtext="Monitor active emergencies"
                                    color="bg-red-500"
                                />
                                <QuickActionCard
                                    icon={FaMapMarkerAlt}
                                    title="Village Map View"
                                    subtext="View mandal-wide villages"
                                    color="bg-[#1e2a4a]"
                                />
                                <QuickActionCard
                                    icon={FaUsers}
                                    title="Bulk Registration"
                                    subtext="Register multiple members"
                                    color="bg-[#1e2a4a]"
                                />
                                <QuickActionCard
                                    icon={FaFileAlt}
                                    title="Generate Report"
                                    subtext="Create mandal activity report"
                                    color="bg-[#1e2a4a]"
                                />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MandalDashboard;
