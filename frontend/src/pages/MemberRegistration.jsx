import React, { useState, useEffect } from 'react';
import API from '../api';
import axios from 'axios'; // Direct import for file upload to bypass interceptor issues
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import DashboardHeader from '../components/common/DashboardHeader';
import {
    FaArrowLeft, FaShieldAlt, FaSave, FaEraser, FaUpload,
    FaCalendarAlt, FaIdCard, FaMapMarkerAlt, FaUsers, FaRing,
    FaRupeeSign, FaVoteYea, FaUniversity, FaFileImage, FaChevronRight,
    FaHome, FaCheckSquare,
    // Admin Layout Icons
    FaThLarge, FaBuilding, FaExclamationTriangle, FaFileAlt,
    FaHandHoldingUsd, FaChartLine, FaCog, FaQuestionCircle, FaBullhorn,
    FaSignOutAlt, FaSearch, FaBell, FaChevronDown, FaChevronUp, FaDownload, FaPlus, FaEdit
} from 'react-icons/fa';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { getPincode } from '../utils/pincodeData';
import { districtConstituencies, allConstituencies, constituencyMandals } from '../utils/constituencyData';
import subCastes from '../utils/subCastes.json';
import partnerCastes from '../utils/partnerCastes.json';
import casteSubCastes from '../utils/casteSubCastes.json';



