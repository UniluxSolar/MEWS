import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    FaThLarge, FaUsers, FaBuilding, FaExclamationTriangle, FaFileAlt,
    FaHandHoldingUsd, FaChartLine, FaCog, FaQuestionCircle, FaBullhorn,
    FaSignOutAlt, FaSearch, FaBell, FaChevronDown, FaShieldAlt,
    FaFileExcel, FaPlus, FaFilter, FaEye, FaEdit, FaPhoneAlt, FaWhatsapp, FaComment,
    FaChevronLeft, FaChevronRight
} from 'react-icons/fa';

import member1 from '../assets/member1.png';
import member2 from '../assets/member2.png';
import member3 from '../assets/member3.png';
import member4 from '../assets/member4.png';
// Sidebar Components (Reused for consistency - ideally extract to AdminLayout)
const SidebarItem = ({ icon: Icon, label, active, to }) => (
    <Link to={to || '#'} className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors mb-1 ${active ? 'bg-[#1e2a4a] text-white font-bold' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 font-medium'}`}>
        <Icon size={18} className={active ? 'text-white' : 'text-gray-400'} />
        <span className="text-sm">{label}</span>
    </Link>
);

const MemberRow = ({ photo, name, id, mobile, age, bloodGroup, familyCount, joinedDate, isNew }) => (
    <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition">
        <td className="px-6 py-4">
            <img src={photo} alt={name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
        </td>
        <td className="px-6 py-4">
            <div className="font-bold text-gray-900 text-sm">{name}</div>
            <div className="text-xs text-gray-400">ID: {id}</div>
        </td>
        <td className="px-6 py-4 text-sm text-gray-700 font-medium">
            {mobile}
        </td>
        <td className="px-6 py-4 text-sm text-gray-700">
            {age}
        </td>
        <td className="px-6 py-4">
            <span className={`px-2 py-0.5 rounded text-xs font-bold border ${bloodGroup === 'A+' ? 'bg-red-50 text-red-600 border-red-100' :
                bloodGroup === 'B+' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                    bloodGroup === 'O+' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                        'bg-purple-50 text-purple-600 border-purple-100'
                }`}>
                {bloodGroup}
            </span>
        </td>
        <td className="px-6 py-4 text-sm text-gray-700 pl-10">
            {familyCount}
        </td>
        <td className="px-6 py-4 text-sm text-gray-500">
            {joinedDate}
            {isNew && <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full inline-block"></span>}
        </td>
        <td className="px-6 py-4">
            <div className="flex items-center gap-3 text-gray-400">
                <Link to={`/admin/members/${id}`} className="hover:text-blue-600 transition p-1 hover:bg-blue-50 rounded" title="View Profile">
                    <FaEye size={16} />
                </Link>
                <Link to={`/admin/members/edit/${id}`} className="hover:text-amber-600 transition p-1 hover:bg-amber-50 rounded" title="Edit Profile">
                    <FaEdit size={16} />
                </Link>
                <a href={`tel:${mobile}`} className="hover:text-green-600 transition p-1 hover:bg-green-50 rounded" title="Call Member">
                    <FaPhoneAlt size={14} />
                </a>
                <a href={`https://wa.me/${mobile.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="hover:text-green-500 transition p-1 hover:bg-green-50 rounded" title="WhatsApp">
                    <FaWhatsapp size={16} />
                </a>
                <a href={`sms:${mobile}`} className="hover:text-blue-500 transition p-1 hover:bg-blue-50 rounded" title="Send Message">
                    <FaComment size={14} />
                </a>
            </div>
        </td>
    </tr>
);

const MemberManagement = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterJoinedToday, setFilterJoinedToday] = useState(false);
    const [filterLargeFamilies, setFilterLargeFamilies] = useState(false);


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
                        <SidebarItem icon={FaExclamationTriangle} label="SOS Management" />
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
                            <h1 className="text-2xl font-bold text-gray-900">Existing Members</h1>
                            <p className="text-sm text-gray-500 mt-1">Manage existing village members | Last updated: Today, 14:30 IST</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="bg-[#1e2a4a] hover:bg-[#2a3b66] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition">
                                <FaFileExcel size={14} /> Export Excel
                            </button>
                            <Link to="/admin/members/new" className="bg-[#e85d04] hover:bg-[#d05304] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition">
                                <FaPlus size={12} /> Add New Member
                            </Link>
                        </div>
                    </div>

                    {/* Filters & Search - Styled like the image */}
                    <div className="bg-white p-4 rounded-t-xl border border-gray-200 border-b-0">
                        <div className="mb-4">
                            <div className="relative">
                                <FaSearch className="absolute left-4 top-3.5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name, mobile number, blood group..."
                                    className="w-full bg-white border border-gray-200 rounded-lg py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <span className="text-sm font-bold text-gray-500 mr-2 flex items-center gap-2">
                                <FaFilter size={12} /> Filters:
                            </span>

                            {/* Blood Group Filter */}
                            <select className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-lg hover:border-blue-500 focus:outline-none focus:border-blue-500 transition shadow-sm cursor-pointer">
                                <option value="">Blood Group</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                            </select>

                            {/* Age Filter */}
                            <select className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-lg hover:border-blue-500 focus:outline-none focus:border-blue-500 transition shadow-sm cursor-pointer">
                                <option value="">Age Group</option>
                                <option value="18-25">18-25 Years</option>
                                <option value="26-40">26-40 Years</option>
                                <option value="41-60">41-60 Years</option>
                                <option value="60+">60+ Years</option>
                            </select>

                            {/* Profession Filter */}
                            <select className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-lg hover:border-blue-500 focus:outline-none focus:border-blue-500 transition shadow-sm cursor-pointer">
                                <option value="">Profession</option>
                                <option value="farmer">Farmer</option>
                                <option value="student">Student</option>
                                <option value="business">Business</option>
                                <option value="employed">AEmployed</option>
                                <option value="homemaker">Homemaker</option>
                            </select>

                            <div className="h-6 w-px bg-gray-300 mx-2"></div>

                            {/* Large Families Toggle */}
                            <button
                                onClick={() => setFilterLargeFamilies(!filterLargeFamilies)}
                                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition shadow-sm border ${filterLargeFamilies ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                            >
                                Large Families ({'>'}4)
                            </button>

                            {/* Joined Today Toggle */}
                            <button
                                onClick={() => setFilterJoinedToday(!filterJoinedToday)}
                                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition shadow-sm border ${filterJoinedToday ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                            >
                                Joined Today
                            </button>

                        </div>
                    </div>


                    {/* Content View */}
                    <div className="bg-white rounded-b-xl border border-gray-200 overflow-hidden shadow-sm mb-6">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Photo</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Mobile</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Age</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Blood Group</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Family Count</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Joined Date</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <MemberRow
                                        photo={member1}
                                        name="Ramesh Kumar"
                                        id="MEW2024001"
                                        mobile="+91 9876543210"
                                        age="45"
                                        bloodGroup="B+"
                                        familyCount="4"
                                        joinedDate="15 Dec 2023"
                                    />
                                    <MemberRow
                                        photo={member2}
                                        name="Priya Sharma"
                                        id="MEW2024002"
                                        mobile="+91 9876543211"
                                        age="28"
                                        bloodGroup="A+"
                                        familyCount="6"
                                        joinedDate="Today"
                                        isNew={true}
                                    />
                                    <MemberRow
                                        photo={member3}
                                        name="Suresh Patel"
                                        id="MEW2024003"
                                        mobile="+91 9876543212"
                                        age="62"
                                        bloodGroup="O+"
                                        familyCount="3"
                                        joinedDate="10 Nov 2023"
                                    />
                                    <MemberRow
                                        photo={member4}
                                        name="Anita Singh"
                                        id="MEW2024004"
                                        mobile="+91 9876543213"
                                        age="38"
                                        bloodGroup="AB+"
                                        familyCount="5"
                                        joinedDate="22 Oct 2023"
                                    />
                                    <MemberRow
                                        photo={member1}
                                        name="Vikram Yadav"
                                        id="MEW2024005"
                                        mobile="+91 9876543214"
                                        age="31"
                                        bloodGroup="B+"
                                        familyCount="7"
                                        joinedDate="05 Sep 2023"
                                    />
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                            <div className="text-xs text-gray-500">
                                Showing 1-5 of 2,847 members
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 text-xs">
                                    <FaChevronLeft />
                                </button>
                                <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#1e2a4a] text-white text-xs font-bold">1</button>
                                <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-bold">2</button>
                                <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-bold">3</button>
                                <span className="text-gray-400 text-xs">...</span>
                                <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-bold">570</button>
                                <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 text-xs">
                                    <FaChevronRight />
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MemberManagement;
