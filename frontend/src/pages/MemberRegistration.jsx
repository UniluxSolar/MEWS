import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    FaArrowLeft, FaShieldAlt, FaSave, FaEraser, FaUpload,
    FaCalendarAlt, FaIdCard, FaMapMarkerAlt, FaUsers, FaRing,
    FaRupeeSign, FaVoteYea, FaUniversity, FaFileImage, FaChevronRight,
    FaHome, FaCheckSquare,
    // Admin Layout Icons
    FaThLarge, FaBuilding, FaExclamationTriangle, FaFileAlt,
    FaHandHoldingUsd, FaChartLine, FaCog, FaQuestionCircle, FaBullhorn,
    FaSignOutAlt, FaSearch, FaBell, FaChevronDown
} from 'react-icons/fa';

// Sidebar Item Component
const SidebarItem = ({ icon: Icon, label, active, to }) => (
    <Link to={to || '#'} className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors mb-1 ${active ? 'bg-[#1e2a4a] text-white font-bold' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 font-medium'}`}>
        <Icon size={18} className={active ? 'text-white' : 'text-gray-400'} />
        <span className="text-sm">{label}</span>
    </Link>
);

// Section Header Component
const SectionHeader = ({ title, icon: Icon }) => (
    <div className="flex items-center gap-3 mb-6 mt-8 pb-2 border-b border-gray-100">
        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Icon size={16} />
        </div>
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
    </div>
);

// Form Input Component
const FormInput = ({ label, placeholder, type = "text", required = false, colSpan = "col-span-1", value, onChange, name, disabled = false }) => (
    <div className={colSpan}>
        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={`w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-400 ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`}
            placeholder={placeholder}
        />
    </div>
);

// Form Select Component
const FormSelect = ({ label, options, required = false, colSpan = "col-span-1", value, onChange, name, disabled = false }) => (
    <div className={colSpan}>
        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
            <select
                name={name}
                value={value}
                onChange={onChange}
                disabled={disabled}
                className={`w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none cursor-pointer ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`}
            >
                <option value="">Select {label}</option>
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
        </div>
    </div>
);

// File Upload Component
const FileUpload = ({ label, colSpan = "col-span-1" }) => (
    <div className={colSpan}>
        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
            {label}
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition cursor-pointer text-center h-[52px] box-border relative group">
            <div className="absolute inset-0 flex items-center justify-center gap-2 text-gray-500 group-hover:text-blue-600">
                <FaUpload size={14} />
                <span className="text-xs font-bold">Choose File</span>
            </div>
            <input type="file" className="opacity-0 absolute inset-0 cursor-pointer" />
        </div>
    </div>
);

const MemberRegistration = () => {
    const navigate = useNavigate();

    // Form State
    const [formData, setFormData] = useState({
        dob: '',
        age: '',
        maritalStatus: '',

        // Present Address
        presentDistrict: '',
        presentMandal: '',
        presentVillage: '',
        presentHouseNo: '',
        presentStreet: '',
        presentLandmark: '',
        presentPincode: '',
        residenceType: '',

        // Permanent Address
        permDistrict: '',
        permMandal: '',
        permVillage: '',
        permHouseNo: '',
        permStreet: '',
        permLandmark: '',
        permPincode: '',
    });

    const [sameAsPresent, setSameAsPresent] = useState(false);

    // Handle Input Change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };

            // If sameAsPresent is true and we are changing a present address field, update permanent address too
            if (sameAsPresent && name.startsWith('present')) {
                const permField = name.replace('present', 'perm');
                newData[permField] = value;
            }

            return newData;
        });
    };

    // Handle Checkbox Change
    const handleSameAsPresentChange = (e) => {
        const checked = e.target.checked;
        setSameAsPresent(checked);

        if (checked) {
            setFormData(prev => ({
                ...prev,
                permDistrict: prev.presentDistrict,
                permMandal: prev.presentMandal,
                permVillage: prev.presentVillage,
                permHouseNo: prev.presentHouseNo,
                permStreet: prev.presentStreet,
                permLandmark: prev.presentLandmark,
                permPincode: prev.presentPincode,
            }));
        }
    };

    // Auto-calculate Age
    useEffect(() => {
        if (formData.dob) {
            const birthDate = new Date(formData.dob);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            setFormData(prev => ({ ...prev, age: age >= 0 ? age : 0 }));
        } else {
            setFormData(prev => ({ ...prev, age: '' }));
        }
    }, [formData.dob]);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here you would typically send data to backend
        // For now, we simulate success and redirect
        // Passing the form data to the next page
        navigate('/admin/members/generate-id', { state: { newMember: formData } });
    };

    return (
        <div className="min-h-screen bg-[#f3f4f6] font-sans flex flex-col">
            {/* Top Header (Copied from AdminDashboard) */}
            <header className="bg-[#0f172a] text-white h-16 flex items-center justify-between px-4 z-20 shadow-md">
                <div className="flex items-center gap-12">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-500/50">
                            <FaShieldAlt className="text-blue-400" />
                        </div>
                        <div>
                            <div className="font-bold text-lg leading-none">MEWS 2.0</div>
                            <div className="text-[10px] text-gray-400 leading-none mt-1">Peddakaparthy Village Admin</div>
                        </div>
                    </div>
                    <div className="relative hidden md:block w-96">
                        <FaSearch className="absolute left-3 top-2.5 text-gray-400 text-sm" />
                        <input
                            type="text"
                            placeholder="Search members, activities..."
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-9 pr-4 text-sm text-gray-300 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <button className="hidden sm:flex items-center gap-2 bg-[#f59e0b] hover:bg-amber-600 text-slate-900 px-3 py-1.5 rounded text-xs font-bold transition">
                        <FaExclamationTriangle /> Live SOS: 0
                    </button>
                    <div className="relative cursor-pointer">
                        <FaBell className="text-gray-400 hover:text-white transition" />
                        <span className="absolute -top-1.5 -right-1.5 bg-[#f59e0b] text-slate-900 w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold">2</span>
                    </div>
                    <div className="flex items-center gap-2 pl-4 border-l border-slate-700 cursor-pointer">
                        <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Admin" className="w-8 h-8 rounded-full border border-slate-500" />
                        <FaChevronDown size={10} className="text-gray-400" />
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar (Copied from AdminDashboard) */}
                <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col overflow-y-auto">
                    <div className="p-4 space-y-1">
                        <SidebarItem to="/admin/dashboard" icon={FaThLarge} label="Village Dashboard" />
                        <SidebarItem to="/admin/members" icon={FaUsers} label="Member Management" active={true} />
                        <SidebarItem icon={FaBuilding} label="Institution Management" />
                        <SidebarItem icon={FaExclamationTriangle} label="SOS Management" />
                        <SidebarItem icon={FaFileAlt} label="Reports & Analytics" />
                        <SidebarItem icon={FaHandHoldingUsd} label="Funding Requests" />
                        <SidebarItem icon={FaChartLine} label="Activity Logs" />
                        <SidebarItem icon={FaCog} label="Village Settings" />
                        <SidebarItem icon={FaQuestionCircle} label="Help & Support" />
                        <SidebarItem icon={FaBullhorn} label="Announcements" />
                    </div>
                    <div className="mt-auto p-4 border-t border-gray-100">
                        <div className="flex items-center gap-3 px-4 py-2 text-red-600 cursor-pointer hover:bg-red-50 rounded-lg transition-colors font-medium text-sm">
                            <FaSignOutAlt />
                            <span>Logout</span>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    {/* Page Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Add New Member</h1>
                            <p className="text-sm text-gray-500 mt-1">Register a new village member with complete profile information</p>
                        </div>
                        <Link to="/admin/members" className="bg-[#1e2a4a] hover:bg-[#2a3b66] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition">
                            <FaArrowLeft size={12} /> Back to Members
                        </Link>
                    </div>

                    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">

                        {/* Basic Info */}
                        <SectionHeader title="Member Basic Information" icon={FaIdCard} />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormInput
                                label="Sur Name"
                                name="surname"
                                value={formData.surname || ''}
                                onChange={handleChange}
                                placeholder="Enter surname"
                                required
                            />
                            <FormInput
                                label="Name"
                                name="name"
                                value={formData.name || ''}
                                onChange={handleChange}
                                placeholder="Enter full name"
                                required
                            />
                            <FormInput
                                label="Father's Name"
                                name="fatherName"
                                value={formData.fatherName || ''}
                                onChange={handleChange}
                                placeholder="Enter father's name"
                            />

                            <FormInput
                                label="Date of Birth"
                                name="dob"
                                value={formData.dob}
                                onChange={handleChange}
                                placeholder="mm/dd/yyyy"
                                type="date"
                                required
                            />
                            <FormInput
                                label="Age"
                                value={formData.age}
                                placeholder="Auto-calculated"
                                disabled={true}
                            />
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Gender <span className="text-red-500">*</span></label>
                                <div className="flex items-center gap-6 mt-3">
                                    <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="gender" className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" /> <span className="text-sm text-gray-700">Male</span></label>
                                    <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="gender" className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" /> <span className="text-sm text-gray-700">Female</span></label>
                                    <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="gender" className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" /> <span className="text-sm text-gray-700">Other</span></label>
                                </div>
                            </div>

                            <FormInput label="Mobile Number" placeholder="Enter 10-digit mobile number" required />
                            <FormSelect label="Blood Group" options={["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]} />
                            <FormInput label="Alternate Mobile Number" placeholder="Enter alternate mobile number" />

                            <FormInput label="Email Address" placeholder="Enter email address" colSpan="md:col-span-2" />
                            <FormInput label="Aadhar Number" placeholder="Enter 12-digit Aadhar number" />
                        </div>

                        {/* Present Address Info */}
                        <SectionHeader title="Present Address" icon={FaMapMarkerAlt} />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormSelect
                                label="District"
                                name="presentDistrict"
                                value={formData.presentDistrict}
                                onChange={handleChange}
                                options={["Nalgonda", "Suryapet", "Yadadri Bhuvanagiri", "Ranga Reddy", "Hyderabad"]}
                                required
                            />
                            <FormSelect
                                label="Mandal"
                                name="presentMandal"
                                value={formData.presentMandal}
                                onChange={handleChange}
                                options={["Chityal", "Narketpally", "Nakrekal", "Kakatipally", "Munugode"]}
                                required
                            />
                            <FormSelect
                                label="Village/Town"
                                name="presentVillage"
                                value={formData.presentVillage}
                                onChange={handleChange}
                                options={["Peddakaparthy", "Veliminedu", "Aitipamula", "Chityal Town", "Gundlapally"]}
                                required
                            />

                            <FormInput
                                label="House No."
                                name="presentHouseNo"
                                value={formData.presentHouseNo}
                                onChange={handleChange}
                                placeholder="e.g. 1-123"
                            />
                            <FormInput
                                label="Street Name / Colony"
                                name="presentStreet"
                                value={formData.presentStreet}
                                onChange={handleChange}
                                placeholder="e.g. Main Road, Ambedkar Colony"
                            />
                            <FormInput
                                label="Landmark"
                                name="presentLandmark"
                                value={formData.presentLandmark}
                                onChange={handleChange}
                                placeholder="e.g. Near Water Tank"
                            />

                            <FormInput
                                label="Pincode"
                                name="presentPincode"
                                value={formData.presentPincode}
                                onChange={handleChange}
                                placeholder="Enter pincode"
                            />

                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Residence Type</label>
                                <div className="flex items-center gap-6 mt-2">
                                    <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="residenceType" className="w-4 h-4 text-blue-600" /> <span className="text-sm text-gray-700">Owned (Permanent)</span></label>
                                    <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="residenceType" className="w-4 h-4 text-blue-600" /> <span className="text-sm text-gray-700">Rented</span></label>
                                    <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="residenceType" className="w-4 h-4 text-blue-600" /> <span className="text-sm text-gray-700">Family Property / Ancestral</span></label>
                                </div>
                            </div>
                        </div>

                        {/* Permanent Address Info */}
                        <div className="flex items-center justify-between border-b border-gray-100 mb-6 mt-8 pb-2">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <FaHome size={16} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800">Permanent Address</h3>
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100 transition">
                                <input
                                    type="checkbox"
                                    checked={sameAsPresent}
                                    onChange={handleSameAsPresentChange}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                                />
                                <span className="text-sm font-bold text-blue-800">Same as Present Address</span>
                            </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormSelect
                                label="District"
                                name="permDistrict"
                                value={formData.permDistrict}
                                onChange={handleChange}
                                options={["Nalgonda", "Suryapet", "Yadadri Bhuvanagiri", "Ranga Reddy", "Hyderabad"]}
                                required
                                disabled={sameAsPresent}
                            />
                            <FormSelect
                                label="Mandal"
                                name="permMandal"
                                value={formData.permMandal}
                                onChange={handleChange}
                                options={["Chityal", "Narketpally", "Nakrekal", "Kakatipally", "Munugode"]}
                                required
                                disabled={sameAsPresent}
                            />
                            <FormSelect
                                label="Village/Town"
                                name="permVillage"
                                value={formData.permVillage}
                                onChange={handleChange}
                                options={["Peddakaparthy", "Veliminedu", "Aitipamula", "Chityal Town", "Gundlapally"]}
                                required
                                disabled={sameAsPresent}
                            />

                            <FormInput
                                label="House No."
                                name="permHouseNo"
                                value={formData.permHouseNo}
                                onChange={handleChange}
                                placeholder="e.g. 1-123"
                                disabled={sameAsPresent}
                            />
                            <FormInput
                                label="Street Name / Colony"
                                name="permStreet"
                                value={formData.permStreet}
                                onChange={handleChange}
                                placeholder="e.g. Main Road, Ambedkar Colony"
                                disabled={sameAsPresent}
                            />
                            <FormInput
                                label="Landmark"
                                name="permLandmark"
                                value={formData.permLandmark}
                                onChange={handleChange}
                                placeholder="e.g. Near Water Tank"
                                disabled={sameAsPresent}
                            />

                            <FormInput
                                label="Pincode"
                                name="permPincode"
                                value={formData.permPincode}
                                onChange={handleChange}
                                placeholder="Enter pincode"
                                disabled={sameAsPresent}
                            />
                        </div>


                        {/* Caste & Community */}
                        <SectionHeader title="Caste & Community Information" icon={FaUsers} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormSelect label="Member's Caste" options={["BC-A", "BC-B", "BC-D", "SC", "ST", "OC"]} required />
                            <FormInput label="Member's Sub-Caste" placeholder="Enter sub-caste" />

                            <FormInput label="Community Certificate Number" placeholder="Enter certificate number" />
                            <FileUpload label="Community Certificate Upload" />
                        </div>

                        {/* Marriage Info - Conditional */}
                        <SectionHeader title="Marriage & Partner Information" icon={FaRing} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormSelect
                                label="Marital Status"
                                name="maritalStatus"
                                value={formData.maritalStatus}
                                onChange={handleChange}
                                options={["Unmarried", "Married", "Divorced", "Widowed"]}
                                required
                            />

                            {formData.maritalStatus === 'Married' && (
                                <>
                                    <div className="hidden md:block"></div> {/* Spacer */}

                                    <FormInput label="Partner's Name" placeholder="Enter partner's name" />
                                    <FormSelect label="Partner's Caste" options={["BC-A (Backward Class A)", "Other"]} />

                                    <FormInput label="Partner's Sub-Caste" placeholder="Enter partner's sub-caste" />
                                    <div className="col-span-1">
                                        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Inter-Caste Marriage</label>
                                        <div className="flex items-center gap-6 mt-3">
                                            <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="intercaste" className="w-4 h-4 text-blue-600" /> <span className="text-sm text-gray-700">Yes</span></label>
                                            <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="intercaste" className="w-4 h-4 text-blue-600" /> <span className="text-sm text-gray-700">No</span></label>
                                        </div>
                                    </div>

                                    <FormInput label="Marriage Certificate Number" placeholder="Enter certificate number" />
                                    <FileUpload label="Marriage Certificate Upload" />
                                    <FormInput label="Marriage Date" placeholder="mm/dd/yyyy" type="date" />
                                </>
                            )}
                        </div>

                        {/* Family & Economic */}
                        <SectionHeader title="Family & Economic Information" icon={FaRupeeSign} />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormInput label="Father's Occupation" placeholder="Enter father's occupation" />
                            <FormInput label="Mother's Occupation" placeholder="Enter mother's occupation" />
                            <FormSelect label="Annual Family Income" options={["< 1 Lakh", "1-3 Lakhs", "> 3 Lakhs"]} required />

                            <FormInput label="Number of Family Members" placeholder="Enter number" type="number" />
                            <FormInput label="Number of Dependents" placeholder="Enter number" type="number" />
                            <FormSelect label="Ration Card Type" options={["Food Security Card (White)", "Antyodaya Anna Yojana (Pink)", "Annapurna Scheme"]} />
                        </div>

                        {/* Ration Card */}
                        <SectionHeader title="Ration Card Details" icon={FaIdCard} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput label="Ration Card Number" placeholder="Enter ration card number" />
                            <FormSelect label="Ration Card Type" options={["Food Security Card (White)", "Antyodaya Anna Yojana (Pink)", "Annapurna Scheme"]} />
                            <FormInput label="Ration Card Holder Name" placeholder="Enter card holder name" />
                            <FileUpload label="Upload Ration Card" />
                        </div>

                        {/* Voter ID */}
                        <SectionHeader title="Voter ID Details" icon={FaVoteYea} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput label="Voter ID Number (EPIC Number)" placeholder="Enter EPIC number" />
                            <FormInput label="Voter Name as per Card" placeholder="Enter name as per voter ID" />
                            <FormInput label="Polling Booth Number" placeholder="Enter booth number" />
                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FileUpload label="Upload Voter ID Front" />
                                <FileUpload label="Upload Voter ID Back" />
                            </div>
                        </div>

                        {/* Bank Account */}
                        <SectionHeader title="Bank Account Information" icon={FaUniversity} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput label="Bank Name" placeholder="Enter bank name" required />
                            <FormInput label="Branch Name" placeholder="Enter branch name" />
                            <FormInput label="Account Number" placeholder="Enter account number" required />
                            <FormInput label="IFSC Code" placeholder="Enter IFSC code" required />
                            <FormInput label="Account Holder Name" placeholder="Should match member name" />
                            <FileUpload label="Bank Passbook Upload" />
                        </div>

                        {/* Document Uploads */}
                        <SectionHeader title="Document Uploads" icon={FaFileImage} />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition cursor-pointer text-center relative group">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                                    <FaFileImage className="text-gray-400 group-hover:text-blue-500" />
                                </div>
                                <h4 className="text-sm font-bold text-gray-700">Member Photo <span className="text-red-500">*</span></h4>
                                <p className="text-xs text-gray-400 mt-1">Click to upload photo</p>
                                <button type="button" className="mt-3 text-blue-600 text-xs font-bold hover:underline">Choose File</button>
                                <input type="file" className="opacity-0 absolute inset-0 cursor-pointer" />
                            </div>
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition cursor-pointer text-center relative group">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                                    <FaIdCard className="text-gray-400 group-hover:text-blue-500" />
                                </div>
                                <h4 className="text-sm font-bold text-gray-700">Aadhar Card Front</h4>
                                <p className="text-xs text-gray-400 mt-1">Upload front side</p>
                                <button type="button" className="mt-3 text-blue-600 text-xs font-bold hover:underline">Choose File</button>
                                <input type="file" className="opacity-0 absolute inset-0 cursor-pointer" />
                            </div>
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition cursor-pointer text-center relative group">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                                    <FaIdCard className="text-gray-400 group-hover:text-blue-500" />
                                </div>
                                <h4 className="text-sm font-bold text-gray-700">Aadhar Card Back</h4>
                                <p className="text-xs text-gray-400 mt-1">Upload back side</p>
                                <button type="button" className="mt-3 text-blue-600 text-xs font-bold hover:underline">Choose File</button>
                                <input type="file" className="opacity-0 absolute inset-0 cursor-pointer" />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-4 pt-6 border-t border-gray-100 mt-8">
                            <button type="button" className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition shadow-sm flex items-center gap-2">
                                <FaEraser /> Clear Form
                            </button>
                            <button type="button" onClick={() => navigate(-1)} className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition shadow-sm">
                                Cancel
                            </button>
                            <div className="flex-1"></div>

                            <button type="submit" className="px-8 py-3 bg-[#1e2a4a] text-white font-bold rounded-xl hover:bg-[#2a3b66] transition shadow-md flex items-center gap-2">
                                Submit & Approve <FaSave className="ml-1" />
                            </button>
                        </div>

                    </form>
                </main>
            </div>
        </div>
    );
};

export default MemberRegistration;
