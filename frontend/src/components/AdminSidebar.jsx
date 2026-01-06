import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    FaThLarge, FaUsers, FaBuilding, FaUserPlus,
    FaHandHoldingUsd, FaSignOutAlt, FaChartLine, FaCog, FaQuestionCircle, FaBullhorn, FaUserShield
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
    const [adminName, setAdminName] = useState('');
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        const info = localStorage.getItem('adminInfo');
        if (info) {
            const { role, name } = JSON.parse(info);
            setAdminName(name || 'Admin');
            setUserRole(role);
            if (role === 'VILLAGE_ADMIN') setRoleLabel('Village Dashboard');
            else if (role === 'MANDAL_ADMIN') setRoleLabel('Mandal Dashboard');
            else if (role === 'DISTRICT_ADMIN') setRoleLabel('District Dashboard');
            else setRoleLabel('Admin Dashboard');
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('adminInfo');
        navigate('/admin/login');
    };

    return (
        <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col overflow-y-auto min-h-[calc(100vh-64px)] dark:bg-slate-800 dark:border-slate-700 transition-colors duration-300">
            <div className="p-4 space-y-1">
                {/* Admin Name Display */}
                <div className="mb-4 px-4">
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Welcome</h2>
                    <p className="text-lg font-bold text-[#1e2a4a] truncate">{adminName}</p>
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
                <SidebarItem to="/admin/settings" icon={FaCog} label="Village Settings" active={activePage === 'settings'} />
                <SidebarItem to="/admin/help" icon={FaQuestionCircle} label="Help & Support" active={activePage === 'help'} />
                <SidebarItem to="/admin/announcements" icon={FaBullhorn} label="Announcements" active={activePage === 'announcements'} />

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
    );
};

export default AdminSidebar;
