import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    FaCheckCircle, FaUserGraduate, FaRunning, FaChalkboardTeacher,
    FaHeartbeat, FaBalanceScale, FaHandHoldingHeart, FaBriefcase,
    FaArrowLeft, FaArrowRight, FaHeadset, FaFileAlt
} from 'react-icons/fa';
import FileUploader from '../components/FileUploader';

const TELANGANA_BANKS = [
    "State Bank of India",
    "Union Bank of India",
    "HDFC Bank",
    "ICICI Bank",
    "Axis Bank",
    "Canara Bank",
    "Bank of Baroda",
    "Punjab National Bank",
    "Kotak Mahindra Bank",
    "Indian Bank",
    "Telangana Grameena Bank",
    "Andhra Pradesh Grameena Vikas Bank",
    "Indian Overseas Bank",
    "Bank of India",
    "Central Bank of India",
    "IDBI Bank"
];

const NewApplication = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedType, setSelectedType] = useState(null);
    const [applicationDetails, setApplicationDetails] = useState({
        // Common
        beneficiaryName: '',

        // Education
        institutionName: '',
        courseName: '',

        // Health
        hospitalName: '',
        doctorName: '',
        condition: '', // Reason/Condition

        // Welfare
        purposeDescription: '',

        // Employment
        skillName: '',
        jobRole: '',

        // Legal
        caseType: '',
        advocateName: '',

        // Bank - Common
        bankName: '',
        branchName: '',
        accountNumber: '',
        ifscCode: '',

        // General Description
        reason: '',
        amountRequired: '' // New Field
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchMemberDetails = async () => {
            try {
                const adminInfo = JSON.parse(localStorage.getItem('adminInfo'));
                if (!adminInfo || !adminInfo.token) return;

                const response = await fetch(`/api/members/${adminInfo._id}`, {
                    headers: { 'Authorization': `Bearer ${adminInfo.token}` }
                });

                if (response.ok) {
                    const memberData = await response.json();
                    setApplicationDetails(prev => ({
                        ...prev,
                        beneficiaryName: (memberData.name + ' ' + memberData.surname).trim(),
                        bankName: memberData.bankDetails?.bankName || '',
                        branchName: memberData.bankDetails?.branchName || '',
                        accountNumber: memberData.bankDetails?.accountNumber || '',
                        ifscCode: memberData.bankDetails?.ifscCode || '',
                        institutionName: memberData.educationLevel ? memberData.educationLevel + ' Institution' : '',
                    }));
                }
            } catch (error) {
                console.error("Error fetching member details:", error);
            }
        };
        fetchMemberDetails();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setApplicationDetails(prev => ({ ...prev, [name]: value }));

        // Auto-lookup IFSC
        if (name === 'ifscCode' && value.length === 11) {
            lookupIfsc(value);
        }

        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const lookupIfsc = async (code) => {
        try {
            const response = await fetch(`https://ifsc.razorpay.com/${code}`);
            if (response.ok) {
                const data = await response.json();
                setApplicationDetails(prev => ({
                    ...prev,
                    branchName: data.BRANCH,
                    bankName: data.BANK // Optional: auto-select bank if it matches our list or just let it be
                }));
                // Clear errors if any
                if (errors.ifscCode) setErrors(prev => ({ ...prev, ifscCode: null }));
            }
        } catch (err) {
            console.error("IFSC Lookup failed", err);
        }
    };

    const steps = [
        { number: 1, label: "Type Selection" },
        { number: 2, label: "Details" },
        { number: 3, label: "Documents" },
        { number: 4, label: "Review & Submit" }
    ];

    const scholarshipTypes = [
        {
            id: 'Education',
            title: 'Education Support',
            description: 'Financial assistance for school fees, college tuition, books, and other academic expenses.',
            icon: FaUserGraduate,
            color: 'text-blue-500',
            bg: 'bg-blue-50',
            border: 'border-blue-200'
        },
        {
            id: 'Health',
            title: 'Medical Assistance',
            description: 'Support for hospital bills, surgeries, medicines, and critical health emergencies.',
            icon: FaHeartbeat,
            color: 'text-red-500',
            bg: 'bg-red-50',
            border: 'border-red-200'
        },
        {
            id: 'Legal',
            title: 'Legal Aid',
            description: 'Assistance for legal representation, court fees, and justice-related expenses.',
            icon: FaBalanceScale,
            color: 'text-purple-500',
            bg: 'bg-purple-50',
            border: 'border-purple-200'
        },
        {
            id: 'Welfare',
            title: 'Social Welfare',
            description: 'General support for basic needs, housing, food, or community welfare projects.',
            icon: FaHandHoldingHeart,
            color: 'text-green-500',
            bg: 'bg-green-50',
            border: 'border-green-200'
        },
        {
            id: 'Employment',
            title: 'Employment Support',
            description: 'Help with skill development, training programs, tools for trade, or job placement.',
            icon: FaBriefcase,
            color: 'text-amber-500',
            bg: 'bg-amber-50',
            border: 'border-amber-200'
        }
    ];

    const handleNext = () => {
        if (currentStep < 4) setCurrentStep(currentStep + 1);
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const validateForm = () => {
        const newErrors = {};
        if (!applicationDetails.beneficiaryName) newErrors.beneficiaryName = "Name is required";
        if (!applicationDetails.reason) newErrors.reason = "Reason is required";
        if (!applicationDetails.amountRequired) newErrors.amountRequired = "Amount is required";

        // Bank Validations
        if (!applicationDetails.bankName) newErrors.bankName = "Bank Name is required";
        if (!applicationDetails.accountNumber) {
            newErrors.accountNumber = "Account Number is required";
        } else if (!/^\d{9,18}$/.test(applicationDetails.accountNumber)) {
            newErrors.accountNumber = "Account Number must be 9-18 digits";
        }
        if (!applicationDetails.ifscCode) {
            newErrors.ifscCode = "IFSC Code is required";
        } else if (applicationDetails.ifscCode.length !== 11) {
            newErrors.ifscCode = "IFSC Code must be 11 characters";
        }

        // Specific Validations
        if (selectedType === 'Education') {
            if (!applicationDetails.institutionName) newErrors.institutionName = "Institution Name is required";
            if (!applicationDetails.courseName) newErrors.courseName = "Course Name is required";
        }
        if (selectedType === 'Health') {
            if (!applicationDetails.hospitalName) newErrors.hospitalName = "Hospital Name is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleUploadStatusChange = (title, status) => {
        console.log(`Uploaded ${title}: ${status}`);
    }

    const handleSubmit = async () => {
        if (!selectedType) { alert("Please select a type"); return; }
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const token = JSON.parse(localStorage.getItem('adminInfo'))?.token;
            if (!token) { alert("You are not logged in!"); return; }

            // Construct Payload based on type
            let description = applicationDetails.reason;
            // Append specific fields to description for generic storage in backend if specific fields don't exist
            if (selectedType === 'Health') description += ` | Hospital: ${applicationDetails.hospitalName}, Doctor: ${applicationDetails.doctorName}`;
            if (selectedType === 'Legal') description += ` | Case: ${applicationDetails.caseType}, Advocate: ${applicationDetails.advocateName}`;
            if (selectedType === 'Employment') description += ` | Skill: ${applicationDetails.skillName}, Role: ${applicationDetails.jobRole}`;
            if (selectedType === 'Welfare') description += ` | Purpose: ${applicationDetails.purposeDescription}`;

            const payload = {
                type: selectedType,
                ...applicationDetails,
                // Add default or derived fields
                // amountRequired is now in applicationDetails
                status: 'SUBMITTED',
                // Common fields mapping
                beneficiaryName: applicationDetails.beneficiaryName,
                courseName: applicationDetails.courseName, // Only relevant for Education
                institutionName: applicationDetails.institutionName, // Only relevant for Education sent in description usually or separate field? 
                // Wait, backend createFundRequest uses req.body fields.
                // Let's pass them all, backend controller will ignore what it doesn't use or we update backend.
                // Current backend controller maps 'type' to 'purpose'.
                // It expects: type, studentName, institutionName, courseName, bankDetails...

                // Mapping for backend compatibility:
                courseName: selectedType === 'Education' ? applicationDetails.courseName : undefined,

                bankName: applicationDetails.bankName,
                branchName: applicationDetails.branchName,
                accountNumber: applicationDetails.accountNumber,
                ifscCode: applicationDetails.ifscCode,

                reason: description, // Backend uses 'reason' or 'description'
                status: 'SUBMITTED'
            };

            const response = await fetch('/api/fund-requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert("Application Submitted Successfully!");
                navigate('/dashboard/applications');
            } else {
                const errorData = await response.json();
                alert(`Submission Failed: ${errorData.message}`);
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8 min-h-[calc(100vh-100px)]">
            {/* Sidebar */}
            <div className="w-full lg:w-80 flex-shrink-0">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
                    <h2 className="text-lg font-bold text-primary mb-6">Application Guidance</h2>
                    <div className="mb-8">
                        <h3 className="text-sm font-bold text-gray-800 mb-3">Required Documents</h3>
                        <ul className="space-y-3">
                            {["Identity Proof (Aadhaar)", "Bank Passbook", "Supporting Documents (Bills/Fees)"].map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-xs text-gray-600">
                                    <FaCheckCircle className="text-green-500 mt-0.5 flex-shrink-0" /> <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
                {/* Top Back Button */}
                <div className="mb-4">
                    <Link to="/dashboard/applications" className="flex items-center gap-2 text-gray-500 hover:text-primary transition font-bold text-sm">
                        <FaArrowLeft size={12} /> Back to Funding Request
                    </Link>
                </div>

                {/* Stepper */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center justify-between relative">
                        <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-100 -z-10 hidden sm:block"></div>
                        {steps.map((step) => (
                            <div key={step.number} className="flex items-center gap-3 bg-white px-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${currentStep >= step.number ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                                    {currentStep > step.number ? <FaCheckCircle /> : step.number}
                                </div>
                                <span className={`text-sm font-bold hidden sm:block ${currentStep >= step.number ? 'text-primary' : 'text-gray-400'}`}>{step.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 min-h-[500px] flex flex-col">
                    {/* STEP 1: Type Selection */}
                    {currentStep === 1 && (
                        <>
                            <div className="mb-8">
                                <h1 className="text-2xl font-bold text-primary mb-2">Select Assistance Type</h1>
                                <p className="text-gray-500 text-sm">Choose the category that best describes your need.</p>
                            </div>
                            <div className="grid gap-6 mb-8 flex-1">
                                {scholarshipTypes.map((type) => (
                                    <div key={type.id} onClick={() => setSelectedType(type.id)}
                                        className={`cursor-pointer border-2 rounded-xl p-6 flex items-center gap-6 transition-all duration-200 group hover:shadow-md ${selectedType === type.id ? 'border-primary bg-blue-50/30' : 'border-gray-100 hover:border-blue-100'}`}>
                                        <div className={`w-12 h-12 rounded-lg ${type.bg} ${type.color} flex items-center justify-center flex-shrink-0`}>
                                            <type.icon size={22} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-800 mb-1">{type.title}</h3>
                                            <p className="text-sm text-gray-500">{type.description}</p>
                                        </div>
                                        <div className={`ml-auto w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedType === type.id ? 'border-primary' : 'border-gray-300'}`}>
                                            {selectedType === type.id && <div className="w-3 h-3 rounded-full bg-primary" />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* STEP 2: Details */}
                    {currentStep === 2 && (
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-primary mb-6">{selectedType} Details</h1>
                            <div className="space-y-6">
                                {/* Common Field: Beneficiary Name */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Beneficiary Name</label>
                                    <input type="text" name="beneficiaryName" value={applicationDetails.beneficiaryName} onChange={handleInputChange} className={`w-full border rounded-lg p-3 ${errors.beneficiaryName ? 'border-red-500' : 'border-gray-300'}`} placeholder="Full Name of Person needing help" />
                                    {errors.beneficiaryName && <p className="text-red-500 text-xs mt-1">{errors.beneficiaryName}</p>}
                                </div>

                                {/* Dynamic Fields based on Type */}
                                {selectedType === 'Education' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Institution Name</label>
                                            <input type="text" name="institutionName" value={applicationDetails.institutionName} onChange={handleInputChange} className={`w-full border rounded-lg p-3 ${errors.institutionName ? 'border-red-500' : 'border-gray-300'}`} placeholder="School/College Name" />
                                            {errors.institutionName && <p className="text-red-500 text-xs mt-1">{errors.institutionName}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Course / Grade</label>
                                            <input type="text" name="courseName" value={applicationDetails.courseName} onChange={handleInputChange} className={`w-full border rounded-lg p-3 ${errors.courseName ? 'border-red-500' : 'border-gray-300'}`} placeholder="e.g. Class 10, B.Tech 2nd Year" />
                                            {errors.courseName && <p className="text-red-500 text-xs mt-1">{errors.courseName}</p>}
                                        </div>
                                    </>
                                )}

                                {selectedType === 'Health' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Hospital Name</label>
                                            <input type="text" name="hospitalName" value={applicationDetails.hospitalName} onChange={handleInputChange} className={`w-full border rounded-lg p-3 ${errors.hospitalName ? 'border-red-500' : 'border-gray-300'}`} placeholder="Name of Hospital" />
                                            {errors.hospitalName && <p className="text-red-500 text-xs mt-1">{errors.hospitalName}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Doctor Name</label>
                                            <input type="text" name="doctorName" value={applicationDetails.doctorName} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-3" placeholder="Treating Doctor" />
                                        </div>
                                    </>
                                )}

                                {selectedType === 'Employment' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Skill / Training Program</label>
                                            <input type="text" name="skillName" value={applicationDetails.skillName} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-3" placeholder="e.g. Tailoring, Computer Course" />
                                        </div>
                                    </>
                                )}

                                {selectedType === 'Legal' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Case Type</label>
                                            <input type="text" name="caseType" value={applicationDetails.caseType} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-3" placeholder="e.g. Civil Dispute, Family Court" />
                                        </div>
                                    </>
                                )}

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Description / Reason</label>
                                    <textarea name="reason" value={applicationDetails.reason} onChange={handleInputChange} className={`w-full border rounded-lg p-3 h-32 resize-none ${errors.reason ? 'border-red-500' : 'border-gray-300'}`} placeholder="Describe why you need this assistance..." />
                                    {errors.reason && <p className="text-red-500 text-xs mt-1">{errors.reason}</p>}
                                </div>


                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Amount Required (₹)</label>
                                    <input
                                        type="number"
                                        name="amountRequired"
                                        value={applicationDetails.amountRequired}
                                        onChange={handleInputChange}
                                        className={`w-full border rounded-lg p-3 ${errors.amountRequired ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="Enter Amount needed"
                                    />
                                    {errors.amountRequired && <p className="text-red-500 text-xs mt-1">{errors.amountRequired}</p>}
                                </div>

                                {/* Bank Details - Always Shown */}
                                <div className="pt-6 border-t border-gray-100">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4">Bank Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Bank Name</label>
                                            <select
                                                name="bankName"
                                                value={applicationDetails.bankName}
                                                onChange={handleInputChange}
                                                className={`w-full border rounded-lg p-3 ${errors.bankName ? 'border-red-500' : 'border-gray-300'}`}
                                            >
                                                <option value="">Select Bank</option>
                                                {TELANGANA_BANKS.map((bank, index) => (
                                                    <option key={index} value={bank}>{bank}</option>
                                                ))}
                                                <option value="Other">Other</option>
                                            </select>
                                            {errors.bankName && <p className="text-red-500 text-xs mt-1">{errors.bankName}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Account Number</label>
                                            <input
                                                type="text"
                                                name="accountNumber"
                                                value={applicationDetails.accountNumber}
                                                onChange={handleInputChange}
                                                className={`w-full border rounded-lg p-3 ${errors.accountNumber ? 'border-red-500' : 'border-gray-300'}`}
                                                placeholder="Enter Account Number"
                                                maxLength={18}
                                            />
                                            {errors.accountNumber && <p className="text-red-500 text-xs mt-1">{errors.accountNumber}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">IFSC Code</label>
                                            <input
                                                type="text"
                                                name="ifscCode"
                                                value={applicationDetails.ifscCode}
                                                onChange={handleInputChange}
                                                className={`w-full border rounded-lg p-3 uppercase ${errors.ifscCode ? 'border-red-500' : 'border-gray-300'}`}
                                                placeholder="e.g. SBIN0001234"
                                                maxLength={11}
                                            />
                                            {errors.ifscCode && <p className="text-red-500 text-xs mt-1">{errors.ifscCode}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Branch</label>
                                            <input
                                                type="text"
                                                name="branchName"
                                                value={applicationDetails.branchName}
                                                onChange={handleInputChange}
                                                className="w-full border border-gray-300 rounded-lg p-3 bg-gray-50"
                                                readOnly
                                                placeholder="Auto-populated from IFSC"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Documents placeholders (kept simple) */}
                    {currentStep === 3 && (
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-primary mb-2">Upload Support Documents</h1>
                            <p className="text-gray-500 text-sm mb-6">Upload proof related to your {selectedType} request.</p>
                            <FileUploader title="Identity Proof" isRequired={true} onUploadStatusChange={handleUploadStatusChange} />
                            <FileUploader title="Supporting Document (Bill/Fee/Est)" isRequired={true} onUploadStatusChange={handleUploadStatusChange} />
                        </div>
                    )}

                    {/* STEP 4: Submit */}
                    {currentStep === 4 && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6"><FaCheckCircle size={40} /></div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">Confirm Submission</h1>
                            <div className="mt-8 p-4 bg-gray-50 rounded-lg text-left w-full max-w-md">
                                <div className="flex justify-between mb-2"><span className="text-gray-600 text-sm">Type:</span><span className="font-bold text-sm">{selectedType}</span></div>
                                <div className="flex justify-between mb-2"><span className="text-gray-600 text-sm">Beneficiary:</span><span className="font-bold text-sm">{applicationDetails.beneficiaryName}</span></div>
                                <div className="flex justify-between"><span className="text-gray-600 text-sm">Description:</span><span className="font-bold text-sm truncate w-40 text-right">{applicationDetails.reason}</span></div>
                            </div>
                        </div>
                    )}

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-auto">
                        <button onClick={currentStep === 1 ? () => navigate('/dashboard/applications') : handleBack} className="text-gray-500 font-bold text-sm hover:text-gray-800 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-50 transition">
                            <FaArrowLeft size={12} /> {currentStep === 1 ? 'Back to Dashboard' : 'Back'}
                        </button>
                        <button onClick={currentStep === 4 ? handleSubmit : handleNext} disabled={(currentStep === 1 && !selectedType) || isSubmitting}
                            className={`flex items-center gap-2 px-8 py-3 rounded-lg text-sm font-bold text-white transition-all shadow-md ${(currentStep === 1 && !selectedType) || isSubmitting ? 'bg-gray-300 cursor-not-allowed' : 'bg-primary hover:bg-[#151f38]'}`}>
                            {isSubmitting ? 'Submitting...' : (currentStep === 4 ? 'Submit Application' : 'Continue')} <FaArrowRight size={12} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default NewApplication;
