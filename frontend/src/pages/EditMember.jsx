import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import API from '../api';
import subCastes from '../utils/subCastes.json';
import partnerCastes from '../utils/partnerCastes.json';
import casteSubCastes from '../utils/casteSubCastes.json';
import {
    FaArrowLeft, FaShieldAlt, FaSave, FaIdCard, FaMapMarkerAlt,
    FaUsers, FaUniversity, FaVoteYea, FaCreditCard, FaRing, FaScroll
} from 'react-icons/fa';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';

// Components
const SectionHeader = ({ title, icon: Icon }) => (
    <div className="flex items-center gap-3 mb-6 mt-8 pb-2 border-b border-gray-100">
        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Icon size={16} />
        </div>
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
    </div>
);

const FormInput = ({ label, placeholder, type = "text", required = false, colSpan = "col-span-1", value, onChange, name, disabled = false }) => (
    <div className={colSpan}>
        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            type={type}
            name={name}
            value={value || ''}
            onChange={onChange}
            disabled={disabled}
            className={`w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-400 ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`}
            placeholder={placeholder}
        />
    </div>
);

const FormSelect = ({ label, options, required = false, colSpan = "col-span-1", value, onChange, name, disabled = false }) => (
    <div className={colSpan}>
        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <select
            name={name}
            value={value || ''}
            onChange={onChange}
            disabled={disabled}
            className={`w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`}
        >
            <option value="">Select {label}</option>
            {options.map((opt) => (
                <option key={opt} value={opt}>
                    {opt}
                </option>
            ))}
        </select>
    </div>
);


