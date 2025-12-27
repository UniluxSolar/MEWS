import React, { useState } from 'react';
import { FaUser, FaUsers, FaChevronRight, FaArrowLeft, FaSave, FaHospital, FaFileMedical, FaCheckCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const StepIndicator = ({ step, title, subtext, currentStep }) => {
    const isCompleted = step < currentStep;
    const isCurrent = step === currentStep;

    return (
        <div className="flex items-center flex-1 last:flex-none relative">
            <div className="flex items-center z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors
                    ${isCompleted ? 'bg-green-500 border-green-500 text-white' :
                        isCurrent ? 'bg-[#1e2a4a] border-[#1e2a4a] text-white' :
                            'bg-white border-gray-300 text-gray-400'}`}>
                    {isCompleted ? <FaCheckCircle size={14} /> : step}
                </div>
                <div className="ml-3 hidden lg:block">
                    <div className={`text-xs font-bold uppercase tracking-wide ${isCurrent ? 'text-[#1e2a4a]' : 'text-gray-500'}`}>{title}</div>
                    <div className="text-[10px] text-gray-400 max-w-[120px]">{subtext}</div>
                </div>
            </div>
            {step < 4 && (
                <div className="flex-1 h-0.5 mx-4 bg-gray-200 hidden md:block">
                    <div className={`h-full bg-green-500 transition-all duration-500 ${isCompleted ? 'w-full' : 'w-0'}`}></div>
                </div>
            )}
        </div>
    );
};

const RadioCard = ({ icon: Icon, title, description, selected, onClick }) => (
    <div
        onClick={onClick}
        className={`flex-1 flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all
        ${selected
                ? 'border-primary bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'}`}
    >
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${selected ? 'bg-white text-primary' : 'bg-gray-100 text-gray-500'}`}>
            <Icon size={18} />
        </div>
        <div>
            <h3 className={`font-bold text-sm ${selected ? 'text-primary' : 'text-gray-800'}`}>{title}</h3>
            <p className="text-xs text-gray-500">{description}</p>
        </div>
        <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center
            ${selected ? 'border-primary' : 'border-gray-300'}`}>
            {selected && <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>}
        </div>
    </div>
);

const HealthAssistance = () => {
    const [patientType, setPatientType] = useState('myself');

    return (
        <div className="w-full pb-12">

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[#1e2a4a]">Health Assistance Application</h1>
                <p className="text-gray-500 text-sm mt-1">Complete all steps to submit your application for health assistance</p>
            </div>

            {/* Progress Bar */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-8">
                <div className="flex justify-between">
                    <StepIndicator step={1} currentStep={1} title="Patient Selection" subtext="Select patient and family details" />
                    <StepIndicator step={2} currentStep={1} title="Hospital & Treatment" subtext="Hospital and treatment information" />
                    <StepIndicator step={3} currentStep={1} title="Diagnosis & Documents" subtext="Medical diagnosis and reports" />
                    <StepIndicator step={4} currentStep={1} title="Review & Submit" subtext="Final review and submission" />
                </div>
                {/* Progress Line Mobile/Responsive fix needed if used widely, but hardcoded bar for now within component */}
            </div>

            {/* Form Container */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

                <div className="p-8 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Patient Selection</h2>
                    <p className="text-sm text-gray-500">Please select the patient for whom you are requesting health assistance and provide their details.</p>
                </div>

                <div className="p-8 space-y-8">

                    {/* Who is the patient */}
                    <div>
                        <label className="block text-xs font-bold text-gray-800 mb-3">Who is the patient?</label>
                        <div className="flex flex-col md:flex-row gap-4">
                            <RadioCard
                                icon={FaUser}
                                title="Myself"
                                description="I am the patient"
                                selected={patientType === 'myself'}
                                onClick={() => setPatientType('myself')}
                            />
                            <RadioCard
                                icon={FaUsers}
                                title="Family Member"
                                description="A family member is the patient"
                                selected={patientType === 'family'}
                                onClick={() => setPatientType('family')}
                            />
                        </div>
                    </div>

                    {/* Personal Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">Patient's Full Name</label>
                            <input type="text" placeholder="Enter patient's full name" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-1 focus:ring-primary focus:border-primary outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">Date of Birth</label>
                            <input type="date" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-1 focus:ring-primary focus:border-primary outline-none text-gray-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">Gender</label>
                            <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-1 focus:ring-primary focus:border-primary outline-none text-gray-500">
                                <option>Select gender</option>
                                <option>Male</option>
                                <option>Female</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">Relationship to Patient</label>
                            <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-1 focus:ring-primary focus:border-primary outline-none text-gray-500" disabled={patientType === 'myself'}>
                                <option>{patientType === 'myself' ? 'Self' : 'Select relationship'}</option>
                                <option>Parent</option>
                                <option>Spouse</option>
                                <option>Child</option>
                                <option>Sibling</option>
                            </select>
                        </div>
                    </div>

                    {/* Contact Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">Contact Number</label>
                            <input type="tel" placeholder="Enter contact number" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-1 focus:ring-primary focus:border-primary outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">Email Address</label>
                            <input type="email" placeholder="Enter email address" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-1 focus:ring-primary focus:border-primary outline-none" />
                        </div>
                    </div>

                    {/* Address */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">Address</label>
                        <textarea rows="3" placeholder="Enter complete address" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-1 focus:ring-primary focus:border-primary outline-none resize-none"></textarea>
                    </div>

                    {/* Emergency Contact */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 mb-4 pt-4 border-t border-gray-100">Emergency Contact Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">Emergency Contact Name</label>
                                <input type="text" placeholder="Enter emergency contact name" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-1 focus:ring-primary focus:border-primary outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">Emergency Contact Number</label>
                                <input type="tel" placeholder="Enter emergency contact number" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-1 focus:ring-primary focus:border-primary outline-none" />
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer Buttons */}
                <div className="p-6 bg-gray-50 border-t border-gray-200 flex flex-col-reverse md:flex-row justify-between gap-4">
                    <button className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2">
                        <FaArrowLeft /> Cancel
                    </button>
                    <div className="flex flex-col md:flex-row gap-4">
                        <button className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2">
                            <FaSave /> Save as Draft
                        </button>
                        <button className="px-6 py-2.5 bg-[#1e2a4a] text-white text-sm font-bold rounded-lg hover:bg-[#2a3b66] transition flex items-center justify-center gap-2 shadow-sm">
                            Continue to Hospital Details <FaChevronRight size={12} />
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default HealthAssistance;
