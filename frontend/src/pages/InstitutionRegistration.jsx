import React, { useState, useEffect } from 'react';
import { getPincode } from '../utils/pincodeData';
import API from '../api';
import { Link, useNavigate } from 'react-router-dom';
import {
    FaHeartbeat, FaMicroscope, FaTint, FaSchool, FaGraduationCap, FaUniversity,
    FaBook, FaPills, FaEllipsisH, FaMapMarkerAlt, FaUpload, FaCheck, FaTimes, FaArrowLeft,
    FaFileAlt, FaCheckCircle
} from 'react-icons/fa';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import DashboardHeader from '../components/common/DashboardHeader';

const TypeCard = ({ icon: Icon, label, selected, onClick, color }) => (
    <div
        onClick={onClick}
        className={`flex flex-col items-center justify-center p-6 rounded-2xl border cursor-pointer transition-all duration-300 group ${selected
            ? 'border-blue-500 bg-blue-50/50 shadow-md ring-1 ring-blue-500'
            : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-lg hover:-translate-y-1'
            }`}
    >
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 ${selected ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : `bg-slate-50 ${color} group-hover:scale-110`}`}>
            <Icon size={24} />
        </div>
        <span className={`text-sm font-bold text-center ${selected ? 'text-blue-700' : 'text-slate-600 group-hover:text-slate-800'}`}>{label}</span>
        {selected && (
            <div className="absolute top-3 right-3 text-blue-500 bg-white rounded-full p-1 shadow-sm">
                <FaCheckCircle size={16} />
            </div>
        )}
    </div>
);

const FormInput = ({ label, placeholder, required, value, onChange }) => (
    <div className="flex-1">
        <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            type="text"
            placeholder={placeholder}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-white font-medium text-slate-700"
            value={value}
            onChange={onChange}
        />
    </div>
);

const InstitutionRegistration = () => {
    const navigate = useNavigate();
    const [selectedType, setSelectedType] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const fileInputRef = React.useRef(null);
    const [formData, setFormData] = useState({
        name: '',
        ownerName: '',
        mobileNumber: '',
        whatsappNumber: '',
        mewsDiscountPercentage: '',
        district: '',
        mandal: '',
        village: '',
        pincode: '',
        houseNo: '',
        street: '',
        landmark: '',
        googleMapsLink: ''
    });



    // Location State
    const [districts, setDistricts] = useState([]);
    const [mandals, setMandals] = useState([]);
    const [villages, setVillages] = useState([]);

    // Fetch Districts
    useEffect(() => {
        const fetchDistricts = async () => {
            try {
                const { data: states } = await API.get('/locations?type=STATE');
                const telangana = states.find(s => s.name === 'Telangana');
                if (telangana) {
                    const { data } = await API.get(`/locations?parent=${telangana._id}`);
                    setDistricts(data);
                } else if (states.length > 0) {
                    const { data } = await API.get(`/locations?parent=${states[0]._id}`);
                    setDistricts(data);
                }
            } catch (error) {
                console.error("Error fetching districts", error);
            }
        };
        fetchDistricts();
    }, []);

    // Handlers
    const handleDistrictChange = async (e) => {
        const districtId = e.target.value;
        setFormData(prev => ({ ...prev, district: districtId, mandal: '', village: '', pincode: '' }));
        setMandals([]);
        setVillages([]);

        if (districtId) {
            try {
                const { data } = await API.get(`/locations?parent=${districtId}`);
                setMandals(data);
            } catch (err) { console.error("Error fetching mandals", err); }
        }
    };

    const handleMandalChange = async (e) => {
        const mandalId = e.target.value;
        setFormData(prev => ({ ...prev, mandal: mandalId, village: '', pincode: '' }));
        setVillages([]);

        if (mandalId) {
            try {
                const { data } = await API.get(`/locations?parent=${mandalId}`);
                setVillages(data);
            } catch (err) { console.error("Error fetching villages", err); }
        }
    }


    const handleVillageChange = (e) => {
        const villageId = e.target.value;
        const village = villages.find(v => v._id === villageId);

        // Auto-fill Pincode
        let code = village?.pincode || '';

        console.log(`[Debug] Selected Village: ${village?.name} (ID: ${villageId})`);

        if (!code && village && formData.district && formData.mandal) {
            const dist = districts.find(d => d._id === formData.district);
            const mand = mandals.find(m => m._id === formData.mandal);

            console.log(`[Debug] Lookup Params - District: ${dist?.name}, Mandal: ${mand?.name}, Village: ${village.name}`);

            if (dist && mand) {
                code = getPincode(dist.name, mand.name, village.name);
                console.log(`[Debug] Result from getPincode: ${code}`);
            }
        }

        setFormData(prev => ({
            ...prev,
            village: villageId,
            pincode: code || prev.pincode
        }));
    };

    // Handle Submit
    const handleSubmit = async () => {
        try {
            if (!selectedType || !formData.name) return alert('Please key in all required fields');

            // Resolve location names for full address
            const distName = districts.find(d => d._id === formData.district)?.name || '';
            const mandName = mandals.find(m => m._id === formData.mandal)?.name || '';
            const villName = villages.find(v => v._id === formData.village)?.name || '';

            const fullAddress = `${formData.houseNo}, ${formData.street}, ${formData.landmark}, ${villName}, ${mandName}, ${distName} - ${formData.pincode}`;

            const payload = {
                ...formData,
                type: selectedType,
                fullAddress: fullAddress,
                // servicesOffered: [] // map services checkboxes later
            };

            await API.post('/institutions', payload);
            alert('Institution Registered Successfully');
            navigate('/admin/institutions');
        } catch (error) {
            alert('Error: ' + error.message);
        }
    };

    const institutionTypes = [
        { id: 'bloodbank', label: 'Blood Bank', icon: FaTint, color: 'text-red-600' },
        { id: 'college', label: 'College', icon: FaGraduationCap, color: 'text-indigo-500' },
        { id: 'diagnostic', label: 'Diagnostic Center', icon: FaMicroscope, color: 'text-blue-500' },
        { id: 'hospital', label: 'Hospital', icon: FaHeartbeat, color: 'text-red-500' },
        { id: 'other', label: 'Other', icon: FaEllipsisH, color: 'text-slate-500' },
        { id: 'pharmacy', label: 'Pharmacy', icon: FaPills, color: 'text-emerald-500' },
        { id: 'school', label: 'School', icon: FaSchool, color: 'text-green-500' },
        { id: 'training', label: 'Training Institute', icon: FaBook, color: 'text-orange-500' },
        { id: 'university', label: 'University', icon: FaUniversity, color: 'text-purple-600' },
    ];

    const services = [
        "Diagnostic Imaging", "Emergency Care", "General Consultation", "Inpatient Services", "Laboratory Services",
        "Pharmacy Services", "Specialist Consultation", "Vaccination Center"
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
        const validFiles = Array.from(files).filter(file => {
            if (file.size > 5242880) {
                alert(`File ${file.name} exceeds 5 MB Limit and will not be uploaded.`);
                return false;
            }
            return true;
        });

        const newFiles = validFiles.map(file => Object.assign(file, {
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
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
            <AdminHeader />

            <div className="flex flex-1 overflow-hidden">
                <AdminSidebar activePage="register-institution" />

                <main className="flex-1 overflow-y-auto">
                    <DashboardHeader
                        title="Add New Institution"
                        subtitle="Register a new educational or welfare institution to the network."
                        breadcrumb={
                            <>
                                <Link to="/admin/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
                                <span className="opacity-70">&gt;</span>
                                <Link to="/admin/institutions" className="hover:text-white transition-colors">Institutions</Link>
                                <span className="opacity-70">&gt;</span>
                                <span>Register</span>
                            </>
                        }
                    >
                        <Link to="/admin/institutions" className="bg-white bg-opacity-10 hover:bg-opacity-20 backdrop-blur-md text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all border border-white/20">
                            <FaArrowLeft /> Back to List
                        </Link>
                    </DashboardHeader>

                    <div className="max-w-full px-4 pb-12 -mt-10">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 mb-8">

                            {/* Section 1: Select Type */}
                            <div className="mb-10">
                                <h2 className="text-lg font-bold text-slate-800 mb-6 border-b pb-2">Select Institution Type</h2>
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
                                <h2 className="text-lg font-bold text-slate-800 mb-6 border-b pb-2">Institution Details</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <FormInput label="Institution Name" required
                                        value={formData.name || ''}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />

                                    {/* Location Dropdowns */}
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                                            District <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={formData.district}
                                            onChange={handleDistrictChange}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-white font-medium text-slate-700 appearance-none"
                                        >
                                            <option value="">Select District</option>
                                            {districts.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                                            Mandal <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={formData.mandal}
                                            onChange={handleMandalChange}
                                            disabled={!formData.district}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-white font-medium text-slate-700 appearance-none disabled:bg-slate-50 disabled:text-slate-400"
                                        >
                                            <option value="">Select Mandal</option>
                                            {mandals.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                                            Village <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={formData.village}
                                            onChange={handleVillageChange}
                                            disabled={!formData.mandal}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-white font-medium text-slate-700 appearance-none disabled:bg-slate-50 disabled:text-slate-400"
                                        >
                                            <option value="">Select Village</option>
                                            {villages.map(v => <option key={v._id} value={v._id}>{v.name}</option>)}
                                        </select>
                                    </div>

                                    <div>
                                        <FormInput
                                            label="Pincode"
                                            required
                                            value={formData.pincode}
                                            onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                                            placeholder="Auto-filled"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                                            House No / Street
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.houseNo}
                                            onChange={(e) => setFormData({ ...formData, houseNo: e.target.value })}
                                            placeholder="H.No 1-23, Main Street"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-white font-medium text-slate-700"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                                            Landmark
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.landmark}
                                            onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                                            placeholder="Near School / Temple"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-white font-medium text-slate-700"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <FormInput label="Owner/Administrator" required
                                        value={formData.ownerName || ''}
                                        onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                                    />

                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Google Maps Pin</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={formData.googleMapsLink || ''}
                                                onChange={(e) => setFormData({ ...formData, googleMapsLink: e.target.value })}
                                                placeholder="Paste Google Maps link or search location"
                                                className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-white font-medium text-slate-700"
                                            />
                                            <button className="absolute right-1.5 top-1.5 h-9 w-9 bg-[#1e2a4a] text-white rounded-lg flex items-center justify-center hover:bg-[#2a3b66] transition">
                                                <FaMapMarkerAlt size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                    <FormInput label="Mobile Number" required
                                        value={formData.mobileNumber || ''}
                                        onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                                    />
                                    <FormInput label="WhatsApp Number"
                                        value={formData.whatsappNumber || ''}
                                        onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                                    />
                                    <FormInput label="MEWS Member Discount (%)"
                                        value={formData.mewsDiscountPercentage || ''}
                                        onChange={(e) => setFormData({ ...formData, mewsDiscountPercentage: e.target.value })}
                                    />
                                </div>

                                {/* Services Checkboxes */}
                                <div className="mb-8">
                                    <label className="block text-xs font-bold text-slate-700 mb-3 uppercase tracking-wide">Services Offered</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                        {services.map((service, idx) => (
                                            <label key={idx} className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition select-none">
                                                <div className="w-5 h-5 rounded border border-slate-300 flex items-center justify-center bg-white peer-checked:bg-blue-600 flex-shrink-0">
                                                    <input type="checkbox" className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer accent-blue-600" />
                                                </div>
                                                <span className="text-sm text-slate-600 font-bold">{service}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Photo Upload */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-3 uppercase tracking-wide">Institution Photos</label>
                                    <input
                                        type="file"
                                        multiple
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={handleFileSelect}
                                        accept="image/*"
                                    />
                                    <div
                                        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 group cursor-pointer ${dragActive ? 'border-blue-500 bg-blue-50 scale-[1.01]' : 'border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/30'}`}
                                        onDragEnter={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDragOver={handleDrag}
                                        onDrop={handleDrop}
                                        onClick={triggerFileInput}
                                    >
                                        <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 text-blue-600 group-hover:scale-110 transition-transform shadow-sm">
                                            <FaUpload size={20} />
                                        </div>
                                        <h3 className="text-sm font-bold text-slate-900">Upload Photos</h3>
                                        <p className="text-xs text-slate-500 mt-1">Drag & drop your files here or <span className="text-blue-600 underline font-bold">browse</span></p>
                                        <p className="text-[10px] text-slate-400 font-bold mt-3 bg-white inline-block px-3 py-1 rounded-full border border-slate-200 shadow-sm">Supports: JPG, PNG, WEBP (Max 5MB)</p>
                                    </div>

                                    {/* Dynamic File Previews */}
                                    {uploadedFiles.length > 0 && (
                                        <div className="flex flex-wrap gap-4 mt-6">
                                            {uploadedFiles.map((file, index) => (
                                                <div key={index} className="relative w-24 h-24 rounded-xl overflow-hidden group shadow-md border border-slate-200">
                                                    <img src={file.preview} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                                                    <button
                                                        onClick={() => removeFile(file)}
                                                        className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition shadow-lg hover:scale-110"
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
                            <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-slate-100 gap-4">
                                <button className="text-slate-500 font-bold text-sm hover:text-slate-700 flex items-center gap-2 px-4 py-2 hover:bg-slate-50 rounded-lg transition">
                                    <FaFileAlt size={14} /> Save as Draft
                                </button>
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <button onClick={() => navigate(-1)} className="flex-1 sm:flex-none px-6 py-3 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 text-sm transition shadow-sm">
                                        Cancel
                                    </button>
                                    <button onClick={handleSubmit} className="flex-1 sm:flex-none px-8 py-3 bg-[#1e2a4a] text-white font-bold rounded-xl hover:bg-[#2a3b66] text-sm transition shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 transform active:scale-95">
                                        <FaCheck size={14} /> Submit Institution
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div >
                </main >
            </div >
        </div >
    );
};

export default InstitutionRegistration;
