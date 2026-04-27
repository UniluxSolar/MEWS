import React from 'react';
import ConnectNavbar from '../components/ConnectNavbar';
import ConnectFooter from '../components/ConnectFooter';
import { FaGraduationCap, FaHeartbeat, FaBalanceScale, FaBriefcase, FaHandHoldingHeart, FaBullseye, FaEye } from 'react-icons/fa';
import { motion } from 'framer-motion';

const AboutUs = () => {
    const features = [
        { label: "Education", icon: FaGraduationCap, color: "text-blue-600", bg: "bg-blue-100", desc: "Providing scholarships and educational support to underprivileged students." },
        { label: "Healthcare", icon: FaHeartbeat, color: "text-red-600", bg: "bg-red-100", desc: "Emergency medical assistance and community health initiatives." },
        { label: "Legal Aid", icon: FaBalanceScale, color: "text-purple-600", bg: "bg-purple-100", desc: "Free legal counseling and support for community members." },
        { label: "Employment", icon: FaBriefcase, color: "text-amber-600", bg: "bg-amber-100", desc: "Job placement assistance and skill development programs." },
        { label: "Welfare", icon: FaHandHoldingHeart, color: "text-green-600", bg: "bg-green-100", desc: "Social welfare programs for widow support and elderly care." },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <ConnectNavbar />

            <main className="pt-20">
                {/* Hero Section */}
                <section className="bg-[#1e2a4a] text-white py-16 md:py-24 lg:py-32 px-4 relative overflow-hidden">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -ml-32 -mb-32"></div>
                    
                    <div className="max-w-7xl mx-auto text-center relative z-10">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-3xl sm:text-4xl md:text-6xl font-bold mb-6 tracking-tight"
                        >
                            About <span className="text-blue-400">MEWS</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-lg md:text-xl text-blue-100/90 max-w-3xl mx-auto font-light leading-relaxed px-4"
                        >
                            Empowering the Mala community through technology-driven collective action and social support.
                        </motion.p>
                    </div>
                </section>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-16 pb-20">
                    <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 p-6 sm:p-10 md:p-16">
                        {/* Who We Are Section */}
                        <section className="mb-16 md:mb-24">
                            <div className="flex flex-col md:flex-row gap-12 items-start">
                                <div className="flex-1">
                                    <motion.div 
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                    >
                                        <h2 className="text-2xl md:text-3xl font-bold text-[#1e2a4a] mb-6 flex items-center gap-3">
                                            <span className="w-12 h-1.5 bg-blue-600 rounded-full"></span>
                                            Who We Are
                                        </h2>
                                        <p className="text-base md:text-lg text-gray-600 leading-relaxed space-y-4">
                                            Mala Educational Welfare Society (MEWS) is a community-led initiative dedicated to the upliftment of the Mala community. 
                                            We leverage technology to create a transparent, efficient, and accessible platform where community members can seek 
                                            help, donate, and grow together. 
                                        </p>
                                        <p className="mt-4 text-base md:text-lg text-gray-600 leading-relaxed">
                                            Our platform serves as a lifeline, connecting donors directly with those in need through a verified and secure process. 
                                            Every action we take is driven by the collective strength of our community.
                                        </p>
                                    </motion.div>
                                </div>
                                <div className="flex-1 w-full md:w-auto h-full min-h-[300px] bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl flex items-center justify-center p-8 border border-blue-100">
                                    <div className="text-center">
                                        <div className="text-5xl font-black text-blue-600/20 mb-2">MEWS</div>
                                        <div className="text-sm font-medium text-blue-600/60 tracking-[0.2em] uppercase">Community Ecosystem</div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Mission & Vision */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20 md:mb-24">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                whileHover={{ y: -5 }}
                                className="bg-blue-50/50 p-8 sm:p-10 rounded-[2rem] border border-blue-100 transition-all duration-300"
                            >
                                <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl mb-8 shadow-lg shadow-blue-200">
                                    <FaBullseye />
                                </div>
                                <h3 className="text-2xl font-bold text-[#1e2a4a] mb-4">Our Mission</h3>
                                <p className="text-gray-600 leading-relaxed font-medium">
                                    To create a unified digital ecosystem that ensures zero-cost administration and direct impact for every donation 
                                    made towards the education, health, and welfare of the Mala community.
                                </p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                whileHover={{ y: -5 }}
                                className="bg-emerald-50/50 p-8 sm:p-10 rounded-[2rem] border border-emerald-100 transition-all duration-300"
                            >
                                <div className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center text-2xl mb-8 shadow-lg shadow-emerald-200">
                                    <FaEye />
                                </div>
                                <h3 className="text-2xl font-bold text-[#1e2a4a] mb-4">Our Vision</h3>
                                <p className="text-gray-600 leading-relaxed font-medium">
                                    A future where every member of the Mala community has equal access to opportunities, resources, 
                                    and a strong support network that fosters sustainable growth and dignity.
                                </p>
                            </motion.div>
                        </div>

                        {/* Core Five Lifelines */}
                        <section>
                            <div className="text-center mb-12">
                                <h2 className="text-2xl md:text-3xl font-bold text-[#1e2a4a] mb-4 uppercase tracking-widest">
                                    The Five Lifelines
                                </h2>
                                <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-4">
                                {features.map((f, i) => (
                                    <motion.div 
                                        key={i} 
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1 }}
                                        className="text-center group p-4 rounded-2xl hover:bg-gray-50 transition-colors"
                                    >
                                        <div className={`w-16 h-16 ${f.bg} ${f.color} rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6 group-hover:scale-110 transition-transform shadow-sm`}>
                                            <f.icon />
                                        </div>
                                        <h4 className="font-bold text-[#1e2a4a] mb-3 text-lg">{f.label}</h4>
                                        <p className="text-sm text-gray-500 leading-relaxed px-2">{f.desc}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            <ConnectFooter />
        </div>
    );
};

export default AboutUs;
