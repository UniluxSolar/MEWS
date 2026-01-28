import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../api';
import { FaArrowLeft, FaSave, FaBuilding } from 'react-icons/fa';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';

const EditInstitution = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        fullAddress: '',
        mobileNumber: '',
        email: '',
        website: '',
        adminName: '',
        adminPhone: ''
    });

    useEffect(() => {
        const fetchInstitution = async () => {
            try {
                const { data } = await API.get(`/institutions/${id}`);
                setFormData({
                    name: data.name || '',
                    type: data.type || '',
                    fullAddress: data.fullAddress || '',
                    mobileNumber: data.mobileNumber || '',
                    email: data.email || '',
                    website: data.website || '',
                    adminName: data.adminName || '',
                    adminPhone: data.adminPhone || ''
                });
            } catch (error) {
                console.error("Failed to fetch institution for editing", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInstitution();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.put(`/institutions/${id}`, formData);
            alert("Institution updated successfully!");
            navigate(`/admin/institutions/${id}`);
        } catch (error) {
            console.error("Failed to update institution", error);
            alert("Failed to update. Please try again.");
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-[#f3f4f6] font-sans flex flex-col">
            <AdminHeader />
            <div className="flex flex-1 overflow-hidden">
                <AdminSidebar activePage="institutions" />
                <main className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-3xl mx-auto">
                        <Link to={`/admin/institutions/${id}`} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-medium">
                            <FaArrowLeft /> Cancel & Go Back
                        </Link>

                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                            <div className="bg-[#1e2a4a] text-white p-6 flex justify-between items-center">
                                <h1 className="text-xl font-bold flex items-center gap-3">
                                    <FaBuilding className="text-blue-300" /> Edit Institution
                                </h1>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Institution Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Type</label>
                                        <select
                                            name="type"
                                            value={formData.type}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                            required
                                        >
                                            <option value="">Select Type</option>
                                            <option value="Bank">Bank</option>
                                            <option value="College">College</option>
                                            <option value="Hospital">Hospital</option>
                                            <option value="Other">Other</option>
                                            <option value="School">School</option>
                                            <option value="Temple">Temple</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Full Address</label>
                                        <textarea
                                            name="fullAddress"
                                            value={formData.fullAddress}
                                            onChange={handleChange}
                                            rows="3"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                            required
                                        ></textarea>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Official Mobile Number</label>
                                        <input
                                            type="text"
                                            name="mobileNumber"
                                            value={formData.mobileNumber}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Official Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Website</label>
                                        <input
                                            type="text"
                                            name="website"
                                            value={formData.website}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                        />
                                    </div>

                                    <div className="md:col-span-2 border-t border-gray-100 pt-4 mt-2">
                                        <h3 className="font-bold text-gray-900 mb-4">Administrator Info</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Admin Name</label>
                                                <input
                                                    type="text"
                                                    name="adminName"
                                                    value={formData.adminName}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Admin Phone</label>
                                                <input
                                                    type="text"
                                                    name="adminPhone"
                                                    value={formData.adminPhone}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-6">
                                    <button
                                        type="submit"
                                        className="bg-[#1e2a4a] hover:bg-[#2a3b66] text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg transition"
                                    >
                                        <FaSave /> Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default EditInstitution;
