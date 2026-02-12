import React, { useState } from 'react';
import ConnectNavbar from '../components/ConnectNavbar';
import ConnectFooter from '../components/ConnectFooter';
import { FaQuestionCircle, FaKey, FaUserCheck, FaChevronDown, FaLifeRing } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const SupportPage = () => {
    const [activeIndex, setActiveIndex] = useState(null);

    const helpTopics = [
        {
            title: "Login Issues",
            icon: FaLifeRing,
            content: "Ensure you are using your registered Email or 10-digit Mobile Number. Verify that your keyboard caps lock is off before entering your password."
        },
        {
            title: "Password Reset Help",
            icon: FaKey,
            content: "Click on 'First Time Login / Forgot Password?' link on the login page. Enter your registered email to receive a secure reset code. Use the code within 15 minutes to set a new password."
        },
        {
            title: "Account Verification",
            icon: FaUserCheck,
            content: "Verification is handled by your designated Village or Institution Admin. Once they verify your submitted documents, your account will be fully activated for funding requests."
        },
        {
            title: "Email-Only OTP Clarification",
            icon: FaQuestionCircle,
            content: "For enhanced security, MEWS has migrated to an email-only OTP system. All login and reset codes are now sent exclusively to your registered email address."
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            <ConnectNavbar />

            <main className="pt-24 pb-20 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="inline-block p-3 bg-blue-50 text-blue-600 rounded-2xl mb-4">
                            <FaLifeRing size={32} />
                        </div>
                        <h1 className="text-4xl font-black text-[#1e2a4a] mb-4">Support Center</h1>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">How can we help you today?</p>
                    </div>

                    <div className="space-y-4">
                        {helpTopics.map((topic, index) => (
                            <div key={index} className="border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                <button
                                    onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                                    className="w-full flex items-center justify-between p-6 bg-white text-left transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gray-50 text-[#1e2a4a] rounded-xl flex items-center justify-center">
                                            <topic.icon />
                                        </div>
                                        <span className="font-bold text-[#1e2a4a]">{topic.title}</span>
                                    </div>
                                    <motion.div
                                        animate={{ rotate: activeIndex === index ? 180 : 0 }}
                                        className="text-gray-400"
                                    >
                                        <FaChevronDown />
                                    </motion.div>
                                </button>

                                <AnimatePresence>
                                    {activeIndex === index && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="bg-gray-50 border-t border-gray-100"
                                        >
                                            <div className="p-6 text-sm text-gray-600 leading-relaxed font-bold">
                                                {topic.content}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>

                    {/* Contact CTA */}
                    <div className="mt-16 bg-[#1e2a4a] rounded-[2.5rem] p-10 text-center text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <h2 className="text-2xl font-bold mb-4">Still need assistance?</h2>
                            <p className="text-blue-100 mb-8 max-w-md mx-auto">Our support team is available to help you with any technical or account-related issues.</p>
                            <a
                                href="/contact"
                                className="inline-block bg-white text-[#1e2a4a] px-10 py-4 rounded-2xl font-black transition-transform hover:scale-105 shadow-xl shadow-blue-900/30"
                            >
                                Contact Support
                            </a>
                        </div>
                        {/* Decorative background element */}
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
                    </div>
                </div>
            </main>

            <ConnectFooter />
        </div>
    );
};

export default SupportPage;
