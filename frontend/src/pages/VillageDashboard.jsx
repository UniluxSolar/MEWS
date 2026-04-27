import React, { useState, useEffect } from 'react';
import API from '../api';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
    FaThLarge, FaUsers, FaBuilding, FaExclamationTriangle, FaFileAlt,
    FaHandHoldingUsd, FaChartLine, FaCog, FaQuestionCircle, FaBullhorn,
    FaSignOutAlt, FaSearch, FaBell, FaChevronDown, FaUserPlus, FaCheckCircle, FaClock,
    FaChartPie, FaChartBar, FaCalendarAlt, FaRing, FaMale, FaFemale, FaTable, FaMapMarkedAlt
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
    const { id } = useParams(); // URL Param if drill-down
    const [stats, setStats] = useState({
        locationName: 'Village',
        members: 0,
        families: 0,
        pendingMembers: 0,
        institutions: 0,
        sos: 0
    });
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const [demographics, setDemographics] = useState({
        gender: [], occupation: [], caste: [], marital: [], age: [], bloodGroup: [], voter: [], employment: []
    });

    const adminInfo = JSON.parse(sessionStorage.getItem('adminInfo') || sessionStorage.getItem('savedUser') || '{}');
    const isWard = (adminInfo.role === 'WARD_ADMIN') || (stats.locationName && stats.locationName.toLowerCase().includes('ward'));
    const label = isWard ? 'Ward' : 'Village';

    const handleChartClick = (data, type) => {
        if (!data) return;
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

        if (query) {
            if (stats.locationName && stats.locationName !== label) {
                query += `&villages=${encodeURIComponent(stats.locationName)}`;
            }
            navigate(`/admin/members${query}`);
        }
    };

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const query = id ? `?locationId=${id}` : ''; // API Drill Down

                const [statsRes, analyticsRes] = await Promise.all([
                    API.get(`/admin/dashboard-stats${query}`),
                    API.get(`/admin/analytics${query}`)
                ]);

                const data = statsRes.data;
                setStats({
                    locationName: data.locationName || 'Village',
                    members: data.members,
                    families: data.families || data.members, 
                    pendingMembers: data.pendingMembers || 0,
                    institutions: data.institutions || 0,
                    sos: data.sosAlerts || 0
                });

                const analyticsData = analyticsRes.data;

                const sanitize = (arr) => (arr || []).map(item => ({
                    ...item,
                    _id: item._id || 'Unknown'
                }));

                const processAgeData = (backendData) => {
                    const categories = [
                        { key: "Children", label: "0-14" },
                        { key: "Youth", label: "15-24" },
                        { key: "Young Adults", label: "25-44" },
                        { key: "Middle Age", label: "45-59" },
                        { key: "Elderly", label: "60-74" },
                        { key: "Senior", label: "75+" }
                    ];

                    return categories.map(cat => {
                        const found = (backendData || []).find(item => item && item._id === cat.key);
                        return {
                            _id: cat.label,
                            count: found ? found.count : 0,
                            originalKey: cat.key 
                        };
                    });
                };

                setDemographics({
                    gender: sanitize(analyticsData?.demographics?.gender),
                    occupation: sanitize(analyticsData?.demographics?.occupation),
                    community: sanitize(analyticsData?.demographics?.caste || analyticsData?.demographics?.community).sort((a, b) => (b.count || 0) - (a.count || 0)),
                    marital: sanitize(analyticsData?.demographics?.marital),
                    age: processAgeData(analyticsData?.demographics?.age),
                    bloodGroup: sanitize(analyticsData?.demographics?.bloodGroup),
                    voter: sanitize(analyticsData?.demographics?.voter),
                    employment: sanitize(analyticsData?.demographics?.employment)
                });

            } catch (error) {
                console.error("Error fetching village stats/analytics", error);
            }
        };
        fetchStats();
    }, [id]);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
        window.dispatchEvent(new CustomEvent('toggle-admin-sidebar'));
    };

    const getColor = (index) => {
        const colors = ['#3b82f6', '#ec4899', '#8b5cf6', '#10b981', '#f97316', '#6366f1', '#f43f5e'];
        return colors[index % colors.length];
    };

    const genderData = demographics.gender.map(g => ({
        name: g._id,
        value: g.count,
        color: g._id === 'Male' ? '#3b82f6' : g._id === 'Female' ? '#ec4899' : '#10b981'
    }));

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col overflow-hidden">
            <AdminHeader onToggleSidebar={toggleSidebar} />
            <div className="flex flex-1 overflow-hidden relative">
                <AdminSidebar activePage="dashboard" showMobileHeader={false} />

                <main className="flex-1 overflow-y-auto bg-slate-50">
                    <DashboardHeader
                        title={`${stats.locationName} Overview`}
                        subtitle={isWard ? "Ward Administration Panel" : "Village Administration Panel"}
                    />

                    <div className="px-4 md:px-8 -mt-6 md:-mt-10 pb-12 w-full space-y-6 md:space-y-8 relative z-10">

                        {/* 1. STATS OVERVIEW CARDS */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 animate-in slide-in-from-bottom-4 duration-500">
                            <StatCard
                                title="Total Members"
                                value={(Number(stats.members) || 0).toLocaleString()}
                                subtext="Verified Residents"
                                icon={FaUsers}
                                color="bg-emerald-500"
                                onClick={() => navigate(`/admin/members?villages=${encodeURIComponent(stats.locationName)}`)}
                            />
                            <StatCard
                                title="Institutions"
                                value={(Number(stats.institutions) || 0).toLocaleString()}
                                subtext="Local Facilities"
                                icon={FaBuilding}
                                color="bg-blue-500"
                                onClick={() => navigate(`/admin/institutions?villages=${encodeURIComponent(stats.locationName)}`)}
                            />
                            <StatCard
                                title="Total Families"
                                value={(Number(stats.families) || 0).toLocaleString()}
                                subtext="Registered Households"
                                icon={FaUsers}
                                color="bg-orange-500"
                                onClick={() => navigate(`/admin/members?villages=${encodeURIComponent(stats.locationName)}`)}
                            />
                        </div>

                        {/* 2. DEMOGRAPHICS GRID */}
                        <div className="space-y-6 md:space-y-8">
                            <div className="flex items-center gap-3 ml-1">
                                <div className="p-2 bg-blue-100 text-blue-700 rounded-lg shadow-sm">
                                    <FaChartPie size={18} />
                                </div>
                                <h2 className="text-lg md:text-xl font-bold text-slate-800">Population Analytics</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                {/* Gender Distribution */}
                                <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100 group hover:shadow-md transition-all">
                                    <h3 className="text-sm md:text-base font-bold text-slate-800 flex items-center gap-3 mb-6 border-b pb-4">
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FaMale size={14} /></div>
                                        Gender Distribution
                                    </h3>
                                    <div className="h-60 w-full flex items-center justify-center">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={genderData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={50}
                                                    outerRadius={window.innerWidth < 640 ? 70 : 80}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                                                    onClick={(data) => handleChartClick(data, 'gender')}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    {genderData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                                        <div className="p-2 bg-slate-50 rounded-xl">
                                            <p className="text-[9px] uppercase font-bold text-slate-400">Male</p>
                                            <p className="text-sm md:text-lg font-black text-blue-600">
                                                {demographics.gender.find(g => (g._id || '').toLowerCase() === 'male')?.count || 0}
                                            </p>
                                        </div>
                                        <div className="p-2 bg-slate-50 rounded-xl">
                                            <p className="text-[9px] uppercase font-bold text-slate-400">Female</p>
                                            <p className="text-sm md:text-lg font-black text-pink-500">
                                                {demographics.gender.find(g => (g._id || '').toLowerCase() === 'female')?.count || 0}
                                            </p>
                                        </div>
                                        <div className="p-2 bg-slate-50 rounded-xl">
                                            <p className="text-[9px] uppercase font-bold text-slate-400">Other</p>
                                            <p className="text-sm md:text-lg font-black text-emerald-500">
                                                {demographics.gender.find(g => ['other', 'others'].includes((g._id || '').toLowerCase()))?.count || 0}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Marital Status */}
                                <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100 group hover:shadow-md transition-all">
                                    <h3 className="text-sm md:text-base font-bold text-slate-800 flex items-center gap-3 mb-6 border-b pb-4">
                                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><FaRing size={14} /></div>
                                        Marital Status
                                    </h3>
                                    <div className="h-60 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={(demographics.marital || []).length > 0 ? demographics.marital : [{_id: 'N/A', count: 0}]}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={0}
                                                    outerRadius={window.innerWidth < 640 ? 70 : 80}
                                                    dataKey="count"
                                                    nameKey="_id"
                                                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                                                >
                                                    {(demographics.marital || []).map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={getColor(index + 2)} strokeWidth={2} stroke="#fff" onClick={() => handleChartClick(entry, 'marital')} style={{ cursor: 'pointer' }} />
                                                    ))}
                                                </Pie>
                                                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Blood Group */}
                                <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100 group hover:shadow-md transition-all">
                                    <h3 className="text-sm md:text-base font-bold text-slate-800 flex items-center gap-3 mb-6 border-b pb-4">
                                        <div className="p-2 bg-red-50 text-red-600 rounded-lg"><FaHandHoldingUsd size={14} /></div>
                                        Blood Groups
                                    </h3>
                                    <div className="h-60 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={demographics.bloodGroup || []}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={50}
                                                    outerRadius={window.innerWidth < 640 ? 70 : 80}
                                                    paddingAngle={2}
                                                    dataKey="count"
                                                    nameKey="_id"
                                                    label={({ name }) => name}
                                                >
                                                    {(demographics.bloodGroup || []).map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={getColor(index)} strokeWidth={0} onClick={() => handleChartClick(entry, 'bloodGroup')} style={{ cursor: 'pointer' }} />
                                                    ))}
                                                </Pie>
                                                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                                {/* Sub-Castes Bar Chart */}
                                <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100 group hover:shadow-md transition-all">
                                    <h3 className="text-sm md:text-base font-bold text-slate-800 flex items-center gap-3 mb-6 border-b pb-4">
                                        <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><FaUsers size={14} /></div>
                                        Sub-Caste Distribution
                                    </h3>
                                    <div className="h-72 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={demographics.community || []} barSize={window.innerWidth < 640 ? 20 : 30}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis 
                                                    dataKey="_id" 
                                                    tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} 
                                                    axisLine={false} 
                                                    tickLine={false} 
                                                    interval={0}
                                                    angle={window.innerWidth < 640 ? -45 : 0}
                                                    textAnchor={window.innerWidth < 640 ? "end" : "middle"}
                                                    height={window.innerWidth < 640 ? 60 : 30}
                                                />
                                                <YAxis hide />
                                                <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                                <Bar dataKey="count" radius={[4, 4, 0, 0]} onClick={(data) => handleChartClick(data, 'community')} style={{ cursor: 'pointer' }}>
                                                    {(demographics.community || []).map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={getColor(index)} />
                                                    ))}
                                                    <LabelList dataKey="count" position="top" fill="#64748b" fontSize={10} fontWeight={700} />
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Age Demographics Bar Chart */}
                                <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100 group hover:shadow-md transition-all">
                                    <h3 className="text-sm md:text-base font-bold text-slate-800 flex items-center gap-3 mb-6 border-b pb-4">
                                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><FaCalendarAlt size={14} /></div>
                                        Age Groups
                                    </h3>
                                    <div className="h-72 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={demographics.age || []} barSize={window.innerWidth < 640 ? 20 : 30}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis 
                                                    dataKey="_id" 
                                                    tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} 
                                                    axisLine={false} 
                                                    tickLine={false} 
                                                    interval={0}
                                                    angle={window.innerWidth < 640 ? -45 : 0}
                                                    textAnchor={window.innerWidth < 640 ? "end" : "middle"}
                                                    height={window.innerWidth < 640 ? 60 : 30}
                                                />
                                                <YAxis hide />
                                                <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} onClick={(data) => handleChartClick(data, 'age')} style={{ cursor: 'pointer' }}>
                                                    <LabelList dataKey="count" position="top" fill="#64748b" fontSize={10} fontWeight={700} />
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                {/* Occupation Pie */}
                                <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100 group hover:shadow-md transition-all">
                                    <h3 className="text-sm md:text-base font-bold text-slate-800 flex items-center gap-3 mb-6 border-b pb-4">
                                        <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><FaBuilding size={14} /></div>
                                        Occupations
                                    </h3>
                                    <div className="h-60 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={demographics.occupation || []}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={50}
                                                    outerRadius={window.innerWidth < 640 ? 70 : 80}
                                                    dataKey="count"
                                                    nameKey="_id"
                                                >
                                                    {(demographics.occupation || []).map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={getColor(index + 3)} onClick={() => handleChartClick(entry, 'occupation')} style={{ cursor: 'pointer' }} />
                                                    ))}
                                                </Pie>
                                                <RechartsTooltip contentStyle={{ borderRadius: '12px' }} />
                                                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Employment Status Pie */}
                                <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100 group hover:shadow-md transition-all">
                                    <h3 className="text-sm md:text-base font-bold text-slate-800 flex items-center gap-3 mb-6 border-b pb-4">
                                        <div className="p-2 bg-cyan-50 text-cyan-600 rounded-lg"><FaUsers size={14} /></div>
                                        Employment
                                    </h3>
                                    <div className="h-60 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={demographics.employment || []}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={0}
                                                    outerRadius={window.innerWidth < 640 ? 70 : 80}
                                                    dataKey="count"
                                                    nameKey="_id"
                                                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                                                >
                                                    {(demographics.employment || []).map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry._id === 'Employed' ? '#3b82f6' : '#94a3b8'} strokeWidth={2} stroke="#fff" onClick={() => handleChartClick(entry, 'employment')} style={{ cursor: 'pointer' }} />
                                                    ))}
                                                </Pie>
                                                <RechartsTooltip contentStyle={{ borderRadius: '12px' }} />
                                                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Voter Status Pie */}
                                <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100 group hover:shadow-md transition-all">
                                    <h3 className="text-sm md:text-base font-bold text-slate-800 flex items-center gap-3 mb-6 border-b pb-4">
                                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><FaTable size={14} /></div>
                                        Voters
                                    </h3>
                                    <div className="h-60 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={demographics.voter || []}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={0}
                                                    outerRadius={window.innerWidth < 640 ? 70 : 80}
                                                    dataKey="count"
                                                    nameKey="_id"
                                                    label={({ count }) => count}
                                                >
                                                    {(demographics.voter || []).map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry._id === 'Voter' ? '#10b981' : '#f43f5e'} strokeWidth={2} stroke="#fff" onClick={() => handleChartClick(entry, 'voter')} style={{ cursor: 'pointer' }} />
                                                    ))}
                                                </Pie>
                                                <RechartsTooltip contentStyle={{ borderRadius: '12px' }} />
                                                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default VillageDashboard;
