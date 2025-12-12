import React from 'react';
import { Link } from 'react-router-dom';
import {
    FaThLarge, FaUsers, FaBuilding, FaExclamationTriangle, FaFileAlt,
    FaHandHoldingUsd, FaChartLine, FaCog, FaQuestionCircle, FaBullhorn,
    FaSignOutAlt, FaSearch, FaBell, FaChevronDown, FaShieldAlt,
    FaSync, FaPhoneAlt, FaCheckCircle, FaMapMarkerAlt, FaExternalLinkAlt, FaArrowRight
} from 'react-icons/fa';

// Reusing Sidebar from other admin pages for consistency
const SidebarItem = ({ icon: Icon, label, active, to }) => (
    <Link to={to || '#'} className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors mb-1 ${active ? 'bg-[#1e2a4a] text-white font-bold' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 font-medium'}`}>
        <Icon size={18} className={active ? 'text-white' : 'text-gray-400'} />
        <span className="text-sm">{label}</span>
    </Link>
);

const SOSCard = ({ id, name, memberId, age, gender, photo, type, time, location, description, isResolved }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4 flex flex-col lg:flex-row gap-6 hover:shadow-md transition-shadow relative overflow-hidden ${!isResolved ? 'border-l-4 border-l-red-500' : ''}`}>

        {/* Left Indicator for Active Emergency */}
        {!isResolved && (
            <div className="absolute top-0 left-0 bottom-0 w-1 bg-red-500"></div>
        )}

        <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-2 px-2 py-1 bg-red-50 text-red-600 text-[10px] font-bold uppercase rounded border border-red-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></div>
                        Active Emergency
                    </span>
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-[10px] font-bold rounded">
                        {type}
                    </span>
                </div>
                <span className="text-xs font-bold text-red-500">{time}</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <img src={photo} alt={name} className="w-16 h-16 rounded-full object-cover border-2 border-gray-100" />
                <div>
                    <h3 className="font-bold text-lg text-gray-900 leading-tight">{name}</h3>
                    <div className="text-xs text-gray-500 mt-1">
                        Member ID: <span className="font-medium">{memberId}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                        Age: {age} | {gender}
                    </div>
                </div>

                <div className="hidden sm:block w-px bg-gray-200 mx-2"></div>

                <div className="flex-1">
                    <div className="flex items-start gap-2 mb-2">
                        <FaMapMarkerAlt className="text-red-500 mt-0.5 flex-shrink-0" size={12} />
                        <div>
                            <div className="text-sm font-bold text-gray-800 leading-tight">{location.address}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{description}</div>
                        </div>
                    </div>
                    <a href="#" className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:underline ml-5">
                        View Map Location <FaExternalLinkAlt size={8} />
                    </a>
                </div>
            </div>
        </div>

        <div className="flex flex-row lg:flex-col justify-center gap-3 lg:w-48 lg:border-l lg:border-gray-100 lg:pl-6">
            <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition">
                <FaPhoneAlt /> Call Member
            </button>
            <button className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 py-2.5 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition">
                <FaCheckCircle className="text-gray-400" /> Mark Resolved
            </button>
            <button className="flex-1 bg-white border border-orange-200 text-orange-600 hover:bg-orange-50 py-2.5 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition">
                <FaArrowRight /> Escalate to Mandal
            </button>
        </div>

    </div>
);

import sosWoman from '../assets/sos_woman.jpg';
import sosMan from '../assets/sos_man.jpg';

const SOSManagement = () => {

    const sosAlerts = [
        {
            id: 1,
            name: "Lakshmi Devi",
            memberId: "MEW-2847",
            age: 67,
            gender: "Female",
            photo: sosWoman,
            type: "Medical Emergency",
            time: "12 minutes ago",
            location: {
                address: "Sector 3, House No. 45B",
                lat: 17.3850,
                lng: 78.4867
            },
            description: "Emergency detected via wearable device - Fall detection triggered",
            isResolved: false
        },
        {
            id: 2,
            name: "Ravi Kumar",
            memberId: "MEW-1523",
            age: 32,
            gender: "Male",
            photo: sosMan,
            type: "Security Threat",
            time: "8 minutes ago",
            location: {
                address: "Market Area, Shop No. 23",
                lat: 17.3850,
                lng: 78.4867
            },
            description: "Manual SOS activated - Reporting suspicious activity near premises",
            isResolved: false
        }
    ];

    return (
        <div className="min-h-screen bg-[#f3f4f6] font-sans flex flex-col">
            {/* Top Header */}
            <header className="bg-[#0f172a] text-white h-16 flex items-center justify-between px-4 z-20 shadow-md flex-shrink-0">
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
                    {/* Search bar removed for focus on SOS */}
                </div>

                <div className="flex items-center gap-6">
                    <button className="hidden sm:flex items-center gap-2 bg-[#f59e0b] hover:bg-amber-600 text-slate-900 px-3 py-1.5 rounded text-xs font-bold transition animate-pulse">
                        <FaExclamationTriangle /> Live SOS: 2
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
                        <SidebarItem to="/admin/dashboard" icon={FaThLarge} label="Village Dashboard" />
                        <SidebarItem to="/admin/members" icon={FaUsers} label="Member Management" />
                        <SidebarItem to="/admin/institutions" icon={FaBuilding} label="Institution Management" />
                        <SidebarItem to="/admin/sos" icon={FaExclamationTriangle} label="SOS Management" active={true} />
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
                <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#f8fafc]">

                    {/* Header Panel */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">SOS Emergency Panel</h1>
                            <p className="text-sm text-gray-500 mt-1">Live monitoring of emergency alerts | Auto-refresh every 5 seconds</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-sm font-bold text-red-600 animate-pulse">
                                <div className="w-2 h-2 rounded-full bg-red-600"></div>
                                2 Live Alerts
                            </div>
                            <button className="bg-[#1e2a4a] hover:bg-[#2a3b66] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition">
                                <FaSync size={12} /> Manual Refresh
                            </button>
                        </div>
                    </div>

                    {/* Alerts List */}
                    <div className="space-y-4 mb-8">
                        {sosAlerts.map(alert => (
                            <SOSCard key={alert.id} {...alert} />
                        ))}
                    </div>

                    {/* All Clear Status */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                            <FaCheckCircle className="text-green-500 text-3xl" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">All Other Areas Clear</h3>
                        <p className="text-sm text-gray-500">No additional emergency alerts at this time. System monitoring continues.</p>
                    </div>

                </main>
            </div>
        </div>
    );
};

export default SOSManagement;
