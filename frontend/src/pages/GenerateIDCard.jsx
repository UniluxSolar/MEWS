import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    FaSearch, FaShieldAlt, FaBell, FaChevronDown, FaThLarge, FaUsers, FaBuilding,
    FaExclamationTriangle, FaFileAlt, FaHandHoldingUsd, FaChartLine, FaCog,
    FaQuestionCircle, FaBullhorn, FaSignOutAlt, FaPrint, FaDownload,
    FaWhatsapp, FaEnvelope, FaCheckCircle, FaQrcode
} from 'react-icons/fa';
import member2 from '../assets/member2.png'; // Fallback

// Sidebar Item Component
const SidebarItem = ({ icon: Icon, label, active, to }) => (
    <Link to={to || '#'} className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors mb-1 ${active ? 'bg-[#1e2a4a] text-white font-bold' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 font-medium'}`}>
        <Icon size={18} className={active ? 'text-white' : 'text-gray-400'} />
        <span className="text-sm">{label}</span>
    </Link>
);

const GenerateIDCard = () => {
    const location = useLocation();

    // Default valid until date (1 year from now)
    const getValidUntil = () => {
        const date = new Date();
        date.setFullYear(date.getFullYear() + 1);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMember, setSelectedMember] = useState({
        name: 'Priya Sharma',
        surname: '',
        id: 'MEW2024001234',
        mobile: '+91 9876543210',
        photo: member2,
        bloodGroup: 'B+',
        village: 'Peddakaparthy',
        validUntil: 'Dec 2025'
    });

    // Effect to load data from navigation state (Registration -> Generate ID)
    useEffect(() => {
        if (location.state && location.state.newMember) {
            const newMember = location.state.newMember;
            const generatedId = `MEW${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`;

            setSelectedMember({
                name: newMember.name || 'Unknown',
                surname: newMember.surname || '',
                id: generatedId,
                mobile: newMember.mobile || '+91 XXXXX XXXXX',
                photo: member2, // In a real app, this would be the uploaded photo URL
                bloodGroup: newMember.bloodGroup || 'O+',
                village: newMember.presentVillage || 'Peddakaparthy',
                validUntil: getValidUntil()
            });
            setSearchTerm(`${newMember.name || ''} ${newMember.surname || ''}`.trim());
        }
    }, [location.state]);

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
                    {/* Global Search */}
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
                        <SidebarItem to="/admin/dashboard" icon={FaThLarge} label="Village Dashboard" />
                        <SidebarItem to="/admin/members" icon={FaUsers} label="Member Management" active={true} />
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
                <main className="flex-1 overflow-y-auto p-8">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Member ID Card</h1>
                        <p className="text-gray-500 text-sm mt-1">Create official government ID cards for village members</p>
                    </div>

                    {/* Section 1: Select Member */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                        <h2 className="text-lg font-bold text-gray-800 mb-4">Select Member</h2>
                        <div className="flex gap-4 mb-6">
                            <div className="relative flex-1">
                                <FaSearch className="absolute left-4 top-3.5 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by name, ID number, or phone"
                                    className="w-full bg-white border border-gray-300 rounded-lg py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow"
                                />
                            </div>
                            <button className="bg-[#1e2a4a] hover:bg-[#2a3b66] text-white px-8 py-3 rounded-lg font-bold text-sm transition">
                                Search
                            </button>
                        </div>

                        {/* Selected Member Result */}
                        {selectedMember && (
                            <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full border-2 border-white shadow-sm overflow-hidden">
                                        <img src={selectedMember.photo} alt={selectedMember.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900">{selectedMember.name} {selectedMember.surname}</div>
                                        <div className="text-xs text-gray-500">ID: <span className="text-gray-700 font-medium">{selectedMember.id}</span></div>
                                        <div className="text-xs text-gray-500">Phone: {selectedMember.mobile}</div>
                                    </div>
                                </div>
                                <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1">
                                    <FaCheckCircle size={10} /> Verified
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Section 2: Preview - Enhanced UI */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                        <h2 className="text-lg font-bold text-gray-800 mb-6">ID Card Preview</h2>

                        <div className="flex justify-center bg-gray-50 py-10 rounded-xl border border-dashed border-gray-300">
                            {/* ID Card */}
                            <div className="w-[400px] h-[252px] bg-white rounded-xl shadow-xl border border-gray-300 overflow-hidden relative flex flex-col">
                                {/* Watermark */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                                    <FaShieldAlt size={200} />
                                </div>

                                {/* Card Header */}
                                <div className="bg-gradient-to-r from-[#0f172a] to-[#1e2a4a] h-16 flex items-center justify-between px-5 relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center border border-white/20 backdrop-blur-sm shadow-inner">
                                            <FaShieldAlt className="text-blue-100 text-sm" />
                                        </div>
                                        <div>
                                            <div className="text-white font-bold text-sm leading-tight tracking-wide">MEWS 2.0</div>
                                            <div className="text-blue-200 text-[9px] leading-tight uppercase tracking-wider font-semibold mt-0.5">Village Resident Identity</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-white font-bold text-[10px] tracking-wide">PEDDAKAPARTHY</div>
                                        <div className="text-blue-300/80 text-[8px] uppercase">Gram Panchayat</div>
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="flex-1 p-5 flex gap-5 relative z-10">
                                    {/* Photo with Frame */}
                                    <div className="w-24 h-28 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border-2 border-white shadow-md relative">
                                        <img src={selectedMember.photo} alt="Member" className="w-full h-full object-cover" />
                                        {/* Hologram Effect */}
                                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none"></div>
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 pt-0.5">
                                        <div className="mb-2">
                                            <div className="text-[8px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Name</div>
                                            <div className="text-base font-extrabold text-gray-900 leading-none">{selectedMember.name} {selectedMember.surname}</div>
                                        </div>

                                        <div className="mb-2.5">
                                            <div className="text-[8px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Member ID</div>
                                            <div className="text-xs font-bold text-gray-800 leading-none tracking-wide font-mono">{selectedMember.id}</div>
                                        </div>

                                        <div className="flex gap-4">
                                            <div>
                                                <div className="text-[8px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Blood Group</div>
                                                <div className="text-xs font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100 inline-block leading-none">{selectedMember.bloodGroup}</div>
                                            </div>
                                            <div>
                                                <div className="text-[8px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Village</div>
                                                <div className="text-xs font-bold text-gray-800 leading-none">{selectedMember.village}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* QR Code */}
                                    <div className="flex flex-col items-center justify-end gap-1">
                                        <div className="w-16 h-16 bg-white border border-gray-200 p-0.5 rounded shadow-sm">
                                            <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=MEWS2024001234" alt="QR" className="w-full h-full" />
                                        </div>
                                    </div>
                                </div>

                                {/* Card Footer */}
                                <div className="h-7 bg-gray-50 border-t border-gray-100 flex items-center justify-between px-5 py-0.5 relative z-10">
                                    <div className="flex items-center gap-1.5">
                                        <FaCheckCircle className="text-green-500 text-[8px]" />
                                        <span className="text-[8px] text-gray-600 font-medium">Digital Verified</span>
                                    </div>
                                    <div className="text-[8px] text-gray-500 font-mono">
                                        VALID: <span className="text-gray-900 font-bold">{selectedMember.validUntil}</span>
                                    </div>
                                </div>
                                <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500"></div>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Actions */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-4">Actions</h2>
                        <div className="flex flex-wrap gap-4">
                            <button className="flex-1 bg-[#1e2a4a] hover:bg-[#2a3b66] text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition shadow-md">
                                <FaDownload /> Download PDF
                            </button>
                            <button className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition shadow-sm">
                                <FaEnvelope /> Share via Email
                            </button>
                            <button className="flex-1 bg-[#25D366] hover:bg-[#20bd5a] text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition shadow-md">
                                <FaWhatsapp size={18} /> Share WhatsApp
                            </button>
                            <button className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition shadow-sm">
                                <FaPrint /> Print Card
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default GenerateIDCard;
