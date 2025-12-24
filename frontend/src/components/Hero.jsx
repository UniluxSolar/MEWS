import React from 'react';
import HeroBg from '../assets/community-hero.jpg';

const Hero = () => {
    return (
        <div className="relative h-[600px] flex items-center justify-center text-center mt-20">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img
                    src={HeroBg}
                    alt="Community Gathering"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50"></div>
            </div>

            <div className="relative z-10 max-w-4xl px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-6 drop-shadow-lg">
                    One Community. One Future.
                </h1>
                <p className="text-lg sm:text-xl text-gray-100 mb-10 max-w-2xl mx-auto drop-shadow-md">
                    Empowering Muslim minorities through education, healthcare, and opportunity, building a stronger, more inclusive society for all.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button className="px-8 py-4 bg-secondary text-white font-bold rounded-sm hover:bg-amber-600 transition shadow-lg text-lg">
                        Find Support
                    </button>
                    <button className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-sm hover:bg-white/10 transition shadow-lg text-lg">
                        Our Impact
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Hero;
