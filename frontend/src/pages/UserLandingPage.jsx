import React from 'react';
import ConnectNavbar from '../components/ConnectNavbar';
import ConnectHero from '../components/ConnectHero';
import ImpactDashboard from '../components/ImpactDashboard';
import Campaigns from '../components/Campaigns';
import ConnectFooter from '../components/ConnectFooter';
import {
    FaCloudUploadAlt, FaUsers, FaHandHoldingHeart, FaChartLine,
    FaCheckCircle, FaUniversity, FaEye, FaBalanceScale,
    FaBolt, FaGraduationCap, FaHome, FaStore,
    FaHeart, FaSearch, FaWhatsapp, FaMedkit, FaUserTie, FaArrowRight, FaBriefcase
} from 'react-icons/fa';

import SrinivasImg from '../assets/srinivas.png';
import VenkatImg from '../assets/venkat.png';
import PadmaImg from '../assets/padma.png';
import AnushaImg from '../assets/anusha.png';
import Member1 from '../assets/member1.png';
import Member2 from '../assets/member2.png';
import Member3 from '../assets/member3.png';
import Member4 from '../assets/member4.png';

const CommunitySupportHub = () => {
    const institutionStats = [
        { label: "Education", value: "1,200+", icon: FaGraduationCap, color: "text-blue-600", bg: "bg-blue-100" },
        { label: "Health", value: "850+", icon: FaMedkit, color: "text-red-600", bg: "bg-red-100" },
        { label: "Legal Aid", value: "3,500+", icon: FaBalanceScale, color: "text-purple-600", bg: "bg-purple-100" },
        { label: "Employment", value: "500+", icon: FaBriefcase, color: "text-amber-600", bg: "bg-amber-100" },
        { label: "Welfare", value: "2,100+", icon: FaHandHoldingHeart, color: "text-green-600", bg: "bg-green-100" },
        { label: "Total Beneficiaries", value: "8,150+", icon: FaUsers, color: "text-indigo-600", bg: "bg-indigo-100" },
    ];

    const [championTab, setChampionTab] = React.useState('monthly');

    const championsData = {
        monthly: [
            { rank: 1, name: "Srinivas Rao", amount: "₹50,000", location: "Hyderabad", img: SrinivasImg },
            { rank: 2, name: "Latha K.", amount: "₹35,000", location: "Warangal", img: PadmaImg },
            { rank: 3, name: "Prasad G.", amount: "₹25,000", location: "Khammam", img: Member1 },
            { rank: 4, name: "Anusha R.", amount: "₹20,000", location: "Karimnagar", img: AnushaImg },
            { rank: 5, name: "Rajesh T.", amount: "₹15,000", location: "Nalgonda", img: Member2 },
        ],
        yearly: [
            { rank: 1, name: "Dr. K. Kumar", amount: "₹5,00,000", location: "Hyderabad", img: Member3 },
            { rank: 2, name: "Venkatesh K.", amount: "₹3,50,000", location: "Corporate", img: VenkatImg },
            { rank: 3, name: "Sunrise Hospitals", amount: "₹2,00,000", location: "Warangal", img: Member4 },
            { rank: 4, name: "Vijay M.", amount: "₹1,50,000", location: "Nizamabad", img: Member1 },
            { rank: 5, name: "Saritha P.", amount: "₹1,20,000", location: "Khammam", img: Member2 },
        ],
        overall: [
            { rank: 1, name: "Venkatesh K.", amount: "₹12,00,000", location: "USA", img: VenkatImg },
            { rank: 2, name: "Global Mala Assn", amount: "₹10,50,000", location: "International", img: Member1 },
            { rank: 3, name: "Ravi Teja", amount: "₹8,00,000", location: "Bangalore", img: SrinivasImg },
            { rank: 4, name: "Dr. Bhanu", amount: "₹6,50,000", location: "Hyderabad", img: PadmaImg },
            { rank: 5, name: "Suresh G.", amount: "₹5,00,000", location: "Mumbai", img: Member2 },
        ]
    };

    return (
        <div className="relative py-12 px-4 md:px-8 lg:px-16 space-y-16 font-sans text-gray-800 overflow-hidden">

            {/* Background Decorative Elements - Removed for cleaner look */}
            {/* <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">...</div> */}

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

            {/* 3. Community Impact Metrics (Static Dashboard) */}
            <section className="w-full bg-white border-b border-gray-100 py-10">
                <div className="max-w-7xl mx-auto px-4 mb-8 text-center">
                    <h2 className="text-3xl font-bold text-[#1e2a4a] uppercase tracking-widest">Our Impact Dashboard</h2>
                </div>

                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <div className="bg-white rounded-3xl shadow-xl p-8 relative z-20 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 border border-gray-100">
                        {institutionStats.map((stat, idx) => (
                            <div key={idx} className="text-center group p-4 rounded-2xl hover:bg-gray-50 transition duration-300">
                                <div className={`w-14 h-14 mx-auto ${stat.bg} ${stat.color} rounded-full flex items-center justify-center mb-3 text-2xl group-hover:scale-110 transition duration-300 shadow-sm`}>
                                    <stat.icon />
                                </div>
                                <h3 className="text-3xl font-extrabold text-gray-800 mb-1">{stat.value}</h3>
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">{stat.label}</p>
                                <p className="text-[10px] text-gray-400 font-semibold mt-1">Beneficiaries</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. Donation Ticker */}
            <section className="w-full">
                <div className="bg-white border-y border-gray-100 py-6 px-8 shadow-sm flex items-center gap-8">
                    <span className="bg-red-50 text-red-600 px-5 py-2 rounded-full text-base font-extrabold tracking-wide uppercase shrink-0 shadow-sm border border-red-100">Live Updates</span>
                    <div className="flex-1 overflow-hidden relative h-10">
                        <div className="animate-marquee-fast absolute whitespace-nowrap flex gap-16 text-xl font-medium text-gray-700 items-center h-full">
                            <span className="flex items-center gap-3"><FaHeart className="text-red-500 text-lg" /> Anonymous gave ₹500 to Ravi's surgery</span>
                            <span className="flex items-center gap-3"><div className="w-2 h-2 bg-gray-300 rounded-full"></div></span>
                            <span className="flex items-center gap-3"><FaHeart className="text-blue-500 text-lg" /> Priya M. donated ₹200 for flood relief</span>
                            <span className="flex items-center gap-3"><div className="w-2 h-2 bg-gray-300 rounded-full"></div></span>
                            <span className="flex items-center gap-3"><FaHeart className="text-green-500 text-lg" /> Ram Singh donated ₹1000 to Education Fund</span>
                            <span className="flex items-center gap-3"><div className="w-2 h-2 bg-gray-300 rounded-full"></div></span>
                            <span className="flex items-center gap-3"><FaHeart className="text-purple-500 text-lg" /> New Campaign "Clean Water for School" verified</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. Success Stories Highlights */}




            {/* Business Advertisement Scroller */}
            <section className="w-full bg-[#f8fafc] py-12 border-y border-gray-200 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-center">
                    <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold uppercase tracking-wide mb-2">Support Local</span>
                    <h2 className="text-2xl font-bold text-[#1e2a4a]">Community Market Place</h2>
                </div>

                <div className="relative w-full overflow-hidden group">
                    {/* Gradient Masks */}
                    <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#f8fafc] to-transparent z-10"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#f8fafc] to-transparent z-10"></div>

                    <div className="flex gap-6 animate-marquee hover:[animation-play-state:paused] w-max px-4">
                        {/* Render twice for infinite scroll effect */}
                        {[...Array(2)].map((_, i) => (
                            <React.Fragment key={i}>
                                {[
                                    { name: "Ravi General Stores", type: "Retail", offer: "10% Off for Students", color: "bg-blue-600" },
                                    { name: "Mala Tech Solutions", type: "Services", offer: "Websites & Branding", color: "bg-purple-600" },
                                    { name: "Jyothi Textiles", type: "Fashion", offer: "Saree & Dress Material", color: "bg-pink-600" },
                                    { name: "Ambedkar Constructions", type: "Real Estate", offer: "Affordable Housing", color: "bg-amber-600" },
                                    { name: "Community Dairy Farm", type: "Agriculture", offer: "Fresh Milk Daily", color: "bg-green-600" },
                                    { name: "New Era Coaching", type: "Education", offer: "Entrance Exam Prep", color: "bg-indigo-600" },
                                    { name: "Suresh Auto Works", type: "Automotive", offer: "Complete Car Care", color: "bg-red-600" }
                                ].map((biz, idx) => (
                                    <div key={`${i}-${idx}`} className="flex-shrink-0 w-72 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group/card cursor-pointer">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={`w-10 h-10 rounded-lg ${biz.color} text-white flex items-center justify-center font-bold text-lg`}>
                                                {biz.name.charAt(0)}
                                            </div>
                                            <span className="px-2 py-1 bg-gray-50 text-gray-500 text-[10px] font-bold uppercase tracking-wider rounded border border-gray-100">{biz.type}</span>
                                        </div>
                                        <h4 className="font-bold text-[#1e2a4a] text-lg mb-1 group-hover/card:text-blue-600 transition">{biz.name}</h4>
                                        <p className="text-sm text-gray-500">{biz.offer}</p>
                                    </div>
                                ))}
                            </React.Fragment>
                        ))}
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

            {/* 8. Donation Champions List */}
            <section className="max-w-6xl mx-auto py-12 px-4">
                <div className="text-center mb-10">
                    <span className="text-amber-600 font-bold uppercase tracking-wider text-sm mb-2 block">Gratitude Wall</span>
                    <h2 className="text-3xl font-extrabold text-[#1e2a4a]">Donation Champions</h2>
                    <div className="w-20 h-1.5 bg-amber-400 mx-auto mt-4 rounded-full"></div>
                </div>

                {/* Tabs */}
                <div className="flex justify-center mb-10">
                    <div className="bg-white p-1.5 rounded-full shadow-sm border border-gray-100 inline-flex">
                        {['monthly', 'yearly', 'overall'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setChampionTab(tab)}
                                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 capitalize ${championTab === tab
                                    ? 'bg-[#1e2a4a] text-white shadow-md'
                                    : 'text-gray-500 hover:text-[#1e2a4a] hover:bg-gray-50'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Champions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 justify-center">
                    {/* Top 3 highlighted bigger if needed, but simple grid for top 5 */}
                    {championsData[championTab].map((donor, idx) => (
                        <div key={idx} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group flex items-center gap-4 relative overflow-hidden">

                            {/* Rank Badge */}
                            <div className={`absolute top-0 right-0 w-16 h-16 flex items-center justify-center rounded-bl-3xl font-black text-xl text-white shadow-sm ${idx === 0 ? 'bg-amber-400' : idx === 1 ? 'bg-gray-300' : idx === 2 ? 'bg-amber-700' : 'bg-[#1e2a4a]/10 text-[#1e2a4a]'
                                }`}>
                                #{donor.rank}
                            </div>

                            <div className="w-16 h-16 rounded-full border-2 border-white shadow-md overflow-hidden shrink-0">
                                <img src={donor.img} alt={donor.name} className="w-full h-full object-cover" />
                            </div>

                            <div className="flex-1 pr-8">
                                <h3 className="font-bold text-lg text-gray-800 leading-tight mb-1">{donor.name}</h3>
                                <div className="text-sm font-bold text-[#1e2a4a] flex items-center gap-1 mb-1">
                                    <FaHandHoldingHeart className="text-amber-500" /> {donor.amount}
                                </div>
                                <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide">{donor.location}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-10">
                    <button className="text-blue-600 font-bold hover:text-blue-800 transition flex items-center justify-center gap-2 mx-auto group">
                        View All Donors <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </section>


        </div>
    );
};

const UserLandingPage = () => {
    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-secondary selection:text-white">
            <ConnectNavbar />
            <main className="space-y-0">
                <ConnectHero />
                <ImpactDashboard />
                <Campaigns />
                <CommunitySupportHub />
            </main>
            <ConnectFooter />
        </div>
    );
};

export default UserLandingPage;
