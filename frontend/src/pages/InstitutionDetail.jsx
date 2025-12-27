import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api';
import { FaSchool, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaGlobe, FaUser, FaBuilding, FaArrowLeft, FaEdit } from 'react-icons/fa';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';

const InstitutionDetail = () => {
    const { id } = useParams();
    const [institution, setInstitution] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInstitution = async () => {
            try {
                const { data } = await API.get(`/institutions/${id}`);
                setInstitution(data);
            } catch (error) {
                console.error("Failed to fetch institution details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInstitution();
    }, [id]);

    if (loading) return <div className="p-8 text-center">Loading institution details...</div>;
    if (!institution) return <div className="p-8 text-center">Institution not found.</div>;

    return (
        <div className="min-h-screen bg-[#f3f4f6] font-sans flex flex-col">
            <AdminHeader />
            <div className="flex flex-1 overflow-hidden">
                <AdminSidebar activePage="institutions" />
                <main className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-4xl mx-auto">
                        <Link to="/admin/institutions" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-medium">
                            <FaArrowLeft /> Back to Institutions
                        </Link>

                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                            <div className="bg-[#1e2a4a] text-white p-8">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                                            <FaSchool size={40} className="text-blue-300" />
                                        </div>
                                        <div>
                                            <h1 className="text-3xl font-bold">{institution.name}</h1>
                                            <div className="flex items-center gap-3 mt-2 text-blue-200">
                                                <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-wider">{institution.type}</span>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${institution.verificationStatus === 'APPROVED' ? 'bg-green-500/20 text-green-300' : 'bg-amber-500/20 text-amber-300'}`}>
                                                    {institution.verificationStatus}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <Link to={`/admin/institutions/edit/${id}`} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition">
                                        <FaEdit /> Edit Institution
                                    </Link>
                                </div>
                            </div>

                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Contact Information */}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <FaBuilding className="text-blue-600" /> Contact Information
                                    </h3>
                                    <div className="space-y-4 bg-gray-50 rounded-xl p-6 border border-gray-100">
                                        <div className="flex items-start gap-4">
                                            <FaMapMarkerAlt className="text-gray-400 mt-1" />
                                            <div>
                                                <p className="text-xs font-bold text-gray-500 uppercase">Address</p>
                                                <p className="text-gray-800">{institution.fullAddress}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <FaPhoneAlt className="text-gray-400 mt-1" />
                                            <div>
                                                <p className="text-xs font-bold text-gray-500 uppercase">Phone</p>
                                                <p className="text-gray-800">{institution.mobileNumber}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <FaEnvelope className="text-gray-400 mt-1" />
                                            <div>
                                                <p className="text-xs font-bold text-gray-500 uppercase">Email</p>
                                                <p className="text-gray-800">{institution.email || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <FaGlobe className="text-gray-400 mt-1" />
                                            <div>
                                                <p className="text-xs font-bold text-gray-500 uppercase">Website</p>
                                                <p className="text-gray-800">{institution.website || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Administrator Information */}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <FaUser className="text-blue-600" /> Administrator Details
                                    </h3>
                                    <div className="space-y-4 bg-gray-50 rounded-xl p-6 border border-gray-100">
                                        <div className="flex items-start gap-4">
                                            <FaUser className="text-gray-400 mt-1" />
                                            <div>
                                                <p className="text-xs font-bold text-gray-500 uppercase">Admin Name</p>
                                                <p className="text-gray-800">{institution.adminName || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <FaPhoneAlt className="text-gray-400 mt-1" />
                                            <div>
                                                <p className="text-xs font-bold text-gray-500 uppercase">Admin Phone</p>
                                                <p className="text-gray-800">{institution.adminPhone || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <h3 className="text-lg font-bold text-gray-900 mb-4">Registration Documents</h3>
                                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-xs">PDF</div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-800">Registration Certificate</p>
                                                    <p className="text-xs text-gray-500">Verified on {new Date(institution.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <button className="text-blue-600 text-sm font-bold hover:underline">View</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default InstitutionDetail;
