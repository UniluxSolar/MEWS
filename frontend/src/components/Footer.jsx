import React from 'react';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaUserCircle } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="bg-slate-900 text-white pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <div className="bg-white text-slate-900 p-1.5 rounded-md">
                                <FaUserCircle size={24} />
                            </div>
                            <span className="text-2xl font-bold tracking-tight">MEWS</span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6">
                            Empowering communities through education, healthcare, and opportunity.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-6">Quick Links</h4>
                        <ul className="space-y-3 text-sm text-gray-300">
                            <li><a href="#" className="hover:text-white hover:underline transition">About MEWS</a></li>
                            <li><a href="#" className="hover:text-white hover:underline transition">Contact Us</a></li>
                            <li><a href="#" className="hover:text-white hover:underline transition">Careers</a></li>
                            <li><a href="#" className="hover:text-white hover:underline transition">Media & Press</a></li>
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-6">Services</h4>
                        <ul className="space-y-3 text-sm text-gray-300">
                            <li><a href="#" className="hover:text-white hover:underline transition">Education</a></li>
                            <li><a href="#" className="hover:text-white hover:underline transition">Health</a></li>
                            <li><a href="#" className="hover:text-white hover:underline transition">Legal</a></li>
                            <li><a href="#" className="hover:text-white hover:underline transition">Jobs</a></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-6">Contact Us</h4>
                        <ul className="space-y-4 text-sm text-gray-300">
                            <li className="flex items-start gap-3">
                                <FaPhoneAlt className="mt-1 text-primary" />
                                <div>
                                    <div className="font-bold text-white">Helpline</div>
                                    <div>1800-XXX-XXXX</div>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <FaEnvelope className="mt-1 text-primary" />
                                <div>
                                    <div className="font-bold text-white">Email</div>
                                    <div>support@mews.org</div>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <FaMapMarkerAlt className="mt-1 text-primary" />
                                <div>
                                    <div className="font-bold text-white">Office</div>
                                    <div>Hyderabad, Telangana</div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex gap-4">
                        <a href="#" className="text-gray-400 hover:text-white transition"><FaFacebook size={20} /></a>
                        <a href="#" className="text-gray-400 hover:text-white transition"><FaTwitter size={20} /></a>
                        <a href="#" className="text-gray-400 hover:text-white transition"><FaInstagram size={20} /></a>
                        <a href="#" className="text-gray-400 hover:text-white transition"><FaYoutube size={20} /></a>
                    </div>
                    <div className="text-gray-500 text-xs">
                        &copy; {new Date().getFullYear()} MEWS. All rights reserved.
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
