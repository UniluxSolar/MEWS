import React, { useState, useEffect } from 'react';
import API from '../api';
import {
    FaUsers, FaBuilding, FaExclamationTriangle, FaFileAlt,
    FaHandHoldingUsd, FaChartLine, FaMapMarkedAlt, FaCheckCircle
} from 'react-icons/fa';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import StatCard from '../components/common/StatCard';
import ActionCard from '../components/common/ActionCard';
import DashboardHeader from '../components/common/DashboardHeader';

const SimpleBarChart = () => {
    // Mock Data for "New Registrations (Last 7 Days)"
    const data = [
        { day: 'Mon', val: 45 },
        { day: 'Tue', val: 38 },
        { day: 'Wed', val: 52 },
        { day: 'Thu', val: 61 },
        { day: 'Fri', val: 48 },
        { day: 'Sat', val: 39 },
        { day: 'Sun', val: 42 },
    ];
    const max = 70;

    return (
        <div className="flex items-end justify-between h-56 gap-2 pt-8 pb-2">
            {data.map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
                    <div className="w-full bg-slate-100 rounded-t-xl relative h-full flex items-end overflow-hidden">
                        <div
                            style={{ height: `${(d.val / max) * 100}%` }}
                            className="w-full bg-[#1e2a4a] rounded-t-lg group-hover:bg-blue-600 transition-all duration-500 relative"
                        >
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                {d.val} registrations
                            </div>
                        </div>
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{d.day}</span>
                </div>
            ))}
        </div>
    );
};

const DistrictDashboard = () => {
    const [stats, setStats] = useState({
        locationName: 'District',
        members: 0,
        pendingMembers: 0,
        institutions: 0,
        sos: 0,
        mandals: []
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await API.get('/admin/dashboard-stats');
                setStats({
                    locationName: data.locationName || 'District',
                    members: data.members,
                    pendingMembers: data.pendingMembers,
                    institutions: data.institutions,
                    sos: data.sosAlerts,
                    mandals: data.mandals || []
                });
            } catch (error) {
                console.error("Error fetching dashboard stats", error);
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
                        title={`${stats.locationName} District Dashboard`}
                        subtitle={`Manage district operations and monitor activities. Last updated: Today`}
                    />

                    <div className="px-4 md:px-8 -mt-10 pb-8 w-full">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <StatCard
                                title="Total Registered Members"
                                value={stats.members.toLocaleString()}
                                subtext={`+${stats.pendingMembers} today`}
                                icon={FaUsers}
                                color="bg-emerald-500"
                            />
                            <StatCard
                                title="Total Mandals Covered"
                                value={stats.mandals.length}
                                subtext="100% coverage"
                                icon={FaMapMarkedAlt}
                                color="bg-indigo-500"
                            />
                            <StatCard
                                title="Verified Institutions"
                                value={stats.institutions.toLocaleString()}
                                subtext="+3 this week"
                                icon={FaBuilding}
                                color="bg-blue-500"
                            />

                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                            {/* Chart Section */}
                            <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                                        <FaChartLine size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-800">New Registrations</h3>
                                        <p className="text-sm text-slate-500">Last 7 Days Performance</p>
                                    </div>
                                </div>
                                <SimpleBarChart />
                            </div>

                            {/* Quick Actions */}
                            <div className="flex flex-col gap-4">
                                <h3 className="text-lg font-bold text-slate-800 mb-2">Quick Actions</h3>
                                <div className="space-y-4">

                                    <ActionCard
                                        title="Open Institution Map"
                                        desc="View district-wide institutions"
                                        icon={FaMapMarkedAlt}
                                        to="/admin/map"
                                        gradient="bg-gradient-to-br from-indigo-500 to-purple-700"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Mandal Breakdown Table */}
                        {stats.mandals && stats.mandals.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 mb-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
                                        <FaBuilding size={20} />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800">District Overview (Mandal Wise)</h3>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-gray-100">
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Mandal Name</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total Members</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Institutions</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stats.mandals.map((mandal) => (
                                                <tr key={mandal.id} className="border-b border-gray-50 hover:bg-slate-50 transition-colors">
                                                    <td className="px-6 py-5 font-bold text-slate-800">{mandal.name}</td>
                                                    <td className="px-6 py-5 text-sm text-slate-600 font-medium">{mandal.members}</td>
                                                    <td className="px-6 py-5 text-sm text-slate-600">{mandal.institutions}</td>
                                                    <td className="px-6 py-5">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${mandal.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                            {mandal.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DistrictDashboard;
