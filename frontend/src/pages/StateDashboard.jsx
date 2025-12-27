import React, { useState, useEffect } from 'react';
import API from '../api';
import {
    FaUsers, FaBuilding, FaExclamationTriangle, FaChartLine,
    FaFileDownload, FaMoneyBillWave, FaMapMarkedAlt
} from 'react-icons/fa';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';

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

    return (
        <div className="min-h-screen bg-[#f3f4f6] font-sans flex flex-col">
            <AdminHeader />
            <div className="flex flex-1 overflow-hidden">
                <AdminSidebar activePage="dashboard" />

                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Telangana State Dashboard</h1>
                            <p className="text-sm text-gray-500 mt-1">State-wide overview and performance metrics</p>
                        </div>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm">
                            <FaFileDownload /> Export State Report
                        </button>
                    </div>

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
                                            <td colSpan="5" className="px-6 py-8 text-center text-gray-400">Loading district data...</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
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
                </main>
            </div>
        </div>
    );
};

export default StateDashboard;
