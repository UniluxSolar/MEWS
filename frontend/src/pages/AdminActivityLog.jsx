import React, { useState } from 'react';
import AdminHeader from '../components/AdminHeader';
import AdminSidebar from '../components/AdminSidebar';
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
        { id: 5, action: 'Login', details: 'Successful login from IP 192.168.1.1', user: 'Admin (You)', time: 'Yesterday', type: 'login', icon: FaSignInAlt, color: 'gray' },
        { id: 6, action: 'Report Generated', details: 'Downloaded "Monthly Census Report"', user: 'Admin (You)', time: 'Yesterday', type: 'report', icon: FaFileAlt, color: 'orange' },
    ];

    const filteredActivities = activities.filter(activity => {
        const matchesSearch = activity.details.toLowerCase().includes(searchTerm.toLowerCase()) || activity.action.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterType === 'All' || activity.type === filterType;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="min-h-screen bg-[#f3f4f6] font-sans flex flex-col">
            <AdminHeader />
            <div className="flex flex-1 overflow-hidden">
                <AdminSidebar activePage="activity" />
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1>
                            <p className="text-sm text-gray-500 mt-1">Track all administrative actions and system events.</p>
                        </div>
                        <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-gray-50 transition shadow-sm">
                            <FaDownload size={12} /> Export Log
                        </button>
                    </div>

                    {/* Filters & Search */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="relative flex-1 md:w-80">
                                <FaSearch className="absolute left-3 top-3 text-gray-400 text-sm" />
                                <input
                                    type="text"
                                    placeholder="Search logs..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div className="relative">
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="appearance-none bg-white border border-gray-200 rounded-lg pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:border-blue-500 cursor-pointer font-medium text-gray-700"
                                >
                                    <option value="All">All Events</option>
                                    <option value="update">Updates</option>
                                    <option value="create">Creations</option>
                                    <option value="delete">Deletions</option>
                                    <option value="login">Logins</option>
                                    <option value="announcement">Announcements</option>
                                </select>
                                <FaFilter className="absolute right-3 top-3 text-gray-400 text-xs pointer-events-none" />
                            </div>
                        </div>
                        <div className="text-sm text-gray-500 font-medium">
                            Showing {filteredActivities.length} events
                        </div>
                    </div>

                    {/* Activity Timeline */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {filteredActivities.length > 0 ? (
                            <div className="p-6">
                                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                                    {filteredActivities.map((activity) => (
                                        <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                            {/* Icon */}
                                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 text-gray-500">
                                                <activity.icon className={`text-${activity.color}-500`} size={16} />
                                            </div>
                                            {/* Content Card */}
                                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex items-center justify-between space-x-2 mb-1">
                                                    <div className="font-bold text-gray-900 text-sm">{activity.action}</div>
                                                    <time className="font-medium text-xs text-indigo-500">{activity.time}</time>
                                                </div>
                                                <div className="text-gray-500 text-xs mb-2">{activity.details}</div>
                                                <div className="text-gray-400 text-[10px] font-mono uppercase tracking-wide">User: {activity.user}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="p-12 text-center text-gray-500">
                                <p>No activities found matching filters.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminActivityLog;
