import React from 'react';
import { FaUserCircle } from 'react-icons/fa';

const ConnectFooter = () => {
    return (
        <footer className="bg-[#1e2a4a] text-white py-12 border-t border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-2">
                    <div className="bg-white text-[#1e2a4a] p-1.5 rounded-md">
                        <FaUserCircle size={24} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-bold leading-none tracking-tight">MEWS CONNECT</span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-widest">Government of Telangana</span>
                    </div>
                </div>

                <div className="text-xs text-gray-400 text-center md:text-right">
                    <p>&copy; 2024 MEWS. All rights reserved.</p>
                    <p className="mt-1">A Government of Telangana Initiative | Developed with ❤️ for the Mala Community</p>
                </div>
            </div>
        </footer>
    );
};

export default ConnectFooter;
