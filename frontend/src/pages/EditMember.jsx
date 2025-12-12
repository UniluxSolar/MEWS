import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
    FaArrowLeft, FaShieldAlt, FaSave, FaEraser, FaUpload,
    FaCalendarAlt, FaIdCard, FaMapMarkerAlt, FaUsers, FaRing,
    FaRupeeSign, FaVoteYea, FaUniversity, FaFileImage, FaChevronRight,
    FaHome, FaCheckSquare,
    // Admin Layout Icons
    FaThLarge, FaBuilding, FaExclamationTriangle, FaFileAlt,
    FaHandHoldingUsd, FaChartLine, FaCog, FaQuestionCircle, FaBullhorn,
    FaSignOutAlt, FaSearch, FaBell, FaChevronDown
} from 'react-icons/fa';

// Reuse Sidebar for consistency
const SidebarItem = ({ icon: Icon, label, active, to }) => (
    <Link to={to || '#'} className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors mb-1 ${active ? 'bg-[#1e2a4a] text-white font-bold' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 font-medium'}`}>
        <Icon size={18} className={active ? 'text-white' : 'text-gray-400'} />
        <span className="text-sm">{label}</span>
    </Link>
);

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
            value={value}
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
        <div className="relative">
            <select
                name={name}
                value={value}
                onChange={onChange}
                disabled={disabled}
                className={`w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none cursor-pointer ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`}
            >
                <option value="">Select {label}</option>
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
        </div>
    </div>
);

const EditMember = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    // Form State - Pre-filled with mock data for "Edit" simulation
    const [formData, setFormData] = useState({
        surname: 'Goud',
        name: 'Ramesh',
        fatherName: 'Venkataiah',
        dob: '1978-05-15',
        age: '45',
        gender: 'Male',
        mobile: '9876543210',
        bloodGroup: 'B+',
        maritalStatus: 'Married',

        presentDistrict: 'Nalgonda',
        presentMandal: 'Chityal',
        presentVillage: 'Peddakaparthy',
        presentHouseNo: '1-123',
        presentStreet: 'Main Road',
        presentLandmark: 'Near Temple',
        presentPincode: '508114',
        residenceType: 'Owned (Permanent)',

        permDistrict: 'Nalgonda',
        permMandal: 'Chityal',
        permVillage: 'Peddakaparthy',
        permHouseNo: '1-123',
        permStreet: 'Main Road',
        permLandmark: 'Near Temple',
        permPincode: '508114',
    });

    const [sameAsPresent, setSameAsPresent] = useState(true);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            if (sameAsPresent && name.startsWith('present')) {
                const permField = name.replace('present', 'perm');
                newData[permField] = value;
            }
            return newData;
        });
    };

    const handleSameAsPresentChange = (e) => {
        const checked = e.target.checked;
        setSameAsPresent(checked);
        if (checked) {
            setFormData(prev => ({
                ...prev,
                permDistrict: prev.presentDistrict,
                permMandal: prev.presentMandal,
                permVillage: prev.presentVillage,
                permHouseNo: prev.presentHouseNo,
                permStreet: prev.presentStreet,
                permLandmark: prev.presentLandmark,
                permPincode: prev.presentPincode,
            }));
        }
    };

    return (
        <div className="min-h-screen bg-[#f3f4f6] font-sans flex flex-col">
            <header className="bg-[#0f172a] text-white h-16 flex items-center justify-between px-4 z-20 shadow-md">
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
            </header>

            <div className="flex flex-1 overflow-hidden">
                <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col overflow-y-auto">
                    <div className="p-4 space-y-1">
                        <SidebarItem to="/admin/dashboard" icon={FaThLarge} label="Village Dashboard" />
                        <SidebarItem to="/admin/members" icon={FaUsers} label="Member Management" active={true} />
                        <SidebarItem icon={FaBuilding} label="Institution Management" />
                    </div>
                </aside>

                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Edit Member Profile</h1>
                            <p className="text-sm text-gray-500 mt-1">Update information for member ID: {id}</p>
                        </div>
                        <Link to="/admin/members" className="bg-[#1e2a4a] hover:bg-[#2a3b66] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition">
                            <FaArrowLeft size={12} /> Back to Members
                        </Link>
                    </div>

                    <form className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                        {/* Basic Info */}
                        <SectionHeader title="Basic Information" icon={FaIdCard} />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormInput label="Sur Name" name="surname" value={formData.surname} onChange={handleChange} />
                            <FormInput label="Name" name="name" value={formData.name} onChange={handleChange} />
                            <FormInput label="Father's Name" name="fatherName" value={formData.fatherName} onChange={handleChange} />
                            <FormInput label="Date of Birth" name="dob" value={formData.dob} onChange={handleChange} type="date" />
                            <FormInput label="Age" value={formData.age} disabled={true} />
                            <FormInput label="Mobile" name="mobile" value={formData.mobile} onChange={handleChange} />
                        </div>

                        {/* Present Address Info */}
                        <SectionHeader title="Present Address" icon={FaMapMarkerAlt} />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormSelect label="District" name="presentDistrict" value={formData.presentDistrict} onChange={handleChange} options={["Nalgonda"]} />
                            <FormInput label="Mandal" name="presentMandal" value={formData.presentMandal} onChange={handleChange} />
                            <FormInput label="Village" name="presentVillage" value={formData.presentVillage} onChange={handleChange} />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-4 pt-6 border-t border-gray-100 mt-8">
                            <button type="button" onClick={() => navigate(-1)} className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition shadow-sm">
                                Cancel
                            </button>
                            <div className="flex-1"></div>
                            <button type="button" className="px-8 py-3 bg-[#1e2a4a] text-white font-bold rounded-xl hover:bg-[#2a3b66] transition shadow-md flex items-center gap-2">
                                Save Changes <FaSave className="ml-1" />
                            </button>
                        </div>
                    </form>
                </main>
            </div>
        </div>
    );
};

export default EditMember;
