import React, { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
    FaCheckCircle, FaDownload, FaHeart, FaFacebookF, FaTwitter, FaWhatsapp, FaLinkedinIn,
    FaFileInvoiceDollar, FaLeaf, FaUserGraduate, FaHandHoldingHeart, FaArrowLeft
} from 'react-icons/fa';

const SocialButton = ({ icon: Icon, color, href }) => (
    <a href={href || "#"} className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110 ${color}`}>
        <Icon size={18} />
    </a>
);

const DonationSuccess = () => {
    const location = useLocation();
    const {
        amount = '5,100',
        transactionId = 'TXN20241215001234',
        date = '15 Dec 2024, 2:45 PM',
        purpose = 'Education Scholarships',
        paymentMethod = 'UPI'
    } = location.state || {};

    return (
        <div className="max-w-7xl mx-auto pb-12">

            {/* Back Nav */}
            <div className="py-6">
                <Link to="/dashboard/donations" className="flex items-center gap-2 text-gray-500 hover:text-primary transition font-bold text-sm bg-white w-fit px-4 py-2 rounded-lg shadow-sm border border-gray-100">
                    <FaArrowLeft size={12} /> Back to Donations
                </Link>
            </div>

            {/* Celebration Header */}
            <div className="text-center py-12">
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white mx-auto mb-6 shadow-lg animate-bounce-slow">
                    <FaCheckCircle size={48} />
                </div>
                <h1 className="text-4xl font-bold text-[#1e2a4a] mb-3">Donation Successful!</h1>
                <p className="text-gray-500 text-lg">Thank you for supporting our community. Your generosity makes a real difference.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Center Column: Details */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Summary Card */}
                    <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-800 mb-6 border-b border-gray-100 pb-2">Donation Summary</h2>

                        <div className="flex justify-between items-end mb-6">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Amount Donated</p>
                                <p className="text-3xl font-bold text-gray-900">₹{amount}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500 mb-1">Purpose</p>
                                <p className="font-bold text-gray-800">{purpose}</p>
                            </div>
                        </div>

                        <div className="space-y-4 text-sm text-gray-600 bg-gray-50 p-6 rounded-xl">
                            <div className="flex justify-between">
                                <span>Transaction ID</span>
                                <span className="font-mono font-medium text-gray-800">{transactionId}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Date & Time</span>
                                <span className="font-medium text-gray-800">{date}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Payment Method</span>
                                <span className="font-medium text-gray-800 uppercase">{paymentMethod}</span>
                            </div>
                        </div>
                    </div>

                    {/* Impact / Student Card (Conditional or Generic) */}
                    <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-800 mb-6">Student Supported</h2>
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden shrink-0 border-2 border-white shadow">
                                <img src="https://ui-avatars.com/api/?name=Ananya+Sharma&background=random" alt="Student" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">Ananya Sharma</h3>
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">Computer Science Engineering, 2nd Year</p>
                                <p className="text-sm text-gray-600 mt-2">
                                    "Your contribution helps cover textbooks and study materials for this semester."
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <button className="flex-1 bg-[#1e2a4a] text-white font-bold py-4 rounded-xl shadow-lg hover:bg-[#2a3b66] transition flex items-center justify-center gap-2">
                            <FaDownload /> Download 80G Receipt
                        </button>
                        <Link to="/dashboard/donate" className="flex-1 bg-white text-[#1e2a4a] border-2 border-[#1e2a4a] font-bold py-4 rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-2">
                            <FaHeart /> Donate Again
                        </Link>
                    </div>

                    {/* Share */}
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
                        <span className="font-bold text-gray-700">Share Your Good Deed</span>
                        <div className="flex gap-3">
                            <SocialButton icon={FaFacebookF} color="bg-blue-600" />
                            <SocialButton icon={FaTwitter} color="bg-sky-500" />
                            <SocialButton icon={FaWhatsapp} color="bg-green-500" />
                            <SocialButton icon={FaLinkedinIn} color="bg-blue-700" />
                        </div>
                    </div>

                </div>

                {/* Right Column: Information */}
                <div className="space-y-6">

                    {/* Tax Benefit Card */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                <FaFileInvoiceDollar />
                            </div>
                            <h3 className="font-bold text-gray-900">Tax Benefits</h3>
                        </div>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-2 text-xs text-gray-600">
                                <FaCheckCircle className="text-green-500 mt-0.5 shrink-0" />
                                <span>50% tax exemption under Section 80G</span>
                            </li>
                            <li className="flex items-start gap-2 text-xs text-gray-600">
                                <FaCheckCircle className="text-green-500 mt-0.5 shrink-0" />
                                <span>Tax saving: <strong className="text-gray-800">₹2,550</strong></span>
                            </li>
                            <li className="flex items-start gap-2 text-xs text-gray-600">
                                <FaCheckCircle className="text-green-500 mt-0.5 shrink-0" />
                                <span>Receipt ready for download</span>
                            </li>
                        </ul>
                    </div>

                    {/* Impact Stats */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4">Your Impact</h3>
                        <p className="text-sm text-gray-600 mb-4">Your <strong>₹{amount}</strong> donation will support:</p>
                        <ul className="space-y-3 text-xs text-gray-600">
                            <li className="flex gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5"></span>
                                2 students' textbooks for one semester
                            </li>
                            <li className="flex gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5"></span>
                                Laboratory equipment access for 10 students
                            </li>
                            <li className="flex gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5"></span>
                                Digital learning resources for 5 students
                            </li>
                        </ul>
                    </div>

                    {/* Community Impact */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm text-center">
                        <h3 className="font-bold text-gray-900 mb-4">Community Impact</h3>

                        <div className="mb-6">
                            <div className="text-2xl font-bold text-[#1e2a4a]">₹45,05,100</div>
                            <div className="text-xs text-gray-500">Total raised this month</div>
                        </div>

                        <div className="flex justify-center gap-8">
                            <div>
                                <div className="text-xl font-bold text-[#1e2a4a]">351</div>
                                <div className="text-xs text-gray-500">Students supported</div>
                            </div>
                            <div>
                                <div className="text-xl font-bold text-[#1e2a4a]">121</div>
                                <div className="text-xs text-gray-500">Active sponsors</div>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default DonationSuccess;
