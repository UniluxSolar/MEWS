import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import axios from '../api';
import {
    FaThLarge, FaFileAlt, FaUserCheck, FaBriefcase, FaHeart, FaNotesMedical,
    FaBalanceScale, FaHandHoldingUsd, FaHeadset, FaQuestionCircle, FaBars,
    FaSearch, FaBell, FaUserCircle, FaChevronDown, FaSignOutAlt
} from 'react-icons/fa';
import CarouselModal from '../components/common/CarouselModal';

const SidebarItem = ({ to, icon: Icon, label, active, collapsed }) => (
    <Link
        to={to}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-1
        ${active ? 'bg-white/10 text-white font-bold border-l-4 border-secondary' : 'text-gray-400 hover:bg-white/5 hover:text-gray-100'}
        ${collapsed ? 'justify-center' : ''}`}
    >
        <Icon size={18} className={active ? 'text-secondary' : ''} />
        {!collapsed && <span>{label}</span>}
        {active && !collapsed && <span className="ml-auto w-2 h-2 bg-secondary rounded-full"></span>}
    </Link>
);

const DashboardLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false); // New state for mobile drawer
    const [notificationCount, setNotificationCount] = useState(0);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    // Check for mobile screen on mount and resize
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth >= 768) {
                setMobileOpen(false); // Reset mobile state when going to desktop
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Toggle logic
    const toggleSidebar = () => {
        if (isMobile) {
            setMobileOpen(!mobileOpen);
        } else {
            setCollapsed(!collapsed);
        }
    };

    // Close mobile sidebar on route change
    useEffect(() => {
        if (isMobile) setMobileOpen(false);
    }, [location.pathname, isMobile]);


    // Fetch User Info (Dynamic Photo)
    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const { data } = await axios.get('/auth/me');
                setUserInfo(data);

                // Keep localStorage in sync if needed
                const stored = JSON.parse(localStorage.getItem('adminInfo'));
                if (stored && data.photoUrl && stored.photoUrl !== data.photoUrl) {
                    stored.photoUrl = data.photoUrl;
                    localStorage.setItem('adminInfo', JSON.stringify(stored));
                }
            } catch (error) {
                console.warn('Failed to fetch user info', error);
            }
        };
        fetchUserInfo();
    }, [location.pathname]);

    // Fetch Notifications for Badge
    useEffect(() => {
        const fetchUnreadCount = async () => {
            try {
                const { data } = await axios.get('/notifications');
                const unread = data.filter(n => !n.isRead).length;
                setNotificationCount(unread);
            } catch (error) {
                console.warn('Failed to fetch notifications count', error);
            }
        };

        fetchUnreadCount();

        // Optional: Poll every 60 seconds or invoke on navigation if needed
        const interval = setInterval(fetchUnreadCount, 60000);
        return () => clearInterval(interval);
    }, [location.pathname]); // Re-fetch on navigation changes (e.g. coming back from read)

    const handleLogout = async () => {
        try {
            await axios.post('/auth/logout');
            localStorage.removeItem('adminInfo');
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
            localStorage.removeItem('adminInfo');
            navigate('/login');
        }
    };

    const isActive = (path) => location.pathname.includes(path);

    // Dynamic Breadcrumb Logic
    const getBreadcrumbs = () => {
        const pathSegments = location.pathname.split('/').filter(Boolean);
        // pathSegments[0] is always 'dashboard'

        const breadcrumbs = [];

        // Root Dashboard
        breadcrumbs.push({ label: 'Dashboard', path: '/dashboard' });

        if (pathSegments.length > 1) {
            const segment = pathSegments[1];

            if (segment === 'applications') {
                breadcrumbs.push({ label: 'My Fund Requests', path: '/dashboard/applications' });
                if (pathSegments.includes('new')) breadcrumbs.push({ label: 'Create A Fund Request', path: '' });
                else if (pathSegments.length > 2) breadcrumbs.push({ label: 'Application Details', path: '' });
            }

            else if (segment === 'services') breadcrumbs.push({ label: 'MEWS Services', path: '/dashboard/services' });
            else if (segment === 'jobs') {
                breadcrumbs.push({ label: 'Jobs & Events', path: '/dashboard/jobs' });
                if (pathSegments.length > 2) breadcrumbs.push({ label: 'Event Details', path: '' });
            }
            else if (segment === 'donate') {
                breadcrumbs.push({ label: 'My Donations', path: '/dashboard/donations' });
                breadcrumbs.push({ label: 'Donate / Sponsor', path: '/dashboard/donate' });
                if (pathSegments.includes('checkout')) breadcrumbs.push({ label: 'Checkout', path: '' });
                else if (pathSegments.includes('success')) breadcrumbs.push({ label: 'Donation Success', path: '' });
            }
            else if (segment === 'donations') breadcrumbs.push({ label: 'My Donations', path: '/dashboard/donations' });
            else if (segment === 'health') breadcrumbs.push({ label: 'Health Assistance', path: '/dashboard/health' });
            else if (segment === 'legal') breadcrumbs.push({ label: 'Legal Aid', path: '/dashboard/legal' });
            else if (segment === 'helpdesk') breadcrumbs.push({ label: 'Need Help?', path: '/dashboard/helpdesk' });
            else if (segment === 'support') breadcrumbs.push({ label: 'Help & Support', path: '/dashboard/support' });
            else if (segment === 'profile') breadcrumbs.push({ label: 'My Profile', path: '/dashboard/profile' });
        }

        return breadcrumbs;
    };

    const breadcrumbs = getBreadcrumbs();

    const getImageUrl = (url) => {
        if (!url) return "/assets/images/user-profile.png";
        if (url.startsWith('data:') || url.startsWith('blob:')) return url;

        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const baseUrl = apiUrl.replace(/\/api\/?$/, '');

        // Use Proxy for GCS/Remote URLs to ensure they load (CORS/Private)
        if (url.startsWith('http')) {
            return `${baseUrl}/api/proxy-image?url=${encodeURIComponent(url)}`;
        }

        // If relative path from backend (e.g., 'uploads/...')
        // We need to resolve it against the backend URL, not frontend.
        // Ensure url has leading slash if needed, or handle if baseUrl has trailing
        const cleanUrl = url.startsWith('/') ? url : `/${url}`;
        return `${baseUrl}${cleanUrl}`;
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            <CarouselModal storageKey="hasSeenDashboardCarousel" />
            {/* Mobile Overlay Backdrop */}
            {isMobile && mobileOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`bg-primary transition-all duration-300 flex flex-col h-full flex-shrink-0 shadow-xl z-40
                ${isMobile
                        ? `fixed inset-y-0 left-0 w-64 transform ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`
                        : `relative ${collapsed ? 'w-20' : 'w-64'}`
                    }`}
            >
                <div className="h-16 flex items-center gap-3 px-6 border-b border-gray-700 bg-[#151f38]">
                    <div className="text-secondary p-1 rounded">
                        <FaUserCircle size={24} />
                    </div>
                    {/* Show Text if on Mobile (always full width when open) OR Desktop Not Collapsed */}
                    {(isMobile || !collapsed) && <span className="text-xl font-bold text-white tracking-tight">MEWS</span>}
                </div>

                <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1 scrollbar-thin scrollbar-thumb-gray-600">
                    <SidebarItem to="/dashboard/profile" icon={FaUserCircle} label="My Profile" active={isActive('profile')} collapsed={!isMobile && collapsed} />
                    <SidebarItem to="/dashboard" icon={FaThLarge} label="Dashboard" active={location.pathname === '/dashboard'} collapsed={!isMobile && collapsed} />
                    <SidebarItem to="/dashboard/applications" icon={FaFileAlt} label="My Fund Requests" active={isActive('applications')} collapsed={!isMobile && collapsed} />
                    <SidebarItem to="/dashboard/donations" icon={FaHandHoldingUsd} label="My Donations" active={isActive('donations')} collapsed={!isMobile && collapsed} />
                    <SidebarItem to="/dashboard/services" icon={FaThLarge} label="MEWS Services" active={isActive('services')} collapsed={!isMobile && collapsed} />
                    <SidebarItem to="/dashboard/jobs" icon={FaBriefcase} label="Jobs & Events" active={isActive('jobs')} collapsed={!isMobile && collapsed} />
                    <SidebarItem to="/dashboard/helpdesk" icon={FaHeadset} label="Need Help?" active={isActive('helpdesk')} collapsed={!isMobile && collapsed} />

                    <div className="my-4 border-t border-gray-700 mx-2"></div>
                    <SidebarItem to="/dashboard/support" icon={FaQuestionCircle} label="Help & Support" active={isActive('support')} collapsed={!isMobile && collapsed} />

                    <button
                        onClick={handleLogout}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-1 text-red-400 hover:bg-red-500/10 hover:text-red-300 ${(!isMobile && collapsed) ? 'justify-center' : ''}`}
                    >
                        <FaSignOutAlt size={18} />
                        {/* Show Label if Mobile OR Desktop Not Collapsed */}
                        {(isMobile || !collapsed) && <span className="font-bold">Logout</span>}
                    </button>
                </div>

                <div className="p-4 text-xs text-gray-500 text-center border-t border-gray-700">
                    {(isMobile || !collapsed) && <span>Version 2.1.4</span>}
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
                {/* Top Header */}
                <header className="h-16 bg-primary border-b border-gray-700 shadow-sm flex items-center justify-between px-4 md:px-6 flex-shrink-0 z-10 text-white">
                    <div className="flex items-center gap-4">
                        <button onClick={toggleSidebar} className="text-gray-400 hover:text-white transition p-1">
                            <FaBars size={20} />
                        </button>

                        {/* Dynamic Breadcrumbs - Hide on small mobile, show on md+ */}
                        <div className="hidden md:flex items-center text-sm text-gray-300">
                            {breadcrumbs.map((crumb, index) => {
                                const isLast = index === breadcrumbs.length - 1;
                                return (
                                    <React.Fragment key={index}>
                                        {index > 0 && <span className="mx-2">›</span>}
                                        {isLast || !crumb.path ? (
                                            <span className={`${isLast ? 'text-secondary font-bold' : 'text-gray-300 font-semibold'}`}>
                                                {crumb.label}
                                            </span>
                                        ) : (
                                            <Link to={crumb.path} className="text-gray-300 hover:text-white font-semibold transition-colors hover:underline">
                                                {crumb.label}
                                            </Link>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex-1 max-w-xl mx-4 md:mx-8 hidden md:block">
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <FaSearch />
                            </span>
                            <input
                                type="text"
                                placeholder="Search applications..."
                                className="w-full bg-[#151f38] border border-gray-600 text-sm rounded-md py-2 pl-10 pr-4 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 md:gap-6">
                        <Link to="/dashboard/notifications" className="relative text-gray-300 hover:text-white">
                            <FaBell size={18} />
                            {notificationCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-primary">
                                    {notificationCount > 9 ? '9+' : notificationCount}
                                </span>
                            )}
                        </Link>

                        <div className="relative">
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="flex items-center gap-2 cursor-pointer border-l border-gray-600 pl-4 md:pl-6 group focus:outline-none"
                            >
                                <img
                                    src={getImageUrl(userInfo?.headPhotoUrl || userInfo?.photoUrl || JSON.parse(localStorage.getItem('adminInfo'))?.headPhotoUrl || JSON.parse(localStorage.getItem('adminInfo'))?.photoUrl)}
                                    alt="Profile"
                                    className="w-8 h-8 rounded-full border border-gray-500 group-hover:border-white transition object-cover"
                                />
                                <FaChevronDown size={12} className={`text-gray-400 group-hover:text-white transition ${userMenuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* User Dropdown Menu */}
                            {userMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50 animate-fadeIn border border-gray-100">
                                    <div className="px-4 py-3 border-b border-gray-100 mb-1">
                                        <p className="text-sm font-bold text-gray-800 truncate">{userInfo?.name || JSON.parse(localStorage.getItem('adminInfo'))?.name || 'User'}</p>
                                        <p className="text-xs text-gray-500 truncate">{userInfo?.email || 'Member'}</p>
                                    </div>
                                    <Link
                                        to="/dashboard/profile"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary font-medium"
                                        onClick={() => setUserMenuOpen(false)}
                                    >
                                        <FaUserCircle className="inline mr-2" /> My Profile
                                    </Link>
                                    <button
                                        onClick={() => {
                                            setUserMenuOpen(false);
                                            handleLogout();
                                        }}
                                        className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium"
                                    >
                                        <FaSignOutAlt className="inline mr-2" /> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 relative">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
