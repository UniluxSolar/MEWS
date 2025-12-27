import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    FaCheckCircle, FaUserGraduate, FaRunning, FaChalkboardTeacher,
    FaArrowLeft, FaArrowRight, FaHeadset, FaFileAlt
} from 'react-icons/fa';
import FileUploader from '../components/FileUploader';

const NewApplication = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedType, setSelectedType] = useState(null);
    const [applicationDetails, setApplicationDetails] = useState({});

    const steps = [
        { number: 1, label: "Type Selection" },
        { number: 2, label: "Details" },
        { number: 3, label: "Documents" },
        { number: 4, label: "Review & Submit" }
    ];

    const scholarshipTypes = [
        {
            id: 'education',
            title: 'Student Scholarship',
            description: 'Financial assistance for educational fees, including tuition, hostel, and other academic expenses for students pursuing higher education.',
            icon: FaUserGraduate,
            color: 'text-blue-500',
            bg: 'bg-blue-50',
            border: 'border-blue-200'
        },
        {
            id: 'sports',
            title: 'Sportsperson Scholarship',
            description: 'Support for talented athletes including training expenses, equipment, nutrition, and competition participation costs.',
            icon: FaRunning,
            color: 'text-orange-500',
            bg: 'bg-orange-50',
            border: 'border-orange-200'
        },
        {
            id: 'coaching',
            title: 'Coaching Fees Support',
            description: 'Financial assistance for specialized coaching and training programs for competitive examinations and skill development.',
            icon: FaChalkboardTeacher,
            color: 'text-purple-500',
            bg: 'bg-purple-50',
            border: 'border-purple-200'
        }
    ];

    const handleNext = () => {
        if (currentStep < 4) setCurrentStep(currentStep + 1);
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const handleUploadStatusChange = (title, status) => {
        // Just tracking for demo purposes
        console.log(`Uploaded ${title}: ${status}`);
    }

    return (
        <div className="flex flex-col lg:flex-row gap-8 min-h-[calc(100vh-100px)]">
            {/* Sidebar - Application Guidance */}
            <div className="w-full lg:w-80 flex-shrink-0">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
                    <h2 className="text-lg font-bold text-primary mb-6">Application Guidance</h2>

                    <div className="mb-8">
                        <h3 className="text-sm font-bold text-gray-800 mb-3">Required Documents</h3>
                        <ul className="space-y-3">
                            {[
                                "Bonafide certificate from institution",
                                "Previous marks memos/performance records",
                                "Income certificate",
                                "Bank passbook copy",
                                "Aadhar card (auto-filled from KYC)",
                                "Community certificate (auto-filled from KYC)"
                            ].map((item, index) => (
                                <li key={index} className="flex items-start gap-3 text-xs text-gray-600">
                                    <FaCheckCircle className="text-green-500 mt-0.5 flex-shrink-0" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="mb-8">
                        <h3 className="text-sm font-bold text-gray-800 mb-3">Eligibility Criteria</h3>
                        <ul className="space-y-2 text-xs text-gray-600 list-disc pl-4">
                            <li>Annual family income below ₹3,00,000</li>
                            <li>Valid membership in MEWS</li>
                            <li>Completed KYC verification</li>
                        </ul>
                    </div>

                    <div className="mb-8">
                        <h3 className="text-sm font-bold text-gray-800 mb-3">Processing Timeline</h3>
                        <div className="relative border-l-2 border-gray-200 ml-2 space-y-6">
                            {[
                                { title: "Application submitted", desc: "", active: true },
                                { title: "Review (5-7 days)", desc: "", active: false },
                                { title: "Approval & Disbursement", desc: "", active: false }
                            ].map((step, index) => (
                                <div key={index} className="relative pl-6">
                                    <span className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 ${step.active ? 'bg-primary border-primary' : 'bg-white border-gray-300'}`}></span>
                                    <p className="text-xs font-bold text-gray-800">{step.title}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                        <a href="#" className="flex items-center gap-2 text-primary font-bold text-sm hover:underline">
                            <FaHeadset /> Contact Support
                        </a>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
                {/* Stepper */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center justify-between relative">
                        {/* Connecting Line */}
                        <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-100 -z-10 hidden sm:block"></div>

                        {steps.map((step, index) => (
                            <div key={step.number} className="flex items-center gap-3 bg-white px-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${currentStep >= step.number ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'
                                    }`}>
                                    {currentStep > step.number ? <FaCheckCircle /> : step.number}
                                </div>
                                <span className={`text-sm font-bold hidden sm:block ${currentStep >= step.number ? 'text-primary' : 'text-gray-400'
                                    }`}>{step.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Step Content */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 min-h-[500px] flex flex-col">

                    {/* STEP 1: Type Selection */}
                    {currentStep === 1 && (
                        <>
                            <div className="mb-8">
                                <h1 className="text-2xl font-bold text-primary mb-2">Select Scholarship Type</h1>
                                <p className="text-gray-500 text-sm">Choose the type of scholarship assistance you need</p>
                            </div>

                            <div className="grid gap-6 mb-8 flex-1">
                                {scholarshipTypes.map((type) => (
                                    <div
                                        key={type.id}
                                        onClick={() => setSelectedType(type.id)}
                                        className={`cursor-pointer border-2 rounded-xl p-6 flex items-center gap-6 transition-all duration-200 group hover:shadow-md ${selectedType === type.id
                                            ? 'border-primary bg-blue-50/30'
                                            : 'border-gray-100 hover:border-blue-100'
                                            }`}
                                    >
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${selectedType === type.id
                                            ? 'border-primary'
                                            : 'border-gray-300 group-hover:border-gray-400'
                                            }`}>
                                            {selectedType === type.id && <div className="w-3 h-3 rounded-full bg-primary" />}
                                        </div>

                                        <div className={`w-12 h-12 rounded-lg ${type.bg} ${type.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                                            <type.icon size={22} />
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-bold text-gray-800 mb-1">{type.title}</h3>
                                            <p className="text-sm text-gray-500 leading-relaxed">{type.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* STEP 2: Details (Placeholder) */}
                    {currentStep === 2 && (
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-primary mb-6">Application Details</h1>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Student Name</label>
                                    <input type="text" className="w-full border border-gray-300 rounded-lg p-3" defaultValue="Rajesh Kumar" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Institution Name</label>
                                    <input type="text" className="w-full border border-gray-300 rounded-lg p-3" placeholder="Enter college/school name" />
                                </div>
                                <div>
                                    <input type="text" className="w-full border border-gray-300 rounded-lg p-3" placeholder="e.g. B.Tech Computer Science" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Reason for Assistance</label>
                                    <textarea
                                        className="w-full border border-gray-300 rounded-lg p-3 h-32 resize-none"
                                        placeholder="Please describe why you need this scholarship..."
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Documents */}
                    {currentStep === 3 && (
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-primary mb-2">Upload Documents</h1>
                            <p className="text-gray-500 text-sm mb-6">Please provide the required proofs for your application.</p>

                            <div className="space-y-2">
                                <FileUploader
                                    title="Bonafide Certificate"
                                    isRequired={true}
                                    onUploadStatusChange={handleUploadStatusChange}
                                />
                                <FileUploader
                                    title="Previous Marks Memo"
                                    isRequired={true}
                                    onUploadStatusChange={handleUploadStatusChange}
                                />
                                <FileUploader
                                    title="Income Certificate"
                                    isRequired={true}
                                    onUploadStatusChange={handleUploadStatusChange}
                                />
                            </div>
                        </div>
                    )}

                    {/* STEP 4: Submit (Placeholder) */}
                    {currentStep === 4 && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6">
                                <FaCheckCircle size={40} />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">Review & Submit</h1>
                            <p className="text-gray-500 max-w-md">Please review your details before final submission. Once submitted, you cannot edit the application.</p>
                            <div className="mt-8 p-4 bg-gray-50 rounded-lg text-left w-full max-w-md">
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-600 text-sm">Type:</span>
                                    <span className="font-bold text-sm">Student Scholarship</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 text-sm">Documents:</span>
                                    <span className="font-bold text-sm text-green-600">3 Uploaded</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-auto">
                        {currentStep === 1 ? (
                            <Link
                                to="/dashboard/applications"
                                className="text-gray-500 font-bold text-sm hover:text-gray-800 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
                            >
                                <FaArrowLeft size={12} /> Back to Applications
                            </Link>
                        ) : (
                            <button
                                onClick={handleBack}
                                className="text-gray-500 font-bold text-sm hover:text-gray-800 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
                            >
                                <FaArrowLeft size={12} /> Back
                            </button>
                        )}

                        <button
                            onClick={handleNext}
                            disabled={currentStep === 1 && !selectedType}
                            className={`flex items-center gap-2 px-8 py-3 rounded-lg text-sm font-bold text-white transition-all shadow-md ${(currentStep === 1 && !selectedType)
                                ? 'bg-gray-300 cursor-not-allowed shadow-none'
                                : 'bg-primary hover:bg-[#151f38] cursor-pointer'
                                }`}
                        >
                            {currentStep === 4 ? 'Submit Application' : 'Continue'} <FaArrowRight size={12} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewApplication;
