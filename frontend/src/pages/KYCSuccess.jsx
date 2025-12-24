import React from 'react';
import { Link } from 'react-router-dom';
import {
    FaCheckCircle, FaLockOpen, FaGraduationCap, FaHeartbeat, FaBalanceScale,
    FaBriefcase, FaArrowRight, FaShieldAlt
} from 'react-icons/fa';

const ApplicationCard = ({ icon: Icon, title, desc, btnText, link, color }) => (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition group">
        <div className={`w-12 h-12 rounded-lg ${color} text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
            <Icon size={20} />
        </div>
        <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-xs text-gray-500 mb-4 h-10">{desc}</p>
        <Link
            to={link || "#"}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1e2a4a] text-white text-sm font-bold rounded-lg hover:bg-[#2a3b66] transition"
        >
            {btnText} <FaArrowRight size={10} />
        </Link>
    </div>
);

const KYCSuccess = () => {
    return (
        <div className="max-w-7xl mx-auto pb-12 space-y-8">

            {/* Header */}
            <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-[#1e2a4a]">KYC Verification Complete</h1>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-200 flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div> Approved
                </span>
            </div>

            {/* Hero / Success Banner */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-3xl p-12 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-green-100/50 rounded-full -mr-16 -mt-16 blur-3xl"></div>

                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white mb-6 shadow-xl animate-bounce-slow ring-8 ring-green-100">
                        <FaCheckCircle size={40} />
                    </div>
                    <h2 className="text-3xl font-bold text-green-900 mb-3">Verification Complete!</h2>
                    <p className="text-gray-600 max-w-md mx-auto mb-2 text-lg">Your KYC verification has been successfully approved.</p>
                    <p className="text-gray-500 text-sm">All member benefits are now unlocked and ready to use.</p>
                </div>
            </div>

            {/* Member Benefits Unlocked */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                        <FaLockOpen size={18} />
                    </div>
                    <h3 className="font-bold text-xl text-gray-800">Member Benefits Unlocked</h3>
                </div>

                <p className="text-gray-600 mb-6 text-sm">Congratulations! You now have full access to all MEWS member benefits and services.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                        <FaCheckCircle className="text-green-500" /> Scholarship Applications
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                        <FaCheckCircle className="text-green-500" /> Health Assistance
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                        <FaCheckCircle className="text-green-500" /> Legal Aid Services
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                        <FaCheckCircle className="text-green-500" /> Community Events
                    </div>
                </div>
            </div>

            {/* Applications Grid */}
            <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-800">Now You Can Apply</h3>
                <p className="text-gray-500 text-sm -mt-4 mb-6">Get started with these popular applications and services.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ApplicationCard
                        icon={FaGraduationCap}
                        color="bg-blue-500"
                        title="Scholarships"
                        desc="Apply for educational scholarships and financial aid programs."
                        btnText="Apply Now"
                        link="/dashboard/applications/new"
                    />
                    <ApplicationCard
                        icon={FaHeartbeat}
                        color="bg-red-500" // Red for health
                        title="Health Assistance"
                        desc="Access medical support and health care assistance programs."
                        btnText="Apply Now"
                        link="/dashboard/health"
                    />
                    <ApplicationCard
                        icon={FaBalanceScale}
                        color="bg-purple-500" // Purple for legal
                        title="Legal Aid"
                        desc="Get legal assistance and consultation services."
                        btnText="Get Support"
                        link="/dashboard/legal"
                    />
                    <ApplicationCard
                        icon={FaBriefcase}
                        color="bg-orange-500" // Orange for jobs
                        title="Job Opportunities"
                        desc="Explore employment opportunities and career development programs."
                        btnText="Browse Jobs"
                        link="/dashboard/jobs"
                    />
                </div>
            </div>

            {/* View All Button */}
            <div className="text-center pt-8">
                <Link to="/dashboard/applications" className="inline-flex items-center gap-2 bg-[#1e2a4a] text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-[#2a3b66] transition">
                    View All Applications
                </Link>
            </div>

        </div>
    );
};

export default KYCSuccess;
