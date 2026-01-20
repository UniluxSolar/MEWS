import React from 'react';
import { FaUserPlus, FaUsers, FaHandHoldingHeart, FaChartBar, FaCheckCircle, FaShieldAlt, FaEye } from 'react-icons/fa';

const Step = ({ number, icon: Icon, title, desc }) => (
    <div className="flex flex-col items-center text-center relative z-10">
        <div className="w-16 h-16 bg-[#1e2a4a] rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg border-4 border-white">
            {number}
        </div>
        <div className="text-blue-900 h-10 w-10 flex items-center justify-center mb-2">
            <Icon size={24} />
        </div>
        <h4 className="font-bold text-gray-900 mb-1">{title}</h4>
        <p className="text-sm text-gray-500 max-w-xs">{desc}</p>
    </div>
);

const Feature = ({ icon: Icon, title, desc }) => (
    <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-xl">
        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
            <Icon size={20} />
        </div>
        <h4 className="font-bold text-gray-900 mb-1">{title}</h4>
        <p className="text-xs text-gray-500">{desc}</p>
    </div>
);

const HowItWorks = () => {
    return (
        <section className="py-16 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h3 className="text-2xl font-bold text-gray-900 mb-12">How Community Funding Works</h3>

                    <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8">
                        {/* Connecting Line */}
                        <div className="hidden md:block absolute top-8 left-0 w-full h-1 bg-gray-200 -z-0"></div>

                        <Step number="1" icon={FaUserPlus} title="Submit Request" desc="Upload documents, photos, verification details" />
                        <Step number="2" icon={FaUsers} title="Community Review" desc="Village admin verification, community votes" />
                        <Step number="3" icon={FaHandHoldingHeart} title="Fundraise Together" desc="Share via WhatsApp, receive donations" />
                        <Step number="4" icon={FaChartBar} title="Track Progress" desc="Real-time updates, trans-divison" />
                    </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-8 md:p-12">
                    <h3 className="text-xl font-bold text-center text-gray-900 mb-8">Trust and Security Features</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <Feature icon={FaCheckCircle} title="100% Verified" desc="All campaigns verified by village admins" />
                        <Feature icon={FaShieldAlt} title="Direct Transfer" desc="Funds go directly to beneficiary/vendor" />
                        <Feature icon={FaEye} title="Full Transparency" desc="Every donation tracked, receipts provided" />
                        <Feature icon={FaUsers} title="Community Oversight" desc="Village admin monitors all campaigns" />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
