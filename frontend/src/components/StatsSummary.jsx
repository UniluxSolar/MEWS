import React from 'react';
import { FaGlobe, FaLayerGroup, FaClock, FaRupeeSign } from 'react-icons/fa';

const SummaryItem = ({ icon: Icon, value, label }) => (
    <div className="bg-white/10 border border-white/10 rounded-lg p-6 text-center backdrop-blur-sm">
        <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{value}</div>
        <div className="text-xs text-blue-200 uppercase tracking-widest">{label}</div>
    </div>
);

const StatsSummary = () => {
    return (
        <section className="bg-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex gap-8 flex-col lg:flex-row">
                    {/* Left: Welfare Card (Matching dashboard style roughly) */}
                    <div className="w-full lg:w-1/4 bg-white rounded-xl shadow-sm border-t-4 border-t-green-500 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center">
                                <FaLayerGroup size={18} />
                            </div>
                            <h3 className="font-bold text-[#1e2a4a] text-lg">Welfare</h3>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <div className="text-2xl font-bold text-[#1e2a4a]">67,890</div>
                                <div className="text-sm font-bold text-gray-700">Community Services</div>
                                <div className="text-xs text-gray-400 mt-1">Applications processed</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-[#1e2a4a]">234</div>
                                <div className="text-sm font-bold text-gray-700">Matrimonial Services</div>
                                <div className="text-xs text-gray-400 mt-1">Community development</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-[#1e2a4a]">45,678</div>
                                <div className="text-sm font-bold text-gray-700">Daily Beneficiaries</div>
                                <div className="text-xs text-gray-400 mt-1">Social program meals</div>
                            </div>
                        </div>
                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <button className="w-full py-2 text-xs font-bold uppercase tracking-wider rounded border border-green-500 text-green-600 hover:bg-gray-50 transition">
                                View All Welfare
                            </button>
                        </div>
                    </div>

                    {/* Right: Overall Summary Blue Box */}
                    <div className="w-full lg:w-3/4 bg-[#1e2a4a] rounded-xl p-8 sm:p-12 relative overflow-hidden shadow-xl text-white">
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-8">
                                <FaGlobe className="text-[#3b82f6]" size={24} />
                                <h2 className="text-xl font-bold">Overall Impact Summary</h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                                <SummaryItem value="34,567" label="Multi-service families" />
                                <SummaryItem value="89" label="Model Villages" />
                                <SummaryItem value="48hr" label="Average delivery time" />
                                <SummaryItem value="₹45+ Cr" label="Total community impact" />
                            </div>

                            <div className="bg-white/10 rounded-lg p-8 text-center border border-white/20">
                                <div className="text-4xl sm:text-5xl font-bold mb-2">184,200+</div>
                                <div className="text-lg font-semibold mb-2">Lives Positively Transformed</div>
                                <div className="text-sm text-blue-200">Through collective community action</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default StatsSummary;
