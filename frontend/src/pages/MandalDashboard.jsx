import React, { useState, useEffect } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';
import {
    FaUsers, FaBuilding, FaExclamationTriangle, FaFileAlt,
    FaMapMarkerAlt, FaClock
} from 'react-icons/fa';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import StatCard from '../components/common/StatCard';
import ActionCard from '../components/common/ActionCard';
import DashboardHeader from '../components/common/DashboardHeader';

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

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
            <AdminHeader />
            <div className="flex flex-1 overflow-hidden">
                <AdminSidebar activePage="dashboard" />

                <main className="flex-1 overflow-y-auto">
                    <DashboardHeader
                        title={`${stats.locationName} Mandal Dashboard`}
                        subtitle={`Manage mandal operations and monitor village activities. Last updated: Today`}
                    />

                    <div className="px-4 md:px-8 -mt-10 pb-8 w-full">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <StatCard
                                title="Total Registered Members"
                                value={stats.members.toLocaleString()}
                                subtext="+18 today"
                                icon={FaUsers}
                                color="bg-emerald-500"
                            />
                            <StatCard
                                title="Total Institutions"
                                value={stats.institutions.toLocaleString()}
                                subtext="Verified"
                                icon={FaBuilding}
                                color="bg-blue-500"
                            />
                            <StatCard
                                title="Pending Verifications"
                                value={stats.villages.reduce((acc, v) => acc + (v.pending || 0), 0).toLocaleString()}
                                subtext="Needs review"
                                icon={FaClock}
                                color="bg-orange-500"
                            />

                        </div>

                        {/* Quick Actions Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

                            <ActionCard
                                title="Village Map View"
                                desc="View mandal-wide villages"
                                icon={FaMapMarkerAlt}
                                to="/admin/map"
                                gradient="bg-gradient-to-br from-blue-600 to-indigo-700"
                            />
                            <ActionCard
                                title="Bulk Registration"
                                desc="Register multiple members"
                                icon={FaUsers}
                                to="/admin/members/bulk"
                                gradient="bg-gradient-to-br from-emerald-500 to-teal-700"
                            />
                            <ActionCard
                                title="Generate Report"
                                desc="Create mandal activity report"
                                icon={FaFileAlt}
                                to="/admin/reports/new"
                                gradient="bg-gradient-to-br from-slate-600 to-slate-800"
                            />
                        </div>

                        {/* Village Performance Overview */}
                        <div>
                            <div className="flex items-center gap-3 mb-6 ml-1">
                                <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                                    <FaBuilding size={20} />
                                </div>
                                <h2 className="text-xl font-bold text-slate-800">Village Performance Overview</h2>
                            </div>

                            {loading ? (
                                <div className="p-12 text-center text-gray-500 bg-white rounded-2xl shadow-sm border border-slate-100">Loading villages...</div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                                        <div className="col-span-full text-center py-10 bg-white rounded-2xl border border-dashed border-gray-300">
                                            No villages found.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MandalDashboard;
