import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    FaSearch, FaGraduationCap, FaUserShield, FaCreditCard,
    FaDesktop, FaEnvelope, FaPhoneAlt, FaCommentDots, FaChevronDown, FaChevronUp
} from 'react-icons/fa';

const SupportCategory = ({ icon: Icon, title, desc, color }) => (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition cursor-pointer group">
        <div className={`w-12 h-12 rounded-lg ${color} text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
            <Icon size={20} />
        </div>
        <h3 className="font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
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

            {/* Hero Search */}
            <div className="text-center space-y-6 py-8">
                <h1 className="text-3xl font-bold text-[#1e2a4a]">How can we help you today?</h1>
                <div className="max-w-2xl mx-auto relative">
                    <span className="absolute left-4 top-3.5 text-gray-400">
                        <FaSearch size={18} />
                    </span>
                    <input
                        type="text"
                        placeholder="Search for articles, guides, or troubleshooting..."
                        className="w-full pl-12 pr-4 py-3.5 rounded-full border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent text-sm"
                    />
                </div>
            </div>

            {/* Categories */}
            <div>
                <h2 className="text-lg font-bold text-gray-800 mb-6">Browse by Category</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <SupportCategory
                        icon={FaGraduationCap}
                        color="bg-blue-500"
                        title="Scholarships"
                        desc="Application process, eligibility criteria, and disbursement details."
                    />
                    <SupportCategory
                        icon={FaUserShield}
                        color="bg-green-500"
                        title="KYC & Data"
                        desc="Identity verification, profile updates, and data privacy policies."
                    />
                    <SupportCategory
                        icon={FaCreditCard}
                        color="bg-purple-500"
                        title="Payments"
                        desc="Donations, receipts, refund policies, and transaction failures."
                    />
                    <SupportCategory
                        icon={FaDesktop}
                        color="bg-orange-500"
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
                        answer="You can track your application status directly from the 'My Applications' dashboard. The status indicators (Under Review, Approved, Disbursed) are updated in real-time."
                    />
                    <FAQItem
                        question="What documents are needed for KYC verification?"
                        answer="Standard KYC requires an Aadhar Card (Front & Back), a recent Community Certificate, and a Bank Passbook copy. A live photo verification is also required."
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
