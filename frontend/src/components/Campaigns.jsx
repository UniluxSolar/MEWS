import React from 'react';
import { FaCheckCircle, FaHeart, FaShare } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

import AnushaImg from '../assets/anusha.png'; // Reuse existing assets
import SrinivasImg from '../assets/srinivas.png';
import PadmaImg from '../assets/padma.png';

const CampaignCard = ({ campaign }) => {
    const { id, title, category, raised, goal, supporters, image, colorBadge } = campaign;
    const percentage = Math.min((parseInt(raised.replace(/,/g, '')) / parseInt(goal.replace(/,/g, ''))) * 100, 100);
    const navigate = useNavigate();

    const handleViewDetails = () => {
        navigate(`/campaigns/${id}`, { state: { campaign } });
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-48 overflow-hidden relative">
                <img src={image} alt={title} className="w-full h-full object-cover" />
                <div className={`absolute top-4 left-4 text-[10px] font-bold uppercase py-1 px-3 bg-white ${colorBadge} rounded-full flex items-center gap-1`}>
                    {category}
                </div>
            </div>
            <div className="p-5">
                <h3 className="font-bold text-[#1e2a4a] text-lg mb-1 leading-tight">{title}</h3>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                    <span className="flex items-center gap-1 text-green-600"><FaCheckCircle size={10} /> Verified</span>
                    <span>•</span>
                    <span>{supporters} supporters</span>
                </div>

                <div className="mb-4">
                    <div className="flex justify-between text-xs font-bold mb-2">
                        <span className="text-[#1e2a4a]">₹{raised}</span>
                        <span className="text-gray-400">Target: ₹{goal}</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#3b82f6]" style={{ width: `${percentage}%` }}></div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleViewDetails}
                        className="flex-1 bg-[#1e2a4a] text-white py-2 rounded text-xs font-bold uppercase hover:bg-opacity-90 transition"
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

const Campaigns = () => {
    const campaigns = [
        {
            id: 1,
            title: "Books & Fees for Priya's Engineering",
            category: "Education Support",
            raised: "75,000",
            goal: "1,20,000",
            supporters: "142",
            daysLeft: "15",
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
            daysLeft: "3",
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
            daysLeft: "12",
            image: PadmaImg,
            colorBadge: "text-orange-500",
            description: "Recent floods have devastated 50 families in our neighboring village. We are collecting funds for food, shelter, and basic necessities."
        }
    ];

    return (
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-2 text-red-500 mb-2">
                        <FaHeart /> <span className="text-sm font-bold uppercase tracking-widest text-[#1e2a4a]">Together We Rise</span>
                    </div>
                    <h2 className="text-3xl font-bold text-[#1e2a4a] mb-2">Community Support Hub</h2>
                    <p className="text-gray-500 text-sm">Help Your Neighbors, Build Your Community</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {campaigns.map((campaign) => (
                        <CampaignCard key={campaign.id} campaign={campaign} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Campaigns;
