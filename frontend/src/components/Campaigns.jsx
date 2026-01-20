import React from 'react';
import { FaCheckCircle, FaHeart, FaShare } from 'react-icons/fa';

import AnushaImg from '../assets/anusha.png'; // Reuse existing assets
import SrinivasImg from '../assets/srinivas.png';
import PadmaImg from '../assets/padma.png';

const CampaignCard = ({ title, category, raised, goal, daysLeft, supporters, image, colorBadge, onViewDetails }) => {
    const percentage = Math.min((parseInt(raised.replace(/,/g, '')) / parseInt(goal.replace(/,/g, ''))) * 100, 100);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
            <div className="h-48 overflow-hidden relative shrink-0">
                <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                <div className={`absolute top-4 left-4 text-[10px] font-bold uppercase py-1 px-3 bg-white ${colorBadge} rounded-full flex items-center gap-1 shadow-sm`}>
                    {category}
                </div>
            </div>
            <div className="p-5 flex flex-col flex-1">
                <h3 className="font-bold text-[#1e2a4a] text-lg mb-1 leading-tight line-clamp-2">{title}</h3>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                    <span className="flex items-center gap-1 text-green-600"><FaCheckCircle size={10} /> Verified</span>
                    <span>•</span>
                    <span>{supporters} supporters</span>
                </div>

                <div className="mb-4 mt-auto">
                    <div className="flex justify-between text-xs font-bold mb-2">
                        <span className="text-[#1e2a4a]">₹{raised}</span>
                        <span className="text-gray-400">Target: ₹{goal}</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#3b82f6]" style={{ width: `${percentage}%` }}></div>
                    </div>
                </div>

                <div className="flex items-center gap-2 mt-2">
                    <button
                        onClick={onViewDetails}
                        className="flex-1 bg-[#1e2a4a] text-white py-2 rounded text-xs font-bold uppercase hover:bg-opacity-90 transition active:scale-95"
                    >
                        View Details
                    </button>
                    <button className="px-3 py-2 border border-gray-200 text-gray-500 rounded hover:bg-gray-50 transition">
                        <FaShare size={14} />
                    </button>
                    <button className="px-3 py-2 border border-gray-200 text-gray-500 rounded hover:bg-gray-50 transition">
                        <FaHeart size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

const CAMPAIGNS_DATA = [
    {
        id: 1,
        title: "Books & Fees for Priya's Engineering",
        category: "Education Support",
        raised: "75,000",
        goal: "1,20,000",
        supporters: "142",
        image: AnushaImg,
        colorBadge: "text-blue-600",
        description: "Priya is a brilliant student who has secured admission in a top engineering college but struggles to pay the tuition fees. Help her achieve her dreams."
    },
    {
        id: 2,
        title: "Urgent: Heart Surgery Fund",
        category: "Medical Emergency",
        raised: "3,40,000",
        goal: "5,00,000",
        supporters: "890",
        image: SrinivasImg,
        colorBadge: "text-red-500",
        description: "A 45-year-old father of three needs urgent heart surgery. The family has exhausted their savings and needs community support to save his life."
    },
    {
        id: 3,
        title: "Flood Relief for 50 Families",
        category: "Disaster Relief",
        raised: "2,10,000",
        goal: "5,00,000",
        supporters: "465",
        image: PadmaImg,
        colorBadge: "text-orange-500",
        description: "Recent floods have devastated 50 families in our neighboring village. We are collecting funds for food, shelter, and basic necessities."
    }
];

const CampaignModal = ({ campaign, onClose }) => {
    if (!campaign) return null;

    const percentage = Math.min((parseInt(campaign.raised.replace(/,/g, '')) / parseInt(campaign.goal.replace(/,/g, ''))) * 100, 100);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden relative animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/20 text-white hover:bg-black/40 transition"
                >
                    ✕
                </button>

                <div className="relative h-64">
                    <img src={campaign.image} alt={campaign.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                        <div className="p-6 text-white">
                            <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 bg-white/20 backdrop-blur-md rounded ${campaign.colorBadge.replace('text-', 'text-white ')}`}>
                                {campaign.category}
                            </span>
                            <h2 className="text-3xl font-bold mt-2">{campaign.title}</h2>
                        </div>
                    </div>
                </div>

                <div className="p-6 md:p-8">
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                        <span className="flex items-center gap-1 text-green-600 font-medium"><FaCheckCircle /> Verified Fundraiser</span>
                        <span>•</span>
                        <span>{campaign.supporters} supporters</span>
                    </div>

                    <p className="text-gray-700 leading-relaxed mb-8 text-lg">
                        {campaign.description}
                        <br /><br />
                        Your contribution, no matter how small, can make a significant difference. Join us in supporting this cause.
                    </p>

                    <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-100">
                        <div className="flex justify-between items-end mb-2">
                            <div>
                                <span className="text-2xl font-bold text-[#1e2a4a]">₹{campaign.raised}</span>
                                <span className="text-sm text-gray-500 ml-1">raised of ₹{campaign.goal}</span>
                            </div>
                            <span className="text-blue-600 font-bold">{Math.round(percentage)}%</span>
                        </div>
                        <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600 rounded-full" style={{ width: `${percentage}%` }}></div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button className="flex-1 bg-[#1e2a4a] text-white py-4 rounded-lg font-bold text-lg hover:bg-opacity-90 transition shadow-lg shadow-blue-900/20">
                            Donate Now
                        </button>
                        <button className="px-6 py-4 border border-gray-200 text-gray-600 font-semibold rounded-lg hover:bg-gray-50 transition flex items-center gap-2">
                            <FaShare /> Share
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Campaigns = () => {
    const [selectedCampaign, setSelectedCampaign] = React.useState(null);

    return (
        <section className="py-16 bg-white relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-2 text-red-500 mb-2">
                        <FaHeart /> <span className="text-sm font-bold uppercase tracking-widest text-[#1e2a4a]">Together We Rise</span>
                    </div>
                    <h2 className="text-3xl font-bold text-[#1e2a4a] mb-2">Community Support Hub</h2>
                    <p className="text-gray-500 text-sm">Help Your Neighbors, Build Your Community</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {CAMPAIGNS_DATA.map((campaign) => (
                        <CampaignCard
                            key={campaign.id}
                            {...campaign}
                            onViewDetails={() => setSelectedCampaign(campaign)}
                        />
                    ))}
                </div>
            </div>

            {selectedCampaign && (
                <CampaignModal
                    campaign={selectedCampaign}
                    onClose={() => setSelectedCampaign(null)}
                />
            )}
        </section>
    );
};

export default Campaigns;
