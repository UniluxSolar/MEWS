import React from 'react';
import { FaUsers, FaMoneyBillWave, FaBuilding } from 'react-icons/fa';

const StatItem = ({ icon: Icon, value, label, subtext, color }) => (
    <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
        <div className={`w-16 h-16 mx-auto rounded-lg ${color} flex items-center justify-center text-white mb-6`}>
            <Icon size={28} />
        </div>
        <div className="text-4xl font-extrabold text-secondary mb-2">{value}</div>
        <div className="text-lg font-bold text-primary mb-1">{label}</div>
        <p className="text-sm text-gray-500 leading-relaxed px-4">{subtext}</p>
    </div>
);

const ImpactStats = () => {
    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-extrabold text-primary mb-4 text-center">Our Impact</h2>
                    <p className="text-gray-500 text-lg">Transforming lives across communities</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <StatItem
                        icon={FaUsers}
                        value="4,82,000+"
                        label="Members"
                        subtext="Active community members across India receiving support and services"
                        color="bg-secondary"
                    />
                    <StatItem
                        icon={FaMoneyBillWave}
                        value="₹92 Cr+"
                        label="Aid Disbursed"
                        subtext="Financial assistance provided for education, health, and welfare"
                        color="bg-primary"
                    />
                    <StatItem
                        icon={FaBuilding}
                        value="1,400+"
                        label="Partner Institutions"
                        subtext="Educational institutions, hospitals, and organizations in our network"
                        color="bg-[#10b981]" // Green shade for variety
                    />
                </div>
            </div>
        </section >
    );
};

export default ImpactStats;
