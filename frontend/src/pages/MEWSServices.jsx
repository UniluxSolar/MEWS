import React from 'react';
import {
    FaGraduationCap, FaHeartbeat, FaBalanceScale, FaBriefcase, FaHandHoldingHeart,
    FaSchool, FaUniversity, FaHospital, FaClinicMedical, FaPills, FaLaptopMedical,
    FaGavel, FaFileContract, FaUserTie, FaChalkboardTeacher, FaBuilding, FaUsers,
    FaRing, FaUtensils, FaHome, FaArrowLeft
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

const ServiceCard = ({ title, icon: Icon, color, bg, mainStat, subItems }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
        {/* Header */}
        <div className={`p-4 flex items-center gap-3 border-b border-gray-100 ${bg}`}>
            <div className={`w-10 h-10 rounded-full bg-white flex items-center justify-center ${color} shadow-sm`}>
                <Icon size={18} />
            </div>
            <h3 className="font-bold text-gray-800 text-lg">{title}</h3>
        </div>

        <div className="p-6 flex-1 flex flex-col">
            {/* Main Main Stat */}
            <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-900">{mainStat.value}</h2>
                <p className={`font-bold text-sm ${color}`}>{mainStat.label}</p>
                <p className="text-xs text-gray-400 mt-1">{mainStat.sub}</p>
            </div>

            {/* Sub Items */}
            <div className="space-y-5 mt-auto">
                {subItems.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                        {/* <div className={`mt-1 text-gray-300`}>•</div> */}
                        <div>
                            <div className="text-xl font-bold text-gray-800 leading-none">{item.value}</div>
                            <div className="text-sm font-bold text-gray-600 mt-0.5">{item.label}</div>
                            <div className="text-xs text-gray-400">{item.desc}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Footer Stripe */}
        <div className={`h-1.5 w-full bg-gradient-to-r ${color.replace('text-', 'from-').replace('600', '400')} to-white/0`}></div>
    </div>
);

const MEWSServices = () => {
    const [filter, setFilter] = React.useState('OverAll');

    const services = [
        {
            title: "Education",
            icon: FaGraduationCap,
            color: "text-blue-600",
            bg: "bg-blue-50",
            mainStat: { value: "32 Schools", label: "Up to 10th Class", sub: "110 Members" },
            subItems: [
                { value: "11 Colleges", label: "Intermediate", desc: "150 Members" },
                { value: "23 Colleges", label: "Graduate", desc: "120 Members" },
                { value: "11 Colleges", label: "Post Graduate", desc: "120 Members" }
            ]
        },
        {
            title: "Health",
            icon: FaHeartbeat,
            color: "text-red-500",
            bg: "bg-red-50",
            mainStat: { value: "768", label: "Hospitals", sub: "121 Net response | 90% success" },
            subItems: [
                { value: "1200", label: "Diagnostic Centers", desc: "156 villages served" },
                { value: "123", label: "Medical Shops", desc: "92% followup rate" },
                { value: "23,456", label: "Telemedicine", desc: "Mental Health included" }
            ]
        },
        {
            title: "Legal Aid",
            icon: FaBalanceScale,
            color: "text-green-600",
            bg: "bg-green-50",
            mainStat: { value: "3,456", label: "Cases Resolved", sub: "1,100 + 4,967 Members" },
            subItems: [
                { value: "1200", label: "Revenue", desc: "100 villages served" },
                { value: "45,678", label: "Civil", desc: "Property & legal docs" },
                { value: "Service Matters", label: "100% CM Support", desc: "coverage" }
            ]
        },
        {
            title: "Employment",
            icon: FaBriefcase,
            color: "text-yellow-600",
            bg: "bg-yellow-50",
            mainStat: { value: "8,945", label: "Job Placements", sub: "89% post training success" },
            subItems: [
                { value: "15,678", label: "Skill Training", desc: "Technical + soft skills" },
                { value: "156", label: "Job Melas", desc: "45,678 openings created" },
                { value: "3,456", label: "Entrepreneurship", desc: "87% business survival rate" }
            ]
        },
        {
            title: "Welfare",
            icon: FaHandHoldingHeart,
            color: "text-purple-600",
            bg: "bg-purple-50",
            mainStat: { value: "67,890", label: "Community Services", sub: "Applications processed" },
            subItems: [
                { value: "234", label: "Matrimonial Services", desc: "Community development" },
                { value: "45,678", label: "Daily Beneficiaries", desc: "Social program meals" },
                { value: "89", label: "Model Villages", desc: "Across 4 districts" }
            ]
        }
    ];

    return (
        <div className="w-full space-y-8">
            {/* Back Button */}
            <div className="">
                <Link to="/dashboard" className="text-secondary hover:text-amber-600 flex items-center gap-2 text-sm font-bold transition-all w-fit">
                    <FaArrowLeft size={12} /> Back to Dashboard
                </Link>
            </div>

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-[#1e2a4a]">MEWS Services Overview</h1>
                    <p className="text-gray-500 text-sm mt-1">Real-time impact metrics and service distribution across our network.</p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Filter Dropdown */}
                    <div className="relative">
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 pl-4 pr-10 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1e2a4a] focus:border-[#1e2a4a] text-sm font-bold cursor-pointer hover:border-gray-400 transition"
                        >
                            <option value="OverAll">OverAll Impact</option>
                            <option value="State">State Level</option>
                            <option value="Mandal">Mandal Level</option>
                            <option value="Village">Village Level</option>
                            <option value="Self">Self (My Contribution)</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                        </div>
                    </div>

                    <span className="bg-white border border-gray-200 text-gray-500 px-3 py-2 rounded-lg text-xs font-semibold shadow-sm hidden sm:block">
                        Updated: Today, 09:00 AM
                    </span>
                </div>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {services.map((service, index) => (
                    <ServiceCard key={index} {...service} />
                ))}
            </div>

            {/* Bottom info note */}
            <div className="text-center text-xs text-gray-400 mt-12">
                * Data represents cumulative impact metrics since inception. Updated daily.
            </div>
        </div>
    );
};

export default MEWSServices;
