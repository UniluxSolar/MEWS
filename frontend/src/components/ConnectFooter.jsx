import React from 'react';
import { Link } from 'react-router-dom';
import MewsLogo from '../assets/mews_main_logo_new.png';

const ConnectFooter = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-[#1e2a4a] text-white py-12 border-t border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
                    {/* Brand & Description */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-0.5 overflow-hidden">
                                <img src={MewsLogo} alt="MEWS" className="w-full h-full object-contain" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-bold leading-none tracking-tight">MEWS</span>
                                <span className="text-[10px] text-gray-400 uppercase tracking-widest leading-none mt-1">Mala Educational Welfare Society</span>
                            </div>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
                            Empowering the Mala community through education, healthcare, and collective support. Join us in building a stronger future together.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <h4 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4">Navigation</h4>
                            <ul className="space-y-2 text-sm text-gray-300">
                                <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                                <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                            </ul>
                        </div>
                        <div className="space-y-3">
                            <h4 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4">Support</h4>
                            <ul className="space-y-2 text-sm text-gray-300">
                                <li><Link to="/support" className="hover:text-white transition-colors">Support</Link></li>
                                <li><Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                                <li><Link to="/terms-and-conditions" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
                            </ul>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4">Contact</h4>
                        <div className="space-y-2">
                            <p className="text-sm text-gray-300">Official Email:</p>
                            <a href="mailto:info@mews.org.in" className="text-lg font-bold text-white hover:text-blue-400 transition-colors break-all">
                                info@mews.org.in
                            </a>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-gray-800 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-xs text-gray-500 font-medium">
                        &copy; {currentYear} MEWS. All Rights Reserved.
                    </div>
                    <div className="text-[10px] text-gray-600 uppercase tracking-widest">
                        A Community-Led Initiative
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default ConnectFooter;
