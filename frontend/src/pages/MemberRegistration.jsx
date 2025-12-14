import React, { useState, useEffect } from 'react';
import API from '../api';
import axios from 'axios'; // Direct import for file upload to bypass interceptor issues
import { Link, useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import {
    FaArrowLeft, FaShieldAlt, FaSave, FaEraser, FaUpload,
    FaCalendarAlt, FaIdCard, FaMapMarkerAlt, FaUsers, FaRing,
    FaRupeeSign, FaVoteYea, FaUniversity, FaFileImage, FaChevronRight,
    FaHome, FaCheckSquare,
    // Admin Layout Icons
    FaThLarge, FaBuilding, FaExclamationTriangle, FaFileAlt,
    FaHandHoldingUsd, FaChartLine, FaCog, FaQuestionCircle, FaBullhorn,
    FaSignOutAlt, FaSearch, FaBell, FaChevronDown, FaDownload
} from 'react-icons/fa';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { getPincode } from '../utils/pincodeData';
import subCastes from '../utils/subCastes.json';
import partnerCastes from '../utils/partnerCastes.json';
import casteSubCastes from '../utils/casteSubCastes.json';



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
const FormInput = ({ label, placeholder, type = "text", required = false, colSpan = "col-span-1", value, onChange, name, disabled = false, error }) => (
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
            className={`w-full bg-white border ${error ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'} rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-400 ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`}
            placeholder={placeholder}
        />
        {error && <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>}
    </div>
);

// Form Select Component
const FormSelect = ({ label, options, required = false, colSpan = "col-span-1", value, onChange, name, disabled = false, error }) => (
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
                className={`w-full bg-white border ${error ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'} rounded-lg px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none cursor-pointer ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`}
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
        {error && <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>}
    </div>
);

// File Upload Component
const FileUpload = ({ label, name, onChange, colSpan = "col-span-1", fileName, error }) => (
    <div className={colSpan}>
        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
            {label}
        </label>
        <div className={`border-2 border-dashed ${error ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'} rounded-lg p-4 flex flex-col items-center justify-center hover:bg-gray-100 transition cursor-pointer text-center h-[52px] box-border relative group`}>
            <div className="absolute inset-0 flex items-center justify-center gap-2 text-gray-500 group-hover:text-blue-600">
                <FaUpload size={14} className={error ? 'text-red-500' : ''} />
                <span className={`text-xs font-bold ${error ? 'text-red-600' : ''}`}>
                    {fileName ? (fileName.length > 20 ? fileName.substring(0, 20) + '...' : fileName) : 'Choose File'}
                </span>
            </div>
            <input
                type="file"
                name={name}
                onChange={onChange}
                className="opacity-0 absolute inset-0 cursor-pointer"
            />
        </div>
        {error && <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>}
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
        caste: 'MALA',
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
        hasRationCard: false, // Control visibility

        // Ration Card
        rationCardNumber: '',
        // rationCardType removed
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
    const [errors, setErrors] = useState({});

    // Occupation Handling
    // Occupation Handling
    const fatherOccupations = [
        "Farmer", "Agricultural Labourer", "Daily Wage Worker", "Private Employee",
        "Government Employee", "Self-Employed", "Businessman", "Professional (Doctor / Engineer / Lawyer / CA)",
        "Driver", "Not Alive", "Other"
    ];

    const motherOccupations = [
        "Homemaker", "Daily Wage Worker", "Private Employee", "Government Employee",
        "Professional (Doctor / Engineer / Lawyer / CA)", "Shop Owner / Vendor", "Not Alive", "Other"
    ];
    const [fatherOccSelect, setFatherOccSelect] = useState('');
    const [motherOccSelect, setMotherOccSelect] = useState('');

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
        const districtName = districts.find(d => d._id === districtId)?.name || ''; // Find Name
        console.log(`[UI] District Selected: ${districtId} (${districtName})`);

        // Store ID AND Name directly in formData
        setFormData(prev => ({
            ...prev,
            presentDistrict: districtId,
            presentDistrictName: districtName, // Store Name
            presentMandal: '',
            presentMandalName: '',
            presentVillage: '',
            presentVillageName: ''
        }));
        setMandals([]);
        setVillages([]);

        if (districtId) {
            try {
                const { data } = await API.get(`/locations?parent=${districtId}`);
                setMandals(data);
            } catch (error) {
                console.error("[API] Error fetching mandals", error);
            }
        }
    };

    // Handle Present Address Mandal Change
    const handleMandalChange = async (e) => {
        const mandalId = e.target.value;
        const mandalName = mandals.find(m => m._id === mandalId)?.name || ''; // Find Name
        console.log(`[UI] Mandal Selected: ${mandalId} (${mandalName})`);

        setFormData(prev => ({
            ...prev,
            presentMandal: mandalId,
            presentMandalName: mandalName, // Store Name
            presentVillage: '',
            presentVillageName: ''
        }));
        setVillages([]);

        if (mandalId) {
            try {
                const { data } = await API.get(`/locations?parent=${mandalId}`);
                setVillages(data);
            } catch (error) {
                console.error("[API] Error fetching villages", error);
            }
        }
    };

    // Handle Present Address Village Change
    const handleVillageChange = (e) => {
        const villageId = e.target.value;
        const village = villages.find(v => v._id === villageId);
        const villageName = village?.name || ''; // Find Name

        let code = village?.pincode || '';

        // Fallback if DB has no pincode
        if (!code && village && formData.presentDistrict && formData.presentMandal) {
            const dist = districts.find(d => d._id === formData.presentDistrict);
            const mand = mandals.find(m => m._id === formData.presentMandal);
            if (dist && mand) {
                code = getPincode(dist.name, mand.name, village.name);
            }
        }

        setFormData(prev => ({
            ...prev,
            presentVillage: villageId,
            presentVillageName: villageName, // Store Name
            presentPincode: code || prev.presentPincode
        }));
    };

    // Handle Permanent Address Village Change
    const handlePermVillageChange = (e) => {
        const villageId = e.target.value;
        const village = permVillages.find(v => v._id === villageId);

        let code = village?.pincode || '';

        // Fallback if DB has no pincode
        if (!code && village && formData.permDistrict && formData.permMandal) {
            const dist = districts.find(d => d._id === formData.permDistrict);
            const mand = sameAsPresent
                ? mandals.find(m => m._id === formData.permMandal)
                : permMandals.find(m => m._id === formData.permMandal);

            if (dist && mand) {
                code = getPincode(dist.name, mand.name, village.name);
            }
        }

        setFormData(prev => ({
            ...prev,
            permVillage: villageId,
            permPincode: code || prev.permPincode
        }));
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

        // Validation Logic
        if (name === 'mobileNumber' || name === 'alternateMobile') {
            // Only allow digits and max 10
            if (!/^\d*$/.test(value)) return;
            if (value.length > 10) return;
        }

        if (name === 'aadhaarNumber') {
            // Only allow digits and max 12
            if (!/^\d*$/.test(value)) return;
            if (value.length > 12) return;
        }

        if (name === 'presentPincode' || name === 'permPincode' || name === 'annualIncome' || name === 'memberCount' || name === 'dependentCount') {
            // Basic number check for other numeric fields if desired, but strict length only for mobile/aadhar
            // Keeping it simple for now as requested specifically for mobile/aadhar
        }


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
            const file = selectedFiles[0];
            // Check size (5MB = 5 * 1024 * 1024 = 5242880 bytes)
            if (file.size > 5242880) {
                alert("File size exceeds 5 MB. Please upload a smaller file.");
                e.target.value = null; // Clear input
                return;
            }

            setFiles(prev => ({ ...prev, [name]: file }));
            // Clear error
            if (errors[name]) {
                setErrors(prev => ({ ...prev, [name]: '' }));
            }
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

    const validateForm = () => {
        const newErrors = {};

        // Basic Info
        if (!formData.surname) newErrors.surname = "Surname is required";
        if (!formData.name) newErrors.name = "Name is required";
        if (!formData.fatherName) newErrors.fatherName = "Father's name is required";
        if (!formData.dob) newErrors.dob = "Date of Birth is required";
        if (!formData.gender) newErrors.gender = "Gender is required";
        if (!formData.mobileNumber) newErrors.mobileNumber = "Mobile number is required";
        else if (formData.mobileNumber.length !== 10) newErrors.mobileNumber = "Mobile number must be 10 digits";
        if (!formData.aadhaarNumber) newErrors.aadhaarNumber = "Aadhaar number is required";
        else if (formData.aadhaarNumber.length !== 12) newErrors.aadhaarNumber = "Aadhaar number must be 12 digits";

        // Present Address
        if (!formData.presentDistrict) newErrors.presentDistrict = "District is required";
        if (!formData.presentMandal) newErrors.presentMandal = "Mandal is required";
        if (!formData.presentVillage) newErrors.presentVillage = "Village is required";
        if (!formData.presentHouseNo) newErrors.presentHouseNo = "House No is required";
        if (!formData.presentPincode) newErrors.presentPincode = "Pincode is required";

        // Permanent Address (if not same)
        if (!sameAsPresent) {
            if (!formData.permDistrict) newErrors.permDistrict = "District is required";
            if (!formData.permMandal) newErrors.permMandal = "Mandal is required";
            if (!formData.permVillage) newErrors.permVillage = "Village is required";
            if (!formData.permHouseNo) newErrors.permHouseNo = "House No is required";
            if (!formData.permPincode) newErrors.permPincode = "Pincode is required";
        }

        // Other Details
        if (!formData.caste) newErrors.caste = "Caste is required";
        if (!formData.maritalStatus) newErrors.maritalStatus = "Marital status is required";

        // Files
        if (!files.photo) newErrors.photo = "Member Photo is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // State for Preview Modal
    const [showPreview, setShowPreview] = useState(false);

    // Initial Submission - Triggers Preview
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setShowPreview(true);
    };

    // State for Success Modal
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [createdMemberData, setCreatedMemberData] = useState(null);

    // Final Submission
    const handleFinalSubmit = async () => {
        setLoading(true);
        try {
            const dataPayload = new FormData();
            Object.keys(formData).forEach(key => {
                dataPayload.append(key, formData[key]);
            });

            Object.keys(files).forEach(key => {
                const file = files[key];
                if (file instanceof File) {
                    dataPayload.append(key, file);
                }
            });

            const { data } = await axios.post('http://localhost:5000/api/members', dataPayload);

            // Show Success Modal instead of immediate navigate
            setCreatedMemberData(data);
            setShowPreview(false);
            setShowSuccessModal(true);

        } catch (error) {
            console.error(error);
            alert('Failed to register member: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const confirmSubmit = () => {
        handleFinalSubmit();
    };

    // PDF Download Logic
    const handleDownloadApplication = async () => {
        const element = document.getElementById('application-form-print');
        if (!element) return;

        try {
            // Temporarily show the element for capture
            element.style.display = 'block';

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            }); // Increased scale for better quality

            element.style.display = 'none'; // Hide again

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Application_${createdMemberData?.mewsId || 'Form'}.pdf`);
        } catch (error) {
            console.error("PDF Gen Error:", error);
            alert("Failed to generate application PDF.");
        }
    };


    return (
        <div className="min-h-screen bg-[#f3f4f6] font-sans flex flex-col">
            {showPreview && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h2 className="text-2xl font-bold text-gray-800">Preview Registration Details</h2>
                            <button onClick={() => setShowPreview(false)} className="text-gray-500 hover:text-red-500">
                                <FaSignOutAlt size={24} className="transform rotate-180" />
                            </button>
                        </div>

                        <div className="p-8 space-y-8">
                            {/* Basic Info Preview */}
                            <div>
                                <h3 className="text-lg font-bold text-blue-700 border-b pb-2 mb-4">Basic Information</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                    <p><span className="font-bold text-gray-600">Surname:</span> {formData.surname}</p>
                                    <p><span className="font-bold text-gray-600">Name:</span> {formData.name}</p>
                                    <p><span className="font-bold text-gray-600">Father's Name:</span> {formData.fatherName}</p>
                                    <p><span className="font-bold text-gray-600">DOB:</span> {formData.dob}</p>
                                    <p><span className="font-bold text-gray-600">Age:</span> {formData.age}</p>
                                    <p><span className="font-bold text-gray-600">Gender:</span> {formData.gender}</p>
                                    <p><span className="font-bold text-gray-600">Mobile:</span> {formData.mobileNumber}</p>
                                    <p><span className="font-bold text-gray-600">Alt Mobile:</span> {formData.alternateMobile || '-'}</p>
                                    <p><span className="font-bold text-gray-600">Email:</span> {formData.email || '-'}</p>
                                    <p><span className="font-bold text-gray-600">Aadhar:</span> {formData.aadhaarNumber}</p>
                                    <p><span className="font-bold text-gray-600">Blood Group:</span> {formData.bloodGroup || '-'}</p>
                                </div>
                            </div>

                            {/* Present Address Preview */}
                            <div>
                                <h3 className="text-lg font-bold text-blue-700 border-b pb-2 mb-4">Present Address</h3>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                    <p><span className="font-bold text-gray-600">State:</span> Telangana</p>
                                    <p><span className="font-bold text-gray-600">District:</span> {districts.find(d => d._id === formData.presentDistrict)?.name || formData.presentDistrict}</p>
                                    <p><span className="font-bold text-gray-600">Mandal:</span> {mandals.find(m => m._id === formData.presentMandal)?.name || formData.presentMandal}</p>
                                    <p><span className="font-bold text-gray-600">Village:</span> {villages.find(v => v._id === formData.presentVillage)?.name || formData.presentVillage}</p>
                                    <p><span className="font-bold text-gray-600">House No:</span> {formData.presentHouseNo}</p>
                                    <p><span className="font-bold text-gray-600">Street:</span> {formData.presentStreet || '-'}</p>
                                    <p><span className="font-bold text-gray-600">Landmark:</span> {formData.presentLandmark || '-'}</p>
                                    <p><span className="font-bold text-gray-600">Pincode:</span> {formData.presentPincode}</p>
                                    <p className="col-span-2"><span className="font-bold text-gray-600">Residence:</span> {formData.residenceType || '-'}</p>
                                </div>
                            </div>

                            {/* Permanent Address Preview */}
                            <div>
                                <h3 className="text-lg font-bold text-blue-700 border-b pb-2 mb-4">Permanent Address</h3>
                                {sameAsPresent ? (
                                    <p className="text-sm text-gray-600 italic">Same as Present Address</p>
                                ) : (
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                        <p><span className="font-bold text-gray-600">State:</span> Telangana</p>
                                        <p><span className="font-bold text-gray-600">District:</span> {districts.find(d => d._id === formData.permDistrict)?.name || formData.permDistrict}</p>
                                        <p><span className="font-bold text-gray-600">Mandal:</span> {permMandals.find(m => m._id === formData.permMandal)?.name || formData.permMandal}</p>
                                        <p><span className="font-bold text-gray-600">Village:</span> {permVillages.find(v => v._id === formData.permVillage)?.name || formData.permVillage}</p>
                                        <p><span className="font-bold text-gray-600">House No:</span> {formData.permHouseNo}</p>
                                        <p><span className="font-bold text-gray-600">Street:</span> {formData.permStreet || '-'}</p>
                                        <p><span className="font-bold text-gray-600">Landmark:</span> {formData.permLandmark || '-'}</p>
                                        <p><span className="font-bold text-gray-600">Pincode:</span> {formData.permPincode}</p>
                                    </div>
                                )}
                            </div>

                            {/* Caste & Community Info */}
                            <div>
                                <h3 className="text-lg font-bold text-blue-700 border-b pb-2 mb-4">Caste & Community</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                    <p><span className="font-bold text-gray-600">Caste:</span> {formData.caste}</p>
                                    <p><span className="font-bold text-gray-600">Sub-Caste:</span> {formData.subCaste || '-'}</p>
                                    <p><span className="font-bold text-gray-600">Comm Cert No:</span> {formData.communityCertNumber || '-'}</p>
                                </div>
                            </div>

                            {/* Marriage Info */}
                            <div>
                                <h3 className="text-lg font-bold text-blue-700 border-b pb-2 mb-4">Marriage Information</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                    <p><span className="font-bold text-gray-600">Status:</span> {formData.maritalStatus}</p>
                                    {formData.maritalStatus === 'Married' && (
                                        <>
                                            <p><span className="font-bold text-gray-600">Partner Name:</span> {formData.partnerName}</p>
                                            <p><span className="font-bold text-gray-600">Inter-Caste:</span> {formData.isInterCaste}</p>
                                            <p><span className="font-bold text-gray-600">Partner Caste:</span> {formData.partnerCaste || '-'}</p>
                                            <p><span className="font-bold text-gray-600">Partner Sub-Caste:</span> {formData.partnerSubCaste || '-'}</p>
                                            <p><span className="font-bold text-gray-600">Marriage Date:</span> {formData.marriageDate || '-'}</p>
                                            <p><span className="font-bold text-gray-600">Cert No:</span> {formData.marriageCertNumber || '-'}</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Family & Economic */}
                            <div>
                                <h3 className="text-lg font-bold text-blue-700 border-b pb-2 mb-4">Family & Economic</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                    <p><span className="font-bold text-gray-600">Father Occ:</span> {formData.fatherOccupation}</p>
                                    <p><span className="font-bold text-gray-600">Mother Occ:</span> {formData.motherOccupation}</p>
                                    <p><span className="font-bold text-gray-600">Annual Income:</span> {formData.annualIncome}</p>
                                    <p><span className="font-bold text-gray-600">Family Members:</span> {formData.memberCount}</p>
                                    <p><span className="font-bold text-gray-600">Dependents:</span> {formData.dependentCount}</p>
                                    <p><span className="font-bold text-gray-600">Ration Card Type:</span> {formData.rationCardTypeFamily || '-'}</p>
                                </div>
                            </div>

                            {/* Other IDs */}
                            <div>
                                <h3 className="text-lg font-bold text-blue-700 border-b pb-2 mb-4">Other Details</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                    <p className="col-span-2"><span className="font-bold text-gray-600">Ration Card:</span> {formData.hasRationCard ? `${formData.rationCardNumber} (${formData.rationCardHolderName})` : 'Not Added'}</p>
                                    <p className="col-span-2"><span className="font-bold text-gray-600">Voter ID:</span> {formData.epicNumber} ({formData.voterName}), Booth: {formData.pollingBooth}</p>
                                    <p className="col-span-2"><span className="font-bold text-gray-600">Bank:</span> {formData.bankName}, Acc: {formData.accountNumber}, IFSC: {formData.ifscCode}</p>
                                </div>
                            </div>

                            {/* Files */}
                            <div>
                                <h3 className="text-lg font-bold text-blue-700 border-b pb-2 mb-4">Uploaded Documents</h3>
                                <ul className="list-disc pl-5 text-sm text-gray-600 grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <li><span className="font-bold">Photo:</span> {files.photo ? files.photo.name : 'Not Uploaded'}</li>
                                    <li><span className="font-bold">Community Cert:</span> {files.communityCert ? files.communityCert.name : 'Not Uploaded'}</li>
                                    <li><span className="font-bold">Aadhar Front:</span> {files.aadhaarFront ? files.aadhaarFront.name : 'Not Uploaded'}</li>
                                    <li><span className="font-bold">Aadhar Back:</span> {files.aadhaarBack ? files.aadhaarBack.name : 'Not Uploaded'}</li>
                                    <li><span className="font-bold">Ration Card:</span> {files.rationCardFile ? files.rationCardFile.name : 'Not Uploaded'}</li>
                                    <li><span className="font-bold">Voter Front:</span> {files.voterIdFront ? files.voterIdFront.name : 'Not Uploaded'}</li>
                                    <li><span className="font-bold">Voter Back:</span> {files.voterIdBack ? files.voterIdBack.name : 'Not Uploaded'}</li>
                                    <li><span className="font-bold">Bank Passbook:</span> {files.bankPassbook ? files.bankPassbook.name : 'Not Uploaded'}</li>
                                </ul>
                            </div>

                        </div>

                        <div className="p-6 border-t bg-gray-50 flex justify-end gap-4 sticky bottom-0">
                            <button
                                onClick={() => setShowPreview(false)}
                                className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 transition"
                            >
                                Edit Details
                            </button>
                            <button
                                onClick={confirmSubmit}
                                disabled={loading}
                                className="px-6 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg transform hover:-translate-y-0.5 transition flex items-center gap-2"
                            >
                                {loading ? 'Submitting...' : 'Confirm & Register'} <FaCheckSquare />
                            </button>
                        </div>
                    </div>
                </div>
            )}


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
                <AdminSidebar activePage="members" />

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
                                error={errors.surname}
                            />
                            <FormInput
                                label="Name"
                                name="name"
                                value={formData.name || ''}
                                onChange={handleChange}
                                placeholder="Enter full name"
                                required
                                error={errors.name}
                            />
                            <FormInput
                                label="Father's Name"
                                name="fatherName"
                                value={formData.fatherName || ''}
                                onChange={handleChange}
                                placeholder="Enter father's name"
                                required
                                error={errors.fatherName}
                            />

                            <FormInput
                                label="Date of Birth"
                                name="dob"
                                value={formData.dob}
                                onChange={(e) => {
                                    const selectedDate = e.target.value;
                                    const today = new Date().toISOString().split('T')[0];
                                    if (selectedDate === today) {
                                        alert("Date of Birth cannot be today's date.");
                                        e.target.value = '';
                                        return;
                                    }
                                    handleChange(e);
                                }}
                                type="date"
                                max={new Date().toISOString().split('T')[0]}
                                required
                                error={errors.dob}
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
                                {errors.gender && <p className="text-red-500 text-xs mt-1 font-medium">{errors.gender}</p>}
                            </div>

                            <FormInput
                                label="Mobile Number"
                                name="mobileNumber"
                                value={formData.mobileNumber}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    // Allow typing only if digits
                                    if (/^\d*$/.test(val) && val.length <= 10) {
                                        handleChange(e);
                                    }
                                    // Strict validation on blur or separate check
                                }}
                                placeholder="Enter 10-digit mobile number"
                                required
                                error={errors.mobileNumber}
                            />
                            <FormSelect
                                label="Blood Group"
                                name="bloodGroup"
                                value={formData.bloodGroup}
                                onChange={handleChange}
                                options={["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-", "Oh (Bombay Blood Group)"]}
                            />
                            <FormInput label="Alternate Mobile Number" name="alternateMobile" value={formData.alternateMobile} onChange={handleChange} placeholder="Enter alternate mobile number" />

                            <FormInput label="Email Address" name="email" value={formData.email} onChange={handleChange} placeholder="Enter email address" colSpan="md:col-span-2" />
                            <FormInput label="Aadhar Number" name="aadhaarNumber" value={formData.aadhaarNumber} onChange={handleChange} placeholder="Enter 12-digit Aadhar number" required error={errors.aadhaarNumber} />

                            {/* Member Photo removed from here as requested, moved to bottom */}
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
                                error={errors.presentDistrict}
                            />
                            <FormSelect
                                label="Mandal"
                                name="presentMandal"
                                value={formData.presentMandal}
                                onChange={handleMandalChange}
                                options={mandals.map(m => ({ value: m._id, label: m.name }))}
                                required
                                error={errors.presentMandal}
                            />
                            <FormSelect
                                label="Village/Town"
                                name="presentVillage"
                                value={formData.presentVillage}
                                onChange={handleVillageChange}
                                options={villages.map(v => ({ value: v._id, label: v.name }))}
                                required
                                error={errors.presentVillage}
                            />

                            <FormInput
                                label="House No."
                                name="presentHouseNo"
                                value={formData.presentHouseNo}
                                onChange={handleChange}
                                placeholder="e.g. 1-123"
                                required
                                error={errors.presentHouseNo}
                            />
                            <FormInput
                                label="Street Name / Colony"
                                name="presentStreet"
                                value={formData.presentStreet}
                                onChange={handleChange}
                                placeholder="e.g. Main Road, Ambedkar Colony"
                            // Required removed as per request
                            />
                            <FormInput
                                label="Landmark"
                                name="presentLandmark"
                                value={formData.presentLandmark}
                                onChange={handleChange}
                                placeholder="e.g. Near Water Tank"
                            // Required removed as per request
                            />

                            <FormInput
                                label="Pincode"
                                name="presentPincode"
                                value={formData.presentPincode}
                                onChange={handleChange}
                                placeholder="Enter pincode"
                                required
                                error={errors.presentPincode}
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
                        <div className="flex items-center gap-4 border-b border-gray-100 mb-6 mt-8 pb-2">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <FaHome size={16} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800">Permanent Address</h3>
                            </div>
                            {/* Moved to left as requested */}
                            <label className="flex items-center gap-2 cursor-pointer bg-blue-100 px-4 py-2 rounded-lg border border-blue-300 hover:bg-blue-200 transition shadow-sm">
                                <input
                                    type="checkbox"
                                    checked={sameAsPresent}
                                    onChange={handleSameAsPresentChange}
                                    className="w-5 h-5 text-blue-700 rounded focus:ring-blue-600 border-gray-400"
                                />
                                <span className="text-sm font-extrabold text-blue-900">SAME AS PRESENT ADDRESS</span>
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
                                error={!sameAsPresent ? errors.permDistrict : null}
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
                                error={!sameAsPresent ? errors.permMandal : null}
                            />
                            <FormSelect
                                label="Village/Town"
                                name="permVillage"
                                value={formData.permVillage}
                                onChange={handlePermVillageChange}
                                options={sameAsPresent
                                    ? villages.map(v => ({ value: v._id, label: v.name }))
                                    : permVillages.map(v => ({ value: v._id, label: v.name }))}
                                required={!sameAsPresent}
                                disabled={sameAsPresent}
                                error={!sameAsPresent ? errors.permVillage : null}
                            />

                            <FormInput
                                label="House No."
                                name="permHouseNo"
                                value={formData.permHouseNo}
                                onChange={handleChange}
                                placeholder="e.g. 1-123"
                                disabled={sameAsPresent}
                                required={!sameAsPresent}
                                error={!sameAsPresent ? errors.permHouseNo : null}
                            />
                            <FormInput
                                label="Street Name / Colony"
                                name="permStreet"
                                value={formData.permStreet}
                                onChange={handleChange}
                                placeholder="e.g. Main Road, Ambedkar Colony"
                                disabled={sameAsPresent}
                            // Required removed as per request
                            />
                            <FormInput
                                label="Landmark"
                                name="permLandmark"
                                value={formData.permLandmark}
                                onChange={handleChange}
                                placeholder="e.g. Near Water Tank"
                                disabled={sameAsPresent}
                            // Required removed as per request
                            />

                            <FormInput
                                label="Pincode"
                                name="permPincode"
                                value={formData.permPincode}
                                onChange={handleChange}
                                placeholder="Enter pincode"
                                disabled={sameAsPresent}
                                required={!sameAsPresent}
                                error={!sameAsPresent ? errors.permPincode : null}
                            />
                        </div>


                        {/* Caste & Community */}
                        <SectionHeader title="Caste & Community Information" icon={FaUsers} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormSelect label="Member's Caste" name="caste" value={formData.caste} onChange={handleChange} options={["MALA"]} required error={errors.caste} />
                            <FormSelect label="Member's Sub-Caste" name="subCaste" value={formData.subCaste} onChange={handleChange} options={subCastes} placeholder="Select sub-caste" />

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
                                error={errors.maritalStatus}
                            />

                            {formData.maritalStatus === 'Married' && (
                                <>
                                    <div className="hidden md:block"></div> {/* Spacer */}

                                    <FormInput label="Partner's Name" name="partnerName" value={formData.partnerName} onChange={handleChange} placeholder="Enter partner's name" />
                                    <FormSelect
                                        label="Partner's Caste"
                                        name="partnerCaste"
                                        value={formData.partnerCaste}
                                        onChange={(e) => {
                                            handleChange(e);
                                            setFormData(prev => ({ ...prev, partnerSubCaste: '' })); // Reset sub-caste
                                        }}
                                        options={partnerCastes}
                                        disabled={formData.isInterCaste === 'No'} // Disable if same caste
                                    />

                                    <FormSelect
                                        label="Partner's Sub-Caste"
                                        name="partnerSubCaste"
                                        value={formData.partnerSubCaste}
                                        onChange={handleChange}
                                        options={formData.partnerCaste ? (casteSubCastes[formData.partnerCaste] || []) : []}
                                        placeholder="Select sub-caste"
                                        disabled={!formData.partnerCaste}
                                    />
                                    <div className="col-span-1">
                                        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Inter-Caste Marriage</label>
                                        <div className="flex items-center gap-6 mt-3">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="isInterCaste"
                                                    value="Yes"
                                                    onChange={handleChange}
                                                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                                />
                                                <span className="text-sm text-gray-700">Yes</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="isInterCaste"
                                                    value="No"
                                                    onChange={(e) => {
                                                        // If No, set Partner Caste to Mala (Title Case to match options)
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            isInterCaste: 'No',
                                                            partnerCaste: 'Mala',
                                                            partnerSubCaste: '' // Reset sub-caste as it depends on caste
                                                        }));
                                                    }}
                                                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                                />
                                                <span className="text-sm text-gray-700">No</span>
                                            </label>
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

                            {/* Father Occupation */}
                            <div className="col-span-1">
                                <FormSelect
                                    label="Father's Occupation"
                                    name="fatherOccSelect"
                                    value={fatherOccSelect}
                                    onChange={(e) => {
                                        setFatherOccSelect(e.target.value);
                                        if (e.target.value !== 'Other') {
                                            setFormData(prev => ({ ...prev, fatherOccupation: e.target.value }));
                                        } else {
                                            setFormData(prev => ({ ...prev, fatherOccupation: '' }));
                                        }
                                    }}
                                    options={fatherOccupations}
                                />
                                {fatherOccSelect === 'Other' && (
                                    <input
                                        type="text"
                                        name="fatherOccupation"
                                        value={formData.fatherOccupation}
                                        onChange={handleChange}
                                        placeholder="Specify Occupation"
                                        className="mt-2 w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm"
                                    />
                                )}
                            </div>

                            {/* Mother Occupation */}
                            <div className="col-span-1">
                                <FormSelect
                                    label="Mother's Occupation"
                                    name="motherOccSelect"
                                    value={motherOccSelect}
                                    onChange={(e) => {
                                        setMotherOccSelect(e.target.value);
                                        if (e.target.value !== 'Other') {
                                            setFormData(prev => ({ ...prev, motherOccupation: e.target.value }));
                                        } else {
                                            setFormData(prev => ({ ...prev, motherOccupation: '' }));
                                        }
                                    }}
                                    options={motherOccupations}
                                />
                                {motherOccSelect === 'Other' && (
                                    <input
                                        type="text"
                                        name="motherOccupation"
                                        value={formData.motherOccupation}
                                        onChange={handleChange}
                                        placeholder="Specify Occupation"
                                        className="mt-2 w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm"
                                    />
                                )}
                            </div>
                            {/* Removed duplicate input for "Annual Family Income" as per request & using Select below */}
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


                            <FormInput label="Number of Family Members" name="memberCount" value={formData.memberCount} onChange={handleChange} placeholder="Enter number" type="number" required error={errors.memberCount} />
                            <FormInput label="Number of Dependents" name="dependentCount" value={formData.dependentCount} onChange={handleChange} placeholder="Enter number" type="number" />
                            <FormSelect label="Ration Card Type" name="rationCardTypeFamily" value={formData.rationCardTypeFamily} onChange={handleChange} options={["Food Security Card (White)", "Antyodaya Anna Yojana (Pink)", "Annapurna Scheme"]} />
                        </div>

                        {/* Ration Card */}
                        {/* Ration Card */}
                        <div className="flex items-center gap-4 mb-6 mt-8 pb-2 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <FaIdCard size={16} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800">Ration Card Details</h3>
                            </div>
                            {/* Moved to left, removed ml-auto */}
                            <label className="flex items-center gap-2 cursor-pointer bg-blue-100 px-4 py-2 rounded-lg border border-blue-300 hover:bg-blue-200 transition shadow-sm">
                                <input
                                    type="checkbox"
                                    name="hasRationCard"
                                    checked={formData.hasRationCard}
                                    onChange={(e) => {
                                        const isChecked = e.target.checked;
                                        setFormData(prev => ({
                                            ...prev,
                                            hasRationCard: isChecked,
                                            // Input clearing if unchecked
                                            ...(isChecked ? {} : { rationCardNumber: '', rationCardType: '', rationCardHolder: '' })
                                        }));
                                    }}
                                    className="w-5 h-5 text-blue-700 rounded focus:ring-blue-600 border-gray-400"
                                />
                                <span className="text-sm font-extrabold text-blue-900">Add Ration Card Information</span>
                            </label>
                        </div>


                        {formData.hasRationCard && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormInput label="Ration Card Number" name="rationCardNumber" value={formData.rationCardNumber} onChange={handleChange} placeholder="Enter ration card number" />
                                <FormInput label="Ration Card Holder Name" name="rationCardHolderName" value={formData.rationCardHolderName} onChange={handleChange} placeholder="Enter card holder name" />
                                <div className="md:col-span-2">
                                    <FileUpload label="Upload Ration Card" name="rationCardFile" onChange={handleFileChange} fileName={files.rationCardFile?.name} />
                                    <p className="text-[10px] text-gray-500 mt-1">Max file size: 5 MB</p>
                                </div>
                            </div>
                        )}

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
                            <div className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition cursor-pointer text-center relative group ${errors.photo ? 'border-red-500 bg-red-50' : (files.photo ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100')}`}>
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                                    <FaFileImage className={errors.photo ? 'text-red-500' : (files.photo ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-500')} />
                                </div>
                                <h4 className="text-sm font-bold text-gray-700">
                                    {files.photo ? files.photo.name : <>Member Photo <span className="text-red-500">*</span></>}
                                </h4>
                                <p className={`text-xs mt-1 ${errors.photo ? 'text-red-500' : 'text-gray-400'}`}>
                                    {errors.photo ? errors.photo : (files.photo ? 'Click to change' : 'Click to upload photo')}
                                </p>
                                <button type="button" className={`mt-3 text-xs font-bold hover:underline ${errors.photo ? 'text-red-600' : 'text-blue-600'}`}>Choose File</button>
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
                            <div className="col-span-1 md:col-span-3 text-center">
                                <p className="text-xs text-amber-600 font-bold bg-amber-50 inline-block px-3 py-1 rounded-full border border-amber-100">
                                    ⚠️ Alert: Max file size for all uploads is 5 MB
                                </p>
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
                                {loading ? 'Processing...' : 'Preview & Submit'} <FaChevronRight className="ml-1" />
                            </button>
                        </div>

                    </form>
                </main >
            </div >
            {/* Success Modal */}
            {
                showSuccessModal && createdMemberData && (
                    <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-green-500"></div>

                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FaCheckSquare className="text-green-600 text-4xl" />
                            </div>

                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Registration Successful!</h2>
                            <p className="text-gray-500 mb-6">Member has been successfully registered to the system.</p>

                            <div className="bg-gray-50 rounded-xl p-4 mb-8 border border-gray-100">
                                <p className="text-xs text-gray-500 uppercase tracking-wide font-bold mb-1">Generated Member ID</p>
                                <p className="text-3xl font-extrabold text-[#111827] tracking-wider">{createdMemberData.mewsId}</p>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={handleDownloadApplication}
                                    className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg flex items-center justify-center gap-2"
                                >
                                    <FaDownload size={18} /> Download Application
                                </button>

                                <button
                                    onClick={() => {
                                        const resolvedNames = {
                                            village: formData.presentVillageName || villages.find(v => v._id === formData.presentVillage)?.name || '',
                                            mandal: formData.presentMandalName || mandals.find(m => m._id === formData.presentMandal)?.name || '',
                                            district: formData.presentDistrictName || districts.find(d => d._id === formData.presentDistrict)?.name || '',
                                            pincode: formData.presentPincode || '',
                                            houseNo: formData.presentHouseNo || '',
                                            street: formData.presentStreet || '',
                                            landmark: formData.presentLandmark || ''
                                        };
                                        navigate('/admin/members/generate-id', {
                                            state: {
                                                newMember: createdMemberData,
                                                rawData: formData,
                                                resolvedNames: resolvedNames
                                            }
                                        });
                                    }}
                                    className="w-full py-3.5 bg-[#1e2a4a] text-white font-bold rounded-xl hover:bg-[#2a3b66] transition shadow-lg flex items-center justify-center gap-2"
                                >
                                    <FaIdCard size={18} /> Generate ID Card
                                </button>

                                <button
                                    onClick={() => {
                                        setShowSuccessModal(false);
                                        window.location.reload();
                                    }}
                                    className="w-full py-3.5 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition"
                                >
                                    Close & Register New
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Hidden Printable Application Form */}
            {
                createdMemberData && (
                    <div id="application-form-print" className="fixed top-0 left-0 bg-white w-[210mm] min-h-[297mm] p-10 hidden text-black">
                        <div className="border-b-2 border-gray-800 pb-4 mb-6 flex justify-between items-center">
                            <div>
                                <h1 className="text-2xl font-bold uppercase tracking-wide">Mala Educational Welfare Society</h1>
                                <p className="text-sm text-gray-600 font-bold">Membership Registration Application</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold text-gray-500">Date: {new Date().toLocaleDateString()}</p>
                                <p className="text-xs font-bold text-gray-500">App ID: {createdMemberData.mewsId}</p>
                            </div>
                        </div>

                        <div className="flex gap-6 mb-8">
                            <div className="w-32 h-40 border border-gray-300 flex items-center justify-center bg-gray-50">
                                {createdMemberData.photoUrl ? (
                                    <img src={`http://localhost:5000${createdMemberData.photoUrl}`} alt="Member" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-xs text-gray-400">Photo</span>
                                )}
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="grid grid-cols-2 gap-4 text-sm border-b border-gray-200 pb-2">
                                    <p><span className="font-bold w-32 inline-block">Surname:</span> {createdMemberData.surname}</p>
                                    <p><span className="font-bold w-32 inline-block">Name:</span> {createdMemberData.name}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm border-b border-gray-200 pb-2">
                                    <p><span className="font-bold w-32 inline-block">Father Name:</span> {createdMemberData.fatherName}</p>
                                    <p><span className="font-bold w-32 inline-block">DOB / Age:</span> {new Date(createdMemberData.dob).toLocaleDateString()} ({createdMemberData.age} Yrs)</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm border-b border-gray-200 pb-2">
                                    <p><span className="font-bold w-32 inline-block">Gender:</span> {createdMemberData.gender}</p>
                                    <p><span className="font-bold w-32 inline-block">Blood Group:</span> {createdMemberData.bloodGroup}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <p><span className="font-bold w-32 inline-block">Mobile:</span> {createdMemberData.mobileNumber}</p>
                                    <p><span className="font-bold w-32 inline-block">Aadhar:</span> {createdMemberData.aadhaarNumber}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-sm font-bold uppercase bg-gray-100 p-2 mb-2 border border-gray-200">Address Details</h3>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm px-2">
                                <p><span className="font-bold">Present Address:</span> {createdMemberData.address?.houseNumber}, {createdMemberData.address?.street}</p>
                                <p><span className="font-bold">Village:</span> {createdMemberData.address?.village?.name || createdMemberData.address?.village}</p>
                                <p><span className="font-bold">Mandal:</span> {createdMemberData.address?.mandal?.name || createdMemberData.address?.mandal}</p>
                                <p><span className="font-bold">District:</span> {createdMemberData.address?.district?.name || createdMemberData.address?.district}</p>
                                <p><span className="font-bold">Pincode:</span> {createdMemberData.address?.pinCode}</p>
                            </div>
                        </div>

                        <div className="mb-8">
                            <h3 className="text-sm font-bold uppercase bg-gray-100 p-2 mb-2 border border-gray-200">Declaration</h3>
                            <p className="text-xs text-justify leading-relaxed px-2">
                                I hereby declare that the details furnished above are true and correct to the best of my knowledge and belief. I undertake to inform you of any changes therein, immediately. In case any of the above information is found to be false or untrue or misleading or misrepresenting, I am aware that I may be held liable for it.
                            </p>
                        </div>

                        <div className="flex justify-between mt-16 px-4">
                            <div className="text-center">
                                <p className="font-bold text-sm mb-1">______________________</p>
                                <p className="text-xs">Signature of Applicant</p>
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-sm mb-1">______________________</p>
                                <p className="text-xs">Authorized Signatory</p>
                            </div>
                        </div>

                        <div className="mt-auto pt-4 border-t border-gray-300 text-center">
                            <p className="text-[10px] text-gray-400">Generated by MEWS System on {new Date().toLocaleString()}</p>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default MemberRegistration;
