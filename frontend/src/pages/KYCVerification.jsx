import React, { useState } from 'react';
import {
    FaInfoCircle, FaCheckCircle, FaClock, FaCamera, FaCloudUploadAlt,
    FaFileAlt, FaChevronDown, FaChevronUp, FaCommentDots
} from 'react-icons/fa';

const DocumentItem = ({ title, status, isRequired, savedFile }) => (
    <div className={`border border-dashed rounded-lg p-6 mb-6 ${status === 'Uploaded' ? 'border-green-200 bg-green-50/30' : 'border-gray-300 bg-gray-50'}`}>
        <div className="flex justify-between items-start mb-4">
            <div>
                <h4 className="font-bold text-gray-800">{title}</h4>
                {isRequired && <span className="text-xs text-red-500 font-semibold">(Required)</span>}
            </div>
            {status === 'Uploaded' ? (
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1">
                    <FaCheckCircle /> Uploaded
                </span>
            ) : (
                <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs font-bold rounded-full flex items-center gap-1">
                    <FaClock /> Pending
                </span>
            )}
        </div>

        {status === 'Uploaded' ? (
            <div className="flex items-center gap-4">
                <div className="w-24 h-16 bg-white border border-gray-200 rounded flex items-center justify-center p-1">
                    {/* Placeholder for uploaded image thumbnail */}
                    <FaFileAlt className="text-gray-300 text-2xl" />
                </div>
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">{savedFile}</p>
                    <p className="text-xs text-gray-400">Uploaded on Jan 15, 2025</p>
                </div>
                <div className="flex flex-col gap-2">
                    <button className="px-3 py-1.5 border border-gray-300 rounded text-xs font-bold text-gray-600 hover:bg-gray-100 flex items-center gap-2">
                        <FaCloudUploadAlt /> Re-upload
                    </button>
                    <button className="text-xs text-red-500 hover:text-red-700 font-bold">Remove</button>
                </div>
            </div>
        ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center bg-white">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-primary mb-3">
                    <FaCloudUploadAlt size={20} />
                </div>
                <h5 className="font-bold text-gray-700 mb-1">Upload Document</h5>
                <p className="text-xs text-gray-500 mb-4">Drag & drop or click to browse</p>
                <button className="px-4 py-2 bg-[#1e2a4a] text-white text-sm font-bold rounded-lg hover:bg-[#2a3b66] transition">
                    Choose File
                </button>
            </div>
        )}
    </div>
);

