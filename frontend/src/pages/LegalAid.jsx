import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import FileUploader from '../components/FileUploader';
import {
    FaBalanceScale, FaLandmark, FaBriefcase, FaUsers, FaQuestionCircle,
    FaCloudUploadAlt, FaPaperclip, FaChevronRight, FaSave, FaInfoCircle, FaPhoneAlt, FaComments, FaChevronLeft
} from 'react-icons/fa';

const StepIndicator = ({ step, title, subtext, currentStep }) => {
    const isCompleted = step < currentStep;
    const isCurrent = step === currentStep;

    return (
        <div className="flex items-center flex-1 last:flex-none relative">
            <div className="flex items-center z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors
                    ${isCompleted ? 'bg-primary border-primary text-white' :
                        isCurrent ? 'bg-[#1e2a4a] border-[#1e2a4a] text-white' :
                            'bg-white border-gray-300 text-gray-400'}`}>
                    {step}
                </div>
                <div className="ml-3 hidden lg:block">
                    <div className={`text-xs font-bold uppercase tracking-wide ${isCurrent ? 'text-[#1e2a4a]' : 'text-gray-500'}`}>{title}</div>
                    <div className="text-[10px] text-gray-400">{subtext}</div>
                </div>
            </div>
            {step < 3 && (
                <div className="flex-1 h-0.5 mx-4 bg-gray-200 hidden md:block">
                    <div className={`h-full bg-primary transition-all duration-500 ${isCompleted ? 'w-full' : 'w-0'}`}></div>
                </div>
            )}
        </div>
    );
};

const CaseTypeCard = ({ icon: Icon, title, description, selected, onClick, colorClass }) => (
    <div
        onClick={onClick}
        className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer h-full box-border
        ${selected
                ? 'border-primary bg-blue-50 ring-1 ring-primary'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'}`}
    >
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${selected ? 'bg-primary text-white' : `bg-gray-100 ${colorClass}`}`}>
            <Icon size={18} />
        </div>
        <div>
            <h3 className={`font-bold text-sm ${selected ? 'text-primary' : 'text-gray-800'}`}>{title}</h3>
            <p className="text-xs text-gray-500">{description}</p>
        </div>
        <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
            ${selected ? 'border-primary' : 'border-gray-300'}`}>
            {selected && <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>}
        </div>
    </div>
);

