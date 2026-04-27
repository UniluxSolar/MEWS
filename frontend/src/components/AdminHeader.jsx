import React, { useState, useEffect, useRef } from 'react';
import { FaShieldAlt, FaSearch, FaExclamationTriangle, FaBell, FaChevronDown, FaUser, FaSignOutAlt, FaBars } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import API, { BASE_URL } from '../api';

import mewsLogo from '../assets/mews_main_logo_new.png';

import LiveUpdatesTicker from './LiveUpdatesTicker';

const AdminHeader = ({ locationName: propLocationName, onToggleSidebar }) => { // props now contains locationName and optional onToggleSidebar
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    
    // ... existing state ...
    const [adminName, setAdminName] = useState('Admin');
    const [roleText, setRoleText] = useState('Administrator');
    const [locationName, setLocationName] = useState('');
    const [centerSubtitle, setCenterSubtitle] = useState(''); // New state for center subtitle
    const [userName, setUserName] = useState('Admin'); // For dropdown name
    const [profileLogo, setProfileLogo] = useState('/assets/images/user-profile.png');
    const [showNotifications, setShowNotifications] = useState(false);
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        const loadInfo = () => {
            const adminData = JSON.parse(sessionStorage.getItem('adminInfo'));
            const memberData = JSON.parse(sessionStorage.getItem('memberInfo'));

            // Priority logic for identifying the context
            const info = adminData || memberData;
            if (!info) return;

            const role = (info.role || '').toUpperCase().replace(/-/g, '_');
            const email = (info.email || '').toLowerCase();
            const username = (info.username || '').toString();
            const mobile = (info.mobile || '').toString();

            // Definitive Role Identification
            const isMemberAdmin = (role === 'MEMBER_ADMIN');
            const isDistrictAdmin = (role === 'DISTRICT_ADMIN');
            const isMandalAdmin = (role === 'MANDAL_ADMIN');
            const isVillageAdmin = (role === 'VILLAGE_ADMIN');
            const isMunicipalityAdmin = (role === 'MUNICIPALITY_ADMIN');
            const isWardAdmin = (role === 'WARD_ADMIN');
            const isScrutiny = (role === 'SCRUTINY_ADMIN');
            const isState = (role === 'STATE_ADMIN');
            const isSuper = (role === 'SUPER_ADMIN' || ( (username === '8500626600' || mobile === '8500626600' || email === 'uniluxsolar@gmail.com') && !isMemberAdmin && !isDistrictAdmin && !isMandalAdmin && !isVillageAdmin && !isMunicipalityAdmin && !isWardAdmin && !isScrutiny )) && !isState;
            const isMember = (role === 'MEMBER' || isMemberAdmin || (!isSuper && !isState && !isMemberAdmin && memberData && !adminData));

            let finalTopLeftSub = '';
            let finalTopLeftLabel = '';
            let finalCenterTitle = '';
            let finalCenterSub = '';
            let finalDropdownName = info.name || 'Admin';

            const fullName = info.surname ? `${info.surname} ${info.name}` : (info.name || 'User');
            const locName = (info.location_name || info.mandal_name || '').toUpperCase();
            
            // 1. Role Identification & Content Mapping
            if (isSuper) {
                finalCenterTitle = 'ALL LOCATIONS';
                finalCenterSub = 'ADMINISTRATOR';
                finalTopLeftLabel = 'SUPER ADMIN PORTAL';
                finalTopLeftSub = '8500626600';
            } else if (isState) {
                finalCenterTitle = locName || 'TELANGANA';
                finalCenterSub = 'STATE';
                finalTopLeftLabel = 'STATE ADMIN PORTAL';
                finalTopLeftSub = mobile || username || 'Admin';
            } else if (isDistrictAdmin) {
                finalCenterTitle = locName;
                finalCenterSub = 'DISTRICT';
                finalTopLeftLabel = 'DISTRICT ADMIN PORTAL';
                finalTopLeftSub = mobile || username || 'Admin';
            } else if (isMandalAdmin) {
                finalCenterTitle = locName;
                finalCenterSub = 'MANDAL';
                finalTopLeftLabel = 'MANDAL ADMIN PORTAL';
                finalTopLeftSub = mobile || username || 'Admin';
            } else if (isMunicipalityAdmin) {
                finalCenterTitle = locName;
                finalCenterSub = 'MUNICIPALITY';
                finalTopLeftLabel = 'MUNICIPALITY ADMIN PORTAL';
                finalTopLeftSub = mobile || username || 'Admin';
            } else if (isVillageAdmin) {
                finalCenterTitle = locName;
                finalCenterSub = 'VILLAGE';
                finalTopLeftLabel = 'VILLAGE ADMIN PORTAL';
                finalTopLeftSub = mobile || username || 'Admin';
            } else if (isWardAdmin) {
                finalCenterTitle = locName;
                finalCenterSub = 'WARD';
                finalTopLeftLabel = 'WARD ADMIN PORTAL';
                finalTopLeftSub = mobile || username || 'Admin';
            } else if (isScrutiny) {
                finalCenterTitle = locName || 'INTERNAL OVERSIGHT';
                finalCenterSub = 'SCRUTINY';
                finalTopLeftLabel = 'SCRUTINY ADMIN PORTAL';
                finalTopLeftSub = mobile || username || 'Scrutiny';
            } else if (isMember || isMemberAdmin) {
                finalCenterTitle = fullName.toUpperCase();
                finalCenterSub = 'MEMBER';
                finalTopLeftLabel = 'MEMBER PORTAL';
                finalTopLeftSub = mobile || username || 'Member';
            } else {
                finalCenterTitle = locName || 'MEWS';
                finalCenterSub = role.replace('_ADMIN', '');
                finalTopLeftLabel = `${role.replace('_', ' ')} PORTAL`;
                finalTopLeftSub = mobile || username || 'Admin';
            }

            finalDropdownName = fullName;

            setAdminName(finalTopLeftSub);
            setRoleText(finalTopLeftLabel);
            setLocationName(finalCenterTitle);
            setCenterSubtitle(finalCenterSub);
            const isAnyAdmin = [
                'SUPER_ADMIN', 'STATE_ADMIN', 'DISTRICT_ADMIN', 'MANDAL_ADMIN', 
                'VILLAGE_ADMIN', 'MUNICIPALITY_ADMIN', 'WARD_ADMIN', 'SCRUTINY_ADMIN', 'MEMBER_ADMIN'
            ].includes(role);
            setShowNotifications(isAnyAdmin);
            setUserName(finalDropdownName);
            setUserRole(role);

            // Dynamic Profile Image Logic
            const photo = info.photoUrl || info.photo || info.photo_url;
            
            // Build full photo URL using robust logic (consistent with DashboardLayout)
            let finalMemberPhoto = '/assets/images/user-profile.png'; // Default fallback
            if (photo) {
                const normalizedPhoto = photo.replace(/\\/g, '/');
                if (normalizedPhoto.startsWith('http')) {
                    // Use proxy for remote/GCS URLs to handle CORS and auth
                    finalMemberPhoto = `${BASE_URL}/api/proxy-image?url=${encodeURIComponent(normalizedPhoto)}`;
                } else {
                    // Handle local uploads
                    const cleanPhoto = normalizedPhoto.startsWith('/') ? normalizedPhoto : `/${normalizedPhoto}`;
                    finalMemberPhoto = `${BASE_URL}${cleanPhoto}`;
                }
            }
            
            setProfileLogo(finalMemberPhoto);
        };

        loadInfo();
        window.addEventListener('storage', loadInfo);
        window.addEventListener('login-success', loadInfo); // Custom event for immediate update
        return () => {
            window.removeEventListener('storage', loadInfo);
            window.removeEventListener('login-success', loadInfo);
        };
    }, []);

    const displayLocation = propLocationName || locationName;

    const handleLogout = () => {
        sessionStorage.removeItem('adminInfo');
        sessionStorage.removeItem('memberInfo');
        sessionStorage.removeItem('savedUser');
        navigate('/'); // Redirect to home/login
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <>
            <header className="bg-[#0f172a] text-white h-16 flex items-center justify-between px-3 md:px-6 sticky top-0 z-50 shadow-md flex-shrink-0">
                <div className="flex items-center gap-2 md:gap-12">
                    <div className="flex items-center gap-2 md:gap-3">
                        {onToggleSidebar && (
                            <button
                                onClick={onToggleSidebar}
                                className="mr-2 p-2 hover:bg-white/10 rounded-lg text-gray-400 transition"
                            >
                                <FaBars size={20} />
                            </button>
                        )}
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/admin/dashboard')}>
                            <div className="w-10 h-10 rounded-full border-2 border-white/20 overflow-hidden flex-shrink-0 bg-white/10">
                                <img 
                                    src={profileLogo} 
                                    alt="Admin Profile" 
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "/assets/images/user-profile.png";
                                    }}
                                />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <div className={`font-bold leading-none tracking-tight truncate ${userName.length > 15 ? 'text-xs md:text-sm' : userName.length > 10 ? 'text-sm md:text-base' : 'text-base md:text-lg'}`}>
                                    {(roleText === 'MEMBER PORTAL' || roleText === 'MEMBER ADMIN PORTAL') ? userName : 'MEWS'}
                                </div>
                                <div className="text-[10px] md:text-xs font-bold text-blue-200 leading-none mt-1 truncate">
                                    {adminName}
                                </div>
                                <div className="text-[8px] md:text-[10px] text-gray-400 leading-none mt-0.5 uppercase tracking-wider truncate">
                                    {roleText}
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Location Name Display */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block text-center w-[500px] overflow-hidden mask-linear-gradient z-50">
                        {displayLocation && (
                            <div className="animate-marquee flex flex-col items-center whitespace-nowrap">
                                <h1 className="text-xl font-bold text-white tracking-wide uppercase shadow-sm leading-none">
                                    {displayLocation}
                                </h1>
                                <span className="text-[10px] text-blue-200 font-bold uppercase tracking-[0.2em] mt-1">
                                    {centerSubtitle}
                                </span>
                            </div>
                        )}
                    </div>

                    <style>{`
                        .mask-linear-gradient {
                            mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
                            -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
                        }
                        @keyframes marquee {
                            0% { transform: translateX(250px); } /* Start from right edge of 500px container */
                            100% { transform: translateX(-250px); } /* Move to left edge */
                        }
                        .animate-marquee {
                            animation: marquee 5s linear infinite;
                        }
                        /* Pause on hover */
                        .animate-marquee:hover {
                            animation-play-state: paused;
                        }
                    `}</style>

                    {/* Search Bar - Hidden for Scrutiny Admin */}
                    {userRole !== 'SCRUTINY_ADMIN' && (
                        <div className="relative hidden lg:block w-96">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full bg-white border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-400 shadow-sm"
                            />
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 md:gap-6">
                    {showNotifications && (
                        <Link to="/admin/notifications" className="relative cursor-pointer hover:bg-white/10 p-2 rounded-full transition">
                            <FaBell size={16} className="text-gray-300 md:size-18" />
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0f172a]"></span>
                        </Link>
                    )}

                    {/* Profile Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <div
                            className="flex items-center gap-2 pl-2 md:pl-4 border-l border-slate-700 cursor-pointer hover:opacity-80 transition"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            <img 
                                src={mewsLogo} 
                                alt="MEWS Logo" 
                                className="w-8 h-8 md:w-9 md:h-9 rounded-full border-2 border-slate-600 bg-white object-cover shadow-sm"
                            />
                            <FaChevronDown size={8} className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''} md:size-10`} />
                        </div>

                        {isDropdownOpen && (
                            <div className="absolute right-0 top-12 w-48 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-right">
                                <div className="px-4 py-3 border-b border-slate-50 bg-slate-50">
                                    <p className="text-sm font-bold text-slate-800 truncate">{userName}</p>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{centerSubtitle}</p>
                                </div>
                                <Link
                                    to="/admin/settings"
                                    className="w-full text-left px-4 py-3 text-sm font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-3 transition"
                                    onClick={() => setIsDropdownOpen(false)}
                                >
                                    <FaUser size={14} /> Profile Settings
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-3 transition border-t border-slate-50"
                                >
                                    <FaSignOutAlt size={14} /> Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>
            <LiveUpdatesTicker />
        </>
    );
};


export default AdminHeader;
