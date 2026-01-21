import React, { useEffect } from 'react';
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import { FaCheckCircle, FaHeart, FaShare, FaArrowLeft, FaUserFriends, FaClock } from 'react-icons/fa';

const CampaignDetails = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { id } = useParams();

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // If accessed directly without state, show a fallback or redirect
    if (!state?.campaign) {
        return (
            <div className="min-h-screen flex items-center justify-center flex-col gap-4 bg-gray-50">
                <p className="text-gray-600">Campaign details not found or link expired.</p>
                <button 
                    onClick={() => navigate('/')}
                    className="px-4 py-2 bg-[#1e2a4a] text-white rounded hover:bg-opacity-90 transition"
                >
                    Back to Home
                </button>
            </div>
        );
    }

    const { campaign } = state;
    const percentage = Math.min((parseInt(campaign.raised.replace(/,/g, '')) / parseInt(campaign.goal.replace(/,/g, ''))) * 100, 100);

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <button 
                    onClick={() => navigate(-1)} 
                    className="flex items-center gap-2 text-gray-600 hover:text-[#1e2a4a] mb-6 transition"
                >
                    <FaArrowLeft /> Back to Campaigns
                </button>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                    <div className="grid grid-cols-1 lg:grid-cols-3">
                        
                        {/* Left Column: Image and Key Stats */}
                        <div className="lg:col-span-2">
                            <div className="h-64 sm:h-96 overflow-hidden relative group">
                                <img src={campaign.image} alt={campaign.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                <div className={`absolute top-4 left-4 text-xs font-bold uppercase py-1.5 px-4 bg-white/95 backdrop-blur-sm ${campaign.colorBadge} rounded-full flex items-center gap-2 shadow-sm`}>
                                    {campaign.category}
                                </div>
                            </div>
                            
                            <div className="p-8">
                                <h1 className="text-3xl font-bold text-[#1e2a4a] mb-4 leading-tight">{campaign.title}</h1>
                                
                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-8 pb-8 border-b border-gray-100">
                                    <span className="flex items-center gap-1.5 text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
                                        <FaCheckCircle /> Verified Campaign
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <FaUserFriends className="text-gray-400"/> {campaign.supporters} supporters
                                    </span>
                                    {campaign.daysLeft && (
                                        <span className="flex items-center gap-1.5">
                                            <FaClock className="text-gray-400"/> {campaign.daysLeft} days left
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-[#1e2a4a] mb-3">About this Campaign</h3>
                                        <p className="text-gray-600 leading-relaxed mb-4">
                                            This is a community-driven initiative supported by MEWS. Your contribution helps us make a tangible difference in the lives of those in need. Every rupee counts towards achieving our goal.
                                        </p>
                                        <p className="text-gray-600 leading-relaxed">
                                            Join hundreds of other supporters in making this mission a success. We ensure transparent utilization of funds and regular updates on the progress of this campaign.
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-[#1e2a4a] mb-3">Beneficiary Details</h3>
                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                            <p className="text-sm text-gray-600">The funds raised will be directly utilized for the stated cause under the supervision of MEWS verification team.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Donation Card */}
                        <div className="lg:col-span-1 bg-gray-50/50 p-8 border-l border-gray-100">
                            <div className="sticky top-8 space-y-8">
                                
                                {/* Progress Section */}
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <div className="mb-2 flex items-baseline gap-1">
                                        <span className="text-3xl font-bold text-[#1e2a4a]">₹{campaign.raised}</span>
                                        <span className="text-gray-500 text-sm font-medium">raised of ₹{campaign.goal} goal</span>
                                    </div>
                                    
                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden mb-4">
                                        <div className="h-full bg-[#3b82f6] rounded-full" style={{ width: `${percentage}%` }}></div>
                                    </div>

                                    <div className="flex justify-between text-xs text-gray-500 font-medium font-mono">
                                        <span>{percentage.toFixed(0)}% FUNDED</span>
                                        <span>{campaign.supporters} SUPPORTERS</span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-3">
                                    <Link 
                                        to="/dashboard/donate" 
                                        className="block w-full text-center py-4 bg-[#1e2a4a] text-white rounded-lg font-bold uppercase tracking-wide hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                                    >
                                        Donate Now
                                    </Link>
                                    
                                    <div className="grid grid-cols-2 gap-3">
                                        <button className="flex items-center justify-center gap-2 py-3 border border-gray-200 bg-white text-gray-600 rounded-lg hover:bg-gray-50 transition font-medium text-sm">
                                            <FaShare /> Share
                                        </button>
                                        <button className="flex items-center justify-center gap-2 py-3 border border-gray-200 bg-white text-gray-600 rounded-lg hover:bg-gray-50 transition font-medium text-sm">
                                            <FaHeart /> Save
                                        </button>
                                    </div>
                                </div>

                                {/* Trust Badges */}
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div className="p-2">
                                        <div className="w-10 h-10 mx-auto bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-2">
                                            <FaCheckCircle />
                                        </div>
                                        <div className="text-[10px] font-bold text-gray-500 uppercase">Verified</div>
                                    </div>
                                    <div className="p-2">
                                        <div className="w-10 h-10 mx-auto bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="text-[10px] font-bold text-gray-500 uppercase">Secure</div>
                                    </div>
                                    <div className="p-2">
                                        <div className="w-10 h-10 mx-auto bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-2">
                                            <FaUserFriends />
                                        </div>
                                        <div className="text-[10px] font-bold text-gray-500 uppercase">Trusted</div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CampaignDetails;
