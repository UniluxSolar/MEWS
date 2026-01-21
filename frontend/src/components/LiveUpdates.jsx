import React from 'react';
import { FaHeart } from 'react-icons/fa';

const LiveUpdates = () => {
    return (
        <section className="w-full bg-[#1e2a4a] border-t border-gray-700"> {/* Adjusted background to match navbar or be distinct */}
            <div className="bg-white border-y border-gray-100 py-3 px-8 shadow-sm flex items-center gap-8">
                <span className="bg-red-50 text-red-600 px-4 py-1.5 rounded-full text-sm font-extrabold tracking-wide uppercase shrink-0 shadow-sm border border-red-100">Live Updates</span>
                <div className="flex-1 overflow-hidden relative h-8">
                    <div className="animate-marquee-fast absolute whitespace-nowrap flex gap-16 text-lg font-medium text-gray-700 items-center h-full">
                        <span className="flex items-center gap-3"><FaHeart className="text-red-500 text-base" /> Anonymous gave ₹500 to Ravi's surgery</span>
                        <span className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div></span>
                        <span className="flex items-center gap-3"><FaHeart className="text-blue-500 text-base" /> Priya M. donated ₹200 for flood relief</span>
                        <span className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div></span>
                        <span className="flex items-center gap-3"><FaHeart className="text-green-500 text-base" /> Ram Singh donated ₹1000 to Education Fund</span>
                        <span className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div></span>
                        <span className="flex items-center gap-3"><FaHeart className="text-purple-500 text-base" /> New Campaign "Clean Water for School" verified</span>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LiveUpdates;
