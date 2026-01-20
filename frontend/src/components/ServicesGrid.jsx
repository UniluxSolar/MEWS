import React from 'react';
import { FaGraduationCap, FaHeartbeat, FaBalanceScale, FaBriefcase, FaArrowRight } from 'react-icons/fa';

const ServiceCard = ({ icon: Icon, title, description, color }) => (
    <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow duration-300">
        <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center text-white mb-6`}>
            <Icon size={20} />
        </div>
        <h3 className="text-xl font-bold text-primary mb-3">{title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">
            {description}
        </p>
        <a href="#" className="inline-flex items-center text-primary font-bold text-sm hover:text-orange-700 transition">
            Learn More <FaArrowRight className="ml-2 w-3 h-3" />
        </a>
    </div>
);

const ServicesGrid = () => {
    return (
        <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-extrabold text-primary mb-4">Empowerment Services</h2>
                    <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                        Comprehensive support services for community development
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    <ServiceCard
                        icon={FaGraduationCap}
                        title="Education Support"
                        description="Scholarships, coaching classes, and educational resources to help students achieve their academic goals and build successful careers."
                        color="bg-secondary"
                    />
                    <ServiceCard
                        icon={FaHeartbeat}
                        title="Health Assistance"
                        description="Medical aid, health insurance support, and access to quality healthcare services for individuals and families in need."
                        color="bg-[#10b981]"
                    />
                    <ServiceCard
                        icon={FaBalanceScale}
                        title="Legal Aid"
                        description="Free legal consultation, documentation support, and advocacy services to protect rights and resolve legal matters."
                        color="bg-[#3b82f6]" // Blue
                    />
                    <ServiceCard
                        icon={FaBriefcase}
                        title="Jobs & Events"
                        description="Employment opportunities, skill development programs, and community events to foster professional and personal growth."
                        color="bg-primary"
                    />
                </div>
            </div>
        </section>
    );
};

export default ServicesGrid;
