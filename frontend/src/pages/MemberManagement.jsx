import React, { useState, useEffect } from 'react';
import API from '../api';
import member1 from '../assets/member1.png'; // Fallback image
import { Link } from 'react-router-dom';
import {
    FaThLarge, FaUsers, FaBuilding, FaExclamationTriangle, FaFileAlt,
    FaHandHoldingUsd, FaChartLine, FaCog, FaQuestionCircle, FaBullhorn,
    FaSignOutAlt, FaSearch, FaBell, FaChevronDown, FaShieldAlt,
    FaFileExcel, FaPlus, FaFilter, FaEye, FaEdit, FaPhoneAlt, FaWhatsapp, FaComment,
    FaChevronLeft, FaChevronRight
} from 'react-icons/fa';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';

const MemberRow = ({ photo, name, id, dbId, mobile, age, bloodGroup, familyCount, joinedDate, isNew }) => (
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
                <Link to={`/admin/members/${dbId}`} className="hover:text-blue-600 transition p-1 hover:bg-blue-50 rounded" title="View Profile">
                    <FaEye size={16} />
                </Link>
                <Link to={`/admin/members/edit/${dbId}`} className="hover:text-amber-600 transition p-1 hover:bg-amber-50 rounded" title="Edit Profile">
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
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchMembers = async () => {
        try {
            setLoading(true);
            // Use API instance to include auth token
            const { data } = await API.get('/members');
            setMembers(data);
        } catch (error) {
            console.error("Failed to fetch members", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);


    const [selectedBloodGroup, setSelectedBloodGroup] = useState('');
    const [selectedAgeGroup, setSelectedAgeGroup] = useState('');
    const [selectedProfession, setSelectedProfession] = useState('');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const membersPerPage = 10;



    // Filter Logic
    const filteredMembers = members.filter(member => {
        // 1. Search Term
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            const fullName = `${member.name} ${member.surname}`.toLowerCase();
            const mobile = member.mobileNumber ? member.mobileNumber.toString() : '';
            const blood = member.bloodGroup ? member.bloodGroup.toLowerCase() : '';

            if (!fullName.includes(searchLower) &&
                !mobile.includes(searchLower) &&
                !blood.includes(searchLower)) {
                return false;
            }
        }

        // 2. Blood Group Filter
        if (selectedBloodGroup && member.bloodGroup !== selectedBloodGroup) {
            return false;
        }

        // 3. Age Group Filter
        if (selectedAgeGroup) {
            const age = member.age || 0;
            if (selectedAgeGroup === '18-25' && (age < 18 || age > 25)) return false;
            if (selectedAgeGroup === '26-40' && (age < 26 || age > 40)) return false;
            if (selectedAgeGroup === '41-60' && (age < 41 || age > 60)) return false;
            if (selectedAgeGroup === '60+' && age <= 60) return false;
        }

        // 4. Profession Filter (Checking Family Details occupations)
        if (selectedProfession) {
            // Check self occupation (if added) or family details
            const ignoredVal = selectedProfession.toLowerCase();
            // Note: Schema doesn't have direct 'profession' on member, checking familyDetails
            const fOcc = member.familyDetails?.fatherOccupation?.toLowerCase() || '';
            const mOcc = member.familyDetails?.motherOccupation?.toLowerCase() || '';
            // Or maybe add a generic check if we add 'occupation' to member later. 
            // For now, let's assume it checks against the basic occupations we have.
            // If schema doesn't match perfectly, this might need adjustment.
            if (!fOcc.includes(ignoredVal) && !mOcc.includes(ignoredVal)) return false;
        }

        // 5. Large Families
        if (filterLargeFamilies) {
            const count = member.familyDetails?.memberCount || 0;
            if (count <= 4) return false;
        }

        // 6. Joined Today
        if (filterJoinedToday) {
            const joinedDate = new Date(member.createdAt).setHours(0, 0, 0, 0);
            const today = new Date().setHours(0, 0, 0, 0);
            if (joinedDate !== today) return false;
        }

        return true;
    });

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedBloodGroup, selectedAgeGroup, selectedProfession, filterLargeFamilies, filterJoinedToday]);

    // Pagination Logic on Filtered Results
    const indexOfLastMember = currentPage * membersPerPage;
    const indexOfFirstMember = indexOfLastMember - membersPerPage;
    const currentMembers = filteredMembers.slice(indexOfFirstMember, indexOfLastMember);
    const totalPages = Math.ceil(filteredMembers.length / membersPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="min-h-screen bg-[#f3f4f6] font-sans flex flex-col">
            <AdminHeader />

            <div className="flex flex-1 overflow-hidden">
                <AdminSidebar activePage="members" />

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
                            <button onClick={fetchMembers} className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition">
                                <FaSearch size={12} className="text-gray-500" /> Refresh List
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
                            <select
                                value={selectedBloodGroup}
                                onChange={(e) => setSelectedBloodGroup(e.target.value)}
                                className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-lg hover:border-blue-500 focus:outline-none focus:border-blue-500 transition shadow-sm cursor-pointer"
                            >
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
                            <select
                                value={selectedAgeGroup}
                                onChange={(e) => setSelectedAgeGroup(e.target.value)}
                                className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-lg hover:border-blue-500 focus:outline-none focus:border-blue-500 transition shadow-sm cursor-pointer"
                            >
                                <option value="">Age Group</option>
                                <option value="18-25">18-25 Years</option>
                                <option value="26-40">26-40 Years</option>
                                <option value="41-60">41-60 Years</option>
                                <option value="60+">60+ Years</option>
                            </select>

                            {/* Profession Filter */}
                            <select
                                value={selectedProfession}
                                onChange={(e) => setSelectedProfession(e.target.value)}
                                className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-lg hover:border-blue-500 focus:outline-none focus:border-blue-500 transition shadow-sm cursor-pointer"
                            >
                                <option value="">Profession</option>
                                <option value="farmer">Farmer</option>
                                <option value="student">Student</option>
                                <option value="business">Business</option>
                                <option value="employed">Employed</option>
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
                                    {loading ? (
                                        <tr>
                                            <td colSpan="8" className="text-center py-12">
                                                <div className="flex flex-col items-center justify-center text-gray-400">
                                                    <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-3"></div>
                                                    <p className="text-sm font-bold">Loading Members...</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : currentMembers.length > 0 ? (
                                        currentMembers.map((member) => (
                                            <MemberRow
                                                key={member._id}
                                                // Handle photo URL: 
                                                // 1. If http/https, use as is.
                                                // 2. If starts with /profiles, it's a frontend public asset (use as is).
                                                // 3. Otherwise, assume it's a backend upload (prepend backend URL).
                                                photo={member.photoUrl ? (
                                                    member.photoUrl.startsWith('http') || member.photoUrl.startsWith('/profiles')
                                                        ? member.photoUrl
                                                        : `http://localhost:5000${member.photoUrl}`
                                                ) : member1}
                                                name={`${member.name} ${member.surname}`}
                                                id={member.mewsId || member._id.substring(0, 8)}
                                                dbId={member._id}
                                                mobile={member.mobileNumber || 'N/A'}
                                                age={member.age || '-'}
                                                bloodGroup={member.bloodGroup || '-'}
                                                familyCount={member.familyDetails?.memberCount || '-'}
                                                joinedDate={new Date(member.createdAt).toLocaleDateString()}
                                                isNew={new Date(member.createdAt) > new Date(Date.now() - 86400000)}
                                            />
                                        ))) : (
                                        <tr>
                                            <td colSpan="8" className="text-center py-4">No members found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                            <div className="text-xs text-gray-500">
                                Showing {currentMembers.length > 0 ? indexOfFirstMember + 1 : 0}-{Math.min(indexOfLastMember, filteredMembers.length)} of {filteredMembers.length} members
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={`w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'} text-xs`}
                                >
                                    <FaChevronLeft />
                                </button>

                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => paginate(i + 1)}
                                        className={`w-8 h-8 flex items-center justify-center rounded-lg border ${currentPage === i + 1 ? 'bg-[#1e2a4a] text-white border-[#1e2a4a]' : 'border-gray-200 text-gray-600 hover:bg-gray-50'} text-xs font-bold`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}

                                <button
                                    onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className={`w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'} text-xs`}
                                >
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
