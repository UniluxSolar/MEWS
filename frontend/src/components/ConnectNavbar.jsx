import React from 'react';
import { Link } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import { HiMenu } from 'react-icons/hi';
import MewsLogo from '../assets/mews_main_logo_new.png';

const ConnectNavbar = () => {
    return (
        <nav className="bg-[#1e2a4a] border-b border-gray-700 text-white">
            <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                {/* Logo Area */}
                <div className="flex items-center gap-8">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-0.5 overflow-hidden">
                            <img src={MewsLogo} alt="MEWS" className="w-full h-full object-contain" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-bold leading-none tracking-tight">MEWS</span>
                            <span className="text-[10px] text-gray-400 uppercase tracking-widest">A Community Initiative</span>
                        </div>
                    </Link>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center gap-4 text-sm font-medium">
                        <div className="flex items-center gap-2 ml-4">
                            <Link to="/login" className="px-3 py-1.5 border border-white rounded font-bold hover:bg-white hover:text-[#1e2a4a] transition text-white">
                                Member Login
                            </Link>
                            <Link to="/admin/login" className="px-3 py-1.5 border border-white rounded font-bold hover:bg-white hover:text-[#1e2a4a] transition text-white">
                                Admin Login
                            </Link>
                            <Link to="/institution/login" className="px-3 py-1.5 border border-white rounded font-bold hover:bg-white hover:text-[#1e2a4a] transition text-white">
                                Institution Login
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-4">


                    <button className="md:hidden text-white p-2">
                        <HiMenu size={24} />
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default ConnectNavbar;
