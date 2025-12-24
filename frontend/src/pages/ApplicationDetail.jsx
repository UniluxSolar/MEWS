import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    FaArrowLeft, FaPrint, FaDownload, FaTrash, FaPhoneAlt, FaEnvelope, FaClock,
    FaFilePdf, FaEye, FaCheckCircle, FaPaperclip, FaPaperPlane, FaUserTie, FaChevronLeft
} from 'react-icons/fa';

const InfoRow = ({ label, value }) => (
    <div className="mb-4">
        <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide">{label}</div>
        <div className="text-sm font-bold text-gray-800 mt-1">{value}</div>
    </div>
);

const DocumentItem = ({ name, size, date }) => (
    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-white mb-3 hover:shadow-sm transition">
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-red-50 text-red-500 rounded-lg flex items-center justify-center">
                <FaFilePdf size={20} />
            </div>
            <div>
                <h4 className="text-sm font-bold text-gray-800">{name}</h4>
                <p className="text-xs text-gray-500">{size} • {date}</p>
            </div>
        </div>
        <div className="flex gap-3">
            <button className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                <FaEye /> View
            </button>
            <button className="text-xs font-bold text-secondary hover:underline flex items-center gap-1">
                <FaDownload /> Download
            </button>
        </div>
    </div>
);

