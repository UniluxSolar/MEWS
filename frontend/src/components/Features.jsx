import React from 'react';
import { HiUserGroup, HiHeart, HiAcademicCap, HiOfficeBuilding } from 'react-icons/hi';

const features = [
    {
        name: 'Community Network',
        description: 'Connect with a vast network of community members, creating a strong support system for everyone.',
        icon: HiUserGroup,
    },
    {
        name: 'Financial Support',
        description: 'Access funds for medical emergencies, education, and other critical needs through our welfare programs.',
        icon: HiHeart,
    },
    {
        name: 'Institutional Benefits',
        description: 'Get exclusive discounts and priority services at partner hospitals, schools, and businesses.',
        icon: HiOfficeBuilding,
    },
    {
        name: 'Educational Aid',
        description: 'Scholarships and guidance for students to help build a brighter future for the next generation.',
        icon: HiAcademicCap,
    },
];

const Features = () => {
    return (
        <div className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Why Join MEWS?</h2>
                    <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                        A Better Way to Grow Together
                    </p>
                    <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
                        We provide a comprehensive platform to support every member of our community through various initiatives.
                    </p>
                </div>

                <div className="mt-12">
                    <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
                        {features.map((feature) => (
                            <div key={feature.name} className="relative bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition duration-300">
                                <dt>
                                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                                        <feature.icon className="h-6 w-6" aria-hidden="true" />
                                    </div>
                                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{feature.name}</p>
                                </dt>
                                <dd className="mt-2 ml-16 text-base text-gray-500">
                                    {feature.description}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </div>
        </div>
    );
};

export default Features;
