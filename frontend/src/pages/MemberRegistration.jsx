import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import API, { BASE_URL } from '../api';
import axios from 'axios'; // Direct import for file upload to bypass interceptor issues
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import DashboardHeader from '../components/common/DashboardHeader';
import {
    FaArrowLeft, FaShieldAlt, FaSave, FaEraser, FaUpload, FaEye,
    FaCalendarAlt, FaIdCard, FaMapMarkerAlt, FaUsers, FaRing,
    FaRupeeSign, FaVoteYea, FaUniversity, FaFileImage, FaChevronRight,
    FaHome, FaCheckSquare,
    // Admin Layout Icons
    FaThLarge, FaBuilding, FaExclamationTriangle, FaFileAlt,
    FaHandHoldingUsd, FaChartLine, FaCog, FaQuestionCircle, FaBullhorn,
    FaSignOutAlt, FaSearch, FaBell, FaChevronDown, FaChevronUp, FaDownload, FaPlus, FaEdit, FaUser, FaPrint
} from 'react-icons/fa';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { getPincode } from '../utils/pincodeData';

import subCastes from '../utils/subCastes.json';
import partnerCastes from '../utils/partnerCastes.json';
import casteSubCastes from '../utils/casteSubCastes.json';
import { MemberDocument } from './MemberDocument';
import useAdminLocation from '../hooks/useAdminLocation';



// Collapsible Form Section Header
const CollapsibleSection = ({ title, icon: Icon, sectionNumber, isOpen, onToggle, children }) => (
    <div className="mb-6 border border-gray-100 rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md bg-white">
        <div
            onClick={onToggle}
            className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${isOpen ? 'bg-blue-50 border-b border-blue-100' : 'bg-white hover:bg-gray-50'}`}
        >
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isOpen ? 'bg-white text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                        <Icon size={16} />
                    </div>
                    <h3 className={`text-lg font-bold transition-colors ${isOpen ? 'text-blue-900' : 'text-gray-700'}`}>{title}</h3>
                </div>
            </div>
            <div className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                <FaChevronDown />
            </div>
        </div>

        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="p-6">
                {children}
            </div>
        </div>
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
                {options.map((opt, index) => {
                    const optionValue = typeof opt === 'object' ? opt.value : opt;
                    const optionLabel = typeof opt === 'object' ? opt.label : opt;
                    return <option key={`${optionValue}-${index}`} value={optionValue}>{optionLabel}</option>
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
// File Upload Component
const FileUpload = ({ label, name, onChange, onRemove, colSpan = "col-span-1", fileName, error, fileUrl, required = false }) => (
    <div className={colSpan}>
        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className={`border-2 border-dashed ${error ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'} rounded-lg p-2 flex flex-col items-center justify-center hover:bg-gray-100 transition cursor-pointer text-center h-[52px] box-border relative group`}>

            {/* View Link if URL exists */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 z-20 flex gap-1">
                {fileUrl && (
                    <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition"
                        onClick={(e) => e.stopPropagation()}
                        title="View Document"
                    >
                        <FaEye size={14} />
                    </a>
                )}
                {(fileName || fileUrl) && onRemove && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove(name);
                        }}
                        className="flex items-center justify-center w-8 h-8 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition"
                        title="Remove Document"
                    >
                        <FaEraser size={14} />
                    </button>
                )}
            </div>

            <div className={`absolute inset-0 flex items-center ${(fileUrl || fileName) ? 'justify-start pl-4' : 'justify-center'} gap-2 text-gray-500 group-hover:text-blue-600 pointer-events-none`}>
                <FaUpload size={14} className={error ? 'text-red-500' : ''} />
                <span className={`text-xs font-bold truncate max-w-[120px] ${error ? 'text-red-600' : ''}`}>
                    {fileName ? fileName : (fileUrl ? 'File Uploaded' : 'Choose File')}
                </span>
            </div>

            <input
                type="file"
                name={name}
                onChange={onChange}
                className="opacity-0 absolute inset-0 cursor-pointer z-10"
                title={fileName || "Choose a file"}
            />
        </div>
        {error && <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>}
    </div>
);



