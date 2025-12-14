import React from 'react';
import { Link } from 'react-router-dom';
import { FaUserCircle, FaBell } from 'react-icons/fa';
import { HiMenu } from 'react-icons/hi';

const ConnectNavbar = () => {
    return (
        <nav className="bg-[#1e2a4a] border-b border-gray-700 text-white">
            <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                {/* Logo Area */}
                <div className="flex items-center gap-8">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="bg-white text-[#1e2a4a] p-1.5 rounded-md">
                            <FaUserCircle size={20} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-bold leading-none tracking-tight">MEWS CONNECT</span>
                            <span className="text-[10px] text-gray-400 uppercase tracking-widest">A Community Initiative</span>
                        </div>
                    </Link>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center gap-4 text-sm font-medium">
                        <Link to="/" className="text-gray-300 hover:text-white transition">Home</Link>

                        <div className="flex items-center gap-2 ml-4">
                            <Link to="/login" className="px-3 py-1.5 border border-white rounded font-bold hover:bg-white hover:text-[#1e2a4a] transition text-white">
                                Member Login
                            </Link>
                            <Link to="/register" className="px-3 py-1.5 bg-[#f59e0b] text-white rounded font-bold hover:bg-amber-600 transition shadow-sm">
                                Institution Login
                            </Link>
                            <Link to="/admin/login" className="px-3 py-1.5 bg-gray-700 text-white rounded font-bold hover:bg-gray-600 transition shadow-sm">
                                Admin Login
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center text-xs text-gray-400 gap-3 border-r border-gray-600 pr-4 hidden sm:flex">
                        <span>A+</span>
                        <span>|</span>
                        <span>TE / EN</span>
                        <span>|</span>
                        <span>English</span>
                    </div>
                    <button className="px-4 py-1.5 bg-[#e85d04] hover:bg-[#d05304] text-white text-xs font-bold rounded flex items-center gap-2 transition uppercase tracking-wider">
                        <FaBell /> Emergency
                    </button>
                    <button className="md:hidden text-white p-2">
                        <HiMenu size={24} />
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default ConnectNavbar;
