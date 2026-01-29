import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';
import AdminSidebar from '../components/AdminSidebar';
import { FaSave, FaBuilding, FaBell, FaLock, FaPalette } from 'react-icons/fa';
import DashboardHeader from '../components/common/DashboardHeader';
import API from '../api';

const AdminVillageSettings = () => {
    const [activeSection, setActiveSection] = useState('general');
    const [settings, setSettings] = useState({
        villageName: '',
        mandal: '',
        district: '',
        email: ''
    });
    const [loading, setLoading] = useState(true);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [theme, setTheme] = useState('light');
    const [pageTitle, setPageTitle] = useState('Settings');
    const [pageSubtitle, setPageSubtitle] = useState('Manage configuration and preferences.');
    const [locationFieldLabel, setLocationFieldLabel] = useState('Location Name');
    const [locationFieldValue, setLocationFieldValue] = useState('');
    const [adminRole, setAdminRole] = useState('');

    // Determine titles based on role
    useEffect(() => {
        const info = localStorage.getItem('adminInfo');
        if (info) {
            const { role } = JSON.parse(info);
            setAdminRole(role);
            if (role === 'VILLAGE_ADMIN') {
                setPageTitle('Village Settings');
                setPageSubtitle('Manage configuration and preferences for your village.');
                setLocationFieldLabel('Village Name');
            } else if (role === 'MANDAL_ADMIN') {
                setPageTitle('Mandal Settings');
                setPageSubtitle('Manage configuration and preferences for your mandal.');
                setLocationFieldLabel('Mandal Name');
            } else if (role === 'MUNICIPALITY_ADMIN') {
                setPageTitle('Municipality Settings');
                setPageSubtitle('Manage configuration and preferences for your municipality.');
                setLocationFieldLabel('Municipality Name');
            } else if (role === 'DISTRICT_ADMIN') {
                setPageTitle('District Settings');
                setPageSubtitle('Manage configuration and preferences for your district.');
                setLocationFieldLabel('District Name');
            } else if (role === 'STATE_ADMIN') {
                setPageTitle('State Settings');
                setPageSubtitle('Manage configuration and preferences for the state.');
                setLocationFieldLabel('State Name');
            } else {
                setPageTitle('Admin Settings');
            }
        }
    }, []);

    // Initialize Theme
    useEffect(() => {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme) {
            setTheme(storedTheme);
            if (storedTheme === 'dark') document.documentElement.classList.add('dark');
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setTheme('dark');
            document.documentElement.classList.add('dark');
        }
    }, []);

    // Theme Switcher
    const switchTheme = (newTheme) => {
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    // Update settings state to include 2fa when fetching
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await API.get('/admin/settings');
                setSettings(data);

                // Set initial location field value based on role
                if (adminRole === 'VILLAGE_ADMIN') setLocationFieldValue(data.villageName);
                else if (adminRole === 'MANDAL_ADMIN') setLocationFieldValue(data.mandal);
                else if (adminRole === 'MUNICIPALITY_ADMIN') setLocationFieldValue(data.municipalityName);
                else if (adminRole === 'DISTRICT_ADMIN') setLocationFieldValue(data.district);
                else if (adminRole === 'STATE_ADMIN') setLocationFieldValue(data.stateName || 'Telangana');

            } catch (error) {
                console.error("Failed to fetch settings", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, [adminRole]);

    const handleChange = (e) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert("New passwords do not match!");
            return;
        }
        try {
            await API.put('/auth/password', {
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword
            });
            alert("Password updated successfully!");
            setShowPasswordModal(false);
            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            alert(error.response?.data?.message || "Failed to update password");
        }
    };

    const toggle2FA = async () => {
        try {
            const { data } = await API.put('/auth/2fa');
            setTwoFactorEnabled(data.enabled);
            alert(data.message);
        } catch (error) {
            console.error("Failed to toggle 2FA", error);
        }
    };

    return (
        <div className="min-h-screen bg-[#f3f4f6] font-sans flex flex-col dark:bg-slate-900 transition-colors duration-300">
            <AdminHeader />
            <div className="flex flex-1 overflow-hidden">
                <AdminSidebar activePage="settings" />
                <main className="flex-1 overflow-y-auto">
                    <DashboardHeader
                        title={pageTitle}
                        subtitle={pageSubtitle}
                        breadcrumb={
                            <>
                                <Link to="/admin/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
                                <span className="opacity-70">&gt;</span>
                                <span className="text-white font-medium">Settings</span>
                            </>
                        }
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
                                        {loading ? (
                                            <p className="text-gray-500">Loading settings...</p>
                                        ) : (
                                            <div className="space-y-6 max-w-2xl">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">{locationFieldLabel}</label>
                                                    <input
                                                        type="text"
                                                        value={locationFieldValue}
                                                        disabled
                                                        className="w-full bg-gray-100 border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-bold cursor-not-allowed"
                                                    />
                                                </div>

                                                {/* Conditional Grid Section */}
                                                {(adminRole === 'VILLAGE_ADMIN' || adminRole === 'MANDAL_ADMIN' || adminRole === 'MUNICIPALITY_ADMIN') && (
                                                    <div className="grid grid-cols-2 gap-6">
                                                        {adminRole === 'VILLAGE_ADMIN' && (
                                                            <div>
                                                                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">
                                                                    {settings.municipalityName ? 'Municipality' : 'Mandal'}
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={settings.municipalityName || settings.mandal}
                                                                    disabled
                                                                    className="w-full bg-gray-100 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-500 cursor-not-allowed"
                                                                />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">District</label>
                                                            <input
                                                                type="text"
                                                                value={settings.district}
                                                                disabled
                                                                className="w-full bg-gray-100 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-500 cursor-not-allowed"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Admin Contact Email</label>
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={settings.email}
                                                        onChange={handleChange}
                                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm hover:border-gray-300 focus:outline-none focus:border-blue-500"
                                                    />
                                                </div>
                                                <div className="pt-4">
                                                    <button className="bg-[#1e2a4a] hover:bg-[#2a3b66] text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-md transition flex items-center gap-2">
                                                        <FaSave /> Save Changes
                                                    </button>
                                                </div>
                                            </div>
                                        )}
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
                                    </div>
                                )}

                                {activeSection === 'security' && (
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-fade-in-up">
                                        <h2 className="text-lg font-bold text-gray-900 mb-6 border-b pb-4">Security & Access</h2>
                                        <p className="text-sm text-gray-500 mb-4">Manage password and access control settings.</p>
                                        <div className="space-y-4 max-w-xl">
                                            <button onClick={() => setShowPasswordModal(true)} className="w-full text-left px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-100 transition flex justify-between items-center bg-white shadow-sm">
                                                Change Password <span className="text-xs text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded">Update</span>
                                            </button>
                                            <button onClick={toggle2FA} className="w-full text-left px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-100 transition flex justify-between items-center bg-white shadow-sm">
                                                Two-Factor Authentication
                                                <span className={`text-xs font-bold px-2 py-1 rounded ${twoFactorEnabled ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'}`}>
                                                    {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                                                </span>
                                            </button>
                                            <button className="w-full text-left px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-100 transition flex justify-between items-center bg-white shadow-sm">
                                                Active Sessions <span className="text-xs text-gray-500 font-medium">1 Active (Current)</span>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {activeSection === 'theme' && (
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-fade-in-up dark:bg-slate-800 dark:border-slate-700">
                                        <h2 className="text-lg font-bold text-gray-900 mb-6 border-b pb-4 dark:text-white dark:border-slate-700">Appearance</h2>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div onClick={() => switchTheme('light')} className={`border-2 rounded-lg p-4 cursor-pointer bg-gray-50 transition-all ${theme === 'light' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-transparent hover:border-gray-300'}`}>
                                                <div className="h-20 bg-white border border-gray-200 rounded mb-2 shadow-sm"></div>
                                                <p className={`text-center text-sm font-bold ${theme === 'light' ? 'text-blue-600' : 'text-gray-500'}`}>Light Mode</p>
                                            </div>
                                            <div onClick={() => switchTheme('dark')} className={`border-2 rounded-lg p-4 cursor-pointer bg-gray-900 transition-all ${theme === 'dark' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-transparent hover:border-gray-700'}`}>
                                                <div className="h-20 bg-gray-800 rounded mb-2 shadow-inner border border-gray-700"></div>
                                                <p className={`text-center text-sm font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-gray-400'}`}>Dark Mode</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Change Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-fade-in-up">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Change Password</h3>
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Old Password</label>
                                <input type="password" required className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    value={passwordData.oldPassword} onChange={e => setPasswordData({ ...passwordData, oldPassword: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">New Password</label>
                                <input type="password" required className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    value={passwordData.newPassword} onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Confirm New Password</label>
                                <input type="password" required className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    value={passwordData.confirmPassword} onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setShowPasswordModal(false)} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg text-sm transition">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-900 text-white font-bold rounded-lg text-sm hover:bg-blue-800 transition shadow-md">Update Password</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminVillageSettings;
