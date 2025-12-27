import React, { useState } from 'react';
import AdminHeader from '../components/AdminHeader';
import AdminSidebar from '../components/AdminSidebar';
import DashboardHeader from '../components/common/DashboardHeader';
import {
    FaSearch, FaFilter, FaDownload, FaUserEdit, FaTrash, FaPlusCircle,
    FaSignInAlt, FaBullhorn, FaFileAlt
} from 'react-icons/fa';

const AdminActivityLog = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');

    // Mock Data
    const activities = [
        { id: 1, action: 'Member Updated', details: 'Updated profile for Venky (MEMBER-001)', user: 'Admin (You)', time: '2 mins ago', type: 'update', icon: FaUserEdit, color: 'blue' },
        { id: 2, action: 'New Announcement', details: 'Sent "Monsoon Alert" to 5 villages', user: 'Admin (You)', time: '1 hour ago', type: 'announcement', icon: FaBullhorn, color: 'purple' },
        { id: 3, action: 'Member Deleted', details: 'Removed inactive member ID-882', user: 'Super Admin', time: '3 hours ago', type: 'delete', icon: FaTrash, color: 'red' },
        { id: 4, action: 'New Registration', details: 'Added new member Rajesh Kumar', user: 'Admin (You)', time: '5 hours ago', type: 'create', icon: FaPlusCircle, color: 'green' },
        { id: 5, action: 'Login', details: 'Successful login from IP 192.168.1.1', user: 'Admin (You)', time: 'Yesterday', type: 'login', icon: FaSignInAlt, color: 'slate' },
        { id: 6, action: 'Report Generated', details: 'Downloaded "Monthly Census Report"', user: 'Admin (You)', time: 'Yesterday', type: 'report', icon: FaFileAlt, color: 'orange' },
    ];

    const filteredActivities = activities.filter(activity => {
        const matchesSearch = activity.details.toLowerCase().includes(searchTerm.toLowerCase()) || activity.action.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterType === 'All' || activity.type === filterType;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
            <AdminHeader />
            <div className="flex flex-1 overflow-hidden">
                <AdminSidebar activePage="activity" />
                <main className="flex-1 overflow-y-auto">
                    <DashboardHeader
                        title="Activity Logs"
                        subtitle="Track all administrative actions and system events."
                    >
                        <button className="bg-white bg-opacity-10 hover:bg-opacity-20 backdrop-blur-md text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all border border-white/20">
                            <FaDownload /> Export Log
                        </button>
                    </DashboardHeader>

                    <div className="max-w-full px-4 pb-12 -mt-10">
                        {/* Filters & Search */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className="relative flex-1 md:w-80">
                                    <FaSearch className="absolute left-3 top-3 text-slate-400 text-sm" />
                                    <input
                                        type="text"
                                        placeholder="Search logs..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 font-medium text-slate-700"
                                    />
                                </div>
                                <div className="relative">
                                    <select
                                        value={filterType}
                                        onChange={(e) => setFilterType(e.target.value)}
                                        className="appearance-none bg-white border border-slate-200 rounded-xl pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:border-blue-500 cursor-pointer font-bold text-slate-700 hover:bg-slate-50 transition"
                                    >
                                        <option value="All">All Events</option>
                                        <option value="update">Updates</option>
                                        <option value="create">Creations</option>
                                        <option value="delete">Deletions</option>
                                        <option value="login">Logins</option>
                                        <option value="announcement">Announcements</option>
                                    </select>
                                    <FaFilter className="absolute right-3 top-3.5 text-slate-400 text-xs pointer-events-none" />
                                </div>
                            </div>
                            <div className="text-sm text-slate-500 font-bold bg-slate-50 px-3 py-1 rounded-lg border border-slate-200">
                                {filteredActivities.length} Events Found
                            </div>
                        </div>

                        {/* Activity Timeline */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            {filteredActivities.length > 0 ? (
                                <div className="p-8">
                                    <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                                        {filteredActivities.map((activity) => (
                                            <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                                {/* Icon */}
                                                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 border-white bg-slate-100 shadow-md shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 text-${activity.color}-500`}>
                                                    <activity.icon size={16} />
                                                </div>
                                                {/* Content Card */}
                                                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
                                                    <div className="flex items-center justify-between space-x-2 mb-2">
                                                        <div className="font-bold text-slate-800 text-sm">{activity.action}</div>
                                                        <time className="font-bold text-xs text-blue-500 bg-blue-50 px-2 py-1 rounded-md">{activity.time}</time>
                                                    </div>
                                                    <div className="text-slate-500 text-sm mb-3 font-medium">{activity.details}</div>
                                                    <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                                        User: <span className="text-slate-600">{activity.user}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="p-16 text-center text-slate-400">
                                    <div className="text-lg font-medium">No activities found matching filters.</div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminActivityLog;
