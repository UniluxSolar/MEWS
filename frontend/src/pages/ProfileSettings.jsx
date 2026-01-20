import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    FaCamera, FaEdit, FaCheckCircle, FaSave, FaTimes, FaArrowLeft, FaFileAlt, FaIdCard, FaPrint
} from 'react-icons/fa';
import LivePhotoCapture from '../components/LivePhotoCapture';
import { MemberDocument } from './MemberDocument';
import MemberIDCard from '../components/MemberIDCard';
import ReactDOM from 'react-dom';

const PrintPortal = ({ children }) => {
    const [container] = useState(() => {
        const el = document.createElement('div');
        el.id = 'print-mount-root';
        return el;
    });

    useEffect(() => {
        document.body.appendChild(container);
        return () => {
            document.body.removeChild(container);
        }
    }, [container]);

    return ReactDOM.createPortal(children, container);
};

const InputField = ({ label, name, value, onChange, type = "text", verified, disabled }) => (
    <div className="flex-1 min-w-[300px]">
        <label className="block text-xs font-bold text-gray-700 mb-1.5">
            {label}
            {verified && <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] rounded-full">Verified</span>}
        </label>
        <div className="relative">
            <input
                type={type}
                name={name}
                value={value || ''}
                onChange={onChange}
                disabled={disabled}
                className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white ${disabled ? 'bg-gray-100 text-gray-500' : ''}`}
            />
            {!disabled && (
                <button className="absolute right-3 top-3 text-gray-400 hover:text-primary">
                    <FaEdit size={12} />
                </button>
            )}
        </div>
    </div>
);

const SelectField = ({ label, name, options, value, onChange }) => (
    <div className="flex-1 min-w-[300px]">
        <label className="block text-xs font-bold text-gray-700 mb-1.5">{label}</label>
        <div className="relative">
            <select
                name={name}
                value={value || ''}
                onChange={onChange}
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

const PersonalInfoTab = ({ formData, handleChange }) => (
    <div className="space-y-8 animate-fadeIn">
        {/* Basic Info */}
        <div className="flex flex-wrap gap-6">
            <InputField label="Name" name="name" value={formData.name} onChange={handleChange} disabled={true} />
            <InputField label="Surname" name="surname" value={formData.surname} onChange={handleChange} disabled={true} />
        </div>

        <div className="flex flex-wrap gap-6">
            <InputField label="Email Address" name="email" value={formData.email} onChange={handleChange} />
            <InputField label="Mobile Number" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} verified={true} disabled={true} />
        </div>

        <div className="flex flex-wrap gap-6">
            <InputField label="Date of Birth" name="dob" value={formData.dob} onChange={handleChange} type="date" />
            <SelectField label="Gender" name="gender" options={['Male', 'Female', 'Other']} value={formData.gender} onChange={handleChange} />
        </div>

        <div className="border-t border-gray-100 pt-8">
            <h3 className="font-bold text-gray-900 mb-6">Address Information</h3>

            <div className="flex flex-wrap gap-6 mb-6">
                <InputField label="State" name="address.state" value={formData.address?.state} onChange={handleChange} disabled={true} />
                <InputField label="District" name="address.district" value={formData.address?.district} onChange={handleChange} disabled={true} />
                <InputField label="Mandal" name="address.mandal" value={formData.address?.mandal} onChange={handleChange} disabled={true} />
            </div>

            <div className="flex flex-wrap gap-6 mb-6">
                <InputField label="Village" name="address.village" value={formData.address?.village} onChange={handleChange} disabled={true} />
                <InputField label="Pincode" name="address.pinCode" value={formData.address?.pinCode} onChange={handleChange} />
            </div>

            <div className="flex flex-wrap gap-6">
                <InputField label="House Number" name="address.houseNumber" value={formData.address?.houseNumber} onChange={handleChange} />
                <InputField label="Street" name="address.street" value={formData.address?.street} onChange={handleChange} />
            </div>
        </div>
    </div>
);

const FamilyMembersTab = ({ members }) => (
    <div className="animate-fadeIn">
        <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900">Family Members ({members?.length || 0})</h3>
            {/* Add Member restricted to Village Admin only */}
        </div>

        {(!members || members.length === 0) ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <p className="text-gray-500 text-sm">No family members added yet. Contact your Village Admin to add members.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {members.map((member, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50 flex justify-start items-center gap-4">
                        <img
                            src={member.photo || "/assets/images/user-profile.png"}
                            alt={member.name}
                            className="w-12 h-12 rounded-full object-cover border border-gray-200"
                        />
                        <div>
                            <p className="font-bold text-gray-800 text-sm">{member.name} {member.surname}</p>
                            <p className="text-xs text-gray-500">{member.relation} • {member.age} Years</p>
                        </div>
                        {/* Edit/Delete actions restricted to Village Admin */}
                    </div>
                ))}
            </div>
        )}
    </div>
);

const DocumentsTab = ({ onOpenApp, onOpenID }) => (
    <div className="animate-fadeIn space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 border border-gray-200 rounded-xl bg-white shadow-sm flex flex-col items-center text-center hover:shadow-md transition">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 text-3xl">
                    <FaFileAlt />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Application Form</h3>
                <p className="text-sm text-gray-500 mb-6">View and download your official membership application form.</p>
                <button
                    onClick={onOpenApp}
                    className="w-full py-2.5 bg-[#1e2a4a] text-white font-bold rounded-lg hover:bg-[#2a3b66] transition flex items-center justify-center gap-2"
                >
                    <FaPrint /> View Application
                </button>
            </div>

            <div className="p-6 border border-gray-200 rounded-xl bg-white shadow-sm flex flex-col items-center text-center hover:shadow-md transition">
                <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-4 text-3xl">
                    <FaIdCard />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Member ID Card</h3>
                <p className="text-sm text-gray-500 mb-6">View and download your digital membership ID card.</p>
                <button
                    onClick={onOpenID}
                    className="w-full py-2.5 bg-[#1e2a4a] text-white font-bold rounded-lg hover:bg-[#2a3b66] transition flex items-center justify-center gap-2"
                >
                    <FaIdCard /> View Create ID Card
                </button>
            </div>
        </div>
    </div>
);

const SecurityTab = () => (
    <div className="animate-fadeIn space-y-6">
        <div className="p-4 border border-gray-100 rounded-lg bg-blue-50">
            <h3 className="font-bold text-gray-800 text-sm mb-2">Login Method</h3>
            <p className="text-xs text-gray-600 mb-4">You are currently logging in using Mobile OTP.</p>
            <button className="text-primary text-xs font-bold hover:underline">Manage Trusted Devices</button>
        </div>
        <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
            <div>
                <h3 className="font-bold text-gray-800 text-sm">Two-Factor Authentication</h3>
                <p className="text-xs text-gray-500">Enhanced security is enabled by default.</p>
            </div>
            <div className="w-10 h-6 bg-green-500 rounded-full relative flex items-center px-1">
                <div className="w-4 h-4 bg-white rounded-full translate-x-4 transition-transform"></div>
            </div>
        </div>
    </div>
);

const NotificationsTab = () => (
    <div className="animate-fadeIn space-y-4">
        {['Application Updates', 'New Scholarship Alerts', 'Membership Renewal Reminders', 'News & Events'].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                <span className="text-sm font-bold text-gray-700">{item}</span>
                <div className={`w-10 h-6 ${i < 2 ? 'bg-green-500' : 'bg-gray-300'} rounded-full relative flex items-center px-1 cursor-pointer`}>
                    <div className={`w-4 h-4 bg-white rounded-full ${i < 2 ? 'translate-x-4' : 'translate-x-0'} transition-transform shadow-sm`}></div>
                </div>
            </div>
        ))}
    </div>
);

const PrivacyTab = () => (
    <div className="animate-fadeIn space-y-6">
        <div className="p-6 border border-gray-200 rounded-lg text-center">
            <h3 className="font-bold text-gray-800 mb-2">Download Your Data</h3>
            <p className="text-xs text-gray-500 mb-4 mx-auto max-w-xs">Get a copy of your personal data, applications, and history stored in our system.</p>
            <button className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50">Download JSON</button>
        </div>
        <div className="p-6 border border-red-100 bg-red-50 rounded-lg">
            <h3 className="font-bold text-red-800 mb-2">Delete Account</h3>
            <p className="text-xs text-red-600 mb-4">Permanently remove your account and all associated data. This action cannot be undone.</p>
            <button className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700">Request Account Deletion</button>
        </div>
    </div>
);

// Family Member Modal
const FamilyMemberModal = ({ isOpen, onClose, onSave, member, isEditing }) => {
    if (!isOpen) return null;
    const [localMember, setLocalMember] = useState(member || { name: '', surname: '', relation: 'Spouse', age: '', occupation: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLocalMember(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
            <div className="bg-white rounded-xl w-full max-w-md p-6 animate-scaleIn">
                <h3 className="font-bold text-lg mb-6">{isEditing ? 'Edit Member' : 'Add Family Member'}</h3>
                <div className="space-y-4">
                    <InputField label="Name" name="name" value={localMember.name} onChange={handleChange} />
                    <InputField label="Surname" name="surname" value={localMember.surname} onChange={handleChange} />
                    <div className="flex gap-4">
                        <SelectField label="Relation" name="relation" options={['Spouse', 'Son', 'Daughter', 'Father', 'Mother', 'Brother', 'Sister']} value={localMember.relation} onChange={handleChange} />
                        <InputField label="Age" name="age" value={localMember.age} onChange={handleChange} type="number" />
                    </div>
                    <InputField label="Occupation" name="occupation" value={localMember.occupation} onChange={handleChange} />
                </div>
                <div className="flex justify-end gap-3 mt-8">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 font-bold text-sm">Cancel</button>
                    <button onClick={() => onSave(localMember)} className="px-6 py-2 bg-primary text-white font-bold text-sm rounded-lg hover:bg-opacity-90">
                        {isEditing ? 'Update' : 'Add'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const ProfileSettings = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const viewParam = queryParams.get('view');

    const [activeTab, setActiveTab] = useState('Personal Info');
    const [showCamera, setShowCamera] = useState(false);
    const [profileImage, setProfileImage] = useState("/assets/images/user-profile.png");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Document Modal States
    const [showAppModal, setShowAppModal] = useState(false);
    const [showIDModal, setShowIDModal] = useState(false);

    // Family Member Modal State
    const [showFamilyModal, setShowFamilyModal] = useState(false);
    const [editingMemberIndex, setEditingMemberIndex] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        email: '',
        mobileNumber: '',
        dob: '',
        gender: 'Male',
        address: {
            state: '',
            district: '',
            mandal: '',
            village: '',
            houseNumber: '',
            street: '',
            pinCode: ''
        },
        fullAddress: '', // Helper logic for display if needed, or split fields
        familyMembers: [], // Array for family members
        mewsId: '',
        createdAt: ''
    });

    // Fetch User Data
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const adminInfo = JSON.parse(localStorage.getItem('adminInfo'));
                if (!adminInfo?.token) return;

                const response = await fetch(`/api/members/${adminInfo._id}`, {
                    headers: { 'Authorization': `Bearer ${adminInfo.token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    setFormData({
                        ...data,
                        // Ensure nested objects exist to prevent errors
                        address: {
                            state: data.address?.state || data.address?.district?.parent?.name || 'Telangana',
                            district: data.address?.district?.name || data.address?.district || '',
                            mandal: data.address?.mandal?.name || data.address?.mandal || '',
                            village: data.address?.village?.name || data.address?.village || '',
                            houseNumber: data.address?.houseNumber || '',
                            street: data.address?.street || '',
                            pinCode: data.address?.pinCode || ''
                        },
                        dob: data.dob ? data.dob.split('T')[0] : '', // Format Date for input
                        familyMembers: data.familyMembers || []
                    });
                    if (data.photoUrl) setProfileImage(data.photoUrl);

                    // Handle View Param after data load
                    if (viewParam === 'application') {
                        setActiveTab('My Documents');
                        setShowAppModal(true);
                    } else if (viewParam === 'idcard') {
                        setActiveTab('My Documents');
                        setShowIDModal(true);
                    }
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [viewParam]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // Helper to convert base64 to blob
    const dataURLtoBlob = (dataurl) => {
        try {
            const arr = dataurl.split(',');
            const mime = arr[0].match(/:(.*?);/)[1];
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            return new Blob([u8arr], { type: mime });
        } catch (e) {
            console.error("Error converting data URL to blob", e);
            return null;
        }
    }

    const handleSave = async () => {
        setSaving(true);
        try {
            const adminInfo = JSON.parse(localStorage.getItem('adminInfo'));

            const submitData = new FormData();
            submitData.append('name', formData.name);
            submitData.append('surname', formData.surname);
            submitData.append('email', formData.email);
            submitData.append('mobileNumber', formData.mobileNumber);
            submitData.append('dob', formData.dob);
            submitData.append('gender', formData.gender);

            // Nested Objects as JSON strings
            submitData.append('address', JSON.stringify(formData.address));

            // Family Members as JSON string
            // Note: We are just updating text data for now. If photo upload for family members is needed, 
            // it requires complex checking of base64 in each member which is outside current scope of "update profile photo".
            submitData.append('familyMembers', JSON.stringify(formData.familyMembers));

            // Photo Handling
            if (formData.photoUrl && formData.photoUrl.startsWith('data:image')) {
                const blob = dataURLtoBlob(formData.photoUrl);
                if (blob) {
                    submitData.append('photo', blob, 'profile_photo.jpg');
                }
            }

            const response = await fetch(`/api/members/${adminInfo._id}`, {
                method: 'PUT',
                headers: {
                    // 'Content-Type': 'multipart/form-data', // Browser sets this automatically with boundary
                    'Authorization': `Bearer ${adminInfo.token}`
                },
                body: submitData
            });

            if (response.ok) {
                const storedAdmin = JSON.parse(localStorage.getItem('adminInfo'));

                // If backend returns the updated member, we can update local storage logic if needed
                // But usually we just re-fetch in useEffect or update photo displayed
                // Let's see if we can get the new photo URL from response if needed
                const updatedMember = await response.json();
                if (updatedMember.photoUrl) {
                    setProfileImage(updatedMember.photoUrl);
                    // Update adminInfo in localStorage if photo changed?
                    storedAdmin.photoUrl = updatedMember.photoUrl;
                    localStorage.setItem('adminInfo', JSON.stringify(storedAdmin));
                }

                alert("Profile Updated Successfully!");
            } else {
                alert("Failed to update profile");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("An error occurred");
        } finally {
            setSaving(false);
        }
    };

    const handlePhotoCapture = (imgSrc) => {
        if (imgSrc) {
            setProfileImage(imgSrc);
            setFormData(prev => ({ ...prev, photoUrl: imgSrc })); // Setup to save
            setShowCamera(false);
        }
    };

    // Family Member Handlers
    const handleAddMember = (newMember) => {
        setFormData(prev => ({
            ...prev,
            familyMembers: [...prev.familyMembers, newMember]
        }));
        setShowFamilyModal(false);
    };

    const handleUpdateMember = (updatedMember) => {
        const updatedList = [...formData.familyMembers];
        updatedList[editingMemberIndex] = updatedMember;
        setFormData(prev => ({ ...prev, familyMembers: updatedList }));
        setShowFamilyModal(false);
        setEditingMemberIndex(null);
    };

    const handleDeleteMember = (index) => {
        if (window.confirm("Are you sure you want to remove this family member?")) {
            const updatedList = formData.familyMembers.filter((_, i) => i !== index);
            setFormData(prev => ({ ...prev, familyMembers: updatedList }));
        }
    };

    if (loading) return <div className="p-8 text-center">Loading Profile...</div>;

    return (
        <div className="w-full space-y-6 pb-12 relative">

            <FamilyMemberModal
                isOpen={showFamilyModal}
                onClose={() => { setShowFamilyModal(false); setEditingMemberIndex(null); }}
                onSave={editingMemberIndex !== null ? handleUpdateMember : handleAddMember}
                member={editingMemberIndex !== null ? formData.familyMembers[editingMemberIndex] : null}
                isEditing={editingMemberIndex !== null}
            />

            {/* Application Modal */}
            {showAppModal && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4">
                    <div className="bg-white rounded-xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-lg">Application Form Preview</h3>
                            <div className="flex gap-4">
                                <button onClick={() => window.print()} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700">
                                    <FaPrint /> Print Form
                                </button>
                                <button onClick={() => setShowAppModal(false)} className="text-gray-500 hover:text-red-500">
                                    <FaTimes size={20} />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-auto bg-gray-100 p-8">
                            {/* Render inside correct print container styles */}
                            <div className="bg-white shadow-lg mx-auto max-w-[210mm] min-h-[297mm]">
                                <MemberDocument data={formData} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ID Card Modal */}
            {showIDModal && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4">
                    <div className="bg-white rounded-xl w-fit max-w-5xl max-h-[90vh] flex flex-col overflow-hidden p-8 relative">
                        <button onClick={() => setShowIDModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 z-50">
                            <FaTimes size={24} />
                        </button>
                        <h3 className="font-bold text-2xl text-center mb-8">Generated ID Card</h3>
                        <div className="overflow-auto scrollbar-hide py-4 px-8">
                            <MemberIDCard member={formData} />
                        </div>
                    </div>
                </div>
            )}

            {/* Hidden Print Portal for direct printing support */}
            <PrintPortal>
                <div className="hidden print:block">
                    <MemberDocument data={formData} />
                </div>
            </PrintPortal>

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
                                const reader = new FileReader();
                                reader.onloadend = () => handlePhotoCapture(reader.result);
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

            {/* Back Button */}
            <div className="">
                <Link to="/dashboard" className="text-secondary hover:text-amber-600 flex items-center gap-2 text-sm font-bold transition-all w-fit">
                    <FaArrowLeft size={12} /> Back to Dashboard
                </Link>
            </div>

            {/* Profile Header Card */}
            <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-8">
                <div className="relative">
                    <div className="w-32 h-32 rounded-full p-1 border-2 border-dashed border-gray-300 overflow-hidden">
                        <img
                            src={formData.photoUrl || profileImage}
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
                        <h1 className="text-2xl font-bold text-gray-900">{formData.name} {formData.surname}</h1>
                    </div>
                    <div className="flex flex-wrap justify-center md:justify-start gap-x-8 gap-y-2 text-sm text-gray-500 mb-6">
                        <div>
                            <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wide">Member ID</span>
                            <span className="font-bold text-gray-800">{formData.mewsId || 'PENDING'}</span>
                        </div>
                        <div>
                            <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wide">Member Since</span>
                            <span className="font-bold text-gray-800">
                                {formData.createdAt ? new Date(formData.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}
                            </span>
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
                    {['Personal Info', 'My Documents', 'Family Members', 'Security', 'Notifications', 'Privacy & Data'].map((tab) => (
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
            <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm min-h-[400px]">

                {activeTab === 'Personal Info' && <PersonalInfoTab formData={formData} handleChange={handleChange} />}

                {activeTab === 'My Documents' && <DocumentsTab onOpenApp={() => setShowAppModal(true)} onOpenID={() => setShowIDModal(true)} />}

                {activeTab === 'Family Members' && (
                    <FamilyMembersTab
                        members={formData.familyMembers}
                    />
                )}

                {activeTab === 'Security' && <SecurityTab />}
                {activeTab === 'Notifications' && <NotificationsTab />}
                {activeTab === 'Privacy & Data' && <PrivacyTab />}

                {/* Save Button for relevant tabs */}
                {(activeTab === 'Personal Info' || activeTab === 'Family Members') && (
                    <div className="flex items-center gap-4 mt-8 pt-8 border-t border-gray-100">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-6 py-2.5 bg-[#1e2a4a] text-white text-sm font-bold rounded-lg hover:bg-[#2a3b66] transition shadow-md flex items-center gap-2"
                        >
                            {saving ? 'Saving...' : <><FaSave /> Save Changes</>}
                        </button>
                        <button className="px-6 py-2.5 bg-white border border-gray-300 text-gray-600 text-sm font-bold rounded-lg hover:bg-gray-50 transition flex items-center gap-2">
                            <FaTimes /> Cancel
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default ProfileSettings;
