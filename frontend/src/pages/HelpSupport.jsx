import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    FaSearch, FaGraduationCap, FaUserShield, FaCreditCard,
    FaDesktop, FaEnvelope, FaPhoneAlt, FaCommentDots, FaChevronDown, FaChevronUp, FaArrowLeft
} from 'react-icons/fa';

const SupportCategory = ({ icon: Icon, title, desc, color }) => (
    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col items-start h-full">
        <div className={`w-14 h-14 rounded-xl ${color} text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
            <Icon size={24} />
        </div>
        <h3 className="font-bold text-xl text-[#0f172a] mb-3">{title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
    </div>
);

const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-gray-100 last:border-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center py-4 text-left hover:text-primary transition"
            >
                <span className="font-bold text-sm text-gray-800">{question}</span>
                {isOpen ? <FaChevronUp className="text-gray-400" size={12} /> : <FaChevronDown className="text-gray-400" size={12} />}
            </button>
            {isOpen && (
                <div className="pb-4 text-sm text-gray-500 leading-relaxed animate-fadeIn">
                    {answer}
                </div>
            )}
        </div>
    );
};

const ContactCard = ({ icon: Icon, title, value, btnText, color }) => (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
        <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-white shrink-0`}>
            <Icon size={16} />
        </div>
        <div className="flex-1">
            <p className="text-xs font-bold text-gray-500 uppercase mb-0.5">{title}</p>
            <p className="text-sm font-bold text-gray-800">{value}</p>
        </div>
        <button className="text-xs font-bold text-primary hover:underline">{btnText}</button>
    </div>
);

const HelpSupport = () => {
    return (
        <div className="w-full space-y-10 pb-12 max-w-5xl mx-auto">
            {/* Back Button */}
            <div className="">
                <Link to="/dashboard" className="text-secondary hover:text-amber-600 flex items-center gap-2 text-sm font-bold transition-all w-fit">
                    <FaArrowLeft size={12} /> Back to Dashboard
                </Link>
            </div>

            {/* Hero Search */}
            <div className="text-center space-y-8 py-12">
                <h1 className="text-4xl font-extrabold text-[#111827]">How can we help you today?</h1>
                <div className="max-w-3xl mx-auto relative group">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-secondary transition-colors">
                        <FaSearch size={20} />
                    </span>
                    <input
                        type="text"
                        placeholder="Search for articles, guides, or troubleshooting..."
                        className="w-full pl-14 pr-6 py-5 rounded-3xl border border-gray-200 shadow-sm focus:outline-none focus:ring-4 focus:ring-secondary/10 focus:border-secondary text-base transition-all placeholder-gray-400"
                    />
                </div>
            </div>

            {/* Categories */}
            <div>
                <h2 className="text-xl font-bold text-[#111827] mb-8 px-2">Browse by Category</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-2">
                    <SupportCategory
                        icon={FaGraduationCap}
                        color="bg-[#3b82f6]"
                        title="Scholarships"
                        desc="Application process, eligibility criteria, and disbursement details."
                    />

                    <SupportCategory
                        icon={FaCreditCard}
                        color="bg-[#a855f7]"
                        title="Payments"
                        desc="Donations, receipts, refund policies, and transaction failures."
                    />
                    <SupportCategory
                        icon={FaDesktop}
                        color="bg-[#f97316]"
                        title="Technical"
                        desc="Login issues, account recovery, and platform troubleshooting."
                    />
                </div>
            </div>

            {/* Popular FAQs */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-gray-800">Popular Questions</h2>
                    <Link to="#" className="text-sm font-bold text-secondary hover:underline">View All FAQs</Link>
                </div>
                <div className="divide-y divide-gray-100">
                    <FAQItem
                        question="How do I track my scholarship application status?"
                        answer="You can track your application status directly from the 'Funding Request' dashboard. The status indicators (Under Review, Approved, Disbursed) are updated in real-time."
                    />

                    <FAQItem
                        question="How can I download my 80G tax receipt for donations?"
                        answer="Go to the 'My Donations' page in the dashboard. You will find a 'Download Receipt' button next to each successful transaction in your history."
                    />
                    <FAQItem
                        question="Can I edit my profile details after submission?"
                        answer="Basic details can be edited from 'Profile Settings'. However, sensitive fields like Name and Date of Birth require admin approval or re-verification if KYC is already completed."
                    />
                </div>
            </div>

            {/* Contact Support */}
            <div>
                <h2 className="text-lg font-bold text-gray-800 mb-6">Still need help?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <ContactCard
                        icon={FaEnvelope}
                        color="bg-red-500"
                        title="Email Support"
                        value="help@mews.org"
                        btnText="Send Email"
                    />
                    <ContactCard
                        icon={FaPhoneAlt}
                        color="bg-blue-600"
                        title="Phone Support"
                        value="1800-123-4567"
                        btnText="Call Now"
                    />
                    <ContactCard
                        icon={FaCommentDots}
                        color="bg-green-500"
                        title="Live Chat"
                        value="Available 9AM - 6PM"
                        btnText="Start Chat"
                    />
                </div>
            </div>

        </div>
    );
};

export default HelpSupport;
