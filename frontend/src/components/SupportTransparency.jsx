import React from 'react';
import { FaHeart, FaShieldAlt, FaExternalLinkAlt, FaFileAlt } from 'react-icons/fa';

const SupportTransparency = () => {
    return (
        <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Support Card */}
                    <div className="bg-white p-10 rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-primary flex flex-col justify-between">
                        <div>
                            <h3 className="text-2xl font-bold text-secondary mb-4">Support Our Community</h3>
                            <p className="text-gray-500 mb-8 leading-relaxed">
                                Your contribution directly impacts lives. Every rupee donated helps provide education, healthcare, and opportunities to those who need it most.
                            </p>
                        </div>
                        <div>
                            <button className="px-8 py-3 bg-primary text-white font-bold rounded-sm hover:bg-orange-700 transition shadow-md flex items-center justify-center gap-2">
                                Donate Now <FaHeart />
                            </button>
                        </div>
                    </div>

                    {/* Transparency Card */}
                    <div className="bg-white p-10 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-green-100 text-green-700 rounded-lg">
                                    <FaShieldAlt size={20} />
                                </div>
                                <h3 className="text-xl font-bold text-secondary">Transparency Assured</h3>
                            </div>
                            <p className="text-gray-500 mb-8 leading-relaxed text-sm">
                                80G Tax Certificate available. All donations are tracked and reported transparently in our annual reports.
                            </p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <a href="#" className="flex items-center text-[#e85d04] font-bold text-sm hover:underline">
                                View Our Credentials <FaExternalLinkAlt className="ml-2 w-3 h-3" />
                            </a>
                            <a href="#" className="flex items-center text-[#e85d04] font-bold text-sm hover:underline">
                                Annual Reports <FaFileAlt className="ml-2 w-3 h-3" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SupportTransparency;
