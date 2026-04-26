import React, { useState, useEffect } from 'react';
import API from '../api';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
    FaThLarge, FaUsers, FaBuilding, FaExclamationTriangle, FaFileAlt,
    FaHandHoldingUsd, FaChartLine, FaCog, FaQuestionCircle, FaBullhorn,
    FaSignOutAlt, FaSearch, FaBell, FaChevronDown, FaUserPlus, FaCheckCircle, FaClock,
    FaChartPie, FaChartBar, FaCalendarAlt, FaRing, FaMale, FaFemale, FaCity,
    FaMapMarkedAlt, FaTable
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

// Map Imports
import { MapContainer, TileLayer, Marker, Popup, LayersControl } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// --- COMPONENTS ---

const VillagePerformanceCard = ({ id, name, members, institutions, status, pending }) => {
    const navigate = useNavigate();
    return (
        <div
            onClick={() => navigate(`/admin/dashboard/village/${id}`)}
            className="block bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group cursor-pointer"
        >
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>

            <div className="flex justify-between items-start mb-4 pl-2">
                <div>
                    <h3 className="font-bold text-[#1e2a4a] text-lg group-hover:text-blue-600 transition-colors flex items-center gap-2">
                        {name}
                        <FaChevronRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-500" />
                    </h3>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                        {status}
                    </span>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
                    <FaUsers size={16} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pl-2">
                <div className="bg-slate-50 rounded-lg p-2 text-center border border-slate-100">
                    <div className="text-xl font-bold text-slate-800">{members.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Members</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-2 text-center border border-slate-100">
                    <div className="text-xl font-bold text-slate-800">{institutions}</div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Institutions</div>
                </div>
            </div>

            {pending > 0 && (
                <div className="mt-4 flex items-center gap-2 text-xs font-bold text-orange-600 bg-orange-50 px-3 py-2 rounded-lg border border-orange-100 animate-pulse">
                    <FaClock /> {pending} Verification{pending !== 1 && 's'} Pending
                </div>
            )}
        </div>
    );
};

const MunicipalityDashboard = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // URL Param if drill-down (from District Dashboard)

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

        // Preserve Municipality Context when clicking charts
        if (query) {
            // Using logic similar to VillageDashboard but setting 'municipality' param if backend supports it
            // Assuming AdminMembers supports filtering by Municipality if implicit from context or if passed?
            // Currently AdminMembers typically filters by context logic. 
            // If we are drilled down, we need to pass locationId? 
            if (id) {
                query += `&locationId=${id}`;
            }
            navigate(`/admin/members${query}`);
        }
    };

    const [stats, setStats] = useState({
        locationName: 'Municipality',
        members: 0,
        families: 0,
        pendingMembers: 0,
        institutions: 0,
        sos: 0,
        villages: [] // Initialize villages
    });
    
    const [viewMode, setViewMode] = useState('cards'); // 'table', 'cards', 'map'

    const [demographics, setDemographics] = useState({
        gender: [], occupation: [], caste: [], marital: [], age: [], bloodGroup: [], voter: [], employment: []
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Parallel fetching of dashboard stats and analytics
                const query = id ? `?locationId=${id}` : ''; // API Drill Down

                const [statsRes, analyticsRes] = await Promise.all([
                    API.get(`/admin/dashboard-stats${query}`),
                    API.get(`/admin/analytics${query}`)
                ]);

                const data = statsRes.data;
                setStats({
                    locationName: data.locationName || 'Municipality',
                    members: data.members,
                    families: data.families || data.members,
                    pendingMembers: data.pendingMembers || 0,
                    institutions: data.institutions || 0,
                    sos: data.sosAlerts || 0,
                    villages: data.villages || []
                });

                const analyticsData = analyticsRes.data;
                console.log("Analytics Data Received:", analyticsData);

                // Helper to sanitise data
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
                            originalKey: cat.key
                        };
                    });
                };

                setDemographics({
                    gender: sanitize(analyticsData.demographics.gender),
                    occupation: sanitize(analyticsData.demographics.occupation),
                    community: sanitize(analyticsData.demographics.caste).sort((a, b) => b.count - a.count),
                    marital: sanitize(analyticsData.demographics.marital),

                    age: processAgeData(analyticsData.demographics.age),
                    bloodGroup: sanitize(analyticsData.demographics.bloodGroup),
                    voter: sanitize(analyticsData.demographics.voter),
                    employment: sanitize(analyticsData.demographics.employment)
                });

            } catch (error) {
                console.error("Error fetching municipality stats/analytics", error);
            }
        };
        fetchStats();
    }, [id]);

    const getColor = (index) => {
        const colors = ['#3b82f6', '#ec4899', '#8b5cf6', '#10b981', '#f97316', '#6366f1', '#f43f5e'];
        return colors[index % colors.length];
    };

    const genderData = demographics.gender.map(g => ({
        name: g._id,
        value: g.count,
        color: g._id === 'Male' ? '#3b82f6' : g._id === 'Female' ? '#ec4899' : '#10b981'
    }));

    // --- MAP HELPERS ---
    const getCoordinates = (inputString) => {
        // Hash based generation as placeholder 
        let hash = 0;
        for (let i = 0; i < inputString.length; i++) hash = inputString.charCodeAt(i) + ((hash << 5) - hash);
        const latBase = ((hash % 1000) - 500) / 30000;
        const lngBase = (((hash >> 5) % 1000) - 500) / 30000;
        return [17.0500 + latBase, 79.2667 + lngBase];
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
            <AdminHeader locationName={stats.locationName} />
            <div className="flex flex-1 overflow-hidden">
                <AdminSidebar activePage="dashboard" />

                {/* Main Content */}
                <main id="admin-dashboard-content" className="flex-1 overflow-y-auto bg-slate-50">
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
                                onClick={() => {
                                    const query = id ? `?locationId=${id}` : '';
                                    navigate(`/admin/members${query}`);
                                }}
                            />
                            <StatCard
                                title="Institutions"
                                value={stats.institutions.toLocaleString()}
                                subtext="Registered & Verified"
                                icon={FaBuilding}
                                color="bg-blue-500"
                                onClick={() => {
                                    const query = id ? `?locationId=${id}` : '';
                                    navigate(`/admin/institutions${query}`);
                                }}
                            />
                            <StatCard
                                title="Total Families"
                                value={stats.families.toLocaleString()}
                                subtext="Registered Households"
                                icon={FaUsers}
                                color="bg-orange-500"
                                onClick={() => {
                                    const query = id ? `?locationId=${id}` : '';
                                    navigate(`/admin/members${query}`);
                                }}
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
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 group hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-6 border-b pb-4">
                                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FaMale /></div>
                                            Gender Distribution
                                        </h3>
                                        <div className="flex flex-col gap-1 text-[10px] font-bold uppercase tracking-wider">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 bg-[#ec4899] rounded-sm"></div>
                                                <span className="text-slate-400">Female</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 bg-[#3b82f6] rounded-sm"></div>
                                                <span className="text-slate-400">Male</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 bg-[#94a3b8] rounded-sm"></div>
                                                <span className="text-slate-400">Others</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="h-64 w-full flex items-center justify-center">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={genderData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                    onClick={(data) => handleChartClick(data, 'gender')}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    {genderData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />

                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    {/* Gender Stat Cards - Super Admin Style */}
                                    <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                                        <div className="p-3 bg-slate-50 rounded-xl">
                                            <p className="text-[10px] uppercase font-bold text-slate-400">Male</p>
                                            <p className="text-lg font-bold text-blue-600">
                                                {demographics.gender.find(g => (g._id || '').toLowerCase() === 'male')?.count || 0}
                                            </p>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-xl">
                                            <p className="text-[10px] uppercase font-bold text-slate-400">Female</p>
                                            <p className="text-lg font-bold text-pink-500">
                                                {demographics.gender.find(g => (g._id || '').toLowerCase() === 'female')?.count || 0}
                                            </p>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-xl">
                                            <p className="text-[10px] uppercase font-bold text-slate-400">Others</p>
                                            <p className="text-lg font-bold text-emerald-500">
                                                {demographics.gender.find(g => (g._id || '').toLowerCase() === 'other' || (g._id || '').toLowerCase() === 'others')?.count || 0}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Marital Status */}
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 min-w-0">
                                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-3 mb-6 border-b pb-4">
                                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><FaChartBar /></div>
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
                                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-3 mb-6 border-b pb-4">
                                        <div className="p-2 bg-red-50 text-red-600 rounded-lg"><FaChartPie /></div>
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
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-3 mb-6 border-b pb-4">
                                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><FaBuilding /></div>
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
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-3 mb-6 border-b pb-4">
                                    <div className="p-2 bg-cyan-50 text-cyan-600 rounded-lg"><FaUsers /></div>
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
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-3 mb-6 border-b pb-4">
                                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><FaTable /></div>
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
                                    Community - Sub Castes
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

                            {/* VILLAGE PERFORMANCE GRID */}
                            <div className="space-y-4" id="village-breakdown">
                                <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
                                    <h2 className="text-xl font-bold text-[#1e2a4a] border-l-4 border-[#f59e0b] pl-3">
                                        Village Breakdown
                                    </h2>

                                    {/* View Toggle */}
                                    <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                                        <button
                                            onClick={() => setViewMode('cards')}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'cards' ? 'bg-[#1e2a4a] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                                        >
                                            <FaThLarge /> Cards
                                        </button>
                                        <button
                                            onClick={() => setViewMode('table')}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'table' ? 'bg-[#1e2a4a] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                                        >
                                            <FaTable /> Table
                                        </button>
                                        <button
                                            onClick={() => setViewMode('map')}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'map' ? 'bg-[#1e2a4a] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                                        >
                                            <FaMapMarkedAlt /> Map
                                        </button>
                                    </div>
                                </div>

                                {/* CONTENT AREA */}
                                {!stats.villages || stats.villages.length === 0 ? (
                                    <div className="p-12 text-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-300">
                                        No villages found in this municipality.
                                    </div>
                                ) : (
                                    <>
                                        {/* CARDS VIEW */}
                                        {viewMode === 'cards' && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                                {stats.villages.map((village, idx) => (
                                                    <VillagePerformanceCard
                                                        key={`vill-${idx}`}
                                                        id={village.id}
                                                        name={village.name}
                                                        members={village.members}
                                                        institutions={village.institutions}
                                                        status={village.status}
                                                        pending={village.pending}
                                                    />
                                                ))}
                                            </div>
                                        )}

                                        {/* TABLE VIEW */}
                                        {viewMode === 'table' && (
                                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-left text-sm">
                                                        <thead>
                                                            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                                <th className="px-6 py-4">Village/Ward Name</th>
                                                                <th className="px-6 py-4 text-center">Members</th>
                                                                <th className="px-6 py-4 text-center">Institutions</th>
                                                                <th className="px-6 py-4 text-center">Pending Verifications</th>
                                                                <th className="px-6 py-4 text-center">Status</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-100">
                                                            {stats.villages.map((village, idx) => (
                                                                <tr key={idx} className="hover:bg-blue-50/50 transition-colors group">
                                                                    <td
                                                                        className="px-6 py-4 font-bold text-[#1e2a4a] hover:text-blue-600 cursor-pointer transition-colors"
                                                                        onClick={() => navigate(`/admin/dashboard/village/${village.id}`)}
                                                                    >
                                                                        {village.name}
                                                                    </td>
                                                                    <td className="px-6 py-4 text-center text-slate-600 font-medium">{village.members}</td>
                                                                    <td className="px-6 py-4 text-center text-slate-600 font-medium">{village.institutions}</td>
                                                                    <td className="px-6 py-4 text-center">
                                                                        {village.pending > 0 ? (
                                                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200">
                                                                                {village.pending} Pending
                                                                            </span>
                                                                        ) : (
                                                                            <span className="text-slate-400">-</span>
                                                                        )}
                                                                    </td>
                                                                    <td className="px-6 py-4 text-center">
                                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${village.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                                                                            {village.status}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}

                                        {/* MAP VIEW */}
                                        {viewMode === 'map' && (
                                            <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 h-[600px] overflow-hidden relative">
                                                <MapContainer center={[17.0500, 79.2667]} zoom={10} style={{ height: '100%', width: '100%', borderRadius: '12px' }} scrollWheelZoom={false}>
                                                    <LayersControl position="topright">
                                                        <LayersControl.BaseLayer checked name="Standard">
                                                            <TileLayer
                                                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                            />
                                                        </LayersControl.BaseLayer>
                                                        <LayersControl.BaseLayer name="Satellite">
                                                            <TileLayer
                                                                attribution='Esri'
                                                                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                                                            />
                                                        </LayersControl.BaseLayer>
                                                    </LayersControl>
                                                    {stats.villages.map((village, idx) => (
                                                        <Marker key={idx} position={getCoordinates(village.name)}>
                                                            <Popup>
                                                                <div className="text-center p-2">
                                                                    <h3 className="font-bold text-sm mb-1">{village.name}</h3>
                                                                    <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                                                                        <div className="bg-blue-50 p-1 rounded">Mem: <b>{village.members}</b></div>
                                                                        <div className="bg-slate-50 p-1 rounded">Inst: <b>{village.institutions}</b></div>
                                                                    </div>
                                                                    <Link to={`/admin/dashboard/village/${village.id}`} className="block w-full bg-[#1e2a4a] text-white text-[10px] font-bold py-1 px-2 rounded hover:bg-blue-800 transition">
                                                                        View Dashboard
                                                                    </Link>
                                                                </div>
                                                            </Popup>
                                                        </Marker>
                                                    ))}
                                                </MapContainer>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </main >
            </div >
        </div >
    );
};

export default MunicipalityDashboard;
