import React, { useState } from 'react';
import AdminHeader from '../components/AdminHeader';
import AdminSidebar from '../components/AdminSidebar';
import { FaSave, FaBuilding, FaBell, FaLock, FaPalette } from 'react-icons/fa';
import DashboardHeader from '../components/common/DashboardHeader';

const AdminVillageSettings = () => {
    const [activeSection, setActiveSection] = useState('general');

    return (
        <div className="min-h-screen bg-[#f3f4f6] font-sans flex flex-col">
            <AdminHeader />
            <div className="flex flex-1 overflow-hidden">
                <AdminSidebar activePage="settings" />
                <main className="flex-1 overflow-y-auto">
                    <DashboardHeader
                        title="Village Settings"
                        subtitle="Manage configuration and preferences for your village."
                    />
                    <div className="px-4 md:px-8 -mt-10 pb-12 w-full">

                        <div className="flex flex-col lg:flex-row gap-6">
                            {/* Settings Sidebar */}
                            <div className="w-full lg:w-64 shrink-0 space-y-2">
                                <button
                                    onClick={() => setActiveSection('general')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-colors ${activeSection === 'general' ? 'bg-[#1e2a4a] text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'}`}
                                >
                                    <FaBuilding /> General Info
                                </button>
                                <button
                                    onClick={() => setActiveSection('notifications')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-colors ${activeSection === 'notifications' ? 'bg-[#1e2a4a] text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'}`}
                                >
                                    <FaBell /> Notifications
                                </button>
                                <button
                                    onClick={() => setActiveSection('security')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-colors ${activeSection === 'security' ? 'bg-[#1e2a4a] text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'}`}
                                >
                                    <FaLock /> Security & Access
                                </button>
                                <button
                                    onClick={() => setActiveSection('theme')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-colors ${activeSection === 'theme' ? 'bg-[#1e2a4a] text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'}`}
                                >
                                    <FaPalette /> Appearance
                                </button>
                            </div>

                            {/* Settings Content */}
                            <div className="flex-1">
                                {activeSection === 'general' && (
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-fade-in-up">
                                        <h2 className="text-lg font-bold text-gray-900 mb-6 border-b pb-4">General Information</h2>
                                        <div className="space-y-6 max-w-2xl">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Village Name</label>
                                                <input type="text" defaultValue="Gundlapally" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-bold hover:border-gray-300 focus:outline-none focus:border-blue-500" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Mandal</label>
                                                    <input type="text" defaultValue="Chityala" disabled className="w-full bg-gray-100 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-500 cursor-not-allowed" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">District</label>
                                                    <input type="text" defaultValue="Nalgonda" disabled className="w-full bg-gray-100 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-500 cursor-not-allowed" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Admin Contact Email</label>
                                                <input type="email" defaultValue="admin.gundlapally@mews.org" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm hover:border-gray-300 focus:outline-none focus:border-blue-500" />
                                            </div>
                                            <div className="pt-4">
                                                <button className="bg-[#1e2a4a] hover:bg-[#2a3b66] text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-md transition flex items-center gap-2">
                                                    <FaSave /> Save Changes
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeSection === 'notifications' && (
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-fade-in-up">
                                        <h2 className="text-lg font-bold text-gray-900 mb-6 border-b pb-4">Notification Preferences</h2>
                                        <div className="space-y-4">
                                            {[
                                                { label: "New Member Registration Alerts", desc: "Get notified when a new member registers via the public portal." },
                                                { label: "SOS Emergency Alerts", desc: "Receive immediate alerts for SOS triggers in your village.", checked: true },
                                                { label: "System Maintenance Updates", desc: "Notifications about system downtime or upgrades." },
                                                { label: "Report Generation Success", desc: "Email me when large reports are ready to download.", checked: true },
                                            ].map((item, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-sm">{item.label}</p>
                                                        <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                                                    </div>
                                                    <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                                                        <input type="checkbox" name={`toggle-${idx}`} id={`toggle-${idx}`} defaultChecked={item.checked} className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-gray-300 checked:right-0 checked:border-green-400" />
                                                        <label htmlFor={`toggle-${idx}`} className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer checked:bg-green-400"></label>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <style jsx>{`
                                        .toggle-checkbox:checked { right: 0; border-color: #68D391; }
                                        .toggle-checkbox:checked + .toggle-label { background-color: #68D391; }
                                        .toggle-checkbox { right: auto; left: 0; transition: all 0.3s; }
                                    `}</style>
                                    </div>
                                )}

                                {activeSection === 'security' && (
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-fade-in-up">
                                        <h2 className="text-lg font-bold text-gray-900 mb-6 border-b pb-4">Security & Access</h2>
                                        <p className="text-sm text-gray-500 mb-4">Manage password and access control settings.</p>
                                        <div className="space-y-4 max-w-xl">
                                            <button className="w-full text-left px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-100 transition flex justify-between items-center bg-white">
                                                Change Password <span className="text-xs text-blue-600">Update</span>
                                            </button>
                                            <button className="w-full text-left px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-100 transition flex justify-between items-center bg-white">
                                                Two-Factor Authentication <span className="text-xs text-red-500">Disabled</span>
                                            </button>
                                            <button className="w-full text-left px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-100 transition flex justify-between items-center bg-white">
                                                Active Sessions <span className="text-xs text-gray-500">2 Active</span>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {activeSection === 'theme' && (
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-fade-in-up">
                                        <h2 className="text-lg font-bold text-gray-900 mb-6 border-b pb-4">Appearance</h2>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="border-2 border-blue-500 rounded-lg p-4 cursor-pointer bg-gray-50">
                                                <div className="h-20 bg-white border border-gray-200 rounded mb-2"></div>
                                                <p className="text-center text-sm font-bold text-blue-600">Light Mode</p>
                                            </div>
                                            <div className="border-2 border-transparent hover:border-gray-300 rounded-lg p-4 cursor-pointer bg-gray-900">
                                                <div className="h-20 bg-gray-800 rounded mb-2"></div>
                                                <p className="text-center text-sm font-bold text-gray-300">Dark Mode</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminVillageSettings;
