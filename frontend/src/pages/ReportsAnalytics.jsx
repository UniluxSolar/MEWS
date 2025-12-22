import React, { useState, useEffect } from 'react';
import API from '../api';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import {
    FaUsers, FaRupeeSign, FaExclamationTriangle, FaDownload, FaFilePdf, FaFileExcel,
    FaCalendarAlt, FaChartPie, FaChartBar, FaChartLine, FaFileAlt
} from 'react-icons/fa';

const StatCard = ({ title, value, subtext, icon: Icon, color }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-start justify-between">
        <div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            <p className={`text-xs mt-1 font-semibold ${subtext.includes('+') ? 'text-green-600' : 'text-gray-500'}`}>
                {subtext}
            </p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm ${color}`}>
            <Icon size={20} />
        </div>
    </div>
);

const ProgressBar = ({ label, value, color, percentage }) => (
    <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-700">{label}</span>
            <span className="text-xs font-bold text-gray-500">{value} ({percentage}%)</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div className={`h-2.5 rounded-full ${color}`} style={{ width: `${percentage}%` }}></div>
        </div>
    </div>
);

const ReportItem = ({ title, date, type, size }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-white hover:shadow-sm transition">
        <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${type === 'PDF' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                {type === 'PDF' ? <FaFilePdf /> : <FaFileExcel />}
            </div>
            <div>
                <h4 className="font-bold text-gray-800 text-sm">{title}</h4>
                <p className="text-xs text-gray-500">{date} • {size}</p>
            </div>
        </div>
        <button className="text-gray-400 hover:text-blue-600 transition">
            <FaDownload />
        </button>
    </div>
);

const ReportsAnalytics = () => {
    const [dateRange, setDateRange] = useState('Last 30 Days');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        metrics: { totalMembers: 0, newMembers: 0, totalFunds: 0, sosActive: 0 },
        demographics: { gender: [], occupation: [] }
    });

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const { data: res } = await API.get('/admin/analytics');
                setData(res);
            } catch (error) {
                console.error("Error fetching analytics:", error.response?.data || error.message);
                // Fallback for demo if DB is empty? No, keep it real.
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    const getColor = (index) => {
        const colors = ['bg-blue-500', 'bg-pink-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-indigo-500', 'bg-red-400'];
        return colors[index % colors.length];
    };

    if (loading) return <div className="p-10 text-center">Loading analytics...</div>;

    const { metrics, demographics } = data;

    // Helper to calculate percentage safely
    const getPercent = (count) => metrics.totalMembers > 0 ? Math.round((count / metrics.totalMembers) * 100) : 0;

    return (
        <div className="min-h-screen bg-[#f3f4f6] font-sans flex flex-col">
            <AdminHeader />
            <div className="flex flex-1 overflow-hidden">
                <AdminSidebar activePage="reports" />
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
                            <p className="text-sm text-gray-500 mt-1">Deep dive into village statistics, demographics, and activities.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm">
                                <FaCalendarAlt /> {dateRange}
                            </button>
                            <button className="bg-[#1e2a4a] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm hover:bg-[#2a3b66] transition">
                                <FaDownload /> Export All Data
                            </button>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard
                            title="Total Members"
                            value={metrics.totalMembers}
                            subtext={`+${metrics.newMembers} this month`}
                            icon={FaUsers}
                            color="bg-blue-600"
                        />
                        <StatCard
                            title="Total Funds Raised"
                            value={`₹ ${(metrics.totalFunds / 100000).toFixed(1)}L`}
                            subtext="Cumulative"
                            icon={FaRupeeSign}
                            color="bg-green-600"
                        />
                        <StatCard
                            title="SOS Alerts"
                            value={metrics.sosActive}
                            subtext="Active currently"
                            icon={FaExclamationTriangle}
                            color="bg-red-500"
                        />
                        {/* Static Income for now or can be derived if we aggregate it properly, but aggregating string ranges is hard. keeping placeholder but dynamic based on logic if available, else static. */}
                        <StatCard
                            title="Avg Family Income"
                            value="₹ 1.2L"
                            subtext="Per annum (Est.)"
                            icon={FaChartLine}
                            color="bg-indigo-500"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        {/* Demographics */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <FaChartPie className="text-gray-400" /> Demographics Overview
                                </h3>
                                <button className="text-xs text-blue-600 font-bold hover:underline">View Details</button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-4">By Gender</h4>
                                    {demographics.gender.length > 0 ? demographics.gender.map((g, idx) => (
                                        <ProgressBar
                                            key={g._id}
                                            label={g._id || 'Unknown'}
                                            value={g.count}
                                            percentage={getPercent(g.count)}
                                            color={getColor(idx)}
                                        />
                                    )) : <p className="text-sm text-gray-500">No data available</p>}
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-4">By Employment</h4>
                                    {demographics.occupation.length > 0 ? demographics.occupation.map((o, idx) => (
                                        <ProgressBar
                                            key={o._id}
                                            label={o._id || 'Unspecified'}
                                            value={o.count}
                                            percentage={getPercent(o.count)}
                                            color={getColor(idx + 3)}
                                        />
                                    )) : <p className="text-sm text-gray-500">No data available</p>}
                                </div>
                            </div>
                        </div>

                        {/* Recent Reports (Mock for now, as no backend logic requested for actual report generation files yet) */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <FaFileAlt className="text-gray-400" /> Recent Reports
                            </h3>
                            <div className="space-y-3">
                                <ReportItem title="Monthly Membership Report" date="Dec 01, 2025" type="PDF" size="2.4 MB" />
                                <ReportItem title="Financial Audit Summary" date="Nov 28, 2025" type="XLS" size="1.1 MB" />
                                <ReportItem title="SOS Incident Log" date="Nov 25, 2025" type="PDF" size="850 KB" />
                                <ReportItem title="Activity Log Export" date="Nov 20, 2025" type="XLS" size="4.2 MB" />
                            </div>
                            <button className="w-full mt-6 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 transition">
                                View All Reports
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ReportsAnalytics;
