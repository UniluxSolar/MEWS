import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    FaCamera, FaEdit, FaCheckCircle, FaSave, FaTimes, FaArrowLeft, FaFileAlt, FaIdCard, FaPrint
} from 'react-icons/fa';
import API from '../api';
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
            <InputField label="Email Address" name="email" value={formData.email} onChange={handleChange} disabled={true} />
            <InputField label="Mobile Number" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} verified={true} disabled={true} />
        </div>

        <div className="flex flex-wrap gap-6">
            <InputField label="Date of Birth" name="dob" value={formData.dob} onChange={handleChange} type="date" disabled={true} />
            <div className="flex-1 min-w-[300px]">
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Gender</label>
                <input
                    type="text"
                    value={formData.gender}
                    disabled={true}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 bg-gray-100 text-gray-500"
                />
            </div>
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
                <InputField label="Pincode" name="address.pinCode" value={formData.address?.pinCode} onChange={handleChange} disabled={true} />
            </div>

            <div className="flex flex-wrap gap-6">
                <InputField label="House Number" name="address.houseNumber" value={formData.address?.houseNumber} onChange={handleChange} disabled={true} />
                <InputField label="Street" name="address.street" value={formData.address?.street} onChange={handleChange} disabled={true} />
            </div>
        </div>
    </div>
);

