import React from 'react';
import { FaBullhorn, FaHeart } from 'react-icons/fa';

const LiveUpdatesTicker = () => {
    const adminInfo = localStorage.getItem('adminInfo') ? JSON.parse(localStorage.getItem('adminInfo')) : null;
    const locationName = adminInfo?.locationName || 'MEWS';
    const role = adminInfo?.role || 'ADMIN';

    // Helper to get location type display
    const getLocType = () => {
        if (role === 'STATE_ADMIN') return 'Districts';
        if (role === 'DISTRICT_ADMIN') return 'Mandals';
        if (role === 'MANDAL_ADMIN') return 'Villages';
        if (role === 'MUNICIPALITY_ADMIN') return 'Wards';
        return 'Village';
    };

    const updates = [
        { text: `Welcome to ${locationName} Admin Portal. System operational.`, icon: <FaHeart className="text-red-400" /> },
        { text: `95% Registration completed in ${locationName} ${getLocType()}`, isRegistration: true },
        { text: `New member verified from ${locationName} sector`, icon: <FaHeart className="text-blue-400" /> },
        { text: `100% registrations completed (Active ${getLocType()})`, isRegistration: true },
        { text: `${locationName} Support Fund received a new donation`, icon: <FaHeart className="text-green-400" /> },
        { text: `System-wide update: New verification standard applied to ${getLocType()}`, isRegistration: true },
        { text: `New CSR Campaign for ${locationName} verified`, icon: <FaHeart className="text-purple-400" /> },
        { text: `Registration phase 2 starting soon in ${locationName}`, isRegistration: true }
    ];

    return (
        <div className="bg-[#1e2a4a] text-white py-2 overflow-hidden relative flex items-center shadow-md border-b border-[#2c3e66]">
            <div className="bg-[#f59e0b] px-4 py-1 font-bold text-xs uppercase tracking-wider text-[#1e2a4a] ml-2 z-10 rounded-sm flex items-center gap-2 shrink-0 shadow-sm">
                <FaBullhorn /> Live Updates
            </div>

            <div className="flex overflow-hidden w-full mask-gradient">
                <div className="animate-marquee whitespace-nowrap flex items-center gap-12 px-4 text-sm font-medium">
                    {/* First Loop */}
                    {updates.map((update, index) => (
                        <span key={index} className="flex items-center gap-2.5">
                            {update.isRegistration ? (
                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]"></span>
                            ) : (
                                update.icon
                            )}
                            <span className={update.isRegistration ? "text-green-50 font-semibold" : "text-gray-100"}>
                                {update.text}
                            </span>
                        </span>
                    ))}

                    {/* Duplicate Loop for Seamless Scrolling */}
                    {updates.map((update, index) => (
                        <span key={`dup-${index}`} className="flex items-center gap-2.5">
                            {update.isRegistration ? (
                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]"></span>
                            ) : (
                                update.icon
                            )}
                            <span className={update.isRegistration ? "text-green-50 font-semibold" : "text-gray-100"}>
                                {update.text}
                            </span>
                        </span>
                    ))}
                </div>
            </div>

            <style>{`
                .animate-marquee {
                    animation: marquee 20s linear infinite;
                }
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .mask-gradient {
                    mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
                    -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
                }
            `}</style>
        </div>
    );
};

export default LiveUpdatesTicker;
