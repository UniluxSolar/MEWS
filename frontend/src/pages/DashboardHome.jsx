import React from 'react';
import { Link } from 'react-router-dom';
import {
    FaCalendarAlt, FaChevronRight, FaGraduationCap, FaHeartbeat,
    FaBalanceScale, FaHandHoldingHeart, FaBullhorn, FaCheckCircle,
    FaClock, FaMapMarkerAlt, FaUserCircle
} from 'react-icons/fa';

const QuickActionCard = ({ icon: Icon, label, color, link }) => (
    <Link to={link || "#"} className="flex flex-col items-center justify-center p-6 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:bg-gray-50 transition group">
        <div className={`w-12 h-12 rounded-full ${color} text-white flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
            <Icon size={20} />
        </div>
        <span className="text-sm font-bold text-gray-700 text-center">{label}</span>
    </Link>
);

const ApplicationRow = ({ id, date, status, statusColor }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${status === 'Approved' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                {status === 'Approved' ? <FaCheckCircle /> : <FaClock />}
            </div>
            <div>
                <div className="text-sm font-bold text-gray-800">{id}</div>
                <div className="text-xs text-gray-500">Submitted: {date}</div>
            </div>
        </div>
        <span className={`px-3 py-1 text-xs font-bold rounded-full ${statusColor}`}>
            {status}
        </span>
    </div>
);

const JobEventCard = ({ title, date, location, seats }) => (
    <div className="flex items-start gap-4 p-4 border border-gray-100 rounded-lg mb-4 hover:shadow-sm transition bg-white relative">
        <Link to="/dashboard/jobs/1" className="absolute inset-0 z-0"></Link>
        <div className="w-16 h-16 bg-[#1e2a4a] rounded-lg flex flex-col items-center justify-center text-white shrink-0 z-10 relative">
            <span className="text-xs uppercase font-bold">JAN</span>
            <span className="text-xl font-bold">28</span>
        </div>
        <div className="flex-1 z-10 relative pointer-events-none">
            <h4 className="text-sm font-bold text-gray-900 mb-1">{title}</h4>
            <div className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                <FaMapMarkerAlt /> {location}
            </div>
            <div className="flex items-center justify-between pointer-events-auto">
                <span className="text-xs font-medium text-orange-600">{seats} seats remaining</span>
                <Link to="/dashboard/jobs/1" className="text-xs bg-secondary text-white px-3 py-1.5 rounded font-bold hover:bg-amber-600 transition z-20">
                    Register
                </Link>
            </div>
        </div>
    </div>
);

const DashboardHome = () => {
    return (
        <div className="w-full space-y-8">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-[#1e2a4a]">Welcome back, Rajesh!</h1>
                    <p className="text-gray-500 text-sm mt-1">Last login: Today at 2:30 PM</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full border border-yellow-200">
                        KYC Pending
                    </span>
                    <button className="bg-[#1e2a4a] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#2a3b66] transition shadow-sm">
                        Complete Profile
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column (2/3 width) */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Active Applications */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg text-gray-800">My Active Applications</h3>
                            <Link to="/dashboard/applications" className="text-secondary text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
                                View All <FaChevronRight size={10} />
                            </Link>
                        </div>
                        <div className="space-y-1">
                            <ApplicationRow id="MEWS-2025-1234" date="Jan 15, 2025" status="Under Review" statusColor="bg-yellow-100 text-yellow-700" />
                            <ApplicationRow id="MEWS-2025-1235" date="Jan 12, 2025" status="Approved" statusColor="bg-green-100 text-green-700" />
                            <ApplicationRow id="MEWS-2025-1236" date="Jan 10, 2025" status="Disbursed" statusColor="bg-blue-100 text-blue-700" />
                        </div>
                        <div className="mt-4 text-center">
                            <Link to="/dashboard/applications" className="text-sm font-bold text-secondary hover:text-primary transition">
                                View All Aplications →
                            </Link>
                        </div>
                    </div>

                    {/* Upcoming Jobs */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg text-gray-800">Upcoming Job Melas</h3>
                            <span className="text-xs font-medium text-gray-500">2 events this month</span>
                        </div>
                        <JobEventCard
                            title="Tech Job Fair 2025"
                            location="Mumbai Convention Center"
                            seats="24"
                        />
                        <JobEventCard
                            title="Healthcare Career Fair"
                            location="Delhi Medical Centre"
                            seats="12"
                        />
                        <div className="mt-4 text-center">
                            <Link to="/dashboard/jobs" className="text-sm font-bold text-secondary hover:text-primary transition">View All Events →</Link>
                        </div>
                    </div>

                </div>

                {/* Right Column (1/3 width) */}
                <div className="space-y-8">

                    {/* KYC Status Card */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <FaUserCircle size={100} />
                        </div>
                        <h3 className="font-bold text-lg text-gray-800 mb-4">KYC Status</h3>

                        <div className="flex justify-center mb-6">
                            <div className="bg-yellow-50 text-yellow-700 px-6 py-2 rounded-full font-bold text-sm border border-yellow-100 shadow-sm">
                                Under Review
                            </div>
                        </div>

                        <div className="space-y-2 mb-6">
                            <div className="flex justify-between text-xs font-bold text-gray-600">
                                <span>Progress</span>
                                <span>75%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div className="bg-secondary h-2 rounded-full" style={{ width: '75%' }}></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                Your documents are being reviewed. Expected completion: Jan 25, 2025
                            </p>
                        </div>

                        <Link to="/dashboard/kyc" className="block w-full text-center bg-secondary text-white py-3 rounded-lg font-bold text-sm hover:bg-amber-600 transition shadow-md">
                            View Details
                        </Link>
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
