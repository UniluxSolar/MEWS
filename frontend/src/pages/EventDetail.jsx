import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    FaArrowLeft, FaCalendarAlt, FaMapMarkerAlt, FaClock, FaLanguage, FaUserTie,
    FaShareAlt, FaBell, FaCheckCircle, FaDownload, FaEnvelope, FaPhoneAlt,
    FaQrcode, FaTimes, FaChevronLeft
} from 'react-icons/fa';

import RegistrationSuccessModal from '../components/RegistrationSuccessModal';

const AgendaItem = ({ time, title, description }) => (
    <div className="flex gap-4 pb-8 last:pb-0 relative">
        <div className="flex flex-col items-center">
            <div className="text-xs font-bold text-gray-500 w-16 text-right pt-0.5">{time}</div>
        </div>
        <div className="relative flex-1 pl-6 border-l border-gray-200">
            <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-primary border-2 border-white shadow-sm"></div>
            <h4 className="text-sm font-bold text-gray-900 mb-1">{title}</h4>
            <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
        </div>
    </div>
);

const EventDetail = () => {
    const { id } = useParams();
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    return (
        <div className="w-full pb-12 relative">
            {showModal && (
                <RegistrationSuccessModal
                    onClose={() => setShowModal(false)}
                    eventTitle="Tech Recruitment Drive 2025"
                    date="25 Nov 2025, 10:00 AM - 4:00 PM"
                    location="JNTU Campus, Warangal"
                />
            )}

            {/* Back Nav */}
            <div className="mb-6 flex justify-between items-center">
                <Link to="/dashboard/jobs" className="text-gray-500 hover:text-primary text-sm flex items-center gap-2 font-bold transition">
                    <FaChevronLeft size={10} /> Back to Events
                </Link>
                <div className="flex gap-4">
                    <button className="flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-primary transition"><FaShareAlt /> Share Event</button>
                </div>
            </div>

            {/* Hero Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                <div className="h-64 bg-slate-800 relative">
                    <img
                        src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                        alt="Event Banner"
                        className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute top-4 left-4 px-3 py-1 bg-[#1e2a4a]/80 backdrop-blur-sm text-white text-xs font-bold rounded-full">
                        Job Mela
                    </div>
                    <div className="absolute top-4 right-4 px-3 py-1 bg-[#f59e0b] text-white text-xs font-bold rounded-full shadow-sm">
                        Featured
                    </div>
                </div>

                <div className="p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Tech Recruitment Drive 2025</h1>
                    <p className="text-gray-500 text-sm font-medium mb-4">Organized by MEWS x TechCorp</p>

                    <div className="flex items-center gap-4 text-xs font-bold">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                            <FaCheckCircle /> Registration Open
                        </span>
                        <span className="text-green-600">45 seats remaining out of 150</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Details */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Quick Info Grid */}
                    <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 bg-gray-50 text-gray-400 rounded-lg flex items-center justify-center shrink-0">
                                <FaCalendarAlt />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Date & Time</h4>
                                <p className="text-sm font-bold text-gray-900">25 Nov 2025, 10:00 AM - 4:00 PM</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 bg-gray-50 text-gray-400 rounded-lg flex items-center justify-center shrink-0">
                                <FaMapMarkerAlt />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Venue</h4>
                                <p className="text-sm font-bold text-gray-900">JNTU Campus</p>
                                <p className="text-xs text-gray-500">Engineering College, Warangal, Telangana 506004</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 bg-gray-50 text-gray-400 rounded-lg flex items-center justify-center shrink-0">
                                <FaClock />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Duration</h4>
                                <p className="text-sm font-bold text-gray-900">6 hours</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 bg-gray-50 text-gray-400 rounded-lg flex items-center justify-center shrink-0">
                                <FaLanguage />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Language</h4>
                                <p className="text-sm font-bold text-gray-900">English, Telugu, Hindi</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 bg-gray-50 text-gray-400 rounded-lg flex items-center justify-center shrink-0">
                                <FaUserTie />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Target Audience</h4>
                                <p className="text-sm font-bold text-gray-900">Job seekers, Fresh graduates</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 bg-gray-50 text-gray-400 rounded-lg flex items-center justify-center shrink-0">
                                <FaBell />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Registration Deadline</h4>
                                <p className="text-sm font-bold text-gray-900">22 Nov 2025, 11:59 PM</p>
                            </div>
                        </div>

                        <div className="col-span-1 md:col-span-2 pt-4 border-t border-gray-100 flex justify-end">
                            <button className="text-primary text-xs font-bold flex items-center gap-1 hover:underline">
                                <FaMapMarkerAlt /> Get Directions
                            </button>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">About This Event</h3>
                        <p className="text-sm text-gray-600 leading-relaxed mb-6">
                            Join us for the largest tech recruitment drive in Telangana state, bringing together leading technology companies and talented professionals. This comprehensive job fair will feature on-spot interviews, skill assessments, and networking opportunities with industry leaders.
                        </p>

                        <h4 className="text-sm font-bold text-gray-900 mb-3">Event Objectives</h4>
                        <ul className="space-y-2 mb-6">
                            {['Connect qualified candidates with leading tech companies', 'Provide immediate interview and hiring opportunities', 'Showcase career opportunities in emerging technologies'].map((item, i) => (
                                <li key={i} className="flex gap-2 text-sm text-gray-600">
                                    <FaCheckCircle className="text-green-500 mt-1 shrink-0" size={14} />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>

                        <h4 className="text-sm font-bold text-gray-900 mb-3">Registration Requirements</h4>
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 space-y-3">
                            <div>
                                <h5 className="text-xs font-bold text-blue-800">Eligibility Criteria</h5>
                                <p className="text-xs text-blue-800/80">• Engineering graduates (B.Tech/BE) 2024-2025 batch</p>
                                <p className="text-xs text-blue-800/80">• Fresh graduates to 3 years experience</p>
                            </div>
                            <div>
                                <h5 className="text-xs font-bold text-blue-800">Documents to Bring</h5>
                                <p className="text-xs text-blue-800/80">• Updated resume (5 copies)</p>
                                <p className="text-xs text-blue-800/80">• Valid ID proof (Aadhaar/PAN)</p>
                            </div>
                        </div>
                    </div>

                    {/* Agenda */}
                    <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm mb-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Event Agenda</h3>
                        <div className="space-y-2">
                            <AgendaItem time="10:00 AM" title="Registration & Check-in" description="Participant registration and document verification" />
                            <AgendaItem time="10:30 AM" title="Opening Ceremony" description="Welcome address and event overview" />
                            <AgendaItem time="11:00 AM" title="Company Presentations" description="Brief presentations by participating companies" />
                            <AgendaItem time="12:00 PM" title="Interview Sessions - Round 1" description="Technical interviews and assessments" />
                            <AgendaItem time="1:00 PM" title="Lunch Break" description="Networking lunch with company representatives" />
                            <AgendaItem time="2:00 PM" title="Interview Sessions - Round 2" description="HR interviews and final selections" />
                            <AgendaItem time="3:30 PM" title="Results & Closing" description="Announcement of selections and closing ceremony" />
                        </div>
                    </div>

                    {/* Participating Companies */}
                    <div className="mb-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Participating Companies</h3>
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { name: 'TechCorp Solutions', role: 'Software Development, Data Analytics', openings: 15, bg: 'bg-indigo-900' },
                                { name: 'InnovateTech', role: 'AI/ML, Cloud Computing', openings: 12, bg: 'bg-blue-900' },
                                { name: 'DataFlow Systems', role: 'System Engineering, DevOps', openings: 8, bg: 'bg-slate-900' },
                            ].map((company, i) => (
                                <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex flex-col items-center text-center hover:shadow-md transition">
                                    <div className={`w-12 h-12 ${company.bg} rounded-lg mb-3 flex items-center justify-center text-white font-bold text-xs shadow-sm`}>
                                        TS
                                    </div>
                                    <h4 className="text-xs font-bold text-gray-900 mb-1">{company.name}</h4>
                                    <p className="text-[10px] text-gray-500 mb-2 leading-tight">{company.role}</p>
                                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{company.openings} openings</span>
                                </div>
                            ))}
                        </div>
                        <div className="text-center mt-4">
                            <button className="text-xs font-bold text-secondary hover:text-primary transition">
                                View All 12 Companies
                            </button>
                        </div>
                    </div>

                    {/* Similar Events */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Similar Events</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <Link to="/dashboard/jobs/2" className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex gap-4 hover:shadow-md transition group cursor-pointer">
                                <div className="w-24 h-24 bg-gray-200 rounded-lg shrink-0 overflow-hidden">
                                    <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" className="w-full h-full object-cover group-hover:scale-110 transition" alt="Event" />
                                </div>
                                <div className="flex flex-col justify-center">
                                    <h4 className="text-xs font-bold text-gray-900 mb-1 line-clamp-2">Healthcare Jobs Fair</h4>
                                    <p className="text-[10px] text-gray-500 mb-2">30 Nov 2025 • Government Hospital, Hyderabad</p>
                                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded w-fit">120 seats available</span>
                                </div>
                            </Link>
                            <Link to="/dashboard/jobs/3" className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex gap-4 hover:shadow-md transition group cursor-pointer">
                                <div className="w-24 h-24 bg-gray-200 rounded-lg shrink-0 overflow-hidden">
                                    <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" className="w-full h-full object-cover group-hover:scale-110 transition" alt="Event" />
                                </div>
                                <div className="flex flex-col justify-center">
                                    <h4 className="text-xs font-bold text-gray-900 mb-1 line-clamp-2">Digital Marketing Workshop</h4>
                                    <p className="text-[10px] text-gray-500 mb-2">05 Dec 2025 • MEWS Community Center</p>
                                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded w-fit">38 seats available</span>
                                </div>
                            </Link>
                        </div>
                    </div>

                </div>

                {/* Right Sidebar */}
                <div className="space-y-6">

                    {/* Registration Card */}
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <div className="text-center mb-6">
                            <div className="text-3xl font-bold text-gray-900">Free</div>
                            <div className="text-xs text-gray-500">Registration</div>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div>
                                <div className="flex justify-between text-xs font-bold text-gray-600 mb-1">
                                    <span>Seats Remaining</span>
                                    <span className="text-green-600">45 of 150</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-1.5">
                                    <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '70%' }}></div>
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] text-gray-400 mb-1">Registration closes in</p>
                                <p className="text-sm font-bold text-red-500">2 days 14 hours</p>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowModal(true)}
                            className="w-full py-3 bg-[#1e2a4a] text-white font-bold rounded-lg hover:bg-[#2a3b66] transition shadow-md mb-3"
                        >
                            Register Now
                        </button>

                        <button className="w-full py-2.5 border border-gray-200 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2 mb-2">
                            <FaCalendarAlt /> Add to Calendar
                        </button>
                        <button className="w-full py-2.5 border border-gray-200 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2 mb-2">
                            <FaDownload /> Download Brochure
                        </button>
                    </div>

                    {/* Organizer Card */}
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <h4 className="text-sm font-bold text-gray-900 mb-4">Event Organizer</h4>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-[#1e2a4a] text-white rounded-lg flex items-center justify-center font-bold text-xs">
                                MEWS
                            </div>
                            <div>
                                <div className="text-sm font-bold text-gray-800">MEWS</div>
                                <div className="text-xs text-gray-500">Migrant Workers Welfare Society</div>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed mb-4">
                            MEWS has been organizing successful employment drives and skill development programs across Telangana state since 2018.
                        </p>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                <FaEnvelope className="text-gray-400" /> events@mews.org.in
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                <FaPhoneAlt className="text-gray-400" /> +91 9876543210
                            </div>
                        </div>
                        <button className="w-full mt-4 py-2 border border-gray-200 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-50 transition">
                            Contact Organizer
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default EventDetail;