const EditMember = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();

    const handleBack = () => {
        if (window.history.length > 2) {
            navigate(-1);
        } else {
            navigate('/admin/members');
        }
    };
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Flattened initial state for form handling ease
    const [formData, setFormData] = useState({
        // A. Basic
        surname: '', name: '', fatherName: '', dob: '', age: '',
        gender: '', mobile: '', alternateMobile: '', email: '',

        bloodGroup: '', aadhaarNumber: '', maritalStatus: '',
        occupation: '', jobSector: '', jobOrganization: '', jobDesignation: '', educationLevel: '',

        // B. Address (Present)
        presentHouseNo: '', presentStreet: '', presentLandmark: '', presentPincode: '',
        presentVillage: '', presentMandal: '', presentDistrict: '', // Display only

        // C. Caste
        caste: 'MALA', subCaste: '', communityCertNumber: '',

        // D. Partner
        partnerName: '', partnerCaste: '', partnerSubCaste: '', partnerMarriageCert: '', isInterCaste: '',

        // E. Family & Econ
        fatherOccupation: '', motherOccupation: '', annualIncome: '',
        memberCount: '', rationCardType: '',

        // F. Ration Card
        rationCardNumber: '', rationCardHolder: '',

        // G. Voter ID
        voterEpic: '', voterName: '', voterBooth: '',

        // H. Bank
        bankName: '', branchName: '', accountNo: '', ifsc: '', bankHolder: ''
    });

    useEffect(() => {
        const fetchMember = async () => {
            try {
                const { data } = await API.get(`/members/${id}`);
                setFormData({
                    surname: data.surname || '',
                    name: data.name || '',
                    fatherName: data.fatherName || '',
                    dob: data.dob ? data.dob.split('T')[0] : '',
                    age: data.age || '',
                    gender: data.gender || '',
                    mobile: data.mobileNumber || '',
                    alternateMobile: data.alternateMobile || '',
                    email: data.email || '',
                    bloodGroup: data.bloodGroup || '',
                    aadhaarNumber: data.aadhaarNumber || '',

                    maritalStatus: data.maritalStatus || '',
                    occupation: data.occupation || '',
                    jobSector: data.jobSector || '',
                    jobOrganization: data.jobOrganization || '',
                    jobDesignation: data.jobDesignation || '',
                    educationLevel: data.educationLevel || '',

                    // Address
                    presentHouseNo: data.address?.houseNumber || '',
                    presentStreet: data.address?.street || '',
                    presentLandmark: data.address?.landmark || '',
                    presentPincode: data.address?.pincode || '',
                    presentVillage: typeof data.address?.village === 'object' ? data.address?.village?.name : data.address?.village || '',
                    presentMandal: typeof data.address?.mandal === 'object' ? data.address?.mandal?.name : data.address?.mandal || '',
                    presentDistrict: typeof data.address?.district === 'object' ? data.address?.district?.name : data.address?.district || '',
                    presentConstituency: data.address?.constituency || '',

                    // Caste
                    caste: data.casteDetails?.caste || '',
                    subCaste: data.casteDetails?.subCaste || '',
                    communityCertNumber: data.casteDetails?.communityCertNumber || '',

                    // Partner
                    partnerName: data.partnerDetails?.name || '',
                    partnerCaste: data.partnerDetails?.caste || '',
                    partnerSubCaste: data.partnerDetails?.subCaste || '',
                    isInterCaste: data.partnerDetails?.isInterCaste ? 'Yes' : 'No', // Convert boolean to string for radio
                    partnerMarriageCert: data.partnerDetails?.marriageCertNumber || '',

                    // Family
                    fatherOccupation: data.familyDetails?.fatherOccupation || '',
                    motherOccupation: data.familyDetails?.motherOccupation || '',
                    annualIncome: data.familyDetails?.annualIncome || '',
                    memberCount: data.familyDetails?.memberCount || '',
                    rationCardType: data.familyDetails?.rationCardType || '',

                    // Ration Card
                    rationCardNumber: data.rationCard?.number || '',
                    rationCardHolder: data.rationCard?.holderName || '',

                    // Voter
                    voterEpic: data.voterId?.epicNumber || '',
                    voterName: data.voterId?.nameOnCard || '',
                    voterBooth: data.voterId?.pollingBooth || '',

                    // Bank
                    bankName: data.bankDetails?.bankName || '',
                    branchName: data.bankDetails?.branchName || '',
                    accountNo: data.bankDetails?.accountNumber || '',
                    ifsc: data.bankDetails?.ifscCode || '',
                    bankHolder: data.bankDetails?.holderName || ''
                });
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch member details", error);
                alert("Failed to load member data");
                setLoading(false);
            }
        };
        fetchMember();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Validation Logic
        if (name === 'mobile' || name === 'alternateMobile') {
            // Only allow digits and max 10
            if (!/^\d*$/.test(value)) return;
            if (value.length > 10) return;
        }

        if (name === 'aadhaarNumber') {
            // Only allow digits and max 12
            if (!/^\d*$/.test(value)) return;
            if (value.length > 12) return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Re-nest data for API
            const apiData = {
                surname: formData.surname,
                name: formData.name,
                fatherName: formData.fatherName,
                dob: formData.dob,
                age: formData.age,
                gender: formData.gender,
                mobile: formData.mobile,
                alternateMobile: formData.alternateMobile,
                email: formData.email,
                bloodGroup: formData.bloodGroup,
                maritalStatus: formData.maritalStatus,
                aadhaarNumber: formData.aadhaarNumber,


                occupation: formData.occupation,
                jobSector: formData.jobSector,
                jobOrganization: formData.jobOrganization,
                jobDesignation: formData.jobDesignation,
                educationLevel: formData.educationLevel,

                address: {
                    houseNumber: formData.presentHouseNo,
                    street: formData.presentStreet,
                    landmark: formData.presentLandmark,
                    pincode: formData.presentPincode
                },

                casteDetails: {
                    caste: formData.caste,
                    subCaste: formData.subCaste,
                    communityCertNumber: formData.communityCertNumber
                },

                partnerDetails: {
                    name: formData.partnerName,
                    isInterCaste: formData.isInterCaste === 'Yes', // Convert string back to Boolean
                    caste: formData.partnerCaste,
                    subCaste: formData.partnerSubCaste,
                    marriageCertNumber: formData.partnerMarriageCert
                },

                familyDetails: {
                    fatherOccupation: formData.fatherOccupation,
                    motherOccupation: formData.motherOccupation,
                    annualIncome: formData.annualIncome,
                    memberCount: formData.memberCount,
                    rationCardType: formData.rationCardType
                },

                rationCard: {
                    number: formData.rationCardNumber,
                    holderName: formData.rationCardHolder,
                    type: formData.rationCardType // syncing with familyDetails type for consistency
                },

                voterId: {
                    epicNumber: formData.voterEpic,
                    nameOnCard: formData.voterName,
                    pollingBooth: formData.voterBooth
                },

                bankDetails: {
                    bankName: formData.bankName,
                    branchName: formData.branchName,
                    accountNumber: formData.accountNo,
                    ifscCode: formData.ifsc,
                    holderName: formData.bankHolder
                }
            };

            await API.put(`/members/${id}`, apiData);
            alert("Member details updated successfully!");
            navigate('/admin/members');
        } catch (error) {
            console.error("Failed to update member", error);
            alert("Failed to update member. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Loading member details...</div>;

    return (
        <div className="min-h-screen bg-[#f3f4f6] font-sans flex flex-col">
            <AdminHeader />
            <div className="flex flex-1 overflow-hidden">
                <AdminSidebar activePage="members" />

                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Edit Member Profile</h1>
                            <p className="text-sm text-gray-500 mt-1">Update all information for member ID: {id}</p>
                        </div>
                        <button onClick={handleBack} className="bg-[#1e2a4a] hover:bg-[#2a3b66] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition">
                            <FaArrowLeft size={12} /> Back to Members
                        </button>
                    </div>

                    <form className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-2">
                        {/* 1. Basic Info */}
                        <SectionHeader title="Basic Information" icon={FaIdCard} />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormInput label="Sur Name" name="surname" value={formData.surname} onChange={handleChange} />
                            <FormInput label="Name" name="name" value={formData.name} onChange={handleChange} />
                            <FormInput label="S/o, W/o, D/o" name="fatherName" value={formData.fatherName} onChange={handleChange} />
                            <FormInput label="Date of Birth" name="dob" value={formData.dob} onChange={handleChange} type="date" />
                            <FormInput label="Age" name="age" value={formData.age} onChange={handleChange} />
                            <FormSelect label="Gender" name="gender" value={formData.gender} onChange={handleChange} options={['Female', 'Male', 'Other']} />
                            <FormInput label="Mobile" name="mobile" value={formData.mobile} onChange={handleChange} />
                            <FormInput label="Alt Mobile" name="alternateMobile" value={formData.alternateMobile} onChange={handleChange} />
                            <FormInput label="Email" name="email" value={formData.email} onChange={handleChange} />
                            <FormSelect label="Blood Group" name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} options={['A+', 'A-', 'AB+', 'AB-', 'B+', 'B-', 'O+', 'O-', 'Oh (Bombay Blood Group)']} />
                            <FormInput label="Aadhaar Number" name="aadhaarNumber" value={formData.aadhaarNumber} onChange={handleChange} />
                            <FormSelect label="Marital Status" name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} options={['Divorced', 'Married', 'Unmarried', 'Widowed']} />

                            {/* New Fields */}
                            <FormSelect label="Education Level" name="educationLevel" value={formData.educationLevel} onChange={handleChange} options={["Degree", "Engineering & Technology", "High School", "Intermediate", "PG", "Polytechnic / Diploma", "Primary School", "Research / Doctoral Studies (PhD)", "Vocational / ITI"]} />
                            <FormSelect label="Occupation" name="occupation" value={formData.occupation} onChange={handleChange} options={["Business", "Daily Wage Worker", "Farmer", "Government Employee", "Homemaker", "Private Job", "Retired Govt. Employee", "Retired Private Employee", "Self Employed", "Student", "Unemployed"]} />

                            {formData.occupation === 'Government Employee' && (
                                <>
                                    <FormSelect label="Job Category" name="jobCategory" value={formData.jobSector} onChange={handleChange} options={["Central Government", "Public Sector Undertaking (PSU)", "State Government"]} />
                                    {/* Note: In Registration we had dynamic sub-categories. For Edit, keeping it simple text or basic select if complex logic not ported */}
                                </>
                            )}

                            {(formData.occupation !== 'Farmer' && formData.occupation !== 'Student' && formData.occupation !== 'Unemployed' && formData.occupation !== 'Homemaker' && formData.occupation !== 'Retired Govt. Employee' && formData.occupation !== 'Retired Private Employee' && formData.occupation !== 'Other') && (
                                <>
                                    <FormInput label="Job Sector/Category" name="jobSector" value={formData.jobSector} onChange={handleChange} />
                                    <FormInput label="Organization" name="jobOrganization" value={formData.jobOrganization} onChange={handleChange} />
                                    <FormInput label="Designation" name="jobDesignation" value={formData.jobDesignation} onChange={handleChange} />
                                </>
                            )}
                            {(formData.occupation === 'Retired Govt. Employee' || formData.occupation === 'Retired Private Employee') && (
                                <FormInput label="Designation" name="jobDesignation" value={formData.jobDesignation} onChange={handleChange} />
                            )}
                            {formData.occupation === 'Other' && (
                                <FormInput label="Specify Details" name="jobDesignation" value={formData.jobDesignation} onChange={handleChange} />
                            )}
                        </div>

                        {/* 2. Address Info */}
                        <SectionHeader title="Residential Information" icon={FaMapMarkerAlt} />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormInput label="District (ReadOnly)" value={formData.presentDistrict} disabled={true} />
                            <FormInput label="Mandal (ReadOnly)" value={formData.presentMandal} disabled={true} />
                            <FormInput label="Village (ReadOnly)" value={formData.presentVillage} disabled={true} />

                            <FormInput label="House No" name="presentHouseNo" value={formData.presentHouseNo} onChange={handleChange} />
                            <FormInput label="Street / Colony" name="presentStreet" value={formData.presentStreet} onChange={handleChange} />
                            <FormInput label="Landmark" name="presentLandmark" value={formData.presentLandmark} onChange={handleChange} />
                            <FormInput label="Pincode" name="presentPincode" value={formData.presentPincode} onChange={handleChange} />
                        </div>

                        {/* 3. Family & Caste */}
                        <SectionHeader title="Family & Community" icon={FaUsers} />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormSelect label="Caste" name="caste" value={formData.caste} onChange={handleChange} options={['MALA']} />
                            <FormSelect label="Member's Sub-Caste" name="subCaste" value={formData.subCaste} onChange={handleChange} options={subCastes} />
                            <FormInput label="Community Cert No" name="communityCertNumber" value={formData.communityCertNumber} onChange={handleChange} />

                            <FormInput label="Father's Occupation" name="fatherOccupation" value={formData.fatherOccupation} onChange={handleChange} />
                            <FormInput label="Mother's Occupation" name="motherOccupation" value={formData.motherOccupation} onChange={handleChange} />
                            <FormInput label="Annual Income" name="annualIncome" value={formData.annualIncome} onChange={handleChange} />
                            <FormInput label="Family Member Count" name="memberCount" value={formData.memberCount} onChange={handleChange} />
                        </div>

                        {/* 4. Partner Details (Conditional could be added, but showing all for edit) */}
                        {formData.maritalStatus !== 'Single' && (
                            <>
                                <SectionHeader title="Spouse / Partner Details" icon={FaRing} />
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <FormInput label="Spouse Name" name="partnerName" value={formData.partnerName} onChange={handleChange} />
                                    <FormSelect
                                        label="Spouse Caste"
                                        name="partnerCaste"
                                        value={formData.partnerCaste}
                                        onChange={(e) => {
                                            handleChange(e);
                                            setFormData(prev => ({ ...prev, partnerSubCaste: '' }));
                                        }}
                                        options={partnerCastes}
                                        disabled={formData.isInterCaste === 'No'}
                                    />
                                    <FormSelect
                                        label="Spouse Sub-Caste"
                                        name="partnerSubCaste"
                                        value={formData.partnerSubCaste}
                                        onChange={handleChange}
                                        options={formData.partnerCaste ? (casteSubCastes[formData.partnerCaste] || []) : []}
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
                                                    checked={formData.isInterCaste === 'Yes'}
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
                                                    checked={formData.isInterCaste === 'No'}
                                                    onChange={(e) => {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            isInterCaste: 'No',
                                                            partnerCaste: 'Mala',
                                                            partnerSubCaste: ''
                                                        }));
                                                    }}
                                                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                                />
                                                <span className="text-sm text-gray-700">No</span>
                                            </label>
                                        </div>
                                    </div>
                                    <FormInput label="Marriage Cert No" name="partnerMarriageCert" value={formData.partnerMarriageCert} onChange={handleChange} />
                                </div>
                            </>
                        )}

                        {/* 5. Documents & Bank */}
                        <SectionHeader title="Documents & Banking" icon={FaUniversity} />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormInput label="Ration Card No" name="rationCardNumber" value={formData.rationCardNumber} onChange={handleChange} />
                            <FormInput label="Ration Card Holder" name="rationCardHolder" value={formData.rationCardHolder} onChange={handleChange} />
                            <FormSelect label="Card Type" name="rationCardType" value={formData.rationCardType} onChange={handleChange} options={['AAY (Antyodaya)', 'PAP (Pink)', 'WAP (White)']} />

                            <FormInput label="Voter EPIC No" name="voterEpic" value={formData.voterEpic} onChange={handleChange} />
                            <FormInput label="Name on Voter ID" name="voterName" value={formData.voterName} onChange={handleChange} />
                            <FormInput label="Polling Booth" name="voterBooth" value={formData.voterBooth} onChange={handleChange} />

                            <FormInput label="Bank Name" name="bankName" value={formData.bankName} onChange={handleChange} />
                            <FormInput label="Branch Name" name="branchName" value={formData.branchName} onChange={handleChange} />
                            <FormInput label="Account Number" name="accountNo" value={formData.accountNo} onChange={handleChange} />
                            <FormInput label="IFSC Code" name="ifsc" value={formData.ifsc} onChange={handleChange} />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-4 pt-10 border-t border-gray-100 mt-8">
                            <button type="button" onClick={handleBack} className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition shadow-sm">
                                Cancel
                            </button>
                            <div className="flex-1"></div>
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={saving}
                                className={`px-8 py-3 bg-[#1e2a4a] text-white font-bold rounded-xl hover:bg-[#2a3b66] transition shadow-md flex items-center gap-2 ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {saving ? 'Saving...' : 'Save & Update All'} <FaSave className="ml-1" />
                            </button>
                        </div>
                    </form>
                </main>
            </div>
        </div>
    );
};

export default EditMember;
