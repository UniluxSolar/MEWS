import React from 'react';
import { Link } from 'react-router-dom';
import {
    FaThLarge, FaUsers, FaBuilding, FaExclamationTriangle, FaFileAlt,
    FaHandHoldingUsd, FaChartLine, FaCog, FaQuestionCircle, FaBullhorn,
    FaSignOutAlt, FaSearch, FaBell, FaChevronDown, FaUserPlus, FaPlus,
    FaShieldAlt, FaCheckCircle, FaClock
} from 'react-icons/fa';

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

const ActionCard = ({ title, desc, icon: Icon, to }) => (
    <Link to={to || '#'} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center hover:shadow-md transition-all cursor-pointer group h-full">
        <div className="w-16 h-16 bg-[#1e2a4a] text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
            <Icon size={24} />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500">{desc}</p>
    </Link>
);

const SidebarItem = ({ icon: Icon, label, active, to }) => (
    <Link to={to || '#'} className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors mb-1 ${active ? 'bg-[#1e2a4a] text-white font-bold' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 font-medium'}`}>
        <Icon size={18} className={active ? 'text-white' : 'text-gray-400'} />
        <span className="text-sm">{label}</span>
    </Link>
);

const AdminDashboard = () => {
    return (
        <div className="min-h-screen bg-[#f3f4f6] font-sans flex flex-col">
            {/* Top Header */}
            <header className="bg-[#0f172a] text-white h-16 flex items-center justify-between px-4 z-20 shadow-md">
                <div className="flex items-center gap-12">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-500/50">
                            <FaShieldAlt className="text-blue-400" />
                        </div>
                        <div>
                            <div className="font-bold text-lg leading-none">MEWS 2.0</div>
                            <div className="text-[10px] text-gray-400 leading-none mt-1">Peddakaparthy Village Admin</div>
                        </div>
                    </div>
                    <div className="relative hidden md:block w-96">
                        <FaSearch className="absolute left-3 top-2.5 text-gray-400 text-sm" />
                        <input
                            type="text"
                            placeholder="Search members, activities..."
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-9 pr-4 text-sm text-gray-300 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <button className="hidden sm:flex items-center gap-2 bg-[#f59e0b] hover:bg-amber-600 text-slate-900 px-3 py-1.5 rounded text-xs font-bold transition">
                        <FaExclamationTriangle /> Live SOS: 0
                    </button>
                    <div className="relative cursor-pointer">
                        <FaBell className="text-gray-400 hover:text-white transition" />
                        <span className="absolute -top-1.5 -right-1.5 bg-[#f59e0b] text-slate-900 w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold">2</span>
                    </div>
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
                        <SidebarItem to="/admin/dashboard" icon={FaThLarge} label="Village Dashboard" active={true} />
                        <SidebarItem to="/admin/members" icon={FaUsers} label="Member Management" />
                        <SidebarItem to="/admin/institutions" icon={FaBuilding} label="Institution Management" />
                        <SidebarItem to="/admin/sos" icon={FaExclamationTriangle} label="SOS Management" />
                        <SidebarItem icon={FaFileAlt} label="Reports & Analytics" />
                        <SidebarItem icon={FaHandHoldingUsd} label="Funding Requests" />
                        <SidebarItem icon={FaChartLine} label="Activity Logs" />
                        <SidebarItem icon={FaCog} label="Village Settings" />
                        <SidebarItem icon={FaQuestionCircle} label="Help & Support" />
                        <SidebarItem icon={FaBullhorn} label="Announcements" />
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
                    {/* Page Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Peddakaparthy Village Dashboard</h1>
                            <p className="text-sm text-gray-500 mt-1">Manage village operations and monitor activities | Last updated: Today, 14:30 IST</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-2 bg-amber-50 text-amber-700 text-xs font-bold rounded-lg border border-amber-100 flex items-center gap-2">
                                <div className="w-2 h-2 bg-amber-500 rounded-full"></div> 0 Live SOS
                            </span>
                            <button className="bg-[#1e2a4a] hover:bg-[#2a3b66] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition">
                                <FaBullhorn size={12} /> Village Broadcast
                            </button>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard
                            title="Total Members"
                            value="2,847"
                            subtext="+14 today"
                            subColor="text-green-600"
                            icon={FaUsers}
                            iconBg="bg-[#1e2a4a]"
                            statusColor="bg-green-500"
                        />
                        <StatCard
                            title="Total Institutions"
                            value="9"
                            subtext="All verified"
                            subColor="text-green-600"
                            icon={FaBuilding}
                            iconBg="bg-[#1e2a4a]"
                            statusColor="bg-green-500"
                        />
                        <StatCard
                            title="Today's Registrations"
                            value="14"
                            subtext="Active today"
                            subColor="text-blue-600"
                            icon={FaUserPlus}
                            iconBg="bg-blue-600"
                            statusColor="bg-blue-500"
                        />
                        <StatCard
                            title="Live SOS Alerts"
                            value="0"
                            subtext="All clear"
                            subColor="text-gray-500"
                            icon={FaExclamationTriangle}
                            iconBg="bg-gray-400"
                            statusColor="bg-gray-400"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Quick Actions */}
                        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ActionCard
                                title="Add New Member"
                                desc="Register new village member"
                                icon={FaUserPlus}
                                to="/admin/members/new"
                            />
                            <ActionCard
                                title="Add Institution"
                                desc="Register new institution"
                                icon={FaBuilding}
                                to="/admin/institutions/new"
                            />
                        </div>

                        {/* Live SOS Monitor */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-gray-900">Live SOS Monitor</h3>
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            </div>

                            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                                    <FaCheckCircle className="text-green-500 text-2xl" />
                                </div>
                                <h4 className="text-lg font-bold text-green-600 mb-1">All Clear</h4>
                                <p className="text-xs text-gray-500 max-w-[200px]">No active SOS alerts in Peddakaparthy village</p>
                            </div>

                            <button className="w-full py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-lg text-sm transition mt-auto flex items-center justify-center gap-2">
                                <FaClock /> View SOS History
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
