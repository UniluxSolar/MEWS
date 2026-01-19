import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';
import AdminSidebar from '../components/AdminSidebar';
import DashboardHeader from '../components/common/DashboardHeader';
import { FaQuestionCircle, FaEnvelope, FaBook, FaChevronDown, FaChevronUp, FaPhoneAlt } from 'react-icons/fa';

const AdminHelpSupport = () => {
    const [openFaq, setOpenFaq] = useState(null);
    const [activeTab, setActiveTab] = useState('faq');

    const faqs = [
        { q: "How do I register a new family member?", a: "Go to Member Management > Add New Member. Fill in the details for the head of the family first, then use the 'Add Family Member' button." },
        { q: "How can I update my village's information?", a: "Navigate to Village Settings > General Info to update the village name and contact details." },
        { q: "What should I do in case of an SOS alert?", a: "Immediately check the SOS Management dashboard for location details and contact local authorities or the user directly." },
        { q: "How do I export member data?", a: "In the Member Management page, click the 'Export Excel' button to download the current list of members." },
    ];

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    return (
        <div className="min-h-screen bg-[#f3f4f6] font-sans flex flex-col">
            <AdminHeader />
            <div className="flex flex-1 overflow-hidden">
                <AdminSidebar activePage="help" />
                <main className="flex-1 overflow-y-auto">
                    <DashboardHeader
                        title="Help & Support"
                        subtitle="Search our help center or contact support."
                        breadcrumb={
                            <>
                                <Link to="/admin/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
                                <span className="opacity-70">&gt;</span>
                                <span>Help & Support</span>
                            </>
                        }
                    />

                    <div className="px-4 md:px-8 -mt-10 pb-12 w-full max-w-6xl mx-auto">

                        {/* Quick Access Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                            <div onClick={() => setActiveTab('faq')} className={`bg-white p-6 rounded-xl border-2 cursor-pointer transition-all hover:-translate-y-1 ${activeTab === 'faq' ? 'border-blue-500 shadow-md transform -translate-y-1' : 'border-gray-100 shadow-sm'}`}>
                                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 mb-4 font-bold text-xl">?</div>
                                <h3 className="font-bold text-lg text-gray-900 mb-2">FAQs</h3>
                                <p className="text-sm text-gray-500">Common questions from village admins.</p>
                            </div>
                            <div onClick={() => setActiveTab('contact')} className={`bg-white p-6 rounded-xl border-2 cursor-pointer transition-all hover:-translate-y-1 ${activeTab === 'contact' ? 'border-blue-500 shadow-md transform -translate-y-1' : 'border-gray-100 shadow-sm'}`}>
                                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center text-green-600 mb-4 font-bold text-xl"><FaEnvelope /></div>
                                <h3 className="font-bold text-lg text-gray-900 mb-2">Contact Support</h3>
                                <p className="text-sm text-gray-500">Get in touch with technical team.</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl border-2 border-gray-100 shadow-sm cursor-pointer transition-all hover:-translate-y-1 hover:border-purple-200">
                                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600 mb-4 font-bold text-xl"><FaBook /></div>
                                <h3 className="font-bold text-lg text-gray-900 mb-2">Documentation</h3>
                                <p className="text-sm text-gray-500">System manuals and guides.</p>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="max-w-4xl mx-auto">
                            {activeTab === 'faq' && (
                                <div className="space-y-4">
                                    <h2 className="text-xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                                    {faqs.map((faq, index) => (
                                        <div key={index} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                                            <button
                                                onClick={() => toggleFaq(index)}
                                                className="w-full flex items-center justify-between p-5 text-left font-bold text-gray-800 hover:bg-gray-50 transition"
                                            >
                                                <span>{faq.q}</span>
                                                {openFaq === index ? <FaChevronUp className="text-blue-500" /> : <FaChevronDown className="text-gray-400" />}
                                            </button>
                                            {openFaq === index && (
                                                <div className="p-5 pt-0 text-gray-600 text-sm border-t border-gray-100 bg-gray-50">
                                                    {faq.a}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'contact' && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                                    <h2 className="text-xl font-bold text-gray-900 mb-6">Send us a message</h2>
                                    <form className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Your Name</label>
                                                <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:border-blue-500 focus:outline-none" placeholder="Enter your name" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Email Address</label>
                                                <input type="email" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:border-blue-500 focus:outline-none" placeholder="Enter your email" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Subject</label>
                                            <select className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:border-blue-500 focus:outline-none cursor-pointer">
                                                <option>Technical Issue</option>
                                                <option>Feature Request</option>
                                                <option>Account Support</option>
                                                <option>Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Message</label>
                                            <textarea rows="5" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:border-blue-500 focus:outline-none resize-none" placeholder="Describe your issue..."></textarea>
                                        </div>
                                        <button type="button" className="bg-[#1e2a4a] hover:bg-[#2a3b66] text-white px-8 py-3 rounded-lg text-sm font-bold shadow-lg transition w-full md:w-auto">
                                            Submit Request
                                        </button>
                                    </form>

                                    <div className="mt-8 pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
                                        <div className="flex items-center gap-3 text-gray-600">
                                            <FaPhoneAlt className="text-blue-500" />
                                            <span className="font-bold">Call Support: +91 98765 43210</span>
                                        </div>
                                        <p className="text-xs text-gray-400">Available Mon-Fri, 9am - 6pm IST</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminHelpSupport;
