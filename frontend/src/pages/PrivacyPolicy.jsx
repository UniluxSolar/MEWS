import React from 'react';
import ConnectNavbar from '../components/ConnectNavbar';
import ConnectFooter from '../components/ConnectFooter';
import { FaShieldAlt, FaLock, FaUserShield, FaExclamationTriangle } from 'react-icons/fa';
import { motion } from 'framer-motion';

const PrivacyPolicy = () => {
    const sections = [
        {
            title: "Data Collection",
            icon: FaUserShield,
            content: "We collect essential information required for community verification and support delivery, including your name, contact details (Email/Mobile), and relevant documents for verification by authorized admins."
        },
        {
            title: "Data Storage & Protection",
            icon: FaLock,
            content: "All user data is stored in secure, encrypted cloud environments. We implement industry-standard security measures to prevent unauthorized access, alteration, or disclosure of your personal information."
        },
        {
            title: "Email-Only OTP Clarification",
            icon: FaShieldAlt,
            content: "MEWS has transitioned to a more secure Email-Only authentication system. This ensures that OTPs and password reset codes are delivered through a verified, encrypted channel, significantly reducing the risk of unauthorized access."
        },
        {
            title: "Data Usage Practices",
            icon: FaExclamationTriangle,
            content: "Your data is used strictly for community welfare purposes. We do not sell, trade, or share your personal information with third-party advertisers. Access is restricted to authorized admins for verification and support purposes."
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <ConnectNavbar />

            <main className="pt-24 pb-20 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="bg-white rounded-[2.5rem] p-10 md:p-16 mb-12 shadow-sm border border-gray-100 text-center relative overflow-hidden">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6"
                        >
                            <FaShieldAlt />
                        </motion.div>
                        <h1 className="text-4xl font-black text-[#1e2a4a] mb-4">Privacy Policy</h1>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Effective Date: February 12, 2026</p>

                        {/* Decorative background element */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/30 rounded-full -mr-16 -mt-16"></div>
                    </div>

                    {/* Policy Content */}
                    <div className="space-y-8">
                        {sections.map((section, index) => (
                            <motion.section
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm"
                            >
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 bg-gray-50 text-[#1e2a4a] rounded-2xl flex items-center justify-center text-xl">
                                        <section.icon />
                                    </div>
                                    <h2 className="text-2xl font-bold text-[#1e2a4a]">{section.title}</h2>
                                </div>
                                <p className="text-gray-600 leading-relaxed font-medium">
                                    {section.content}
                                </p>
                            </motion.section>
                        ))}
                    </div>

                    <div className="mt-12 text-center text-gray-500 py-8">
                        <p className="text-sm font-bold">Mala Educational Welfare Society (MEWS)</p>
                        <p className="text-xs mt-1">If you have any questions regarding this policy, please contact us at info@mews.org.in</p>
                    </div>
                </div>
            </main>

            <ConnectFooter />
        </div>
    );
};

export default PrivacyPolicy;
