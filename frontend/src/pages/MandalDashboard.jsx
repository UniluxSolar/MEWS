import React, { useState, useEffect } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';
import { renderToStaticMarkup } from 'react-dom/server';
import {
    FaUsers, FaBuilding, FaExclamationTriangle, FaFileAlt,
    FaMapMarkerAlt, FaClock, FaTable, FaThLarge, FaMapMarkedAlt
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
    const [viewMode, setViewMode] = useState('cards'); // 'table', 'cards', 'map' (cards default here)

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
                            title={`${stats.locationName} Mandal Dashboard`}
                            subtitle={
                                <div>
                                    <div className="text-blue-100 opacity-80 mb-2">Manage mandal operations and monitor village activities. Last updated: Today</div>
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
                                ) : stats.villages.length === 0 ? (
                                    <div className="col-span-full text-center py-10 bg-white rounded-2xl border border-dashed border-gray-300">
                                        No villages found.
                                    </div>
                                ) : (
                                    <>
                                        {/* TABLE VIEW */}
                                        {viewMode === 'table' && (
                                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-left border-collapse">
                                                        <thead>
                                                            <tr className="bg-slate-50 border-b border-gray-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                                <th className="px-6 py-4">Village Name</th>
                                                                <th className="px-6 py-4">Members</th>
                                                                <th className="px-6 py-4">Institutions</th>
                                                                <th className="px-6 py-4">Status</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-50">
                                                            {stats.villages.map((village, idx) => (
                                                                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                                                    <td className="px-6 py-4 font-bold text-slate-800">{village.name}</td>
                                                                    <td className="px-6 py-4 text-sm text-slate-600">{village.members.toLocaleString()}</td>
                                                                    <td className="px-6 py-4 text-sm text-slate-600">{village.institutions}</td>
                                                                    <td className="px-6 py-4">
                                                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide ${village.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
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

                                        {/* CARDS VIEW */}
                                        {viewMode === 'cards' && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {stats.villages.map((village, idx) => (
                                                    <VillagePerformanceCard
                                                        key={idx}
                                                        name={village.name}
                                                        members={village.members}
                                                        institutions={village.institutions}
                                                        status={village.status}
                                                    />
                                                ))}
                                            </div>
                                        )}

                                        {/* MAP VIEW */}
                                        {viewMode === 'map' && (
                                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 h-[600px] overflow-hidden relative">
                                                <MapContainer center={[17.0500, 79.2667]} zoom={11} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
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
                                                    {stats.villages.map((village, idx) => {
                                                        const coords = getCoordinates(village.name, idx.toString());
                                                        return (
                                                            <Marker key={idx} position={coords}>
                                                                <Popup>
                                                                    <div className="p-1">
                                                                        <h3 className="font-bold text-sm mb-1">{village.name}</h3>
                                                                        <p className="text-xs text-slate-600">Members: <b>{village.members}</b></p>
                                                                        <p className="text-xs text-slate-600">Institutions: <b>{village.institutions}</b></p>
                                                                        <p className={`text-xs font-bold mt-1 ${village.status === 'Active' ? 'text-green-600' : 'text-red-500'}`}>{village.status}</p>
                                                                    </div>
                                                                </Popup>
                                                            </Marker>
                                                        );
                                                    })}
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

export default MandalDashboard;
