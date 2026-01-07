import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    FaThLarge, FaFileAlt, FaUserCheck, FaBriefcase, FaHeart, FaNotesMedical,
    FaBalanceScale, FaHandHoldingUsd, FaHeadset, FaQuestionCircle, FaBars,
    FaSearch, FaBell, FaUserCircle, FaChevronDown, FaSignOutAlt
} from 'react-icons/fa';

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
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('adminInfo');
        navigate('/login');
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
                breadcrumbs.push({ label: 'Funding Request', path: '/dashboard/applications' });
                if (pathSegments.includes('new')) breadcrumbs.push({ label: 'New Application', path: '' });
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
            else if (segment === 'helpdesk') breadcrumbs.push({ label: 'Helpdesk', path: '/dashboard/helpdesk' });
            else if (segment === 'support') breadcrumbs.push({ label: 'Help & Support', path: '/dashboard/support' });
            else if (segment === 'profile') breadcrumbs.push({ label: 'Profile Settings', path: '/dashboard/profile' });
        }

        return breadcrumbs;
    };

    const breadcrumbs = getBreadcrumbs();

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            {/* Sidebar */}
            <aside className={`bg-primary transition-all duration-300 flex flex-col ${collapsed ? 'w-20' : 'w-64'} h-full flex-shrink-0 relative shadow-xl z-20`}>
                <div className="h-16 flex items-center gap-3 px-6 border-b border-gray-700 bg-[#151f38]">
                    <div className="text-secondary p-1 rounded">
                        <FaUserCircle size={24} />
                    </div>
                    {!collapsed && <span className="text-xl font-bold text-white tracking-tight">MEWS</span>}
                </div>

                <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1 scrollbar-thin scrollbar-thumb-gray-600">
                    <SidebarItem to="/dashboard" icon={FaThLarge} label="Dashboard" active={location.pathname === '/dashboard'} collapsed={collapsed} />
                    <SidebarItem to="/dashboard/applications" icon={FaFileAlt} label="Funding Request" active={isActive('applications')} collapsed={collapsed} />
                    <SidebarItem to="/dashboard/donations" icon={FaHandHoldingUsd} label="My Donations" active={isActive('donations')} collapsed={collapsed} />
                    <SidebarItem to="/dashboard/services" icon={FaThLarge} label="MEWS Services" active={isActive('services')} collapsed={collapsed} />
                    <SidebarItem to="/dashboard/jobs" icon={FaBriefcase} label="Jobs & Events" active={isActive('jobs')} collapsed={collapsed} />
                    <SidebarItem to="/dashboard/helpdesk" icon={FaHeadset} label="Helpdesk" active={isActive('helpdesk')} collapsed={collapsed} />

                    <div className="my-4 border-t border-gray-700 mx-2"></div>
                    <SidebarItem to="/dashboard/support" icon={FaQuestionCircle} label="Help & Support" active={isActive('support')} collapsed={collapsed} />

                    <button
                        onClick={handleLogout}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-1 text-red-400 hover:bg-red-500/10 hover:text-red-300 ${collapsed ? 'justify-center' : ''}`}
                    >
                        <FaSignOutAlt size={18} />
                        {!collapsed && <span className="font-bold">Logout</span>}
                    </button>
                </div>

                <div className="p-4 text-xs text-gray-500 text-center border-t border-gray-700">
                    {!collapsed && <span>Version 2.1.4</span>}
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Top Header */}
                <header className="h-16 bg-primary border-b border-gray-700 shadow-sm flex items-center justify-between px-6 flex-shrink-0 z-10 text-white">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setCollapsed(!collapsed)} className="text-gray-400 hover:text-white transition">
                            <FaBars size={20} />
                        </button>

                        {/* Dynamic Breadcrumbs */}
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

                    <div className="flex-1 max-w-xl mx-8 hidden md:block">
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <FaSearch />
                            </span>
                            <input
                                type="text"
                                placeholder="Search applications, events, help topics..."
                                className="w-full bg-[#151f38] border border-gray-600 text-sm rounded-md py-2 pl-10 pr-4 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <Link to="/dashboard/notifications" className="relative text-gray-300 hover:text-white">
                            <FaBell size={18} />
                            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-primary">4</span>
                        </Link>
                        <Link to="/dashboard/profile" className="flex items-center gap-2 cursor-pointer border-l border-gray-600 pl-6 group">
                            <img
                                src={JSON.parse(localStorage.getItem('adminInfo'))?.photoUrl || "/assets/images/user-profile.png"}
                                alt="Profile"
                                className="w-8 h-8 rounded-full border border-gray-500 group-hover:border-white transition object-cover"
                            />
                            <FaChevronDown size={12} className="text-gray-400 group-hover:text-white transition" />
                        </Link>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6 bg-gray-50 relative">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
