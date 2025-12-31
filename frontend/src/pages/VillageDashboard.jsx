import React, { useState, useEffect } from 'react';
import API from '../api';
import { Link } from 'react-router-dom';
import {
    FaThLarge, FaUsers, FaBuilding, FaExclamationTriangle, FaFileAlt,
    FaHandHoldingUsd, FaChartLine, FaCog, FaQuestionCircle, FaBullhorn,
    FaSignOutAlt, FaSearch, FaBell, FaChevronDown, FaUserPlus, FaCheckCircle, FaClock,
    FaChartPie, FaChartBar, FaCalendarAlt, FaRing
} from 'react-icons/fa';
import {
    PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import StatCard from '../components/common/StatCard';
import ActionCard from '../components/common/ActionCard';
import DashboardHeader from '../components/common/DashboardHeader';

const VillageDashboard = () => {
    const [stats, setStats] = useState({
        locationName: 'Village',
        members: 0,
        families: 0,
        pendingMembers: 0,
        institutions: 0,
        sos: 0
    });

    const [demographics, setDemographics] = useState({
        gender: [], occupation: [], caste: [], marital: [], age: []
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Parallel fetching of dashboard stats and analytics
                const [statsRes, analyticsRes] = await Promise.all([
                    API.get('/admin/dashboard-stats'),
                    API.get('/admin/analytics')
                ]);

                const data = statsRes.data;
                setStats({
                    locationName: data.locationName || 'Village',
                    members: data.members,
                    families: data.families || data.members, // Fallback to members if families not sent
                    pendingMembers: data.pendingMembers || 0,
                    institutions: data.institutions || 0,
                    sos: data.sosAlerts || 0
                });

                const analyticsData = analyticsRes.data;
                console.log("Analytics Data Received:", analyticsData);

                // Helper to sanitise data (handle null _ids)
                const sanitize = (arr) => (arr || []).map(item => ({
                    ...item,
                    _id: item._id || 'Unknown'
                }));

                setDemographics({
                    gender: sanitize(analyticsData.demographics.gender),
                    occupation: sanitize(analyticsData.demographics.occupation),
                    caste: sanitize(analyticsData.demographics.caste),
                    marital: sanitize(analyticsData.demographics.marital),
                    age: sanitize(analyticsData.demographics.age)
                });

            } catch (error) {
                console.error("Error fetching village stats/analytics", error);
            }
        };
        fetchStats();
    }, []);

    const getColor = (index) => {
        const colors = ['#3b82f6', '#ec4899', '#8b5cf6', '#10b981', '#f97316', '#6366f1', '#f43f5e'];
        return colors[index % colors.length];
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
            <AdminHeader />
            <div className="flex flex-1 overflow-hidden">
                <AdminSidebar activePage="dashboard" />

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto">
                    {/* Welcome Header with Gradient */}
                    <DashboardHeader
                        title="Good Afternoon, Admin"
                        subtitle={`Here's what's happening in ${stats.locationName} today. You have ${stats.pendingMembers} new registrations to review.`}
                    />

                    <div className="px-4 md:px-8 -mt-10 pb-8 w-full">
                        {/* Stats Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            <StatCard
                                title="Total Members"
                                value={stats.members.toLocaleString()}
                                subtext="Registered & Verified"
                                icon={FaUsers}
                                color="bg-emerald-500"
                            />
                            <StatCard
                                title="Institutions"
                                value={stats.institutions.toLocaleString()}
                                subtext="Registered & Verified"
                                icon={FaBuilding}
                                color="bg-blue-500"
                            />
                            <StatCard
                                title="Total Families"
                                value={stats.families.toLocaleString()}
                                subtext="Registered Households"
                                icon={FaUsers}
                                color="bg-orange-500"
                            />
                        </div>

                        {/* Demographics Overview */}
                        <div className="mb-8">
                            <div className="flex items-center gap-3 mb-6 ml-1">
                                <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                                    <FaChartPie size={20} />
                                </div>
                                <h2 className="text-xl font-bold text-slate-800">Analytics Overview</h2>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                {/* Gender Distribution */}
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 min-w-0">
                                    <h3 className="font-bold text-slate-700 mb-6 text-sm uppercase tracking-wide border-b pb-4">
                                        Gender Distribution
                                    </h3>
                                    <div className="h-72 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={demographics.gender || []}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={90}
                                                    paddingAngle={5}
                                                    dataKey="count"
                                                    nameKey="_id"
                                                    label={{ fill: '#475569', fontSize: 12, fontWeight: 600 }}
                                                >
                                                    {(demographics.gender || []).map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={getColor(index)} strokeWidth={0} />
                                                    ))}
                                                </Pie>
                                                <RechartsTooltip
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                />
                                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Marital Status */}
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 min-w-0">
                                    <h3 className="font-bold text-slate-700 mb-6 text-sm uppercase tracking-wide border-b pb-4">
                                        Marital Status
                                    </h3>
                                    <div className="h-72 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={demographics.marital || []}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={0}
                                                    outerRadius={90}
                                                    dataKey="count"
                                                    nameKey="_id"
                                                    label={{ fill: '#475569', fontSize: 12, fontWeight: 600 }}
                                                >
                                                    {(demographics.marital || []).map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={getColor(index + 2)} strokeWidth={2} stroke="#fff" />
                                                    ))}
                                                </Pie>
                                                <RechartsTooltip
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                />
                                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                {/* Caste Distribution */}
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 min-w-0">
                                    <h3 className="font-bold text-slate-700 mb-6 text-sm uppercase tracking-wide border-b pb-4">
                                        Community Distribution
                                    </h3>
                                    <div className="h-80 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={demographics.caste || []} barSize={40}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                <XAxis dataKey="_id" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                                <RechartsTooltip
                                                    cursor={{ fill: '#f1f5f9' }}
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                />
                                                <Bar dataKey="count" name="Members" radius={[6, 6, 0, 0]}>
                                                    {(demographics.caste || []).map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={getColor(index)} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Age Groups */}
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 min-w-0">
                                    <h3 className="font-bold text-slate-700 mb-6 text-sm uppercase tracking-wide border-b pb-4">
                                        Age Demographics
                                    </h3>
                                    <div className="h-80 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={demographics.age || []} barSize={40}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                <XAxis dataKey="_id" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                                <RechartsTooltip
                                                    cursor={{ fill: '#f1f5f9' }}
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                />
                                                <Bar dataKey="count" name="Members" fill="#10b981" radius={[6, 6, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            {/* Top Occupations */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 min-w-0">
                                <h3 className="font-bold text-slate-700 mb-6 text-sm uppercase tracking-wide border-b pb-4">
                                    Top Occupations
                                </h3>
                                <div className="h-96 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={demographics.occupation || []} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }} barSize={30}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                                            <XAxis type="number" allowDecimals={false} hide />
                                            <YAxis dataKey="_id" type="category" width={140} tick={{ fontSize: 13, fill: '#475569', fontWeight: 500 }} axisLine={false} tickLine={false} />
                                            <RechartsTooltip
                                                cursor={{ fill: '#f1f5f9' }}
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Bar dataKey="count" name="Members" radius={[0, 6, 6, 0]}>
                                                {(demographics.occupation || []).map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={getColor(index + 3)} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div >
        </div >
    );
};

export default VillageDashboard;
