import React, { useState, useEffect } from 'react';
import API from '../api';
import axios from 'axios'; // Direct import for file upload to bypass interceptor issues
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
                {options.map(opt => {
                    const optionValue = typeof opt === 'object' ? opt.value : opt;
                    const optionLabel = typeof opt === 'object' ? opt.label : opt;
                    return <option key={optionValue} value={optionValue}>{optionLabel}</option>
                })}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
        </div>
    </div>
);

// File Upload Component
const FileUpload = ({ label, name, onChange, colSpan = "col-span-1" }) => (
    <div className={colSpan}>
        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
            {label}
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition cursor-pointer text-center h-[52px] box-border relative group">
            <div className="absolute inset-0 flex items-center justify-center gap-2 text-gray-500 group-hover:text-blue-600">
                <FaUpload size={14} />
                <span className="text-xs font-bold">Choose File</span>
            </div>
            <input
                type="file"
                name={name}
                onChange={onChange}
                className="opacity-0 absolute inset-0 cursor-pointer"
            />
        </div>
    </div>
);

const MemberRegistration = () => {
    const navigate = useNavigate();

    // Form State
    const [formData, setFormData] = useState({
        surname: '',
        name: '',
        fatherName: '',
        dob: '',
        age: '',
        gender: '',
        mobileNumber: '',
        bloodGroup: '',
        alternateMobile: '',
        email: '',
        aadhaarNumber: '',

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

        // Caste
        caste: '',
        subCaste: '',
        communityCertNumber: '',

        // Marriage
        maritalStatus: '',
        partnerName: '',
        partnerCaste: '',
        partnerSubCaste: '',
        isInterCaste: '',
        marriageCertNumber: '',
        marriageDate: '',

        // Family
        fatherOccupation: '',
        motherOccupation: '',
        annualIncome: '',
        memberCount: '',
        dependentCount: '',
        rationCardTypeFamily: '', // unique name to avoid conflict

        // Ration Card
        rationCardNumber: '',
        rationCardType: '',
        rationCardHolderName: '',

        // Voter ID
        epicNumber: '',
        voterName: '',
        pollingBooth: '',

        // Bank
        bankName: '',
        branchName: '',
        accountNumber: '',
        ifscCode: '',
        holderName: '',
        presentState: 'Telangana',
        permState: 'Telangana'
    });

    const [files, setFiles] = useState({});
    const [loading, setLoading] = useState(false);
    const [sameAsPresent, setSameAsPresent] = useState(false);

    // Location Lists
    const [districts, setDistricts] = useState([]);
    const [mandals, setMandals] = useState([]);
    const [villages, setVillages] = useState([]);

    const [permMandals, setPermMandals] = useState([]);
    const [permVillages, setPermVillages] = useState([]);

    // Fetch Districts on Mount (Specifically for Telangana)
    useEffect(() => {
        const fetchDistricts = async () => {
            try {
                // Get all states
                const { data: states } = await API.get('/locations?type=STATE');

                // Find Telangana specifically
                const telangana = states.find(s => s.name === 'Telangana');

                if (telangana) {
                    const { data: dists } = await API.get(`/locations?parent=${telangana._id}`);
                    setDistricts(dists);
                } else if (states.length > 0) {
                    // Fallback to first state if Telangana not found (though it should be)
                    const { data: dists } = await API.get(`/locations?parent=${states[0]._id}`);
                    setDistricts(dists);
                }
            } catch (error) {
                console.error("Error fetching locations", error);
            }
        };
        fetchDistricts();
    }, []);

    // Handle Present Address District Change
    const handleDistrictChange = async (e) => {
        const districtId = e.target.value;
        console.log(`[UI] District ID Selected: ${districtId}`);

        // Store ID directly in formData
        setFormData(prev => ({
            ...prev,
            presentDistrict: districtId,
            presentMandal: '',
            presentVillage: ''
        }));
        setMandals([]);
        setVillages([]);

        if (districtId) {
            try {
                // Fetch children using ID directly
                const { data } = await API.get(`/locations?parent=${districtId}`);
                console.log(`[API] Fetched ${data.length} mandals`);
                setMandals(data);
            } catch (error) {
                console.error("[API] Error fetching mandals", error);
            }
        }
    };

    // Handle Present Address Mandal Change
    const handleMandalChange = async (e) => {
        const mandalId = e.target.value;
        console.log(`[UI] Mandal ID Selected: ${mandalId}`);

        setFormData(prev => ({
            ...prev,
            presentMandal: mandalId,
            presentVillage: ''
        }));
        setVillages([]);

        if (mandalId) {
            try {
                const { data } = await API.get(`/locations?parent=${mandalId}`);
                console.log(`[API] Fetched ${data.length} villages`);
                setVillages(data);
            } catch (error) {
                console.error("[API] Error fetching villages", error);
            }
        }
    };

    // Handle Permanent Address District Change
    const handlePermDistrictChange = async (e) => {
        const districtId = e.target.value;

        setFormData(prev => ({ ...prev, permDistrict: districtId, permMandal: '', permVillage: '' }));
        setPermMandals([]);
        setPermVillages([]);

        if (districtId) {
            try {
                const { data } = await API.get(`/locations?parent=${districtId}`);
                setPermMandals(data);
            } catch (error) {
                console.error("Error fetching perm mandals", error);
            }
        }
    };

    // Handle Permanent Address Mandal Change
    const handlePermMandalChange = async (e) => {
        const mandalId = e.target.value;

        setFormData(prev => ({ ...prev, permMandal: mandalId, permVillage: '' }));
        setPermVillages([]);

        if (mandalId) {
            try {
                const { data } = await API.get(`/locations?parent=${mandalId}`);
                setPermVillages(data);
            } catch (error) {
                console.error("Error fetching perm villages", error);
            }
        }
    };

    // Handle Input Change (Generalized)
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            if (sameAsPresent && name.startsWith('present')) {
                const permField = name.replace('present', 'perm');
                newData[permField] = value;
            }
            return newData;
        });
    };

    // Handle File Change
    const handleFileChange = (e) => {
        const { name, files: selectedFiles } = e.target;
        if (selectedFiles && selectedFiles[0]) {
            setFiles(prev => ({ ...prev, [name]: selectedFiles[0] }));
        }
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Manual Validation for Mandatory Fields not covered by HTML5 required
            if (!files.photo) {
                alert("Please upload a Member Photo.");
                return;
            }
            if (!formData.gender) {
                alert("Please select a Gender.");
                return;
            }

            const dataPayload = new FormData();

            // Append all text data
            Object.keys(formData).forEach(key => {
                dataPayload.append(key, formData[key]);
            });

            // Append files (only if they exist)
            Object.keys(files).forEach(key => {
                const file = files[key];
                if (file instanceof File) {
                    dataPayload.append(key, file);
                }
            });

            // Standard Axios call - let it handle headers automatically
            // USING DIRECT AXIOS CALL to avoid any global interceptor interference with FormData
            const { data } = await axios.post('http://localhost:5000/api/members', dataPayload);

            // Passing the ACTUAL created member data (with ID) to next page
            navigate('/admin/members/generate-id', { state: { newMember: data } });
        } catch (error) {
            console.error(error);
            alert('Failed to register member: ' + (error.response?.data?.message || error.message));
        }
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
                                required
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
                                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Gender</label>
                                <div className="flex items-center gap-6 mt-3">
                                    <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="gender" value="Male" onChange={handleChange} className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" /> <span className="text-sm text-gray-700">Male</span></label>
                                    <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="gender" value="Female" onChange={handleChange} className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" /> <span className="text-sm text-gray-700">Female</span></label>
                                    <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="gender" value="Other" onChange={handleChange} className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" /> <span className="text-sm text-gray-700">Other</span></label>
                                </div>
                            </div>

                            <FormInput label="Mobile Number" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} placeholder="Enter 10-digit mobile number" required />
                            <FormSelect label="Blood Group" name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} options={["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]} />
                            <FormInput label="Alternate Mobile Number" name="alternateMobile" value={formData.alternateMobile} onChange={handleChange} placeholder="Enter alternate mobile number" />

                            <FormInput label="Email Address" name="email" value={formData.email} onChange={handleChange} placeholder="Enter email address" colSpan="md:col-span-2" />
                            <FormInput label="Aadhar Number" name="aadhaarNumber" value={formData.aadhaarNumber} onChange={handleChange} placeholder="Enter 12-digit Aadhar number" required />
                        </div>

                        {/* Present Address Info */}
                        <SectionHeader title="Present Address" icon={FaMapMarkerAlt} />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormInput
                                label="State"
                                name="presentState"
                                value="Telangana"
                                disabled={true}
                                placeholder="Telangana"
                            />
                            <FormSelect
                                label="District"
                                name="presentDistrict"
                                value={formData.presentDistrict}
                                onChange={handleDistrictChange}
                                options={districts.map(d => ({ value: d._id, label: d.name }))}
                                required
                            />
                            <FormSelect
                                label="Mandal"
                                name="presentMandal"
                                value={formData.presentMandal}
                                onChange={handleMandalChange}
                                options={mandals.map(m => ({ value: m._id, label: m.name }))}
                                required
                            />
                            <FormSelect
                                label="Village/Town"
                                name="presentVillage"
                                value={formData.presentVillage}
                                onChange={handleChange}
                                options={villages.map(v => ({ value: v._id, label: v.name }))}
                                required
                            />

                            <FormInput
                                label="House No."
                                name="presentHouseNo"
                                value={formData.presentHouseNo}
                                onChange={handleChange}
                                placeholder="e.g. 1-123"
                                required
                            />
                            <FormInput
                                label="Street Name / Colony"
                                name="presentStreet"
                                value={formData.presentStreet}
                                onChange={handleChange}
                                placeholder="e.g. Main Road, Ambedkar Colony"
                                required
                            />
                            <FormInput
                                label="Landmark"
                                name="presentLandmark"
                                value={formData.presentLandmark}
                                onChange={handleChange}
                                placeholder="e.g. Near Water Tank"
                                required
                            />

                            <FormInput
                                label="Pincode"
                                name="presentPincode"
                                value={formData.presentPincode}
                                onChange={handleChange}
                                placeholder="Enter pincode"
                                required
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
                            <FormInput
                                label="State"
                                name="permState"
                                value="Telangana"
                                disabled={true}
                                placeholder="Telangana"
                            />
                            <FormSelect
                                label="District"
                                name="permDistrict"
                                value={formData.permDistrict}
                                onChange={handlePermDistrictChange}
                                options={districts.map(d => ({ value: d._id, label: d.name }))}
                                disabled={sameAsPresent}
                                required={!sameAsPresent}
                            />
                            <FormSelect
                                label="Mandal"
                                name="permMandal"
                                value={formData.permMandal}
                                onChange={handlePermMandalChange}
                                options={sameAsPresent
                                    ? mandals.map(m => ({ value: m._id, label: m.name }))
                                    : permMandals.map(m => ({ value: m._id, label: m.name }))}
                                disabled={sameAsPresent}
                                required={!sameAsPresent}
                            />
                            <FormSelect
                                label="Village/Town"
                                name="permVillage"
                                value={formData.permVillage}
                                onChange={handleChange}
                                options={sameAsPresent
                                    ? villages.map(v => ({ value: v._id, label: v.name }))
                                    : permVillages.map(v => ({ value: v._id, label: v.name }))}
                                required={!sameAsPresent}
                                disabled={sameAsPresent}
                            />

                            <FormInput
                                label="House No."
                                name="permHouseNo"
                                value={formData.permHouseNo}
                                onChange={handleChange}
                                placeholder="e.g. 1-123"
                                disabled={sameAsPresent}
                                required={!sameAsPresent}
                            />
                            <FormInput
                                label="Street Name / Colony"
                                name="permStreet"
                                value={formData.permStreet}
                                onChange={handleChange}
                                placeholder="e.g. Main Road, Ambedkar Colony"
                                disabled={sameAsPresent}
                                required={!sameAsPresent}
                            />
                            <FormInput
                                label="Landmark"
                                name="permLandmark"
                                value={formData.permLandmark}
                                onChange={handleChange}
                                placeholder="e.g. Near Water Tank"
                                disabled={sameAsPresent}
                                required={!sameAsPresent}
                            />

                            <FormInput
                                label="Pincode"
                                name="permPincode"
                                value={formData.permPincode}
                                onChange={handleChange}
                                placeholder="Enter pincode"
                                disabled={sameAsPresent}
                                required={!sameAsPresent}
                            />
                        </div>


                        {/* Caste & Community */}
                        <SectionHeader title="Caste & Community Information" icon={FaUsers} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormSelect label="Member's Caste" name="caste" value={formData.caste} onChange={handleChange} options={["BC-A", "BC-B", "BC-D", "SC", "ST", "OC"]} required />
                            <FormInput label="Member's Sub-Caste" name="subCaste" value={formData.subCaste} onChange={handleChange} placeholder="Enter sub-caste" />

                            <FormInput label="Community Certificate Number" name="communityCertNumber" value={formData.communityCertNumber} onChange={handleChange} placeholder="Enter certificate number" />
                            <FileUpload label="Community Certificate Upload" name="communityCert" onChange={handleFileChange} fileName={files.communityCert?.name} />
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

                                    <FormInput label="Partner's Name" name="partnerName" value={formData.partnerName} onChange={handleChange} placeholder="Enter partner's name" />
                                    <FormSelect label="Partner's Caste" name="partnerCaste" value={formData.partnerCaste} onChange={handleChange} options={["BC-A", "BC-B", "BC-C", "BC-D", "BC-E", "SC", "ST", "OC", "Other"]} />

                                    <FormInput label="Partner's Sub-Caste" name="partnerSubCaste" value={formData.partnerSubCaste} onChange={handleChange} placeholder="Enter partner's sub-caste" />
                                    <div className="col-span-1">
                                        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Inter-Caste Marriage</label>
                                        <div className="flex items-center gap-6 mt-3">
                                            <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="isInterCaste" value="Yes" onChange={handleChange} className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" /> <span className="text-sm text-gray-700">Yes</span></label>
                                            <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="isInterCaste" value="No" onChange={handleChange} className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" /> <span className="text-sm text-gray-700">No</span></label>
                                        </div>
                                    </div>

                                    <FormInput label="Marriage Certificate Number" name="marriageCertNumber" value={formData.marriageCertNumber} onChange={handleChange} placeholder="Enter certificate number" />
                                    <FileUpload label="Marriage Certificate Upload" name="marriageCert" onChange={handleFileChange} fileName={files.marriageCert?.name} />
                                    <FormInput label="Marriage Date" name="marriageDate" value={formData.marriageDate} onChange={handleChange} placeholder="mm/dd/yyyy" type="date" />
                                </>
                            )}
                        </div>

                        {/* Family & Economic */}
                        <SectionHeader title="Family & Economic Information" icon={FaRupeeSign} />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormInput label="Father's Occupation" name="fatherOccupation" value={formData.fatherOccupation} onChange={handleChange} placeholder="Enter father's occupation" />
                            <FormInput label="Mother's Occupation" name="motherOccupation" value={formData.motherOccupation} onChange={handleChange} placeholder="Enter mother's occupation" />
                            <FormInput
                                label="Annual Family Income"
                                name="annualIncome"
                                value={formData.annualIncome}
                                onChange={handleChange}
                                placeholder="Enter numeric income"
                            />
                            {/* Removed Select and using Input for simplicity as per quick fix request, or keeping Select without required */}
                            {/* Let's keep the Select but remove required */}

                            <FormSelect
                                label="Annual Family Income"
                                name="annualIncome"
                                value={formData.annualIncome}
                                onChange={handleChange}
                                options={[
                                    { label: "< 1 Lakh", value: "50000" },
                                    { label: "1-3 Lakhs", value: "200000" },
                                    { label: "> 3 Lakhs", value: "400000" }
                                ]}
                            />

                            <FormInput label="Number of Family Members" name="memberCount" value={formData.memberCount} onChange={handleChange} placeholder="Enter number" type="number" />
                            <FormInput label="Number of Dependents" name="dependentCount" value={formData.dependentCount} onChange={handleChange} placeholder="Enter number" type="number" />
                            <FormSelect label="Ration Card Type" name="rationCardTypeFamily" value={formData.rationCardTypeFamily} onChange={handleChange} options={["Food Security Card (White)", "Antyodaya Anna Yojana (Pink)", "Annapurna Scheme"]} />
                        </div>

                        {/* Ration Card */}
                        <SectionHeader title="Ration Card Details" icon={FaIdCard} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput label="Ration Card Number" name="rationCardNumber" value={formData.rationCardNumber} onChange={handleChange} placeholder="Enter ration card number" />
                            <FormSelect label="Ration Card Type" name="rationCardType" value={formData.rationCardType} onChange={handleChange} options={["Food Security Card (White)", "Antyodaya Anna Yojana (Pink)", "Annapurna Scheme"]} />
                            <FormInput label="Ration Card Holder Name" name="rationCardHolderName" value={formData.rationCardHolderName} onChange={handleChange} placeholder="Enter card holder name" />
                            <FileUpload label="Upload Ration Card" name="rationCardFile" onChange={handleFileChange} fileName={files.rationCardFile?.name} />
                        </div>

                        {/* Voter ID */}
                        <SectionHeader title="Voter ID Details" icon={FaVoteYea} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput label="Voter ID Number (EPIC Number)" name="epicNumber" value={formData.epicNumber} onChange={handleChange} placeholder="Enter EPIC number" />
                            <FormInput label="Voter Name as per Card" name="voterName" value={formData.voterName} onChange={handleChange} placeholder="Enter name as per voter ID" />
                            <FormInput label="Polling Booth Number" name="pollingBooth" value={formData.pollingBooth} onChange={handleChange} placeholder="Enter booth number" />
                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FileUpload label="Upload Voter ID Front" name="voterIdFront" onChange={handleFileChange} fileName={files.voterIdFront?.name} />
                                <FileUpload label="Upload Voter ID Back" name="voterIdBack" onChange={handleFileChange} fileName={files.voterIdBack?.name} />
                            </div>
                        </div>

                        {/* Bank Account */}
                        <SectionHeader title="Bank Account Information" icon={FaUniversity} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput label="Bank Name" name="bankName" value={formData.bankName} onChange={handleChange} placeholder="Enter bank name" required />
                            <FormInput label="Branch Name" name="branchName" value={formData.branchName} onChange={handleChange} placeholder="Enter branch name" required />
                            <FormInput label="Account Number" name="accountNumber" value={formData.accountNumber} onChange={handleChange} placeholder="Enter account number" required />
                            <FormInput label="IFSC Code" name="ifscCode" value={formData.ifscCode} onChange={handleChange} placeholder="Enter IFSC code" required />
                            <FormInput label="Account Holder Name" name="holderName" value={formData.holderName} onChange={handleChange} placeholder="Should match member name" required />
                            <FileUpload label="Bank Passbook Upload" name="bankPassbook" onChange={handleFileChange} fileName={files.bankPassbook?.name} />
                        </div>

                        {/* Document Uploads */}
                        <SectionHeader title="Document Uploads" icon={FaFileImage} />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition cursor-pointer text-center relative group ${files.photo ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}>
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                                    <FaFileImage className={files.photo ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-500'} />
                                </div>
                                <h4 className="text-sm font-bold text-gray-700">{files.photo ? files.photo.name : <>Member Photo</>}</h4>
                                <p className="text-xs text-gray-400 mt-1">{files.photo ? 'Click to change' : 'Click to upload photo'}</p>
                                <button type="button" className="mt-3 text-blue-600 text-xs font-bold hover:underline">Choose File</button>
                                <input type="file" name="photo" onChange={handleFileChange} className="opacity-0 absolute inset-0 cursor-pointer" />
                            </div>
                            <div className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition cursor-pointer text-center relative group ${files.aadhaarFront ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}>
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                                    <FaIdCard className={files.aadhaarFront ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-500'} />
                                </div>
                                <h4 className="text-sm font-bold text-gray-700">{files.aadhaarFront ? files.aadhaarFront.name : "Aadhar Card Front"}</h4>
                                <p className="text-xs text-gray-400 mt-1">{files.aadhaarFront ? 'Click to change' : 'Upload front side'}</p>
                                <button type="button" className="mt-3 text-blue-600 text-xs font-bold hover:underline">Choose File</button>
                                <input type="file" name="aadhaarFront" onChange={handleFileChange} className="opacity-0 absolute inset-0 cursor-pointer" />
                            </div>
                            <div className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition cursor-pointer text-center relative group ${files.aadhaarBack ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}>
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                                    <FaIdCard className={files.aadhaarBack ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-500'} />
                                </div>
                                <h4 className="text-sm font-bold text-gray-700">{files.aadhaarBack ? files.aadhaarBack.name : "Aadhar Card Back"}</h4>
                                <p className="text-xs text-gray-400 mt-1">{files.aadhaarBack ? 'Click to change' : 'Upload back side'}</p>
                                <button type="button" className="mt-3 text-blue-600 text-xs font-bold hover:underline">Choose File</button>
                                <input type="file" name="aadhaarBack" onChange={handleFileChange} className="opacity-0 absolute inset-0 cursor-pointer" />
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

                            <button type="submit" disabled={loading} className={`px-8 py-3 bg-[#1e2a4a] text-white font-bold rounded-xl hover:bg-[#2a3b66] transition shadow-md flex items-center gap-2 ${loading ? 'opacity-70 cursor-wait' : ''}`}>
                                {loading ? 'Registering...' : 'Submit & Approve'} <FaSave className="ml-1" />
                            </button>
                        </div>

                    </form>
                </main>
            </div>
        </div>
    );
};

export default MemberRegistration;