// Helper: Image Compression
const compressImage = (file, maxWidth = 1024, quality = 0.7) => {
    return new Promise((resolve, reject) => {
        // If not an image, return original
        if (!file.type.startsWith('image/')) {
            resolve(file);
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Resize logic
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    if (!blob) {
                        resolve(file); // Fallback
                        return;
                    }
                    const compressedFile = new File([blob], file.name, {
                        type: file.type,
                        lastModified: Date.now(),
                    });
                    resolve(compressedFile);
                }, file.type, quality);
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
};

// Constants for Dropdowns
const GOVT_DEPARTMENTS = [
    "Agriculture", "Arogyasri", "Asst Commissioner (State Taxes) Commercial Taxes", "Banks", "BC Welfare",
    "Chief Planning Officer", "Civil Supplies", "Dist Audit Officer", "Dist Co-Operative Society",
    "Dist Ground Water", "Dist Industries Center", "Dist Labour Dept", "Dist Manager (CS)",
    "Dist Marketing Officer", "Dist Town & Country Planning", "Dist Welfare Officer, WCD & SC Dept",
    "Dist Youth & Sports", "Dist. Handlooms & Textiles", "Dy, EE, TSEWIDC", "Education",
    "Electrical", "Employment", "Endowment", "Excise", "Fire", "Fisheries", "Food Safety",
    "Forest", "Horticulture", "Hospital", "Irrigation & Development Corporation", "Irrigation",
    "Lead Dist Manager", "Legal Metrology", "Medical", "Mines & Geology", "Minority Welfare",
    "Mission Bhagiratha (RWS & S)", "Muncipal", "Municipale", "Panchayathraj",
    "Panchayth Raj Engineering Dept", "Police", "Print Media", "Registration", "Revenue",
    "Road & Buldings (R&B)", "SC Corporation", "Transport", "Treasury", "TS Pollution Control Board",
    "TSDDCF Ltd, Vijaya Dairy", "TSRTC Yadagirigutta", "TSSPDCL Electricity Dept",
    "Vaidhya Vidana Parishath", "Veterinary", "Veternary & Animal Husbandary"
].sort();

const GOVT_JOB_CATEGORIES = {
    "State Government": ['Class-IV Employee', 'Contract / Outsourcing', 'Gazetted Officer', 'Group-1', 'Group-2', 'Group-3', 'Group-4', 'Non-Gazetted Officer'],
    "Central Government": ['Banking / PSU', 'Defence / Para-Military', 'Group-A (Gazetted)', 'Group-B (Gazetted)', 'Group-B (Non-Gazetted)', 'Group-C', 'Group-D', 'Railways'],
    "Public Sector Undertakings (PSU)": ['Maharatna', 'Miniratna', 'Navratna', 'State PSU (e.g., Singareni, Transco)']
};

// Political Positions
const POLITICAL_POSITIONS = [
    "Chief Minister", "Corporator / Ward Councillor", "Deputy Chief Minister", "Deputy Mayor",
    "Governor", "Gram Panchayat Sarpanch", "MLA", "MLC", "MP(Lok Sabha & Rajya Sabha)",
    "MPTC", "Mandal Parishad President", "Mayor", "Municipal Chairman / President", "Municipal Councillor",
    "State Cabinet Ministers", "Ward Member (Gram Panchayat)", "ZPTC", "Zilla Parishad Chairperson"
];

const memberOccupations = [
    "Business", "Daily Wage Laborer", "Farmer", "Government Employee", "House Wife", "Other",
    "Political Elected", "Private Employee", "Retired Govt. Employee", "Retired Private Employee",
    "Self-Employed / Business", "Student", "Unemployed"
].sort();

const MemberRegistration = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const handleBack = () => {
        if (window.history.length > 2) {
            navigate(-1);
        } else {
            navigate('/admin/members');
        }
    };
    const location = useLocation();
    const isEditMode = location.pathname.includes('/edit/');
    const isViewMode = Boolean(id) && !isEditMode;

    // Helper: Calculate Age from DD-MM-YYYY
    const calculateAge = (dobString) => {
        if (!dobString || dobString.length !== 10) return '';
        const [day, month, year] = dobString.split('-').map(Number);
        if (!day || !month || !year) return '';

        const today = new Date();
        let age = today.getFullYear() - year;
        const m = today.getMonth() + 1 - month;
        if (m < 0 || (m === 0 && today.getDate() < day)) {
            age--;
        }
        return age >= 0 ? age : 0;
    };

    // Helper: Handle Date Input with Masking
    const handleDateChange = (e, setFormState, fieldName) => {
        let val = e.target.value.replace(/\D/g, ''); // Remove non-digits
        if (val.length > 8) val = val.substring(0, 8); // Max 8 digits

        // Format DD-MM-YYYY
        if (val.length > 4) {
            val = `${val.slice(0, 2)}-${val.slice(2, 4)}-${val.slice(4)}`;
        } else if (val.length > 2) {
            val = `${val.slice(0, 2)}-${val.slice(2)}`;
        }

        setFormState(prev => ({ ...prev, [fieldName]: val }));
    };

    // Duplicate Check Handler
    const handleDuplicateCheck = async (field, value) => {
        if (!value || value.length < 5) return; // Skip if empty or too short
        if (isEditMode) return; // Skip in edit mode to avoid self-match (unless we enhance backend to exclude current ID)

        try {
            const { data } = await API.post('/members/check-duplicate', { field, value });
            if (data.isDuplicate) {
                setErrors(prev => ({ ...prev, [field]: data.message }));
            } else {
                setErrors(prev => {
                    const newErrs = { ...prev };
                    delete newErrs[field];
                    return newErrs;
                });
            }
        } catch (error) {
            console.error("Duplicate check failed:", error);
        }
    };

    // Form State
    const [formData, setFormData] = useState({
        surname: '',
        name: '',
        fatherName: '',
        dob: '',
        age: '',

        occupation: '', // New Field
        // Political Details
        politicalPosition: '',
        politicalFromDate: '',
        politicalToDate: '',
        businessType: '', // New Field

        // Job Details for Private Employee
        jobSector: '',
        jobOrganization: '',
        jobDesignation: '',
        gender: '',
        mobileNumber: '',
        bloodGroup: '',
        alternateMobile: '',
        email: '',
        aadhaarNumber: '',

        // Present Address
        presentDistrict: '',
        presentConstituency: '',
        presentMandal: '',
        presentVillage: '',
        presentMunicipality: '', // New
        presentWardNumber: '', // New
        presentAreaType: 'Rural', // 'Rural' or 'Urban'
        presentHouseNo: '',
        presentStreet: '',
        presentLandmark: '',
        presentPincode: '',
        residenceType: '',

        // Permanent Address
        permDistrict: '',
        permConstituency: '',
        permMandal: '',
        permVillage: '',
        permMunicipality: '', // New
        permWardNumber: '', // New
        permAreaType: 'Rural', // 'Rural' or 'Urban'
        permHouseNo: '',
        permStreet: '',
        permLandmark: '',
        permPincode: '',

        // Caste
        caste: 'MALA',
        subCaste: '',
        communityCertNumber: '',
        maritalStatus: '',

        // Marriage
        partnerCaste: '',
        partnerSubCaste: '',
        isInterCaste: '',


        // Family
        // Family
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


        presentState: 'Telangana',
        permState: 'Telangana',
        legalConsent: false,
        educationLevel: ''
    });

    const [files, setFiles] = useState({});
    const [loading, setLoading] = useState(false);
    const [sameAsPermanent, setSameAsPermanent] = useState(false);
    // State for Admin Location & Role (Removed - using Hook)
    const [errors, setErrors] = useState({});

    // Family Member State
    const [showFamilyModal, setShowFamilyModal] = useState(false);
    const [familyMembers, setFamilyMembers] = useState([]);
    const [editingMemberIndex, setEditingMemberIndex] = useState(null); // Track which member is being edited
    const [familyMemberForm, setFamilyMemberForm] = useState({
        relation: '', maritalStatus: '', surname: '', name: '', fatherName: '', dob: '', age: '', occupation: '', educationLevel: '', gender: '', mobileNumber: '', aadhaarNumber: '',
        epicNumber: '', voterName: '', pollingBooth: '',
        jobSector: '', jobOrganization: '', jobDesignation: '', jobCategory: '', jobSubCategory: ''
    });
    const [familyMemberFiles, setFamilyMemberFiles] = useState({});

    // Email Verification State
    const [emailVerification, setEmailVerification] = useState({
        isVerified: false,
        codeSent: false,
        lastSentTime: null,
        verificationCode: '',
        loading: false,
        error: '',
        success: '',
        resendCountdown: 0
    });

    const handleFamilyChange = (e) => {
        const { name, value } = e.target;



        // Validation for Name fields (Text Only)
        if (['surname', 'name', 'fatherName'].includes(name)) {
            // Allow letters, spaces, and dots only
            if (!/^[a-zA-Z\s.]*$/.test(value)) return;
        }

        let updatedForm = { [name]: value };

        if (name === 'aadhaarNumber') {
            const raw = value.replace(/\D/g, '');
            if (raw.length > 12) return;
            updatedForm[name] = raw.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
        }

        if (name === 'mobileNumber') {
            if (!/^\d*$/.test(value)) return;
            if (value.length > 10) return;
        }

        if (name === 'jobCategory') {
            updatedForm.jobSubCategory = '';
        }

        if (name === 'epicNumber') {
            const raw = value.toUpperCase();
            // Allow only alphanumeric and limit to 10 chars
            if (raw.length > 10) return;
            updatedForm[name] = raw;
        }

        // Auto-populate Father Name based on Relation
        if (name === 'relation') {
            if (value === 'Son' || value === 'Daughter') {
                if (formData.gender === 'Male') {
                    updatedForm.fatherName = formData.name;
                } else if (formData.gender === 'Female' && formData.maritalStatus === 'Married') {
                    // Try to get husband's name if available (partnerName)
                    updatedForm.fatherName = formData.partnerName || '';
                }
            }
            // Auto-set Marital Status to 'Married' for Father, Mother, Spouse
            if (['Father', 'Mother', 'Spouse'].includes(value)) {
                updatedForm.maritalStatus = 'Married';
            }
        }

        setFamilyMemberForm(prev => ({ ...prev, ...updatedForm }));
    };

    const handleFamilyFileChange = async (e) => {
        const { name, files } = e.target;
        if (files[0]) {
            let file = files[0];
            // Check size (5MB = 5 * 1024 * 1024)
            if (file.size > 5242880) {
                alert("File size exceeds 5 MB. Please upload a smaller file.");
                e.target.value = null; // Clear input
                return;
            }
            // Compress Image
            if (file.type.startsWith('image/')) {
                try {
                    file = await compressImage(file);
                } catch (err) {
                    console.error("Family Member Image compression failed", err);
                }
            }
            setFamilyMemberFiles(prev => ({ ...prev, [name]: file }));
        }
    };

    const handleEditFamilyMember = (index) => {
        const member = familyMembers[index];
        setFamilyMemberForm({
            relation: member.relation, maritalStatus: member.maritalStatus || '', surname: member.surname, name: member.name, fatherName: member.fatherName || '', dob: member.dob, age: member.age,
            occupation: member.occupation, educationLevel: member.educationLevel || '', gender: member.gender,
            mobileNumber: member.mobileNumber || '', aadhaarNumber: member.aadhaarNumber || '',
            epicNumber: member.epicNumber || '', voterName: member.voterName || '', pollingBooth: member.pollingBooth || '',
            jobSector: member.jobSector || '', jobOrganization: member.jobOrganization || '', jobDesignation: member.jobDesignation || '', jobCategory: member.jobCategory || '', jobSubCategory: member.jobSubCategory || ''
        });
        setFamilyMemberFiles(member.files || {});
        setEditingMemberIndex(index);
        setShowFamilyModal(true);
    };

    const openAddFamilyModal = () => {
        setFamilyMemberForm({
            relation: '', maritalStatus: '', surname: createdMemberData ? createdMemberData.surname : formData.surname, name: '', fatherName: '', dob: '', age: '', occupation: '', educationLevel: '', gender: '', mobileNumber: '', aadhaarNumber: '',
            epicNumber: '', voterName: '', pollingBooth: '',
            jobSector: '', jobOrganization: '', jobDesignation: '', jobCategory: '', jobSubCategory: ''
        });
        setFamilyMemberFiles({});
        setEditingMemberIndex(null);
        setShowFamilyModal(true);
    };


    const saveFamilyMember = () => {
        // Strict Validation matching 'New Member Registration'
        const missing = [];
        if (!familyMemberForm.relation) missing.push("Relation");
        if (!familyMemberForm.maritalStatus) missing.push("Marital Status");
        if (!familyMemberForm.surname) missing.push("Surname");
        if (!familyMemberForm.name) missing.push("Name");
        if (!familyMemberForm.fatherName) missing.push("Father Name");
        if (!familyMemberForm.dob) missing.push("Date of Birth");
        if (!familyMemberForm.gender) missing.push("Gender");
        if (!familyMemberForm.mobileNumber) missing.push("Mobile Number");
        if (!familyMemberForm.aadhaarNumber) missing.push("Aadhaar Number");

        // Occupation Check
        const ageVal = parseInt(familyMemberForm.age || 0);
        if (ageVal >= 5 || !familyMemberForm.age) {
            if (!familyMemberForm.occupation) missing.push("Occupation");

            if (familyMemberForm.occupation === 'Private Employee') {
                if (!familyMemberForm.jobSector) missing.push("Job Sector");
                if (!familyMemberForm.jobOrganization) missing.push("Organization");
                if (!familyMemberForm.jobDesignation) missing.push("Designation");
            }
            if (familyMemberForm.occupation === 'Government Employee') {
                if (!familyMemberForm.jobOrganization) missing.push("Department");
                if (!familyMemberForm.jobDesignation) missing.push("Designation");
            }
            if ((familyMemberForm.occupation === 'Retired Govt. Employee' || familyMemberForm.occupation === 'Retired Private Employee') && !familyMemberForm.jobDesignation) {
                missing.push("Designation");
            }
            if (familyMemberForm.occupation === 'Other' && !familyMemberForm.jobDesignation) {
                missing.push("Occupation Details");
            }
            if (familyMemberForm.occupation === 'Student' && !familyMemberForm.educationLevel) {
                missing.push("Education Level");
            }
        }

        // Photo Check
        if (!familyMemberFiles.photo) {
            missing.push("Member Photo");
        }

        if (missing.length > 0) {
            alert(`Please fill mandatory fields:\n- ${missing.join('\n- ')}`);
            return;
        }

        if (familyMemberForm.mobileNumber && familyMemberForm.mobileNumber.length !== 10) {
            alert("Family member mobile number must be 10 digits"); return;
        }

        if (familyMemberForm.aadhaarNumber && familyMemberForm.aadhaarNumber.replace(/\s/g, '').length !== 12) {
            alert("Family member Aadhaar number must be 12 digits"); return;
        }

        if (familyMemberForm.epicNumber) {
            if (familyMemberForm.epicNumber) {
                const epicRegex = /^[A-Z]{4}[0-9]{6}$/;
                if (!epicRegex.test(familyMemberForm.epicNumber)) {
                    alert("Invalid Family Member Voter ID format (e.g., ABCD123456)"); return;
                }
            }
        }

        // Spouse Check (Skip check if we are editing the spouse themselves)
        if (familyMemberForm.relation === 'Spouse') {
            const hasSpouse = familyMembers.some((m, idx) => m.relation === 'Spouse' && idx !== editingMemberIndex);
            if (hasSpouse) {
                alert("You can only add one Spouse.");
                return;
            }
        }

        if (editingMemberIndex !== null) {
            // Update existing member
            const updatedMembers = [...familyMembers];
            updatedMembers[editingMemberIndex] = {
                ...updatedMembers[editingMemberIndex], // Keep any internal fields like tempId if needed
                ...familyMemberForm,
                files: familyMemberFiles
            };
            setFamilyMembers(updatedMembers);
            alert("Family member updated successfully.");
        } else {
            // Add new member
            setFamilyMembers(prev => [...prev, { ...familyMemberForm, tempId: Date.now(), files: familyMemberFiles }]);
        }

        setShowFamilyModal(false);
        setFamilyMemberForm({
            relation: '', surname: '', name: '', fatherName: '', dob: '', age: '', occupation: '', educationLevel: '', gender: '', mobileNumber: '', aadhaarNumber: '',
            epicNumber: '', voterName: '', pollingBooth: '',
            jobSector: '', jobOrganization: '', jobDesignation: '', jobCategory: '', jobSubCategory: ''
        });
        setFamilyMemberFiles({});
        setEditingMemberIndex(null);
    };

    // Auto-calculate Age for Family Member
    useEffect(() => {
        if (familyMemberForm.dob && familyMemberForm.dob.length === 10) {
            const calculatedAge = calculateAge(familyMemberForm.dob);

            setFamilyMemberForm(prev => ({
                ...prev,
                age: calculatedAge,
                // Auto-fill mobile if under 18 and phone is empty
                mobileNumber: (calculatedAge !== '' && parseInt(calculatedAge) < 18 && !prev.mobileNumber) ? formData.mobileNumber : prev.mobileNumber
            }));
        } else {
            setFamilyMemberForm(prev => ({ ...prev, age: '' }));
        }
    }, [familyMemberForm.dob, formData.mobileNumber]);

    // collapsible sections state
    const [openSections, setOpenSections] = useState({
        1: true, // Basic Info
        2: false,
        3: false,
        4: false,
        5: false,
        6: false,
        7: false,
        8: false,
        9: false
    });

    const toggleSection = (id) => {
        setOpenSections(prev => {
            const newState = {};
            Object.keys(prev).forEach(key => {
                // If this is the clicked section, toggle it.
                // Otherwise, force it closed.
                if (String(key) === String(id)) {
                    newState[key] = !prev[key];
                } else {
                    newState[key] = false;
                }
            });
            return newState;
        });
    };

    // Reset Form
    const handleReset = () => {
        if (window.confirm("Are you sure you want to clear the form? All entered data will be lost.")) {
            // Reset main form data
            setFormData({
                surname: '',
                name: '',
                fatherName: '',
                dob: '',
                age: '',
                occupation: '',
                politicalPosition: '',
                politicalFromDate: '',
                politicalToDate: '',
                jobSector: '',
                jobOrganization: '',

                jobDesignation: '',
                jobCategory: '',
                jobSubCategory: '',
                gender: '',
                mobileNumber: '',
                bloodGroup: '',
                alternateMobile: '',
                email: '',
                aadhaarNumber: '',
                presentDistrict: '',
                presentConstituency: '',
                presentMandal: '',
                presentVillage: '',
                presentHouseNo: '',
                presentStreet: '',
                presentLandmark: '',
                presentPincode: '',
                residenceType: '',
                permDistrict: '',
                permConstituency: '',
                permMandal: '',
                permVillage: '',
                permHouseNo: '',
                permStreet: '',
                permLandmark: '',
                permPincode: '',
                caste: 'MALA',
                subCaste: '',
                communityCertNumber: '',
                maritalStatus: '',
                partnerCaste: '',
                partnerSubCaste: '',
                isInterCaste: '',
                annualIncome: '',
                memberCount: '',
                dependentCount: '',
                rationCardTypeFamily: '',
                hasRationCard: false,
                rationCardNumber: '',
                rationCardHolderName: '',
                epicNumber: '',
                voterName: '',
                pollingBooth: '',
                presentState: 'Telangana',
                permState: 'Telangana',
                legalConsent: false,
                educationLevel: ''
            });
            // Reset files
            setFiles({});
            // Reset family members
            setFamilyMembers([]);
            // Reset checkboxes/toggles
            setSameAsPermanent(false);
            // Clear errors
            setErrors({});
            // Clear removed files tracking
            setRemovedFiles([]);
            // Reset sections to default (only Basic Info open)

            setOpenSections({
                1: true,
                2: false,
                3: false,
                4: false,
                5: false,
                6: false,
                7: false,
                8: false,
                9: false
            });

            // Reset Location Lists
            setMandals([]);
            setVillages([]);
            setPermMandals([]);
            setPermVillages([]);
            setPresentConstituencies([]);
            setPermConstituencies([]);

            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Occupation Handling
    // Government Job Categories Data
    // Government Departments Data


    // Occupation Handling - Using global constant 'memberOccupations' defined above

    // Dynamic Constituency Filtering
    const getConstituenciesForDistrict = (districtName) => {
        if (!districtName) return [];
        // Check exact match first
        if (districtConstituencies[districtName]) return districtConstituencies[districtName];

        // Try simple fuzzy match if exact missing (e.g. "Ranga Reddy" vs "Rangareddy")
        const keys = Object.keys(districtConstituencies);
        const match = keys.find(k => k.toLowerCase().replace(/\s/g, '') === districtName.toLowerCase().replace(/\s/g, ''));
        return match ? districtConstituencies[match] : [];
    };

    // Location Lists
    const [districts, setDistricts] = useState([]);

    // Raw Data (All Mandals/Municipalities in District)
    const [allMandals, setAllMandals] = useState([]);
    const [allMunicipalities, setAllMunicipalities] = useState([]); // New

    const [allPermMandals, setAllPermMandals] = useState([]);
    const [allPermMunicipalities, setAllPermMunicipalities] = useState([]); // New

    // Filtered Display Lists
    const [mandals, setMandals] = useState([]);
    const [villages, setVillages] = useState([]);
    const [municipalities, setMunicipalities] = useState([]); // New

    const [permMandals, setPermMandals] = useState([]);
    const [permVillages, setPermVillages] = useState([]);
    const [permMunicipalities, setPermMunicipalities] = useState([]); // New
    const [presentWards, setPresentWards] = useState([]); // New
    const [permWards, setPermWards] = useState([]); // New

    // Dynamic Constituency Lists
    const [presentConstituencies, setPresentConstituencies] = useState([]);
    const [permConstituencies, setPermConstituencies] = useState([]);


    // Helper: Filter Mandals by Constituency Name
    const filterMandalsByConstituency = (mandalsList, constituencyName) => {
        if (!mandalsList || mandalsList.length === 0) return [];
        if (!constituencyName || !constituencyMandals[constituencyName]) {
            // If no constituency selected or no mapping, return ALL mandals (or empty? standard is all)
            // But user requirement implies strict dependency. Let's return all if no constituency selected yet.
            if (!constituencyName) return mandalsList;
            // If constituency selected but no mapping found (e.g. data missing), return all to be safe? 
            // Or return empty to force update? Safety: return all.
            return mandalsList;
        }

        const validNames = constituencyMandals[constituencyName].map(n => n.toUpperCase().replace(/[^A-Z]/g, ''));

        return mandalsList.filter(m => {
            const mName = m.name.toUpperCase().replace(/[^A-Z]/g, '');
            // Fuzzy match: check if mapped name is contained in DB name or vice versa
            // e.g. "Khammam Urban" vs "Khammam (Urban)"
            return validNames.some(valid => mName.includes(valid) || valid.includes(mName));
        });
    };

    // Filter Mandals by Constituency Helper
    // const filterMandalsByConstituency... (Defined above)

    // Explicit Handlers for Constituency Change (Replacing useEffect for better control)


    // Explicit handler for Job Category to reset Sub-Category
    const handleJobCategoryChange = (e) => {
        const { value } = e.target;
        setFormData(prev => ({
            ...prev,
            jobCategory: value,
            jobSubCategory: '' // Reset sub-category specific to the new category
        }));
    };


    // Fetch Districts on Mount (Specifically for Telangana)
    useEffect(() => {
        const fetchDistricts = async () => {
            try {
                console.log("[UI] Fetching States...");
                // Get all states
                const { data: states } = await API.get('/locations?type=STATE');
                console.log("[UI] States fetched:", states);

                // Find Telangana specifically (Robust Match)
                const telangana = states.find(s => s.name.trim().toLowerCase() === 'telangana');

                if (telangana) {
                    console.log("[UI] Found Telangana:", telangana._id);
                    const { data: dists } = await API.get(`/locations?parent=${telangana._id}`);
                    console.log(`[UI] Fetched ${dists.length} districts for Telangana`);
                    setDistricts(dists);
                } else if (states.length > 0) {
                    console.warn("[UI] Telangana not found! Falling back to first state:", states[0].name);
                    // Fallback to first state if Telangana not found (though it should be)
                    const { data: dists } = await API.get(`/locations?parent=${states[0]._id}`);
                    setDistricts(dists);
                } else {
                    console.error("[UI] No states found in DB!");
                }
            } catch (error) {
                console.error("[UI] Error fetching locations", error);
            }
        };
        fetchDistricts();
    }, []);

    // Handle Present Address District Change
    const handleDistrictChange = async (e) => {
        const districtId = e.target.value;
        const districtName = districts.find(d => d._id === districtId)?.name || '';
        console.log(`[UI] District Selected: ${districtId} (${districtName})`);

        // Store ID AND Name directly in formData
        setFormData(prev => ({
            ...prev,
            presentDistrict: districtId,
            presentDistrictName: districtName,
            presentConstituency: '',
            presentMandal: '',
            presentMandalName: '',
            presentVillage: '',
            presentVillageName: '',
            presentMunicipality: '',
            presentWardNumber: '',
            presentAreaType: 'Rural'
        }));

        // Clear downstream lists
        setPresentConstituencies([]);
        setMandals([]);
        setVillages([]);
        setMunicipalities([]);

        if (districtId) {
            try {
                // Fetch Constituencies for this District
                const { data } = await API.get(`/locations?parent=${districtId}`);
                // Expected data: List of locations with type='CONSTITUENCY'
                setPresentConstituencies(data);

            } catch (error) {
                console.error("[API] Error fetching constituencies", error);
            }
        }
    };
    // Handle Present Address Constituency Change
    const handlePresentConstituencyChange = async (e) => {
        const constituencyId = e.target.value;
        const constName = presentConstituencies.find(c => c._id === constituencyId)?.name || '';

        setFormData(prev => ({
            ...prev,
            presentConstituency: constituencyId,
            presentConstituencyName: constName,
            presentMandal: '',
            presentMandalName: '',
            presentVillage: '',
            presentVillageName: '',
            presentMunicipality: '',
            presentWardNumber: ''
        }));

        setMandals([]);
        setMunicipalities([]);
        setVillages([]);
        setPresentWards([]);

        if (constituencyId) {
            try {
                // Fetch Mandals (Direct relationship or children)
                const { data: mData } = await API.get(`/locations?parent=${constituencyId}`);
                setMandals(mData.filter(d => d.type === 'MANDAL')); // Filter just in case

                // Fetch Municipalities (Descendants via ancestor query)
                const { data: muniData } = await API.get(`/locations?type=MUNICIPALITY&ancestor=${constituencyId}`);
                setMunicipalities(muniData);

            } catch (error) {
                console.error("Error fetching constituency children", error);
            }
        }
    };

    const handleMandalChange = async (e) => {
        const mandalId = e.target.value;
        const mandalName = mandals && mandals.length > 0 ? (mandals.find(m => m._id === mandalId)?.name || '') : '';
        console.log(`[UI] Mandal Selected: ${mandalId} (${mandalName})`);

        setFormData(prev => ({
            ...prev,
            presentMandal: mandalId,
            presentMandalName: mandalName,
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
        const village = (villages && villages.length > 0) ? villages.find(v => v._id === villageId) : null;
        const villageName = village?.name || '';

        let code = village?.pincode || '';

        // Fallback if DB has no pincode
        if (!code && village && formData.presentDistrict && formData.presentMandal) {
            // Safety check: ensure arrays exist before find
            const dist = (districts && districts.length > 0) ? districts.find(d => d._id === formData.presentDistrict) : null;
            const mand = (mandals && mandals.length > 0) ? mandals.find(m => m._id === formData.presentMandal) : null;

            if (dist && mand) {
                code = getPincode(dist.name, mand.name, village.name, formData.presentConstituency);
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
        const village = (permVillages && permVillages.length > 0) ? permVillages.find(v => v._id === villageId) : null;
        const villageName = village?.name || '';

        let code = village?.pincode || '';

        // Fallback if DB has no pincode
        if (!code && village && formData.permDistrict && formData.permMandal) {
            const dist = (districts && districts.length > 0) ? districts.find(d => d._id === formData.permDistrict) : null;
            // Always look at Permanent Mandal for Permanent Pincode
            const mand = (permMandals && permMandals.length > 0) ? permMandals.find(m => m._id === formData.permMandal) : null;

            if (dist && mand) {
                code = getPincode(dist.name, mand.name, village.name, formData.permConstituency);
            }
        }

        setFormData(prev => ({
            ...prev,
            permVillage: villageId,
            permVillageName: villageName, // Store Name
            permPincode: code || prev.permPincode
        }));
    };

    // Handle Permanent Address District Change
    const handlePermDistrictChange = async (e) => {
        const districtId = e.target.value;
        const districtName = (districts && districts.length > 0) ? (districts.find(d => d._id === districtId)?.name || '') : '';

        setFormData(prev => ({
            ...prev,
            permDistrict: districtId,
            permDistrictName: districtName, // Store Name
            permConstituency: '',
            permMandal: '',
            permMandalName: '',
            permVillage: '',
            permVillageName: '',
            permMunicipality: '',
            permWardNumber: '',
            permAreaType: 'Rural'
        }));
        setPermConstituencies([]);
        setPermMandals([]);
        setPermVillages([]);
        setPermMunicipalities([]);

        if (districtId) {
            try {
                const { data } = await API.get(`/locations?parent=${districtId}`);

                // Filter Constituencies
                const constList = data.filter(d => d.type === 'CONSTITUENCY');
                setPermConstituencies(constList);

                // Split Mandals and Municipalities (though usually these are children of Constituency, 
                // but keeping logic consistent if district direct children exist or are needed later)
                // Actually, based on my previous fix, we fetch Mandals/Munis AFTER Constituency selection for cascading.
                // But specifically for District change, we usually just fetch Constituencies.
                // The previous code also fetched Mandals/Munis here? 
                // Let's look at Lines 1114-1123 in original... it filtered MANDAL/MUNICIPALITY from District children.
                // If the hierarchy is strict (District -> Constituency -> Mandal), then Mandals won't be direct children of District.
                // But if they are, we keep them.
                const mList = data.filter(d => d.type === 'MANDAL');
                const muniList = data.filter(d => d.type === 'MUNICIPALITY');

                setAllPermMandals(mList);
                setPermMandals(mList);
                setAllPermMunicipalities(muniList);
                setPermMunicipalities(muniList);
            } catch (error) {
                console.error("Error fetching perm locations", error);
            }
        }
    };

    // Handle Permanent Address Constituency Change
    const handlePermConstituencyChange = async (e) => {
        const constituencyId = e.target.value;
        const constName = permConstituencies.find(c => c._id === constituencyId)?.name || '';

        setFormData(prev => ({
            ...prev,
            permConstituency: constituencyId,
            permConstituencyName: constName,
            permMandal: '',
            permMandalName: '',
            permVillage: '',
            permVillageName: '',
            permMunicipality: '',
            permWardNumber: ''
        }));

        setPermMandals([]);
        setAllPermMandals([]); // Assuming this tracks filtered list
        setPermMunicipalities([]);
        setAllPermMunicipalities([]);
        setPermVillages([]);
        setPermWards([]);

        if (constituencyId) {
            try {
                // Fetch Mandals
                const { data: mData } = await API.get(`/locations?parent=${constituencyId}`);
                const mList = mData.filter(d => d.type === 'MANDAL');
                setPermMandals(mList);
                setAllPermMandals(mList);

                // Fetch Municipalities
                const { data: muniData } = await API.get(`/locations?type=MUNICIPALITY&ancestor=${constituencyId}`);
                setPermMunicipalities(muniData);
                setAllPermMunicipalities(muniData);

            } catch (error) {
                console.error("Error fetching perm constituency children", error);
            }
        }
    };

    const handlePermMandalChange = async (e) => {
        const mandalId = e.target.value;
        const mandalName = (permMandals && permMandals.length > 0) ? (permMandals.find(m => m._id === mandalId)?.name || '') : '';

        setFormData(prev => ({
            ...prev,
            permMandal: mandalId,
            permMandalName: mandalName, // Store Name
            permVillage: '',
            permVillageName: ''
        }));
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

    // --- MUNICIPALITY HANDLERS ---
    // --- MUNICIPALITY HANDLERS ---
    const handlePresentMunicipalityChange = async (e) => {
        const val = e.target.value;
        const muniName = municipalities.find(m => m._id === val)?.name || '';

        setFormData(prev => ({
            ...prev,
            presentMunicipality: val,
            presentMunicipalityName: muniName,
            presentWardNumber: ''
        }));
        setPresentWards([]);

        if (val) {
            try {
                const { data } = await API.get(`/locations?parent=${val}`);
                setPresentWards(data); // Assuming wards are returned as locations
            } catch (error) {
                console.error("Error fetching present wards", error);
            }
        }
    };

    const handlePermMunicipalityChange = async (e) => {
        const val = e.target.value;
        const muniName = permMunicipalities.find(m => m._id === val)?.name || '';

        setFormData(prev => ({
            ...prev,
            permMunicipality: val,
            permMunicipalityName: muniName,
            permWardNumber: ''
        }));
        setPermWards([]);

        if (val) {
            try {
                const { data } = await API.get(`/locations?parent=${val}`);
                setPermWards(data);
            } catch (error) {
                console.error("Error fetching perm wards", error);
            }
        }
    };

    // Handle Input Change (Generalized)
    const handleChange = (e) => {
        const { name, value } = e.target;

        // Validation for Name fields (Text Only)
        if (['surname', 'name', 'fatherName'].includes(name)) {
            // Allow letters, spaces, and dots only
            if (!/^[a-zA-Z\s.]*$/.test(value)) return;
        }

        // Validation Logic
        if (name === 'mobileNumber' || name === 'alternateMobile') {
            // Only allow digits and max 10
            if (!/^\d*$/.test(value)) return;
            if (value.length > 10) return;
        }

        if (name === 'aadhaarNumber') {
            // Remove non-digits
            const raw = value.replace(/\D/g, '');
            // Limit to 12 digits
            if (raw.length > 12) return;

            // Format: 0000 0000 0000
            const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ').trim();

            setFormData(prev => ({ ...prev, [name]: formatted }));
            return;
        }

        if (name === 'rationCardNumber') {
            // Only digits, max 12
            if (!/^\d*$/.test(value)) return;
            if (value.length > 12) return;
        }

        if (name === 'epicNumber') {
            // Uppercase only
            const uppercased = value.toUpperCase();
            // Limit length
            if (uppercased.length > 10) return;
            setFormData(prev => ({ ...prev, [name]: uppercased }));
            return;
        }

        if (name === 'communityCertNumber') {
            // Allow only alphanumeric
            if (!/^[a-zA-Z0-9]*$/.test(value)) return;
            // Limit to 15 characters
            if (value.length > 15) return;
        }

        if (name === 'presentPincode' || name === 'permPincode') {
            // Only digits, max 6
            if (!/^\d*$/.test(value)) return;
            if (value.length > 6) return;
        }

        if (name === 'annualIncome' || name === 'memberCount' || name === 'dependentCount') {
            // Basic number check for other numeric fields if desired, but strict length only for mobile/aadhar
            // Keeping it simple for now as requested specifically for mobile/aadhar
        }




        setFormData(prev => {
            const newData = { ...prev, [name]: value };

            // Reset Job Sub-Category if Job Category changes
            if (name === 'jobCategory') {
                newData.jobSubCategory = '';
            }

            if (sameAsPermanent && name.startsWith('perm')) {
                const presentField = name.replace('perm', 'present');
                newData[presentField] = value;
            }
            return newData;
        });

        // Clear error when user changes the value
        if (errors[name]) {
            setErrors(prev => {
                const newErrs = { ...prev };
                delete newErrs[name];
                return newErrs;
            });
        }
    };

    // Check Duplicate
    const checkFieldDuplicate = async (name, value) => {
        if (!value || isEditMode) return; // Skip if empty or editing (in edit, own value might trigger duplicate)

        // Map frontend field names to backend expected keys
        let fieldKey = '';
        if (name === 'aadhaarNumber') fieldKey = 'aadhaarNumber';
        if (name === 'epicNumber') fieldKey = 'voterId';
        if (name === 'rationCardNumber') fieldKey = 'rationCard';
        if (name === 'mobileNumber') fieldKey = 'mobileNumber';

        if (!fieldKey) return;

        try {
            const { data } = await API.post('/members/check-duplicate', { field: fieldKey, value });
            if (data.isDuplicate) {
                setErrors(prev => ({ ...prev, [name]: "This mobile number already exists" })); // Custom message for mobile or generic for others?
                // The API actually returns a message too, let's use that but specific request was "This mobile number already exists"
                if (name === 'mobileNumber') {
                    setErrors(prev => ({ ...prev, [name]: "This mobile number already exists" }));
                } else {
                    setErrors(prev => ({ ...prev, [name]: data.message }));
                }
            }
        } catch (error) {
            console.error("Duplicate check failed", error);
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        if (['aadhaarNumber', 'epicNumber', 'rationCardNumber', 'mobileNumber'].includes(name)) {
            checkFieldDuplicate(name, value);
        }
    };

    // Email Verification Handlers
    const handleSendVerificationCode = async () => {
        const email = formData.email;

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            setEmailVerification(prev => ({ ...prev, error: 'Please enter a valid email address' }));
            return;
        }

        setEmailVerification(prev => ({ ...prev, loading: true, error: '', success: '' }));

        try {
            const response = await API.post('/email-verification/send', {
                email,
                name: formData.name || 'User'
            });

            setEmailVerification(prev => ({
                ...prev,
                loading: false,
                codeSent: true,
                lastSentTime: Date.now(),
                success: 'Verification code sent to your email',
                resendCountdown: 60
            }));

            // Start countdown timer
            const countdownInterval = setInterval(() => {
                setEmailVerification(prev => {
                    if (prev.resendCountdown <= 1) {
                        clearInterval(countdownInterval);
                        return { ...prev, resendCountdown: 0 };
                    }
                    return { ...prev, resendCountdown: prev.resendCountdown - 1 };
                });
            }, 1000);

        } catch (error) {
            console.error('Send verification code error:', error);
            setEmailVerification(prev => ({
                ...prev,
                loading: false,
                error: error.response?.data?.message || 'Failed to send verification code'
            }));
        }
    };

    const handleVerifyCode = async () => {
        const { verificationCode } = emailVerification;
        const email = formData.email;

        if (!verificationCode || verificationCode.length !== 6) {
            setEmailVerification(prev => ({ ...prev, error: 'Please enter a 6-digit verification code' }));
            return;
        }

        setEmailVerification(prev => ({ ...prev, loading: true, error: '', success: '' }));

        try {
            const response = await API.post('/email-verification/verify', {
                email,
                code: verificationCode
            });

            setEmailVerification(prev => ({
                ...prev,
                loading: false,
                isVerified: true,
                success: 'Email verified successfully',
                error: ''
            }));

            // Clear any email errors
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.email;
                return newErrors;
            });

        } catch (error) {
            console.error('Verify code error:', error);
            setEmailVerification(prev => ({
                ...prev,
                loading: false,
                error: error.response?.data?.message || 'Invalid verification code'
            }));
        }
    };

    const handleResendCode = async () => {
        if (emailVerification.resendCountdown > 0) {
            return; // Still in cooldown
        }
        await handleSendVerificationCode();
    };

    // Handle File Change
    const handleFileChange = async (e) => {
        const { name, files: selectedFiles } = e.target;
        if (selectedFiles && selectedFiles[0]) {
            let file = selectedFiles[0];
            // Check size (5MB = 5 * 1024 * 1024Limit initial check)
            if (file.size > 5242880) {
                alert("File size exceeds 5 MB. Please upload a smaller file.");
                e.target.value = null; // Clear input
                return;
            }

            // Compress Image
            if (file.type.startsWith('image/')) {
                try {
                    const originalSize = file.size;
                    file = await compressImage(file);
                    console.log(`[Compression] ${name}: ${(originalSize / 1024).toFixed(2)}KB -> ${(file.size / 1024).toFixed(2)}KB`);
                } catch (err) {
                    console.error("Image compression failed, using original:", err);
                }
            }

            setFiles(prev => ({ ...prev, [name]: file }));
            // Clear error
            if (errors[name]) {
                setErrors(prev => ({ ...prev, [name]: '' }));
            }
        }
    };


    // Handle Checkbox Change (Same as Permanent)
    const handleSameAsPermanentChange = (e) => {
        const checked = e.target.checked;
        setSameAsPermanent(checked);

        if (checked) {
            // Copy Permanent to Present

            // Copy Constituencies List
            setPresentConstituencies(permConstituencies);

            // Copy lists
            setMandals(permMandals);
            setVillages(permVillages);

            setFormData(prev => ({
                ...prev,
                presentDistrict: prev.permDistrict,
                presentConstituency: prev.permConstituency,
                presentMandal: prev.permMandal,
                presentVillage: prev.permVillage,
                presentHouseNo: prev.permHouseNo,
                presentStreet: prev.permStreet,
                presentLandmark: prev.permLandmark,
                presentPincode: prev.permPincode,
            }));
        }
    };

    // Role Based Logic
    // Role Based Logic
    // --- ADMIN AUTO-FILL & LOCKING LOGIC ---
    const { adminLocation, isFieldLocked, userRole } = useAdminLocation();

    // Fetch Districts on Mount for New Registration (required for Admin Auto-fill to show correct names)
    useEffect(() => {
        if (!isEditMode && districts.length === 0) {
            const fetchDistricts = async () => {
                try {
                    const { data: states } = await API.get('/locations?type=STATE');
                    const telangana = states.find(s => s.name === 'Telangana') || states[0];
                    if (telangana) {
                        const { data: dists } = await API.get(`/locations?parent=${telangana._id}`);
                        setDistricts(dists);
                    }
                } catch (error) {
                    console.error("Failed to fetch districts:", error);
                }
            };
            fetchDistricts();
        }
    }, [isEditMode, districts.length]);

    // Auto-fill Address based on Role (Only for New Registration)
    useEffect(() => {
        if (isEditMode || !userRole) return;

        const roleHierarchy = {
            'SUPER_ADMIN': 0,
            'STATE_ADMIN': 1,
            'DISTRICT_ADMIN': 2,
            'MANDAL_ADMIN': 3,
            'MUNICIPALITY_ADMIN': 3,
            'VILLAGE_ADMIN': 4,
            'WARD_ADMIN': 4
        };

        const currentLevel = roleHierarchy[userRole ? userRole.toUpperCase() : ''] || 0;

        const autoFill = async () => {
            let updates = {};

            // State Level
            if (currentLevel >= 1) {
                updates.permState = 'Telangana';
            }

            // District Level
            let dId = adminLocation.districtId;
            // Fallback: Try to find District ID from loaded districts if missing but name exists
            if (!dId && adminLocation.districtName && districts.length > 0) {
                const match = districts.find(d => d.name === adminLocation.districtName);
                if (match) {
                    dId = match._id;
                    console.log("AutoFill: Resolved District ID from name:", dId);
                }
            }

            if (currentLevel >= 2 && dId) {
                updates.permDistrict = dId;

                // If District Admin, fetch Constituencies if not present
                if (currentLevel === 2 && !adminLocation.constituencyId && permConstituencies.length === 0) {
                    try {
                        const { data: children } = await API.get(`/locations?parent=${dId}`);
                        const consts = children.filter(c => c.type === 'CONSTITUENCY');
                        setPermConstituencies(consts);
                    } catch (err) { console.error("Auto-fill fetch error", err); }
                }
            }

            // Constituency Level
            if (adminLocation.constituencyId) {
                updates.permConstituency = adminLocation.constituencyId;
                // Pre-populate dropdown so it shows the value
                if (adminLocation.constituencyName) {
                    setPermConstituencies([{ _id: adminLocation.constituencyId, name: adminLocation.constituencyName }]);
                }
            }

            // Mandal / Municipality Level
            if (currentLevel >= 3) {
                if (adminLocation.mandalId) {
                    updates.permAreaType = 'Rural';
                    updates.permMandal = adminLocation.mandalId;

                    if (adminLocation.mandalName) {
                        setPermMandals([{ _id: adminLocation.mandalId, name: adminLocation.mandalName }]);
                        setAllPermMandals([{ _id: adminLocation.mandalId, name: adminLocation.mandalName }]);
                    }

                    // Fetch Villages for this Mandal
                    if (permVillages.length === 0 && !adminLocation.villageId) {
                        try {
                            const { data: vills } = await API.get(`/locations?parent=${adminLocation.mandalId}`);
                            setPermVillages(vills);
                        } catch (err) { console.error("Auto-fetch villages error", err); }
                    }
                }
                else if (adminLocation.municipalityId) {
                    updates.permAreaType = 'Urban';
                    updates.permMunicipality = adminLocation.municipalityId;

                    if (adminLocation.municipalityName) {
                        setPermMunicipalities([{ _id: adminLocation.municipalityId, name: adminLocation.municipalityName }]);
                        setAllPermMunicipalities([{ _id: adminLocation.municipalityId, name: adminLocation.municipalityName }]);
                    }

                    // Fetch Wards
                    if (permWards.length === 0 && !adminLocation.wardId) {
                        try {
                            const { data: wards } = await API.get(`/locations?parent=${adminLocation.municipalityId}`);
                            setPermWards(wards);
                        } catch (err) { console.error("Auto-fetch wards error", err); }
                    }
                }
            }

            // Village / Ward Level
            if (currentLevel >= 4) {
                if (adminLocation.villageId) {
                    updates.permVillage = adminLocation.villageId;
                    if (adminLocation.villageName) {
                        setPermVillages([{ _id: adminLocation.villageId, name: adminLocation.villageName }]);
                    }
                }
                else if (adminLocation.wardId) {
                    updates.permWardNumber = adminLocation.wardId;
                    if (adminLocation.wardName) {
                        setPermWards([{ _id: adminLocation.wardId, name: adminLocation.wardName }]);
                    }
                }
            }

            if (Object.keys(updates).length > 0) {
                setFormData(prev => ({ ...prev, ...updates }));
            }
        };

        if (adminLocation.districtId || currentLevel >= 1) {
            autoFill();
        }
    }, [isEditMode, userRole, adminLocation, districts]);

    // Helper locked check replaced by Hook
    // const isFieldLocked = ... (Removed)

    // Auto-calculate Age
    useEffect(() => {
        if (formData.dob && formData.dob.length === 10) {
            const age = calculateAge(formData.dob);
            setFormData(prev => ({ ...prev, age: age }));
        } else {
            setFormData(prev => ({ ...prev, age: '' }));
        }
    }, [formData.dob]);

    // Auto-sync Member Count with Family Members
    useEffect(() => {
        // Count = Applicant (1) + Family Members Count
        // We only update if not in View Mode to avoid overriding fetched data unnecessarily, 
        // though strictly it should match.
        if (!isViewMode) {
            const count = (familyMembers?.length || 0) + 1;
            setFormData(prev => ({ ...prev, memberCount: count }));
        }
    }, [familyMembers, isViewMode]);

    // Auto-calculate Political Term End Date (Add 5 Years)
    useEffect(() => {
        if (formData.occupation === 'Political Elected' && formData.politicalFromDate) {
            // value is YYYY-MM
            try {
                const parts = formData.politicalFromDate.split('-');
                if (parts.length === 2) {
                    const year = parseInt(parts[0]);
                    const month = parts[1];
                    if (!isNaN(year)) {
                        const endYear = year + 5;
                        const politicalToDate = `${endYear}-${month}`;

                        // Only update if different to avoid potential loops (though dependency array protects this)
                        setFormData(prev => {
                            if (prev.politicalToDate !== politicalToDate) {
                                return { ...prev, politicalToDate };
                            }
                            return prev;
                        });
                    }
                }
            } catch (e) {
                console.error("Error calculating political end date", e);
            }
        }
    }, [formData.occupation, formData.politicalFromDate]);

    const validateForm = () => {
        const newErrors = {};

        // Basic Info
        if (!formData.surname) newErrors.surname = "Surname is required";
        if (!formData.name) newErrors.name = "Name is required";
        if (!formData.fatherName) newErrors.fatherName = "Father's name is required";
        // if (!formData.dob) newErrors.dob = "Date of Birth is required";
        if (!formData.gender) newErrors.gender = "Gender is required";
        if (!formData.mobileNumber) newErrors.mobileNumber = "Mobile number is required";
        else if (formData.mobileNumber.length !== 10) newErrors.mobileNumber = "Mobile number must be 10 digits";
        if (!formData.aadhaarNumber) newErrors.aadhaarNumber = "Aadhaar number is required";
        else if (formData.aadhaarNumber.replace(/\s/g, '').length !== 12) newErrors.aadhaarNumber = "Aadhaar number must be 12 digits";

        // Email Validation
        // Email Validation - Optional
        if (formData.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) newErrors.email = "Invalid email format";
        }

        if (!formData.occupation) newErrors.occupation = "Occupation is required";

        // Political Elected Validation
        if (formData.occupation === 'Political Elected') {
            if (!formData.politicalPosition) newErrors.politicalPosition = "Political Position is required";
            if (!formData.politicalFromDate) newErrors.politicalFromDate = "From Date is required";
            if (!formData.politicalToDate) newErrors.politicalToDate = "To Date is required";

            if (formData.politicalFromDate && formData.politicalToDate) {
                const from = new Date(formData.politicalFromDate);
                const to = new Date(formData.politicalToDate);

                if (to < from) {
                    newErrors.politicalToDate = "To Date cannot be before From Date";
                } else {
                    // Calculate difference in years
                    const diffTime = Math.abs(to - from);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    const diffYears = diffDays / 365.25;

                    if (diffYears > 6) { // Allowing slightly more than 5 to account for leap years/delays, strictly it said "5 years". Let's say 365*5 + leeway. User said "from to to should not exceed 5 years".
                        // Let's implement strict 5 years logic
                        // 5 Years in ms
                        const fiveYearsMs = 5 * 365 * 24 * 60 * 60 * 1000;
                        // Better: check year difference
                        let years = to.getFullYear() - from.getFullYear();
                        let months = to.getMonth() - from.getMonth();
                        if (months < 0) {
                            years--;
                            months += 12;
                        }
                        // If > 5 years or (5 years and > 0 months)
                        if (years > 5 || (years === 5 && months > 0) || (years === 5 && months === 0 && to.getDate() > from.getDate())) {
                            newErrors.politicalToDate = "Duration strictly cannot exceed 5 years";
                        }
                    }
                }
            }
        }

        if (formData.occupation === 'Private Employee') {
            if (!formData.jobSector) newErrors.jobSector = "Job Sector is required";
            if (!formData.jobOrganization) newErrors.jobOrganization = "Organization is required";
            if (!formData.jobDesignation) newErrors.jobDesignation = "Designation is required";
        }

        if (formData.occupation === 'Self-Employed / Business') {
            if (!formData.businessType) newErrors.businessType = "Type of Business is required";
        }

        // Present Address
        if (!formData.presentDistrict) newErrors.presentDistrict = "District is required";
        if (!formData.presentConstituency) newErrors.presentConstituency = "Constituency is required";

        if (formData.presentAreaType === 'Urban') {
            if (!formData.presentMunicipality) newErrors.presentMunicipality = "Municipality is required";
            if (!formData.presentWardNumber) newErrors.presentWardNumber = "Ward Number is required";
        } else {
            if (!formData.presentMandal) newErrors.presentMandal = "Mandal is required";
            if (!formData.presentVillage) newErrors.presentVillage = "Village is required";
        }

        if (!formData.presentHouseNo) newErrors.presentHouseNo = "House No is required";
        if (!formData.presentPincode) newErrors.presentPincode = "Pincode is required";
        else if (formData.presentPincode.length !== 6) newErrors.presentPincode = "Pincode must be 6 digits";

        // Permanent Address
        if (!formData.permDistrict) newErrors.permDistrict = "District is required";
        if (!formData.permConstituency) newErrors.permConstituency = "Constituency is required";

        if (formData.permAreaType === 'Urban') {
            if (!formData.permMunicipality) newErrors.permMunicipality = "Municipality is required";
            if (!formData.permWardNumber) newErrors.permWardNumber = "Ward Number is required";
        } else {
            if (!formData.permMandal) newErrors.permMandal = "Mandal is required";
            if (!formData.permVillage) newErrors.permVillage = "Village is required";
        }

        if (!formData.permHouseNo) newErrors.permHouseNo = "House No is required";
        if (!formData.permPincode) newErrors.permPincode = "Pincode is required";
        else if (formData.permPincode.length !== 6) newErrors.permPincode = "Pincode must be 6 digits";

        // Present Address (if not same) - Validation logic is covered above because we don't conditionally skip validation blocks based on 'sameAsPermanent' checkbox in the object state
        // Actually, if sameAsPermanent is true, typically the UI hides present, but the state is synced.
        // Wait, if sameAsPermanent is true, we usually validate present address implicitly because it has data.

        // Let's check the original code logic for "Present Address (if not same)"
        // Original code:
        // if (!sameAsPermanent) {
        // ... validate present ...
        // }

        // But above I blindly validated Present Address at lines 1541+. 
        // The original code separated Present and Permanent logic differently.
        // Let me revert to original structure but with my inner Conditionals.

        // Correction: Move Present Validation inside !sameAsPermanent check? 
        // Or did the original code validate Present Address *regardless* and then had a block "Present Address (if not same)"? 
        // Looking at lines 1542-1549 in original, it validates Present Address unconditionally.
        // Then lines 1559-1568 validates it AGAIN if !sameAsPermanent? That seems redundant or I misread.
        // Ah, typically:
        // 1. Permanent Address is ALWAYS validated.
        // 2. Present Address is validated ONLY if !sameAsPermanent.
        // BUT the form might require Present Address always to be filled?
        // Let's re-read original code around 1542.
        // "if (!formData.presentDistrict) newErrors.presentDistrict ..."
        // This runs unconditionally. So Present Address IS mandatory always in the original code.
        // Then lines 1560 "if (!sameAsPermanent)" repeats the checks?
        // That seems like a bug or legacy code in the original file.
        // I will replace both blocks with a clean logic.

        // Actually, usually Permanent Address is the primary one, or Present? 
        // In this form, let's assume both are needed, and sync fills one. 
        // If sync is on, Present has data, so validation passes.

        /* REVISED VALIDATION PLAN */
        // Present Address
        if (!formData.presentDistrict) newErrors.presentDistrict = "District is required";
        if (!formData.presentConstituency) newErrors.presentConstituency = "Constituency is required";

        if (formData.presentAreaType === 'Urban') {
            if (!formData.presentMunicipality) newErrors.presentMunicipality = "Municipality is required";
            if (!formData.presentWardNumber) newErrors.presentWardNumber = "Ward Number is required";
        } else {
            if (!formData.presentMandal) newErrors.presentMandal = "Mandal is required";
            if (!formData.presentVillage) newErrors.presentVillage = "Village is required";
        }

        if (!formData.presentHouseNo) newErrors.presentHouseNo = "House No is required";
        if (!formData.presentPincode) newErrors.presentPincode = "Pincode is required";
        else if (formData.presentPincode.length !== 6) newErrors.presentPincode = "Pincode must be 6 digits";

        // Permanent Address
        if (!formData.permDistrict) newErrors.permDistrict = "District is required";
        if (!formData.permConstituency) newErrors.permConstituency = "Constituency is required";

        if (formData.permAreaType === 'Urban') {
            if (!formData.permMunicipality) newErrors.permMunicipality = "Municipality is required";
            if (!formData.permWardNumber) newErrors.permWardNumber = "Ward Number is required";
        } else {
            if (!formData.permMandal) newErrors.permMandal = "Mandal is required";
            if (!formData.permVillage) newErrors.permVillage = "Village is required";
        }

        if (!formData.permHouseNo) newErrors.permHouseNo = "House No is required";
        if (!formData.permPincode) newErrors.permPincode = "Pincode is required";
        else if (formData.permPincode.length !== 6) newErrors.permPincode = "Pincode must be 6 digits";

        // Remove the redundant block at 1560 if I replace the whole section.
        // I will replace from 1542 to 1568.

        // Ration Card
        if (formData.hasRationCard && formData.rationCardNumber) {
            if (formData.rationCardNumber.length !== 12) newErrors.rationCardNumber = "Ration card number must be 12 digits";
        }

        // Voter ID
        if (formData.epicNumber) {
            if (formData.epicNumber) {
                const epicRegex = /^[A-Z]{4}[0-9]{6}$/;
                if (!epicRegex.test(formData.epicNumber)) {
                    newErrors.epicNumber = "Invalid Voter ID format (e.g., ABCD123456)";
                }
            }
        }

        // Other Details
        if (!formData.caste) newErrors.caste = "Caste is required";
        if (!formData.maritalStatus) newErrors.maritalStatus = "Marital status is required";

        if (formData.communityCertNumber && formData.communityCertNumber.length !== 15) {
            newErrors.communityCertNumber = "Community Certificate Number must be 15 characters";
        }

        // Files
        if (!isEditMode && !files.photo) newErrors.photo = "Member Photo is required";
        // if (!files.aadhaarFront) newErrors.aadhaarFront = "Aadhaar Card Front is required";

        // Legal Consent
        if (!isEditMode && !formData.legalConsent) {
            newErrors.legalConsent = "You must agree to the terms and conditions";
        }

        setErrors(newErrors);
        return newErrors;
    };

    // State for Preview Modal
    const [showPreview, setShowPreview] = useState(false);

    // State for Success Modal
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [createdMemberData, setCreatedMemberData] = useState(null);

    // Document Removal State (Tracks existing files removed by user during Edit)
    const [removedFiles, setRemovedFiles] = useState([]);

    const handleRemoveFile = (fieldName) => {
        // 1. Clear from files state (for both new and existing files)
        setFiles(prev => {
            const updated = { ...prev };
            delete updated[fieldName];
            return updated;
        });

        // 2. If it was an existing file (marker 'existing' or has url in backend data), track for deletion
        const targetFile = files[fieldName];
        if (targetFile?.existing || targetFile?.type === 'existing' || targetFile?.url) {
            setRemovedFiles(prev => [...prev, fieldName]);
        }
    };

    const handleRemoveFamilyFile = (fieldName) => {
        // Clear from familyMemberFiles state
        setFamilyMemberFiles(prev => {
            const updated = { ...prev };
            delete updated[fieldName];
            return updated;
        });
        // Note: Family members are updated as a full list, so clearing from state is enough.
        // The backend resolver handles undefined/null values by clearing the field.
    };

    // Final Submission
    const handleFinalSubmit = async () => {
        setLoading(true);
        try {
            const dataPayload = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'dob' && formData[key] && /^\d{2}-\d{2}-\d{4}$/.test(formData[key])) {
                    const [dd, mm, yyyy] = formData[key].split('-');
                    dataPayload.append(key, `${yyyy}-${mm}-${dd}`);
                } else {
                    dataPayload.append(key, formData[key]);
                }
            });

            Object.keys(files).forEach(key => {
                const file = files[key];
                if (file instanceof File) {
                    dataPayload.append(key, file);
                }
            });

            // Append Removed Files for Backend Processing
            if (isEditMode && removedFiles.length > 0) {
                dataPayload.append('removedFiles', JSON.stringify(removedFiles));
            }

            // Process Family Members
            let photoCount = 0;
            let aadhaarFrontCount = 0;
            let aadhaarBackCount = 0;
            let voterIdFrontCount = 0;
            let voterIdBackCount = 0;

            const finalFamilyMembers = familyMembers.map(fm => {
                const memberObj = { ...fm };
                delete memberObj.files;
                delete memberObj.tempId;

                // Convert DOB from DD-MM-YYYY to YYYY-MM-DD for backend
                if (memberObj.dob && /^\d{2}-\d{2}-\d{4}$/.test(memberObj.dob)) {
                    const [dd, mm, yyyy] = memberObj.dob.split('-');
                    memberObj.dob = `${yyyy}-${mm}-${dd}`;
                }

                const fmFiles = fm.files || {};

                if (fmFiles.photo) {
                    memberObj.photo = `INDEX:${photoCount++}`;
                    dataPayload.append('familyMemberPhotos', fmFiles.photo);
                }
                if (fmFiles.aadhaarFront) {
                    memberObj.aadhaarFront = `INDEX:${aadhaarFrontCount++}`;
                    dataPayload.append('familyMemberAadhaarFronts', fmFiles.aadhaarFront);
                }
                if (fmFiles.aadhaarBack) {
                    memberObj.aadhaarBack = `INDEX:${aadhaarBackCount++}`;
                    dataPayload.append('familyMemberAadhaarBacks', fmFiles.aadhaarBack);
                }
                if (fmFiles.voterIdFront) {
                    memberObj.voterIdFront = `INDEX:${voterIdFrontCount++}`;
                    dataPayload.append('familyMemberVoterIdFronts', fmFiles.voterIdFront);
                }
                if (fmFiles.voterIdBack) {
                    memberObj.voterIdBack = `INDEX:${voterIdBackCount++}`;

                    dataPayload.append('familyMemberVoterIdBacks', fmFiles.voterIdBack);
                }
                return memberObj;
            });

            dataPayload.append('familyMembers', JSON.stringify(finalFamilyMembers));

            // API instance handles cookies automatically.
            // Axios automatically sets Content-Type to multipart/form-data when passing FormData
            // so we don't strictly need to set it, but we can explicit if we want.
            // HOWEVER, manually setting 'Content-Type': 'multipart/form-data' without the boundary
            // often CAUSES errors. It's safer to let Axios/Browser set it.
            const config = {
                headers: {
                    // Let browser set content type with boundary
                }
            };

            if (isEditMode) {
                const { data } = await API.put(`/members/${id}`, dataPayload, config);
                setCreatedMemberData(data);
                alert("Member details updated successfully!");
                navigate('/admin/members');
                return;
            } else {
                const { data } = await API.post(`/members`, dataPayload, config);
                // Show Success Modal instead of immediate navigate
                setCreatedMemberData(data.member);
                setShowPreview(false);
                setShowSuccessModal(true);
            }

        } catch (error) {
            console.error(error);
            alert('Failed to register member: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    // Load data if ID exists (Edit or View mode)
    useEffect(() => {
        if (!id) return; // Only fetch if an ID is present

        const fetchMember = async () => {
            setLoading(true);
            try {
                // 1. Fetch Districts First (to ensure we can map names for Constituencies)
                // We fetch specific state logic or just rely on 'districts' state?
                // Using 'districts' state is unreliable due to race conditions.
                // Safest: Fetch the districts list locally here.
                let localDistricts = districts;
                if (!localDistricts || localDistricts.length === 0) {
                    const { data: states } = await API.get('/locations?type=STATE');
                    const telangana = states.find(s => s.name === 'Telangana') || states[0];
                    if (telangana) {
                        const { data: dists } = await API.get(`/locations?parent=${telangana._id}`);
                        setDistricts(dists);
                        localDistricts = dists;
                    }
                }

                const { data } = await API.get(`/members/${id}`);

                // Flatten and Map Data to Form State
                // Helper to normalize gender case
                const normalizeGender = (g) => {
                    if (!g) return '';
                    if (g.toLowerCase() === 'male') return 'Male';
                    if (g.toLowerCase() === 'female') return 'Female';
                    return 'Other';
                };

                const mappedData = {
                    ...formData, // Keep defaults
                    surname: data.surname,
                    name: data.name,
                    fatherName: data.fatherName || data.familyDetails?.fatherName || '', // Fallback to familyDetails
                    // Date Formats: Backend YYYY-MM-DD -> Frontend DD-MM-YYYY
                    dob: data.dob ? new Date(data.dob).toLocaleDateString('en-GB').replace(/\//g, '-') : '',
                    age: data.age,
                    gender: normalizeGender(data.gender),
                    bloodGroup: data.bloodGroup || '',
                    mobileNumber: data.mobileNumber || data.contactDetails?.mobileNumber || '',
                    alternateMobile: data.alternateMobile || data.contactDetails?.alternateMobile || '',
                    email: data.email || data.contactDetails?.email || '',
                    occupation: data.occupation,
                    // Flatten Political Details
                    politicalPosition: data.politicalDetails?.position || '',
                    politicalFromDate: data.politicalDetails?.fromDate ? new Date(data.politicalDetails.fromDate).toISOString().substring(0, 7) : '', // YYYY-MM
                    politicalToDate: data.politicalDetails?.toDate ? new Date(data.politicalDetails.toDate).toISOString().substring(0, 7) : '',       // YYYY-MM
                    businessType: data.businessType || '', // Map Business Type

                    educationLevel: data.educationLevel || '', // Add education level
                    jobSector: data.jobSector,
                    jobOrganization: data.jobOrganization,

                    jobDesignation: data.jobDesignation,
                    jobCategory: data.jobCategory || '',
                    jobSubCategory: data.jobSubCategory || '',
                    aadhaarNumber: data.aadhaarNumber,

                    // Address Mapping
                    presentDistrict: data.address?.district?._id || data.address?.district || '',
                    presentConstituency: data.address?.constituency || '',
                    presentMandal: data.address?.mandal?._id || data.address?.mandal || '',
                    presentMunicipality: data.address?.municipality?._id || data.address?.municipality || '', // Map Municipality
                    presentVillage: data.address?.village?._id || data.address?.village || '',
                    presentWardNumber: data.address?.wardNumber || '', // Map Ward (String usually)
                    presentHouseNo: data.address?.houseNumber || '',
                    presentStreet: data.address?.street || '',
                    presentLandmark: data.address?.landmark || '',
                    presentPincode: data.address?.pinCode || '',
                    residenceType: data.address?.residencyType || '',

                    // Permanent Address Mapping
                    permDistrict: data.permanentAddress?.district?._id || data.permanentAddress?.district || '',
                    permConstituency: data.permanentAddress?.constituency || '',
                    permMandal: data.permanentAddress?.mandal?._id || data.permanentAddress?.mandal || '',
                    permMunicipality: data.permanentAddress?.municipality?._id || data.permanentAddress?.municipality || '', // Map Municipality
                    permVillage: data.permanentAddress?.village?._id || data.permanentAddress?.village || '',
                    permWardNumber: data.permanentAddress?.wardNumber || '', // Map Ward
                    permHouseNo: data.permanentAddress?.houseNumber || '',
                    permStreet: data.permanentAddress?.street || '',
                    permLandmark: data.permanentAddress?.landmark || '',
                    permPincode: data.permanentAddress?.pinCode || '',

                    // Caste Details
                    caste: data.casteDetails?.caste || 'MALA',
                    subCaste: data.casteDetails?.subCaste || '',
                    communityCertNumber: data.casteDetails?.communityCertNumber || '',

                    // Marriage Details
                    maritalStatus: data.maritalStatus || '',
                    partnerName: data.partnerDetails?.name || '',
                    partnerCaste: data.partnerDetails?.caste || '',
                    partnerSubCaste: data.partnerDetails?.subCaste || '',
                    isInterCaste: data.partnerDetails?.isInterCaste ? 'Yes' : 'No', // Convert boolean to "Yes"/"No"
                    marriageDate: data.partnerDetails?.marriageDate ? new Date(data.partnerDetails.marriageDate).toLocaleDateString('en-GB').replace(/\//g, '-') : '',
                    marriageCertNumber: data.partnerDetails?.marriageCertNumber || '',

                    // Family & Economic
                    annualIncome: data.familyDetails?.annualIncome || '',
                    memberCount: data.familyDetails?.memberCount || '',
                    dependentCount: data.familyDetails?.dependentCount || '',
                    rationCardTypeFamily: data.familyDetails?.rationCardType || '',

                    // Other IDs
                    hasRationCard: !!(data.rationCard?.number),
                    rationCardNumber: data.rationCard?.number || '',
                    rationCardHolderName: data.rationCard?.holderName || '',
                    epicNumber: data.voterId?.epicNumber || '',
                    voterName: data.voterId?.nameOnCard || '',
                    pollingBooth: data.voterId?.pollingBooth || '',

                    mewsId: data.mewsId
                };

                // Store raw data for Document View
                setCreatedMemberData(data);

                setFormData(mappedData);

                // Populate files state with existing document URLs (for display/preview)
                const initialFiles = {};
                const baseUrl = BASE_URL;

                const resolveExistingFile = (url) => {
                    if (!url) return null;
                    if (url.startsWith('blob:')) {
                        return { name: 'preview', url, existing: true, type: 'existing' };
                    }

                    let fullUrl = '';
                    if (url.startsWith('http')) {
                        // Use Proxy for Remote URLs to ensure they load (CORS/Private)
                        fullUrl = `${baseUrl}/api/proxy-image?url=${encodeURIComponent(url)}`;
                    } else {
                        // Local relative path
                        fullUrl = `${baseUrl}/${url.replace(/\\/g, '/')}`;
                    }

                    return {
                        name: url.split(/[/\\]/).pop().split('?')[0], // Remove query params if GCS
                        url: fullUrl,
                        existing: true,
                        type: 'existing'
                    };
                };

                if (data.photoUrl) initialFiles.photo = resolveExistingFile(data.photoUrl);
                if (data.aadhaarCardUrl) initialFiles.aadhaarFront = resolveExistingFile(data.aadhaarCardUrl);
                if (data.aadhaarCardBackUrl) initialFiles.aadhaarBack = resolveExistingFile(data.aadhaarCardBackUrl);
                if (data.casteDetails?.certificateUrl) initialFiles.communityCert = resolveExistingFile(data.casteDetails.certificateUrl);
                if (data.partnerDetails?.certificateUrl) initialFiles.marriageCert = resolveExistingFile(data.partnerDetails.certificateUrl);
                if (data.rationCard?.fileUrl) initialFiles.rationCardFile = resolveExistingFile(data.rationCard.fileUrl);
                if (data.voterId?.fileUrl) initialFiles.voterIdFront = resolveExistingFile(data.voterId.fileUrl);
                if (data.voterId?.backFileUrl) initialFiles.voterIdBack = resolveExistingFile(data.voterId.backFileUrl);
                if (data.bankDetails?.passbookUrl) initialFiles.bankPassbook = resolveExistingFile(data.bankDetails.passbookUrl);

                setFiles(initialFiles);

                // Populate family members
                if (data.familyMembers && Array.isArray(data.familyMembers)) {
                    // Check if family members use "father's details" (inheritance) logic
                    // If necessary, but usually they have their own.
                    const loadedFamilyMembers = data.familyMembers.map((fm, index) => ({
                        ...fm,
                        dob: fm.dob ? new Date(fm.dob).toLocaleDateString('en-GB').replace(/\//g, '-') : '',
                        tempId: fm._id || `existing-${index}`, // Use existing _id or generate tempId
                        files: {} // Files for family members are handled separately
                    }));
                    setFamilyMembers(loadedFamilyMembers);
                }

                // Set sameAsPresent checkbox if addresses are identical
                const presentAddressFields = ['presentDistrict', 'presentConstituency', 'presentMandal', 'presentVillage', 'presentHouseNo', 'presentStreet', 'presentLandmark', 'presentPincode'];
                const permAddressFields = ['permDistrict', 'permConstituency', 'permMandal', 'permVillage', 'permHouseNo', 'permStreet', 'permLandmark', 'permPincode'];
                const addressesMatch = presentAddressFields.every((field, index) => mappedData[field] === mappedData[permAddressFields[index]]);
                setSameAsPermanent(addressesMatch);

                // [FIX] Trigger Cascading Logic to fill Dropdowns
                // 1. Present Address Cascades
                if (mappedData.presentDistrict) {
                    const dId = mappedData.presentDistrict;
                    // Fetch Mandals & Municipalities (children of District)
                    // Note: Depending on backend implementation, this might return all children. 
                    // If Locations are hierarchical: District -> Constituency -> Mandal -> Village
                    // We need Constituencies for the District.

                    try {
                        const { data: distChildren } = await API.get(`/locations?parent=${dId}`);

                        // Filter valid constituencies (backend might return all children types if mixed)
                        const constituencies = distChildren.filter(c => c.type === 'CONSTITUENCY');
                        setPresentConstituencies(constituencies);

                        if (data.address?.constituency) {
                            // If we have a constituency, fetch its children (Mandals/Municipalities)
                            const cId = data.address.constituency; // mappedData might just have ID, verify
                            // api response `data.address.constituency` is likely the ID string based on schema
                            // But let's use the ID we just set in mappedData.presentConstituency

                            const { data: constChildren } = await API.get(`/locations?parent=${cId}`);
                            const mList = constChildren.filter(d => d.type === 'MANDAL');
                            const muniList = constChildren.filter(d => d.type === 'MUNICIPALITY');

                            setAllMandals(mList);
                            setMandals(mList);
                            setMunicipalities(muniList);

                            // If Mandal selected, fetch Villages
                            if (mappedData.presentMandal) {
                                const { data: villagesData } = await API.get(`/locations?parent=${mappedData.presentMandal}`);
                                setVillages(villagesData);
                            }
                        }

                    } catch (err) {
                        console.error("Error fetching present address cascades", err);
                    }
                }

                // 2. Permanent Address Cascades
                if (!addressesMatch && mappedData.permDistrict) {
                    const pdId = mappedData.permDistrict;

                    try {
                        const { data: pDistChildren } = await API.get(`/locations?parent=${pdId}`);
                        const pConstituencies = pDistChildren.filter(c => c.type === 'CONSTITUENCY');
                        setPermConstituencies(pConstituencies);

                        if (data.permanentAddress?.constituency) {
                            const pcId = data.permanentAddress.constituency;
                            const { data: pConstChildren } = await API.get(`/locations?parent=${pcId}`);

                            const pmList = pConstChildren.filter(d => d.type === 'MANDAL');
                            const pmuniList = pConstChildren.filter(d => d.type === 'MUNICIPALITY');

                            setAllPermMandals(pmList);
                            setPermMandals(pmList);
                            setPermMunicipalities(pmuniList);

                            // If Perm Mandal selected, fetch Perm Villages
                            if (mappedData.permMandal) {
                                const { data: pVillagesData } = await API.get(`/locations?parent=${mappedData.permMandal}`);
                                setPermVillages(pVillagesData);
                            }
                        }
                    } catch (err) {
                        console.error("Error fetching perm address cascades", err);
                    }
                }


            } catch (error) {
                console.error("Failed to fetch member data:", error);
                alert('Failed to load member data: ' + (error.response?.data?.message || error.message));
                navigate('/admin/members'); // Redirect if data fetch fails
            } finally {
                setLoading(false);
            }
        };

        fetchMember();
    }, [id, navigate]); // Depend on 'id' and 'navigate'

    // Handle Download Application PDF
    const handleDownloadApplication = async () => {
        const element = document.getElementById('application-form-print');
        if (!element) return;

        // Temporarily show the element to capture it
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

            pdf.save(`MEWS_Application_${createdMemberData?.mewsId || 'Form'}.pdf`);

        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Failed to generate PDF. Please try again.");
        } finally {
            // Hide it again
            element.classList.add('hidden');
        }
    };

    const confirmSubmit = () => {
        handleFinalSubmit();
    };

    // Initial Submission - Check Validation then decide
    // Helper: Map field names to their section IDs
    const getSectionKeyForField = (fieldName) => {
        const sections = {
            1: ['surname', 'name', 'fatherName', 'dob', 'gender', 'mobileNumber', 'aadhaarNumber', 'occupation', 'jobSector', 'jobOrganization', 'jobDesignation', 'jobCategory', 'jobSubCategory', 'educationLevel', 'email', 'bloodGroup', 'alternateMobile'],
            2: ['presentDistrict', 'presentConstituency', 'presentMandal', 'presentVillage', 'presentHouseNo', 'presentStreet', 'presentLandmark', 'presentPincode', 'residenceType', 'permDistrict', 'permConstituency', 'permMandal', 'permVillage', 'permHouseNo', 'permStreet', 'permLandmark', 'permPincode'],
            4: ['caste', 'subCaste', 'communityCertNumber', 'communityCert'],
            5: ['maritalStatus', 'partnerCaste', 'partnerSubCaste', 'isInterCaste'],
            6: ['epicNumber', 'voterName', 'pollingBooth', 'voterIdFront', 'voterIdBack'],
            7: ['photo', 'aadhaarFront', 'aadhaarBack'], // Document Uploads section
            8: ['annualIncome', 'memberCount', 'dependentCount', 'rationCardTypeFamily'],
            9: ['rationCardNumber', 'rationCardHolderName', 'rationCardTypeFamily', 'hasRationCard', 'rationCardFile', 'legalConsent']
        };

        for (const [key, fields] of Object.entries(sections)) {
            if (fields.includes(fieldName)) return parseInt(key);
        }
        return 1; // Default to basic info if unknown
    };

    // Initial Submission - Check Validation then decide
    const handleSubmit = (e) => {
        e.preventDefault();

        // Check email verification first (ONLY IF EMAIL IS PROVIDED)
        if (formData.email && !emailVerification.isVerified) {
            setErrors(prev => ({ ...prev, email: 'Please verify your email before submitting' }));
            setEmailVerification(prev => ({ ...prev, error: 'Email verification is required' }));
            // Open Basic Details section
            setOpenSections(prev => ({ ...prev, 1: true }));
            // Scroll to email field
            setTimeout(() => {
                const emailElement = document.getElementsByName('email')[0];
                if (emailElement) {
                    emailElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 300);
            return;
        }

        const currentErrors = validateForm();
        const errorFields = Object.keys(currentErrors);

        if (errorFields.length > 0) {
            // Find sections to open
            const sectionsToOpen = {};
            let requestScroll = false;

            errorFields.forEach((field, index) => {
                const sectionKey = getSectionKeyForField(field);
                sectionsToOpen[sectionKey] = true;
            });

            // Update open sections to reveal errors
            setOpenSections(prev => ({ ...prev, ...sectionsToOpen }));

            // Scroll to the first error after a slight delay to allow expansion
            setTimeout(() => {
                const firstErrorField = errorFields[0];
                const element = document.getElementsByName(firstErrorField)[0];
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.focus();
                } else {
                    // Fallback to top if specific element cant be focused
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }, 300);

            return;
        }

        if (isEditMode) {
            handleFinalSubmit();
            return;
        }

        setShowPreview(true);
    };








    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col print:hidden">
            <AdminHeader />
            {showPreview && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h2 className="text-2xl font-bold text-gray-800">{isEditMode ? 'Preview Updates' : 'Preview Registration Details'}</h2>
                            <button onClick={() => setShowPreview(false)} className="text-gray-500 hover:text-red-500">
                                <FaSignOutAlt size={24} className="transform rotate-180" />
                            </button>
                        </div>

                        <div className="p-4 md:p-8 space-y-8">
                            {/* Basic Info Preview */}
                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-blue-800 border-b border-gray-200 pb-2 mb-4 flex items-center gap-2">
                                    <FaUser className="text-blue-600" /> Basic Information
                                </h3>
                                <div className="border border-gray-200 rounded-lg overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <tbody className="divide-y divide-gray-100">
                                            <tr>
                                                <td className="px-4 py-3 font-medium bg-gray-50 text-gray-700 w-1/3">Full Name</td>
                                                <td className="px-4 py-3 text-gray-900 font-bold">{formData.name} {formData.surname}</td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-3 font-medium bg-gray-50 text-gray-700">S/o , W/o, D/o</td>
                                                <td className="px-4 py-3 text-gray-900">{formData.fatherName}</td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-3 font-medium bg-gray-50 text-gray-700">Date of Birth / Age</td>
                                                <td className="px-4 py-3 text-gray-900">{formData.dob} ({formData.age} Years)</td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-3 font-medium bg-gray-50 text-gray-700">Gender / Blood Group</td>
                                                <td className="px-4 py-3 text-gray-900">{formData.gender} / {formData.bloodGroup || '-'}</td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-3 font-medium bg-gray-50 text-gray-700">Occupation</td>
                                                <td className="px-4 py-3 text-gray-900">{formData.occupation}</td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-3 font-medium bg-gray-50 text-gray-700">Contact Number</td>
                                                <td className="px-4 py-3 text-gray-900 font-mono">{formData.mobileNumber} {formData.alternateMobile ? `/ ${formData.alternateMobile}` : ''}</td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-3 font-medium bg-gray-50 text-gray-700">Email / Aadhaar</td>
                                                <td className="px-4 py-3 text-gray-900">{formData.email || '-'} / <span className="font-mono">{formData.aadhaarNumber}</span></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Present Address Preview */}
                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-blue-800 border-b border-gray-200 pb-2 mb-4 flex items-center gap-2">
                                    <FaMapMarkerAlt className="text-blue-600" /> Present Address
                                </h3>
                                <div className="border border-gray-200 rounded-lg overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <tbody className="divide-y divide-gray-100">
                                            <tr>
                                                <td className="px-4 py-3 font-medium bg-gray-50 text-gray-700 w-1/3">Address Line</td>
                                                <td className="px-4 py-3 text-gray-900">{formData.presentHouseNo}, {formData.presentStreet || ''}, {formData.presentLandmark || ''}</td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-3 font-medium bg-gray-50 text-gray-700">Village / Mandal</td>
                                                <td className="px-4 py-3 text-gray-900">
                                                    {villages.find(v => v._id === formData.presentVillage)?.name || formData.presentVillage}, {' '}
                                                    {mandals.find(m => m._id === formData.presentMandal)?.name || formData.presentMandal}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-3 font-medium bg-gray-50 text-gray-700">District / State</td>
                                                <td className="px-4 py-3 text-gray-900">
                                                    {districts.find(d => d._id === formData.presentDistrict)?.name || formData.presentDistrict}, Telangana
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-3 font-medium bg-gray-50 text-gray-700">Constituency / Pincode</td>
                                                <td className="px-4 py-3 text-gray-900">{formData.presentConstituency} - {formData.presentPincode}</td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-3 font-medium bg-gray-50 text-gray-700">Residence Type</td>
                                                <td className="px-4 py-3 text-gray-900">{formData.residenceType || '-'}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Permanent Address Preview */}
                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-blue-800 border-b border-gray-200 pb-2 mb-4 flex items-center gap-2">
                                    <FaHome className="text-blue-600" /> Permanent Address
                                </h3>
                                <div className="border border-gray-200 rounded-lg overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <tbody className="divide-y divide-gray-100">
                                            <tr>
                                                <td className="px-4 py-3 font-medium bg-gray-50 text-gray-700 w-1/3">Address Line</td>
                                                <td className="px-4 py-3 text-gray-900">{formData.permHouseNo}, {formData.permStreet || ''}, {formData.permLandmark || ''}</td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-3 font-medium bg-gray-50 text-gray-700">Village / Mandal</td>
                                                <td className="px-4 py-3 text-gray-900">
                                                    {permVillages.find(v => v._id === formData.permVillage)?.name || formData.permVillage}, {' '}
                                                    {permMandals.find(m => m._id === formData.permMandal)?.name || formData.permMandal}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-3 font-medium bg-gray-50 text-gray-700">District / State</td>
                                                <td className="px-4 py-3 text-gray-900">
                                                    {districts.find(d => d._id === formData.permDistrict)?.name || formData.permDistrict}, Telangana
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-3 font-medium bg-gray-50 text-gray-700">Constituency / Pincode</td>
                                                <td className="px-4 py-3 text-gray-900">{formData.permConstituency} - {formData.permPincode}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Caste & Community Info */}
                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-blue-800 border-b border-gray-200 pb-2 mb-4 flex items-center gap-2">
                                    <FaUsers className="text-blue-600" /> Caste & Community
                                </h3>
                                <div className="border border-gray-200 rounded-lg overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <tbody className="divide-y divide-gray-100">
                                            <tr>
                                                <td className="px-4 py-3 font-medium bg-gray-50 text-gray-700 w-1/3">Caste / Sub-Caste</td>
                                                <td className="px-4 py-3 text-gray-900">{formData.caste} {formData.subCaste ? `/ ${formData.subCaste}` : ''}</td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-3 font-medium bg-gray-50 text-gray-700">Community Cert No.</td>
                                                <td className="px-4 py-3 text-gray-900">{formData.communityCertNumber || '-'}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Marriage Info */}
                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-blue-800 border-b border-gray-200 pb-2 mb-4 flex items-center gap-2">
                                    <FaRing className="text-blue-600" /> Marriage Information
                                </h3>
                                <div className="border border-gray-200 rounded-lg overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <tbody className="divide-y divide-gray-100">
                                            <tr>
                                                <td className="px-4 py-3 font-medium bg-gray-50 text-gray-700 w-1/3">Marital Status</td>
                                                <td className="px-4 py-3 text-gray-900">{formData.maritalStatus}</td>
                                            </tr>
                                            {formData.maritalStatus === 'Married' && (
                                                <>
                                                    <tr>
                                                        <td className="px-4 py-3 font-medium bg-gray-50 text-gray-700">Inter-Caste Marriage</td>
                                                        <td className="px-4 py-3 text-gray-900 font-bold text-purple-600">{formData.isInterCaste}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="px-4 py-3 font-medium bg-gray-50 text-gray-700">Partner Details (Caste)</td>
                                                        <td className="px-4 py-3 text-gray-900">{formData.partnerName || 'Partner'} - {formData.partnerCaste || '-'} / {formData.partnerSubCaste || '-'}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="px-4 py-3 font-medium bg-gray-50 text-gray-700">Marriage Date / Cert No.</td>
                                                        <td className="px-4 py-3 text-gray-900">{formData.marriageDate || '-'} / {formData.marriageCertNumber || '-'}</td>
                                                    </tr>
                                                </>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Family & Economic */}
                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-blue-800 border-b border-gray-200 pb-2 mb-4 flex items-center gap-2">
                                    <FaRupeeSign className="text-blue-600" /> Family & Economic
                                </h3>
                                <div className="border border-gray-200 rounded-lg overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <tbody className="divide-y divide-gray-100">
                                            <tr>
                                                <td className="px-4 py-3 font-medium bg-gray-50 text-gray-700 w-1/3">Annual Income</td>
                                                <td className="px-4 py-3 text-gray-900 font-bold">{formData.annualIncome}</td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-3 font-medium bg-gray-50 text-gray-700">Total Family Members</td>
                                                <td className="px-4 py-3 text-gray-900">{formData.memberCount}</td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-3 font-medium bg-gray-50 text-gray-700">Ration Card Type</td>
                                                <td className="px-4 py-3 text-gray-900">{formData.rationCardTypeFamily || '-'}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Family Members Preview */}
                            {familyMembers.length > 0 && (
                                <div className="mb-8">
                                    <h3 className="text-lg font-bold text-blue-800 border-b border-gray-200 pb-2 mb-4 flex items-center gap-2">
                                        <FaUsers className="text-blue-600" /> Family Members
                                    </h3>
                                    <div className="border border-gray-200 rounded-lg overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-gray-50 text-gray-700 font-bold uppercase text-xs">
                                                <tr>
                                                    <th className="px-4 py-3 border-b border-gray-200">#</th>
                                                    <th className="px-4 py-3 border-b border-gray-200">Name & Relation</th>
                                                    <th className="px-4 py-3 border-b border-gray-200">Age / Gender</th>
                                                    <th className="px-4 py-3 border-b border-gray-200">Occupation</th>
                                                    <th className="px-4 py-3 border-b border-gray-200">Aadhaar</th>
                                                    <th className="px-4 py-3 border-b border-gray-200 text-center">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {familyMembers.map((fm, idx) => (
                                                    <tr key={fm.tempId} className="hover:bg-gray-50 transition">
                                                        <td className="px-4 py-3 text-gray-500 font-mono w-10 text-center">{idx + 1}</td>
                                                        <td className="px-4 py-3 text-gray-900">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                                                                    {fm.files?.photo ? (
                                                                        <img src={URL.createObjectURL(fm.files.photo)} alt={fm.name} className="w-full h-full object-cover" />
                                                                    ) : (fm.photo && typeof fm.photo === 'string' ? (
                                                                        <img
                                                                            src={(() => {
                                                                                const photo = fm.photo;
                                                                                const baseUrl = BASE_URL;
                                                                                if (photo.startsWith('http')) {
                                                                                    return `${baseUrl}/api/proxy-image?url=${encodeURIComponent(photo)}`;
                                                                                }
                                                                                return `${baseUrl}/${photo.replace(/\\/g, '/')}`;
                                                                            })()}
                                                                            alt={fm.name}
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <FaUser className="text-gray-300 m-auto mt-1" size={14} />
                                                                    ))}
                                                                </div>
                                                                <div>
                                                                    <div className="font-bold">{fm.name} {fm.surname}</div>
                                                                    <div className="text-[10px] text-blue-600 font-bold uppercase tracking-wide">{fm.relation}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-700">{fm.age} Years / {fm.gender}</td>
                                                        <td className="px-4 py-3 text-gray-700">{fm.occupation}</td>
                                                        <td className="px-4 py-3 text-gray-700 font-mono">{fm.aadhaarNumber || '-'}</td>
                                                        <td className="px-4 py-3 text-center">
                                                            <button
                                                                onClick={() => handleEditFamilyMember(idx)}
                                                                className="text-blue-600 hover:text-blue-800 p-1.5 hover:bg-blue-50 rounded transition"
                                                                title="Edit Member"
                                                            >
                                                                <FaEdit />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Other Details - Table Format */}
                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-blue-700 border-b pb-2 mb-4">Other Details</h3>
                                <div className="border border-gray-200 rounded-lg overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 text-gray-700 font-bold">
                                            <tr>
                                                <th className="px-4 py-3 border-b border-gray-200 w-1/3">Document Type</th>
                                                <th className="px-4 py-3 border-b border-gray-200">Details</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            <tr>
                                                <td className="px-4 py-3 font-medium text-gray-900 bg-gray-50/50">Ration Card</td>
                                                <td className="px-4 py-3 text-gray-700">
                                                    {formData.hasRationCard ? (
                                                        <>
                                                            <span className="font-mono font-bold bg-blue-50 px-2 py-0.5 rounded text-blue-700 mr-2">{formData.rationCardNumber}</span>
                                                            {formData.rationCardHolderName && <span className="text-gray-500">({formData.rationCardHolderName})</span>}
                                                        </>
                                                    ) : <span className="text-gray-400 italic">Not available</span>}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-3 font-medium text-gray-900 bg-gray-50/50">Voter ID</td>
                                                <td className="px-4 py-3 text-gray-700">
                                                    {formData.epicNumber ? (
                                                        <div className="flex flex-col gap-1">
                                                            <div>
                                                                <span className="font-mono font-bold bg-purple-50 px-2 py-0.5 rounded text-purple-700 mr-2">{formData.epicNumber}</span>
                                                                {formData.voterName && <span className="text-gray-500">({formData.voterName})</span>}
                                                            </div>
                                                            {formData.pollingBooth && <div className="text-xs text-gray-500">Booth: {formData.pollingBooth}</div>}
                                                        </div>
                                                    ) : <span className="text-gray-400 italic">Not available</span>}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Documents Preview Grid */}
                            <div>
                                <h3 className="text-lg font-bold text-blue-700 border-b pb-2 mb-4">Uploaded Documents</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        { key: 'photo', label: 'Member Photo' },
                                        { key: 'communityCert', label: 'Community Cert' },
                                        { key: 'aadhaarFront', label: 'Aadhaar Front' },
                                        { key: 'aadhaarBack', label: 'Aadhaar Back' },
                                        { key: 'rationCardFile', label: 'Ration Card' },
                                        { key: 'voterIdFront', label: 'Voter Front' },
                                        { key: 'voterIdBack', label: 'Voter Back' },
                                        { key: 'bankPassbook', label: 'Bank Passbook' },
                                        { key: 'marriageCert', label: 'Marriage Cert' }
                                    ].map((doc) => (
                                        files[doc.key] && (
                                            <div key={doc.key} className="border rounded-lg p-2 bg-gray-50 text-center">
                                                <p className="text-xs font-bold text-gray-700 mb-2">{doc.label}</p>
                                                <div className="w-full h-32 bg-gray-200 rounded flex items-center justify-center overflow-hidden">
                                                    {files[doc.key].existing ? (
                                                        <img
                                                            src={files[doc.key].url}
                                                            alt={doc.label}
                                                            className="w-full h-full object-contain"
                                                        />
                                                    ) : files[doc.key].type.startsWith('image/') ? (
                                                        <img
                                                            src={URL.createObjectURL(files[doc.key])}
                                                            alt={doc.label}
                                                            className="w-full h-full object-contain"
                                                        />
                                                    ) : (
                                                        <div className="flex flex-col items-center text-gray-500">
                                                            <FaFileAlt size={24} />
                                                            <span className="text-[10px] mt-1">{files[doc.key].name}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    ))}
                                </div>

                                {familyMembers.some(fm => fm.files && Object.keys(fm.files).length > 0) && (
                                    <div className="mt-8 border-t pt-4">
                                        <h4 className="text-sm font-bold text-gray-700 mb-3">Family Member Documents</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {familyMembers.map((fm, idx) => {
                                                const fmDocs = [
                                                    { key: 'photo', label: 'Photo' },
                                                    { key: 'aadhaarFront', label: 'Aadhaar Front' },
                                                    { key: 'aadhaarBack', label: 'Aadhaar Back' },
                                                    { key: 'voterIdFront', label: 'Voter Front' },
                                                    { key: 'voterIdBack', label: 'Voter Back' }
                                                ];
                                                return fmDocs.map(doc => (
                                                    fm.files && fm.files[doc.key] && (
                                                        <div key={`${idx}-${doc.key}`} className="border rounded-lg p-2 bg-gray-50 text-center">
                                                            <p className="text-xs font-bold text-gray-700 mb-2 truncate" title={`${fm.name} - ${doc.label}`}>{fm.name} - {doc.label}</p>
                                                            <div className="w-full h-32 bg-gray-200 rounded flex items-center justify-center overflow-hidden">
                                                                {fm.files[doc.key] instanceof File ? (
                                                                    <img src={URL.createObjectURL(fm.files[doc.key])} alt={doc.label} className="w-full h-full object-contain" />
                                                                ) : (
                                                                    <div className="flex flex-col items-center text-gray-500"><FaFileAlt size={24} /></div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )
                                                ));
                                            })}
                                        </div>
                                    </div>
                                )}

                                {Object.keys(files).length === 0 && <p className="text-sm text-gray-500 italic">No documents uploaded.</p>}
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
                                {loading ? 'Submitting...' : (isEditMode ? 'Confirm Update' : 'Confirm & Register')} <FaCheckSquare />
                            </button>
                        </div>
                    </div>
                </div>
            )}




            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className="print:hidden">
                    <AdminSidebar activePage={isEditMode || isViewMode ? "members" : "register-member"} />
                </div>

                {/* Main Content */}
                {!isViewMode && <main className="flex-1 overflow-y-auto">
                    {/* Dashboard Header */}
                    <DashboardHeader
                        title={isEditMode ? 'Edit Member Profile' : isViewMode ? 'Member Details' : 'New Member Registration'}
                        subtitle={isViewMode ? 'View full member profile and details' : (isEditMode ? 'Update existing member details' : 'Enter details to register a new member')}
                        breadcrumb={
                            <>
                                <Link to="/admin/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
                                <span className="opacity-70">&gt;</span>
                                <Link to="/admin/members" className="hover:text-white transition-colors">Members</Link>
                                <span className="opacity-70">&gt;</span>
                                <span>{isEditMode ? 'Edit' : isViewMode ? 'Details' : 'Register'}</span>
                            </>
                        }
                    >
                        {isViewMode && (
                            <button
                                onClick={() => navigate(`/admin/members/edit/${id}`)}
                                className="bg-white bg-opacity-10 hover:bg-opacity-20 backdrop-blur-md text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all border border-white/20"
                            >
                                <FaEdit /> Edit Profile
                            </button>
                        )}
                        <Link to="/admin/members" className="bg-white bg-opacity-10 hover:bg-opacity-20 backdrop-blur-md text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all border border-white/20">
                            <FaArrowLeft /> Back to List
                        </Link>
                    </DashboardHeader>

                    <div className="max-w-full px-4 pb-12 -mt-10">

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <fieldset disabled={isViewMode} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">

                                {/* Basic Info */}
                                <CollapsibleSection
                                    title="Member Basic Information"
                                    icon={FaIdCard}
                                    sectionNumber={1}
                                    isOpen={openSections[1]}
                                    onToggle={() => toggleSection(1)}
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <FormInput
                                            label="Surname"
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
                                            label="S/o , W/o, D/o"
                                            name="fatherName"
                                            value={formData.fatherName || ''}
                                            onChange={handleChange}
                                            placeholder="Enter S/o, W/o, D/o Name"
                                            required
                                            error={errors.fatherName}
                                        />

                                        <FormInput
                                            label="Date of Birth (DD-MM-YYYY)"
                                            name="dob"
                                            value={formData.dob}
                                            onChange={(e) => handleDateChange(e, setFormData, 'dob')}
                                            type="text"
                                            placeholder="DD-MM-YYYY"
                                            maxLength={10}
                                            // required
                                            error={errors.dob}
                                        />
                                        <FormInput
                                            label="Age"
                                            value={formData.age}
                                            placeholder="Auto-calculated"
                                            disabled={true}
                                        />

                                        {(parseInt(formData.age) >= 5 || !formData.age) && (
                                            <>
                                                <FormSelect
                                                    label="Occupation"
                                                    name="occupation"
                                                    value={formData.occupation}
                                                    onChange={handleChange}
                                                    options={memberOccupations}
                                                    disabled={false}
                                                    required
                                                    error={errors.occupation}
                                                />

                                                {formData.occupation === 'Private Employee' && (
                                                    <>
                                                        <FormSelect
                                                            label="Job Sector"
                                                            name="jobSector"
                                                            value={formData.jobSector}
                                                            onChange={handleChange}
                                                            options={[
                                                                "Banking / Finance", "Education", "Healthcare", "IT / Software",
                                                                "Manufacturing", "Other", "Retail", "Services"
                                                            ]}
                                                            required
                                                            error={errors.jobSector}
                                                        />
                                                        <FormInput
                                                            label="Organization / Company"
                                                            name="jobOrganization"
                                                            value={formData.jobOrganization}
                                                            onChange={handleChange}
                                                            placeholder="Enter company name"
                                                            required
                                                            error={errors.jobOrganization}
                                                        />
                                                        <FormInput
                                                            label="Designation"
                                                            name="jobDesignation"
                                                            value={formData.jobDesignation}
                                                            onChange={handleChange}
                                                            placeholder="Enter designation"
                                                            required
                                                            error={errors.jobDesignation}
                                                        />
                                                    </>
                                                )}

                                                {formData.occupation === 'Government Employee' && (
                                                    <>
                                                        <FormSelect
                                                            label="Job Category"
                                                            name="jobCategory"
                                                            value={formData.jobCategory}
                                                            onChange={handleChange}
                                                            options={Object.keys(GOVT_JOB_CATEGORIES)}
                                                            required
                                                            error={errors.jobCategory}
                                                        />
                                                        <FormSelect
                                                            label="Job Sub-Category"
                                                            name="jobSubCategory"
                                                            value={formData.jobSubCategory}
                                                            onChange={handleChange}
                                                            options={formData.jobCategory ? GOVT_JOB_CATEGORIES[formData.jobCategory] : []}
                                                            disabled={!formData.jobCategory}
                                                            error={errors.jobSubCategory}
                                                        />
                                                        <FormSelect
                                                            label="Department / Organization"
                                                            name="jobOrganization"
                                                            value={formData.jobOrganization}
                                                            onChange={handleChange}
                                                            options={GOVT_DEPARTMENTS}
                                                            required
                                                            error={errors.jobOrganization}
                                                        />
                                                        <FormInput
                                                            label="Designation"
                                                            name="jobDesignation"
                                                            value={formData.jobDesignation}
                                                            onChange={handleChange}
                                                            placeholder="Enter designation"
                                                            required
                                                            error={errors.jobDesignation}
                                                        />
                                                    </>
                                                )}

                                                {formData.occupation === 'Political Elected' && (
                                                    <>
                                                        <FormSelect
                                                            label="Political Position"
                                                            name="politicalPosition"
                                                            value={formData.politicalPosition}
                                                            onChange={handleChange}
                                                            options={POLITICAL_POSITIONS}
                                                            required
                                                            error={errors.politicalPosition}
                                                        />
                                                        <FormInput
                                                            label="From (Month & Year)"
                                                            name="politicalFromDate"
                                                            value={formData.politicalFromDate}
                                                            onChange={handleChange}
                                                            type="month"
                                                            required
                                                            error={errors.politicalFromDate}
                                                            colSpan="col-span-1"
                                                        />
                                                        <FormInput
                                                            label="To (Month & Year)"
                                                            name="politicalToDate"
                                                            value={formData.politicalToDate}
                                                            onChange={handleChange}
                                                            type="month"
                                                            required
                                                            error={errors.politicalToDate}
                                                            colSpan="col-span-1"
                                                        />
                                                    </>
                                                )}

                                                {(formData.occupation === 'Retired Govt. Employee' || formData.occupation === 'Retired Private Employee') && (
                                                    <FormInput
                                                        label="Designation"
                                                        name="jobDesignation"
                                                        value={formData.jobDesignation}
                                                        onChange={handleChange}
                                                        placeholder="Enter designation"
                                                        required
                                                    />
                                                )}

                                                {formData.occupation === 'Self-Employed / Business' && (
                                                    <FormInput
                                                        label="Type of Business"
                                                        name="businessType"
                                                        value={formData.businessType}
                                                        onChange={handleChange}
                                                        placeholder="Enter type of business"
                                                        required
                                                        error={errors.businessType}
                                                    />
                                                )}

                                                {formData.occupation === 'Other' && (
                                                    <FormInput
                                                        label="Specify Details"
                                                        name="jobDesignation"
                                                        value={formData.jobDesignation}
                                                        onChange={handleChange}
                                                        placeholder="Enter occupation details"
                                                        required
                                                    />
                                                )}

                                                {formData.occupation === 'Student' && (
                                                    <FormSelect
                                                        label="Education Level"
                                                        name="educationLevel"
                                                        value={formData.educationLevel}
                                                        onChange={handleChange}
                                                        options={["Degree", "Engineering & Technology", "High School", "Intermediate", "PG", "Polytechnic / Diploma", "Primary School", "Research / Doctoral Studies (PhD)", "Vocational / ITI"]}
                                                        required
                                                    />
                                                )}
                                            </>
                                        )}

                                        <div className="col-span-1">
                                            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Gender</label>
                                            <div className="flex items-center gap-6 mt-3">
                                                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="gender" value="Female" onChange={handleChange} checked={formData.gender === 'Female'} className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" /> <span className="text-sm text-gray-700">Female</span></label>
                                                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="gender" value="Male" onChange={handleChange} checked={formData.gender === 'Male'} className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" /> <span className="text-sm text-gray-700">Male</span></label>
                                                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="gender" value="Other" onChange={handleChange} checked={formData.gender === 'Other'} className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" /> <span className="text-sm text-gray-700">Other</span></label>
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
                                            onBlur={(e) => handleDuplicateCheck('mobileNumber', e.target.value)}
                                            placeholder="Enter 10-digit mobile number"
                                            required
                                            error={errors.mobileNumber}
                                        />
                                        <FormSelect
                                            label="Blood Group"
                                            name="bloodGroup"
                                            value={formData.bloodGroup}
                                            onChange={handleChange}
                                            options={["A+", "A-", "AB+", "AB-", "B+", "B-", "O+", "O-", "Oh (Bombay Blood Group)"]}
                                        />
                                        <FormInput label="Alternate Mobile Number" name="alternateMobile" value={formData.alternateMobile} onChange={handleChange} placeholder="Enter alternate mobile number" />

                                        {/* Email Verification Section */}
                                        <div className="col-span-1 md:col-span-3">
                                            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                                                Email Address
                                            </label>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                {/* Email Input + Send Code Button */}
                                                <div className="col-span-1 md:col-span-2 flex gap-2">
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                        disabled={emailVerification.isVerified}
                                                        className={`flex-1 bg-white border ${errors.email ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'} rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-400 ${emailVerification.isVerified ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                                        placeholder="Enter email address"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={handleSendVerificationCode}
                                                        disabled={emailVerification.loading || emailVerification.isVerified || !formData.email}
                                                        className={`px-4 py-2.5 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${emailVerification.isVerified
                                                            ? 'bg-green-100 text-green-700 cursor-not-allowed'
                                                            : emailVerification.loading || !formData.email
                                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                                : 'bg-blue-600 text-white hover:bg-blue-700'
                                                            }`}
                                                    >
                                                        {emailVerification.loading ? 'Sending...' : emailVerification.isVerified ? '✓ Verified' : 'Send Code'}
                                                    </button>
                                                </div>

                                                {/* Verification Code Input + Verify Button (Only show after code sent) */}
                                                {emailVerification.codeSent && !emailVerification.isVerified && (
                                                    <div className="col-span-1 flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={emailVerification.verificationCode}
                                                            onChange={(e) => {
                                                                const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                                                setEmailVerification(prev => ({ ...prev, verificationCode: val, error: '' }));
                                                            }}
                                                            maxLength={6}
                                                            className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-400"
                                                            placeholder="6-digit code"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={handleVerifyCode}
                                                            disabled={emailVerification.loading || emailVerification.verificationCode.length !== 6}
                                                            className={`px-4 py-2.5 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${emailVerification.loading || emailVerification.verificationCode.length !== 6
                                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                                : 'bg-green-600 text-white hover:bg-green-700'
                                                                }`}
                                                        >
                                                            {emailVerification.loading ? 'Verifying...' : 'Verify'}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Success/Error Messages */}
                                            {emailVerification.success && (
                                                <p className="text-green-600 text-xs mt-2 font-medium flex items-center gap-1">
                                                    <span className="text-green-600">✓</span> {emailVerification.success}
                                                </p>
                                            )}
                                            {emailVerification.error && (
                                                <p className="text-red-500 text-xs mt-2 font-medium">{emailVerification.error}</p>
                                            )}
                                            {errors.email && (
                                                <p className="text-red-500 text-xs mt-2 font-medium">{errors.email}</p>
                                            )}

                                            {/* Resend Code Link */}
                                            {emailVerification.codeSent && !emailVerification.isVerified && (
                                                <div className="mt-2">
                                                    {emailVerification.resendCountdown > 0 ? (
                                                        <p className="text-gray-500 text-xs">
                                                            Resend code in {emailVerification.resendCountdown}s
                                                        </p>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={handleResendCode}
                                                            className="text-blue-600 text-xs font-medium hover:underline"
                                                        >
                                                            Resend Code
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <FormInput label="Aadhar Number" name="aadhaarNumber" value={formData.aadhaarNumber} onChange={handleChange} onBlur={(e) => { handleBlur && handleBlur(e); handleDuplicateCheck('aadhaarNumber', e.target.value); }} placeholder="Enter 12-digit Aadhar number" required error={errors.aadhaarNumber} />

                                        {/* Member Photo removed from here as requested, moved to bottom */}
                                    </div>
                                </CollapsibleSection>

                                {/* Present Address Info */}
                                <CollapsibleSection
                                    title="Address Information"
                                    icon={FaMapMarkerAlt}
                                    sectionNumber={2}
                                    isOpen={openSections[2]}
                                    onToggle={() => toggleSection(2)}
                                >
                                    {/* Permanent Address Header (Now First) */}
                                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 shadow-sm mb-6">
                                        <div className="mb-4 pb-2 border-b border-gray-200">
                                            <h4 className="text-lg font-bold text-gray-800">Permanent Address</h4>
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
                                                required
                                                disabled={isFieldLocked('permDistrict')}
                                                error={errors.permDistrict}
                                            />
                                            {/* Area Type Selection */}
                                            <div className="col-span-1 md:col-span-3">
                                                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Area Type</label>
                                                <div className="flex items-center gap-6 mt-1">
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name="permAreaType"
                                                            value="Rural"
                                                            checked={formData.permAreaType === 'Rural'}
                                                            onChange={(e) => setFormData(prev => ({ ...prev, permAreaType: e.target.value, permMandal: '', permVillage: '', permMunicipality: '', permWardNumber: '' }))}
                                                            className="w-4 h-4 text-blue-600"
                                                            disabled={isFieldLocked('permAreaType')}
                                                        />
                                                        <span className="text-sm text-gray-700">Rural (Mandal/Village)</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name="permAreaType"
                                                            value="Urban"
                                                            checked={formData.permAreaType === 'Urban'}
                                                            onChange={(e) => setFormData(prev => ({ ...prev, permAreaType: e.target.value, permMandal: '', permVillage: '', permMunicipality: '', permWardNumber: '' }))}
                                                            className="w-4 h-4 text-blue-600"
                                                            disabled={isFieldLocked('permAreaType')}
                                                        />
                                                        <span className="text-sm text-gray-700">Urban (Municipality/Ward)</span>
                                                    </label>
                                                </div>
                                            </div>

                                            <FormSelect
                                                label="Constituency"
                                                name="permConstituency"
                                                value={formData.permConstituency}
                                                onChange={handlePermConstituencyChange}
                                                options={permConstituencies.map(c => ({ value: c._id, label: c.name }))}
                                                required
                                                disabled={!formData.permDistrict || isFieldLocked('permConstituency')}
                                                error={errors.permConstituency}
                                            />

                                            {formData.permAreaType === 'Urban' ? (
                                                <>
                                                    <FormSelect
                                                        label="Municipality"
                                                        name="permMunicipality"
                                                        value={formData.permMunicipality}
                                                        onChange={handlePermMunicipalityChange}
                                                        options={permMunicipalities.map(m => ({ value: m._id, label: m.name }))}
                                                        required
                                                        disabled={!formData.permConstituency || isFieldLocked('permMunicipality')}
                                                        error={errors.permMunicipality}
                                                    />
                                                    <FormSelect
                                                        label="Ward Number"
                                                        name="permWardNumber"
                                                        value={formData.permWardNumber}
                                                        onChange={handleChange}
                                                        options={permWards.map(w => ({ value: w.name, label: w.name }))} // Wards usually just names/numbers, storing IDs might be overkill if just for display, but let's store Name for now to match schema or ID? Schema says String. Let's store Name to be safe if ID not referenced elsewhere? Handlers stored ID. Let's store ID if consistent. 
                                                    // Actually handler Update: setFormData(prev => ({ ...prev, permWardNumber: '' })). Handler doesn't set it. handleChange sets it.
                                                    // handleChange uses value from event.
                                                    // If I use FormSelect, value is ID.
                                                    // If backend expects String (name) ??
                                                    // Location Schema has type String for enum.
                                                    // Member Schema address.wardNumber type String?
                                                    // Let's check Member Schema if possible. 
                                                    // Assuming safe to store ID or Name. 
                                                    // The locations have _id. The frontend handlers I wrote for others store ID.
                                                    // Let's store ID also for consistency, but if old members have strings?
                                                    // It's a new feature.
                                                    // BUT wait, handleChange logic:
                                                    // const { name, value } = e.target; setFormData...
                                                    // So it stores whatever value is in option.
                                                    // Let's use ID as value.
                                                    />
                                                    {/* Re-writing strictly */}
                                                    <FormSelect
                                                        label="Ward Number"
                                                        name="permWardNumber"
                                                        value={formData.permWardNumber}
                                                        onChange={handleChange}
                                                        options={permWards.map(w => ({ value: w._id, label: w.name }))}
                                                        placeholder="Select Ward"
                                                        required
                                                        disabled={!formData.permMunicipality || isFieldLocked('permWardNumber')}
                                                        error={errors.permWardNumber}
                                                    />
                                                </>
                                            ) : (
                                                <>
                                                    <FormSelect
                                                        label="Mandal"
                                                        name="permMandal"
                                                        value={formData.permMandal}
                                                        onChange={handlePermMandalChange}
                                                        options={permMandals.map(m => ({ value: m._id, label: m.name }))}
                                                        required
                                                        disabled={!formData.permConstituency || isFieldLocked('permMandal')}
                                                        error={errors.permMandal}
                                                    />
                                                    <FormSelect
                                                        label="Village/Town"
                                                        name="permVillage"
                                                        value={formData.permVillage}
                                                        onChange={handlePermVillageChange}
                                                        options={permVillages.map(v => ({ value: v._id, label: v.name }))}
                                                        required
                                                        disabled={!formData.permMandal || isFieldLocked('permVillage')}
                                                        error={errors.permVillage}
                                                    />
                                                </>
                                            )}

                                            <FormInput
                                                label="House No."
                                                name="permHouseNo"
                                                value={formData.permHouseNo}
                                                onChange={handleChange}
                                                placeholder="e.g. 1-123"
                                                required
                                                disabled={isFieldLocked('permHouseNo')}
                                                error={errors.permHouseNo}
                                            />
                                            <FormInput
                                                label="Street Name / Colony"
                                                name="permStreet"
                                                value={formData.permStreet}
                                                onChange={handleChange}
                                                placeholder="e.g. Main Road, Ambedkar Colony"
                                                disabled={isFieldLocked('permStreet')}
                                            />
                                            <FormInput
                                                label="Landmark"
                                                name="permLandmark"
                                                value={formData.permLandmark}
                                                onChange={handleChange}
                                                placeholder="e.g. Near Water Tank"
                                                disabled={isFieldLocked('permLandmark')}
                                            />

                                            <FormInput
                                                label="Pincode"
                                                name="permPincode"
                                                value={formData.permPincode}
                                                onChange={handleChange}
                                                placeholder="Enter pincode"
                                                required
                                                disabled={isFieldLocked('permPincode')}
                                                error={errors.permPincode}
                                            />
                                        </div>
                                    </div>

                                    {/* Present Address Info (Now Second) */}
                                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 shadow-sm">
                                        <div className="flex items-center justify-start gap-4 mb-4 pb-2 border-b border-gray-200">
                                            <h4 className="text-lg font-bold text-gray-800">Present Address</h4>
                                            <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-50 transition shadow-sm">
                                                <input
                                                    type="checkbox"
                                                    checked={sameAsPermanent}
                                                    onChange={handleSameAsPermanentChange}
                                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-400"
                                                />
                                                <span className="text-xs font-bold text-blue-800">SAME AS PERMANENT ADDRESS</span>
                                            </label>
                                        </div>
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
                                                required={!sameAsPermanent}
                                                disabled={sameAsPermanent}
                                                error={!sameAsPermanent ? errors.presentDistrict : null}
                                            />
                                            {/* Area Type Selection */}
                                            <div className="col-span-1 md:col-span-3">
                                                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Area Type</label>
                                                <div className="flex items-center gap-6 mt-1">
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name="presentAreaType"
                                                            value="Rural"
                                                            checked={formData.presentAreaType === 'Rural'}
                                                            onChange={(e) => !sameAsPermanent && setFormData(prev => ({ ...prev, presentAreaType: e.target.value, presentMandal: '', presentVillage: '', presentMunicipality: '', presentWardNumber: '' }))}
                                                            className="w-4 h-4 text-blue-600"
                                                            disabled={sameAsPermanent}
                                                        />
                                                        <span className="text-sm text-gray-700">Rural (Mandal/Village)</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name="presentAreaType"
                                                            value="Urban"
                                                            checked={formData.presentAreaType === 'Urban'}
                                                            onChange={(e) => !sameAsPermanent && setFormData(prev => ({ ...prev, presentAreaType: e.target.value, presentMandal: '', presentVillage: '', presentMunicipality: '', presentWardNumber: '' }))}
                                                            className="w-4 h-4 text-blue-600"
                                                            disabled={sameAsPermanent}
                                                        />
                                                        <span className="text-sm text-gray-700">Urban (Municipality/Ward)</span>
                                                    </label>
                                                </div>
                                            </div>

                                            <FormSelect
                                                label="Constituency"
                                                name="presentConstituency"
                                                value={formData.presentConstituency}
                                                onChange={handlePresentConstituencyChange}
                                                options={presentConstituencies.map(c => ({ value: c._id, label: c.name }))}
                                                required={!sameAsPermanent}
                                                disabled={sameAsPermanent || !formData.presentDistrict}
                                                error={!sameAsPermanent ? errors.presentConstituency : null}
                                            />

                                            {formData.presentAreaType === 'Urban' ? (
                                                <>
                                                    <FormSelect
                                                        label="Municipality"
                                                        name="presentMunicipality"
                                                        value={formData.presentMunicipality}
                                                        onChange={handlePresentMunicipalityChange}
                                                        options={municipalities.map(m => ({ value: m._id, label: m.name }))}
                                                        required={!sameAsPermanent}
                                                        disabled={sameAsPermanent || !formData.presentConstituency}
                                                        error={!sameAsPermanent ? errors.presentMunicipality : null}
                                                    />
                                                    <FormSelect
                                                        label="Ward Number"
                                                        name="presentWardNumber"
                                                        value={formData.presentWardNumber}
                                                        onChange={handleChange}
                                                        options={presentWards.map(w => ({ value: w._id, label: w.name }))}
                                                        placeholder="Select Ward"
                                                        required={!sameAsPermanent}
                                                        disabled={sameAsPermanent || !formData.presentMunicipality}
                                                        error={!sameAsPermanent ? errors.presentWardNumber : null}
                                                    />
                                                </>
                                            ) : (
                                                <>
                                                    <FormSelect
                                                        label="Mandal"
                                                        name="presentMandal"
                                                        value={formData.presentMandal}
                                                        onChange={handleMandalChange}
                                                        options={mandals.map(m => ({ value: m._id, label: m.name }))}
                                                        required={!sameAsPermanent}
                                                        disabled={sameAsPermanent || !formData.presentConstituency}
                                                        error={!sameAsPermanent ? errors.presentMandal : null}
                                                    />
                                                    <FormSelect
                                                        label="Village/Town"
                                                        name="presentVillage"
                                                        value={formData.presentVillage}
                                                        onChange={handleVillageChange}
                                                        options={villages.map(v => ({ value: v._id, label: v.name }))}
                                                        required={!sameAsPermanent}
                                                        disabled={sameAsPermanent || !formData.presentMandal}
                                                        error={!sameAsPermanent ? errors.presentVillage : null}
                                                    />
                                                </>
                                            )}

                                            <FormInput
                                                label="House No."
                                                name="presentHouseNo"
                                                value={formData.presentHouseNo}
                                                onChange={handleChange}
                                                placeholder="e.g. 1-123"
                                                required={!sameAsPermanent}
                                                disabled={sameAsPermanent}
                                                error={!sameAsPermanent ? errors.presentHouseNo : null}
                                            />
                                            <FormInput
                                                label="Street Name / Colony"
                                                name="presentStreet"
                                                value={formData.presentStreet}
                                                onChange={handleChange}
                                                placeholder="e.g. Main Road, Ambedkar Colony"
                                                disabled={sameAsPermanent}
                                            />
                                            <FormInput
                                                label="Landmark"
                                                name="presentLandmark"
                                                value={formData.presentLandmark}
                                                onChange={handleChange}
                                                placeholder="e.g. Near Water Tank"
                                                disabled={sameAsPermanent}
                                            />

                                            <FormInput
                                                label="Pincode"
                                                name="presentPincode"
                                                value={formData.presentPincode}
                                                onChange={handleChange}
                                                placeholder="Enter pincode"
                                                required={!sameAsPermanent}
                                                disabled={sameAsPermanent}
                                                error={!sameAsPermanent ? errors.presentPincode : null}
                                            />

                                            <div className="col-span-1 md:col-span-2">
                                                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Residence Type</label>
                                                <div className="flex items-center gap-6 mt-2">
                                                    <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="residenceType" value="Owned" onChange={handleChange} checked={formData.residenceType === 'Owned'} className="w-4 h-4 text-blue-600" /> <span className="text-sm text-gray-700">Owned</span></label>
                                                    <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="residenceType" value="Rented" onChange={handleChange} checked={formData.residenceType === 'Rented'} className="w-4 h-4 text-blue-600" /> <span className="text-sm text-gray-700">Rented</span></label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CollapsibleSection>




                                {/* Caste & Community */}
                                <CollapsibleSection
                                    title="Caste & Community Information"
                                    icon={FaUsers}
                                    sectionNumber={3}
                                    isOpen={openSections[4]} // Kept key 4 to minimise state refactor, or better rename state keys? 
                                    // Actually it's cleaner to keep the original state keys but just change the display number.
                                    onToggle={() => toggleSection(4)}
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormSelect label="Member's Caste" name="caste" value={formData.caste} onChange={handleChange} options={["MALA"]} required error={errors.caste} />
                                        <FormSelect label="Member's Sub-Caste" name="subCaste" value={formData.subCaste} onChange={handleChange} options={subCastes} placeholder="Select sub-caste" />

                                        <FormInput label="Community Certificate Number" name="communityCertNumber" value={formData.communityCertNumber} onChange={handleChange} onBlur={(e) => handleDuplicateCheck('communityCert', e.target.value)} placeholder="Enter certificate number" error={errors.communityCertNumber} />
                                        <FileUpload label="Community Certificate Upload" name="communityCert" onChange={handleFileChange} onRemove={handleRemoveFile} fileName={files.communityCert?.name} fileUrl={files.communityCert?.url} />
                                    </div>
                                </CollapsibleSection>

                                {/* Marriage Info - Conditional */}
                                <CollapsibleSection
                                    title="Marriage Information"
                                    icon={FaRing}
                                    sectionNumber={4}
                                    isOpen={openSections[5]}
                                    onToggle={() => toggleSection(5)}
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormSelect
                                            label="Marital Status"
                                            name="maritalStatus"
                                            value={formData.maritalStatus}
                                            onChange={handleChange}
                                            options={["Divorced", "Married", "Unmarried", "Widowed"]}
                                            required
                                            error={errors.maritalStatus}
                                        />

                                        {formData.maritalStatus === 'Married' && (
                                            <>
                                                <div className="col-span-1">
                                                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Inter-Caste Marriage</label>
                                                    <div className="flex items-center gap-6 mt-3">
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="isInterCaste"
                                                                value="Yes"
                                                                onChange={handleChange}
                                                                checked={formData.isInterCaste === 'Yes'}
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
                                                                        partnerCaste: '', // Clear caste
                                                                        partnerSubCaste: '' // Clear sub-caste
                                                                    }));
                                                                }}
                                                                checked={formData.isInterCaste === 'No'}
                                                                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                                            />
                                                            <span className="text-sm text-gray-700">No</span>
                                                        </label>
                                                    </div>
                                                </div>

                                                {formData.isInterCaste === 'Yes' && (
                                                    <>
                                                        <FormSelect
                                                            label="Partner's Caste"
                                                            name="partnerCaste"
                                                            value={formData.partnerCaste}
                                                            onChange={(e) => {
                                                                handleChange(e);
                                                                setFormData(prev => ({ ...prev, partnerSubCaste: '' })); // Reset sub-caste
                                                            }}
                                                            options={partnerCastes}
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
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </CollapsibleSection>





                                {/* Voter ID */}
                                {(!formData.age || parseInt(formData.age) >= 18) && (
                                    <CollapsibleSection
                                        title="Voter ID Details"
                                        icon={FaVoteYea}
                                        sectionNumber={5}
                                        isOpen={openSections[6]}
                                        onToggle={() => toggleSection(6)}
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <FormInput label="Voter ID Number (EPIC Number)" name="epicNumber" value={formData.epicNumber} onChange={handleChange} onBlur={(e) => { handleBlur && handleBlur(e); handleDuplicateCheck('voterId', e.target.value); }} placeholder="Enter EPIC number" />

                                            <FormInput label="Polling Booth Number" name="pollingBooth" value={formData.pollingBooth} onChange={handleChange} placeholder="Enter booth number" />
                                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <FileUpload label="Upload Voter ID Front" name="voterIdFront" onChange={handleFileChange} onRemove={handleRemoveFile} fileName={files.voterIdFront?.name} fileUrl={files.voterIdFront?.url} />
                                                <FileUpload label="Upload Voter ID Back" name="voterIdBack" onChange={handleFileChange} onRemove={handleRemoveFile} fileName={files.voterIdBack?.name} fileUrl={files.voterIdBack?.url} />
                                            </div>
                                        </div>
                                    </CollapsibleSection>
                                )}



                                {/* Document Uploads */}
                                <CollapsibleSection
                                    title="Document Uploads"
                                    icon={FaFileImage}
                                    sectionNumber={6}
                                    isOpen={openSections[7]}
                                    onToggle={() => toggleSection(7)}
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                        <div className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition cursor-pointer text-center relative group ${errors.photo ? 'border-red-500 bg-red-50' : (files.photo ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100')}`}>
                                            <div className="absolute right-2 top-2 z-20 flex gap-1">
                                                {files.photo?.url && (
                                                    <a
                                                        href={files.photo.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition"
                                                        onClick={(e) => e.stopPropagation()}
                                                        title="View Photo"
                                                    >
                                                        <FaEye size={14} />
                                                    </a>
                                                )}
                                                {files.photo && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRemoveFile('photo');
                                                        }}
                                                        className="flex items-center justify-center w-8 h-8 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition"
                                                        title="Remove Photo"
                                                    >
                                                        <FaEraser size={14} />
                                                    </button>
                                                )}
                                            </div>
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
                                            <input type="file" name="photo" onChange={handleFileChange} className="opacity-0 absolute inset-0 cursor-pointer z-10" />
                                        </div>
                                        <div className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition cursor-pointer text-center relative group ${errors.aadhaarFront ? 'border-red-500 bg-red-50' : (files.aadhaarFront ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100')}`}>
                                            <div className="absolute right-2 top-2 z-20 flex gap-1">
                                                {files.aadhaarFront?.url && (
                                                    <a
                                                        href={files.aadhaarFront.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition"
                                                        onClick={(e) => e.stopPropagation()}
                                                        title="View Document"
                                                    >
                                                        <FaEye size={14} />
                                                    </a>
                                                )}
                                                {files.aadhaarFront && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRemoveFile('aadhaarFront');
                                                        }}
                                                        className="flex items-center justify-center w-8 h-8 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition"
                                                        title="Remove Aadhaar Front"
                                                    >
                                                        <FaEraser size={14} />
                                                    </button>
                                                )}
                                            </div>
                                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                                                <FaIdCard className={errors.aadhaarFront ? 'text-red-500' : (files.aadhaarFront ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-500')} />
                                            </div>
                                            <h4 className="text-sm font-bold text-gray-700">
                                                {files.aadhaarFront ? files.aadhaarFront.name : <>Aadhar Card Front</>}
                                            </h4>
                                            <p className={`text-xs mt-1 ${errors.aadhaarFront ? 'text-red-500' : 'text-gray-400'}`}>
                                                {errors.aadhaarFront ? errors.aadhaarFront : (files.aadhaarFront ? 'Click to change' : 'Upload front side')}
                                            </p>
                                            <button type="button" className="mt-3 text-blue-600 text-xs font-bold hover:underline">Choose File</button>
                                            <input type="file" name="aadhaarFront" onChange={handleFileChange} className="opacity-0 absolute inset-0 cursor-pointer z-10" />
                                        </div>
                                        <div className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition cursor-pointer text-center relative group ${files.aadhaarBack ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}>
                                            <div className="absolute right-2 top-2 z-20 flex gap-1">
                                                {files.aadhaarBack?.url && (
                                                    <a
                                                        href={files.aadhaarBack.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition"
                                                        onClick={(e) => e.stopPropagation()}
                                                        title="View Document"
                                                    >
                                                        <FaEye size={14} />
                                                    </a>
                                                )}
                                                {files.aadhaarBack && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRemoveFile('aadhaarBack');
                                                        }}
                                                        className="flex items-center justify-center w-8 h-8 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition"
                                                        title="Remove Aadhaar Back"
                                                    >
                                                        <FaEraser size={14} />
                                                    </button>
                                                )}
                                            </div>
                                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                                                <FaIdCard className={files.aadhaarBack ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-500'} />
                                            </div>
                                            <h4 className="text-sm font-bold text-gray-700">{files.aadhaarBack ? files.aadhaarBack.name : "Aadhar Card Back"}</h4>
                                            <p className="text-xs text-gray-400 mt-1">{files.aadhaarBack ? 'Click to change' : 'Upload back side'}</p>
                                            <button type="button" className="mt-3 text-blue-600 text-xs font-bold hover:underline">Choose File</button>
                                            <input type="file" name="aadhaarBack" onChange={handleFileChange} className="opacity-0 absolute inset-0 cursor-pointer z-10" />
                                        </div>
                                        <div className="col-span-1 md:col-span-3 text-center">
                                            <p className="text-xs text-amber-600 font-bold bg-amber-50 inline-block px-3 py-1 rounded-full border border-amber-100">
                                                âš ï¸ Alert: Max file size for all uploads is 5 MB
                                            </p>
                                        </div>
                                    </div>
                                </CollapsibleSection>


                                {/* Family & Economic Information */}
                                <CollapsibleSection
                                    title="Family & Economic Information"
                                    icon={FaRupeeSign}
                                    sectionNumber={7}
                                    isOpen={openSections[8]}
                                    onToggle={() => toggleSection(8)}
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                        <FormSelect
                                            label="Annual Family Income"
                                            name="annualIncome"
                                            value={formData.annualIncome}
                                            onChange={handleChange}
                                            options={[
                                                { label: "< 8 lacks", value: "Less than 8 Lakhs" },
                                                { label: "> 8 lacks", value: "More than 8 Lakhs" }
                                            ]}
                                        />
                                        <FormInput label="Number of Family Members" name="memberCount" value={formData.memberCount} onChange={handleChange} placeholder="Enter number" type="number" required error={errors.memberCount} />
                                    </div>

                                    {/* Add Family Member Button */}
                                    <div className="flex justify-start mb-8">
                                        <button
                                            type="button"
                                            onClick={openAddFamilyModal}
                                            className="flex items-center gap-2 cursor-pointer bg-blue-100 px-4 py-2 rounded-lg border border-blue-300 hover:bg-blue-200 transition shadow-sm"
                                        >
                                            <FaPlus className="text-blue-700" />
                                            <span className="text-sm font-extrabold text-blue-900">Add a Family Member</span>
                                        </button>
                                    </div>

                                    {/* List of Added Family Members (Cards) */}
                                    {familyMembers.length > 0 && (
                                        <div className="mb-8">
                                            <h4 className="text-sm font-bold text-gray-700 mb-3 ml-1">Added Family Members ({familyMembers.length})</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {familyMembers.map((fm, idx) => (
                                                    <div key={fm.tempId} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition relative group">
                                                        <div className="p-4 flex gap-4">
                                                            {/* Photo Thumbnail */}
                                                            <div className="w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0 border border-gray-200 overflow-hidden flex items-center justify-center">
                                                                {fm.files?.photo ? (
                                                                    <img
                                                                        src={URL.createObjectURL(fm.files.photo)}
                                                                        alt={fm.name}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (fm.photo && typeof fm.photo === 'string' ? (
                                                                    <img
                                                                        src={(() => {
                                                                            const photo = fm.photo;
                                                                            const baseUrl = BASE_URL;
                                                                            if (photo.startsWith('http')) {
                                                                                return `${baseUrl}/api/proxy-image?url=${encodeURIComponent(photo)}`;
                                                                            }
                                                                            return `${baseUrl}/${photo.replace(/\\/g, '/')}`;
                                                                        })()}
                                                                        alt={fm.name}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <FaUsers className="text-gray-300 text-2xl" />
                                                                ))}
                                                            </div>

                                                            {/* Details */}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex justify-between items-start">
                                                                    <div>
                                                                        <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-0.5">{fm.relation}</p>
                                                                        <h4 className="font-bold text-gray-900 truncate">{fm.surname} {fm.name}</h4>
                                                                    </div>
                                                                    <div className="flex gap-2">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleEditFamilyMember(idx)}
                                                                            className="text-gray-400 hover:text-blue-600 transition p-1"
                                                                            title="Edit Member"
                                                                        >
                                                                            <FaEdit size={14} />
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setFamilyMembers(prev => prev.filter((_, i) => i !== idx))}
                                                                            className="text-gray-400 hover:text-red-500 transition p-1"
                                                                            title="Remove Member"
                                                                        >
                                                                            <FaSignOutAlt className="transform rotate-0" size={14} />
                                                                        </button>
                                                                    </div>
                                                                </div>

                                                                <div className="mt-2 space-y-0.5">
                                                                    <p className="text-xs text-gray-600 flex items-center gap-2">
                                                                        <span className="opacity-70">Age/Gender:</span>
                                                                        <span className="font-semibold">{fm.age} Yrs / {fm.gender}</span>
                                                                    </p>
                                                                    <p className="text-xs text-gray-600 flex items-center gap-2">
                                                                        <span className="opacity-70">Occupation:</span>
                                                                        <span className="font-semibold">{fm.occupation}</span>
                                                                    </p>
                                                                    {fm.occupation === 'Student' && fm.educationLevel && (
                                                                        <p className="text-xs text-gray-600 flex items-center gap-2">
                                                                            <span className="opacity-70">Education:</span>
                                                                            <span className="font-semibold">{fm.educationLevel}</span>
                                                                        </p>
                                                                    )}
                                                                    {fm.aadhaarNumber && (
                                                                        <p className="text-xs text-gray-600 flex items-center gap-2">
                                                                            <span className="opacity-70">Aadhaar:</span>
                                                                            <span className="font-family-mono">{fm.aadhaarNumber}</span>
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Status Footer */}
                                                        <div className="bg-gray-50 px-4 py-2 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                                            <span className="flex items-center gap-1 text-green-600">
                                                                <FaCheckSquare size={10} /> Ready to Submit
                                                            </span>
                                                            <span>{Object.keys(fm.files || {}).length} Documents</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CollapsibleSection>

                                {/* Ration Card */}
                                <CollapsibleSection
                                    title="Ration Card Details"
                                    icon={FaIdCard}
                                    sectionNumber={8}
                                    isOpen={openSections[9]}
                                    onToggle={() => toggleSection(9)}
                                >
                                    <div className="flex items-center gap-4 mb-6">
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
                                            <FormInput label="Ration Card Number" name="rationCardNumber" value={formData.rationCardNumber} onChange={handleChange} onBlur={(e) => { handleBlur && handleBlur(e); handleDuplicateCheck('rationCard', e.target.value); }} placeholder="Enter ration card number" />
                                            <FormInput label="Ration Card Holder Name" name="rationCardHolderName" value={formData.rationCardHolderName} onChange={handleChange} placeholder="Enter card holder name" />
                                            <FormSelect label="Ration Card Type" name="rationCardTypeFamily" value={formData.rationCardTypeFamily} onChange={handleChange} options={["Annapurna Scheme", "Antyodaya Anna Yojana", "Food Security Card"]} />
                                            <div className="md:col-span-2">
                                                <FileUpload label="Upload Ration Card" name="rationCardFile" onChange={handleFileChange} onRemove={handleRemoveFile} fileName={files.rationCardFile?.name} fileUrl={files.rationCardFile?.url} />
                                                <p className="text-[10px] text-gray-500 mt-1">Max file size: 5 MB</p>
                                            </div>
                                        </div>
                                    )}
                                </CollapsibleSection>

                                {/* Legal Consent Checkbox */}
                                {/* Legal Consent Checkbox */}
                                {!isEditMode && !isViewMode && (
                                    <div className="mt-8 mb-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                                        <label className="flex items-start gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="legalConsent"
                                                checked={formData.legalConsent}
                                                onChange={(e) => setFormData(prev => ({ ...prev, legalConsent: e.target.checked }))}
                                                className="mt-1 w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                            />
                                            <div className="text-sm text-gray-700 leading-relaxed">
                                                <span className="font-bold text-gray-800">Declaration:</span> I hereby declare that the details furnished above are true and correct to the best of my knowledge and belief. I undertake to inform you of any changes therein, immediately. In case any of the above information is found to be false or untrue or misleading or misrepresenting, I am aware that I may be held liable for it. I agree to the <Link to="/terms-and-conditions" target="_blank" className="text-blue-600 font-bold hover:underline">Terms & Conditions</Link>.
                                            </div>
                                        </label>
                                        {errors.legalConsent && (
                                            <p className="text-red-500 text-xs mt-2 font-bold ml-8">{errors.legalConsent}</p>
                                        )}
                                    </div>
                                )}


                                {/* Actions */
                                }
                                {/* Actions */}
                                {!isViewMode && (
                                    <div className="flex items-center gap-4 pt-6 border-t border-gray-100 mt-8">
                                        <button type="button" onClick={handleReset} className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition shadow-sm flex items-center gap-2">
                                            <FaEraser /> Clear Form
                                        </button>
                                        <button type="button" onClick={handleBack} className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition shadow-sm">
                                            Cancel
                                        </button>
                                        <div className="flex-1"></div>

                                        <button type="submit" disabled={loading} className={`px-8 py-3 bg-[#1e2a4a] text-white font-bold rounded-xl hover:bg-[#2a3b66] transition shadow-md flex items-center gap-2 ${loading ? 'opacity-70 cursor-wait' : ''}`}>
                                            {loading ? 'Processing...' : (isEditMode ? 'Update Member' : 'Preview & Submit')} <FaChevronRight className="ml-1" />
                                        </button>
                                    </div>
                                )}

                                {isViewMode && (
                                    <div className="flex justify-start pt-6 border-t border-gray-100 mt-8">
                                        {/* This section will be replaced by the document view above, or hidden if we render document view outside the form */}
                                    </div>
                                )}{/* End Actions */
                                }
                            </fieldset>
                        </form>
                    </div>
                </main>}


                {/* Document View Logic for IsViewMode */}
                {isViewMode && (
                    <div className="flex-1 overflow-y-auto bg-slate-50 pb-12">
                        <div className="max-w-4xl mx-auto pt-8 px-4">
                            <div className="flex justify-between items-center mb-6 no-print">
                                <button onClick={handleBack} className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 flex items-center gap-2 shadow-sm transition">
                                    <FaArrowLeft /> Back
                                </button>
                                <div className="flex gap-3">
                                    <button onClick={handleDownloadApplication} className="px-5 py-2.5 bg-blue-100 text-blue-700 font-bold rounded-xl hover:bg-blue-200 flex items-center gap-2 shadow-sm transition">
                                        <FaDownload /> Download
                                    </button>
                                    <button onClick={() => navigate(`/admin/members/edit/${id}`)} className="px-5 py-2.5 bg-[#1e2a4a] text-white font-bold rounded-xl hover:bg-[#2a3b66] flex items-center gap-2 shadow-md transition">
                                        <FaEdit /> Edit Profile
                                    </button>
                                </div>
                            </div>
                            <div className="bg-white shadow-xl rounded-xl overflow-hidden p-0 print:shadow-none">
                                {/* Pass createdMemberData (if fresh) OR construct data from formData if loading existing member */}
                                {/* Pass createdMemberData (if fresh) OR construct data from formData if loading existing member */}
                                {/* Pass createdMemberData (if fresh) OR construct data from formData if loading existing member */}
                                {/* Pass createdMemberData (if fresh) OR construct data from formData if loading existing member */}
                                <MemberDocument
                                    data={{
                                        ...createdMemberData,
                                        // Fallbacks for critical fields
                                        name: createdMemberData?.name || formData.name,
                                        surname: createdMemberData?.surname || formData.surname,
                                        fatherName: createdMemberData?.fatherName || formData.fatherName,
                                        mobileNumber: createdMemberData?.mobileNumber || formData.mobileNumber,
                                        dob: createdMemberData?.dob || formData.dob,
                                        gender: createdMemberData?.gender || formData.gender,
                                        occupation: createdMemberData?.occupation || formData.occupation,
                                        bloodGroup: createdMemberData?.bloodGroup || formData.bloodGroup,
                                        maritalStatus: createdMemberData?.maritalStatus || formData.maritalStatus,

                                        // Ensure local photo preview if backend URL is missing but file is selected
                                        photoUrl: createdMemberData?.photoUrl || (files.photo instanceof File ? URL.createObjectURL(files.photo) : (files.photo ? files.photo.url : null)),

                                        // Fallbacks for nested objects if missing
                                        address: createdMemberData?.address || {
                                            houseNumber: formData.presentHouseNo,
                                            street: formData.presentStreet,
                                            village: formData.presentVillage,
                                            mandal: formData.presentMandal,
                                            district: formData.presentDistrict,
                                            constituency: formData.presentConstituency,
                                            pinCode: formData.presentPincode,
                                            residencyType: formData.residencyType
                                        },
                                        permanentAddress: createdMemberData?.permanentAddress || {
                                            houseNumber: formData.permHouseNo,
                                            street: formData.permStreet,
                                            village: formData.permVillage,
                                            mandal: formData.permMandal,
                                            district: formData.permDistrict,
                                            constituency: formData.permConstituency,
                                            pinCode: formData.permPincode,
                                            landmark: formData.permLandmark
                                        },
                                        casteDetails: createdMemberData?.casteDetails || {
                                            caste: formData.caste,
                                            subCaste: formData.subCaste,
                                            communityCertNumber: formData.communityCertNumber
                                        },
                                        familyDetails: createdMemberData?.familyDetails || {
                                            annualIncome: formData.annualIncome,
                                            rationCardType: formData.rationCardTypeFamily
                                        },
                                        familyMembers: createdMemberData?.familyMembers || familyMembers, // Pass family members for preview
                                        rationCard: createdMemberData?.rationCard || {
                                            number: formData.rationCardNumber
                                        },
                                        voterId: createdMemberData?.voterId || {
                                            epicNumber: formData.epicNumber
                                        }
                                    }}
                                    lookups={{
                                        districts: districts,
                                        mandals: allMandals,
                                        villages: villages,
                                        constituencies: presentConstituencies,
                                        permMandals: allPermMandals,
                                        permVillages: permVillages
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}
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
                                            constituency: formData.presentConstituency || '',
                                            pincode: formData.presentPincode || '',
                                            houseNo: formData.presentHouseNo || '',
                                            street: formData.presentStreet || '',
                                            landmark: formData.presentLandmark || ''
                                        };
                                        console.log("Navigating to ID Card with Data:", createdMemberData);
                                        navigate('/admin/members/generate-id', {
                                            state: {
                                                newMember: {
                                                    ...createdMemberData,
                                                    id: createdMemberData._id || createdMemberData.id, // Ensure ID is passed explicitly
                                                    _id: createdMemberData._id || createdMemberData.id, // Ensure ID is passed explicitly
                                                    name: createdMemberData?.name || formData.name,
                                                    surname: createdMemberData?.surname || formData.surname,
                                                    mobileNumber: createdMemberData?.mobileNumber || formData.mobileNumber,
                                                    fatherName: createdMemberData?.fatherName || formData.fatherName,
                                                    dob: createdMemberData?.dob || formData.dob,
                                                    bloodGroup: createdMemberData?.bloodGroup || formData.bloodGroup,
                                                    photoUrl: createdMemberData?.photoUrl || (files.photo instanceof File ? URL.createObjectURL(files.photo) : (files.photo ? files.photo.url : null)),
                                                    address: createdMemberData?.address || {
                                                        houseNumber: formData.presentHouseNo,
                                                        street: formData.presentStreet,
                                                        village: formData.presentVillage,
                                                        mandal: formData.presentMandal,
                                                        district: formData.presentDistrict,
                                                        pinCode: formData.presentPincode
                                                    }
                                                },
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

            {/* Portal-based Print Section for Robust Pagination - Only render if NOT in view mode (to avoid duplication) */}
            {
                createdMemberData && (
                    <PrintPortal>
                        <div id="application-form-print" className="hidden print:block">
                            <MemberDocument
                                data={{
                                    ...createdMemberData,
                                    // Fallbacks for critical fields
                                    name: createdMemberData?.name || formData.name,
                                    surname: createdMemberData?.surname || formData.surname,
                                    fatherName: createdMemberData?.fatherName || formData.fatherName,
                                    mobileNumber: createdMemberData?.mobileNumber || formData.mobileNumber,
                                    dob: createdMemberData?.dob || formData.dob,
                                    gender: createdMemberData?.gender || formData.gender,
                                    occupation: createdMemberData?.occupation || formData.occupation,
                                    bloodGroup: createdMemberData?.bloodGroup || formData.bloodGroup,
                                    maritalStatus: createdMemberData?.maritalStatus || formData.maritalStatus,

                                    // Ensure local photo preview if backend URL is missing but file is selected
                                    photoUrl: createdMemberData?.photoUrl || (files.photo instanceof File ? URL.createObjectURL(files.photo) : (files.photo ? files.photo.url : null)),

                                    // Fallbacks for nested objects
                                    address: createdMemberData?.address || {
                                        houseNumber: formData.presentHouseNo,
                                        street: formData.presentStreet,
                                        village: formData.presentVillage,
                                        mandal: formData.presentMandal,
                                        district: formData.presentDistrict,
                                        pinCode: formData.presentPincode,
                                        residencyType: formData.residencyType
                                    },
                                    permanentAddress: createdMemberData?.permanentAddress || {
                                        houseNumber: formData.permHouseNo,
                                        street: formData.permStreet,
                                        village: formData.permVillage,
                                        mandal: formData.permMandal,
                                        district: formData.permDistrict,
                                        pinCode: formData.permPincode,
                                        landmark: formData.permLandmark
                                    },
                                    casteDetails: createdMemberData?.casteDetails || {
                                        caste: formData.caste,
                                        subCaste: formData.subCaste,
                                        communityCertNumber: formData.communityCertNumber
                                    },
                                    familyDetails: createdMemberData?.familyDetails || {
                                        annualIncome: formData.annualIncome,
                                        rationCardType: formData.rationCardTypeFamily
                                    },
                                    familyMembers: createdMemberData?.familyMembers || familyMembers, // Pass family members for preview
                                    rationCard: createdMemberData?.rationCard || {
                                        number: formData.rationCardNumber
                                    },
                                    voterId: createdMemberData?.voterId || {
                                        epicNumber: formData.epicNumber
                                    }
                                }}
                                lookups={{
                                    districts: districts,
                                    mandals: allMandals,
                                    villages: villages,
                                    constituencies: presentConstituencies, // Use present list as fallback/merged or pass perm
                                    permMandals: allPermMandals,
                                    permVillages: permVillages,
                                    permConstituencies: permConstituencies
                                }}
                            />
                        </div>
                    </PrintPortal>
                )
            }


            {/* Family Member Modal */}
            {
                showFamilyModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
                                <h2 className="text-xl font-bold text-gray-800">{editingMemberIndex !== null ? 'Update' : 'Add'} Family Member Details</h2>
                                <button onClick={() => setShowFamilyModal(false)} className="text-gray-500 hover:text-red-500 text-2xl font-bold">&times;</button>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Basic Info */}
                                <div className="md:col-span-2"><h3 className="font-bold text-blue-600 border-b pb-1 mb-2">Basic Information</h3></div>
                                <FormSelect
                                    label="Relation"
                                    name="relation"
                                    value={familyMemberForm.relation}
                                    onChange={handleFamilyChange}
                                    options={formData.maritalStatus === 'Unmarried'
                                        ? ["Brother", "Father", "Mother", "Sister"]
                                        : ["Daughter", "Son", "Spouse"]
                                    }
                                    required
                                />
                                <FormSelect
                                    label="Marital Status"
                                    name="maritalStatus"
                                    value={familyMemberForm.maritalStatus}
                                    onChange={handleFamilyChange}
                                    options={["Divorced", "Married", "Unmarried", "Widowed"]}
                                    required
                                />
                                <FormInput label="Surname" name="surname" value={familyMemberForm.surname} onChange={handleFamilyChange} placeholder="Surname" required />
                                <FormInput label="Name" name="name" value={familyMemberForm.name} onChange={handleFamilyChange} placeholder="Name" required />
                                <FormInput label="S/o, W/o, D/o" name="fatherName" value={familyMemberForm.fatherName} onChange={handleFamilyChange} placeholder="Enter S/o, W/o, D/o Name" required />
                                <FormInput label="Date of Birth (DD-MM-YYYY)" name="dob" value={familyMemberForm.dob} onChange={(e) => handleDateChange(e, setFamilyMemberForm, 'dob')} placeholder="DD-MM-YYYY" maxLength={10} required />
                                <FormInput label="Age" name="age" value={familyMemberForm.age} onChange={handleFamilyChange} placeholder="Age" type="number" />
                                <FormSelect label="Gender" name="gender" value={familyMemberForm.gender} onChange={handleFamilyChange} options={["Female", "Male", "Other"]} required />
                                {(parseInt(familyMemberForm.age) >= 5 || !familyMemberForm.age) && (
                                    <>
                                        <FormSelect label="Occupation" name="occupation" value={familyMemberForm.occupation} onChange={handleFamilyChange} options={memberOccupations} required />

                                        {familyMemberForm.occupation === 'Private Employee' && (
                                            <>
                                                <FormSelect
                                                    label="Job Sector"
                                                    name="jobSector"
                                                    value={familyMemberForm.jobSector}
                                                    onChange={handleFamilyChange}
                                                    options={[
                                                        "Banking / Finance", "Education", "Healthcare", "IT / Software",
                                                        "Manufacturing", "Other", "Retail", "Services"
                                                    ]}
                                                    required
                                                />
                                                <FormInput
                                                    label="Organization / Company"
                                                    name="jobOrganization"
                                                    value={familyMemberForm.jobOrganization}
                                                    onChange={handleFamilyChange}
                                                    placeholder="Enter company name"
                                                    required
                                                />
                                                <FormInput
                                                    label="Designation"
                                                    name="jobDesignation"
                                                    value={familyMemberForm.jobDesignation}
                                                    onChange={handleFamilyChange}
                                                    placeholder="Enter designation"
                                                    required
                                                />
                                            </>
                                        )}

                                        {familyMemberForm.occupation === 'Government Employee' && (
                                            <>
                                                <FormSelect
                                                    label="Job Category"
                                                    name="jobCategory"
                                                    value={familyMemberForm.jobCategory}
                                                    onChange={handleFamilyChange}
                                                    options={Object.keys(GOVT_JOB_CATEGORIES)}
                                                />
                                                <FormSelect
                                                    label="Job Sub-Category"
                                                    name="jobSubCategory"
                                                    value={familyMemberForm.jobSubCategory}
                                                    onChange={handleFamilyChange}
                                                    options={familyMemberForm.jobCategory ? GOVT_JOB_CATEGORIES[familyMemberForm.jobCategory] : []}
                                                    disabled={!familyMemberForm.jobCategory}
                                                />
                                                <FormSelect
                                                    label="Department / Organization"
                                                    name="jobOrganization"
                                                    value={familyMemberForm.jobOrganization}
                                                    onChange={handleFamilyChange}
                                                    options={GOVT_DEPARTMENTS}
                                                    required
                                                />
                                                <FormInput
                                                    label="Designation"
                                                    name="jobDesignation"
                                                    value={familyMemberForm.jobDesignation}
                                                    onChange={handleFamilyChange}
                                                    placeholder="Enter designation"
                                                    required
                                                />
                                            </>
                                        )}

                                        {(familyMemberForm.occupation === 'Retired Govt. Employee' || familyMemberForm.occupation === 'Retired Private Employee') && (
                                            <FormInput
                                                label="Designation"
                                                name="jobDesignation"
                                                value={familyMemberForm.jobDesignation}
                                                onChange={handleFamilyChange}
                                                placeholder="Enter designation"
                                                required
                                            />
                                        )}

                                        {familyMemberForm.occupation === 'Other' && (
                                            <FormInput
                                                label="Specify Details"
                                                name="jobDesignation"
                                                value={familyMemberForm.jobDesignation}
                                                onChange={handleFamilyChange}
                                                placeholder="Enter occupation details"
                                                required
                                            />
                                        )}

                                        {familyMemberForm.occupation === 'Student' && (
                                            <FormSelect
                                                label="Education Level"
                                                name="educationLevel"
                                                value={familyMemberForm.educationLevel}
                                                onChange={handleFamilyChange}
                                                options={["Degree", "Engineering & Technology", "High School", "Intermediate", "PG", "Polytechnic / Diploma", "Primary School", "Research / Doctoral Studies (PhD)", "Vocational / ITI"]}
                                                required
                                            />
                                        )}
                                    </>
                                )}

                                <FormInput label="Mobile Number" name="mobileNumber" value={familyMemberForm.mobileNumber} onChange={handleFamilyChange} placeholder="Mobile" required />
                                <FormInput label="Aadhaar Number" name="aadhaarNumber" value={familyMemberForm.aadhaarNumber} onChange={handleFamilyChange} placeholder="Aadhaar" required />

                                {/* Voter ID - Only if 18 or older */}
                                {(!familyMemberForm.age || parseInt(familyMemberForm.age) >= 18) && (
                                    <>
                                        <div className="md:col-span-2 mt-4"><h3 className="font-bold text-blue-600 border-b pb-1 mb-2">Voter ID Details</h3></div>
                                        <FormInput label="EPIC Number" name="epicNumber" value={familyMemberForm.epicNumber} onChange={handleFamilyChange} placeholder="EPIC No" />

                                        <FormInput label="Polling Booth" name="pollingBooth" value={familyMemberForm.pollingBooth} onChange={handleFamilyChange} placeholder="Booth No" />
                                    </>
                                )}

                                {/* Documents */}
                                <div className="md:col-span-2 mt-4"><h3 className="font-bold text-blue-600 border-b pb-1 mb-2">Document Uploads</h3></div>
                                <FileUpload label="Member Photo" name="photo" onChange={handleFamilyFileChange} onRemove={handleRemoveFamilyFile} fileName={familyMemberFiles.photo?.name} required />
                                <FileUpload label="Aadhaar Front" name="aadhaarFront" onChange={handleFamilyFileChange} onRemove={handleRemoveFamilyFile} fileName={familyMemberFiles.aadhaarFront?.name} />
                                <FileUpload label="Aadhaar Back" name="aadhaarBack" onChange={handleFamilyFileChange} onRemove={handleRemoveFamilyFile} fileName={familyMemberFiles.aadhaarBack?.name} />

                                {(!familyMemberForm.age || parseInt(familyMemberForm.age) >= 18) && (
                                    <>
                                        <FileUpload label="Voter ID Front" name="voterIdFront" onChange={handleFamilyFileChange} onRemove={handleRemoveFamilyFile} fileName={familyMemberFiles.voterIdFront?.name} />
                                        <FileUpload label="Voter ID Back" name="voterIdBack" onChange={handleFamilyFileChange} onRemove={handleRemoveFamilyFile} fileName={familyMemberFiles.voterIdBack?.name} />
                                    </>
                                )}

                                <div className="md:col-span-2 bg-blue-50 p-3 rounded text-sm text-blue-800">
                                    <p><strong>Note:</strong> Addresses for this family member will be automatically set to the same as the main applicant's Present and Permanent addresses.</p>
                                </div>
                            </div>
                            <div className="p-6 border-t border-gray-200 flex justify-end gap-4">
                                <button onClick={() => setShowFamilyModal(false)} className="px-6 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                                <button onClick={saveFamilyMember} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">{editingMemberIndex !== null ? 'Update Member' : 'Add Member'}</button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

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

export default MemberRegistration;
