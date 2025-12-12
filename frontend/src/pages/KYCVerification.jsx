import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    FaInfoCircle, FaCheckCircle, FaClock, FaCamera, FaCloudUploadAlt,
    FaChevronDown, FaChevronUp, FaCommentDots
} from 'react-icons/fa';
import FileUploader from '../components/FileUploader';
import LivePhotoCapture from '../components/LivePhotoCapture';

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

    // State to track upload status of each required document
    const [documents, setDocuments] = useState({
        'Aadhar Card - Front Side': false,
        'Aadhar Card - Back Side': false,
        'Community Certificate': false,
        'Live Photo': false,
        'Bank Passbook or Cancelled Cheque': false
    });

    // Calculate progress
    const totalDocs = Object.keys(documents).length;
    const uploadedDocs = Object.values(documents).filter(Boolean).length;
    const progress = Math.round((uploadedDocs / totalDocs) * 100);

    const handleUploadStatusChange = (title, isUploaded) => {
        setDocuments(prev => ({
            ...prev,
            [title]: isUploaded
        }));
    };

    return (
        <div className="w-full space-y-8 pb-12">

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
                        <span className="font-bold text-primary">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3">
                        <div
                            className="bg-[#f59e0b] h-3 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{uploadedDocs} of {totalDocs} documents uploaded</p>
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

                <FileUploader
                    title="Aadhar Card - Front Side"
                    isRequired={true}
                    onUploadStatusChange={handleUploadStatusChange}
                />
                <FileUploader
                    title="Aadhar Card - Back Side"
                    isRequired={true}
                    onUploadStatusChange={handleUploadStatusChange}
                />
                <FileUploader
                    title="Community Certificate"
                    isRequired={true}
                    onUploadStatusChange={handleUploadStatusChange}
                />

                {/* Live Photo Section */}
                <LivePhotoCapture
                    isRequired={true}
                    onCapture={(img) => handleUploadStatusChange('Live Photo', !!img)}
                    onUpload={(file) => handleUploadStatusChange('Live Photo', !!file)}
                />

            </div>

            {/* Bank Verification */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Bank Account Verification</h3>
                <FileUploader
                    title="Bank Passbook or Cancelled Cheque"
                    isRequired={true}
                    onUploadStatusChange={handleUploadStatusChange}
                />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <button className="text-red-500 font-bold text-sm hover:underline">Cancel</button>
                <div className="flex gap-4">
                    <button className="px-6 py-2.5 border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition">
                        Save Draft
                    </button>
                    <Link
                        to={progress === 100 ? "/dashboard/kyc/success" : "#"}
                        onClick={(e) => {
                            if (progress < 100) {
                                e.preventDefault();
                                alert("Please upload all required documents (including Live Photo) to proceed.");
                            }
                        }}
                        className={`px-6 py-2.5 font-bold rounded-lg transition shadow-md ${progress === 100
                                ? 'bg-[#1e2a4a] text-white hover:bg-[#2a3b66]'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        Submit for Verification
                    </Link>
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
