import React, { useState, useEffect, useRef } from 'react';
import { FaShieldAlt, FaSearch, FaExclamationTriangle, FaBell, FaChevronDown, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api';

import mewsLogo from '../assets/mews_main_logo_new.png';

const AdminHeader = (props) => { // props now contains locationName
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Force HMR Update
    const [adminName, setAdminName] = useState('Admin');
    const [roleText, setRoleText] = useState('Administrator');
    const [locationName, setLocationName] = useState('');
    const [profileLogo, setProfileLogo] = useState('https://randomuser.me/api/portraits/men/32.jpg');

    useEffect(() => {
        const info = localStorage.getItem('adminInfo');
        if (info) {
            const parsed = JSON.parse(info);
            setAdminName(parsed.name || parsed.username || 'Admin');

            let r = parsed.role || '';
            if (r === 'STATE_ADMIN') {
                setRoleText('State Admin Portal');
                setProfileLogo(mewsLogo);
            }
            else if (r === 'DISTRICT_ADMIN') {
                setRoleText('District Admin Portal');
                setProfileLogo(mewsLogo);
            }
            else if (r === 'MANDAL_ADMIN') {
                setRoleText('Mandal Admin Portal');
                setProfileLogo(mewsLogo);
            }
            else if (r === 'MUNICIPALITY_ADMIN') {
                setRoleText('Municipality Admin Portal');
                setProfileLogo(mewsLogo);
            }
            else if (r === 'VILLAGE_ADMIN') {
                setRoleText('Village Admin Portal');
                setProfileLogo(mewsLogo);
            }
            else {
                setProfileLogo(mewsLogo); // Fallback to district/general logo
            }

            const locName = parsed.locationName || '';
            setLocationName(locName);

            // If locationName is missing but we have a token, fetch it
            if (!locName && parsed.token) {
                API.get('/admin/settings').then(res => {
                    const { villageName, mandal, district, stateName, municipalityName } = res.data;
                    let fetchedName = '';
                    if (parsed.role === 'STATE_ADMIN') fetchedName = stateName;
                    else if (parsed.role === 'DISTRICT_ADMIN') fetchedName = district;
                    else if (parsed.role === 'MANDAL_ADMIN') fetchedName = mandal;
                    else if (parsed.role === 'MUNICIPALITY_ADMIN') fetchedName = municipalityName;
                    else if (parsed.role === 'VILLAGE_ADMIN') fetchedName = villageName;

                    if (fetchedName) {
                        setLocationName(fetchedName);
                        // Update localStorage to avoid re-fetching
                        const newInfo = { ...parsed, locationName: fetchedName };
                        localStorage.setItem('adminInfo', JSON.stringify(newInfo));
                    }
                }).catch(err => console.error("Failed to fetch location info", err));
            }
        }
    }, []);

    const displayLocation = props.locationName || locationName;

    const handleLogout = () => {
        localStorage.removeItem('adminInfo');
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
        <header className="bg-[#0f172a] text-white h-16 flex items-center justify-between px-6 sticky top-0 z-50 shadow-md flex-shrink-0">
            <div className="flex items-center gap-12">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/20 overflow-hidden">
                        <img src={profileLogo} alt="MEWS Logo" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <div className="font-bold text-lg leading-none tracking-tight">MEWS</div>
                        <div className="text-xs font-bold text-blue-200 leading-none mt-1">
                            {adminName}
                        </div>
                        <div className="text-[10px] text-gray-400 leading-none mt-0.5 uppercase tracking-wider">
                            {roleText}
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
                                {roleText.replace(' Admin Portal', '')}
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

                {/* Search Bar */}
                <div className="relative hidden lg:block w-96">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full bg-white border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-400 shadow-sm"
                    />
                </div>
            </div>

            <div className="flex items-center gap-6">
                <Link to="/admin/notifications" className="relative cursor-pointer hover:bg-white/10 p-2 rounded-full transition">
                    <FaBell size={18} className="text-gray-300" />
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0f172a]"></span>
                </Link>

                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <div
                        className="flex items-center gap-2 pl-4 border-l border-slate-700 cursor-pointer hover:opacity-80 transition"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        <img src={profileLogo} alt="Admin" className="w-9 h-9 rounded-full border-2 border-slate-600 bg-white object-cover" />
                        <FaChevronDown size={10} className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </div>

                    {isDropdownOpen && (
                        <div className="absolute right-0 top-12 w-48 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-right">
                            <div className="px-4 py-3 border-b border-slate-50 bg-slate-50">
                                <p className="text-sm font-bold text-slate-800 truncate">{adminName}</p>
                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{roleText.replace(' Portal', '')}</p>
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
    );
};


export default AdminHeader;
