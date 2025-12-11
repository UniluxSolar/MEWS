import React from 'react';
import { FaGooglePlay, FaApple, FaGraduationCap, FaHeartbeat, FaBalanceScale, FaBriefcase, FaHandHoldingHeart, FaCheckCircle, FaLock, FaUserShield } from 'react-icons/fa';

// Using a different placeholder background for variety or reuse existing if suitable.
// Ideally usage of specific 'hero-connect' image if available.
import ConnectHeroBg from '../assets/community-hero.jpg';

const ConnectHero = () => {
    return (
        <div className="relative bg-[#1e2a4a] overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-40">
                <img src={ConnectHeroBg} alt="Background" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-[#1e2a4a]/80 mix-blend-multiply"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
                <div className="max-w-3xl">
                    <div className="flex gap-4 mb-6 text-xs font-semibold uppercase tracking-wider text-green-400">
                        <span className="flex items-center gap-1"><FaCheckCircle /> Community Verified</span>
                        <span className="flex items-center gap-1"><FaLock /> Secure</span>
                        <span className="flex items-center gap-1"><FaUserShield /> Free to Use</span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
                        MEWS CONNECT
                    </h1>
                    <p className="text-xl sm:text-2xl text-gray-300 font-light mb-2">
                        Empowering the Mala Community
                    </p>
                    <p className="text-2xl sm:text-3xl text-white font-bold mb-8">
                        One Platform. Five Lifelines.
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-3 mb-10">
                        <span className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded text-sm text-white flex items-center gap-2 border border-white/20"><FaGraduationCap /> Education</span>
                        <span className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded text-sm text-white flex items-center gap-2 border border-white/20"><FaHeartbeat /> Health</span>
                        <span className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded text-sm text-white flex items-center gap-2 border border-white/20"><FaBalanceScale /> Legal Aid</span>
                        <span className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded text-sm text-white flex items-center gap-2 border border-white/20"><FaBriefcase /> Jobs</span>
                        <span className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded text-sm text-white flex items-center gap-2 border border-white/20"><FaHandHoldingHeart /> Welfare</span>
                    </div>

                    {/* Downloads */}
                    <div className="flex flex-wrap gap-4">
                        <button className="bg-white text-[#1e2a4a] px-5 py-2.5 rounded-md font-bold flex items-center gap-3 hover:bg-gray-100 transition">
                            <FaGooglePlay size={20} />
                            <div className="text-left leading-tight">
                                <div className="text-[10px] uppercase">Get it on</div>
                                <div className="text-sm">Google Play</div>
                            </div>
                        </button>
                        <button className="bg-white text-[#1e2a4a] px-5 py-2.5 rounded-md font-bold flex items-center gap-3 hover:bg-gray-100 transition">
                            <FaApple size={24} />
                            <div className="text-left leading-tight">
                                <div className="text-[10px] uppercase">Download on the</div>
                                <div className="text-sm">App Store</div>
                            </div>
                        </button>
                        <button className="bg-transparent border border-gray-400 text-white px-6 py-2.5 rounded-md font-semibold hover:bg-white/10 transition">
                            Explore Features
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConnectHero;
