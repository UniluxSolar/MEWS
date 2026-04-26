import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    FaCamera, FaEdit, FaCheckCircle, FaSave, FaTimes, FaArrowLeft, FaFileAlt, FaIdCard, FaPrint, FaDownload, FaBullseye, FaHandHoldingHeart
} from 'react-icons/fa';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import API, { BASE_URL } from '../api';
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

const DisplayField = ({ label, value }) => (
    <div className="mb-4">
        <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">{label}</label>
        <p className="text-sm font-bold text-gray-800">{value || '-'}</p>
    </div>
);

const InputField = ({ label, name, value, onChange, type = "text", disabled }) => (
    <div className="mb-4">
        <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">{label}</label>
        <input
            type={type}
            name={name}
            value={value || ''}
            onChange={onChange}
            disabled={disabled}
            className={`w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white ${disabled ? 'bg-gray-50 text-gray-400' : ''}`}
        />
    </div>
);

const SelectField = ({ label, name, options, value, onChange }) => (
    <div className="mb-4">
        <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">{label}</label>
        <select
            name={name}
            value={value || ''}
            onChange={onChange}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white appearance-none"
        >
            {options.map(opt => <option key={opt}>{opt}</option>)}
        </select>
    </div>
);

const PersonalInfoTab = ({ formData, handleChange, isEditing, toggleEdit, onSave, onCancel, profileImage, onPhotoClick, saving }) => (
    <div className="animate-fadeIn space-y-10">
        {/* Top Header: Photo, Edit Button, ID */}
        <div className="flex items-center gap-8">
            <div className="relative group cursor-pointer" onClick={onPhotoClick}>
                <img
                    src={getImageUrl(profileImage)}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-100 shadow-sm transition group-hover:opacity-90"
                />
                <button className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow-md text-primary hover:text-secondary transition">
                    <FaCamera size={14} />
                </button>
            </div>

            <div className="flex flex-col gap-2.5">
                {!isEditing && (
                    <button 
                        onClick={toggleEdit}
                        className="flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-bold hover:bg-blue-100 transition w-fit border border-blue-100 shadow-sm"
                    >
                        <FaEdit size={12} /> Edit Profile
                    </button>
                )}
                <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">ID:</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${formData.mewsId && formData.mewsId !== 'PENDING' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                        {formData.mewsId || 'PENDING'}
                    </span>
                </div>
            </div>
        </div>

        {/* Two-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {/* Personal Details */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 border-l-4 border-orange-400 pl-4 mb-8">
                    <h3 className="font-bold text-lg text-gray-800">Personal Details</h3>
                </div>
                
                {isEditing ? (
                    <div className="space-y-2">
                        <InputField label="First Name" name="name" value={formData.name} onChange={handleChange} />
                        <InputField label="Surname" name="surname" value={formData.surname} onChange={handleChange} />
                        <InputField label="Mobile Number" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} />
                        <InputField label="Email" name="email" value={formData.email} onChange={handleChange} />
                        <InputField label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleChange} />
                        <SelectField label="Gender" name="gender" options={['Male', 'Female', 'Other']} value={formData.gender} onChange={handleChange} />
                    </div>
                ) : (
                    <div className="space-y-4">
                        <DisplayField label="First Name" value={formData.name} />
                        <DisplayField label="Surname" value={formData.surname} />
                        <div className="grid grid-cols-2 gap-4">
                            <DisplayField label="Mobile Number" value={formData.mobileNumber} />
                        </div>
                        <DisplayField label="Email" value={formData.email} />
                        <div className="grid grid-cols-2 gap-4">
                            <DisplayField label="Date of Birth" value={new Date(formData.dob).toLocaleDateString('en-GB') === 'Invalid Date' ? formData.dob : new Date(formData.dob).toLocaleDateString('en-GB')} />
                            <DisplayField label="Gender" value={formData.gender} />
                        </div>
                    </div>
                )}
            </div>

            {/* Address Details */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 border-l-4 border-orange-400 pl-4 mb-8">
                    <h3 className="font-bold text-lg text-gray-800">Address Details</h3>
                </div>

                {isEditing ? (
                    <div className="space-y-2">
                        <InputField label="House Number" name="address.houseNumber" value={formData.address?.houseNumber} onChange={handleChange} />
                        <InputField label="Street / Colony" name="address.street" value={formData.address?.street} onChange={handleChange} />
                        <InputField label="Landmark" name="address.landmark" value={formData.address?.landmark} onChange={handleChange} />
                        <InputField label="Village" name="address.village" value={formData.address?.village} onChange={handleChange} />
                        <InputField label="Mandal" name="address.mandal" value={formData.address?.mandal} onChange={handleChange} />
                        <InputField label="Constituency" name="address.constituency" value={formData.address?.constituency} onChange={handleChange} />
                        <InputField label="District" name="address.district" value={formData.address?.district} onChange={handleChange} />
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <DisplayField label="House Number" value={formData.address?.houseNumber} />
                        </div>
                        <DisplayField label="Street / Colony" value={formData.address?.street} />
                        <DisplayField label="Landmark" value={formData.address?.landmark} />
                        <div className="grid grid-cols-2 gap-4">
                            <DisplayField label="Village" value={formData.address?.village?.name || formData.address?.village} />
                            <DisplayField label="Mandal" value={formData.address?.mandal?.name || formData.address?.mandal} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <DisplayField label="Constituency" value={formData.address?.constituency?.name || formData.address?.constituency} />
                            <DisplayField label="District" value={formData.address?.district?.name || formData.address?.district} />
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Action Buttons at bottom right */}
        {isEditing && (
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                <button
                    onClick={onCancel}
                    className="flex items-center gap-2 px-8 py-2 bg-gray-100 text-gray-600 rounded-full text-sm font-bold hover:bg-gray-200 transition"
                >
                    Cancel
                </button>
                <button
                    onClick={onSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-8 py-2 bg-green-600 text-white rounded-full text-sm font-bold hover:bg-green-700 transition disabled:opacity-50"
                >
                    {saving ? 'Updating...' : 'Update'}
                </button>
            </div>
        )}
    </div>
);

const getImageUrl = (url) => {
    if (!url) return "/assets/images/user-profile.png";
    if (url.startsWith('data:') || url.startsWith('blob:')) return url;

    // Ensure we handle Windows backslashes
    const normalizedUrl = url.replace(/\\/g, '/');

    // Use Proxy for GCS/Remote URLs to ensure they load (CORS/Private)
    const baseUrl = BASE_URL;

    if (normalizedUrl.startsWith('http')) {
        return `${baseUrl}/api/proxy-image?url=${encodeURIComponent(normalizedUrl)}`;
    }

    // Local relative paths (e.g., /uploads/...)
    const cleanUrl = normalizedUrl.startsWith('/') ? normalizedUrl : `/${normalizedUrl}`;
    return `${baseUrl}${cleanUrl}`;
};

const FamilyMembersTab = ({ members, onMemberClick, title = "Family Members" }) => {
    // Filter out the current user for display, but keep original list for count
    const displayMembers = members ? members.filter(m => !m.isCurrentUser) : [];
    const totalCount = members ? members.length : 0;

    return (
        <div className="animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-900">{title} ({totalCount})</h3>
                {/* Add Member restricted to Village Admin only */}
            </div>

            {displayMembers.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    <p className="text-gray-500 text-sm">
                        {title === 'Tickets Received' ? 'No tickets received.' : 'No other family members found.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {displayMembers.map((member, index) => (
                        <div
                            key={index}
                            onClick={() => onMemberClick(member)}
                            className="p-4 border border-gray-200 rounded-lg bg-gray-50 flex justify-start items-center gap-4 cursor-pointer hover:bg-gray-100 hover:shadow-sm transition-all"
                        >
                            <div className="relative">
                                <img
                                    src={getImageUrl(member.photo || member.photoUrl)} 
                                    alt={member.name}
                                    className="w-12 h-12 rounded-full object-cover border border-gray-200 shadow-sm"
                                />
                                {member.isHead && (
                                    <span className="absolute -bottom-1 -right-1 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white">
                                        HEAD
                                    </span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-gray-800 text-sm flex items-center gap-2 truncate">
                                    {member.name} {member.surname}
                                </p>
                                <p className="text-xs text-gray-400 truncate">{member.relation} • {member.age} Years</p>
                                <span className="text-[10px] text-primary font-bold mt-1 inline-block">Click to View Profile</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

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
                    <FaFileAlt /> View Application
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

const NotificationsTab = ({ notifications, title = "Personal Info" }) => {
    return (
        <div className="animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-900">{title}</h3>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 text-gray-500 text-[10px] uppercase tracking-wider border-b border-gray-100">
                                <th className="py-4 pl-6 font-bold text-left whitespace-nowrap">Type of Admin</th>
                                <th className="py-4 font-bold text-left whitespace-nowrap">Originator</th>
                                <th className="py-4 font-bold text-left whitespace-nowrap">Date of Announcement</th>
                                <th className="py-4 font-bold text-left">Message</th>
                            </tr>
                        </thead>
                        <tbody>
                            {notifications.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="py-12 text-center text-gray-400 text-sm">
                                        <div className="flex flex-col items-center gap-2">
                                            <FaBullseye className="text-gray-200" size={40} />
                                            No announcements found.
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                notifications.map((notification) => (
                                    <tr key={notification._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                        <td className="py-4 pl-6">
                                            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-[10px] font-bold whitespace-nowrap uppercase">
                                                {notification.targetAudience || 'System Admin'}
                                            </span>
                                        </td>
                                        <td className="py-4 text-sm font-bold text-gray-900 whitespace-nowrap">
                                            {notification.title || 'System'}
                                        </td>
                                        <td className="py-4 text-xs font-medium text-gray-600 whitespace-nowrap">
                                            {new Date(notification.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="py-4 pr-6">
                                            <div className="text-sm text-gray-600 leading-relaxed max-w-md">
                                                {notification.message || notification.description}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const FundRequestRow = ({ request }) => {
    const target = request.amountRequired || 0;
    const collected = request.amountCollected || 0;
    const progress = Math.min(100, Math.round((collected / target) * 100) || 0);

    let barColor = 'bg-orange-400';
    let statusLabel = `Currently received: ₹${collected.toLocaleString()}`;

    if (progress > 60) {
        barColor = 'bg-green-500';
        statusLabel = `Total amount received: ₹${collected.toLocaleString()}`;
    } else if (progress > 30) {
        barColor = 'bg-yellow-400';
        statusLabel = `Currently received: ₹${collected.toLocaleString()}`;
    }

    return (
        <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
            <td className="py-4 pl-6">
                <div className="flex flex-col text-left text-sm whitespace-nowrap">
                    <span className="font-bold text-gray-900">{request.requestedFor?.name || 'You'} {request.requestedFor?.surname || ''}</span>
                </div>
            </td>
            <td className="py-4 text-left text-xs font-medium text-gray-600 whitespace-nowrap">
                {request.requestedFor?.address?.district || '-'}
            </td>
            <td className="py-4 text-left text-xs font-medium text-gray-600 whitespace-nowrap">
                {request.requestedFor?.address?.mandal || '-'}
            </td>
            <td className="py-4 text-left text-xs font-medium text-gray-600 whitespace-nowrap">
                {request.requestedFor?.address?.village || '-'}
            </td>
            <td className="py-4 text-left">
                <div className="text-sm text-gray-700 font-medium line-clamp-1 max-w-xs" title={request.description}>
                    {request.description}
                </div>
            </td>
            <td className="py-4 font-bold text-gray-800 text-left whitespace-nowrap">
                ₹{target.toLocaleString()}
            </td>
            <td className="py-4 border-r border-gray-50">
                <div className="flex flex-col text-left whitespace-nowrap">
                    <span className="font-bold text-gray-900 text-xs">{new Date(request.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                    <span className="text-[10px] text-gray-400">{new Date(request.createdAt).getFullYear()}</span>
                </div>
            </td>
            <td className="py-4 px-4 min-w-[200px]">
                <div className="flex flex-col gap-2">
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div 
                            className={`h-full ${barColor} transition-all duration-500 ease-out`} 
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black uppercase text-gray-500 tracking-tighter">
                            {statusLabel}
                        </span>
                        <span className="text-[10px] font-black text-gray-900">{progress}%</span>
                    </div>
                </div>
            </td>
            <td className="py-4 pr-6 text-right">
                <button className="px-4 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-opacity-90 transition shadow-sm whitespace-nowrap">
                    Pay Now
                </button>
            </td>
        </tr>
    );
};

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
    const [isEditing, setIsEditing] = useState(false);
    const [originalData, setOriginalData] = useState(null); // For Cancel button
    
    // Determine Display Mode (Profile vs Notifications)
    const isNotificationsMode = viewParam === 'notifications';
    
    // Tab Configurations
    const tabs = [
        { 
            id: 'Personal Info', 
            label: isNotificationsMode ? 'Announcements' : 'Personal Info',
            header: isNotificationsMode ? 'Announcements' : 'Personal Info'
        },
        { 
            id: 'My Documents', 
            label: isNotificationsMode ? 'Received Fund Requests' : 'My Documents',
            header: isNotificationsMode ? 'Received Fund Requests' : 'My Documents'
        },
        // Only show the 3rd tab if NOT in Notifications mode (previously 'Tickets Received')
        ...(!isNotificationsMode ? [{ 
            id: 'Family Members', 
            label: 'Family Members',
            header: 'Family Members'
        }] : [])
    ];
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
    const [familyList, setFamilyList] = useState([]); // Separate state for the UI list of family members

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
            constituency: '',
            houseNumber: '',
            street: '',
            pinCode: '',
            landmark: ''
        },
        permanentAddress: {
            state: '',
            district: '',
            mandal: '',
            village: '',
            constituency: '',
            houseNumber: '',
            street: '',
            pinCode: '',
            landmark: ''
        },
        fullAddress: '', // Helper logic for display if needed, or split fields
        familyMembers: [], // Array for family members
        mewsId: '',
        createdAt: ''
    });

    const [isReadOnly, setIsReadOnly] = useState(false); // New state for View Only mode
    const [viewingMemberId, setViewingMemberId] = useState(null); // Track if we are viewing a specific family member
    const [notifications, setNotifications] = useState([]);
    const [receivedRequests, setReceivedRequests] = useState([]);

    // Fetch User Data
    // Helper to calculate relationship relative to the logged-in user
    const getRelativeRelation = (currentUserRelation, targetMember) => {
        const targetRelation = targetMember.relation; // Target's relation to HEAD

        // If current user is HEAD, return target's relation to Head as is
        if (!currentUserRelation || currentUserRelation === 'Head of Family') {
            return targetRelation;
        }

        // Standardize strings for comparison (case-insensitive if needed, but usually consistent)
        const userRel = currentUserRelation.toLowerCase();
        const targetRel = (targetRelation || '').toLowerCase(); // Head has 'Head of Family' usually

        // Case 1: Logged in as SPOUSE
        if (userRel === 'spouse' || userRel === 'wife' || userRel === 'husband') {
            if (targetMember.isHead) return 'Husband'; // Assuming Head is male/generic
            // For children, they remain Son/Daughter
            return targetRelation;
        }

        // Case 2: Logged in as CHILD (Son/Daughter)
        if (userRel === 'son' || userRel === 'daughter') {
            if (targetMember.isHead) return 'Father';
            if (targetRel === 'spouse' || targetRel === 'wife' || targetRel === 'mother') return 'Mother';
            if (targetRel === 'son') return 'Brother';
            if (targetRel === 'daughter') return 'Sister';
        }

        // Fallback: return original relation to Head if complex/unknown
        return targetRelation;
    };

    // Fetch User Data
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // Check multiple possible sources for logged-in user information
                const adminInfoStr = sessionStorage.getItem('adminInfo');
                const memberInfoStr = sessionStorage.getItem('memberInfo');
                const savedUserStr = sessionStorage.getItem('savedUser');
                
                const adminInfo = adminInfoStr ? JSON.parse(adminInfoStr) : null;
                const memberInfo = memberInfoStr ? JSON.parse(memberInfoStr) : null;
                const savedUser = savedUserStr ? JSON.parse(savedUserStr) : null;

                const userInfo = adminInfo || memberInfo || savedUser;
                const userId = userInfo?._id || userInfo?.id || userInfo?.memberId;

                if (!userId) {
                    console.error("No user ID found for fetching profile");
                    setLoading(false);
                    return;
                }

                // Default to Read Only for members
                if (userInfo?.role === 'MEMBER' || userInfo?.role === 'HEAD' || userInfo?.role === 'DEPENDENT' || !adminInfo) {
                    setIsReadOnly(true);
                } else {
                    setIsReadOnly(false); // Admins can edit by default
                }

                const response = await API.get(`/members/${userId}`);

                if (response.data) {
                    let data = response.data;
                    // let isDependent = false; // This variable is no longer needed

                    // Set FormData based on who is logged in (Head or Dependent)
                    // But first, construct the Unified Family List for the "Family Members" tab
                    // This list must include the HEAD and all DEPENDENTS
                    const headMember = {
                        _id: data._id,
                        name: data.name,
                        surname: data.surname,
                        relation: 'Head of Family',
                        mobileNumber: data.mobileNumber,
                        photo: data.photoUrl, // Normalize to 'photo'
                        photoUrl: data.photoUrl,
                        dob: data.dob,
                        age: data.age, // Backend might send this, or we calculate
                        isHead: true,
                        memberType: 'HEAD',
                        // Address mapping for display if needed
                        presentAddress: data.address,
                        permanentAddress: data.permanentAddress
                    };

                    const dependents = (response.data.familyMembers || []).map(fm => ({
                        ...fm,
                        memberType: 'DEPENDENT',
                        // Ensure photos are handled if they exist
                        photo: fm.photo || fm.photoUrl
                    }));

                    // Unified List
                    const allMembers = [headMember, ...dependents];

                    const currentMemberId = userId;

                    // Find the logged-in user in the list to get their relation to HEAD
                    const currentUserObj = allMembers.find(m => (m._id === currentMemberId || m.mewsId === currentMemberId));
                    const currentUserRelation = currentUserObj ? currentUserObj.relation : 'Head of Family';

                    const finalFamilyList = allMembers.map(m => {
                        const isCurrentUser = (m._id === currentMemberId || m.mewsId === currentMemberId);

                        // Calculate Display Relation
                        // If it's the current user, we don't display relation usually, or we show "You"
                        // But for others, calculate derived relation
                        const displayRelation = isCurrentUser ? m.relation : getRelativeRelation(currentUserRelation, m);

                        return {
                            ...m,
                            relation: displayRelation, // Override relation for display in this list
                            originalRelation: m.relation, // Keep original just in case
                            isCurrentUser
                        };
                    });

                    setFamilyList(finalFamilyList);

                    // HANDLE VIEW MEMBER FROM URL (Deep Linking support for "New Page" feel)
                    const viewMemberId = queryParams.get('view_member_id');
                    let memberToDisplay = data; // Default to main data (Head)

                    if (viewMemberId) {
                        setViewingMemberId(viewMemberId);
                        const foundInFamily = finalFamilyList.find(m => m._id === viewMemberId || m.mewsId === viewMemberId);
                        if (foundInFamily) {
                            memberToDisplay = {
                                ...foundInFamily,
                                address: foundInFamily.presentAddress || data.address,
                                permanentAddress: foundInFamily.permanentAddress || data.permanentAddress
                            }; // Use family member data
                            setActiveTab('Personal Info'); // Force tab
                        }
                    } else if (userInfo?.memberId && userInfo?.memberId !== userInfo?._id) {
                        // Default Dependent Login view
                        const foundMember = data.familyMembers?.find(fm => (fm._id === userInfo.memberId || fm.mewsId === userInfo.memberId));
                        if (foundMember) {
                            memberToDisplay = {
                                ...data,
                                ...foundMember,
                                address: foundMember.presentAddress || data.address,
                                permanentAddress: foundMember.permanentAddress || data.permanentAddress,
                            };
                        }
                    }

                    // Populate Form
                    // Helper to get nested name if object or use value if string
                    const getAddressValue = (addrObj, field) => {
                        if (!addrObj) return '';
                        const val = addrObj[field];
                        if (typeof val === 'object' && val !== null) return val.name || '';
                        if (typeof val === 'string' && val.length > 20 && !val.includes(' ')) return '';
                        return val || '';
                    };

                    const headAddress = data.address || {};

                    const resolveAddress = (memberAddr, headAddr) => {
                        const getField = (f) => {
                            // Try member's field first
                            let val = memberAddr?.[f];
                            // If it is an object (populated), take name
                            if (val && typeof val === 'object') return val.name;
                            // If it is a long ID-like string, likely unpopulated ID. Fallback to Head's if safe
                            if (typeof val === 'string' && /^[0-9a-fA-F]{24}$/.test(val)) {
                                const headVal = headAddr?.[f];
                                if (headVal && typeof headVal === 'object') return headVal.name;
                                if (headVal && typeof headVal === 'string' && !/^[0-9a-fA-F]{24}$/.test(headVal)) return headVal;
                                return '';
                            }
                            // Fallback for cases where val is populated but not accessed correctly
                            return val?.name || val || headAddr?.[f]?.name || (typeof headAddr?.[f] === 'string' ? headAddr?.[f] : '') || '';
                        };

                        return {
                            state: getField('state') || 'Telangana',
                            district: getField('district'),
                            constituency: memberAddr?.constituency || headAddr?.constituency || '',
                            mandal: getField('mandal'),
                            village: getField('village'),
                            houseNumber: memberAddr?.houseNumber || headAddr?.houseNumber || '',
                            street: memberAddr?.street || headAddr?.street || '',
                            pinCode: memberAddr?.pinCode || headAddr?.pinCode || '',
                            landmark: memberAddr?.landmark || headAddr?.landmark || ''
                        };
                    }

                    const headPermAddress = data.permanentAddress || {};
                    const finalAddress = resolveAddress(memberToDisplay.address || memberToDisplay.presentAddress, headAddress);
                    const finalPermAddress = resolveAddress(memberToDisplay.permanentAddress, headPermAddress);

                    // Populate Form
                    const resolvedProfile = {
                        ...memberToDisplay,
                        mewsId: memberToDisplay.mewsId || memberToDisplay.memberId || 'PENDING',
                        name: memberToDisplay.name || '',
                        surname: memberToDisplay.surname || '',
                        mobileNumber: memberToDisplay.mobileNumber || '',
                        email: memberToDisplay.email || '',
                        gender: memberToDisplay.gender || '',
                        address: resolveAddress(memberToDisplay.address || memberToDisplay.presentAddress, headAddress),
                        permanentAddress: resolveAddress(memberToDisplay.permanentAddress, headPermAddress),
                        dob: memberToDisplay.dob ? memberToDisplay.dob.split('T')[0] : '',
                        familyMembers: response.data.familyMembers || []
                    };

                    setFormData(resolvedProfile);
                    setOriginalData(resolvedProfile);

                    // Photo Handling
                    // Dependents often have 'photo' (GCS path) or 'photoUrl' (signed/full). 
                    // Head has 'photoUrl'.
                    // We must resolve this.
                    const rawPhoto = memberToDisplay.photo || memberToDisplay.photoUrl;
                    if (rawPhoto) {
                        setProfileImage(rawPhoto);
                    } else {
                        setProfileImage("/assets/images/user-profile.png");
                    }


                    // Handle Document View Param
                    if (viewParam === 'application') {
                        setActiveTab('My Documents');
                        setShowAppModal(true);
                    } else if (viewParam === 'idcard') {
                        setActiveTab('My Documents');
                        setShowIDModal(true);
                    } else if (viewParam === 'notifications') {
                        setActiveTab('Personal Info');
                    }

                    // Fetch Notifications
                    try {
                        const notifRes = await API.get('/notifications');
                        setNotifications(Array.isArray(notifRes.data) ? notifRes.data : []);
                    } catch (e) {
                        console.warn("Failed to fetch notifications in profile", e);
                    }

                    // Fetch Received Fund Requests for "Announcements" tab
                    try {
                        const fundRequestsRes = await API.get('/fund-requests');
                        if (fundRequestsRes.data) {
                            const memberInfo = JSON.parse(sessionStorage.getItem('memberInfo')) || JSON.parse(sessionStorage.getItem('adminInfo')) || JSON.parse(sessionStorage.getItem('savedUser'));
                            const currentId = memberInfo?._id || memberInfo?.id;

                            // Cutoff date to clear existing test data (April 7, 2026, 10:20 PM)
                            const cutoffDate = new Date('2026-04-07T22:20:00Z');

                            // Filter requests where someone else requested FOR this user AND it's a new request
                            const requests = Array.isArray(fundRequestsRes.data) ? fundRequestsRes.data : [];
                            const received = requests.filter(req => {
                                const isOtherUser = req.requestedBy?._id && req.requestedBy._id !== currentId;
                                const isNewRequest = new Date(req.createdAt) > cutoffDate;
                                return isOtherUser && isNewRequest;
                            });
                            setReceivedRequests(received);
                        }
                    } catch (e) {
                        console.warn("Failed to fetch fund requests in profile", e);
                    }
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [location.search, viewParam]); // React to URL changes

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
            const adminInfo = JSON.parse(sessionStorage.getItem('adminInfo'));

            const submitData = new FormData();
            submitData.append('name', formData.name);
            submitData.append('surname', formData.surname);
            submitData.append('email', formData.email);
            submitData.append('mobileNumber', formData.mobileNumber);
            submitData.append('dob', formData.dob);
            submitData.append('gender', formData.gender);

            // Nested Objects as JSON strings
            submitData.append('address', JSON.stringify(formData.address));
            submitData.append('permanentAddress', JSON.stringify(formData.permanentAddress));

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

            // Using API utility automatically handles cookies and FormData content-type usually
            const targetId = formData._id || formData.mewsId;
            const response = await API.put(`/members/${targetId}`, submitData);

            if (response.data) {
                const storedAdmin = JSON.parse(sessionStorage.getItem('adminInfo'));
                const storedMember = JSON.parse(sessionStorage.getItem('memberInfo'));

                // Reload data to ensure everything is in sync correctly
                const updatedMember = response.data;
                const updatedName = `${updatedMember.surname} ${updatedMember.name}`;

                if (storedAdmin) {
                    if (updatedMember.photoUrl) storedAdmin.photoUrl = updatedMember.photoUrl;
                    storedAdmin.name = updatedName;
                    sessionStorage.setItem('adminInfo', JSON.stringify(storedAdmin));
                }
                if (storedMember) {
                    if (updatedMember.photoUrl) storedMember.photoUrl = updatedMember.photoUrl;
                    storedMember.name = updatedName;
                    sessionStorage.setItem('memberInfo', JSON.stringify(storedMember));
                }

                if (updatedMember.photoUrl) {
                    setProfileImage(updatedMember.photoUrl);
                }

                setOriginalData(formData);
                setIsEditing(false); // Toggle back to view mode
                alert("Profile Updated Successfully!");
                window.dispatchEvent(new Event('storage'));
            } else {
                alert("Failed to update profile");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            alert(`Failed to update profile: ${error.response?.data?.message || error.message}`);
        } finally {
            setSaving(false);
        }
    };

    const toggleEdit = () => {
        setIsEditing(!isEditing);
    };

    const handleCancel = () => {
        setFormData(originalData); // Restore original data
        setIsEditing(false);
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


    const navigate = useNavigate(); // Hook for navigation

    const handleViewMember = (member) => {
        // Instead of just setting state, Navigate to URL with param
        // This gives the "New Page" behavior (browser history, back button)
        navigate(`?view_member_id=${member._id || member.mewsId}`);
    };

    // Helper to go back to main list
    const handleBackToFamily = () => {
        navigate(location.pathname); // Clear query params
        setActiveTab('Family Members'); // Switch back to list tab
    };

    // Handle Download Application PDF
    const handleDownloadApplication = async () => {
        const element = document.getElementById('application-form-print');
        if (!element) return;

        // Temporarily show the element to capture it (it is hidden inside PrintPortal)
        element.classList.remove('hidden');

        try {
            const pages = element.querySelectorAll('.print-page');
            const pdf = new jsPDF('p', 'mm', 'a4');

            for (let i = 0; i < pages.length; i++) {
                const page = pages[i];

                // Use html2canvas
                const canvas = await html2canvas(page, {
                    scale: 2, // Higher scale for better quality
                    useCORS: true,
                    logging: false,
                    windowWidth: 794, // 210mm in px at 96 DPI
                    windowHeight: 1123, // 297mm in px
                    backgroundColor: '#ffffff'
                });

                const imgData = canvas.toDataURL('image/png');
                const imgWidth = 210; // A4 Width in mm
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                if (i > 0) pdf.addPage();

                // Add image (0, 0 because the padding is INSIDE the captured element)
                pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            }

            pdf.save(`MEWS_Application_${formData?.mewsId || 'Form'}.pdf`);

        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Failed to generate PDF. Please try again.");
        } finally {
            // Hide it again
            element.classList.add('hidden');
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
                                <button onClick={handleDownloadApplication} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700">
                                    <FaDownload /> Download Form
                                </button>
                                <button onClick={() => setShowAppModal(false)} className="text-gray-500 hover:text-red-500">
                                    <FaTimes size={20} />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-auto bg-gray-100 p-8">
                            {/* Render inside correct print container styles */}
                            <div id="application-form-print" className="bg-white shadow-lg mx-auto max-w-[210mm] min-h-[297mm]">
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
                <div id="application-form-print" className="hidden print:block">
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

            {/* Dashboard Link */}
            <div className="mb-6">
                <button onClick={() => navigate(-1)} className="text-secondary hover:text-amber-600 flex items-center gap-2 text-sm font-bold transition-all w-fit">
                    <FaArrowLeft size={12} /> Back
                </button>
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden min-h-[500px]">

                {/* Back Button for Family View */}
                {viewingMemberId && (
                    <div className="bg-blue-50 px-8 py-3 border-b border-blue-100">
                        <button
                            onClick={handleBackToFamily}
                            className="flex items-center gap-2 text-primary font-bold hover:underline text-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                            Back to Family List
                        </button>
                    </div>
                )}

                {/* Tabs Header */}
                <div className="flex border-b border-gray-200 overflow-x-auto bg-gray-50/50 px-4 md:px-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 md:px-6 py-4 font-semibold text-sm transition-all whitespace-nowrap border-b-2 ${activeTab === tab.id
                                ? 'text-primary border-primary bg-white'
                                : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-100/50'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="p-6 md:p-8">
                    {/* Tab 1 Content */}
                    {activeTab === 'Personal Info' && (
                        <div className="animate-fadeIn w-full">
                            {isNotificationsMode ? (
                                <NotificationsTab
                                    title={tabs.find(t => t.id === 'Personal Info')?.header}
                                    notifications={notifications}
                                    onMarkRead={async (id) => {
                                        try {
                                            await API.put(`/notifications/${id}/read`);
                                            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
                                        } catch (e) {
                                            console.warn("Failed to mark notification as read", e);
                                        }
                                    }}
                                />
                            ) : (
                                <PersonalInfoTab 
                                    formData={formData} 
                                    handleChange={handleChange} 
                                    isEditing={isEditing}
                                    toggleEdit={toggleEdit}
                                    onSave={handleSave}
                                    onCancel={handleCancel}
                                    profileImage={profileImage}
                                    onPhotoClick={() => setShowCamera(true)}
                                    saving={saving}
                                />
                            )}
                        </div>
                    )}

                    {/* Tab 2 Content */}
                    {activeTab === 'My Documents' && (
                        <div className="animate-fadeIn">
                            {isNotificationsMode ? (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                                                <FaHandHoldingHeart size={18} />
                                            </div>
                                            <div className="text-left">
                                                <h2 className="font-bold text-xl text-gray-800">{tabs.find(t => t.id === 'My Documents')?.header}</h2>
                                                <p className="text-xs text-gray-500">Fund requests initiated by others on your behalf</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="bg-gray-50/50 text-gray-500 text-[10px] uppercase tracking-wider border-b border-gray-100">
                                                        <th className="py-4 pl-6 font-bold text-left">Beneficiary Name</th>
                                                        <th className="py-4 font-bold text-left">District</th>
                                                        <th className="py-4 font-bold text-left">Mandal</th>
                                                        <th className="py-4 font-bold text-left">Village / Municipality</th>
                                                        <th className="py-4 font-bold text-left">Description / Reasons</th>
                                                        <th className="py-4 font-bold text-left">Target Amount</th>
                                                        <th className="py-4 font-bold text-left">Date Of Raised Request</th>
                                                        <th className="py-4 font-bold text-left">Payment Status</th>
                                                        <th className="py-4 pr-6 text-right font-bold">Pay Now</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {receivedRequests.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="9" className="py-12 text-center text-gray-400 text-sm">
                                                                <div className="flex flex-col items-center gap-2">
                                                                    <FaHandHoldingHeart className="text-gray-200" size={40} />
                                                                    No fund requests found.
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        receivedRequests.map((req) => (
                                                            <FundRequestRow key={req._id} request={req} />
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <DocumentsTab
                                    onOpenApp={() => setShowAppModal(true)}
                                    onOpenID={() => setShowIDModal(true)}
                                />
                            )}
                        </div>
                    )}

                    {/* Tab 3 Content */}
                    {activeTab === 'Family Members' && (
                        <FamilyMembersTab
                            title={tabs.find(t => t.id === 'Family Members')?.header}
                            members={familyList}
                            onMemberClick={handleViewMember}
                        />
                    )}
                </div>
            </div>
        </div >
    );
};

export default ProfileSettings;