const FamilyMembersTab = ({ members, onMemberClick }) => {
    // Filter out the current user for display, but keep original list for count
    const displayMembers = members ? members.filter(m => !m.isCurrentUser) : [];
    const totalCount = members ? members.length : 0;

    return (
        <div className="animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-900">Family Members ({totalCount})</h3>
                {/* Add Member restricted to Village Admin only */}
            </div>

            {displayMembers.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    <p className="text-gray-500 text-sm">No other family members found.</p>
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
                                    src={member.photo || "/assets/images/user-profile.png"} // Dependent usually has 'photo', Head has 'photoUrl'. Normalized in useEffect, but good to check.
                                    alt={member.name}
                                    className="w-12 h-12 rounded-full object-cover border border-gray-200"
                                />
                                {member.isHead && (
                                    <span className="absolute -bottom-1 -right-1 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white">
                                        HEAD
                                    </span>
                                )}
                            </div>
                            <div>
                                <p className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                    {member.name} {member.surname}
                                </p>
                                <p className="text-xs text-gray-500">{member.relation} • {member.age} Years</p>
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

const MOCK_NOTIFICATIONS_HISTORY = [
    {
        id: 1,
        title: "Application Approved",
        description: "Your membership application has been successfully verified and approved by the admin.",
        date: "Jan 15, 2026 • 10:30 AM",
        isUnread: true,
        type: 'success'
    },
    {
        id: 2,
        title: "New Scholarship Available",
        description: "Applications are now open for the 'Merit Excellence Scholarship 2026'. Apply before Feb 28.",
        date: "Jan 12, 2026 • 09:15 AM",
        isUnread: false,
        type: 'info'
    },
    {
        id: 3,
        title: "Profile Update Reminder",
        description: "Please verify your current address and family member details for the annual census.",
        date: "Jan 05, 2026 • 02:00 PM",
        isUnread: false,
        type: 'warning'
    },
    {
        id: 4,
        title: "Donation Receipt Generated",
        description: "Thank you for your donation! Your 80G tax receipt is now available for download.",
        date: "Dec 28, 2025 • 04:45 PM",
        isUnread: false,
        type: 'success'
    }
];

const NotificationsTab = () => (
    <div className="animate-fadeIn">
        <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900">Recent Notifications</h3>
            <button className="text-xs font-bold text-secondary hover:underline">Mark all as read</button>
        </div>

        <div className="space-y-4">
            {MOCK_NOTIFICATIONS_HISTORY.map((notification) => (
                <div
                    key={notification.id}
                    className={`flex items-start gap-4 p-4 rounded-xl border transition-all hover:bg-gray-50 ${notification.isUnread ? 'bg-blue-50/50 border-blue-100' : 'bg-white border-gray-100'}`}
                >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 
                        ${notification.type === 'success' ? 'bg-green-100 text-green-600' :
                            notification.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                                'bg-blue-100 text-blue-600'}`}>
                        <FaCheckCircle size={16} />
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <h4 className={`text-sm font-bold mb-1 ${notification.isUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                                {notification.title}
                                {notification.isUnread && <span className="ml-2 w-2 h-2 bg-red-500 rounded-full inline-block"></span>}
                            </h4>
                            <span className="text-xs text-gray-400 whitespace-nowrap">{notification.date}</span>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">{notification.description}</p>
                    </div>
                </div>
            ))}
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
            houseNumber: '',
            street: '',
            pinCode: ''
        },
        fullAddress: '', // Helper logic for display if needed, or split fields
        familyMembers: [], // Array for family members
        mewsId: '',
        createdAt: ''
    });

    const [isReadOnly, setIsReadOnly] = useState(false); // New state for View Only mode
    const [viewingMemberId, setViewingMemberId] = useState(null); // Track if we are viewing a specific family member

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
                const adminInfo = JSON.parse(localStorage.getItem('adminInfo'));
                // Use adminInfo._id to target specific member if needed, or rely on /auth/me or /members/me
                // Since this component uses /members/:id, we need the ID. Login provides it.
                if (!adminInfo?._id) return;

                // Determine Read Only Mode
                // If the user is a 'member' (not admin), enforce Read Only
                // Assuming 'adminInfo.role' is available, or based on user request "member login totally on View mode"
                // We will assume mostly ALL logins here are members unless role says 'admin'
                if (adminInfo.role !== 'admin') {
                    setIsReadOnly(true);
                }

                const response = await API.get(`/members/${adminInfo._id}`);

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
                        presentAddress: data.address
                    };

                    const dependents = (response.data.familyMembers || []).map(fm => ({
                        ...fm,
                        memberType: 'DEPENDENT',
                        // Ensure photos are handled if they exist
                        photo: fm.photo || fm.photoUrl
                    }));

                    // Unified List
                    const allMembers = [headMember, ...dependents];

                    // Mark Current User and Determine their Relation to Head
                    // adminInfo.memberId is the ID of the logged-in user (Dependent or Head)
                    const currentMemberId = adminInfo.memberId || adminInfo._id;

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
                            memberToDisplay = { ...foundInFamily, address: foundInFamily.presentAddress || data.address }; // Use family member data
                            setActiveTab('Personal Info'); // Force tab
                        }
                    } else if (adminInfo.memberId && adminInfo.memberId !== adminInfo._id) {
                        // Default Dependent Login view
                        const foundMember = data.familyMembers?.find(fm => (fm._id === adminInfo.memberId || fm.mewsId === adminInfo.memberId));
                        if (foundMember) {
                            memberToDisplay = {
                                ...data,
                                ...foundMember,
                                address: foundMember.presentAddress || data.address,
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
                            return val || headAddr?.[f]?.name || (typeof headAddr?.[f] === 'string' ? headAddr?.[f] : '') || '';
                        };

                        return {
                            state: getField('state') || 'Telangana',
                            district: getField('district'),
                            mandal: getField('mandal'),
                            village: getField('village'),
                            houseNumber: memberAddr?.houseNumber || headAddr?.houseNumber || '',
                            street: memberAddr?.street || headAddr?.street || '',
                            pinCode: memberAddr?.pinCode || headAddr?.pinCode || ''
                        };
                    }

                    const finalAddress = resolveAddress(memberToDisplay.address || memberToDisplay.presentAddress, headAddress);

                    setFormData({
                        ...memberToDisplay,
                        mewsId: memberToDisplay.mewsId || memberToDisplay.memberId || 'PENDING',
                        name: memberToDisplay.name || '',
                        surname: memberToDisplay.surname || '',
                        mobileNumber: memberToDisplay.mobileNumber || '',
                        email: memberToDisplay.email || '',
                        gender: memberToDisplay.gender || '',
                        address: finalAddress,
                        dob: memberToDisplay.dob ? memberToDisplay.dob.split('T')[0] : '',
                        familyMembers: response.data.familyMembers || []
                    });

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

            // Using API utility automatically handles cookies and FormData content-type usually
            const response = await API.put(`/members/${adminInfo._id}`, submitData);

            if (response.data) {
                const storedAdmin = JSON.parse(localStorage.getItem('adminInfo'));

                // If backend returns the updated member, we can update local storage logic if needed
                // But usually we just re-fetch in useEffect or update photo displayed
                // Let's see if we can get the new photo URL from response if needed
                const updatedMember = response.data;
                if (updatedMember.photoUrl) {
                    setProfileImage(updatedMember.photoUrl);
                    // Update adminInfo in localStorage if photo changed?
                    if (storedAdmin) {
                        storedAdmin.photoUrl = updatedMember.photoUrl;
                        localStorage.setItem('adminInfo', JSON.stringify(storedAdmin));
                        window.dispatchEvent(new Event('storage'));
                    }
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

    const getImageUrl = (url) => {
        if (!url) return "/assets/images/user-profile.png";
        if (url.startsWith('http') || url.startsWith('data:')) return url;

        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const baseUrl = apiUrl.replace(/\/api$/, '');
        const cleanUrl = url.startsWith('/') ? url : `/${url}`;
        return `${baseUrl}${cleanUrl}`;
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

            {/* Dashboard Link */}
            <div className="mb-6">
                <Link to="/dashboard" className="text-secondary hover:text-amber-600 flex items-center gap-2 text-sm font-bold transition-all w-fit">
                    <FaArrowLeft size={12} /> Back to Dashboard
                </Link>
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
                    {['Personal Info', 'My Documents', 'Family Members', 'Notifications'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 md:px-6 py-4 font-semibold text-sm transition-all whitespace-nowrap border-b-2 ${activeTab === tab
                                ? 'text-primary border-primary bg-white'
                                : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-100/50'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="p-6 md:p-8">
                    {activeTab === 'Personal Info' && (
                        <div className="animate-fadeIn w-full">
                            {/* Profile Header Section */}
                            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-10 pb-8 border-b border-gray-100">
                                <div className="relative group shrink-0">
                                    <div className="w-32 h-32 rounded-full ring-4 ring-white shadow-lg overflow-hidden relative">
                                        <img
                                            src={getImageUrl(profileImage)}
                                            alt="Profile"
                                            className="w-full h-full object-cover bg-gray-100"
                                        />
                                        {!isReadOnly && (
                                            <div
                                                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm"
                                                onClick={() => document.getElementById('photo-upload').click()}
                                            >
                                                <FaCamera className="text-white text-2xl" />
                                            </div>
                                        )}
                                    </div>
                                    {!isReadOnly && (
                                        <input
                                            type="file"
                                            id="photo-upload"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    if (file.size > 5242880) {
                                                        alert("File size exceeds 5 MB. Please upload a smaller file.");
                                                        e.target.value = null;
                                                        return;
                                                    }
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        setProfileImage(reader.result);
                                                        setFormData(prev => ({ ...prev, photoUrl: reader.result }));
                                                    }
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                    )}
                                </div>
                                <div className="text-center md:text-left flex-1">
                                    <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                                        <h1 className="text-3xl font-bold text-gray-900">{formData.name} {formData.surname}</h1>
                                        {isReadOnly && (
                                            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full border border-gray-200">
                                                View Only
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-400">ID:</span>
                                            <span className="font-mono text-primary bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                                {/* Display logic: Valid ID or PENDING */}
                                                {(formData.mewsId && formData.mewsId !== 'PENDING') ? formData.mewsId : 'PENDING'}
                                            </span>
                                        </div>
                                        {formData.dob && (
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-400">Born:</span>
                                                <span className="text-gray-700">{formData.dob}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                {/* Personal Details Column */}
                                <div className="space-y-6">
                                    <h3 className="text-lg font-bold text-gray-900 border-l-4 border-primary pl-3">Personal Details</h3>

                                    <div className="grid gap-6">
                                        <div className="group">
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">First Name</label>
                                            {isReadOnly ? (
                                                <p className="text-gray-900 font-medium text-lg border-b border-gray-100 py-1">{formData.name}</p>
                                            ) : (
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none transition"
                                                />
                                            )}
                                        </div>

                                        <div className="group">
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Surname</label>
                                            {isReadOnly ? (
                                                <p className="text-gray-900 font-medium text-lg border-b border-gray-100 py-1">{formData.surname}</p>
                                            ) : (
                                                <input
                                                    type="text"
                                                    name="surname"
                                                    value={formData.surname}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none transition"
                                                />
                                            )}
                                        </div>

                                        <div className="group">
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Mobile Number</label>
                                            {isReadOnly ? (
                                                <p className="text-gray-900 font-medium text-lg border-b border-gray-100 py-1 flex items-center gap-2">
                                                    {formData.mobileNumber}
                                                </p>
                                            ) : (
                                                <input
                                                    type="text"
                                                    name="mobileNumber"
                                                    value={formData.mobileNumber}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none transition"
                                                />
                                            )}
                                        </div>

                                        <div className="group">
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email</label>
                                            {isReadOnly ? (
                                                <p className="text-gray-900 font-medium text-lg border-b border-gray-100 py-1">{formData.email || '-'}</p>
                                            ) : (
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none transition"
                                                />
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="group">
                                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Date of Birth</label>
                                                {isReadOnly ? (
                                                    <p className="text-gray-900 font-medium text-lg border-b border-gray-100 py-1">{formData.dob}</p>
                                                ) : (
                                                    <input
                                                        type="date"
                                                        name="dob"
                                                        value={formData.dob}
                                                        onChange={handleChange}
                                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none transition"
                                                    />
                                                )}
                                            </div>
                                            <div className="group">
                                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Gender</label>
                                                {isReadOnly ? (
                                                    <p className="text-gray-900 font-medium text-lg border-b border-gray-100 py-1">{formData.gender}</p>
                                                ) : (
                                                    <select
                                                        name="gender"
                                                        value={formData.gender}
                                                        onChange={handleChange}
                                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none transition"
                                                    >
                                                        <option value="Male">Male</option>
                                                        <option value="Female">Female</option>
                                                        <option value="Other">Other</option>
                                                    </select>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Address Details Column */}
                                <div className="space-y-6">
                                    <h3 className="text-lg font-bold text-gray-900 border-l-4 border-amber-500 pl-3">Address Details</h3>

                                    <div className="grid gap-6">
                                        <div className="group">
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">House Number</label>
                                            {isReadOnly ? (
                                                <p className="text-gray-900 font-medium text-lg border-b border-gray-100 py-1">{formData.address.houseNumber || '-'}</p>
                                            ) : (
                                                <input
                                                    type="text"
                                                    name="address.houseNumber"
                                                    value={formData.address.houseNumber}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none transition"
                                                />
                                            )}
                                        </div>
                                        <div className="group">
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Street / Colony</label>
                                            {isReadOnly ? (
                                                <p className="text-gray-900 font-medium text-lg border-b border-gray-100 py-1">{formData.address.street || '-'}</p>
                                            ) : (
                                                <input
                                                    type="text"
                                                    name="address.street"
                                                    value={formData.address.street}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none transition"
                                                />
                                            )}
                                        </div>
                                        <div className="group">
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Village</label>
                                            {isReadOnly ? (
                                                <p className="text-gray-900 font-medium text-lg border-b border-gray-100 py-1">{formData.address.village || '-'}</p>
                                            ) : (
                                                <input
                                                    type="text"
                                                    name="address.village"
                                                    value={formData.address.village}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none transition"
                                                />
                                            )}
                                        </div>
                                        <div className="group">
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Mandal</label>
                                            {isReadOnly ? (
                                                <p className="text-gray-900 font-medium text-lg border-b border-gray-100 py-1">{formData.address.mandal || '-'}</p>
                                            ) : (
                                                <input
                                                    type="text"
                                                    name="address.mandal"
                                                    value={formData.address.mandal}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none transition"
                                                />
                                            )}
                                        </div>
                                        <div className="group">
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">District</label>
                                            {isReadOnly ? (
                                                <p className="text-gray-900 font-medium text-lg border-b border-gray-100 py-1">{formData.address.district || '-'}</p>
                                            ) : (
                                                <input
                                                    type="text"
                                                    name="address.district"
                                                    value={formData.address.district}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none transition"
                                                />
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="group">
                                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">State</label>
                                                {isReadOnly ? (
                                                    <p className="text-gray-900 font-medium text-lg border-b border-gray-100 py-1">{formData.address.state || 'Telangana'}</p>
                                                ) : (
                                                    <input
                                                        type="text"
                                                        name="address.state"
                                                        value={formData.address.state}
                                                        onChange={handleChange}
                                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none transition"
                                                    />
                                                )}
                                            </div>
                                            <div className="group">
                                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Pin Code</label>
                                                {isReadOnly ? (
                                                    <p className="text-gray-900 font-medium text-lg border-b border-gray-100 py-1">{formData.address.pinCode || '-'}</p>
                                                ) : (
                                                    <input
                                                        type="text"
                                                        name="address.pinCode"
                                                        value={formData.address.pinCode}
                                                        onChange={handleChange}
                                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none transition"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Only Show Update Button if NOT Read Only */}
                            {!isReadOnly && (
                                <div className="pt-8 flex justify-end border-t border-gray-100 mt-8">
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className={`px-8 py-3 bg-gradient-to-r from-primary to-blue-600 text-white font-bold rounded-lg shadow-md hover:shadow-lg transform active:scale-95 transition-all flex items-center gap-2 ${saving ? 'opacity-70 cursor-wait' : ''}`}
                                    >
                                        {saving && <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                                        {saving ? 'Updating...' : 'Update Profile'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'My Documents' && <DocumentsTab onOpenApp={() => setShowAppModal(true)} onOpenID={() => setShowIDModal(true)} />}

                    {activeTab === 'Family Members' && (
                        <FamilyMembersTab
                            members={familyList}
                            onMemberClick={handleViewMember}
                        />
                    )}

                    {activeTab === 'Notifications' && <NotificationsTab />}
                </div>
            </div>
        </div >
    );
};

export default ProfileSettings;
