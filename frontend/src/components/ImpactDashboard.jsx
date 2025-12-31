import React from 'react';
import { FaGraduationCap, FaHeartbeat, FaBalanceScale, FaBriefcase, FaChartLine, FaLayerGroup } from 'react-icons/fa';

const StatCard = ({ icon: Icon, title, color, stats, borderColor }) => (
    <div className={`bg-white rounded-xl shadow-sm border-t-4 ${borderColor} p-6 h-full flex flex-col`}>
        <div className="flex items-center gap-3 mb-6">
            <div className={`w-10 h-10 rounded-full ${color} text-white flex items-center justify-center`}>
                <Icon size={18} />
            </div>
            <h3 className="font-bold text-[#1e2a4a] text-lg">{title}</h3>
        </div>

        <div className="space-y-6 flex-grow">
            {stats.map((stat, idx) => (
                <div key={idx}>
                    <div className="text-2xl font-bold text-[#1e2a4a]">{stat.value}</div>
                    <div className="text-sm font-bold text-gray-700">{stat.label}</div>
                    <div className="text-xs text-gray-400 mt-1">{stat.sub}</div>
                </div>
            ))}
        </div>

    </div>
);

const ImpactDashboard = () => {
    const educationStats = [
        { value: "32 Schools", label: "Up to 10th Class", sub: "110 Members" },
        { value: "11 Colleges", label: "Intermediate", sub: "150 Members" },
        { value: "23 Colleges", label: "Graduate", sub: "120 Members" },
        { value: "11 Colleges", label: "Post Graduate", sub: "120 Members" }
    ];

    const healthStats = [
        { value: "768", label: "Hospitals", sub: "121 Net response | 90% success" },
        { value: "1200", label: "Diagnostic Centers", sub: "156 villages served" },
        { value: "123", label: "Medical Shops", sub: "92% followup rate" },
        { value: "23,456", label: "Telemedicine", sub: "Mental Health included" }
    ];

    const legalStats = [
        { value: "3,456", label: "Cases Resolved", sub: "1,100 + 4,967 Members" },
        { value: "1200", label: "Revenue", sub: "100 villages served" },
        { value: "45,678", label: "Civil", sub: "Property & legal docs" },
        { value: "Service Matters", label: "100% CM Support coverage", sub: "" }
    ];

    const jobStats = [
        { value: "8,945", label: "Job Placements", sub: "89% post training success" },
        { value: "15,678", label: "Skill Training", sub: "Technical + soft skills" },
        { value: "156", label: "Job Melas", sub: "45,678 openings created" },
        { value: "3,456", label: "Entrepreneurship", sub: "87% business survival rate" }
    ];

    const welfareStats = [
        { value: "67,890", label: "Community Services", sub: "Applications processed" },
        { value: "234", label: "Matrimonial Services", sub: "Community development" },
        { value: "45,678", label: "Daily Beneficiaries", sub: "Social program meals" },
        { value: "89", label: "Model Villages", sub: "Across 4 districts" }
    ];

    return (
        <section className="bg-gray-50 py-8 relative z-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-3 text-[#1e2a4a] mb-3">
                        <FaChartLine className="text-[#3b82f6] text-2xl" />
                        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Community Impact Dashboard</h2>
                    </div>
                    <p className="text-gray-500 text-sm">Real-time metrics showing our collective progress</p>
                    <div className="w-16 h-1 bg-[#1e2a4a] mx-auto mt-4 rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    <StatCard
                        icon={FaGraduationCap}
                        title="Education"
                        color="bg-blue-500"
                        borderColor="border-t-blue-500"
                        stats={educationStats}
                    />

                    <StatCard
                        icon={FaHeartbeat}
                        title="Health"
                        color="bg-red-500"
                        borderColor="border-t-red-500"
                        stats={healthStats}
                    />

                    <StatCard
                        icon={FaBalanceScale}
                        title="Legal Aid"
                        color="bg-green-600"
                        borderColor="border-t-green-600"
                        stats={legalStats}
                    />

                    <StatCard
                        icon={FaBriefcase}
                        title="Employment"
                        color="bg-yellow-500"
                        borderColor="border-t-yellow-500"
                        stats={jobStats}
                    />

                    <StatCard
                        icon={FaLayerGroup}
                        title="Welfare"
                        color="bg-purple-600"
                        borderColor="border-t-purple-600"
                        stats={welfareStats}
                    />

                </div>
            </div>
        </section>
    );
};

export default ImpactDashboard;
