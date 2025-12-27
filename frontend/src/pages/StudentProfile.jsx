import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
    FaCheckCircle, FaMapMarkerAlt, FaEye, FaShareAlt, FaMapMarkedAlt,
    FaUniversity, FaUserGraduate, FaChartLine, FaRupeeSign, FaShieldAlt,
    FaLock, FaPaperPlane, FaFileInvoice, FaChevronRight, FaTrophy, FaBookReader, FaChevronLeft
} from 'react-icons/fa';

const StudentProfile = () => {
    const { id } = useParams();
    const [donationType, setDonationType] = useState('full'); // 'full' | 'partial'
    const [amount, setAmount] = useState('');

    return (
        <div className="w-full pb-12 font-sans bg-gray-50 min-h-screen">
            {/* Breadcrumb Area (Simulated within page for UI match) */}
            <div className="bg-[#151f38] text-white py-4 px-6 md:px-12 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Link to="/dashboard" className="hover:text-white">Dashboard</Link>
                    <span>›</span>
                    <Link to="/dashboard/donate" className="hover:text-white">Sponsor a Student</Link>
                    <span>›</span>
                    <span className="text-white font-semibold">Profile</span>
                </div>
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 text-sm font-medium hover:text-secondary transition">
                        <FaShareAlt /> Share Profile
                    </button>
                    <div className="relative">
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 text-[8px] text-white items-center justify-center">3</span>
                        </span>
                        <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden border border-gray-600">
                            <img src="https://ui-avatars.com/api/?name=User&background=random" alt="User" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
                <Link to="/dashboard/donate" className="inline-flex items-center gap-2 text-sm text-gray-500 font-bold mb-6 hover:text-[#1e2a4a] transition">
                    <FaChevronLeft size={10} /> Back to Sponsorships
                </Link>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Student Details */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Profile Header Card */}
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex flex-col md:flex-row gap-6">
                            <div className="w-full md:w-48 h-48 rounded-lg overflow-hidden bg-gray-200 relative shrink-0">
                                {/* Placeholder for Student Image */}
                                <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500">
                                    <FaUserGraduate size={48} />
                                </div>
                                <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-gray-700 shadow-sm">
                                    Privacy Protected
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-2xl font-bold text-gray-900">Priya</h1>
                                    <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center gap-1 border border-green-200">
                                        <FaCheckCircle size={10} /> Verified
                                    </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                                    <span className="flex items-center gap-1"><FaUserGraduate size={12} /> 19 years old</span>
                                    <span className="flex items-center gap-1"><FaMapMarkerAlt size={12} /> Pune District</span>
                                    <span className="flex items-center gap-1"><FaEye size={12} /> 847 views</span>
                                </div>
                                <h2 className="text-lg font-semibold text-gray-800 mb-1">Computer Science Engineering • 2nd Year</h2>
                            </div>
                        </div>

                        {/* Story Section */}
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-4">Priya's Story</h3>
                            <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                                <p>
                                    Growing up in a small village outside Pune, I always dreamed of becoming a software engineer. My father works as a daily wage laborer, and my mother takes care of our household and my two younger siblings. Despite the financial constraints, my parents always encouraged my education.
                                </p>
                                <p>
                                    I excelled in my 12th standard examinations and secured admission to Computer Science Engineering at a reputed college in Pune. However, the financial burden of college fees, hostel expenses, and study materials has become overwhelming for my family.
                                </p>
                                <blockquote className="border-l-4 border-primary pl-4 py-1 my-4 bg-blue-50/50 rounded-r-lg italic text-gray-800 font-medium">
                                    "Education is the only way I can lift my family out of poverty and create a better future for my siblings. With your support, I promise to work hard and make the most of this opportunity."
                                </blockquote>
                                <p>
                                    I maintain a CGPA of 8.7 and actively participate in coding competitions. My goal is to secure a position at a leading technology company and eventually start my own software development firm to create employment opportunities in my village.
                                </p>
                            </div>
                        </div>

                        {/* Educational Details */}
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-6">Educational Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 block mb-1">Current Course</label>
                                    <p className="font-semibold text-gray-800">B.Tech Computer Science Engineering</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 block mb-1">Academic Performance</label>
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold text-gray-800">CGPA: 8.7/10</p>
                                        <span className="bg-green-100 text-green-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">Excellent</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 block mb-1">Institution</label>
                                    <p className="font-semibold text-gray-800">Pune Institute of Technology</p>
                                    <span className="text-[10px] text-orange-500 flex items-center gap-1 mt-0.5"><FaCheckCircle size={8} /> NAAC A+ Accredited</span>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 block mb-1">Expected Completion</label>
                                    <p className="font-semibold text-gray-800">May 2026</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 block mb-1">Current Year</label>
                                    <p className="font-semibold text-gray-800">2nd Year (3rd Semester)</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 block mb-1">Career Goal</label>
                                    <p className="font-semibold text-gray-800">Software Engineer at Tech MNC</p>
                                </div>
                            </div>
                        </div>

                        {/* Financial Requirements */}
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-6">Financial Requirements</h3>

                            <div className="mb-8">
                                <div className="flex justify-between text-sm font-bold mb-2">
                                    <span className="text-gray-700">Funding Progress</span>
                                    <span className="text-gray-500">₹85,000 of ₹2,40,000</span>
                                </div>
                                <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 w-[35%] rounded-full"></div>
                                </div>
                                <div className="flex justify-between mt-2 text-xs">
                                    <span className="text-green-600 font-bold">35% Funded</span>
                                    <span className="text-red-500 font-bold">₹1,55,000 Remaining</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-3 border-b border-gray-100 text-sm">
                                    <span className="text-gray-600">Tuition Fees (3 years)</span>
                                    <span className="font-bold text-gray-900">₹1,50,000</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-gray-100 text-sm">
                                    <span className="text-gray-600">Books & Materials</span>
                                    <span className="font-bold text-gray-900">₹30,000</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-gray-100 text-sm">
                                    <span className="text-gray-600">Hostel Accommodation</span>
                                    <span className="font-bold text-gray-900">₹45,000</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-gray-100 text-sm">
                                    <span className="text-gray-600">Transportation</span>
                                    <span className="font-bold text-gray-900">₹10,000</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-gray-100 text-sm">
                                    <span className="text-gray-600">Exam & Lab Fees</span>
                                    <span className="font-bold text-gray-900">₹5,000</span>
                                </div>
                                <div className="flex justify-between items-center py-3 pt-4 text-sm bg-gray-50 -mx-6 px-6 -mb-6 rounded-b-xl border-t border-gray-100 mt-2">
                                    <span className="font-bold text-gray-800">Total Required</span>
                                    <span className="font-black text-lg text-gray-900">₹2,40,000</span>
                                </div>
                            </div>
                        </div>

                        {/* Additional Sections Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Family Background */}
                            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                                <h3 className="font-bold text-gray-900 mb-4">Family Background</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 block">Family Size</label>
                                        <p className="text-sm font-semibold text-gray-800">5 members (Parents + 3 children)</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 block">Father's Occupation</label>
                                        <p className="text-sm font-semibold text-gray-800">Daily wage laborer</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 block">Mother's Occupation</label>
                                        <p className="text-sm font-semibold text-gray-800">Homemaker</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 block">Annual Family Income</label>
                                        <p className="text-sm font-semibold text-gray-800">₹80,000 - ₹1,20,000</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 block">Siblings in Education</label>
                                        <p className="text-sm font-semibold text-gray-800">2 (10th and 8th standard)</p>
                                    </div>
                                </div>
                            </div>

                            {/* Verification */}
                            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                                <h3 className="font-bold text-gray-900 mb-4">Verification & Transparency</h3>
                                <ul className="space-y-3">
                                    {[
                                        "Documents Verified",
                                        "Institution Confirmed",
                                        "Income Verification",
                                        "MEWS Process Completed",
                                        "Community Certificate"
                                    ].map((item, idx) => (
                                        <li key={idx} className="flex items-center gap-3 text-sm text-gray-600">
                                            <FaCheckCircle className="text-green-500 shrink-0" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                                <p className="text-[10px] text-gray-400 mt-6 pt-4 border-t border-gray-100">
                                    Last updated: December 15, 2024
                                </p>
                            </div>
                        </div>

                        {/* Progress Updates */}
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-4">Progress Updates</h3>
                            <h4 className="text-sm font-bold text-gray-700 mb-3">Recent Achievements</h4>
                            <div className="space-y-4">
                                <div className="bg-gray-50 rounded-lg p-4 flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                                        <FaTrophy size={16} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-gray-800">Won 2nd Prize in College Coding Competition</p>
                                        <p className="text-xs text-gray-500">November 2024</p>
                                    </div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4 flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                        <FaBookReader size={16} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-gray-800">Maintained 8.7 CGPA in Semester 3</p>
                                        <p className="text-xs text-gray-500">December 2024</p>
                                    </div>
                                </div>
                                <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-100">
                                    <p className="italic text-sm text-gray-600">"I am deeply grateful to all the donors who have supported my education so far. Your kindness motivates me to work harder and achieve my dreams. I promise to use this opportunity wisely and give back to society."</p>
                                    <p className="text-xs text-gray-500 mt-2 text-right">- Priya, December 2024</p>
                                </div>
                            </div>
                        </div>

                        {/* Help Another Student */}
                        <div>
                            <h3 className="font-bold text-gray-900 mb-4 text-lg">Help Another Student</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Card 1 */}
                                <div className="bg-white border border-gray-200 rounded-xl p-4 flex gap-4 hover:shadow-md transition cursor-pointer">
                                    <div className="w-16 h-16 rounded-lg bg-gray-200 shrink-0">
                                        <img src="https://ui-avatars.com/api/?name=Rahul&background=random" className="w-full h-full rounded-lg object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-bold text-gray-900">Rahul, 20</h4>
                                                <p className="text-xs text-gray-500 line-clamp-1">Mechanical Engineering</p>
                                                <p className="text-xs text-gray-500">Mumbai District</p>
                                            </div>
                                        </div>
                                        <div className="mt-3">
                                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-orange-500 w-[60%] rounded-full"></div>
                                            </div>
                                            <p className="text-[10px] text-gray-500 mt-1">60% funded</p>
                                        </div>
                                        <div className="mt-2 text-primary text-xs font-bold flex items-center gap-1">
                                            View Profile <FaChevronRight size={8} />
                                        </div>
                                    </div>
                                </div>

                                {/* Card 2 */}
                                <div className="bg-white border border-gray-200 rounded-xl p-4 flex gap-4 hover:shadow-md transition cursor-pointer">
                                    <div className="w-16 h-16 rounded-lg bg-gray-200 shrink-0">
                                        <img src="https://ui-avatars.com/api/?name=Sneha&background=random" className="w-full h-full rounded-lg object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-bold text-gray-900">Sneha, 18</h4>
                                                <p className="text-xs text-gray-500 line-clamp-1">MBBS</p>
                                                <p className="text-xs text-gray-500">Chennai District</p>
                                            </div>
                                        </div>
                                        <div className="mt-3">
                                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-500 w-[25%] rounded-full"></div>
                                            </div>
                                            <p className="text-[10px] text-gray-500 mt-1">25% funded</p>
                                        </div>
                                        <div className="mt-2 text-primary text-xs font-bold flex items-center gap-1">
                                            View Profile <FaChevronRight size={8} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>


                    </div>

                    {/* Right Column: Donation Action */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden sticky top-24">
                            <div className="p-6 bg-[#151f38] text-white">
                                <h3 className="font-bold text-lg">Choose Your Contribution</h3>
                            </div>

                            <div className="p-6">
                                {/* Toggle */}
                                <div className="flex flex-col gap-3 mb-6">
                                    <button
                                        onClick={() => setDonationType('full')}
                                        className={`p-4 rounded-lg border-2 text-left transition-all ${donationType === 'full' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                                    >
                                        <div className="flex justify-between items-center mb-1">
                                            <span className={`font-bold ${donationType === 'full' ? 'text-primary' : 'text-gray-700'}`}>Sponsor Full Amount</span>
                                            {donationType === 'full' && <FaCheckCircle className="text-primary" />}
                                        </div>
                                        <span className="text-xs text-gray-500">₹1,55,000 remaining</span>
                                    </button>

                                    <button
                                        onClick={() => setDonationType('partial')}
                                        className={`p-4 rounded-lg border-2 text-left transition-all ${donationType === 'partial' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                                    >
                                        <div className="flex justify-between items-center mb-1">
                                            <span className={`font-bold ${donationType === 'partial' ? 'text-primary' : 'text-gray-700'}`}>Sponsor Partial Amount</span>
                                            {donationType === 'partial' && <FaCheckCircle className="text-primary" />}
                                        </div>
                                    </button>
                                </div>

                                {donationType === 'partial' && (
                                    <div className="mb-6 animate-fadeIn">
                                        <label className="text-xs font-bold text-gray-700 block mb-2">Custom Amount</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-3.5 text-gray-400 font-bold">₹</span>
                                            <input
                                                type="text"
                                                placeholder="Enter amount"
                                                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none font-bold text-gray-800"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-3 mb-6">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" defaultChecked />
                                        <span className="text-sm text-gray-600 group-hover:text-gray-800">Monthly installment plan</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
                                        <span className="text-sm text-gray-600 group-hover:text-gray-800">Anonymous donation</span>
                                    </label>
                                </div>

                                <button className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg hover:bg-opacity-90 transition transform hover:-translate-y-0.5 mb-6">
                                    Proceed to Pay
                                </button>

                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 mb-6">
                                    <h4 className="font-bold text-xs text-gray-800 mb-3 uppercase tracking-wide">Sponsorship Benefits</h4>
                                    <ul className="space-y-2">
                                        {[
                                            "Quarterly progress reports",
                                            "Direct thank you from student",
                                            "Graduation celebration invitation",
                                            "Tax benefits (80G)"
                                        ].map((item, i) => (
                                            <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                                                <FaCheckCircle className="text-green-500 mt-0.5 shrink-0" size={10} />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="flex flex-col items-center gap-2 text-[10px] text-gray-400">
                                    <div className="flex items-center gap-1 font-bold text-gray-500">
                                        <FaShieldAlt className="text-green-600" /> Secure payment powered by <span className="text-blue-800 font-black italic">RAZORPAY</span>
                                    </div>
                                    <div className="flex gap-3">
                                        <span>UPI</span> • <span>Card</span> • <span>NetBanking</span>
                                    </div>
                                    <p className="text-center mt-2">By proceeding, you agree to our <a href="#" className="underline">Terms and Conditions</a></p>
                                </div>

                            </div>
                        </div>

                        {/* Tax Benefits Card */}
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                                <FaFileInvoice />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-sm">Tax Benefits Available</h3>
                                <p className="text-xs text-gray-500 mt-1 mb-2">Get 50% tax exemption under Section 80G of Income Tax Act</p>
                                <span className="text-[10px] font-bold text-green-600 flex items-center gap-1">
                                    <FaCheckCircle size={8} /> Instant 80G certificate upon donation
                                </span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentProfile;
