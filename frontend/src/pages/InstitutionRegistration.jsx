import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    FaThLarge, FaUsers, FaBuilding, FaExclamationTriangle, FaFileAlt,
    FaHandHoldingUsd, FaChartLine, FaCog, FaQuestionCircle, FaBullhorn,
    FaSignOutAlt, FaSearch, FaBell, FaChevronDown, FaShieldAlt,
    FaHeartbeat, FaMicroscope, FaTint, FaSchool, FaGraduationCap, FaUniversity,
    FaBook, FaPills, FaEllipsisH, FaMapMarkerAlt, FaUpload, FaCheck, FaTimes, FaArrowLeft
} from 'react-icons/fa';

// Reusing Sidebar from other admin pages for consistency
const SidebarItem = ({ icon: Icon, label, active, to }) => (
    <Link to={to || '#'} className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors mb-1 ${active ? 'bg-[#1e2a4a] text-white font-bold' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 font-medium'}`}>
        <Icon size={18} className={active ? 'text-white' : 'text-gray-400'} />
        <span className="text-sm">{label}</span>
    </Link>
);

const TypeCard = ({ icon: Icon, label, selected, onClick, color }) => (
    <div
        onClick={onClick}
        className={`flex flex-col items-center justify-center p-6 rounded-xl border cursor-pointer transition-all duration-300 ${selected
            ? 'border-blue-500 bg-blue-50 shadow-md transform scale-[1.02]'
            : 'border-gray-100 bg-white hover:border-blue-200 hover:shadow-sm'
            }`}
    >
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors ${selected ? 'bg-blue-500 text-white' : `bg-gray-50 ${color}`}`}>
            <Icon size={24} />
        </div>
        <span className={`text-sm font-bold ${selected ? 'text-blue-700' : 'text-gray-600'}`}>{label}</span>
        {selected && (
            <div className="absolute top-3 right-3 text-blue-500">
                <FaCheck size={16} />
            </div>
        )}
    </div>
);

const FormInput = ({ label, placeholder, required }) => (
    <div className="flex-1">
        <label className="block text-xs font-bold text-gray-700 mb-1.5">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            type="text"
            placeholder={placeholder}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-white"
        />
    </div>
);

const InstitutionRegistration = () => {
    const navigate = useNavigate();
    const [selectedType, setSelectedType] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const fileInputRef = React.useRef(null);

    const institutionTypes = [
        { id: 'hospital', label: 'Hospital', icon: FaHeartbeat, color: 'text-red-500' },
        { id: 'diagnostic', label: 'Diagnostic Center', icon: FaMicroscope, color: 'text-blue-500' },
        { id: 'bloodbank', label: 'Blood Bank', icon: FaTint, color: 'text-red-600' },
        { id: 'school', label: 'School', icon: FaSchool, color: 'text-green-500' },
        { id: 'college', label: 'College', icon: FaGraduationCap, color: 'text-indigo-500' },
        { id: 'university', label: 'University', icon: FaUniversity, color: 'text-purple-600' },
        { id: 'training', label: 'Training Institute', icon: FaBook, color: 'text-orange-500' },
        { id: 'pharmacy', label: 'Pharmacy', icon: FaPills, color: 'text-emerald-500' },
        { id: 'other', label: 'Other', icon: FaEllipsisH, color: 'text-gray-500' },
    ];

    const services = [
        "Emergency Care", "General Consultation", "Laboratory Services", "Diagnostic Imaging",
        "Pharmacy Services", "Specialist Consultation", "Inpatient Services", "Vaccination Center"
    ];

    // Drag and drop handlers
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFiles(e.target.files);
        }
    };

    const handleFiles = (files) => {
        const newFiles = Array.from(files).map(file => Object.assign(file, {
            preview: URL.createObjectURL(file)
        }));
        setUploadedFiles(prev => [...prev, ...newFiles]);
    };

    const removeFile = (fileToRemove) => {
        setUploadedFiles(files => files.filter(file => file !== fileToRemove));
        URL.revokeObjectURL(fileToRemove.preview);
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    return (
        <div className="min-h-screen bg-[#f3f4f6] font-sans flex flex-col">
            {/* Top Header */}
            <header className="bg-[#0f172a] text-white h-16 flex items-center justify-between px-4 z-20 shadow-md flex-shrink-0">
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
                {/* Sidebar */}
                <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col overflow-y-auto">
                    <div className="p-4 space-y-1">
                        <SidebarItem to="/admin/dashboard" icon={FaThLarge} label="Village Dashboard" />
                        <SidebarItem to="/admin/members" icon={FaUsers} label="Member Management" />
                        <SidebarItem to="/admin/institutions" icon={FaBuilding} label="Institution Management" active={true} />
                        <SidebarItem to="/admin/sos" icon={FaExclamationTriangle} label="SOS Management" />
                        <SidebarItem icon={FaFileAlt} label="Reports & Analytics" />
                        <SidebarItem icon={FaHandHoldingUsd} label="Funding Requests" />
                        <SidebarItem icon={FaChartLine} label="Activity Logs" />
                        <SidebarItem icon={FaCog} label="Village Settings" />
                        <SidebarItem icon={FaQuestionCircle} label="Help & Support" />
                        <SidebarItem icon={FaBullhorn} label="Announcements" />
                    </div>
                    <div className="mt-auto p-4 border-t border-gray-100">
                        <Link to="/admin/login" className="flex items-center gap-3 px-4 py-2 text-red-600 cursor-pointer hover:bg-red-50 rounded-lg transition-colors font-medium text-sm">
                            <FaSignOutAlt />
                            <span>Logout</span>
                        </Link>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#f8fafc]">

                    {/* Page Header with Back Button */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
                                <FaArrowLeft />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Add New Institution</h1>
                                <p className="text-sm text-gray-500 mt-1">Register a new institution in Peddakaparthy village</p>
                            </div>
                        </div>
                        <button className="flex items-center gap-2 text-blue-600 text-sm font-bold hover:text-blue-800 transition">
                            <FaQuestionCircle /> Need Help?
                        </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8">

                        {/* Section 1: Select Type */}
                        <div className="mb-10">
                            <h2 className="text-lg font-bold text-gray-800 mb-6">Select Institution Type</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {institutionTypes.map((type) => (
                                    <TypeCard
                                        key={type.id}
                                        icon={type.icon}
                                        label={type.label}
                                        color={type.color}
                                        selected={selectedType === type.id}
                                        onClick={() => setSelectedType(type.id)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Section 2: Details Form */}
                        <div className="mb-10">
                            <h2 className="text-lg font-bold text-gray-800 mb-6">Institution Details</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <FormInput label="Institution Name" placeholder="Enter institution name" required />

                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                        Full Address <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        rows="1"
                                        placeholder="Enter complete address"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-white resize-none h-[46px]"
                                    ></textarea>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <FormInput label="Owner/Administrator" placeholder="Enter owner or administrator name" required />

                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Google Maps Pin</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Paste Google Maps link or search location"
                                            className="w-full pl-4 pr-12 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-white"
                                        />
                                        <button className="absolute right-1 top-1 h-9 w-9 bg-[#1e2a4a] text-white rounded-md flex items-center justify-center hover:bg-[#2a3b66] transition">
                                            <FaMapMarkerAlt size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <FormInput label="Mobile Number" placeholder="Enter mobile number" required />
                                <FormInput label="WhatsApp Number" placeholder="Enter WhatsApp number (optional)" />
                                <FormInput label="MEWS Member Discount (%)" placeholder="Enter discount percentage" />
                            </div>

                            {/* Services Checkboxes */}
                            <div className="mb-8">
                                <label className="block text-xs font-bold text-gray-700 mb-3">Services Offered</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                    {services.map((service, idx) => (
                                        <label key={idx} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                                            <div className="w-5 h-5 rounded border border-gray-300 flex items-center justify-center bg-white group-checked:bg-blue-500 flex-shrink-0">
                                                <input type="checkbox" className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer accent-blue-600" />
                                            </div>
                                            <span className="text-sm text-gray-600 font-medium">{service}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Photo Upload */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-3">Institution Photos</label>
                                <input
                                    type="file"
                                    multiple
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    accept="image/*"
                                />
                                <div
                                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 group cursor-pointer ${dragActive ? 'border-blue-500 bg-blue-50 scale-[1.01]' : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-gray-50'}`}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                    onClick={triggerFileInput}
                                >
                                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3 text-blue-600 group-hover:scale-110 transition-transform">
                                        <FaUpload size={20} />
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-900">Upload Photos</h3>
                                    <p className="text-xs text-gray-500 mt-1">Drag & drop your files here or <span className="text-blue-600 underline">browse</span></p>
                                    <p className="text-[10px] text-gray-400 font-medium mt-2 bg-gray-50 inline-block px-3 py-1 rounded-full border border-gray-100">Supports: JPG, PNG, WEBP (Max 5MB)</p>
                                </div>

                                {/* Dynamic File Previews */}
                                {uploadedFiles.length > 0 && (
                                    <div className="flex flex-wrap gap-4 mt-6">
                                        {uploadedFiles.map((file, index) => (
                                            <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden group shadow-sm border border-gray-200">
                                                <img src={file.preview} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                                                <button
                                                    onClick={() => removeFile(file)}
                                                    className="absolute top-1 right-1 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition shadow-lg hover:bg-red-600"
                                                >
                                                    <FaTimes />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-gray-100 gap-4">
                            <button className="text-gray-500 font-bold text-sm hover:text-gray-700 flex items-center gap-2">
                                <FaFileAlt size={14} /> Save as Draft
                            </button>
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <button onClick={() => navigate(-1)} className="flex-1 sm:flex-none px-6 py-2.5 border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 text-sm transition">
                                    Cancel
                                </button>
                                <button className="flex-1 sm:flex-none px-6 py-2.5 bg-[#1e2a4a] text-white font-bold rounded-lg hover:bg-[#2a3b66] text-sm transition shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2">
                                    <FaCheck size={12} /> Submit Institution
                                </button>
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
};

export default InstitutionRegistration;
