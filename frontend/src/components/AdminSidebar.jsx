import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    FaThLarge, FaUsers, FaBuilding, FaUserPlus,
    FaHandHoldingUsd, FaSignOutAlt, FaChartLine, FaCog, FaQuestionCircle, FaBullhorn, FaUserShield, FaImages
} from 'react-icons/fa';

const SidebarItem = ({ icon: Icon, label, active, to }) => (
    <Link to={to || '#'} className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors mb-1 ${active ? 'bg-[#1e2a4a] text-white font-bold dark:bg-blue-600' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 font-medium dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white'}`}>
        <Icon size={18} className={active ? 'text-white' : 'text-gray-400 dark:text-slate-400'} />
        <span className="text-sm">{label}</span>
    </Link>
);

const AdminSidebar = ({ activePage }) => {
    const navigate = useNavigate();
    const [roleLabel, setRoleLabel] = useState('Dashboard');
    const [settingsLabel, setSettingsLabel] = useState('Settings');
    const [adminName, setAdminName] = useState('');
    const [userRole, setUserRole] = useState('');
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    useEffect(() => {
        const info = localStorage.getItem('adminInfo');
        if (info) {
            const { role, name } = JSON.parse(info);
            setAdminName(name || 'Admin');
            setUserRole(role);

            // Dashboard Label
            if (role === 'VILLAGE_ADMIN') setRoleLabel('Village Dashboard');
            else if (role === 'MANDAL_ADMIN') setRoleLabel('Mandal Dashboard');
            else if (role === 'DISTRICT_ADMIN') setRoleLabel('District Dashboard');
            else if (role === 'STATE_ADMIN') setRoleLabel('State Dashboard');
            else setRoleLabel('Admin Dashboard');

            // Settings Label
            if (role === 'VILLAGE_ADMIN') setSettingsLabel('Village Settings');
            else if (role === 'MANDAL_ADMIN') setSettingsLabel('Mandal Settings');
            else if (role === 'DISTRICT_ADMIN') setSettingsLabel('District Settings');
            else if (role === 'STATE_ADMIN') setSettingsLabel('State Settings');
            else setSettingsLabel('Admin Settings');
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('adminInfo');
        navigate('/admin/login');
    };

    return (
        <>
            {/* Mobile Header Toggle */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-30 flex items-center px-4 justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsMobileOpen(true)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg text-xl"
                    >
                        ☰
                    </button>
                    <span className="font-bold text-gray-800">{roleLabel}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                    {adminName.charAt(0)}
                </div>
            </div>

            {/* Mobile Backdrop */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden animate-fadeIn"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside className={`
                w-64 bg-white border-r border-gray-200 flex flex-col overflow-y-auto 
                transition-transform duration-300 ease-in-out
                fixed inset-y-0 left-0 z-50 md:sticky md:top-0 md:h-screen md:translate-x-0
                ${isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full shadow-none'}
                dark:bg-slate-800 dark:border-slate-700
            `}>
                <div className="p-4 space-y-1">
                    {/* Admin Name Display */}
                    <div className="mb-4 px-4 flex justify-between items-center">
                        <div>
                            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Welcome</h2>
                            <p className="text-lg font-bold text-[#1e2a4a] truncate max-w-[150px]">{adminName}</p>
                        </div>
                        {/* Close Button Mobile */}
                        <button onClick={() => setIsMobileOpen(false)} className="md:hidden text-gray-400 hover:text-red-500 text-lg">
                            ✕
                        </button>
                    </div>

                    {/* Registration Actions (Top Priority) */}
                    <SidebarItem to="/admin/members/new" icon={FaUserPlus} label="Add Member" active={activePage === 'register-member'} />
                    <SidebarItem to="/admin/institutions/new" icon={FaBuilding} label="Add Institution" active={activePage === 'register-institution'} />

                    <SidebarItem to="/admin/dashboard" icon={FaThLarge} label={roleLabel} active={activePage === 'dashboard'} />
                    {userRole !== 'VILLAGE_ADMIN' && (
                        <SidebarItem to="/admin/management" icon={FaUserShield} label="Manage Admins" active={activePage === 'admin-management'} />
                    )}
                    <SidebarItem to="/admin/members" icon={FaUsers} label="Member Management" active={activePage === 'members'} />
                    <SidebarItem to="/admin/institutions" icon={FaBuilding} label="Institution Management" active={activePage === 'institutions'} />

                    <SidebarItem to="/admin/funding" icon={FaHandHoldingUsd} label="Funding Requests" active={activePage === 'funding'} />

                    <SidebarItem to="/admin/activity-log" icon={FaChartLine} label="Activity Logs" active={activePage === 'activity'} />
                    <SidebarItem to="/admin/settings" icon={FaCog} label={settingsLabel} active={activePage === 'settings'} />
                    <SidebarItem to="/admin/help" icon={FaQuestionCircle} label="Help & Support" active={activePage === 'help'} />
                    <SidebarItem to="/admin/announcements" icon={FaBullhorn} label="Announcements" active={activePage === 'announcements'} />

                    {userRole === 'SUPER_ADMIN' && (
                        <SidebarItem to="/admin/carousel" icon={FaImages} label="Carousel Manager" active={activePage === 'carousel'} />
                    )}

                    {/* Testing Section */}
                    {/* Testing Section - Removed */}
                </div>

                <div className="mt-auto p-4 border-t border-gray-100">
                    <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 text-red-600 cursor-pointer hover:bg-red-50 rounded-lg transition-colors font-medium text-sm w-full text-left">
                        <FaSignOutAlt />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Spacer for Mobile Header */}
            <div className="md:hidden h-16 w-full flex-shrink-0" />
        </>
    );
};

export default AdminSidebar;
