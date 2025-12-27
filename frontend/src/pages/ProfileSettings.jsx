import React, { useState } from 'react';
import {
    FaCamera, FaEdit, FaCheckCircle, FaSave, FaTimes, FaArrowLeft
} from 'react-icons/fa';
import LivePhotoCapture from '../components/LivePhotoCapture';

const InputField = ({ label, value, type = "text", verified }) => (
    <div className="flex-1 min-w-[300px]">
        <label className="block text-xs font-bold text-gray-700 mb-1.5">
            {label}
            {verified && <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] rounded-full">Verified</span>}
        </label>
        <div className="relative">
            <input
                type={type}
                defaultValue={value}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white"
            />
            <button className="absolute right-3 top-3 text-gray-400 hover:text-primary">
                <FaEdit size={12} />
            </button>
        </div>
    </div>
);

const SelectField = ({ label, options, value }) => (
    <div className="flex-1 min-w-[300px]">
        <label className="block text-xs font-bold text-gray-700 mb-1.5">{label}</label>
        <div className="relative">
            <select
                defaultValue={value}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white appearance-none"
            >
                {options.map(opt => <option key={opt}>{opt}</option>)}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
        </div>
    </div>
);

const ProfileSettings = () => {
    const [activeTab, setActiveTab] = useState('Personal Info');
    const [showCamera, setShowCamera] = useState(false);
    const [profileImage, setProfileImage] = useState("/assets/images/user-profile.png");

    const handlePhotoCapture = (imgSrc) => {
        if (imgSrc) {
            setProfileImage(imgSrc);
            // In real app, close modal after brief success or let user review
        }
    };

    return (
        <div className="w-full space-y-6 pb-12 relative">

            {/* Camera Overlay */}
            {showCamera && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg text-gray-800">Update Profile Photo</h3>
                            <button onClick={() => setShowCamera(false)} className="text-gray-500 hover:text-red-500">
                                <FaTimes size={20} />
                            </button>
                        </div>
                        <LivePhotoCapture
                            isRequired={false}
                            onCapture={handlePhotoCapture}
                            onUpload={(file) => {
                                // Simulate upload read
                                const reader = new FileReader();
                                reader.onloadend = () => setProfileImage(reader.result);
                                reader.readAsDataURL(file);
                            }}
                        />
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={() => setShowCamera(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Profile Header Card */}
            <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-8">
                <div className="relative">
                    <div className="w-32 h-32 rounded-full p-1 border-2 border-dashed border-gray-300 overflow-hidden">
                        <img
                            src={profileImage}
                            alt="Profile"
                            className="w-full h-full object-cover rounded-full bg-gray-50"
                        />
                    </div>
                    <button
                        onClick={() => setShowCamera(true)}
                        className="absolute bottom-1 right-1 w-8 h-8 bg-[#1e2a4a] text-white rounded-full flex items-center justify-center border-2 border-white shadow-sm hover:bg-[#2a3b66] transition"
                        title="Change Photo"
                    >
                        <FaCamera size={12} />
                    </button>
                </div>

                <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-col md:flex-row items-center gap-4 mb-2">
                        <h1 className="text-2xl font-bold text-gray-900">Rajesh Kumar</h1>
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-200 flex items-center gap-1">
                            <FaCheckCircle size={10} /> KYC Verified
                        </span>
                    </div>
                    <div className="flex flex-wrap justify-center md:justify-start gap-x-8 gap-y-2 text-sm text-gray-500 mb-6">
                        <div>
                            <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wide">Member ID</span>
                            <span className="font-bold text-gray-800">MEWS-2024-7892</span>
                        </div>
                        <div>
                            <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wide">Member Since</span>
                            <span className="font-bold text-gray-800">March 15, 2024</span>
                        </div>
                    </div>
                    <button className="px-4 py-2 bg-[#1e2a4a] text-white text-sm font-bold rounded-lg hover:bg-[#2a3b66] transition flex items-center gap-2 mx-auto md:mx-0 shadow-sm">
                        <FaEdit /> Edit Profile
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm px-2 overflow-x-auto">
                <div className="flex gap-6 min-w-max">
                    {['Personal Info', 'Family Members', 'Security', 'Notifications', 'Privacy & Data'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`py-4 px-2 text-sm font-bold border-b-2 transition-colors ${activeTab === tab
                                ? 'text-[#1e2a4a] border-[#1e2a4a]'
                                : 'text-gray-500 border-transparent hover:text-gray-800'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Form Section */}
            <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">

                <div className="space-y-8">
                    {/* Basic Info */}
                    <div className="flex flex-wrap gap-6">
                        <InputField label="Full Name" value="Rajesh Kumar" />
                        <InputField label="Email Address" value="rajesh.kumar@email.com" />
                    </div>

                    <div className="flex flex-wrap gap-6">
                        <InputField label="Mobile Number" value="+91 9876543210" verified={true} />
                        <InputField label="Date of Birth" value="1985-08-15" type="date" />
                    </div>

                    <div className="flex flex-wrap gap-6">
                        <SelectField label="Gender" options={['Male', 'Female', 'Other']} value="Male" />
                        <div className="flex-1 min-w-[300px]"></div> {/* Spacer */}
                    </div>

                    <div className="border-t border-gray-100 pt-8">
                        <h3 className="font-bold text-gray-900 mb-6">Address Information</h3>

                        <div className="flex flex-wrap gap-6 mb-6">
                            <SelectField label="District" options={['Bangalore Urban', 'Mysore', 'Hubli']} value="Bangalore Urban" />
                            <SelectField label="Mandal" options={['Bangalore South', 'North', 'East']} value="Bangalore South" />
                            <SelectField label="Village" options={['BTM Layout', 'Koramangala', 'HSR Layout']} value="BTM Layout" />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">Full Address</label>
                            <textarea
                                rows="3"
                                defaultValue="No. 123, 2nd Cross, BTM Layout 1st Stage, Bangalore - 560029, Karnataka, India"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white resize-none"
                            ></textarea>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 mt-8 pt-8 border-t border-gray-100">
                    <button className="px-6 py-2.5 bg-[#1e2a4a] text-white text-sm font-bold rounded-lg hover:bg-[#2a3b66] transition shadow-md flex items-center gap-2">
                        <FaSave /> Save Changes
                    </button>
                    <button className="px-6 py-2.5 bg-white border border-gray-300 text-gray-600 text-sm font-bold rounded-lg hover:bg-gray-50 transition flex items-center gap-2">
                        <FaTimes /> Cancel
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ProfileSettings;
