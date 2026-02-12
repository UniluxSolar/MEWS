import React from 'react';
import ConnectNavbar from '../components/ConnectNavbar';
import ConnectFooter from '../components/ConnectFooter';
import { FaGraduationCap, FaHeartbeat, FaBalanceScale, FaBriefcase, FaHandHoldingHeart, FaUsers, FaBullseye, FaEye } from 'react-icons/fa';
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
        <div className="min-h-screen bg-white">
            <ConnectNavbar />

            <main className="pt-20 pb-16">
                {/* Hero Section */}
                <section className="bg-[#1e2a4a] text-white py-20 px-4">
                    <div className="max-w-7xl mx-auto text-center">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-6xl font-bold mb-6"
                        >
                            About MEWS
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-blue-100 max-w-3xl mx-auto font-light"
                        >
                            Empowering the Mala community through technology-driven collective action and social support.
                        </motion.p>
                    </div>
                </section>

                <div className="max-w-7xl mx-auto px-4 -mt-10">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
                        {/* Description */}
                        <section className="mb-20">
                            <h2 className="text-3xl font-bold text-[#1e2a4a] mb-6 flex items-center gap-3">
                                <span className="w-10 h-1.5 bg-blue-600 rounded-full"></span>
                                Who We Are
                            </h2>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                Mala Educational Welfare Society (MEWS) is a community-led initiative dedicated to the upliftment of the Mala community.
                                We leverage technology to create a transparent, efficient, and accessible platform where community members can seek
                                help, donate, and grow together. Our platform serves as a lifeline, connecting donors directly with those in need
                                through a verified and secure process.
                            </p>
                        </section>

                        {/* Mission & Vision */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="bg-blue-50 p-8 rounded-3xl border border-blue-100"
                            >
                                <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-lg">
                                    <FaBullseye />
                                </div>
                                <h3 className="text-2xl font-bold text-[#1e2a4a] mb-4">Our Mission</h3>
                                <p className="text-gray-600 leading-relaxed font-bold">
                                    To create a unified digital ecosystem that ensures zero-cost administration and direct impact for every donation
                                    made towards the education, health, and welfare of the Mala community.
                                </p>
                            </motion.div>

                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="bg-emerald-50 p-8 rounded-3xl border border-emerald-100"
                            >
                                <div className="w-16 h-16 bg-emerald-600 text-white rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-lg">
                                    <FaEye />
                                </div>
                                <h3 className="text-2xl font-bold text-[#1e2a4a] mb-4">Our Vision</h3>
                                <p className="text-gray-600 leading-relaxed font-bold">
                                    A future where every member of the Mala community has equal access to opportunities, resources,
                                    and a strong support network that fosters sustainable growth and dignity.
                                </p>
                            </motion.div>
                        </div>

                        {/* Core Five Lifelines */}
                        <section>
                            <h2 className="text-3xl font-bold text-[#1e2a4a] mb-12 text-center uppercase tracking-widest">
                                The Five Lifelines
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                                {features.map((f, i) => (
                                    <div key={i} className="text-center group">
                                        <div className={`w-16 h-16 ${f.bg} ${f.color} rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 group-hover:scale-110 transition-transform shadow-sm`}>
                                            <f.icon />
                                        </div>
                                        <h4 className="font-bold text-[#1e2a4a] mb-2">{f.label}</h4>
                                        <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                                    </div>
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
