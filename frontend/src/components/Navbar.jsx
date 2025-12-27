import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiMenu, HiX, HiChevronDown } from 'react-icons/hi';
import { FaUserCircle } from 'react-icons/fa';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="bg-white border-b border-gray-100 fixed w-full z-50 top-0 left-0 h-20 flex items-center">
            <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <div className="bg-secondary text-white p-2 rounded-lg">
                            <FaUserCircle size={20} />
                        </div>
                        <span className="text-2xl font-extrabold tracking-tighter text-primary">MEWS</span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden lg:flex space-x-8 text-sm font-semibold text-gray-600">
                        <Link to="/about" className="hover:text-primary transition">About</Link>
                        <Link to="/services" className="hover:text-primary transition">Services</Link>
                        <Link to="/partners" className="hover:text-primary transition">Partners</Link>
                        <Link to="/stories" className="hover:text-primary transition">Success Stories</Link>
                        <Link to="/donate" className="hover:text-primary transition">Donate</Link>
                    </div>

                    {/* Right Actions */}
                    <div className="hidden lg:flex items-center space-x-4">
                        <button className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900">
                            English <HiChevronDown className="ml-1" />
                        </button>
                        <Link to="/login" className="px-5 py-2.5 text-primary font-bold border-2 border-primary rounded-sm hover:bg-slate-50 transition text-sm">
                            Member Login
                        </Link>
                        <Link to="/register" className="px-5 py-2.5 bg-secondary text-white font-bold rounded-sm hover:bg-amber-600 transition text-sm shadow-sm">
                            Join Now
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="lg:hidden flex items-center">
                        <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700 hover:text-primary focus:outline-none p-2">
                            {isOpen ? <HiX className="h-6 w-6" /> : <HiMenu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="lg:hidden absolute top-20 left-0 w-full bg-white border-b border-gray-100 shadow-xl">
                    <div className="px-4 pt-2 pb-6 space-y-2">
                        <Link to="/about" className="block px-3 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md">About</Link>
                        <Link to="/services" className="block px-3 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md">Services</Link>
                        <Link to="/partners" className="block px-3 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md">Partners</Link>
                        <Link to="/stories" className="block px-3 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md">Success Stories</Link>
                        <Link to="/donate" className="block px-3 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md">Donate</Link>
                        <div className="border-t border-gray-100 pt-4 mt-2 space-y-3">
                            <Link to="/login" className="block w-full text-center px-4 py-3 text-secondary font-bold border border-secondary rounded-sm">
                                Member Login
                            </Link>
                            <Link to="/register" className="block w-full text-center px-4 py-3 bg-primary text-white font-bold rounded-sm">
                                Member Register
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
