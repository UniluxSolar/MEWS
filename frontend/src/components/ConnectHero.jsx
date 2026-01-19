import React from 'react';
import { FaGooglePlay, FaApple, FaGraduationCap, FaHeartbeat, FaBalanceScale, FaBriefcase, FaHandHoldingHeart, FaCheckCircle, FaLock, FaUserShield } from 'react-icons/fa';

// Using a different placeholder background for variety or reuse existing if suitable.
// Ideally usage of specific 'hero-connect' image if available.

import { useState, useEffect } from 'react';
import ConnectHeroBg from '../assets/community-hero.jpg';
import Member1 from '../assets/member1.png';
import Member2 from '../assets/member2.png';
import Member3 from '../assets/member3.png';
import Member4 from '../assets/member4.png';
import LandingScroll1 from '../assets/landing_scroll_1.png';
import LandingScroll2 from '../assets/landing_scroll_2.png';
import MewsLogo from '../assets/mews_main_logo_new.png';

const ConnectHero = () => {
    // Array of images for the slideshow
    const bgImages = [ConnectHeroBg, LandingScroll1, Member1, LandingScroll2, Member2, Member3, Member4];
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % bgImages.length);
        }, 3000); // Change image every 3 seconds

        return () => clearInterval(interval);
    }, [bgImages.length]);

    return (
        <div className="relative bg-[#1e2a4a] overflow-hidden min-h-[600px] flex items-center">
            {/* Fading Background Slideshow */}
            <div className="absolute inset-0 z-0">
                {bgImages.map((img, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                            }`}
                    >
                        <img src={img} alt="Bg" className="w-full h-full object-cover" />
                    </div>
                ))}

                <div className="absolute inset-0 bg-[#1e2a4a]/70 mix-blend-multiply"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-[#1e2a4a] via-[#1e2a4a]/70 to-transparent"></div>
            </div>

            {/* Custom CSS for Animations */}
            <style>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 20s linear infinite;
                }
            `}</style>

            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex justify-between items-center">
                <div className="max-w-3xl">
                    <div className="flex gap-4 mb-6 text-xs font-semibold uppercase tracking-wider text-green-400">
                        <span className="flex items-center gap-1"><FaCheckCircle /> Community Verified</span>
                        <span className="flex items-center gap-1"><FaLock /> Secure</span>
                        <span className="flex items-center gap-1"><FaUserShield /> Free to Use</span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight drop-shadow-md">
                        MEWS
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
                        <button className="bg-white text-[#1e2a4a] px-5 py-2.5 rounded-md font-bold flex items-center gap-3 hover:bg-gray-100 transition shadow-lg">
                            <FaGooglePlay size={20} />
                            <div className="text-left leading-tight">
                                <div className="text-[10px] uppercase">Get it on</div>
                                <div className="text-sm">Google Play</div>
                            </div>
                        </button>
                        <button className="bg-white text-[#1e2a4a] px-5 py-2.5 rounded-md font-bold flex items-center gap-3 hover:bg-gray-100 transition shadow-lg">
                            <FaApple size={24} />
                            <div className="text-left leading-tight">
                                <div className="text-[10px] uppercase">Download on the</div>
                                <div className="text-sm">App Store</div>
                            </div>
                        </button>

                    </div>
                </div>

                {/* Rotating Logo Section - Visible primarily on desktop */}
                <div className="hidden lg:flex justify-center items-center relative w-[400px] h-[400px]">
                    <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-3xl filter opacity-40 animate-pulse"></div>

                    {/* Spinning Logo with Rounded Corners to hide background */}
                    <img
                        src={MewsLogo}
                        alt="MEWS Logo"
                        className="absolute inset-0 w-[350px] h-[350px] object-cover m-auto z-10 drop-shadow-2xl animate-spin-slow rounded-full"
                    />
                </div>
            </div>
        </div >
    );
};

export default ConnectHero;
