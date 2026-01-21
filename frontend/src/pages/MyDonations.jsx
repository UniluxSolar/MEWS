import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import {
    FaHeart, FaDownload, FaSearch, FaFilter, FaChevronLeft, FaChevronRight,
    FaCalendarAlt, FaFileInvoiceDollar, FaHandHoldingHeart, FaUserFriends, FaMedal, FaArrowLeft
} from 'react-icons/fa';

const StatCard = ({ icon: Icon, label, value, subtext, color, trend }) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
        <div className="flex justify-between items-start mb-4">
            <div className={`w-12 h-12 rounded-xl ${color} text-white flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                <Icon />
            </div>
            {trend && (
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend.positive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {trend.positive ? '+' : ''}{trend.value}
                </span>
            )}
        </div>
        <div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
            <p className="text-sm font-semibold text-gray-500">{label}</p>
            {subtext && <p className="text-xs text-gray-400 mt-2">{subtext}</p>}
        </div>
    </div>
);

const DonationRow = ({ date, amount, purpose, type, transactionId, status }) => (
    <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
        <td className="py-5 pl-6">
            <div className="flex flex-col">
                <span className="font-bold text-gray-900">{date.split(',')[0]}</span>
                <span className="text-xs text-gray-400">{date.split(',')[1]}</span>
            </div>
        </td>
        <td className="py-5 font-bold text-gray-800">₹{amount}</td>
        <td className="py-5">
            <div className="font-semibold text-gray-800">{purpose}</div>
            <div className="text-xs text-gray-500">Education Support Fund</div>
        </td>
        <td className="py-5">
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${type === 'Sponsorship'
                ? 'bg-blue-50 text-blue-600 border-blue-100'
                : 'bg-orange-50 text-orange-600 border-orange-100'
                }`}>
                {type}
            </span>
        </td>
        <td className="py-5 text-sm text-gray-500 font-mono">{transactionId}</td>
        <td className="py-5">
            <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-bold border border-green-100 flex items-center gap-1 w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                {status}
            </span>
        </td>
        <td className="py-5 pr-6 text-right">
            <div className="flex items-center justify-end gap-2">
                <button className="text-xs font-bold text-secondary hover:text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100 transition-colors flex items-center gap-2">
                    <FaDownload /> Receipt
                </button>
                <button className="text-xs font-bold text-gray-500 hover:text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 transition-colors hover:bg-gray-100">
                    80G Cert.
                </button>
            </div>
        </td>
    </tr>
);

