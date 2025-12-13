import React, { useState, useEffect } from 'react';
import API from '../api';
import { Link } from 'react-router-dom';
import {
    FaThLarge, FaUsers, FaBuilding, FaExclamationTriangle, FaFileAlt,
    FaHandHoldingUsd, FaChartLine, FaCog, FaQuestionCircle, FaBullhorn,
    FaSignOutAlt, FaSearch, FaBell, FaChevronDown, FaUserPlus, FaCheckCircle, FaClock
} from 'react-icons/fa';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';

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

const VillageDashboard = () => {
    const [stats, setStats] = useState({
        locationName: 'Village',
        members: 0,
        pendingMembers: 0,
        institutions: 0,
        sos: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await API.get('/admin/dashboard-stats');
                setStats({
                    locationName: data.locationName || 'Village',
                    members: data.members,
                    pendingMembers: data.pendingMembers || 0,
                    institutions: data.institutions || 0,
                    sos: data.sosAlerts || 0
                });
            } catch (error) {
                console.error("Error fetching village stats", error);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="min-h-screen bg-[#f3f4f6] font-sans flex flex-col">
            <AdminHeader />
            <div className="flex flex-1 overflow-hidden">
                <AdminSidebar activePage="dashboard" />

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    {/* Page Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{stats.locationName} Dashboard</h1>
                            <p className="text-sm text-gray-500 mt-1">Manage village operations and monitor activities | Last updated: Today</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`px-3 py-2 text-xs font-bold rounded-lg border flex items-center gap-2 ${stats.sos > 0 ? 'bg-red-50 text-red-700 border-red-100' : 'bg-green-50 text-green-700 border-green-100'}`}>
                                <div className={`w-2 h-2 rounded-full ${stats.sos > 0 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                                {stats.sos > 0 ? `${stats.sos} Live SOS` : 'No Active SOS'}
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
                            value={stats.members.toLocaleString()}
                            subtext={stats.pendingMembers > 0 ? `+${stats.pendingMembers} pending` : "All verified"}
                            subColor={stats.pendingMembers > 0 ? "text-orange-500" : "text-green-500"}
                            icon={FaUsers}
                            iconBg="bg-[#1e2a4a]"
                            statusColor="bg-green-500"
                        />
                        <StatCard
                            title="Total Institutions"
                            value={stats.institutions.toLocaleString()}
                            subtext="Verified"
                            subColor="text-green-600"
                            icon={FaBuilding}
                            iconBg="bg-[#1e2a4a]"
                            statusColor="bg-green-500"
                        />
                        <StatCard
                            title="Today's Registrations"
                            value={stats.pendingMembers}
                            subtext="Needs Review"
                            subColor="text-blue-600"
                            icon={FaUserPlus}
                            iconBg="bg-blue-600"
                            statusColor="bg-blue-500"
                        />
                        <StatCard
                            title="Live SOS Alerts"
                            value={stats.sos}
                            subtext={stats.sos > 0 ? "Action Required" : "All clear"}
                            subColor="text-gray-500"
                            icon={FaExclamationTriangle}
                            iconBg={stats.sos > 0 ? "bg-red-500" : "bg-gray-400"}
                            statusColor={stats.sos > 0 ? "bg-red-500" : "bg-gray-400"}
                        />
                    </div>

                    {/* Quick Actions & Monitor */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-gray-900">Live SOS Monitor</h3>
                                <div className={`w-2 h-2 rounded-full animate-pulse ${stats.sos > 0 ? 'bg-red-500' : 'bg-green-500'}`}></div>
                            </div>
                            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${stats.sos > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
                                    {stats.sos > 0 ?
                                        <FaExclamationTriangle className="text-red-500 text-2xl" /> :
                                        <FaCheckCircle className="text-green-500 text-2xl" />
                                    }
                                </div>
                                <h4 className={`text-lg font-bold mb-1 ${stats.sos > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    {stats.sos > 0 ? 'Emergency Active' : 'All Clear'}
                                </h4>
                                <p className="text-xs text-gray-500 max-w-[200px]">
                                    {stats.sos > 0 ? 'Review active alerts immediately.' : 'No active SOS alerts in village.'}
                                </p>
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

export default VillageDashboard;
