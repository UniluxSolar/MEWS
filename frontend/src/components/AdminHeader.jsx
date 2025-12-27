import React, { useState, useEffect } from 'react';
import { FaShieldAlt, FaSearch, FaExclamationTriangle, FaBell, FaChevronDown } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import mewsLogo from '../assets/mews_main_logo_new.png';

const AdminHeader = ({ title }) => { // title optional, can auto-derive
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
            if (r === 'VILLAGE_ADMIN') {
                setRoleText('Village Admin Portal');
                setProfileLogo(mewsLogo);
            }
            else if (r === 'MANDAL_ADMIN') {
                setRoleText('Mandal Admin Portal');
                setProfileLogo(mewsLogo);
            }
            else if (r === 'DISTRICT_ADMIN') {
                setRoleText('District Admin Portal');
                setProfileLogo(mewsLogo);
            }
            else {
                setProfileLogo(mewsLogo); // Fallback to district/general logo
            }

            setLocationName(parsed.locationName || '');
        }
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
                {/* Search Bar - Optional, can be kept generic */}
                <div className="relative hidden lg:block w-96">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm text-gray-200 focus:outline-none focus:border-blue-500 focus:bg-slate-800 transition-all placeholder-gray-500"
                    />
                </div>
            </div>

            <div className="flex items-center gap-6">
                <Link to="/admin/notifications" className="relative cursor-pointer hover:bg-white/10 p-2 rounded-full transition">
                    <FaBell size={18} className="text-gray-300" />
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0f172a]"></span>
                </Link>
                <div className="flex items-center gap-2 pl-4 border-l border-slate-700 cursor-pointer">
                    <img src={profileLogo} alt="Admin" className="w-9 h-9 rounded-full border-2 border-slate-600 bg-white" />
                    <FaChevronDown size={10} className="text-gray-400" />
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;