const LegalAid = () => {
    const [caseType, setCaseType] = useState('revenue');
    const [description, setDescription] = useState('');

    return (
        <div className="w-full pb-12 space-y-8">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <Link to="/dashboard/services" className="flex items-center gap-2 text-secondary hover:text-amber-600 text-sm font-bold mb-2 transition">
                        <FaArrowLeft size={10} /> Back to MEWS Services
                    </Link>
                    <h1 className="text-2xl font-bold text-[#1e2a4a]">Legal Aid Application</h1>
                    <p className="text-gray-500 text-sm mt-1">Fill out the form below to apply for legal assistance</p>
                </div>
                <button className="px-4 py-2 bg-[#1e2a4a] text-white text-sm font-bold rounded-lg flex items-center gap-2 hover:bg-[#2a3b66] transition">
                    <FaSave /> Save Draft
                </button>
            </div>

            {/* Steps */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex justify-between px-12">
                <StepIndicator step={1} currentStep={1} title="Case Details" subtext="Case type and description" />
                <StepIndicator step={2} currentStep={1} title="Documents" subtext="Upload required files" />
                <StepIndicator step={3} currentStep={1} title="Review" subtext="Confirm and submit" />
            </div>

            {/* Main Form */}
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm space-y-8">

                {/* Case Type Section */}
                <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-4">Case Type <span className="text-red-500">*</span></h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <CaseTypeCard
                            icon={FaLandmark}
                            title="Revenue"
                            description="Tax, land, property disputes"
                            colorClass="text-blue-500"
                            selected={caseType === 'revenue'}
                            onClick={() => setCaseType('revenue')}
                        />
                        <CaseTypeCard
                            icon={FaBalanceScale}
                            title="Crime"
                            description="Criminal law matters"
                            colorClass="text-red-500"
                            selected={caseType === 'crime'}
                            onClick={() => setCaseType('crime')}
                        />
                        <CaseTypeCard
                            icon={FaBriefcase}
                            title="Service"
                            description="Employment, service matters"
                            colorClass="text-purple-500"
                            selected={caseType === 'service'}
                            onClick={() => setCaseType('service')}
                        />
                        <CaseTypeCard
                            icon={FaUsers}
                            title="Family"
                            description="Marriage, divorce, custody"
                            colorClass="text-green-500"
                            selected={caseType === 'family'}
                            onClick={() => setCaseType('family')}
                        />
                        <CaseTypeCard
                            icon={FaQuestionCircle}
                            title="Others"
                            description="Other legal matters not listed above"
                            colorClass="text-yellow-500"
                            selected={caseType === 'others'}
                            onClick={() => setCaseType('others')}
                        />
                    </div>
                </div>

                {/* Case Description */}
                <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-2">Case Description <span className="text-red-500">*</span></h3>
                    <textarea
                        rows="5"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Please provide detailed description of your case, including background, current situation, and what kind of legal assistance you need..."
                        className="w-full p-4 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none placeholder-gray-400"
                    ></textarea>
                    <div className="flex justify-between text-xs text-gray-400 mt-2">
                        <span>Minimum 50 characters required</span>
                        <span>{description.length}/2000</span>
                    </div>
                </div>

                {/* FIR Upload */}
                <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-2">FIR/Petition Document</h3>
                    <FileUploader
                        label="Upload FIR or Petition"
                        onUploadComplete={(file) => console.log('FIR Uploaded', file)}
                    />
                </div>

                {/* Location Preference */}
                <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-2">Preferred Lawyer Location</h3>
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary text-gray-700">
                        <option>Select location preference</option>
                        <option>Hyderabad</option>
                        <option>Warangal</option>
                        <option>Karimnagar</option>
                        <option>Any in District</option>
                    </select>
                    <p className="text-xs text-gray-400 mt-2">We'll try to match you with a lawyer in your preferred location</p>
                </div>

                {/* Supporting Docs */}
                <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-2">Additional Supporting Documents</h3>
                    <FileUploader
                        label="Upload Additional Documents (Optional)"
                        onUploadComplete={(file) => console.log('Supporting Doc Uploaded', file)}
                    />
                </div>

                {/* Form Navigation */}
                <div className="flex flex-col-reverse md:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-100">
                    <button className="text-primary font-bold text-sm hover:underline">
                        Save as Draft
                    </button>
                    <div className="flex gap-4 w-full md:w-auto">
                        <button className="flex-1 md:flex-none px-6 py-2.5 bg-white border border-gray-300 text-gray-400 text-sm font-bold rounded-lg cursor-not-allowed">
                            Previous
                        </button>
                        <button className="flex-1 md:flex-none px-6 py-2.5 bg-[#1e2a4a] text-white text-sm font-bold rounded-lg hover:bg-[#2a3b66] transition flex items-center justify-center gap-2 shadow-sm">
                            Next: Upload Documents <FaChevronRight size={12} />
                        </button>
                    </div>
                </div>

            </div>

            {/* Help Box */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex flex-col md:flex-row items-center gap-6">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                    <FaInfoCircle size={24} />
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h3 className="font-bold text-gray-900 mb-1">Need Help?</h3>
                    <p className="text-sm text-gray-600">If you're unsure about any information or need guidance on filling out this form, our support team is here to help.</p>
                </div>
                <div className="flex gap-4 text-xs font-bold text-blue-700">
                    <span className="flex items-center gap-1 cursor-pointer hover:underline"><FaPhoneAlt /> Call Support: 1800-MEWS-AID</span>
                    <span className="w-px h-4 bg-blue-200"></span>
                    <Link to="/dashboard/support" className="flex items-center gap-1 cursor-pointer hover:underline"><FaComments /> Live Chat</Link>
                    <span className="w-px h-4 bg-blue-200"></span>
                    <Link to="/dashboard/support" className="cursor-pointer hover:underline">FAQ</Link>
                </div>
            </div>

        </div>
    );
};

export default LegalAid;