const FAQItem = ({ question, isOpen, onClick }) => (
    <div className="border border-gray-200 rounded-lg mb-2 overflow-hidden bg-white">
        <button
            onClick={onClick}
            className="w-full flex justify-between items-center p-4 text-left font-bold text-gray-700 hover:bg-gray-50 transition"
        >
            {question}
            {isOpen ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
        </button>
        {isOpen && (
            <div className="p-4 bg-gray-50 text-sm text-gray-600 border-t border-gray-100 leading-relaxed">
                KYC verification typically takes 2-3 business days. You will be notified via SMS and Email once the verification is complete.
            </div>
        )}
    </div>
);

const KYCVerification = () => {
    const [openFAQ, setOpenFAQ] = useState(0);

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">

            {/* Header Section */}
            <div>
                <h1 className="text-2xl font-bold text-[#1e2a4a] flex items-center gap-3">
                    KYC Verification
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full border border-yellow-200">
                        Under Review
                    </span>
                </h1>

                {/* Overall Progress */}
                <div className="mt-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-end mb-2">
                        <span className="font-bold text-gray-700">Overall Progress</span>
                        <span className="font-bold text-primary">60%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3">
                        <div className="bg-[#f59e0b] h-3 rounded-full transition-all duration-1000" style={{ width: '60%' }}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">3 of 5 documents uploaded</p>
                </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex gap-4">
                <FaInfoCircle className="text-blue-500 text-xl shrink-0 mt-0.5" />
                <div>
                    <h4 className="font-bold text-blue-900 mb-1">Why KYC is Required</h4>
                    <p className="text-sm text-blue-800 leading-relaxed">
                        Complete KYC verification to unlock access to all benefit applications including scholarships, health assistance, and legal aid.
                    </p>
                    <p className="text-xs text-blue-600 mt-2">Accepted file formats: JPG, PNG, PDF (Max 5MB per file)</p>
                </div>
            </div>

            {/* Documents Section */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Personal Identity Documents</h3>

                <DocumentItem
                    title="Aadhar Card - Front Side"
                    isRequired={true}
                    status="Uploaded"
                    savedFile="aadhar_front_scan.jpg"
                />
                <DocumentItem
                    title="Aadhar Card - Back Side"
                    isRequired={true}
                    status="Uploaded"
                    savedFile="aadhar_back_scan.jpg"
                />
                <DocumentItem
                    title="Community Certificate"
                    isRequired={true}
                    status="Uploaded"
                    savedFile="community_cert_v2.pdf"
                />

                {/* Live Photo Special Case */}
                <div className="border border-dashed border-gray-300 bg-gray-50 rounded-lg p-6 mb-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h4 className="font-bold text-gray-800">Live Photo Verification</h4>
                            <span className="text-xs text-red-500 font-semibold">(Required)</span>
                            <p className="text-xs text-gray-500 mt-1">Ensure clear face visibility, good lighting</p>
                        </div>
                        <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs font-bold rounded-full flex items-center gap-1">
                            <FaClock /> Pending
                        </span>
                    </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 flex flex-col items-center justify-center bg-white relative">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-primary mb-4">
                            <FaCamera size={24} />
                        </div>
                        <h5 className="font-bold text-gray-700 mb-2">Capture Live Photo</h5>
                        <p className="text-xs text-gray-500 mb-6">Take a selfie or upload a recent photo</p>
                        <div className="flex gap-3">
                            <button className="px-4 py-2 bg-[#1e2a4a] text-white text-sm font-bold rounded-lg hover:bg-[#2a3b66] transition flex items-center gap-2">
                                <FaCamera /> Capture from Webcam
                            </button>
                            <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-50 transition flex items-center gap-2">
                                <FaCloudUploadAlt /> Upload Photo
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bank Verification */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Bank Account Verification</h3>
                <DocumentItem
                    title="Bank Passbook or Cancelled Cheque"
                    isRequired={true}
                    status="Pending"
                />
            </div>

            {/* Verification Progress Timeline */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Verification Progress</h3>
                <div className="relative pl-4 space-y-8 before:absolute before:left-[23px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                    <div className="relative flex items-center gap-4">
                        <div className="w-5 h-5 rounded-full bg-green-500 z-10 box-content border-4 border-white"></div>
                        <div>
                            <h4 className="font-bold text-gray-800 text-sm">Uploaded</h4>
                            <p className="text-xs text-gray-500">Jan 15, 2025 at 2:30 PM</p>
                        </div>
                    </div>
                    <div className="relative flex items-center gap-4">
                        <div className="w-5 h-5 rounded-full bg-[#f59e0b] z-10 box-content border-4 border-white"></div>
                        <div>
                            <h4 className="font-bold text-gray-800 text-sm">Under Review</h4>
                            <p className="text-xs text-gray-500">Expected by Jan 20, 2025</p>
                        </div>
                    </div>
                    <div className="relative flex items-center gap-4 opacity-50">
                        <div className="w-5 h-5 rounded-full bg-gray-300 z-10 box-content border-4 border-white"></div>
                        <div>
                            <h4 className="font-bold text-gray-800 text-sm">Approved</h4>
                            <p className="text-xs text-gray-500">Pending verification completion</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <button className="text-red-500 font-bold text-sm hover:underline">Cancel</button>
                <div className="flex gap-4">
                    <button className="px-6 py-2.5 border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition">
                        Save Draft
                    </button>
                    <button className="px-6 py-2.5 bg-gray-200 text-gray-400 font-bold rounded-lg cursor-not-allowed">
                        Submit for Verification
                    </button>
                </div>
            </div>

            {/* FAQ Section */}
            <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Frequently Asked Questions</h3>
                <FAQItem
                    question="What documents are required for KYC?"
                    isOpen={openFAQ === 0}
                    onClick={() => setOpenFAQ(openFAQ === 0 ? -1 : 0)}
                />
                <FAQItem
                    question="How long does verification take?"
                    isOpen={openFAQ === 1}
                    onClick={() => setOpenFAQ(openFAQ === 1 ? -1 : 1)}
                />
                <FAQItem
                    question="What if my documents are rejected?"
                    isOpen={openFAQ === 2}
                    onClick={() => setOpenFAQ(openFAQ === 2 ? -1 : 2)}
                />
                <FAQItem
                    question="Is my data secure?"
                    isOpen={openFAQ === 3}
                    onClick={() => setOpenFAQ(openFAQ === 3 ? -1 : 3)}
                />
            </div>

            <div className="flex items-center gap-2 text-primary font-bold text-sm cursor-pointer hover:underline">
                <FaCommentDots /> Need Help? Start Live Chat
            </div>

        </div>
    );
};

export default KYCVerification;