const MyDonations = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [donationsList, setDonationsList] = useState([]);
    const [stats, setStats] = useState({
        totalDonated: 0,
        activeSponsorships: 0,
        taxDeduction: 0,
        livesTouched: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDonationData = async () => {
            try {
                // Using API utility automatically handles cookies
                const [donationsRes, statsRes] = await Promise.all([
                    API.get('/donations/my-donations'),
                    API.get('/donations/stats')
                ]);

                if (donationsRes.data) {
                    const data = donationsRes.data;
                    // Map backend data to frontend structure
                    const formattedData = data.map(d => ({
                        date: new Date(d.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).replace(/ /g, ' '),
                        // Note: The row expects "15 Jan, 2025". toLocaleDateString might give "15 Jan 2025". 
                        // Let's force a comma or update the row. Updating row is better, but for now let's try to match.
                        // Helper to match "15 Jan, 2025"
                        // actually the row splits by comma. So we NEED a comma.
                        amount: d.amount ? d.amount.toLocaleString() : '0',
                        purpose: d.purpose || 'General Donation',
                        type: d.type,
                        transactionId: d.transactionId,
                        status: d.status
                    })).map(d => ({
                        ...d,
                        date: new Date(d.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).replace(/ (?=[0-9]{4})/, ', ')
                        // Reuse the d object but fix date properly if needed. 
                        // Actually easier to just format it manually in the map above.
                    }));

                    // Simplified manual formatting to ensure comma
                    const finalData = data.map(d => {
                        const dateObj = new Date(d.createdAt);
                        const day = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                        const year = dateObj.getFullYear();
                        return {
                            ...d,
                            date: `${day}, ${year}`,
                            amount: d.amount ? d.amount.toLocaleString() : '0'
                        };
                    });

                    setDonationsList(finalData);
                }

                if (statsRes.data) {
                    setStats(statsRes.data);
                }
            } catch (error) {
                console.error("Failed to fetch donation data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDonationData();
    }, []);

    // Filter Logic
    const filteredDonations = donationsList.filter(d => {
        if (activeTab === 'all donations' || activeTab === 'all') return true;
        if (activeTab === 'student sponsorships') return d.type === 'Sponsorship';
        if (activeTab === 'one-time donations') return d.type !== 'Sponsorship';
        return true;
    });

    if (loading) {
        return <div className="p-10 text-center">Loading donation history...</div>;
    }

    return (
        <div className="w-full space-y-8 pb-10">
            {/* Back Button */}
            <div className="">
                <Link to="/dashboard" className="text-secondary hover:text-amber-600 flex items-center gap-2 text-sm font-bold transition-all w-fit">
                    <FaArrowLeft size={12} /> Back to Dashboard
                </Link>
            </div>

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex flex-col md:flex-row items-center gap-6 mb-1">
                        <h1 className="text-3xl font-bold text-[#1e2a4a]">My Donations & Impact</h1>
                        <Link to="/dashboard/donate" className="bg-[#1e2a4a] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-[#2a3b66] transition shadow-lg hover:shadow-xl flex items-center gap-2">
                            <FaHeart className="text-rose-400" /> Donate / Sponsor
                        </Link>
                    </div>
                    <p className="text-gray-500 mt-1">Track your contributions, download tax receipts, and see the impact you've made.</p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={FaFileInvoiceDollar}
                    label="Total Donated This Year"
                    value={`₹${stats.totalDonated.toLocaleString()}`}
                    subtext="↑ 15% more than last year"
                    color="bg-blue-500"
                    trend={{ value: '12%', positive: true }}
                />
                <StatCard
                    icon={FaUserFriends}
                    label="Active Sponsorships"
                    value={stats.activeSponsorships}
                    subtext="Supporting students in B.Tech, MBA"
                    color="bg-purple-500"
                />
                <StatCard
                    icon={FaFileInvoiceDollar}
                    label="80G Tax Deduction"
                    value={`₹${stats.taxDeduction.toLocaleString()}`}
                    subtext="50% of eligible donations"
                    color="bg-emerald-500"
                />
                <StatCard
                    icon={FaMedal}
                    label="Lives Touched"
                    value={stats.livesTouched}
                    subtext="Gold Donor Status"
                    color="bg-[#f59e0b]"
                />
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

                {/* Tabs */}
                <div className="border-b border-gray-100 flex overflow-x-auto">
                    {['All Donations', 'Student Sponsorships', 'One-time Donations', 'Tax Receipts'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab.toLowerCase())}
                            className={`px-8 py-5 text-sm font-bold whitespace-nowrap transition-all border-b-2 
                            ${activeTab === tab.toLowerCase()
                                    ? 'border-[#1e2a4a] text-[#1e2a4a] bg-blue-50/30'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Filters Bar */}
                <div className="p-6 bg-gray-50/50 border-b border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <label className="text-xs font-bold text-gray-500 mb-1 block uppercase tracking-wider">Date Range</label>
                        <select className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer appearance-none">
                            <option>Last 6 months</option>
                            <option>Financial Year 2024-25</option>
                            <option>All Time</option>
                        </select>
                        <FaCalendarAlt className="absolute right-3.5 top-[2.2rem] text-gray-400 pointer-events-none" size={14} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 mb-1 block uppercase tracking-wider">Type</label>
                        <select className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer">
                            <option>All Types</option>
                            <option>Sponsorship</option>
                            <option>General</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 mb-1 block uppercase tracking-wider">Amount Range</label>
                        <div className="flex gap-2">
                            <input type="text" placeholder="Min" className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary" />
                            <input type="text" placeholder="Max" className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary" />
                        </div>
                    </div>
                    <div className="relative">
                        <label className="text-xs font-bold text-gray-500 mb-1 block uppercase tracking-wider">Transaction ID</label>
                        <input type="text" placeholder="Search by ID" className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary" />
                        <FaSearch className="absolute left-3 top-[2.2rem] text-gray-400" size={14} />
                    </div>
                </div>

                {/* Table Header */}
                <div className="px-6 py-4 flex justify-between items-center border-b border-gray-100">
                    <h2 className="font-bold text-lg text-gray-800">Donation History</h2>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 transition">
                            <FaDownload size={12} /> Export CSV
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 transition">
                            Print Summary
                        </button>
                    </div>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                                <th className="py-4 pl-6 font-bold">Date</th>
                                <th className="py-4 font-bold">Amount</th>
                                <th className="py-4 font-bold">Purpose</th>
                                <th className="py-4 font-bold">Type</th>
                                <th className="py-4 font-bold">Transaction ID</th>
                                <th className="py-4 font-bold">Status</th>
                                <th className="py-4 pr-6 text-right font-bold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDonations.length > 0 ? (
                                filteredDonations.map((donation, index) => (
                                    <DonationRow key={index} {...donation} />
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="py-10 text-center text-gray-500">
                                        No donations found. Start your journey by donating today!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-gray-100 bg-gray-50/30 flex items-center justify-between">
                    <span className="text-sm text-gray-500 font-medium">Showing {filteredDonations.length} records</span>
                    {/* Simplified pagination for now */}
                </div>
            </div>
        </div>
    );
};

export default MyDonations;
