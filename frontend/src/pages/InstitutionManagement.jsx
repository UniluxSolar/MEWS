import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    FaThLarge, FaUsers, FaBuilding, FaExclamationTriangle, FaFileAlt,
    FaHandHoldingUsd, FaChartLine, FaCog, FaQuestionCircle, FaBullhorn,
    FaSignOutAlt, FaSearch, FaBell, FaChevronDown, FaShieldAlt,
    FaPlus, FaDownload, FaSchool, FaHeartbeat, FaLandmark,
    FaHome, FaMoneyBillWave, FaMapMarkerAlt, FaPhoneAlt, FaEye, FaEdit
} from 'react-icons/fa';

// Sidebar Components (Reused for consistency)
const SidebarItem = ({ icon: Icon, label, active, to }) => (
    <Link to={to || '#'} className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors mb-1 ${active ? 'bg-[#1e2a4a] text-white font-bold' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 font-medium'}`}>
        <Icon size={18} className={active ? 'text-white' : 'text-gray-400'} />
        <span className="text-sm">{label}</span>
    </Link>
);

const InstitutionCard = ({ icon: Icon, name, type, status, address, stats, phone, color }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${color} text-white rounded-xl flex items-center justify-center shadow-sm`}>
                    <Icon size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 text-base">{name}</h3>
                    <p className="text-xs text-gray-500">{type}</p>
                </div>
            </div>
            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                <div className={`w-1.5 h-1.5 rounded-full inline-block mr-1 ${status === 'Active' ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                {status}
            </span>
        </div>

        <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3">
                <FaMapMarkerAlt className="text-gray-400 mt-0.5" size={12} />
                <span className="text-xs text-gray-600">{address}</span>
            </div>
            <div className="flex items-start gap-3">
                <FaUsers className="text-gray-400 mt-0.5" size={12} />
                <span className="text-xs text-gray-600">{stats}</span>
            </div>
            <div className="flex items-start gap-3">
                <FaPhoneAlt className="text-gray-400 mt-0.5" size={12} />
                <span className="text-xs text-gray-600">{phone}</span>
            </div>
        </div>

        <div className="flex gap-3">
            <button className="flex-1 bg-[#1e2a4a] text-white text-xs font-bold py-2 rounded-lg hover:bg-[#2a3b66] transition flex items-center justify-center gap-2">
                <FaEye /> View Details
            </button>
            <button className="flex-1 border border-gray-200 text-gray-600 text-xs font-bold py-2 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2">
                <FaEdit /> Edit
            </button>
        </div>
    </div>
);

const InstitutionManagement = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const institutions = [
        {
            id: 1,
            name: "Peddakaparthy Primary School",
            type: "Educational Institution",
            status: "Active",
            address: "School Road, Peddakaparthy",
            stats: "248 Students | 12 Staff",
            phone: "+91 98765 43210",
            icon: FaSchool,
            color: "bg-blue-600"
        },
        {
            id: 2,
            name: "Village Health Center",
            type: "Healthcare Institution",
            status: "Active",
            address: "Main Street, Peddakaparthy",
            stats: "2 Doctors | 5 Nurses",
            phone: "+91 98765 43211",
            icon: FaHeartbeat,
            color: "bg-red-500"
        },
        {
            id: 3,
            name: "Gram Panchayat Office",
            type: "Government Institution",
            status: "Active",
            address: "Government Complex, Peddakaparthy",
            stats: "8 Officials | 4 Clerks",
            phone: "+91 98765 43212",
            icon: FaLandmark,
            color: "bg-indigo-600"
        },
        {
            id: 4,
            name: "Police Station",
            type: "Security Institution",
            status: "Active",
            address: "Police Line, Peddakaparthy",
            stats: "1 Inspector | 6 Constables",
            phone: "+91 98765 43213",
            icon: FaShieldAlt,
            color: "bg-slate-700"
        },
        {
            id: 5,
            name: "Community Center",
            type: "Community Institution",
            status: "Maintenance",
            address: "Center Square, Peddakaparthy",
            stats: "2 Coordinators | 3 Staff",
            phone: "+91 98765 43214",
            icon: FaHome,
            color: "bg-orange-500"
        },
        {
            id: 6,
            name: "Cooperative Bank",
            type: "Financial Institution",
            status: "Active",
            address: "Market Street, Peddakaparthy",
            stats: "1 Manager | 4 Clerks",
            phone: "+91 98765 43215",
            icon: FaMoneyBillWave,
            color: "bg-emerald-600"
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
                    <div className="relative hidden md:block w-96">
                        <FaSearch className="absolute left-3 top-2.5 text-gray-400 text-sm" />
                        <input
                            type="text"
                            placeholder="Search members, activities..."
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-9 pr-4 text-sm text-gray-300 focus:outline-none focus:border-blue-500 transition-colors"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
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
                        <SidebarItem to="/admin/dashboard" icon={FaThLarge} label="Village Dashboard" />
                        <SidebarItem to="/admin/members" icon={FaUsers} label="Member Management" />
                        <SidebarItem to="/admin/institutions" icon={FaBuilding} label="Institution Management" active={true} />
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
                            <h1 className="text-2xl font-bold text-gray-900">My Institutions</h1>
                            <p className="text-sm text-gray-500 mt-1">Manage and monitor your registered institutions | {institutions.length} institutions registered</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition hover:bg-gray-50">
                                <FaDownload size={14} /> Export Data
                            </button>
                            <Link to="/admin/institutions/new" className="bg-[#1e2a4a] hover:bg-[#2a3b66] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition">
                                <FaPlus size={12} /> Add Institution
                            </Link>
                        </div>
                    </div>

                    {/* Institutions Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {institutions.map(inst => (
                            <InstitutionCard key={inst.id} {...inst} />
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default InstitutionManagement;
