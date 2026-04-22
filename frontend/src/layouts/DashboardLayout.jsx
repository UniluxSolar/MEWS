import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import axios, { BASE_URL } from '../api';
import {
    FaThLarge, FaFileAlt, FaUserCheck, FaBriefcase, FaHeart, FaNotesMedical,
    FaBalanceScale, FaHandHoldingUsd, FaHeadset, FaQuestionCircle, FaBars,
    FaSearch, FaBell, FaUserCircle, FaChevronDown, FaSignOutAlt
} from 'react-icons/fa';
import CarouselModal from '../components/common/CarouselModal';
import LiveUpdatesTicker from '../components/LiveUpdatesTicker';
import AdminHeader from '../components/AdminHeader';

const SidebarItem = ({ to, icon: Icon, label, active, collapsed, badge }) => (
    <Link
        to={to}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-1
        ${active ? 'bg-white/10 text-white font-bold border-l-4 border-secondary' : 'text-gray-400 hover:bg-white/5 hover:text-gray-100'}
        ${collapsed ? 'justify-center' : ''}`}
    >
        <div className="relative">
            <Icon size={18} className={active ? 'text-secondary' : ''} />
            {collapsed && badge > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-2 h-2 bg-red-500 rounded-full border border-primary"></span>
            )}
        </div>
        {!collapsed && (
            <>
                <span className="flex-1">{label}</span>
                {badge > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {badge > 9 ? '9+' : badge}
                    </span>
                )}
            </>
        )}
        {active && !collapsed && !badge && <span className="ml-auto w-2 h-2 bg-secondary rounded-full"></span>}
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

                // Keep sessionStorage in sync correctly for all login types
                const adminInfo = JSON.parse(sessionStorage.getItem('adminInfo'));
                const memberInfo = JSON.parse(sessionStorage.getItem('memberInfo'));
                const savedUser = JSON.parse(sessionStorage.getItem('savedUser'));

                const syncInfo = (info) => {
                    let changed = false;
                    if (info && data.photoUrl && info.photoUrl !== data.photoUrl) {
                        info.photoUrl = data.photoUrl;
                        changed = true;
                    }
                    // Add Name sync
                    if (info && data.name && info.name !== data.name) {
                        info.name = data.name;
                        changed = true;
                    }
                    return changed ? info : null;
                };

                const updatedAdmin = syncInfo(adminInfo);
                if (updatedAdmin) {
                    sessionStorage.setItem('adminInfo', JSON.stringify(updatedAdmin));
                    window.dispatchEvent(new Event('login-success'));
                }

                const updatedMember = syncInfo(memberInfo);
                if (updatedMember) {
                    sessionStorage.setItem('memberInfo', JSON.stringify(updatedMember));
                    window.dispatchEvent(new Event('login-success'));
                }

                const updatedSaved = syncInfo(savedUser);
                if (updatedSaved) {
                    sessionStorage.setItem('savedUser', JSON.stringify(updatedSaved));
                    window.dispatchEvent(new Event('login-success'));
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
                const notifications = Array.isArray(data) ? data : [];
                const unread = notifications.filter(n => !n.isRead).length;
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
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            sessionStorage.removeItem('adminInfo');
            sessionStorage.removeItem('memberInfo');
            sessionStorage.removeItem('savedUser');
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
            else if (segment === 'helpdesk') breadcrumbs.push({ label: 'Tickets & Feedback', path: '/dashboard/helpdesk' });
            else if (segment === 'support') breadcrumbs.push({ label: 'Help & Support', path: '/dashboard/support' });
            else if (segment === 'profile') {
                breadcrumbs.push({ label: 'My Profile', path: '/dashboard/profile' });
                if (location.search.includes('view=notifications')) {
                    breadcrumbs.push({ label: 'Notifications', path: '' });
                }
            }
        }

        return breadcrumbs;
    };

    const breadcrumbs = getBreadcrumbs();

    const getImageUrl = (url) => {
        if (!url) return "/assets/images/user-profile.png";
        if (url.startsWith('data:') || url.startsWith('blob:')) return url;

        // Ensure we handle Windows backslashes
        const normalizedUrl = url.replace(/\\/g, '/');
        
        const baseUrl = BASE_URL;

        // Use Proxy for GCS/Remote URLs to ensure they load (CORS/Private)
        if (normalizedUrl.startsWith('http')) {
            return `${baseUrl}/api/proxy-image?url=${encodeURIComponent(normalizedUrl)}`;
        }

        // If relative path from backend (e.g., 'uploads/...')
        const cleanUrl = normalizedUrl.startsWith('/') ? normalizedUrl : `/${normalizedUrl}`;
        return `${baseUrl}${cleanUrl}`;
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50 overflow-hidden font-sans">
            <AdminHeader onToggleSidebar={toggleSidebar} />
            <div className="flex flex-1 overflow-hidden relative">
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
                    <SidebarItem to="/dashboard/profile?view=notifications" icon={FaBell} label="Notifications" active={isActive('profile') && location.search.includes('notifications')} collapsed={!isMobile && collapsed} badge={notificationCount} />
                    <SidebarItem to="/dashboard/helpdesk" icon={FaHeadset} label="Tickets & Feedback" active={isActive('helpdesk')} collapsed={!isMobile && collapsed} />

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
                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 relative">
                    {/* Dynamic Breadcrumbs - Moved here from header */}
                    <div className="flex items-center text-sm text-gray-500 mb-6 bg-white p-3 rounded-lg border border-gray-100 shadow-sm animate-fadeIn">
                        {breadcrumbs.map((crumb, index) => {
                            const isLast = index === breadcrumbs.length - 1;
                            return (
                                <React.Fragment key={index}>
                                    {index > 0 && <span className="mx-2 text-gray-300">/</span>}
                                    {isLast || !crumb.path ? (
                                        <span className={`${isLast ? 'text-primary font-bold' : 'text-gray-500 font-semibold'}`}>
                                            {crumb.label}
                                        </span>
                                    ) : (
                                        <Link to={crumb.path} className="text-gray-500 hover:text-primary font-semibold transition-colors">
                                            {crumb.label}
                                        </Link>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                    <Outlet />
                </main>

            </div>
        </div>
    </div>
    );
};

export default DashboardLayout;
