import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api';
import {
    FaCalendarAlt, FaChevronRight, FaGraduationCap, FaHeartbeat,
    FaBalanceScale, FaHandHoldingHeart, FaBullhorn, FaCheckCircle,
    FaClock, FaMapMarkerAlt, FaUserCircle, FaExclamationCircle, FaHeart
} from 'react-icons/fa';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

const QuickActionCard = ({ icon: Icon, label, color, link }) => (
    <Link to={link || "#"} className="flex flex-col items-center justify-center p-6 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:bg-gray-50 transition group">
        <div className={`w-12 h-12 rounded-full ${color} text-white flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
            <Icon size={20} />
        </div>
        <span className="text-sm font-bold text-gray-700 text-center">{label}</span>
    </Link>
);

const ApplicationRow = ({ title, date, status, statusColor }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${status === 'APPROVED' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                {status === 'APPROVED' ? <FaCheckCircle /> : <FaClock />}
            </div>
            <div>
                <div className="text-sm font-bold text-gray-800">{title}</div>
                <div className="text-xs text-gray-500">Submitted: {date}</div>
            </div>
        </div>
        <span className={`px-3 py-1 text-xs font-bold rounded-full ${statusColor}`}>
            {status}
        </span>
    </div>
);





const DashboardHome = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const adminInfo = JSON.parse(localStorage.getItem('adminInfo'));
                // adminInfo allows us to greet the user immediately, but auth is handled via cookie
                if (adminInfo) {
                    setUserName(adminInfo.name || 'User');
                }

                // API calls automatically send cookies
                const [statsResponse, donationsResponse] = await Promise.all([
                    API.get('/members/stats'),
                    API.get('/donations/my-donations')
                ]);

                if (statsResponse.data) {
                    setStats(statsResponse.data);
                }
                if (donationsResponse.data) {
                    setDonations(donationsResponse.data);
                }

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                // If API returns 401, interceptor might not handle redirection for all cases, so can add optional logic here
                if (error.response && error.response.status === 401) {
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    // Derived Data for Charts

    const applicationStatusData = [
        { name: 'Approved', value: stats?.approvedApplications || 0, color: '#10B981', path: '/dashboard/applications' },
        { name: 'Pending', value: stats?.pendingReviews || 0, color: '#F59E0B', path: '/dashboard/applications' },
        { name: 'Active', value: stats?.activeApplications || 0, color: '#3B82F6', path: '/dashboard/applications' },
    ].filter(item => item.value > 0);

    // Filter list for "My Active Applications"
    const recentApplications = stats?.applications?.slice(0, 3) || [];

    // Calculate Impact Data from actual applications
    const calculateImpactData = () => {
        if (!stats?.applications) return [];

        const counts = {};
        stats.applications.forEach(app => {
            const type = app.purpose || app.type || 'Other';
            // Simple normalization if needed, or use exact string
            const key = type.split(' ')[0]; // e.g. "Education" from "Education Support"
            counts[key] = (counts[key] || 0) + 1;
        });

        const colors = {
            'Education': '#3B82F6',
            'Health': '#EF4444',
            'Medical': '#EF4444',
            'Welfare': '#8B5CF6',
            'Legal': '#A855F7',
            'Employment': '#F59E0B',
            'Sports': '#10B981',
            'Other': '#6B7280'
        };

        return Object.keys(counts).map(key => ({
            name: key,
            value: counts[key],
            color: colors[key] || colors['Other'],
            path: '/dashboard/applications' // Or specific filter path if implemented
        }));
    };

    const impactData = calculateImpactData();

    // Calculate Donation Data
    const calculateDonationData = () => {
        if (!donations.length) return [];

        const counts = {};
        donations.forEach(d => {
            // Group by Purpose or Type. 'purpose' seems more detailed like "Education Support Fund"
            // 'type' is like "Education", "Sponsorship". Let's use Type for broader categories or Purpose if standardized.
            // Based on MyDonations.jsx, 'type' is used for tagging.
            const key = d.type || 'General';
            counts[key] = (counts[key] || 0) + (d.amount || 0); // Summing amounts for pie chart
        });

        const colors = {
            'Sponsorship': '#8B5CF6',
            'Education': '#3B82F6',
            'Health': '#EF4444',
            'General': '#F59E0B',
            'Other': '#10B981'
        };

        return Object.keys(counts).map(key => ({
            name: key,
            value: counts[key],
            color: colors[key] || colors['Other']
        }));
    };

    const donationChartData = calculateDonationData();

    // Custom Label for Pie Charts to show numbers clearly
    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
        const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor="middle"
                dominantBaseline="central"
                className="text-[11px] font-bold drop-shadow-sm"
            >
                {value}
            </text>
        );
    };

    const onPieClick = (data, index) => {
        if (data && data.path) {
            navigate(data.path);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'APPROVED': return 'bg-green-100 text-green-700';
            case 'REJECTED': return 'bg-red-100 text-red-700';
            case 'PENDING_APPROVAL': return 'bg-yellow-100 text-yellow-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading Dashboard...</div>;
    }

    return (
        <div className="w-full space-y-8 animate-fadeIn">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-[#1e2a4a]">Welcome back, {userName}!</h1>
                    <p className="text-gray-500 text-sm mt-1">Last login: Today at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link to="/dashboard/profile" className="bg-[#1e2a4a] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#2a3b66] transition shadow-sm">
                        Complete Profile
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Funding Request & Status */}
                <div className="space-y-8">

                    {/* Funding Request (Bar Chart) */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg text-gray-800">Funding Request</h3>
                            <Link to="/dashboard/applications" className="text-secondary text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
                                View All ({stats?.totalApplications || 0}) <FaChevronRight size={10} />
                            </Link>
                        </div>
                        <div className="h-48 w-full">
                            {stats?.totalApplications > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={applicationStatusData}
                                        margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                        <Tooltip cursor={{ fill: 'transparent' }} />
                                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                            {applicationStatusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm">
                                    <FaExclamationCircle className="mb-2 text-2xl opacity-20" />
                                    No Data Available
                                </div>
                            )}
                        </div>
                        <div className="mt-4 text-center">
                            <Link to="/dashboard/applications" className="text-sm font-bold text-secondary hover:text-primary transition">
                                View All Applications →
                            </Link>
                        </div>
                    </div>

                    {/* Application Status (Pie Chart) */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="font-bold text-lg text-gray-800 mb-4">Application Status</h3>
                        <div className="h-48 w-full">
                            {/* Only show chart if there data, else simpler UI */}
                            {stats?.totalApplications > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={applicationStatusData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={40}
                                            outerRadius={70}
                                            paddingAngle={5}
                                            dataKey="value"
                                            onClick={onPieClick}
                                            className="cursor-pointer"
                                            label={renderCustomLabel}
                                            labelLine={false}
                                        >
                                            {applicationStatusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} className="cursor-pointer hover:opacity-80 transition" />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm">
                                    <FaExclamationCircle className="mb-2 text-2xl opacity-20" />
                                    No Data Available
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* Right Column: Donations & Impact */}
                <div className="space-y-8">

                    {/* My Donations (Bar Chart) */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg text-gray-800">My Donations</h3>
                            <Link to="/dashboard/donations" className="text-secondary text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
                                View History <FaChevronRight size={10} />
                            </Link>
                        </div>
                        <div className="h-48 w-full">
                            {donations.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={donationChartData}
                                        margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                        <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} cursor={{ fill: 'transparent' }} />
                                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                            {donationChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm">
                                    <FaHeart className="mb-2 text-2xl opacity-20" />
                                    No donations yet. Make your first impact!
                                </div>
                            )}
                        </div>
                        <div className="mt-4 text-center">
                            <Link to="/dashboard/donate" className="text-sm font-bold text-secondary hover:text-primary transition">
                                Make a Donation →
                            </Link>
                        </div>
                    </div>

                    {/* Community Impact (Pie Chart) */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="font-bold text-lg text-gray-800 mb-4">Community Impact</h3>
                        <div className="h-48 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={impactData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={70}
                                        paddingAngle={5}
                                        dataKey="value"
                                        onClick={onPieClick}
                                        className="cursor-pointer"
                                        label={renderCustomLabel}
                                        labelLine={false}
                                    >
                                        {impactData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} className="cursor-pointer hover:opacity-80 transition" />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="font-bold text-lg text-gray-800 mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <QuickActionCard icon={FaGraduationCap} label="Scholarship" color="bg-blue-500" />
                            <QuickActionCard icon={FaHeartbeat} label="Health Help" color="bg-red-500" link="/dashboard/health" />
                            <QuickActionCard icon={FaBalanceScale} label="Legal Aid" color="bg-purple-500" link="/dashboard/legal" />
                            <QuickActionCard icon={FaHandHoldingHeart} label="Donate" color="bg-secondary" link="/dashboard/donate" />
                        </div>
                    </div>

                </div>
            </div>

            {/* Latest Announcements */}
            <div className="bg-[#1e2a4a] rounded-xl p-8 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4 text-[#f59e0b]">
                        <FaBullhorn />
                        <span className="text-sm font-bold uppercase tracking-widest">Latest Announcement</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-3">New Scholarship Program Launch</h3>
                    <p className="text-gray-300 max-w-3xl mb-6 leading-relaxed">
                        We're excited to announce our new Merit-based Scholarship Program for engineering students.
                        Applications open next month with enhanced benefits.
                    </p>
                    <button className="text-sm font-bold text-[#f59e0b] hover:text-white transition flex items-center gap-2">
                        Read More <FaChevronRight size={10} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
