import React, { useState, useEffect } from 'react';
import API from '../api';
import { Link, useNavigate } from 'react-router-dom';
import {
    FaThLarge, FaUsers, FaBuilding, FaExclamationTriangle, FaFileAlt,
    FaHandHoldingUsd, FaChartLine, FaCog, FaQuestionCircle, FaBullhorn,
    FaSignOutAlt, FaSearch, FaBell, FaChevronDown, FaUserPlus, FaCheckCircle, FaClock,
    FaChartPie, FaChartBar, FaCalendarAlt, FaRing, FaMale, FaFemale
} from 'react-icons/fa';
import {
    PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList
} from 'recharts';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import StatCard from '../components/common/StatCard';
import ActionCard from '../components/common/ActionCard';
import DashboardHeader from '../components/common/DashboardHeader';

const VillageDashboard = () => {
    const navigate = useNavigate();

    const handleChartClick = (data, type) => {
        if (!data) return;
        // Recharts payload structure check
        // Pie chart click returns the data object directly usually? Or { payload: ... }?
        // Let's assume data has _id. Use defensive check.
        const label = data.originalKey || data._id || data.payload?._id || data.name;

        if (!label) return;

        let query = '';
        switch (type) {
            case 'gender':
                query = `?gender=${label}`;
                break;
            case 'marital':
                query = `?maritalStatus=${label}`;
                break;
            case 'bloodGroup':
                query = `?bloodGroup=${encodeURIComponent(label)}`;
                break;
            case 'community':
                query = `?subCaste=${encodeURIComponent(label)}`;
                break;
            case 'age':
                query = `?ageRange=${label}`;
                break;
            case 'occupation':
                query = `?occupation=${encodeURIComponent(label)}`;
                break;
            case 'voter':
                query = `?voterStatus=${encodeURIComponent(label)}`;
                break;
            case 'employment':
                query = `?employmentStatus=${encodeURIComponent(label)}`;
                break;
        }
        if (query) navigate(`/admin/members${query}`);
    };

    const [stats, setStats] = useState({
        locationName: 'Village',
        members: 0,
        families: 0,
        pendingMembers: 0,
        institutions: 0,
        sos: 0
    });

    const [demographics, setDemographics] = useState({
        gender: [], occupation: [], caste: [], marital: [], age: [], bloodGroup: [], voter: [], employment: []
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

                const processAgeData = (backendData) => {
                    const categories = [
                        { key: "Children", label: "Children (0-14)" },
                        { key: "Youth", label: "Youth (15-24)" },
                        { key: "Young Adults", label: "Young Adults (25-44)" },
                        { key: "Middle Age", label: "Middle Age (45-59)" },
                        { key: "Elderly", label: "Elderly (60-74)" },
                        { key: "Senior", label: "Senior (75+)" }
                    ];

                    return categories.map(cat => {
                        const found = (backendData || []).find(item => item && item._id === cat.key);
                        return {
                            _id: cat.label,
                            count: found ? found.count : 0,
                            originalKey: cat.key // For click handling
                        };
                    });
                };

                setDemographics({
                    gender: sanitize(analyticsData.demographics.gender),
                    occupation: sanitize(analyticsData.demographics.occupation),
                    community: sanitize(analyticsData.demographics.caste).sort((a, b) => b.count - a.count),
                    marital: sanitize(analyticsData.demographics.marital),

                    age: processAgeData(analyticsData.demographics.age), // Use custom processor
                    bloodGroup: sanitize(analyticsData.demographics.bloodGroup),
                    voter: sanitize(analyticsData.demographics.voter),
                    employment: sanitize(analyticsData.demographics.employment)
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
            <AdminHeader locationName={stats.locationName} />
            <div className="flex flex-1 overflow-hidden">
                <AdminSidebar activePage="dashboard" />

                {/* Main Content */}
                <main id="admin-dashboard-content" className="flex-1 overflow-y-auto">
                    {/* Welcome Header with Gradient */}
                    <div id="location-card-scroll-target">
                        <DashboardHeader
                            title={`${stats.locationName} Dashboard`}
                            subtitle={`Here's what's happening in ${stats.locationName} today. You have ${stats.pendingMembers} new registrations to review.`}
                        />
                    </div>

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

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                                {/* Gender Distribution */}
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 min-w-0">
                                    <h3 className="font-bold text-slate-700 mb-6 text-sm uppercase tracking-wide border-b pb-4">
                                        Gender Distribution
                                    </h3>
                                    <div className="h-72 w-full flex items-center justify-center">
                                        <div className="flex items-center gap-12">
                                            {/* Male Stats */}
                                            <div className="flex flex-col items-center group cursor-pointer" onClick={() => handleChartClick({ _id: 'Male' }, 'gender')}>
                                                <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors shadow-sm">
                                                    <FaMale className="text-blue-500 text-6xl" />
                                                </div>
                                                <div className="text-3xl font-bold text-slate-700 mb-1">
                                                    {(demographics.gender.find(g => (g._id || '').toLowerCase() === 'male')?.count || 0)}
                                                </div>
                                                <div className="text-xs font-bold uppercase text-slate-400 tracking-wider">Male</div>
                                            </div>

                                            {/* Divider */}
                                            <div className="h-32 w-px bg-slate-100 hidden sm:block"></div>

                                            {/* Female Stats */}
                                            <div className="flex flex-col items-center group cursor-pointer" onClick={() => handleChartClick({ _id: 'Female' }, 'gender')}>
                                                <div className="w-24 h-24 rounded-full bg-pink-50 flex items-center justify-center mb-4 group-hover:bg-pink-100 transition-colors shadow-sm">
                                                    <FaFemale className="text-pink-500 text-6xl" />
                                                </div>
                                                <div className="text-3xl font-bold text-slate-700 mb-1">
                                                    {(demographics.gender.find(g => (g._id || '').toLowerCase() === 'female')?.count || 0)}
                                                </div>
                                                <div className="text-xs font-bold uppercase text-slate-400 tracking-wider">Female</div>
                                            </div>
                                        </div>
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
                                                        <Cell key={`cell-${index}`} fill={getColor(index + 2)} strokeWidth={2} stroke="#fff" onClick={() => handleChartClick(entry, 'marital')} style={{ cursor: 'pointer' }} />
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


                                {/* Blood Group Chart (Replaces Registration Status) */}
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 min-w-0">
                                    <h3 className="font-bold text-slate-700 mb-6 text-sm uppercase tracking-wide border-b pb-4">
                                        Blood Group Distribution
                                    </h3>
                                    <div className="h-72 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={demographics.bloodGroup || []}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={90}
                                                    paddingAngle={2}
                                                    dataKey="count"
                                                    nameKey="_id"
                                                    label={{ fill: '#475569', fontSize: 12, fontWeight: 600 }}
                                                >
                                                    {(demographics.bloodGroup || []).map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={getColor(index)} strokeWidth={0} onClick={() => handleChartClick(entry, 'bloodGroup')} style={{ cursor: 'pointer' }} />
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


                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                            {/* Top Occupations (Converted from Bar to Pie) */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 min-w-0">
                                <h3 className="font-bold text-slate-700 mb-6 text-sm uppercase tracking-wide border-b pb-4">
                                    Occupation Distribution
                                </h3>
                                <div className="h-80 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={demographics.occupation || []}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                dataKey="count"
                                                nameKey="_id"
                                                label={({ _id, percent }) => `${_id} (${(percent * 100).toFixed(0)}%)`}
                                            >
                                                {(demographics.occupation || []).map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={getColor(index + 3)} onClick={() => handleChartClick(entry, 'occupation')} style={{ cursor: 'pointer' }} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Employment Status */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 min-w-0">
                                <h3 className="font-bold text-slate-700 mb-6 text-sm uppercase tracking-wide border-b pb-4">
                                    Employment Status
                                </h3>
                                <div className="h-80 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={demographics.employment || []}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={0}
                                                outerRadius={100}
                                                dataKey="count"
                                                nameKey="_id"
                                                label={({ _id, percent }) => `${_id} (${(percent * 100).toFixed(0)}%)`}
                                            >
                                                {(demographics.employment || []).map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry._id === 'Employed' ? '#3b82f6' : '#94a3b8'} strokeWidth={2} stroke="#fff" onClick={() => handleChartClick(entry, 'employment')} style={{ cursor: 'pointer' }} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Total Voters (Moved Here) */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 min-w-0">
                                <h3 className="font-bold text-slate-700 mb-6 text-sm uppercase tracking-wide border-b pb-4">
                                    Total Voters
                                </h3>
                                <div className="h-80 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={demographics.voter || []}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={0}
                                                outerRadius={90}
                                                dataKey="count"
                                                nameKey="_id"
                                                label={({ _id, count }) => `${_id}: ${count}`}
                                            >
                                                {(demographics.voter || []).map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry._id === 'Voter' ? '#10b981' : '#f43f5e'} strokeWidth={2} stroke="#fff" onClick={() => handleChartClick(entry, 'voter')} style={{ cursor: 'pointer' }} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
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
                                    Mala Community - Sub Castes
                                </h3>
                                <div className="h-80 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={demographics.community || []} barSize={40}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                            <XAxis dataKey="_id" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} domain={[0, 'auto']} />
                                            <RechartsTooltip
                                                cursor={{ fill: '#f1f5f9' }}
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Bar dataKey="count" name="Members" radius={[6, 6, 0, 0]} onClick={(data) => handleChartClick(data, 'community')} style={{ cursor: 'pointer' }}>
                                                {(demographics.community || []).map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={getColor(index)} />
                                                ))}
                                                <LabelList dataKey="count" position="top" fill="#64748b" fontSize={12} />
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
                                            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} domain={[0, dataMax => dataMax + 2]} />
                                            <RechartsTooltip
                                                cursor={{ fill: '#f1f5f9' }}
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Bar dataKey="count" name="Members" fill="#10b981" radius={[6, 6, 0, 0]} onClick={(data) => handleChartClick(data, 'age')} style={{ cursor: 'pointer' }}>
                                                <LabelList dataKey="count" position="top" fill="#64748b" fontSize={12} />
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                </main >
            </div >
        </div >
    );
};

export default VillageDashboard;