const TimelineItem = ({ status, date, time, isCompleted, isCurrent, description }) => (
    <div className="relative pl-8 pb-8 last:pb-0">
        {/* Line */}
        <div className="absolute left-[11px] top-2 bottom-0 w-0.5 bg-gray-200"></div>

        {/* Dot */}
        <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center
            ${isCompleted ? 'bg-green-500' : isCurrent ? 'bg-amber-500' : 'bg-gray-300'}`}>
            {isCompleted && <FaCheckCircle className="text-white text-[10px]" />}
        </div>

        <div className="flex justify-between items-start">
            <div>
                <h4 className={`text-sm font-bold ${isCompleted || isCurrent ? 'text-gray-800' : 'text-gray-400'}`}>
                    {status}
                    {isCompleted && <span className="ml-2 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Completed</span>}
                    {isCurrent && <span className="ml-2 text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">In Progress</span>}
                </h4>
                <p className="text-xs text-gray-400 mt-0.5">{date} {time && `, ${time}`}</p>
                {description && <p className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded border border-gray-100">{description}</p>}
            </div>
        </div>
    </div>
);

const ChatMessage = ({ sender, time, text, isMe, attachment }) => (
    <div className={`flex gap-3 mb-4 ${isMe ? 'flex-row-reverse' : ''}`}>
        <img
            src={isMe ? "/assets/images/user-profile.png" : "https://randomuser.me/api/portraits/women/44.jpg"}
            alt={sender}
            className="w-8 h-8 rounded-full border border-gray-200"
        />
        <div className={`max-w-[80%] ${isMe ? 'items-end' : 'items-start'}`}>
            <div className={`p-3 rounded-2xl text-sm ${isMe ? 'bg-primary text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}>
                <p>{text}</p>
                {attachment && (
                    <div className="mt-2 text-xs bg-white/20 p-2 rounded flex items-center gap-2">
                        <FaPaperclip /> {attachment}
                    </div>
                )}
            </div>
            <p className="text-[10px] text-gray-400 mt-1">{time}</p>
        </div>
    </div>
);

const ApplicationDetail = () => {
    // In a real app, use useParams() to fetch data
    const { id } = useParams();

    return (
        <div className="w-full pb-12">
            {/* Back Link */}
            <div className="mb-6">
                <Link to="/dashboard/applications" className="text-gray-500 hover:text-primary text-sm flex items-center gap-2 font-bold transition">
                    <FaChevronLeft size={10} /> Back to My Applications
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Content (2 Columns) */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Header Card */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                            <div className="flex gap-4">
                                <img src="/assets/images/user-profile.png" alt="Rajesh" className="w-16 h-16 rounded-full border-2 border-white shadow-md" />
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900">Application #{id || 'MEWS-2025-1234'}</h1>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded">Education Scholarship</span>
                                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-bold rounded">Under Review</span>
                                    </div>
                                    <div className="text-xs text-gray-400 mt-2 flex flex-col sm:flex-row gap-x-4 gap-y-1">
                                        <span className="flex items-center gap-1"><FaPhoneAlt size={10} /> +91 9876543210</span>
                                        <span className="flex items-center gap-1"><FaClock /> Applied: 10 Nov 2025</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 w-full md:w-auto">
                                <button className="flex-1 md:flex-none border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-xs font-bold hover:bg-gray-50 transition flex items-center justify-center gap-2">
                                    <FaPrint /> Print
                                </button>
                                <button className="flex-1 md:flex-none border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-xs font-bold hover:bg-gray-50 transition flex items-center justify-center gap-2">
                                    <FaDownload /> PDF
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Submitted Info */}
                    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-3">Submitted Information</h3>

                        <div className="mb-8">
                            <h4 className="text-sm font-bold text-gray-800 mb-4 bg-gray-50 p-2 rounded">Personal Details</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                <InfoRow label="Full Name" value="Rajesh Kumar Reddy" />
                                <InfoRow label="Date of Birth" value="15 March 2003" />
                                <InfoRow label="District" value="Hyderabad" />
                                <InfoRow label="Mandal" value="Secunderabad" />
                                <InfoRow label="Gender" value="Male" />
                                <InfoRow label="Email" value="rajesh.kumar@email.com" />
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-bold text-gray-800 mb-4 bg-gray-50 p-2 rounded">Education Details</h4>
                            <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
                                <InfoRow label="Course Name" value="B.Tech Computer Science" />
                                <InfoRow label="Institution Name" value="JNTU Hyderabad" />
                                <InfoRow label="Year/Semester" value="2nd Year, 4th Semester" />
                                <InfoRow label="Total Fee Amount" value="₹1,20,000" />
                                <div className="col-span-2">
                                    <InfoRow label="Reason for Assistance" value="My family is facing financial difficulties due to my father's recent job loss. I am a meritorious student with consistent good grades and need financial support to continue my education." />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Documents */}
                    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-3">Documents Submitted</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DocumentItem name="Bonafide Certificate" size="1.5 MB" date="10 Nov 2025" />
                            <DocumentItem name="Marks Memo" size="0.8 MB" date="10 Nov 2025" />
                            <DocumentItem name="Income Certificate" size="1.2 MB" date="10 Nov 2025" />
                            <DocumentItem name="Bank Passbook" size="2.1 MB" date="10 Nov 2025" />
                            <DocumentItem name="Aadhar Card" size="1.8 MB" date="10 Nov 2025" />
                        </div>
                    </div>
                </div>

                {/* Right Sidebar (1 Column) */}
                <div className="space-y-8">

                    {/* Status Card */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center">
                                <FaClock size={16} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800">Under Review</h3>
                                <p className="text-xs text-gray-500">Documents verification in progress</p>
                            </div>
                        </div>

                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-xs font-bold text-gray-600">
                                <span>Progress</span>
                                <span>50% Complete</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                                <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '50%' }}></div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 text-xs space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Next expected action:</span>
                                <span className="font-bold text-gray-700">Approval Decision</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Expected date:</span>
                                <span className="font-bold text-gray-700">17-20 Nov 2025</span>
                            </div>
                        </div>
                    </div>

                    {/* Progress Timeline */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <h3 className="font-bold text-gray-900 mb-6">Application Progress</h3>
                        <TimelineItem
                            status="Submitted"
                            date="10 Nov 2025"
                            time="3:45 PM"
                            isCompleted={true}
                        />
                        <TimelineItem
                            status="Assigned to Caseworker"
                            date="11 Nov 2025"
                            time="9:30 AM"
                            isCompleted={true}
                            description="Caseworker: Priya Menon"
                        />
                        <TimelineItem
                            status="Under Review"
                            date="Expected: 17 Nov 2025"
                            isCurrent={true}
                        />
                        <TimelineItem
                            status="Approved"
                            date="Expected: 20 Nov 2025"
                        />
                        <TimelineItem
                            status="Disbursed"
                            date="Expected: 25 Nov 2025"
                        />
                    </div>

                    {/* Chat Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[600px]">
                        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                            <h3 className="font-bold text-gray-900">Chat with Caseworker</h3>
                            <div className="flex items-center gap-2">
                                <img src="https://randomuser.me/api/portraits/women/44.jpg" className="w-6 h-6 rounded-full" />
                                <div className="text-xs">
                                    <div className="font-bold text-gray-800">Priya Menon</div>
                                    <div className="text-green-500 flex items-center gap-1">● Active</div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 p-4 overflow-y-auto bg-gray-50/30">
                            <ChatMessage
                                sender="Priya"
                                time="11 Nov, 9:35 AM"
                                text="Hi Rajesh, we've received your application. I'll review your documents today."
                            />
                            <ChatMessage
                                sender="Rajesh"
                                time="11 Nov, 10:15 AM"
                                text="Thank you. I've uploaded all required documents."
                                isMe={true}
                            />
                            <ChatMessage
                                sender="Priya"
                                time="12 Nov, 10:20 AM"
                                text="Could you please upload an updated bonafide certificate dated within the last 30 days?"
                            />
                            <ChatMessage
                                sender="Rajesh"
                                time="12 Nov, 2:45 PM"
                                text="Sure, I have uploaded the new certificate."
                                isMe={true}
                                attachment="Updated_Bonafide.pdf"
                            />
                        </div>

                        <div className="p-3 bg-white border-t border-gray-100">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Type your message..."
                                    className="w-full bg-gray-100 border border-transparent focus:bg-white focus:border-primary rounded-full py-3 pl-4 pr-12 text-sm transition focus:outline-none"
                                />
                                <button className="absolute right-2 top-2 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center hover:bg-opacity-90 transition">
                                    <FaPaperPlane size={12} />
                                </button>
                                <button className="absolute right-12 top-2 w-8 h-8 text-gray-500 hover:text-gray-700 flex items-center justify-center transition">
                                    <FaPaperclip size={14} />
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ApplicationDetail;
