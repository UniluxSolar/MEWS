import React from 'react';
import { FaBullhorn, FaHeart } from 'react-icons/fa';

const LiveUpdatesTicker = () => {
    const updates = [
        { text: "Anonymous gave ₹500 to Ravi's surgery", icon: <FaHeart className="text-red-400" /> },
        { text: "Village % of highest registrations", isRegistration: true },
        { text: "Priya M. donated ₹200 for flood relief", icon: <FaHeart className="text-blue-400" /> },
        { text: "100% registrations completed (20 Villages)", isRegistration: true },
        { text: "Ram Singh donated ₹1000 to Education Fund", icon: <FaHeart className="text-green-400" /> },
        { text: "100% registrations completed (20 Mandals)", isRegistration: true },
        { text: "New Campaign \"Clean Water for School\" verified", icon: <FaHeart className="text-purple-400" /> },
        { text: "100% registrations completed (20 Districts)", isRegistration: true }
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
                    animation: marquee 40s linear infinite;
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