// Collapsible Form Section Header
const CollapsibleSection = ({ title, icon: Icon, sectionNumber, isOpen, onToggle, children }) => (
    <div className="mb-6 border border-gray-100 rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md bg-white">
        <div
            onClick={onToggle}
            className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${isOpen ? 'bg-blue-50 border-b border-blue-100' : 'bg-white hover:bg-gray-50'}`}
        >
            <div className="flex items-center gap-4">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold shadow-sm transition-colors ${isOpen ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {sectionNumber}
                </div>
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
    const { id } = useParams();
    const location = useLocation();
    const isEditMode = location.pathname.includes('/edit/');
    const isViewMode = Boolean(id) && !isEditMode;

    // Form State
    const [formData, setFormData] = useState({
        surname: '',
        name: '',
        fatherName: '',
        dob: '',
        age: '',

        occupation: '', // New Field
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
        presentConstituency: '', // New Field
        presentMandal: '',
        presentVillage: '',
        presentHouseNo: '',
        presentStreet: '',
        presentLandmark: '',
        presentPincode: '',
        residenceType: '',

        // Permanent Address
        permDistrict: '',
        permConstituency: '', // New Field
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
        maritalStatus: 'Unmarried',

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
    const [sameAsPresent, setSameAsPresent] = useState(false);
    const [errors, setErrors] = useState({});

    // Family Member State
    const [showFamilyModal, setShowFamilyModal] = useState(false);
    const [familyMembers, setFamilyMembers] = useState([]);
    const [familyMemberForm, setFamilyMemberForm] = useState({
        relation: '', surname: '', name: '', dob: '', age: '', occupation: '', educationLevel: '', gender: '', mobileNumber: '', aadhaarNumber: '',
        epicNumber: '', voterName: '', pollingBooth: ''
    });
    const [familyMemberFiles, setFamilyMemberFiles] = useState({});

    const handleFamilyChange = (e) => {
        const { name, value } = e.target;
        if (name === 'aadhaarNumber') {
            // Remove non-digits
            const raw = value.replace(/\D/g, '');
            // Limit to 12 digits
            if (raw.length > 12) return;
            // Format: 0000 0000 0000
            const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
            setFamilyMemberForm(prev => ({ ...prev, [name]: formatted }));
            return;
        }
        setFamilyMemberForm(prev => ({ ...prev, [name]: value }));
    };

    const handleFamilyFileChange = (e) => {
        const { name, files } = e.target;
        if (files[0]) {
            setFamilyMemberFiles(prev => ({ ...prev, [name]: files[0] }));
        }
    };

    const saveFamilyMember = () => {
        // Basic Validation
        if (!familyMemberForm.name || !familyMemberForm.surname || !familyMemberForm.relation) {
            alert("Name, Surname, and Relation are required"); return;
        }

        // Spouse Check
        if (familyMemberForm.relation === 'Spouse') {
            const hasSpouse = familyMembers.some(m => m.relation === 'Spouse');
            if (hasSpouse) {
                alert("You can only add one Spouse.");
                return;
            }
        }

        setFamilyMembers(prev => [...prev, { ...familyMemberForm, tempId: Date.now(), files: familyMemberFiles }]);
        setShowFamilyModal(false);
        setFamilyMemberForm({
            relation: '', surname: '', name: '', dob: '', age: '', occupation: '', gender: '', mobileNumber: '', aadhaarNumber: '',
            epicNumber: '', voterName: '', pollingBooth: ''
        });
        setFamilyMemberFiles({});
    };

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
            setSameAsPresent(false);
            // Clear errors
            setErrors({});
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
    const GOVT_JOB_CATEGORIES = {
        "Administrative & Civil Services": [
            "IAS / All India Services", "TSPSC Group I", "TSPSC Group II", "TSPSC Group III",
            "Secretariat Services", "Revenue Services"
        ],
        "Police, Home & Public Safety": [
            "Police Department", "Traffic Police", "Special Police Units", "Fire Services",
            "Prisons Department", "Home Guards"
        ],
        "Education & Teaching Services": [
            "School Education (Primary / Secondary)", "Junior Colleges", "Degree Colleges",
            "Universities", "Technical Education"
        ],
        "Medical & Health Services": [
            "Doctors", "Nursing Staff", "Paramedical Staff", "Public Health Administration", "AYUSH Doctors"
        ],
        "Engineering & Technical Services": [
            "Civil Engineering", "Electrical Engineering", "Mechanical Engineering",
            "Electronics & IT", "Public Works Department (PWD)"
        ],
        "Revenue, Finance & Accounts": [
            "Revenue Department", "Commercial Taxes", "Treasury & Accounts", "Audit & Accounts", "Excise Department"
        ],
        "Local Government & Panchayat Raj": [
            "Municipal Administration", "Panchayat Raj Department", "Urban Development Authorities", "Rural Development Department"
        ],
        "Transport & Infrastructure": [
            "Road Transport Department", "State Transport Corporation", "Ports & Airports", "Urban Transport Services"
        ],
        "Welfare & Social Development": [
            "Social Welfare Department", "Tribal Welfare Department", "Minority Welfare Department",
            "Women & Child Welfare", "Backward Classes Welfare"
        ],
        "Judiciary & Legal Services": [
            "Judicial Officers", "Public Prosecutors", "Court Administration Staff", "Legal Services Authorities"
        ],
        "Agriculture & Allied Departments": [
            "Agriculture Department", "Horticulture", "Animal Husbandry", "Fisheries", "Sericulture"
        ],
        "Forest, Environment & Disaster Management": [
            "Forest Department", "Wildlife Department", "Environment Protection", "Disaster Management Authority"
        ],
        "Public Sector Undertakings (PSUs)": [
            "State PSUs", "Central PSUs", "Power & Energy Corporations", "Water Boards", "Housing Boards"
        ],
        "Defence & Paramilitary": [
            "Indian Army", "Indian Navy", "Indian Air Force", "Central Armed Police Forces"
        ],
        "Clerical & Support Services": [
            "Junior Assistant", "Senior Assistant", "Office Superintendent", "Attender / Office Subordinate", "Data Entry Operator"
        ]
    };

    // Occupation Handling
    const memberOccupations = [
        "Student", "Farmer", "Business", "Private Employee",
        "Government Employee", "Labourer", "House Wife", "Unemployed", "Retired", "Other"
    ];

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

    // Raw Data (All Mandals in District)
    const [allMandals, setAllMandals] = useState([]);
    const [allPermMandals, setAllPermMandals] = useState([]);

    // Filtered Display Lists
    const [mandals, setMandals] = useState([]);
    const [villages, setVillages] = useState([]);

    const [permMandals, setPermMandals] = useState([]);
    const [permVillages, setPermVillages] = useState([]);

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
    const handlePresentConstituencyChange = (e) => {
        const constituencyName = e.target.value;
        console.log(`[UI] Present Constituency Selected: ${constituencyName}`);

        setFormData(prev => ({
            ...prev,
            presentConstituency: constituencyName,
            // Reset dependent fields
            presentMandal: '',
            presentMandalName: '',
            presentVillage: '',
            presentVillageName: ''
        }));

        // Filter Mandals based on selection
        if (allMandals.length > 0) {
            const filtered = filterMandalsByConstituency(allMandals, constituencyName);
            setMandals(filtered);
            console.log(`[Logic] Filtered Present Mandals: ${filtered.length} (from ${allMandals.length})`);
        }
        setVillages([]);
    };

    const handlePermConstituencyChange = (e) => {
        const constituencyName = e.target.value;
        console.log(`[UI] Perm Constituency Selected: ${constituencyName}`);

        setFormData(prev => ({
            ...prev,
            permConstituency: constituencyName,
            // Reset dependent fields
            permMandal: '',
            permMandalName: '',
            permVillage: '',
            permVillageName: ''
        }));

        // Filter Mandals based on selection
        if (allPermMandals.length > 0) {
            const filtered = filterMandalsByConstituency(allPermMandals, constituencyName);
            setPermMandals(filtered);
            console.log(`[Logic] Filtered Perm Mandals: ${filtered.length} (from ${allPermMandals.length})`);
        }
        setPermVillages([]);
    };

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

    // Fetch Member Details for Edit Mode
    useEffect(() => {
        if (isEditMode) {
            const fetchMember = async () => {
                try {
                    const { data } = await API.get(`/members/${id}`);
                    console.log("Fetched Member Data:", data);

                    // Helper to safely get nested value or empty string
                    const getVal = (val) => val || '';
                    const getAddr = (field) => data.address?.[field] || '';
                    const getCaste = (field) => data.casteDetails?.[field] || '';
                    const getFamily = (field) => data.familyDetails?.[field] || '';

                    // --- Populate Form Data ---
                    setFormData(prev => ({
                        ...prev,
                        surname: getVal(data.surname),
                        name: getVal(data.name),
                        fatherName: getVal(data.fatherName),
                        dob: data.dob ? data.dob.split('T')[0] : '',
                        age: getVal(data.age),
                        gender: getVal(data.gender),
                        mobileNumber: getVal(data.mobileNumber),
                        alternateMobile: getVal(data.alternateMobile),
                        email: getVal(data.email),
                        bloodGroup: getVal(data.bloodGroup),
                        aadhaarNumber: getVal(data.aadhaarNumber),
                        occupation: getVal(data.occupation),
                        maritalStatus: getVal(data.maritalStatus),
                        educationLevel: getVal(data.educationLevel),

                        // Job (if any)
                        jobSector: getVal(data.jobSector),
                        jobOrganization: getVal(data.jobOrganization),
                        jobDesignation: getVal(data.jobDesignation),

                        // Address - Present
                        presentHouseNo: getAddr('houseNumber'),
                        presentStreet: getAddr('street'),
                        presentLandmark: getAddr('landmark'),
                        presentPincode: data.address?.pinCode || data.address?.pincode || '',
                        presentDistrict: data.address?.district?._id || data.address?.district || '',
                        presentMandal: data.address?.mandal?._id || data.address?.mandal || '',
                        presentVillage: data.address?.village?._id || data.address?.village || '',
                        // Note: Constituency might need specific handling if not directly in address object but inferred
                        presentConstituency: data.address?.constituency || '',

                        // Address - Permanent
                        permHouseNo: data.permanentAddress?.houseNumber || '',
                        permStreet: data.permanentAddress?.street || '',
                        permLandmark: data.permanentAddress?.landmark || '',
                        permPincode: data.permanentAddress?.pinCode || data.permanentAddress?.pincode || '',
                        permDistrict: data.permanentAddress?.district?._id || data.permanentAddress?.district || '',
                        permMandal: data.permanentAddress?.mandal?._id || data.permanentAddress?.mandal || '',
                        permVillage: data.permanentAddress?.village?._id || data.permanentAddress?.village || '',
                        permConstituency: data.permanentAddress?.constituency || '',

                        // Caste
                        caste: getCaste('caste'),
                        subCaste: getCaste('subCaste'),
                        communityCertNumber: getCaste('communityCertNumber'),

                        // Partner
                        partnerCaste: data.partnerDetails?.caste || '',
                        partnerSubCaste: data.partnerDetails?.subCaste || '',
                        isInterCaste: data.partnerDetails?.isInterCaste ? 'Yes' : 'No',
                        partnerName: data.partnerDetails?.name || '',
                        partnerMarriageCert: data.partnerDetails?.marriageCertNumber || '',

                        // Family & Economic
                        annualIncome: getFamily('annualIncome'),
                        memberCount: getFamily('memberCount'),
                        dependentCount: getFamily('dependentCount'),
                        rationCardTypeFamily: getFamily('rationCardType'),
                        hasRationCard: !!data.rationCard?.number,
                        fatherOccupation: getFamily('fatherOccupation'),
                        motherOccupation: getFamily('motherOccupation'),

                        // Ration Card
                        rationCardNumber: data.rationCard?.number || '',
                        rationCardHolderName: data.rationCard?.holderName || '',

                        // Voter ID
                        epicNumber: data.voterId?.epicNumber || '',
                        voterName: data.voterId?.nameOnCard || '',
                        pollingBooth: data.voterId?.pollingBooth || '',

                        // Bank
                        bankName: data.bankDetails?.bankName || '',
                        branchName: data.bankDetails?.branchName || '',
                        accountNo: data.bankDetails?.accountNumber || '',
                        ifsc: data.bankDetails?.ifscCode || '',
                        bankHolder: data.bankDetails?.holderName || ''
                    }));

                    // Load Family Members
                    if (data.familyMembers && Array.isArray(data.familyMembers)) {
                        setFamilyMembers(data.familyMembers.map(fm => ({
                            ...fm,
                            tempId: fm._id || Date.now(), // Use DB ID or temp
                            mobileNumber: fm.mobile || '',
                            epicNumber: fm.voterId || ''
                        })));
                    }

                    // Trigger cascades for locations (This is tricky async, might just set IDs and let user re-select if needed)
                    // Or implement a robust "fetch locations for selected district/mandal" here.
                    // For now, setting IDs. The dropdowns will be empty until corresponding district is "re-selected" or initial data loaded.
                    // Ideally we fetch Mandals for the set valid District.
                    // Trigger cascades for locations
                    // 1. Fetch Mandals and Constituencies for the District
                    if (data.address?.district?._id || data.address?.district) {
                        const dId = data.address?.district?._id || data.address?.district;

                        // Fetch Mandals
                        const { data: mandalsData } = await API.get(`/locations?parent=${dId}`);
                        setAllMandals(mandalsData);
                        setMandals(mandalsData);

                        // Fetch Constituencies (If district has mapped constituencies, use that logic. 
                        // For now we assume we might need to fetch them or filter if hardcoded. 
                        // Existing logic uses 'presentConstituencies' state which depends on district.
                        // We need to set 'presentConstituencies' state here if it's dynamic.
                        // If it's static mapping, we trigger the mapping update.)
                        const districtName = districts.find(d => d._id === dId)?.name || '';

                        // 2. Fetch Villages for the Mandal
                        if (data.address?.mandal?._id || data.address?.mandal) {
                            const mId = data.address?.mandal?._id || data.address?.mandal;
                            const { data: villagesData } = await API.get(`/locations?parent=${mId}`);
                            setVillages(villagesData);
                        }
                    }

                    // Permanent Address Logic (Similar if we used separate dropdowns for permanent)
                    if (!sameAsPresent && (data.permanentAddress?.district?._id || data.permanentAddress?.district)) {
                        const pdId = data.permanentAddress?.district?._id || data.permanentAddress?.district;
                        const { data: permMandalsData } = await API.get(`/locations?parent=${pdId}`);
                        setPermMandals(permMandalsData);

                        if (data.permanentAddress?.mandal?._id || data.permanentAddress?.mandal) {
                            const pmId = data.permanentAddress?.mandal?._id || data.permanentAddress?.mandal;
                            const { data: permVillagesData } = await API.get(`/locations?parent=${pmId}`);
                            setPermVillages(permVillagesData);
                        }
                    }

                } catch (error) {
                    console.error("Failed to fetch member details", error);
                    alert("Failed to load member details.");
                }
            };
            fetchMember();
        }
    }, [id, isEditMode]);

    // Handle Present Address District Change
    const handleDistrictChange = async (e) => {
        const districtId = e.target.value;
        const districtName = districts.find(d => d._id === districtId)?.name || '';
        console.log(`[UI] District Selected: ${districtId} (${districtName})`);

        // Filter Constituencies
        const relevantConstituencies = getConstituenciesForDistrict(districtName);
        setPresentConstituencies(relevantConstituencies);

        // Store ID AND Name directly in formData
        setFormData(prev => ({
            ...prev,
            presentDistrict: districtId,
            presentDistrictName: districtName,
            presentConstituency: '',
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
                setAllMandals(data);
                setMandals(data);
            } catch (error) {
                console.error("[API] Error fetching mandals", error);
            }
        }
    };

    // Handle Present Address Mandal Change
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

        let code = village?.pincode || '';

        // Fallback if DB has no pincode
        if (!code && village && formData.permDistrict && formData.permMandal) {
            const dist = (districts && districts.length > 0) ? districts.find(d => d._id === formData.permDistrict) : null;

            let mand = null;
            if (sameAsPresent) {
                mand = (mandals && mandals.length > 0) ? mandals.find(m => m._id === formData.permMandal) : null;
            } else {
                mand = (permMandals && permMandals.length > 0) ? permMandals.find(m => m._id === formData.permMandal) : null;
            }

            if (dist && mand) {
                code = getPincode(dist.name, mand.name, village.name, formData.permConstituency);
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
        const districtName = (districts && districts.length > 0) ? (districts.find(d => d._id === districtId)?.name || '') : '';

        // Filter Constituencies
        const relevantConstituencies = getConstituenciesForDistrict(districtName);
        setPermConstituencies(relevantConstituencies);

        setFormData(prev => ({ ...prev, permDistrict: districtId, permConstituency: '', permMandal: '', permVillage: '' }));
        setPermMandals([]);
        setPermVillages([]);

        if (districtId) {
            try {
                const { data } = await API.get(`/locations?parent=${districtId}`);
                setAllPermMandals(data);
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
            // Remove non-digits
            const raw = value.replace(/\D/g, '');
            // Limit to 12 digits
            if (raw.length > 12) return;

            // Format: 0000 0000 0000
            const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ').trim();

            setFormData(prev => ({ ...prev, [name]: formatted }));
            return;
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
                permConstituency: prev.presentConstituency,
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
        // if (!formData.dob) newErrors.dob = "Date of Birth is required";
        if (!formData.gender) newErrors.gender = "Gender is required";
        if (!formData.mobileNumber) newErrors.mobileNumber = "Mobile number is required";
        else if (formData.mobileNumber.length !== 10) newErrors.mobileNumber = "Mobile number must be 10 digits";
        if (!formData.aadhaarNumber) newErrors.aadhaarNumber = "Aadhaar number is required";
        else if (formData.aadhaarNumber.replace(/\s/g, '').length !== 12) newErrors.aadhaarNumber = "Aadhaar number must be 12 digits";

        if (!formData.occupation) newErrors.occupation = "Occupation is required";
        if (formData.occupation === 'Private Employee') {
            if (!formData.jobSector) newErrors.jobSector = "Job Sector is required";
            if (!formData.jobOrganization) newErrors.jobOrganization = "Organization is required";
            if (!formData.jobDesignation) newErrors.jobDesignation = "Designation is required";
        }

        // Present Address
        if (!formData.presentDistrict) newErrors.presentDistrict = "District is required";
        if (!formData.presentConstituency) newErrors.presentConstituency = "Constituency is required";
        if (!formData.presentMandal) newErrors.presentMandal = "Mandal is required";
        if (!formData.presentVillage) newErrors.presentVillage = "Village is required";
        if (!formData.presentHouseNo) newErrors.presentHouseNo = "House No is required";
        if (!formData.presentPincode) newErrors.presentPincode = "Pincode is required";

        // Permanent Address (if not same)
        if (!sameAsPresent) {
            if (!formData.permDistrict) newErrors.permDistrict = "District is required";
            if (!formData.permConstituency) newErrors.permConstituency = "Constituency is required";
            if (!formData.permMandal) newErrors.permMandal = "Mandal is required";
            if (!formData.permVillage) newErrors.permVillage = "Village is required";
            if (!formData.permHouseNo) newErrors.permHouseNo = "House No is required";
            if (!formData.permPincode) newErrors.permPincode = "Pincode is required";
        }

        // Other Details
        if (!formData.caste) newErrors.caste = "Caste is required";
        if (!formData.maritalStatus) newErrors.maritalStatus = "Marital status is required";

        // Files
        if (!isEditMode && !files.photo) newErrors.photo = "Member Photo is required";
        // if (!files.aadhaarFront) newErrors.aadhaarFront = "Aadhaar Card Front is required";

        // Legal Consent
        if (!isEditMode && !formData.legalConsent) {
            newErrors.legalConsent = "You must agree to the terms and conditions";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // State for Preview Modal
    const [showPreview, setShowPreview] = useState(false);

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

            // Get token for authorization
            const adminInfo = JSON.parse(localStorage.getItem('adminInfo'));
            const token = adminInfo?.token;

            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token} `
                }
            };

            if (isEditMode) {
                const { data } = await axios.put(`${import.meta.env.VITE_API_URL || '/api'}/members/${id}`, dataPayload, config);
                setCreatedMemberData(data);
                alert("Member details updated successfully!");
                navigate('/admin/members');
                return;
            } else {
                const { data } = await axios.post(`${import.meta.env.VITE_API_URL || '/api'}/members`, dataPayload, config);
                // Show Success Modal instead of immediate navigate
                setCreatedMemberData(data);
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
                const adminInfo = JSON.parse(localStorage.getItem('adminInfo'));
                const token = adminInfo?.token;

                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                };

                const { data } = await axios.get(`${import.meta.env.VITE_API_URL || '/api'}/members/${id}`, config);

                // Flatten and Map Data to Form State
                const mappedData = {
                    ...formData, // Keep defaults
                    surname: data.surname,
                    name: data.name,
                    fatherName: data.fatherName,
                    dob: new Date(data.dob).toISOString().split('T')[0],
                    age: data.age,
                    gender: data.gender,
                    bloodGroup: data.bloodGroup,
                    mobileNumber: data.mobileNumber,
                    alternateMobile: data.alternateMobile,
                    email: data.email,
                    occupation: data.occupation,
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
                    presentVillage: data.address?.village?._id || data.address?.village || '',
                    presentHouseNo: data.address?.houseNumber || '',
                    presentStreet: data.address?.street || '',
                    presentLandmark: data.address?.landmark || '',
                    presentPincode: data.address?.pinCode || '',
                    residenceType: data.address?.residencyType || '',

                    // Permanent Address Mapping
                    permDistrict: data.permanentAddress?.district?._id || data.permanentAddress?.district || '',
                    permConstituency: data.permanentAddress?.constituency || '',
                    permMandal: data.permanentAddress?.mandal?._id || data.permanentAddress?.mandal || '',
                    permVillage: data.permanentAddress?.village?._id || data.permanentAddress?.village || '',
                    permHouseNo: data.permanentAddress?.houseNumber || '',
                    permStreet: data.permanentAddress?.street || '',
                    permLandmark: data.permanentAddress?.landmark || '',
                    permPincode: data.permanentAddress?.pinCode || '',

                    // Caste Details
                    caste: data.casteDetails?.caste || '',
                    subCaste: data.casteDetails?.subCaste || '',
                    communityCertNumber: data.casteDetails?.communityCertNumber || '',

                    // Marriage Details
                    maritalStatus: data.maritalStatus || '',
                    partnerName: data.partnerDetails?.name || '',
                    partnerCaste: data.partnerDetails?.caste || '',
                    partnerSubCaste: data.partnerDetails?.subCaste || '',
                    isInterCaste: data.partnerDetails?.isInterCaste || false,
                    marriageDate: data.partnerDetails?.marriageDate ? new Date(data.partnerDetails.marriageDate).toISOString().split('T')[0] : '',
                    marriageCertNumber: data.partnerDetails?.marriageCertNumber || '',

                    // Family & Economic
                    fatherOccupation: data.familyDetails?.fatherOccupation || '',
                    motherOccupation: data.familyDetails?.motherOccupation || '',
                    annualIncome: data.familyDetails?.annualIncome || '',
                    memberCount: data.familyDetails?.memberCount || '',
                    dependentCount: data.familyDetails?.dependentCount || '',
                    rationCardTypeFamily: data.familyDetails?.rationCardType || '',

                    // Other IDs
                    hasRationCard: !!data.rationCard?.number,
                    rationCardNumber: data.rationCard?.number || '',
                    rationCardHolderName: data.rationCard?.holderName || '',
                    epicNumber: data.voterId?.epicNumber || '',
                    voterName: data.voterId?.nameOnCard || '',
                    pollingBooth: data.voterId?.pollingBooth || '',

                    // Bank Details
                    bankName: data.bankDetails?.bankName || '',
                    branchName: data.bankDetails?.branchName || '',
                    accountNumber: data.bankDetails?.accountNumber || '',
                    ifscCode: data.bankDetails?.ifscCode || '',

                    mewsId: data.mewsId
                };

                setFormData(mappedData);

                // Populate files state with existing document URLs (for display/preview)
                const initialFiles = {};
                if (data.documents) {
                    data.documents.forEach(doc => {
                        // Assuming doc.type corresponds to the file state key (e.g., 'photo', 'aadhaarFront')
                        // And doc.url is the URL to the existing file
                        initialFiles[doc.type] = { name: doc.url.split('/').pop(), url: doc.url, existing: true };
                    });
                }
                setFiles(initialFiles);

                // Populate family members
                if (data.familyMembers && Array.isArray(data.familyMembers)) {
                    const loadedFamilyMembers = data.familyMembers.map((fm, index) => ({
                        ...fm,
                        tempId: fm._id || `existing-${index}`, // Use existing _id or generate tempId
                        files: {} // Files for family members are handled separately during submission
                    }));
                    setFamilyMembers(loadedFamilyMembers);
                }

                // Set sameAsPresent checkbox if addresses are identical
                const presentAddressFields = ['presentDistrict', 'presentConstituency', 'presentMandal', 'presentVillage', 'presentHouseNo', 'presentStreet', 'presentLandmark', 'presentPincode'];
                const permAddressFields = ['permDistrict', 'permConstituency', 'permMandal', 'permVillage', 'permHouseNo', 'permStreet', 'permLandmark', 'permPincode'];
                const addressesMatch = presentAddressFields.every((field, index) => mappedData[field] === mappedData[permAddressFields[index]]);
                setSameAsPresent(addressesMatch);

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

    const confirmSubmit = () => {
        handleFinalSubmit();
    };

    // Initial Submission - Check Validation then decide
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            alert("Please check the form for errors. Required fields are missing or invalid.");
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        if (isEditMode) {
            handleFinalSubmit();
            return;
        }

        setShowPreview(true);
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
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
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
                                    <p><span className="font-bold text-gray-600">Occupation:</span> {formData.occupation}</p>
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
                                    <p><span className="font-bold text-gray-600">Constituency:</span> {formData.presentConstituency}</p>
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
                                        <p><span className="font-bold text-gray-600">Constituency:</span> {formData.permConstituency}</p>
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
                <AdminSidebar activePage="members" />

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto">
                    {/* Dashboard Header */}
                    <DashboardHeader
                        title={isEditMode ? 'Edit Member Profile' : isViewMode ? 'Member Details' : 'New Member Registration'}
                        subtitle={isViewMode ? 'View full member profile and details' : (isEditMode ? 'Update existing member details' : 'Enter details to register a new member')}
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
                                            // required
                                            error={errors.dob}
                                        />
                                        <FormInput
                                            label="Age"
                                            value={formData.age}
                                            placeholder="Auto-calculated"
                                            disabled={true}
                                        />

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
                                                        "IT / Software", "Education", "Healthcare", "Manufacturing",
                                                        "Banking / Finance", "Retail", "Services", "Other"
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
                                                    onChange={handleJobCategoryChange}
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
                                                    required
                                                    disabled={!formData.jobCategory}
                                                    error={errors.jobSubCategory}
                                                />
                                                <FormInput
                                                    label="Department / Organization"
                                                    name="jobOrganization"
                                                    value={formData.jobOrganization}
                                                    onChange={handleChange}
                                                    placeholder="Enter department name"
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

                                        {formData.occupation === 'Student' && (
                                            <FormSelect
                                                label="Education Level"
                                                name="educationLevel"
                                                value={formData.educationLevel}
                                                onChange={handleChange}
                                                options={["School", "Intermediate", "Degree", "PG"]}
                                                required
                                            />
                                        )}

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
                                </CollapsibleSection>

                                {/* Present Address Info */}
                                <CollapsibleSection
                                    title="Address Information"
                                    icon={FaMapMarkerAlt}
                                    sectionNumber={2}
                                    isOpen={openSections[2]}
                                    onToggle={() => toggleSection(2)}
                                >
                                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 shadow-sm mb-6">
                                        <div className="mb-4 pb-2 border-b border-gray-200">
                                            <h4 className="text-lg font-bold text-gray-800">Present Address</h4>
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
                                                required
                                                error={errors.presentDistrict}
                                            />
                                            <FormSelect
                                                label="Constituency"
                                                name="presentConstituency"
                                                value={formData.presentConstituency}
                                                onChange={handlePresentConstituencyChange}
                                                options={presentConstituencies}
                                                required
                                                disabled={!formData.presentDistrict}
                                                error={errors.presentConstituency}
                                            />
                                            <FormSelect
                                                label="Mandal"
                                                name="presentMandal"
                                                value={formData.presentMandal}
                                                onChange={handleMandalChange}
                                                options={mandals.map(m => ({ value: m._id, label: m.name }))}
                                                required
                                                disabled={!formData.presentConstituency}
                                                error={errors.presentMandal}
                                            />
                                            <FormSelect
                                                label="Village/Town"
                                                name="presentVillage"
                                                value={formData.presentVillage}
                                                onChange={handleVillageChange}
                                                options={villages.map(v => ({ value: v._id, label: v.name }))}
                                                required
                                                disabled={!formData.presentMandal}
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
                                                    <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="residenceType" value="Owned" onChange={handleChange} checked={formData.residenceType === 'Owned'} className="w-4 h-4 text-blue-600" /> <span className="text-sm text-gray-700">Owned</span></label>
                                                    <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="residenceType" value="Rented" onChange={handleChange} checked={formData.residenceType === 'Rented'} className="w-4 h-4 text-blue-600" /> <span className="text-sm text-gray-700">Rented</span></label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Permanent Address Header inside same section */}
                                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 shadow-sm">
                                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
                                            <h4 className="text-lg font-bold text-gray-800">Permanent Address</h4>
                                            <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-50 transition shadow-sm">
                                                <input
                                                    type="checkbox"
                                                    checked={sameAsPresent}
                                                    onChange={handleSameAsPresentChange}
                                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-400"
                                                />
                                                <span className="text-xs font-bold text-blue-800">SAME AS PRESENT</span>
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
                                                label="Constituency"
                                                name="permConstituency"
                                                value={formData.permConstituency}
                                                onChange={handlePermConstituencyChange}
                                                options={permConstituencies}
                                                disabled={sameAsPresent || !formData.permDistrict}
                                                required={!sameAsPresent}
                                                error={!sameAsPresent ? errors.permConstituency : null}
                                            />
                                            <FormSelect
                                                label="Mandal"
                                                name="permMandal"
                                                value={formData.permMandal}
                                                onChange={handlePermMandalChange}
                                                options={sameAsPresent
                                                    ? mandals.map(m => ({ value: m._id, label: m.name }))
                                                    : permMandals.map(m => ({ value: m._id, label: m.name }))}
                                                disabled={sameAsPresent || !formData.permConstituency}
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
                                                disabled={sameAsPresent || !formData.permMandal}
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
                                                required={!sameAsPresent}
                                                error={!sameAsPresent ? errors.permPincode : null}
                                            />
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

                                        <FormInput label="Community Certificate Number" name="communityCertNumber" value={formData.communityCertNumber} onChange={handleChange} placeholder="Enter certificate number" />
                                        <FileUpload label="Community Certificate Upload" name="communityCert" onChange={handleFileChange} fileName={files.communityCert?.name} />
                                    </div>
                                </CollapsibleSection>

                                {/* Marriage Info - Conditional */}
                                <CollapsibleSection
                                    title="Marriage & Partner Information"
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
                                            options={["Unmarried", "Married", "Divorced", "Widowed"]}
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
                                <CollapsibleSection
                                    title="Voter ID Details"
                                    icon={FaVoteYea}
                                    sectionNumber={5}
                                    isOpen={openSections[6]}
                                    onToggle={() => toggleSection(6)}
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormInput label="Voter ID Number (EPIC Number)" name="epicNumber" value={formData.epicNumber} onChange={handleChange} placeholder="Enter EPIC number" />
                                        <FormInput label="Voter Name as per Card" name="voterName" value={formData.voterName} onChange={handleChange} placeholder="Enter name as per voter ID" />
                                        <FormInput label="Polling Booth Number" name="pollingBooth" value={formData.pollingBooth} onChange={handleChange} placeholder="Enter booth number" />
                                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <FileUpload label="Upload Voter ID Front" name="voterIdFront" onChange={handleFileChange} fileName={files.voterIdFront?.name} />
                                            <FileUpload label="Upload Voter ID Back" name="voterIdBack" onChange={handleFileChange} fileName={files.voterIdBack?.name} />
                                        </div>
                                    </div>
                                </CollapsibleSection>



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
                                        <div className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition cursor-pointer text-center relative group ${errors.aadhaarFront ? 'border-red-500 bg-red-50' : (files.aadhaarFront ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100')}`}>
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
                                            onClick={() => setShowFamilyModal(true)}
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
                                                                ) : (
                                                                    <FaUsers className="text-gray-300 text-2xl" />
                                                                )}
                                                            </div>

                                                            {/* Details */}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex justify-between items-start">
                                                                    <div>
                                                                        <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-0.5">{fm.relation}</p>
                                                                        <h4 className="font-bold text-gray-900 truncate">{fm.surname} {fm.name}</h4>
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setFamilyMembers(prev => prev.filter((_, i) => i !== idx))}
                                                                        className="text-gray-400 hover:text-red-500 transition p-1"
                                                                        title="Remove Member"
                                                                    >
                                                                        <FaSignOutAlt className="transform rotate-0" size={14} /> {/* Using SignOut icon as generic close/remove or just Times */}
                                                                    </button>
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
                                            <FormInput label="Ration Card Number" name="rationCardNumber" value={formData.rationCardNumber} onChange={handleChange} placeholder="Enter ration card number" />
                                            <FormInput label="Ration Card Holder Name" name="rationCardHolderName" value={formData.rationCardHolderName} onChange={handleChange} placeholder="Enter card holder name" />
                                            <FormSelect label="Ration Card Type" name="rationCardTypeFamily" value={formData.rationCardTypeFamily} onChange={handleChange} options={["Food Security Card", "Antyodaya Anna Yojana", "Annapurna Scheme"]} />
                                            <div className="md:col-span-2">
                                                <FileUpload label="Upload Ration Card" name="rationCardFile" onChange={handleFileChange} fileName={files.rationCardFile?.name} />
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
                                                <span className="font-bold text-gray-800">Declaration:</span> I hereby declare that the details furnished above are true and correct to the best of my knowledge and belief. I undertake to inform you of any changes therein, immediately. In case any of the above information is found to be false or untrue or misleading or misrepresenting, I am aware that I may be held liable for it. I agree to the <span className="text-blue-600 font-bold">Terms & Conditions</span>.
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
                                        <button type="button" onClick={() => navigate(-1)} className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition shadow-sm">
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
                                        <button type="button" onClick={() => navigate(-1)} className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition shadow-sm flex items-center gap-2">
                                            <FaArrowLeft /> Back to List
                                        </button>
                                    </div>
                                )}

                            </fieldset>
                        </form>
                    </div>
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
                                            constituency: formData.presentConstituency || '',
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
                    <div id="application-form-print" className="fixed top-0 left-0 bg-white w-[210mm] min-h-[297mm] p-8 hidden text-black">
                        {/* Header */}
                        <div className="border-b-2 border-gray-800 pb-2 mb-4 flex justify-between items-center">
                            <div>
                                <h1 className="text-xl font-bold uppercase tracking-wide">Mala Educational Welfare Society</h1>
                                <p className="text-sm text-gray-600 font-bold">Membership Registration Application</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold text-gray-500">Date: {new Date().toLocaleDateString()}</p>
                                <p className="text-xs font-bold text-gray-500">App ID: {createdMemberData.mewsId}</p>
                            </div>
                        </div>

                        {/* Basic Info & Photo Row */}
                        <div className="flex gap-4 mb-4">
                            <div className="w-28 h-32 border border-gray-300 flex items-center justify-center bg-gray-50 shrink-0">
                                {createdMemberData.photoUrl ? (
                                    <img
                                        src={createdMemberData.photoUrl.startsWith('http') ? createdMemberData.photoUrl : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/${createdMemberData.photoUrl.replace(/\\/g, '/')}`}
                                        alt="Member"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-[10px] text-gray-400">Photo</span>
                                )}
                            </div>
                            <div className="flex-1 space-y-1">
                                <h3 className="text-xs font-bold uppercase bg-gray-100 p-1 mb-1 border border-gray-200">Basic Information</h3>
                                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                                    <p><span className="font-bold w-24 inline-block">Surname:</span> {createdMemberData.surname}</p>
                                    <p><span className="font-bold w-24 inline-block">Name:</span> {createdMemberData.name}</p>
                                    <p><span className="font-bold w-24 inline-block">Father Name:</span> {createdMemberData.fatherName}</p>
                                    <p><span className="font-bold w-24 inline-block">DOB (Age):</span> {new Date(createdMemberData.dob).toLocaleDateString()} ({createdMemberData.age})</p>
                                    <p><span className="font-bold w-24 inline-block">Occupation:</span> {createdMemberData.occupation || 'N/A'}</p>
                                    <p><span className="font-bold w-24 inline-block">Gender:</span> {createdMemberData.gender}</p>
                                    <p><span className="font-bold w-24 inline-block">Blood Group:</span> {createdMemberData.bloodGroup}</p>
                                    <p><span className="font-bold w-24 inline-block">Mobile:</span> {createdMemberData.mobileNumber}</p>
                                    <p><span className="font-bold w-24 inline-block">Alt Mobile:</span> {createdMemberData.alternateMobile || 'N/A'}</p>
                                    <p><span className="font-bold w-24 inline-block">Email:</span> {createdMemberData.email || 'N/A'}</p>
                                    <p><span className="font-bold w-24 inline-block">Aadhar:</span> {createdMemberData.aadhaarNumber}</p>
                                </div>
                            </div>
                        </div>

                        {/* Addresses */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <h3 className="text-xs font-bold uppercase bg-gray-100 p-1 mb-1 border border-gray-200">Present Address</h3>
                                <div className="text-xs space-y-1 px-1">
                                    <p>{createdMemberData.address.houseNumber}, {createdMemberData.address.street}</p>
                                    <p>{createdMemberData.address.landmark ? `Near ${createdMemberData.address.landmark}, ` : ''}</p>
                                    <p>{createdMemberData.address.village?.name || createdMemberData.address.village}, {createdMemberData.address.mandal?.name || createdMemberData.address.mandal} ({createdMemberData.address.constituency})</p>
                                    <p>{createdMemberData.address.district?.name || createdMemberData.address.district} - {createdMemberData.address.pinCode}</p>
                                    <p><span className="font-bold">Residence:</span> {createdMemberData.address.residencyType || 'N/A'}</p>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xs font-bold uppercase bg-gray-100 p-1 mb-1 border border-gray-200">Permanent Address</h3>
                                <div className="text-xs space-y-1 px-1">
                                    <p>{createdMemberData.permanentAddress.houseNumber}, {createdMemberData.permanentAddress.street}</p>
                                    <p>{createdMemberData.permanentAddress.landmark ? `Near ${createdMemberData.permanentAddress.landmark}, ` : ''}</p>
                                    <p>{createdMemberData.permanentAddress.village?.name || createdMemberData.permanentAddress.village}, {createdMemberData.permanentAddress.mandal?.name || createdMemberData.permanentAddress.mandal} ({createdMemberData.permanentAddress.constituency})</p>
                                    <p>{createdMemberData.permanentAddress.district?.name || createdMemberData.permanentAddress.district} - {createdMemberData.permanentAddress.pinCode}</p>
                                </div>
                            </div>
                        </div>

                        {/* Social & Family */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <h3 className="text-xs font-bold uppercase bg-gray-100 p-1 mb-1 border border-gray-200">Caste & Marriage</h3>
                                <div className="text-xs space-y-1 px-1">
                                    <p><span className="font-bold">Caste:</span> {createdMemberData.casteDetails.caste} - {createdMemberData.casteDetails.subCaste}</p>
                                    <p><span className="font-bold">Cert No:</span> {createdMemberData.casteDetails.communityCertNumber || 'N/A'}</p>
                                    <p><span className="font-bold">Marital Status:</span> {createdMemberData.maritalStatus}</p>
                                    {createdMemberData.maritalStatus === 'Married' && (
                                        <>
                                            <p><span className="font-bold">Partner Caste:</span> {createdMemberData.partnerDetails.caste}</p>
                                            <p><span className="font-bold">Inter-Caste:</span> {createdMemberData.partnerDetails.isInterCaste ? 'Yes' : 'No'}</p>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xs font-bold uppercase bg-gray-100 p-1 mb-1 border border-gray-200">Family & Economic</h3>
                                <div className="text-xs space-y-1 px-1">
                                    <p><span className="font-bold">Father Occ:</span> {createdMemberData.familyDetails.fatherOccupation || 'N/A'}</p>
                                    <p><span className="font-bold">Mother Occ:</span> {createdMemberData.familyDetails.motherOccupation || 'N/A'}</p>
                                    <p><span className="font-bold">Annual Income:</span> ₹{createdMemberData.familyDetails.annualIncome}</p>
                                    <p><span className="font-bold">Members:</span> {createdMemberData.familyDetails.memberCount}</p>
                                    <p><span className="font-bold">Ration Card Type:</span> {createdMemberData.familyDetails.rationCardType || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Family Members List */}
                        {createdMemberData.familyMembers && createdMemberData.familyMembers.length > 0 && (
                            <div className="mb-4">
                                <h3 className="text-xs font-bold uppercase bg-gray-100 p-1 mb-1 border border-gray-200">Family Members Details</h3>
                                <table className="w-full text-[10px] border-collapse border border-gray-300">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="border border-gray-300 p-1 text-left">Relation</th>
                                            <th className="border border-gray-300 p-1 text-left">Name</th>
                                            <th className="border border-gray-300 p-1 text-left">Age/Gender</th>
                                            <th className="border border-gray-300 p-1 text-left">Occupation</th>
                                            <th className="border border-gray-300 p-1 text-left">Aadhaar</th>
                                            <th className="border border-gray-300 p-1 text-left">Voter ID</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {createdMemberData.familyMembers.map((fm, idx) => (
                                            <tr key={idx}>
                                                <td className="border border-gray-300 p-1">{fm.relation}</td>
                                                <td className="border border-gray-300 p-1">{fm.surname} {fm.name}</td>
                                                <td className="border border-gray-300 p-1">{fm.age} / {fm.gender}</td>
                                                <td className="border border-gray-300 p-1">{fm.occupation}</td>
                                                <td className="border border-gray-300 p-1">{fm.aadhaarNumber}</td>
                                                <td className="border border-gray-300 p-1">{fm.epicNumber || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}



                        {/* Employment & Education (New Section) */}
                        <div className="mb-4">
                            <h3 className="text-xs font-bold uppercase bg-gray-100 p-1 mb-1 border border-gray-200">Education & Employment</h3>
                            <div className="grid grid-cols-2 gap-4 text-xs px-1">
                                <div>
                                    <p><span className="font-bold">Education:</span> {createdMemberData.educationLevel || 'N/A'}</p>
                                    <p><span className="font-bold">Occupation:</span> {createdMemberData.occupation || 'N/A'}</p>
                                </div>
                                {createdMemberData.occupation !== 'Farmer' && createdMemberData.occupation !== 'Student' && createdMemberData.occupation !== 'Unemployed' && (
                                    <div>
                                        <p><span className="font-bold">Sector:</span> {createdMemberData.jobSector || 'N/A'}</p>
                                        <p><span className="font-bold">Organization:</span> {createdMemberData.jobOrganization || 'N/A'}</p>
                                        <p><span className="font-bold">Designation:</span> {createdMemberData.jobDesignation || 'N/A'}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* IDs & Bank */}
                        <div className="mb-4">
                            <h3 className="text-xs font-bold uppercase bg-gray-100 p-1 mb-1 border border-gray-200">KYC & Bank Details</h3>
                            <div className="grid grid-cols-3 gap-2 text-xs px-1">
                                <div>
                                    <p className="font-bold underline mb-1">Ration Card</p>
                                    <p>No: {createdMemberData.rationCard.number || 'N/A'}</p>
                                    <p>Holder: {createdMemberData.rationCard.holderName || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="font-bold underline mb-1">Voter ID</p>
                                    <p>EPIC: {createdMemberData.voterId.epicNumber || 'N/A'}</p>
                                    <p>Name: {createdMemberData.voterId.nameOnCard || 'N/A'}</p>
                                    <p>Booth: {createdMemberData.voterId.pollingBooth || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="font-bold underline mb-1">Bank Account</p>
                                    <p>Bank: {createdMemberData.bankDetails.bankName || 'N/A'}</p>
                                    <p>Branch: {createdMemberData.bankDetails.branchName || 'N/A'}</p>
                                    <p>A/c No: {createdMemberData.bankDetails.accountNumber || 'N/A'}</p>
                                    <p>IFSC: {createdMemberData.bankDetails.ifscCode || 'N/A'}</p>
                                </div>
                            </div>
                        </div>


                        <div className="mb-8">
                            <h3 className="text-sm font-bold uppercase bg-gray-100 p-2 mb-2 border border-gray-200">Declaration</h3>
                            <p className="text-xs text-justify leading-relaxed px-2">
                                I hereby declare that the details furnished above are true and correct to the best of my knowledge and belief. I undertake to inform you of any changes therein, immediately. In case any of the above information is found to be false or untrue or misleading or misrepresenting, I am aware that I may be held liable for it.
                            </p>
                        </div>

                        {/* Printable Documents Section */}
                        <div className="mb-4 break-inside-avoid">
                            <h3 className="text-xs font-bold uppercase bg-gray-100 p-1 mb-2 border border-gray-200">Attached Documents</h3>
                            <div className="grid grid-cols-4 gap-2">
                                {[
                                    { key: 'communityCert', label: 'Community Cert' },
                                    { key: 'aadhaarFront', label: 'Aadhaar Front' },
                                    { key: 'aadhaarBack', label: 'Aadhaar Back' },
                                    { key: 'rationCardFile', label: 'Ration Card' },
                                    { key: 'voterIdFront', label: 'Voter Front' },
                                    { key: 'voterIdBack', label: 'Voter Back' },

                                ].map((doc) => (
                                    files[doc.key] && (
                                        <div key={doc.key} className="border border-gray-200 p-1 text-center">
                                            <p className="text-[10px] font-bold text-gray-700 mb-1">{doc.label}</p>
                                            <div className="w-full h-24 bg-gray-50 flex items-center justify-center overflow-hidden">
                                                {files[doc.key].type.startsWith('image/') ? (
                                                    <img
                                                        src={URL.createObjectURL(files[doc.key])}
                                                        alt={doc.label}
                                                        className="max-w-full max-h-full object-contain"
                                                    />
                                                ) : (
                                                    <span className="text-[8px] text-gray-500">PDF/File</span>
                                                )}
                                            </div>
                                        </div>
                                    )
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-between mt-12 px-4">
                            <div className="text-center">
                                <p className="font-bold text-sm mb-1">______________________</p>
                                <p className="text-xs">Signature of Applicant</p>
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-sm mb-1">______________________</p>
                                <p className="text-xs">Authorized Signatory</p>
                            </div>
                        </div>

                        <div className="mt-auto pt-2 border-t border-gray-300 text-center">
                            <p className="text-[10px] text-gray-400">Generated by MEWS System on {new Date().toLocaleString()}</p>
                        </div>
                    </div >
                )
            }

            {/* Family Member Modal */}
            {
                showFamilyModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
                                <h2 className="text-xl font-bold text-gray-800">Add Family Member Details</h2>
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
                                        ? ["Father", "Mother", "Brother", "Sister"]
                                        : ["Spouse", "Son", "Daughter"]
                                    }
                                    required
                                />
                                <FormInput label="Surname" name="surname" value={familyMemberForm.surname} onChange={handleFamilyChange} placeholder="Surname" required />
                                <FormInput label="Name" name="name" value={familyMemberForm.name} onChange={handleFamilyChange} placeholder="Name" required />
                                <FormInput label="Date of Birth" name="dob" value={familyMemberForm.dob} onChange={handleFamilyChange} type="date" />
                                <FormInput label="Age" name="age" value={familyMemberForm.age} onChange={handleFamilyChange} placeholder="Age" type="number" />
                                <FormSelect label="Gender" name="gender" value={familyMemberForm.gender} onChange={handleFamilyChange} options={["Male", "Female", "Other"]} />
                                <FormSelect label="Occupation" name="occupation" value={familyMemberForm.occupation} onChange={handleFamilyChange} options={memberOccupations} />

                                {familyMemberForm.occupation === 'Student' && (
                                    <FormSelect
                                        label="Education Level"
                                        name="educationLevel"
                                        value={familyMemberForm.educationLevel}
                                        onChange={handleFamilyChange}
                                        options={["School", "Intermediate", "Degree", "PG"]}
                                        required
                                    />
                                )}

                                <FormInput label="Mobile Number" name="mobileNumber" value={familyMemberForm.mobileNumber} onChange={handleFamilyChange} placeholder="Mobile" />
                                <FormInput label="Aadhaar Number" name="aadhaarNumber" value={familyMemberForm.aadhaarNumber} onChange={handleFamilyChange} placeholder="Aadhaar" />

                                {/* Voter ID */}
                                <div className="md:col-span-2 mt-4"><h3 className="font-bold text-blue-600 border-b pb-1 mb-2">Voter ID Details</h3></div>
                                <FormInput label="EPIC Number" name="epicNumber" value={familyMemberForm.epicNumber} onChange={handleFamilyChange} placeholder="EPIC No" />
                                <FormInput label="Voter Name" name="voterName" value={familyMemberForm.voterName} onChange={handleFamilyChange} placeholder="Name on Card" />
                                <FormInput label="Polling Booth" name="pollingBooth" value={familyMemberForm.pollingBooth} onChange={handleFamilyChange} placeholder="Booth No" />

                                {/* Documents */}
                                <div className="md:col-span-2 mt-4"><h3 className="font-bold text-blue-600 border-b pb-1 mb-2">Document Uploads</h3></div>
                                <FileUpload label="Member Photo" name="photo" onChange={handleFamilyFileChange} fileName={familyMemberFiles.photo?.name} />
                                <FileUpload label="Aadhaar Front" name="aadhaarFront" onChange={handleFamilyFileChange} fileName={familyMemberFiles.aadhaarFront?.name} />
                                <FileUpload label="Aadhaar Back" name="aadhaarBack" onChange={handleFamilyFileChange} fileName={familyMemberFiles.aadhaarBack?.name} />
                                <FileUpload label="Voter ID Front" name="voterIdFront" onChange={handleFamilyFileChange} fileName={familyMemberFiles.voterIdFront?.name} />
                                <FileUpload label="Voter ID Back" name="voterIdBack" onChange={handleFamilyFileChange} fileName={familyMemberFiles.voterIdBack?.name} />

                                <div className="md:col-span-2 bg-blue-50 p-3 rounded text-sm text-blue-800">
                                    <p><strong>Note:</strong> Addresses for this family member will be automatically set to the same as the main applicant's Present and Permanent addresses.</p>
                                </div>
                            </div>
                            <div className="p-6 border-t border-gray-200 flex justify-end gap-4">
                                <button onClick={() => setShowFamilyModal(false)} className="px-6 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                                <button onClick={saveFamilyMember} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">Add Member</button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default MemberRegistration;
