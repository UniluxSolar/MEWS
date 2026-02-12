import React, { useState } from 'react';
import ConnectNavbar from '../components/ConnectNavbar';
import ConnectFooter from '../components/ConnectFooter';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaPaperPlane, FaWhatsapp } from 'react-icons/fa';
import { motion } from 'framer-motion';

const ContactUs = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            setSubmitted(true);
            setFormData({ name: '', email: '', message: '' });
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <ConnectNavbar />

            <main className="pt-24 pb-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <motion.h1
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-5xl font-black text-[#1e2a4a] mb-4"
                        >
                            Get in Touch
                        </motion.h1>
                        <p className="text-gray-500 font-medium">We're here to help and answer any questions you might have.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Contact Info Cards */}
                        <div className="lg:col-span-1 space-y-6">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5"
                            >
                                <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-2xl">
                                    <FaEnvelope />
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#1e2a4a]">Email Us</h3>
                                    <p className="text-sm text-gray-500 font-bold">info@mews.org.in</p>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5"
                            >
                                <div className="w-14 h-14 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center text-2xl">
                                    <FaWhatsapp />
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#1e2a4a]">WhatsApp</h3>
                                    <p className="text-sm text-gray-500 font-bold">+91-XXXXX-XXXXX</p>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-[#1e2a4a] p-8 rounded-3xl text-white shadow-xl shadow-blue-900/20"
                            >
                                <h3 className="text-xl font-bold mb-4">Official Registered Office</h3>
                                <p className="text-blue-100 text-sm leading-relaxed mb-6 font-bold">
                                    Mala Educational Welfare Society<br />
                                    Hyderabad, Telangana, India
                                </p>
                                <div className="flex items-center gap-2 text-blue-300 text-xs uppercase tracking-widest font-black">
                                    <FaMapMarkerAlt /> Registered NGO
                                </div>
                            </motion.div>
                        </div>

                        {/* Contact Form */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-xl p-8 md:p-12 border border-gray-100"
                        >
                            {submitted ? (
                                <div className="text-center py-12">
                                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
                                        <FaPaperPlane className="animate-bounce" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-[#1e2a4a] mb-2">Message Sent!</h3>
                                    <p className="text-gray-500">Thank you for reaching out. We'll get back to you shortly.</p>
                                    <button
                                        onClick={() => setSubmitted(false)}
                                        className="mt-8 text-blue-600 font-bold hover:underline"
                                    >
                                        Send another message
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-[#1e2a4a] uppercase tracking-widest ml-1">Full Name</label>
                                            <input
                                                required
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="John Doe"
                                                className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-100 focus:bg-white p-4 rounded-2xl outline-none transition-all font-bold"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-[#1e2a4a] uppercase tracking-widest ml-1">Email Address</label>
                                            <input
                                                required
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                placeholder="john@example.com"
                                                className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-100 focus:bg-white p-4 rounded-2xl outline-none transition-all font-bold"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-[#1e2a4a] uppercase tracking-widest ml-1">Your Message</label>
                                        <textarea
                                            required
                                            rows="4"
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            placeholder="How can we help you?"
                                            className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-100 focus:bg-white p-4 rounded-2xl outline-none transition-all font-bold resize-none"
                                        ></textarea>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-[#1e2a4a] hover:bg-[#2a3b66] text-white p-4 rounded-2xl font-bold transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50 flex items-center justify-center gap-3"
                                    >
                                        {isSubmitting ? 'Sending...' : (
                                            <>Send Message <FaPaperPlane size={16} /></>
                                        )}
                                    </button>
                                </form>
                            )}
                        </motion.div>
                    </div>
                </div>
            </main>

            <ConnectFooter />
        </div>
    );
};

export default ContactUs;
