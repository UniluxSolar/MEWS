import React, { useEffect, useState } from 'react';
import { BASE_URL } from '../api';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    FaThLarge, FaUsers, FaBuilding, FaUserPlus,
    FaHandHoldingUsd, FaSignOutAlt, FaChartLine, FaCog, FaQuestionCircle, FaBullhorn, FaUserShield, FaImages, FaBell,
    FaShieldAlt
} from 'react-icons/fa';

const SidebarItem = ({ icon: Icon, label, active, to }) => (
    <Link to={to || '#'} className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors mb-1 ${active ? 'bg-[#1e2a4a] text-white font-bold dark:bg-blue-600' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 font-medium dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white'}`}>
        <Icon size={18} className={active ? 'text-white' : 'text-gray-400 dark:text-slate-400'} />
        <span className="text-sm">{label}</span>
    </Link>
);

const AdminSidebar = ({ activePage, showMobileHeader = true }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [roleLabel, setRoleLabel] = useState('Dashboard');
    const [settingsLabel, setSettingsLabel] = useState('Settings');
    const [adminName, setAdminName] = useState('');
    const [userRole, setUserRole] = useState('');
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [profilePhoto, setProfilePhoto] = useState('/assets/images/user-profile.png');

    useEffect(() => {
        const loadUserInfo = () => {
            const adminInfoStr = sessionStorage.getItem('adminInfo');
            const memberInfoStr = sessionStorage.getItem('memberInfo');
            const infoStr = adminInfoStr || memberInfoStr;

            if (infoStr) {
                const parsed = JSON.parse(infoStr);
                const role = (parsed.role || '').toUpperCase().replace(/-/g, '_');
                const email = (parsed.email || '').toLowerCase();
                const username = (parsed.username || '').toString();
                const mobile = (parsed.mobile || '').toString();

                // Robust role identification
                const isMemberAdmin = (role === 'MEMBER_ADMIN');
                const isDistrictAdmin = (role === 'DISTRICT_ADMIN');
                const isMandalAdmin = (role === 'MANDAL_ADMIN');
                const isVillageAdmin = (role === 'VILLAGE_ADMIN');
                const isMunicipalityAdmin = (role === 'MUNICIPALITY_ADMIN');
                const isWardAdmin = (role === 'WARD_ADMIN');
                const isScrutiny = (role === 'SCRUTINY_ADMIN');
                const isState = (role === 'STATE_ADMIN');
                const isSuper = (role === 'SUPER_ADMIN' || ((username === '8500626600' || mobile === '8500626600' || email === 'uniluxsolar@gmail.com') && !isMemberAdmin && !isDistrictAdmin && !isMandalAdmin && !isVillageAdmin && !isMunicipalityAdmin && !isWardAdmin && !isScrutiny)) && !isState;

                if (role === 'MEMBER_ADMIN') {
                    const fullName = parsed.surname ? `${parsed.surname} ${parsed.name}` : (parsed.name || 'Member');
                    setAdminName(fullName);
                } else if (isSuper) {
                    setAdminName('8500626600');
                } else if (isState) {
                    setAdminName(mobile || username || 'Admin');
                } else {
                    const fullName = parsed.surname ? `${parsed.surname} ${parsed.name}` : (parsed.name || 'Admin');
                    setAdminName(fullName);
                }
                
                setUserRole(isSuper ? 'SUPER_ADMIN' : role);

                // Dashboard Label
                if (role === 'VILLAGE_ADMIN') setRoleLabel('Village Dashboard');
                else if (role === 'WARD_ADMIN') setRoleLabel('Ward Dashboard');
                else if (role === 'MANDAL_ADMIN') setRoleLabel('Mandal Dashboard');
                else if (role === 'DISTRICT_ADMIN') setRoleLabel('District Dashboard');
                else if (role === 'STATE_ADMIN') setRoleLabel('State Dashboard');
                else if (role === 'SUPER_ADMIN') setRoleLabel('Admin Dashboard');
                else if (role === 'SCRUTINY_ADMIN') setRoleLabel('Scrutiny Portal');
                else setRoleLabel('Admin Dashboard');

                // Settings Label
                if (role === 'VILLAGE_ADMIN') setSettingsLabel('Village Admin Settings');
                else if (role === 'WARD_ADMIN') setSettingsLabel('Ward Admin Settings');
                else if (role === 'MANDAL_ADMIN') setSettingsLabel('Mandal Admin Settings');
                else if (role === 'MUNICIPALITY_ADMIN') setSettingsLabel('Municipality Admin Settings');
                else if (role === 'DISTRICT_ADMIN') setSettingsLabel('District Admin Settings');
                else if (role === 'STATE_ADMIN') setSettingsLabel('State Admin Settings');
                else setSettingsLabel('Super Admin Settings');

                // Dynamic Profile Image Logic
                const photo = parsed.photoUrl || parsed.photo || parsed.photo_url;
                let finalMemberPhoto = '/assets/images/user-profile.png';
                if (photo) {
                    const normalizedPhoto = photo.replace(/\\/g, '/');
                    if (normalizedPhoto.startsWith('http')) {
                        finalMemberPhoto = `${BASE_URL}/api/proxy-image?url=${encodeURIComponent(normalizedPhoto)}`;
                    } else {
                        const cleanPhoto = normalizedPhoto.startsWith('/') ? normalizedPhoto : `/${normalizedPhoto}`;
                        finalMemberPhoto = `${BASE_URL}${cleanPhoto}`;
                    }
                }
                setProfilePhoto(finalMemberPhoto);
            }
        };

        const handleToggleEvent = () => setIsMobileOpen(prev => !prev);
        const handleCloseEvent = () => setIsMobileOpen(false);

        window.addEventListener('storage', loadUserInfo);
        window.addEventListener('login-success', loadUserInfo);
        window.addEventListener('toggle-admin-sidebar', handleToggleEvent);
        window.addEventListener('close-admin-sidebar', handleCloseEvent);
        
        loadUserInfo();

        return () => {
            window.removeEventListener('storage', loadUserInfo);
            window.removeEventListener('login-success', loadUserInfo);
            window.removeEventListener('toggle-admin-sidebar', handleToggleEvent);
            window.removeEventListener('close-admin-sidebar', handleCloseEvent);
        };
    }, []);

    // Close sidebar on navigation (mobile)
    useEffect(() => {
        setIsMobileOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        sessionStorage.removeItem('adminInfo');
        sessionStorage.removeItem('memberInfo');
        sessionStorage.removeItem('savedUser');
        navigate('/admin/login');
    };

    return (
        <>
            {/* Mobile Header Toggle - Only show if requested */}
            {showMobileHeader && (
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
            )}

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
                    <div className="mb-6 px-4 flex items-center gap-3">
                        <div className="overflow-hidden">
                            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-0.5">Welcome</h2>
                            <p className="text-sm font-black text-[#1e2a4a] truncate dark:text-white uppercase">{adminName}</p>
                        </div>
                        {/* Close Button Mobile - Keep it separate or handle if needed */}
                        <button onClick={() => setIsMobileOpen(false)} className="md:hidden ml-auto text-gray-400 hover:text-red-500 text-lg">
                            ✕
                        </button>
                    </div>

                    {(userRole && userRole !== 'SCRUTINY_ADMIN') && (
                        <>
                            <SidebarItem to="/admin/members/new" icon={FaUserPlus} label="Add Member" active={activePage === 'register-member'} />
                            <SidebarItem to="/admin/institutions/new" icon={FaBuilding} label="Add Institution" active={activePage === 'register-institution'} />

                            <SidebarItem to={userRole === 'SUPER_ADMIN' ? '/super-admin/dashboard' : '/admin/dashboard'} icon={FaThLarge} label={roleLabel} active={activePage === 'dashboard'} />
                            {(userRole !== 'VILLAGE_ADMIN' && userRole !== 'WARD_ADMIN') && (
                                <SidebarItem to="/admin/management" icon={FaUserShield} label="Manage Admins" active={activePage === 'admin-management'} />
                            )}
                            <SidebarItem to="/admin/members" icon={FaUsers} label="Member Management" active={activePage === 'members'} />
                            <SidebarItem to="/admin/institutions" icon={FaBuilding} label="Institution Management" active={activePage === 'institutions'} />

                            <SidebarItem to="/admin/funding" icon={FaHandHoldingUsd} label="Funding Requests" active={activePage === 'funding'} />

                            <SidebarItem to="/admin/activity-log" icon={FaChartLine} label="Activity Logs" active={activePage === 'activity'} />
                            <SidebarItem to="/admin/settings" icon={FaCog} label={settingsLabel} active={activePage === 'settings'} />
                            <SidebarItem to="/admin/help" icon={FaQuestionCircle} label="Help & Support" active={activePage === 'help'} />
                        </>
                    )}

                    {(userRole === 'MEMBER_ADMIN' || userRole === 'SUPER_ADMIN' || userRole === 'STATE_ADMIN' || userRole === 'DISTRICT_ADMIN' || userRole === 'MANDAL_ADMIN' || userRole === 'VILLAGE_ADMIN' || userRole === 'MUNICIPALITY_ADMIN' || userRole === 'WARD_ADMIN' || userRole === 'SCRUTINY_ADMIN') && (
                        <>
                            <SidebarItem to="/admin/notifications" icon={FaBell} label="Notifications" active={activePage === 'notifications'} />
                        </>
                    )}

                    {userRole === 'SCRUTINY_ADMIN' && (
                        <div className="hidden">
                            <SidebarItem to="/admin/authorization" icon={FaShieldAlt} label="Authorization" active={activePage === 'authorization'} />
                        </div>
                    )}

                    {(userRole === 'SUPER_ADMIN' || userRole === 'STATE_ADMIN' || userRole === 'DISTRICT_ADMIN' || userRole === 'MANDAL_ADMIN' || userRole === 'VILLAGE_ADMIN' || userRole === 'MUNICIPALITY_ADMIN' || userRole === 'WARD_ADMIN') && (
                        <>
                            <SidebarItem to="/admin/announcements" icon={FaBullhorn} label="Announcements" active={activePage === 'announcements'} />
                        </>
                    )}

                    {userRole === 'SUPER_ADMIN' && (
                        <>
                            <SidebarItem to="/admin/carousel" icon={FaImages} label="Carousel Manager" active={activePage === 'carousel'} />
                        </>
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

            {/* Spacer for Mobile Header - Only if shown */}
            {showMobileHeader && (
                <div className="md:hidden h-16 w-full flex-shrink-0" />
            )}
        </>
    );
};

export default AdminSidebar;
