import React, { useState, useEffect } from 'react';
import API from '../api';
import { Link } from 'react-router-dom';
import {
    FaThLarge, FaUsers, FaBuilding, FaExclamationTriangle, FaFileAlt,
    FaHandHoldingUsd, FaChartLine, FaCog, FaQuestionCircle, FaBullhorn,
    FaSignOutAlt, FaSearch, FaBell, FaChevronDown, FaShieldAlt,
    FaPlus, FaDownload, FaSchool, FaHeartbeat, FaLandmark,
    FaHome, FaMoneyBillWave, FaMapMarkerAlt, FaPhoneAlt, FaEye, FaEdit
} from 'react-icons/fa';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';

const InstitutionCard = ({ icon: Icon, id, name, type, status, address, stats, phone, color }) => (
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
            <Link to={`/admin/institutions/${id}`} className="flex-1 bg-[#1e2a4a] text-white text-xs font-bold py-2 rounded-lg hover:bg-[#2a3b66] transition flex items-center justify-center gap-2">
                <FaEye /> View Details
            </Link>
            <Link to={`/admin/institutions/edit/${id}`} className="flex-1 border border-gray-200 text-gray-600 text-xs font-bold py-2 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2">
                <FaEdit /> Edit
            </Link>
        </div>
    </div>
);

const InstitutionManagement = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [institutions, setInstitutions] = useState([]);

    useEffect(() => {
        const fetchInstitutions = async () => {
            try {
                const { data } = await API.get('/institutions');
                // Map backend data to frontend card format
                const mapped = data.map(inst => ({
                    id: inst._id,
                    name: inst.name,
                    type: inst.type,
                    status: inst.verificationStatus === 'APPROVED' ? 'Active' : inst.verificationStatus === 'PENDING' ? 'Pending' : 'Inactive',
                    address: inst.fullAddress,
                    stats: inst.mobileNumber, // placeholder
                    phone: inst.mobileNumber,
                    icon: FaSchool, // default
                    color: "bg-blue-600"
                }));
                setInstitutions(mapped);
            } catch (error) {
                console.error("Failed to fetch institutions", error);
            }
        };
        fetchInstitutions();
    }, []);

    return (
        <div className="min-h-screen bg-[#f3f4f6] font-sans flex flex-col">
            <AdminHeader />
            <div className="flex flex-1 overflow-hidden">
                <AdminSidebar activePage="institutions" />
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
