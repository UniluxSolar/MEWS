import React, { useState, useEffect } from 'react';
import API from '../api';
import {
    FaUsers, FaBuilding, FaExclamationTriangle, FaChartLine,
    FaFileDownload, FaMoneyBillWave, FaMapMarkedAlt, FaTable, FaThLarge
} from 'react-icons/fa';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import DashboardHeader from '../components/common/DashboardHeader';
// Map Imports
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const StateStatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg ${color} text-white flex items-center justify-center shadow-md`}>
            <Icon size={20} />
        </div>
        <div>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        </div>
    </div>
);

const StateDashboard = () => {
    const [stats, setStats] = useState({
        members: 0,
        institutions: 0,
        sos: 0,
        districts: []
    });
    const [viewMode, setViewMode] = useState('table'); // 'table', 'cards', 'map'

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await API.get('/admin/dashboard-stats');
                setStats({
                    members: data.members || 0,
                    institutions: data.institutions || 0,
                    sos: data.sosAlerts || 0,
                    districts: data.districts || [] // Backend needs to provide this
                });
            } catch (error) {
                console.error("Error fetching state stats", error);
            }
        };
        fetchStats();
    }, []);

    // Helper for Map Coordinates
    const getCoordinates = (inputString) => {
        if (!inputString) return [17.0500, 79.2667];
        let hash = 0;
        for (let i = 0; i < inputString.length; i++) hash = inputString.charCodeAt(i) + ((hash << 5) - hash);
        const latOffset = (hash % 1000) / 2500;
        const lngOffset = ((hash >> 5) % 1000) / 2500;
        return [17.0500 + latOffset, 79.2667 + lngOffset];
    };

    return (
        <div className="min-h-screen bg-[#f3f4f6] font-sans flex flex-col">
            <AdminHeader />
            <div className="flex flex-1 overflow-hidden">
                <AdminSidebar activePage="dashboard" />

                <main className="flex-1 overflow-y-auto">
                    <DashboardHeader
                        title="Telangana State Dashboard"
                        subtitle={
                            <div>
                                <div className="text-blue-100 opacity-80 mb-2">State-wide overview and performance metrics. Last updated: Today</div>
                                {/* View Toggle */}
                                <div className="flex items-center gap-2 mt-2 bg-white/10 p-1 rounded-lg w-fit backdrop-blur-sm border border-white/20">
                                    <span className="text-xs font-bold text-white px-2">View:</span>
                                    <button onClick={() => setViewMode('table')} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'table' ? 'bg-white text-blue-900 shadow-sm' : 'text-blue-100 hover:bg-white/10'}`}><FaTable /> Table</button>
                                    <button onClick={() => setViewMode('cards')} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'cards' ? 'bg-white text-blue-900 shadow-sm' : 'text-blue-100 hover:bg-white/10'}`}><FaThLarge /> Cards</button>
                                    <button onClick={() => setViewMode('map')} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'map' ? 'bg-white text-blue-900 shadow-sm' : 'text-blue-100 hover:bg-white/10'}`}><FaMapMarkedAlt /> Map</button>
                                </div>
                            </div>
                        }
                    >
                        <button className="bg-white bg-opacity-10 hover:bg-opacity-20 backdrop-blur-md text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 border border-white/20 transition">
                            <FaFileDownload /> Export State Report
                        </button>
                    </DashboardHeader>

                    <div className="px-4 md:px-8 -mt-10 pb-8 w-full">
                        {/* High Level Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <StateStatCard title="Total Citizens" value={stats.members.toLocaleString()} icon={FaUsers} color="bg-blue-600" />
                            <StateStatCard title="Total Institutions" value={stats.institutions.toLocaleString()} icon={FaBuilding} color="bg-indigo-600" />
                            <StateStatCard title="Total Districts" value={stats.districts.length} icon={FaMapMarkedAlt} color="bg-amber-500" />
                        </div>

                        {/* District Comparison Table */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-gray-900">District Performance Comparison</h3>
                                <button className="text-blue-600 text-xs font-bold hover:underline">View All Districts</button>
                            </div>

                            {viewMode === 'table' && (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                                            <tr>
                                                <th className="px-6 py-4">District Name</th>
                                                <th className="px-6 py-4">Members</th>
                                                <th className="px-6 py-4">Institutions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {stats.districts.length > 0 ? (
                                                stats.districts.map((dist, idx) => (
                                                    <tr key={idx} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 font-bold text-gray-800">{dist.name}</td>
                                                        <td className="px-6 py-4 text-sm font-medium">{dist.members.toLocaleString()}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">{dist.institutions}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="3" className="px-6 py-8 text-center text-gray-400">Loading district data...</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {viewMode === 'cards' && (
                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {stats.districts.map((dist, idx) => (
                                        <div key={idx} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition relative overflow-hidden group">
                                            <div className="flex justify-between items-start mb-3">
                                                <h3 className="font-bold text-gray-900 text-lg">{dist.name}</h3>
                                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                                    <FaMapMarkedAlt size={14} />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">Members</span>
                                                    <span className="font-bold text-gray-900">{dist.members.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">Institutions</span>
                                                    <span className="font-bold text-gray-900">{dist.institutions}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {viewMode === 'map' && (
                                <div className="h-[500px] w-full relative">
                                    <MapContainer center={[17.0500, 79.2667]} zoom={9} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />
                                        {stats.districts.map((dist, idx) => {
                                            const coords = getCoordinates(dist.name);
                                            return (
                                                <Marker key={idx} position={coords}>
                                                    <Popup>
                                                        <div className="p-1">
                                                            <h3 className="font-bold text-sm mb-1">{dist.name}</h3>
                                                            <p className="text-xs text-slate-600">Members: <b>{dist.members}</b></p>
                                                            <p className="text-xs text-slate-600">Institutions: <b>{dist.institutions}</b></p>
                                                        </div>
                                                    </Popup>
                                                </Marker>
                                            );
                                        })}
                                    </MapContainer>
                                </div>
                            )}
                        </div>

                        {/* Financial & Impact Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <FaMoneyBillWave className="text-green-600" /> Funds Allocation
                                </h3>
                                <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                                    [Funds Chart Placeholder]
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <FaChartLine className="text-blue-600" /> Member Growth Trend
                                </h3>
                                <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                                    [Growth Chart Placeholder]
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default StateDashboard;
