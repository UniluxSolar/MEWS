import React, { useState, useEffect } from 'react';
import API from '../api';
import { useNavigate, Link } from 'react-router-dom';
import {
    FaUsers, FaBuilding, FaExclamationTriangle, FaFileAlt,
    FaMapMarkedAlt, FaClock, FaTable, FaThLarge, FaMapMarkerAlt,
    FaChevronRight, FaChartPie, FaChartBar
} from 'react-icons/fa';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import StatCard from '../components/common/StatCard';
import ActionCard from '../components/common/ActionCard';
import DashboardHeader from '../components/common/DashboardHeader';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList
} from 'recharts';

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

const MandalPerformanceCard = ({ name, members, institutions, status, pending }) => (
    <Link
        to={`/admin/members?villages=${encodeURIComponent(name)}`} // Filtering by Mandal name roughly works if simple string match, but ideally distinct filter. Using village filter for now as robust "Location" search.
        className="block bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
    >
        {/* Status Indicator Bar */}
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>

        {/* Header */}
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
            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
                <FaMapMarkedAlt size={16} />
            </div>
        </div>

        {/* Stats Grid */}
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

        {/* Pending Alerts */}
        {pending > 0 && (
            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-orange-600 bg-orange-50 px-3 py-2 rounded-lg border border-orange-100 animate-pulse">
                <FaClock /> {pending} Verification{pending !== 1 && 's'} Pending
            </div>
        )}
    </Link>
);

const DistrictDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        locationName: 'District',
        members: 0,
        institutions: 0,
        sos: 0,
        mandals: []
    });
    const [analytics, setAnalytics] = useState(null); // For charts
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('cards'); // 'table', 'cards', 'map'
    const [userName, setUserName] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const adminInfo = JSON.parse(localStorage.getItem('adminInfo'));
                setUserName(adminInfo?.name || 'District Admin');

                // Parallel Fetching
                const [statsRes, analyticsRes] = await Promise.all([
                    API.get('/admin/dashboard-stats'),
                    API.get('/admin/analytics')
                ]);

                // Set Basic Stats
                setStats({
                    locationName: statsRes.data.locationName,
                    members: statsRes.data.members,
                    institutions: statsRes.data.institutions || 0,
                    sos: statsRes.data.sosAlerts || 0,
                    mandals: statsRes.data.mandals || []
                });

                // Set Analytics for Charts
                setAnalytics(analyticsRes.data);

            } catch (error) {
                console.error("Error fetching dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // --- CHART DATA PREPARATION ---

    // 1. Mandal Member Distribution (Bar Chart)
    const mandalChartData = stats.mandals
        .map(v => ({ name: v.name, members: v.members }))
        .sort((a, b) => b.members - a.members)
        .slice(0, 10); // Top 10 mandals

    // 2. Gender Distribution (Pie Chart)
    const genderData = analytics?.demographics?.gender?.map(g => ({
        name: g._id,
        value: g.count,
        color: g._id === 'Male' ? '#3B82F6' : g._id === 'Female' ? '#EC4899' : '#10B981'
    })) || [];

    // --- MAP HELPERS ---
    const getCoordinates = (inputString) => {
        // Mock Coordinates (Centroid)
        // Ideally fetch real lat/lng
        const VILLAGE_COORDINATES = {
            'Nalgonda': [17.0500, 79.2667],
            'Adavdevulapally': [17.0908, 79.4161],
            'Addagudur': [17.3975, 79.3761],
            'Nakrekal': [17.1666, 79.4299],
            'Miryalaguda': [16.8741, 79.5694],
            'Suryapet': [17.1415, 79.6236],
            'Munugode': [17.0667, 79.0833]
        };

        const key = Object.keys(VILLAGE_COORDINATES).find(k => inputString.includes(k));
        if (key) return VILLAGE_COORDINATES[key];

        let hash = 0;
        for (let i = 0; i < inputString.length; i++) hash = inputString.charCodeAt(i) + ((hash << 5) - hash);
        const latBase = ((hash % 1000) - 500) / 10000;
        const lngBase = (((hash >> 5) % 1000) - 500) / 10000;
        return [17.0500 + latBase, 79.2667 + lngBase];
    };

    return (
        <div className="min-h-screen bg-slate-50/50 font-sans flex flex-col">
            <AdminHeader />
            <div className="flex flex-1 overflow-hidden">
                <AdminSidebar activePage="dashboard" />

                <main id="admin-dashboard-content" className="flex-1 overflow-y-auto bg-slate-50">
                    <div id="location-card-scroll-target">
                        <DashboardHeader
                            title={`District Overview`}
                            subtitle={stats.locationName}
                            breadcrumb={<span className="text-white/80">{stats.locationName}</span>}
                        >
                            <div className="text-right text-white">
                                <p className="text-xs opacity-80">Welcome back,</p>
                                <p className="text-lg font-bold">{userName}</p>
                            </div>
                        </DashboardHeader>

                        <div className="px-4 md:px-8 -mt-10 pb-12 w-full space-y-8">

                            {/* 1. STATS OVERVIEW CARDS */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-bottom-4 duration-500">
                                <StatCard
                                    title="Total Members"
                                    value={stats.members.toLocaleString()}
                                    subtext={`Across ${stats.mandals.length} Mandals`}
                                    icon={FaUsers}
                                    color="bg-[#1e2a4a]" // Navy
                                    textColor="text-white"
                                />
                                <StatCard
                                    title="Total Institutions"
                                    value={stats.institutions.toLocaleString()}
                                    subtext="Registered Schools/Colleges"
                                    icon={FaBuilding}
                                    color="bg-white"
                                    textColor="text-[#1e2a4a]"
                                    border={true}
                                />
                                <StatCard
                                    title="Pending Approvals"
                                    value={stats.mandals.reduce((acc, v) => acc + (v.pending || 0), 0).toLocaleString()}
                                    subtext="Requires Immediate Action"
                                    icon={FaClock}
                                    color="bg-[#f59e0b]" // Orange
                                    textColor="text-white"
                                />
                                <StatCard
                                    title="Active Mandals"
                                    value={stats.mandals.filter(v => v.status === 'Active').length.toLocaleString()}
                                    subtext={`Out of ${stats.mandals.length} Total`}
                                    icon={FaMapMarkedAlt}
                                    color="bg-indigo-500"
                                    textColor="text-white"
                                />
                            </div>

                            {/* 2. CHARTS SECTION */}
                            {!loading && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Member Distribution Chart */}
                                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="font-bold text-[#1e2a4a] text-lg flex items-center gap-2">
                                                <FaChartBar className="text-[#f59e0b]" /> Top Mandals by Membership
                                            </h3>
                                        </div>
                                        <div className="h-64 w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={mandalChartData} layout="vertical" margin={{ left: 40 }}>
                                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.5} />
                                                    <XAxis type="number" hide />
                                                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11, fontWeight: 'bold' }} />
                                                    <Tooltip
                                                        cursor={{ fill: '#f1f5f9' }}
                                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                                    />
                                                    <Bar dataKey="members" fill="#1e2a4a" radius={[0, 4, 4, 0]} barSize={20}>
                                                        <LabelList dataKey="members" position="right" style={{ fill: '#1e2a4a', fontWeight: 'bold', fontSize: '11px' }} />
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* Demographics Pie Chart */}
                                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="font-bold text-[#1e2a4a] text-lg flex items-center gap-2">
                                                <FaChartPie className="text-[#f59e0b]" /> Gender Demographics
                                            </h3>
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
                                                        label={({ value }) => value}
                                                    >
                                                        {genderData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 3. MANDAL PERFORMANCE GRID */}
                            <div className="space-y-4">
                                <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
                                    <h2 className="text-xl font-bold text-[#1e2a4a] border-l-4 border-[#f59e0b] pl-3">
                                        Mandal Breakdown
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
                                {loading ? (
                                    <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200 animate-pulse">
                                        Loading district data...
                                    </div>
                                ) : stats.mandals.length === 0 ? (
                                    <div className="p-12 text-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-300">
                                        No mandals found in this district.
                                    </div>
                                ) : (
                                    <>
                                        {/* CARDS VIEW */}
                                        {viewMode === 'cards' && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                                {stats.mandals.map((mandal, idx) => (
                                                    <MandalPerformanceCard
                                                        key={idx}
                                                        name={mandal.name}
                                                        members={mandal.members}
                                                        institutions={mandal.institutions}
                                                        status={mandal.status}
                                                        pending={mandal.pending}
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
                                                                <th className="px-6 py-4">Mandal Name</th>
                                                                <th className="px-6 py-4 text-center">Members</th>
                                                                <th className="px-6 py-4 text-center">Institutions</th>
                                                                <th className="px-6 py-4 text-center">Pending</th>
                                                                <th className="px-6 py-4 text-center">Status</th>
                                                                <th className="px-6 py-4 text-right">Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-100">
                                                            {stats.mandals.map((mandal, idx) => (
                                                                <tr key={idx} className="hover:bg-blue-50/50 transition-colors group">
                                                                    <td className="px-6 py-4 font-bold text-[#1e2a4a]">{mandal.name}</td>
                                                                    <td className="px-6 py-4 text-center text-slate-600 font-medium">{mandal.members}</td>
                                                                    <td className="px-6 py-4 text-center text-slate-600 font-medium">{mandal.institutions}</td>
                                                                    <td className="px-6 py-4 text-center">
                                                                        {mandal.pending > 0 ? (
                                                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200">
                                                                                {mandal.pending} Pending
                                                                            </span>
                                                                        ) : (
                                                                            <span className="text-slate-400">-</span>
                                                                        )}
                                                                    </td>
                                                                    <td className="px-6 py-4 text-center">
                                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${mandal.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                                                                            {mandal.status}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-6 py-4 text-right">
                                                                        <Link
                                                                            to={`/admin/members?villages=${encodeURIComponent(mandal.name)}`}
                                                                            className="text-blue-600 hover:text-blue-800 font-bold text-xs inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                        >
                                                                            View Details <FaChevronRight size={10} />
                                                                        </Link>
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
                                                <MapContainer center={[17.0500, 79.2667]} zoom={9} style={{ height: '100%', width: '100%', borderRadius: '12px' }} scrollWheelZoom={false}>
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
                                                    {stats.mandals.map((mandal, idx) => (
                                                        <Marker key={idx} position={getCoordinates(mandal.name)}>
                                                            <Popup>
                                                                <div className="text-center p-2">
                                                                    <h3 className="font-bold text-sm mb-1">{mandal.name}</h3>
                                                                    <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                                                                        <div className="bg-blue-50 p-1 rounded">Mem: <b>{mandal.members}</b></div>
                                                                        <div className="bg-slate-50 p-1 rounded">Inst: <b>{mandal.institutions}</b></div>
                                                                    </div>
                                                                    <Link to={`/admin/members?villages=${encodeURIComponent(mandal.name)}`} className="block w-full bg-[#1e2a4a] text-white text-[10px] font-bold py-1 px-2 rounded hover:bg-blue-800 transition">
                                                                        View Members
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
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DistrictDashboard;
