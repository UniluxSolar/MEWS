import React, { useState, useEffect } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';
import {
    FaUsers, FaBuilding, FaExclamationTriangle, FaChartPie, FaChartBar, FaMale, FaFemale, FaClock, FaChevronRight, FaMapMarkedAlt, FaTable
} from 'react-icons/fa';
import {
    PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList
} from 'recharts';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import StatCard from '../components/common/StatCard';
import DashboardHeader from '../components/common/DashboardHeader';

const DistrictPerformanceCard = ({ id, name, members, institutions, status, pending }) => {
    const navigate = useNavigate();
    return (
        <div
            onClick={() => navigate(`/admin/dashboard/district/${id}`)}
            className="block bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group cursor-pointer"
        >
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${status === 'Active' ? 'bg-amber-500' : 'bg-red-500'}`}></div>

            <div className="flex justify-between items-start mb-4 pl-2">
                <div>
                    <h3 className="font-bold text-[#1e2a4a] text-lg group-hover:text-amber-600 transition-colors flex items-center gap-2">
                        {name}
                        <FaChevronRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity text-amber-500" />
                    </h3>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${status === 'Active' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
                        {status || 'Active'}
                    </span>
                </div>
                <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shadow-inner">
                    <FaMapMarkedAlt size={16} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pl-2">
                <div className="bg-slate-50 rounded-lg p-2 text-center border border-slate-100">
                    <div className="text-xl font-bold text-slate-800">{(members || 0).toLocaleString()}</div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Members</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-2 text-center border border-slate-100">
                    <div className="text-xl font-bold text-slate-800">{(institutions || 0).toLocaleString()}</div>
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

const SuperAdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        members: 0,
        families: 0,
        institutions: 0,
        districts: []
    });
    const [demographics, setDemographics] = useState({
        gender: [],
        occupation: [],
        community: [],
        marital: [],
        age: [],
        bloodGroup: [],
        voter: [],
        employment: []
    });
    const [loading, setLoading] = useState(true);
    const [adminName, setAdminName] = useState('Super Admin');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const info = JSON.parse(sessionStorage.getItem('adminInfo') || '{}');
                setAdminName(info.name || 'Super Admin');

                const [statsRes, analyticsRes] = await Promise.all([
                    API.get('/admin/dashboard-stats'),
                    API.get('/admin/analytics')
                ]);

                const data = statsRes.data || {};
                setStats({
                    members: data.members || 0,
                    families: data.families || 0,
                    institutions: data.institutions || 0,
                    districts: data.districts || []
                });

                const analyticsData = analyticsRes.data || {};
                const demographicsData = analyticsData.demographics || {};

                const sanitize = (arr) => (arr || []).map(item => ({
                    ...item,
                    _id: item._id || 'Unknown',
                    count: item.count || 0
                }));

                const processAgeData = (data) => {
                    const order = ["Children", "Youth", "Young Adults", "Middle Age", "Elderly", "Senior"];
                    const sanitized = sanitize(data);
                    return order.map(label => {
                        const match = sanitized.find(d => d._id === label);
                        return { _id: label, count: match ? match.count : 0 };
                    });
                };

                setDemographics({
                    gender: sanitize(demographicsData.gender),
                    occupation: sanitize(demographicsData.occupation),
                    community: sanitize(demographicsData.caste).sort((a, b) => (b.count || 0) - (a.count || 0)),
                    marital: sanitize(demographicsData.marital),
                    age: processAgeData(demographicsData.age),
                    bloodGroup: sanitize(demographicsData.bloodGroup),
                    voter: sanitize(demographicsData.voter),
                    employment: sanitize(demographicsData.employment)
                });

            } catch (error) {
                console.error("Error fetching super admin data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const COLORS = ['#1e2a4a', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];
    const getColor = (index) => COLORS[index % COLORS.length];

    const handleChartClick = (type, value) => {
        navigate(`/admin/members?${type}=${value}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <AdminHeader />
                <div className="flex flex-1 overflow-hidden">
                    <AdminSidebar activePage="dashboard" />
                    <main className="flex-1 overflow-y-auto p-12 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
                            <p className="text-slate-500 font-bold animate-pulse">Loading Platform Overview...</p>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
            <AdminHeader />
            <div className="flex flex-1 overflow-hidden">
                <AdminSidebar activePage="dashboard" />

                <main className="flex-1 overflow-y-auto bg-slate-50">
                    <DashboardHeader
                        title="All Locations Dashboard"
                        subtitle="Here's what's happening in All Locations today. You have 0 new registrations to review."
                    />

                    <div className="px-4 md:px-8 -mt-10 pb-12 w-full space-y-8">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <StatCard
                                title="Total Members"
                                value={(stats.members || 0).toLocaleString()}
                                subtext="Registered across state"
                                icon={FaUsers}
                                color="bg-blue-600"
                                onClick={() => navigate('/admin/members')}
                            />
                            <StatCard
                                title="Institutions"
                                value={(stats.institutions || 0).toLocaleString()}
                                subtext="Educational & Medical"
                                icon={FaBuilding}
                                color="bg-indigo-600"
                                onClick={() => navigate('/admin/institutions')}
                            />
                            <StatCard
                                title="Total Families"
                                value={(stats.families || 0).toLocaleString()}
                                subtext="Unique households"
                                icon={FaUsers}
                                color="bg-emerald-600"
                                onClick={() => navigate('/admin/members')}
                            />
                        </div>

                        {/* Charts Section - Row 1 */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Gender Distribution */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 group hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-6">
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
                                <div className="h-72 w-full flex items-center justify-center">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={demographics.gender}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={90}
                                                paddingAngle={5}
                                                dataKey="count"
                                                nameKey="_id"
                                                label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}
                                                onClick={(data) => handleChartClick('gender', data._id)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                {demographics.gender.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry._id === 'Male' ? '#3b82f6' : entry._id === 'Female' ? '#ec4899' : '#10b981'} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip />

                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                                    <div className="p-3 bg-slate-50 rounded-xl">
                                        <p className="text-[10px] uppercase font-bold text-slate-400">Male</p>
                                        <p className="text-lg font-bold text-blue-600">{demographics.gender.find(g => g._id === 'Male')?.count || 0}</p>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-xl">
                                        <p className="text-[10px] uppercase font-bold text-slate-400">Female</p>
                                        <p className="text-lg font-bold text-pink-500">{demographics.gender.find(g => g._id === 'Female')?.count || 0}</p>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-xl">
                                        <p className="text-[10px] uppercase font-bold text-slate-400">Others</p>
                                        <p className="text-lg font-bold text-emerald-500">{demographics.gender.find(g => g._id === 'Other' || g._id === 'Others')?.count || 0}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Marital Status */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 group hover:shadow-md transition-shadow">
                                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-3">
                                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><FaChartBar /></div>
                                    Marital Status
                                </h3>
                                <div className="h-72 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={demographics.marital}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                            <RechartsTooltip cursor={{ fill: '#f8fafc' }} />
                                            <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} onClick={(data) => handleChartClick('maritalStatus', data._id)} style={{ cursor: 'pointer' }}>
                                                <LabelList dataKey="count" position="top" style={{ fontSize: '10px', fontWeight: 'bold' }} />
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Charts Section - Row 2 */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Blood Group Distribution */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 group hover:shadow-md transition-shadow">
                                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-3">
                                    <div className="p-2 bg-red-50 text-red-600 rounded-lg"><FaChartPie /></div>
                                    Blood Group Distribution
                                </h3>
                                <div className="h-72 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={demographics.bloodGroup}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={0}
                                                outerRadius={90}
                                                dataKey="count"
                                                nameKey="_id"
                                                label={({ _id }) => _id}
                                                onClick={(data) => handleChartClick('bloodGroup', data._id)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                {demographics.bloodGroup.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={getColor(index)} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip />
                                            <Legend layout="vertical" align="right" verticalAlign="middle" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Occupation Distribution */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 group hover:shadow-md transition-shadow">
                                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-3">
                                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><FaBuilding /></div>
                                    Top Occupations
                                </h3>
                                <div className="h-72 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={demographics.occupation} layout="vertical" margin={{ left: 30 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                            <XAxis type="number" hide />
                                            <YAxis dataKey="_id" type="category" axisLine={false} tickLine={false} width={100} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} />
                                            <RechartsTooltip cursor={{ fill: '#f8fafc' }} />
                                            <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} onClick={(data) => handleChartClick('occupation', data._id)} style={{ cursor: 'pointer' }}>
                                                <LabelList dataKey="count" position="right" style={{ fontSize: '10px', fontWeight: 'bold' }} />
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Charts Section - Row 3 */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Employment Status */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 group hover:shadow-md transition-shadow">
                                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-3">
                                    <div className="p-2 bg-cyan-50 text-cyan-600 rounded-lg"><FaUsers /></div>
                                    Employment Status
                                </h3>
                                <div className="h-72 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={demographics.employment}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={90}
                                                paddingAngle={5}
                                                dataKey="count"
                                                nameKey="_id"
                                                label={({ _id, percent }) => `${(percent * 100).toFixed(0)}%`}
                                                onClick={(data) => handleChartClick('occupation', data._id === 'Employed' ? 'Farmer' : 'none')}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                {demographics.employment.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry._id === 'Employed' ? '#0891b2' : '#94a3b8'} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip />
                                            <Legend verticalAlign="bottom" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Voter Statistics */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 group hover:shadow-md transition-shadow">
                                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-3">
                                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><FaTable /></div>
                                    Voter Statistics (18+)
                                </h3>
                                <div className="h-72 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={demographics.voter}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                            <RechartsTooltip cursor={{ fill: '#f8fafc' }} />
                                            <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} onClick={(data) => handleChartClick('age', data._id === 'Voter' ? '25' : '10')} style={{ cursor: 'pointer' }}>
                                                <LabelList dataKey="count" position="top" style={{ fontSize: '10px', fontWeight: 'bold' }} />
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Districts Breakdown Table */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                                    <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><FaMapMarkedAlt /></div>
                                    District Wise Performance
                                </h3>
                                <button
                                    onClick={() => navigate('/admin/management')}
                                    className="text-sm font-bold text-blue-600 hover:text-blue-800 transition"
                                >
                                    Manage Districts
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50/50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                            <th className="px-6 py-4">District</th>
                                            <th className="px-6 py-4 text-center">Members</th>
                                            <th className="px-6 py-4 text-center">Institutions</th>
                                            <th className="px-6 py-4 text-center">Verification</th>
                                            <th className="px-6 py-4 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {stats.districts.map((dist, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{dist.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Active District</p>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="font-bold text-slate-700">{(dist.members || 0).toLocaleString()}</span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="font-bold text-slate-600">{dist.institutions || 0}</span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {dist.pending > 0 ? (
                                                        <span className="px-2 py-1 rounded-full bg-orange-50 text-orange-600 text-[10px] font-bold border border-orange-100">
                                                            {dist.pending} Pending
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-100">
                                                            Verified
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() => navigate(`/admin/dashboard/district/${dist.id}`)}
                                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    >
                                                        <FaChevronRight />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Charts Section - Final Row (Community & Age) */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Community / Sub-Castes */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 group hover:shadow-md transition-shadow lg:col-span-1">
                                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-3">
                                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><FaUsers /></div>
                                    Community / Sub-Castes
                                </h3>
                                <div className="h-72 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={demographics.community}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b', fontWeight: 'bold' }} interval={0} angle={-30} textAnchor="end" height={60} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                            <RechartsTooltip cursor={{ fill: '#f8fafc' }} />
                                            <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} onClick={(data) => handleChartClick('caste', data._id)} style={{ cursor: 'pointer' }}>
                                                <LabelList dataKey="count" position="top" style={{ fontSize: '10px', fontWeight: 'bold' }} />
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Age Demographics */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 group hover:shadow-md transition-shadow lg:col-span-1">
                                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-3">
                                    <div className="p-2 bg-pink-50 text-pink-600 rounded-lg"><FaChartBar /></div>
                                    Age Demographics
                                </h3>
                                <div className="h-72 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={demographics.age}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 'bold' }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                            <RechartsTooltip cursor={{ fill: '#f8fafc' }} />
                                            <Bar dataKey="count" fill="#ec4899" radius={[6, 6, 0, 0]} style={{ cursor: 'pointer' }}>
                                                <LabelList dataKey="count" position="top" style={{ fontSize: '10px', fontWeight: 'bold' }} />
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
