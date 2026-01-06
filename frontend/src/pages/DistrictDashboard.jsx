import React, { useState, useEffect } from 'react';
import API from '../api';
import {
    FaUsers, FaBuilding, FaExclamationTriangle, FaFileAlt,
    FaHandHoldingUsd, FaChartLine, FaMapMarkedAlt, FaCheckCircle,
    FaTable, FaThLarge
} from 'react-icons/fa';
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
    const [viewMode, setViewMode] = useState('table'); // 'table', 'cards', 'map'

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

    // Predefined Coordinates for Nalgonda villages
    const VILLAGE_COORDINATES = {
        'Nalgonda': [17.0500, 79.2667],
        'Adavdevulapally': [17.0908, 79.4161],
        'Addagudur': [17.3975, 79.3761],
        'Adloor': [16.6815, 79.9818],
        'Agamothkur': [17.0433, 79.5034],
        'Aipur': [17.2529, 79.3561],
        'Aitipamula': [17.1698, 79.3585],
        'Akaram': [17.3157, 79.3799],
        'Akkinepally': [17.0908, 79.4161],
        'Akupamula': [17.0092, 79.9015],
        'Nakrekal': [17.1666, 79.4299],
        'Miryalaguda': [16.8741, 79.5694],
        'Suryapet': [17.1415, 79.6236],
        'Devarakonda': [16.5938, 78.9328],
        'Munugode': [17.0667, 79.0833],
        'Chityal': [17.2244, 79.1378],
        'Kattangur': [17.1833, 79.3667],
        'Amanagal': [17.0620, 79.5760] // Corrected to residential area
    };

    // Helper for Map Coordinates
    const getCoordinates = (inputString, seed = '') => {
        if (!inputString) return [17.0500, 79.2667];

        let baseCoords = [17.0500, 79.2667];
        const villageKey = Object.keys(VILLAGE_COORDINATES).find(key =>
            inputString.toLowerCase().includes(key.toLowerCase())
        );

        if (villageKey) {
            baseCoords = VILLAGE_COORDINATES[villageKey];
        } else {
            let hash = 0;
            for (let i = 0; i < inputString.length; i++) hash = inputString.charCodeAt(i) + ((hash << 5) - hash);
            const latBase = ((hash % 1000) - 500) / 20000;
            const lngBase = (((hash >> 5) % 1000) - 500) / 20000;
            baseCoords = [17.0500 + latBase, 79.2667 + lngBase];
        }

        const coords = baseCoords;

        // Jitter: Centered and tighter
        let seedHash = 0;
        const combinedSeed = seed || 'default';
        for (let i = 0; i < combinedSeed.length; i++) seedHash = combinedSeed.charCodeAt(i) + ((seedHash << 5) - seedHash);
        const latJitter = ((seedHash % 100) - 50) / 100000;
        const lngJitter = (((seedHash >> 5) % 100) - 50) / 100000;

        return [coords[0] + latJitter, coords[1] + lngJitter];
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
            <AdminHeader />
            <div className="flex flex-1 overflow-hidden">
                <AdminSidebar activePage="dashboard" />

                <main id="admin-dashboard-content" className="flex-1 overflow-y-auto">
                    <div id="location-card-scroll-target">
                        <DashboardHeader
                            title={`${stats.locationName} District Dashboard`}
                            subtitle={
                                <div>
                                    <div className="text-blue-100 opacity-80 mb-2">Manage district operations and monitor activities. Last updated: Today</div>
                                    {/* View Toggle */}
                                    <div className="flex items-center gap-2 mt-2 bg-white/10 p-1 rounded-lg w-fit backdrop-blur-sm border border-white/20">
                                        <span className="text-xs font-bold text-white px-2">View:</span>
                                        <button onClick={() => setViewMode('table')} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'table' ? 'bg-white text-blue-900 shadow-sm' : 'text-blue-100 hover:bg-white/10'}`}><FaTable /> Table</button>
                                        <button onClick={() => setViewMode('cards')} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'cards' ? 'bg-white text-blue-900 shadow-sm' : 'text-blue-100 hover:bg-white/10'}`}><FaThLarge /> Cards</button>
                                        <button onClick={() => setViewMode('map')} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'map' ? 'bg-white text-blue-900 shadow-sm' : 'text-blue-100 hover:bg-white/10'}`}><FaMapMarkedAlt /> Map</button>
                                    </div>
                                </div>
                            }
                        />
                    </div>

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

                                {viewMode === 'table' && (
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
                                )}

                                {viewMode === 'cards' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {stats.mandals.map((mandal) => (
                                            <div key={mandal.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition relative overflow-hidden group">
                                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${mandal.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                <div className="flex justify-between items-start mb-3">
                                                    <h3 className="font-bold text-gray-900 text-lg">{mandal.name}</h3>
                                                    <div className={`w-2 h-2 rounded-full ${mandal.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-500">Members</span>
                                                        <span className="font-bold text-gray-900">{mandal.members}</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-500">Institutions</span>
                                                        <span className="font-bold text-gray-900">{mandal.institutions}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {viewMode === 'map' && (
                                    <div className="h-[500px] w-full rounded-xl overflow-hidden border border-gray-200">
                                        <MapContainer center={[17.0500, 79.2667]} zoom={10} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
                                            <LayersControl position="topright">
                                                <LayersControl.BaseLayer checked name="Standard">
                                                    <TileLayer
                                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                    />
                                                </LayersControl.BaseLayer>
                                                <LayersControl.BaseLayer name="Satellite">
                                                    <TileLayer
                                                        attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                                                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                                                    />
                                                </LayersControl.BaseLayer>
                                            </LayersControl>
                                            {stats.mandals.map((mandal, idx) => {
                                                const coords = getCoordinates(mandal.name, mandal.id || idx.toString());
                                                return (
                                                    <Marker key={idx} position={coords}>
                                                        <Popup>
                                                            <div className="p-1">
                                                                <h3 className="font-bold text-sm mb-1">{mandal.name}</h3>
                                                                <p className="text-xs text-slate-600">Members: <b>{mandal.members}</b></p>
                                                                <p className="text-xs text-slate-600">Institutions: <b>{mandal.institutions}</b></p>
                                                            </div>
                                                        </Popup>
                                                    </Marker>
                                                );
                                            })}
                                        </MapContainer>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DistrictDashboard;
