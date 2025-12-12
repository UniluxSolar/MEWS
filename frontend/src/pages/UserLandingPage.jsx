import React from 'react';
import ConnectNavbar from '../components/ConnectNavbar';
import ConnectHero from '../components/ConnectHero';
import ImpactDashboard from '../components/ImpactDashboard';
import StatsSummary from '../components/StatsSummary';
import Campaigns from '../components/Campaigns';
import ConnectFooter from '../components/ConnectFooter';
import {
    FaCloudUploadAlt, FaUsers, FaHandHoldingHeart, FaChartLine,
    FaCheckCircle, FaUniversity, FaEye, FaBalanceScale,
    FaBolt, FaGraduationCap, FaHome, FaStore,
    FaHeart, FaSearch, FaWhatsapp, FaMedkit, FaUserTie, FaArrowRight
} from 'react-icons/fa';

const CommunitySupportHub = () => {
    return (
        <div className="relative py-12 px-4 md:px-8 lg:px-16 space-y-16 font-sans text-gray-800 overflow-hidden">

            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-100/50 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 opacity-60"></div>
                <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-amber-50/50 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 opacity-60"></div>
            </div>

            {/* 1. How Community Funding Works */}
            <section className="text-center max-w-7xl mx-auto relative z-10">
                <div className="mb-16">
                    <span className="text-secondary font-bold uppercase tracking-wider text-xs mb-2 block">Our Process</span>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-[#1e2a4a]">How Community Funding Works</h2>
                    <div className="w-20 h-1.5 bg-secondary mx-auto mt-4 rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative px-4">
                    {/* Connecting Line */}
                    <div className="hidden md:block absolute top-[2.5rem] left-10 right-10 h-0.5 bg-gradient-to-r from-transparent via-gray-300 to-transparent -z-10"></div>

                    {[
                        { step: 1, title: 'Submit Request', desc: 'Upload documents, photos, verification details', icon: <FaCloudUploadAlt /> },
                        { step: 2, title: 'Community Review', desc: 'Village admin verifies, community votes', icon: <FaUsers /> },
                        { step: 3, title: 'Fundraise Together', desc: 'Share via WhatsApp, receive donations', icon: <FaHandHoldingHeart /> },
                        { step: 4, title: 'Track Progress', desc: 'Real-time updates, thank donors', icon: <FaChartLine /> }
                    ].map((item, idx) => (
                        <div key={idx} className="flex flex-col items-center group">
                            <div className="w-20 h-20 rounded-2xl bg-white text-[#1e2a4a] flex items-center justify-center text-3xl shadow-xl shadow-blue-900/5 border border-gray-100 mb-6 relative group-hover:-translate-y-2 transition-transform duration-300">
                                {item.icon}
                                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm">
                                    {item.step}
                                </div>
                            </div>
                            <h3 className="font-bold text-xl mb-3 text-gray-900">{item.title}</h3>
                            <p className="text-sm text-gray-500 max-w-[220px] leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* 2. Trust and Security Features */}
            <section className="max-w-7xl mx-auto">
                <div className="bg-gradient-to-br from-[#1e2a4a] to-[#2a3b66] rounded-[2.5rem] p-10 md:p-16 text-white shadow-2xl relative overflow-hidden">
                    {/* Pattern Overlay */}
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

                    <div className="relative z-10">
                        <div className="text-center mb-12">
                            <h2 className="text-2xl md:text-3xl font-bold mb-4">Trust and Security Features</h2>
                            <p className="text-blue-200 max-w-2xl mx-auto">We prioritize transparency and accountability in every step of the process.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            {[
                                { title: '100% Verified', desc: 'All campaigns verified by village admin', icon: <FaCheckCircle />, color: 'bg-green-500' },
                                { title: 'Direct Transfer', desc: 'Funds go directly to beneficiary\'s bank', icon: <FaUniversity />, color: 'bg-blue-500' },
                                { title: 'Full Transparency', desc: 'Every donation tracked, receipts provided', icon: <FaEye />, color: 'bg-purple-500' },
                                { title: 'Community Oversight', desc: 'Village admin monitors all campaigns', icon: <FaBalanceScale />, color: 'bg-orange-500' }
                            ].map((item, idx) => (
                                <div key={idx} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/20 transition duration-300 text-center group">
                                    <div className={`w-12 h-12 mx-auto rounded-xl ${item.color} flex items-center justify-center text-xl text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                                        {item.icon}
                                    </div>
                                    <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                                    <p className="text-sm text-blue-100 leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Community Impact Metrics */}
            <section className="text-center max-w-6xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12">
                    {[
                        { value: '₹15.6 Lakh', label: 'Total raised this month', icon: <FaChartLine />, color: 'text-blue-600', bg: 'bg-blue-50' },
                        { value: '2,847', label: 'Active donors', icon: <FaUsers />, color: 'text-green-600', bg: 'bg-green-50' },
                        { value: '89%', label: 'Success Rate', icon: <FaCheckCircle />, color: 'text-purple-600', bg: 'bg-purple-50' },
                        { value: '24 Hours', label: 'Response Time', icon: <FaBolt />, color: 'text-orange-600', bg: 'bg-orange-50' }
                    ].map((item, idx) => (
                        <div key={idx} className="flex flex-col items-center p-6 rounded-2xl bg-white shadow-lg shadow-gray-100 hover:shadow-xl transition-shadow border border-gray-50">
                            <div className={`w-14 h-14 rounded-full ${item.bg} ${item.color} flex items-center justify-center text-2xl mb-4`}>
                                {item.icon}
                            </div>
                            <div className={`text-2xl md:text-4xl font-extrabold ${item.color} mb-2 tracking-tight`}>{item.value}</div>
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{item.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 4. Donation Ticker */}
            <section className="max-w-5xl mx-auto">
                <div className="bg-white border border-gray-100 rounded-full py-2 pl-4 pr-2 shadow-lg shadow-blue-900/5 flex items-center gap-4">
                    <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-extrabold tracking-wide uppercase shrink-0">Live Updates</span>
                    <div className="flex-1 overflow-hidden relative h-6">
                        <div className="animate-marquee absolute whitespace-nowrap flex gap-12 text-sm font-medium text-gray-600 items-center h-full">
                            <span className="flex items-center gap-2"><FaHeart className="text-red-500 text-xs" /> Anonymous gave ₹500 to Ravi's surgery</span>
                            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div></span>
                            <span className="flex items-center gap-2"><FaHeart className="text-blue-500 text-xs" /> Priya M. donated ₹200 for flood relief</span>
                            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div></span>
                            <span className="flex items-center gap-2"><FaHeart className="text-green-500 text-xs" /> Ram Singh donated ₹1000 to Education Fund</span>
                            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div></span>
                            <span className="flex items-center gap-2"><FaHeart className="text-purple-500 text-xs" /> New Campaign "Clean Water for School" verified</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. Success Stories Highlights */}
            <section className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-2xl font-bold text-[#1e2a4a]">Making a Real Difference</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                        { count: '127', desc: 'Medical emergencies', sub: 'funded successfully', icon: <FaMedkit />, color: 'text-red-500', bg: 'bg-red-50' },
                        { count: '89', desc: 'Students supported', sub: 'through scholarships', icon: <FaGraduationCap />, color: 'text-blue-500', bg: 'bg-blue-50' },
                        { count: '34', desc: 'Families rebuilt', sub: 'after local disasters', icon: <FaHome />, color: 'text-green-500', bg: 'bg-green-50' },
                        { count: '156', desc: 'Small businesses', sub: 'started with microloans', icon: <FaStore />, color: 'text-purple-500', bg: 'bg-purple-50' }
                    ].map((item, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 group">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`w-12 h-12 rounded-xl ${item.bg} ${item.color} flex items-center justify-center text-xl group-hover:scale-110 transition-transform`}>
                                    {item.icon}
                                </div>
                                <div className="text-3xl font-bold text-gray-800">{item.count}</div>
                            </div>
                            <h3 className="font-bold text-gray-900 leading-tight">{item.desc}</h3>
                            <p className="text-sm text-gray-500">{item.sub}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* 6. Action Panels (Glassmorphism) */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                <div className="relative overflow-hidden rounded-3xl p-8 md:p-12 border border-gray-200 shadow-xl bg-white group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-100 transition duration-700"></div>
                    <div className="relative z-10">
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wide mb-4">Need Assistance?</span>
                        <h3 className="text-3xl font-bold text-[#1e2a4a] mb-6">Start Your Fundraiser</h3>
                        <p className="text-gray-500 mb-8 max-w-sm">Facing a financial crisis or need support for a community project? We are here to help you get started.</p>
                        <div className="flex flex-col gap-3">
                            <button className="w-full py-4 bg-[#1e2a4a] text-white rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-[#2a3b66] transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                                <FaCloudUploadAlt size={18} /> Submit Request
                            </button>
                            <button className="w-full py-4 bg-white border-2 border-red-100 text-red-600 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-red-50 transition">
                                <FaBolt size={18} /> Emergency SOS
                            </button>
                        </div>
                    </div>
                </div>

                <div className="relative overflow-hidden rounded-3xl p-8 md:p-12 border border-gray-200 shadow-xl bg-white group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-green-100 transition duration-700"></div>
                    <div className="relative z-10">
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wide mb-4">Give Back</span>
                        <h3 className="text-3xl font-bold text-[#1e2a4a] mb-6">Support Your Community</h3>
                        <p className="text-gray-500 mb-8 max-w-sm">Every contribution counts. Help your neighbors and strengthen our community bond.</p>
                        <div className="grid grid-cols-2 gap-3">
                            <button className="col-span-2 py-4 bg-secondary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-amber-600 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                                <FaSearch /> Browse Campaigns
                            </button>
                            <button className="py-3 bg-blue-50 text-blue-700 rounded-xl font-bold text-sm hover:bg-blue-100 transition">
                                Monthly Giving
                            </button>
                            <button className="py-3 bg-green-50 text-green-700 rounded-xl font-bold text-sm hover:bg-green-100 transition">
                                <FaWhatsapp className="inline mr-1" /> Share
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* 7. Categories Pucks */}
            <section className="text-center max-w-5xl mx-auto">
                <div className="flex flex-wrap justify-center gap-3">
                    {['All Campaigns', 'Medical (45)', 'Education (23)', 'Disaster Relief (12)', 'Business (18)', 'Housing (8)', 'Other (15)'].map((cat, idx) => (
                        <button key={idx} className={`px-6 py-2.5 rounded-full text-sm font-bold border transition-all duration-300 ${idx === 0
                            ? 'bg-[#1e2a4a] text-white border-[#1e2a4a] shadow-lg scale-105'
                            : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-[#1e2a4a] hover:bg-gray-50'
                            }`}>
                            {cat}
                        </button>
                    ))}
                </div>
            </section>

            {/* 8. Champions & Wall */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-lg">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-[#1e2a4a]">Community Champions</h3>
                            <p className="text-sm text-gray-400">Top donors this month</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center"><FaUserTie /></div>
                    </div>

                    <div className="space-y-6">
                        {[
                            { rank: 1, name: 'Anonymous Donor', amount: '₹15,000', badge: 'Super Supporter', color: 'bg-amber-100 text-amber-800' },
                            { rank: 2, name: 'Village Women\'s Group', amount: '₹12,500', badge: 'Hero', color: 'bg-green-100 text-green-800' },
                            { rank: 3, name: 'Local Business Owner', amount: '₹10,000', badge: 'Regular', color: 'bg-blue-100 text-blue-800' },
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4 group cursor-default">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 ${idx === 0 ? 'bg-amber-500 border-amber-300 text-white' : 'bg-gray-100 border-transparent text-gray-500'}`}>
                                    {item.rank}
                                </div>
                                <div className="flex-1">
                                    <div className="font-bold text-gray-900">{item.name}</div>
                                    <div className="text-xs text-gray-400">Donated {item.amount}</div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${item.color}`}>{item.badge}</span>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-8 py-3 bg-gray-50 text-gray-500 rounded-xl text-sm font-bold hover:bg-gray-100 transition flex items-center justify-center gap-2 group">
                        View Full Leaderboard <FaArrowRight className="group-hover:translate-x-1 transition-transform" size={12} />
                    </button>
                </div>

                <div className="bg-[#1e2a4a] rounded-[2rem] p-8 text-white relative overflow-hidden shadow-lg">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-secondary/10 rounded-full blur-3xl"></div>

                    <h3 className="text-xl font-bold mb-8 relative z-10">Thank You Wall</h3>
                    <div className="space-y-6 relative z-10">
                        {[
                            { msg: "Thanks to everyone who helped with my surgery. I'm recovering well!", author: "Ravi Kumar", type: "Health" },
                            { msg: "My daughter can now continue her engineering studies. Grateful!", author: "Priya's Father", type: "Education" },
                            { msg: "50 families received relief supplies thanks to your donations.", author: "Relief Committee", type: "Disaster" }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/5 hover:bg-white/15 transition">
                                <p className="text-sm text-gray-200 italic mb-3">"{item.msg}"</p>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold text-secondary text-opacity-90">- {item.author}</span>
                                    <span className="px-2 py-0.5 rounded bg-white/10 text-gray-300">{item.type}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

const UserLandingPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/20 font-sans selection:bg-secondary selection:text-white">
            <ConnectNavbar />
            <main className="space-y-0">
                <ConnectHero />
                <ImpactDashboard />
                <StatsSummary />
                <Campaigns />
                <CommunitySupportHub />
            </main>
            <ConnectFooter />
        </div>
    );
};

export default UserLandingPage;
