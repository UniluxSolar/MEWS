import React, { useState } from 'react';
import AdminHeader from '../components/AdminHeader';
import AdminSidebar from '../components/AdminSidebar';
import {
    FaBullhorn, FaHistory, FaPlus, FaBold, FaItalic, FaUnderline, FaListUl, FaListOl, FaLink,
    FaCloudUploadAlt, FaEye, FaSave, FaPaperPlane, FaClock, FaCheckCircle, FaExclamationTriangle,
    FaUsers, FaCalendarAlt
} from 'react-icons/fa';

const AdminAnnouncements = () => {
    const [activeTab, setActiveTab] = useState('announcements');
    const [viewHistory, setViewHistory] = useState(false);

    return (
        <div className="min-h-screen bg-[#f3f4f6] font-sans flex flex-col">
            <AdminHeader />

            <div className="flex flex-1 overflow-hidden">
                <AdminSidebar activePage="announcements" />

                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Announcements & Reports</h1>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                <span>Dashboard</span>
                                <span>&gt;</span>
                                <span>Announcements & Reports</span>
                            </div>
                        </div>
                        <button className="bg-white p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">
                            <FaHistory />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-200 mb-6">
                        <button
                            className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'announcements' ? 'border-[#1e2a4a] text-[#1e2a4a]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setActiveTab('announcements')}
                        >
                            Announcements
                        </button>
                        <button
                            className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'reports' ? 'border-[#1e2a4a] text-[#1e2a4a]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setActiveTab('reports')}
                        >
                            Reports
                        </button>
                    </div>

                    {activeTab === 'announcements' && (
                        <>
                            {/* Management Header Card */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Announcements Management</h2>
                                    <p className="text-sm text-gray-500">Total announcements sent: 127</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-10 h-5 rounded-full p-1 cursor-pointer transition-colors ${viewHistory ? 'bg-blue-600' : 'bg-gray-200'}`} onClick={() => setViewHistory(!viewHistory)}>
                                            <div className={`w-3 h-3 bg-white rounded-full shadow-sm transform transition-transform ${viewHistory ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                        </div>
                                        <span className="text-sm font-medium text-gray-600">View Sent History</span>
                                    </div>
                                    <button className="bg-[#1e2a4a] hover:bg-[#2a3b66] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition">
                                        <FaPlus size={12} /> Compose New Announcement
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Left Column: Compose Form */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                        <h3 className="text-base font-bold text-gray-900 mb-6">Compose New Announcement</h3>

                                        <div className="space-y-6">
                                            {/* Subject */}
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Subject/Title</label>
                                                <input
                                                    type="text"
                                                    placeholder="Enter announcement subject..."
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                                />
                                            </div>

                                            {/* Message Body */}
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Message Body</label>
                                                <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                                                    {/* Fake Toolbar */}
                                                    <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-white">
                                                        <button className="p-1.5 hover:bg-gray-100 rounded text-gray-600"><FaBold size={12} /></button>
                                                        <button className="p-1.5 hover:bg-gray-100 rounded text-gray-600"><FaItalic size={12} /></button>
                                                        <button className="p-1.5 hover:bg-gray-100 rounded text-gray-600"><FaUnderline size={12} /></button>
                                                        <div className="w-px h-4 bg-gray-300 mx-1"></div>
                                                        <button className="p-1.5 hover:bg-gray-100 rounded text-gray-600"><FaListUl size={12} /></button>
                                                        <button className="p-1.5 hover:bg-gray-100 rounded text-gray-600"><FaListOl size={12} /></button>
                                                        <div className="w-px h-4 bg-gray-300 mx-1"></div>
                                                        <button className="p-1.5 hover:bg-gray-100 rounded text-gray-600"><FaLink size={12} /></button>
                                                    </div>
                                                    <textarea
                                                        rows="6"
                                                        placeholder="Write your announcement message here..."
                                                        className="w-full bg-gray-50 p-4 text-sm focus:outline-none resize-none"
                                                    ></textarea>
                                                </div>
                                            </div>

                                            {/* Attachments */}
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Attachments</label>
                                                <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 flex flex-col items-center justify-center text-center bg-white cursor-pointer hover:bg-gray-50 transition">
                                                    <div className="bg-gray-100 p-3 rounded-full mb-3">
                                                        <FaCloudUploadAlt size={24} className="text-gray-400" />
                                                    </div>
                                                    <p className="text-sm font-medium text-gray-600">Drop files here or click to upload</p>
                                                    <div className="flex gap-4 mt-2 text-xs text-blue-600 font-bold">
                                                        <span className="hover:underline">Upload Images</span>
                                                        <span className="hover:underline">Attach Documents</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Target Audience */}
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Target Audience</label>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <select className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 cursor-pointer">
                                                        <option>Select Villages</option>
                                                        <option>All Villages</option>
                                                        <option>Peddakaparthy</option>
                                                        <option>Chityala</option>
                                                    </select>
                                                    <select className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 cursor-pointer">
                                                        <option>Select Specific Members</option>
                                                    </select>
                                                </div>
                                                <div className="mt-2 text-xs text-blue-500 bg-blue-50 inline-block px-2 py-1 rounded font-medium">
                                                    Selected targets: <span className="font-bold">3 villages (847 members)</span>
                                                </div>
                                            </div>

                                            {/* Schedule Options */}
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase">Schedule Options</label>
                                                <div className="space-y-2">
                                                    <label className="flex items-center gap-3 cursor-pointer">
                                                        <input type="radio" name="schedule" defaultChecked className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
                                                        <span className="text-sm text-gray-700">Send Immediately</span>
                                                    </label>
                                                    <label className="flex items-center gap-3 cursor-pointer">
                                                        <input type="radio" name="schedule" className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
                                                        <span className="text-sm text-gray-700">Schedule for Later</span>
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                                                <button className="text-blue-600 hover:text-blue-800 text-sm font-bold flex items-center gap-2">
                                                    <FaEye /> Preview
                                                </button>
                                                <div className="flex items-center gap-3">
                                                    <button className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold transition">
                                                        Save as Draft
                                                    </button>
                                                    <button className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold transition">
                                                        Cancel
                                                    </button>
                                                    <button className="bg-[#1e2a4a] hover:bg-[#2a3b66] text-white px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition">
                                                        <FaPaperPlane size={12} /> Send Announcement
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Analytics & History */}
                                <div className="space-y-6">
                                    {/* Analytics Summary */}
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                        <h3 className="text-base font-bold text-gray-900 mb-6">Analytics Summary</h3>

                                        <div className="mb-6">
                                            <div className="flex justify-between items-end mb-2">
                                                <span className="text-sm text-gray-500">Total Announcements</span>
                                                <span className="text-2xl font-bold text-[#1e2a4a]">127</span>
                                            </div>
                                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-[#1e2a4a] w-[85%] rounded-full"></div>
                                            </div>
                                        </div>

                                        <div className="mb-6">
                                            <div className="flex justify-between items-end mb-2">
                                                <span className="text-sm text-gray-500">Avg. Delivery Rate</span>
                                                <span className="text-2xl font-bold text-green-600">94%</span>
                                            </div>
                                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-green-500 w-[94%] rounded-full"></div>
                                            </div>
                                        </div>

                                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                            <div className="flex items-start gap-3">
                                                <FaClock className="text-blue-600 mt-1" />
                                                <div>
                                                    <p className="text-xs font-bold text-blue-600 uppercase mb-1">Most Recent</p>
                                                    <p className="text-sm font-bold text-blue-900">Monsoon Season Alert</p>
                                                    <p className="text-xs text-blue-500 mt-1">2 hours ago</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recent Announcements */}
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-base font-bold text-gray-900">Recent Announcements</h3>
                                            <button className="text-xs font-bold text-blue-600 hover:text-blue-800">View All</button>
                                        </div>

                                        <div className="space-y-4">
                                            {[
                                                { title: "Monsoon Season Alert", sentTo: "5 villages", time: "2h ago", status: "Delivered: 98%", statusColor: "green", icon: FaBullhorn, iconColor: "blue" },
                                                { title: "Village Council Meeting", sentTo: "3 villages", time: "1d ago", status: "Delivered: 100%", statusColor: "green", icon: FaCalendarAlt, iconColor: "green" },
                                                { title: "Health Camp Schedule", sentTo: "7 villages", time: "3d ago", status: "Delivered: 89%", statusColor: "orange", icon: FaExclamationTriangle, iconColor: "orange" }
                                            ].map((item, index) => (
                                                <div key={index} className="flex items-start gap-3 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-${item.iconColor}-50 text-${item.iconColor}-500 shrink-0`}>
                                                        <item.icon size={12} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-bold text-gray-900">{item.title}</p>
                                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                                            Sent to {item.sentTo} • {item.time}
                                                        </p>
                                                        <span className={`inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold bg-${item.statusColor}-100 text-${item.statusColor}-700`}>
                                                            {item.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'reports' && (
                        <div className="flex items-center justify-center h-64 bg-white rounded-xl border border-gray-200">
                            <p className="text-gray-400 font-medium">Reports Module Coming Soon</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default AdminAnnouncements;
