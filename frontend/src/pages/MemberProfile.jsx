import React from 'react';
import { Link, useParams } from 'react-router-dom';
import {
    FaArrowLeft, FaShieldAlt, FaUsers, FaBuilding, FaExclamationTriangle, FaFileAlt,
    FaHandHoldingUsd, FaChartLine, FaCog, FaQuestionCircle, FaBullhorn,
    FaSignOutAlt, FaSearch, FaBell, FaChevronDown, FaEdit, FaPhoneAlt, FaWhatsapp, FaEnvelope
} from 'react-icons/fa';
import member1 from '../assets/member1.png'; // Fallback
import member2 from '../assets/member2.png';
import member3 from '../assets/member3.png';
import member4 from '../assets/member4.png';


import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';

const DetailRow = ({ label, value }) => (
    <div className="flex flex-col md:flex-row md:items-center py-3 border-b border-gray-50 last:border-0">
        <span className="w-48 text-gray-500 text-sm font-medium">{label}</span>
        <span className="text-gray-900 font-semibold">{value || 'N/A'}</span>
    </div>
);

const MemberProfile = () => {
    const { id } = useParams();

    const [member, setMember] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchMember = async () => {
            // Import API inside useEffect if strictly needed, or ensure it's imported at top
            const API = (await import('../api')).default;
            try {
                const { data } = await API.get(`/members/${id}`);
                console.log("Fetched Member:", data);
                setMember({
                    id: data.mewsId || data._id,
                    name: data.name,
                    surname: data.surname,
                    fatherName: data.fatherName,
                    dob: data.dob ? new Date(data.dob).toLocaleDateString() : 'N/A',
                    age: data.age,
                    gender: data.gender,
                    bloodGroup: data.bloodGroup,
                    mobile: data.mobileNumber,
                    email: data.email,
                    job: data.occupation, // Keep for header
                    photo: data.photoUrl ? (data.photoUrl.startsWith('http') ? data.photoUrl : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/${data.photoUrl.replace(/\\/g, '/')}`) : member1,
                    address: `${data.address?.houseNumber}, ${data.address?.street}${data.address?.landmark ? ', Near ' + data.address.landmark : ''}, ${typeof data.address?.village === 'object' ? data.address?.village?.name : data.address?.village}, ${typeof data.address?.mandal === 'object' ? data.address?.mandal?.name : data.address?.mandal} (M), ${typeof data.address?.district === 'object' ? data.address?.district?.name : data.address?.district} (Dist), ${data.address?.constituency || ''} (Const) - ${data.address?.pincode}`,
                    permAddress: `${data.permanentAddress?.houseNumber}, ${data.permanentAddress?.street}${data.permanentAddress?.landmark ? ', Near ' + data.permanentAddress.landmark : ''}, ${typeof data.permanentAddress?.village === 'object' ? data.permanentAddress?.village?.name : data.permanentAddress?.village}, ${typeof data.permanentAddress?.mandal === 'object' ? data.permanentAddress?.mandal?.name : data.permanentAddress?.mandal} (M), ${typeof data.permanentAddress?.district === 'object' ? data.permanentAddress?.district?.name : data.permanentAddress?.district} (Dist), ${data.permanentAddress?.constituency || ''} (Const) - ${data.permanentAddress?.pincode}`,

                    // Fields missing before
                    educationLevel: data.educationLevel,
                    occupation: data.occupation,
                    jobSector: data.jobSector,
                    jobOrganization: data.jobOrganization,
                    jobDesignation: data.jobDesignation,

                    caste: data.casteDetails?.caste,
                    subCaste: data.casteDetails?.subCaste,
                    maritalStatus: data.maritalStatus,
                    spouse: data.partnerDetails?.name,
                    income: data.familyDetails?.annualIncome,

                    rationCard: data.rationCard?.number,
                    aadhar: data.aadhaarNumber,
                    bankDetails: data.bankDetails
                });
            } catch (error) {
                console.error("Failed to fetch member", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMember();
    }, [id]);

    if (loading) return <div className="p-10 text-center">Loading...</div>;
    if (!member) return <div className="p-10 text-center">Member not found</div>;

    return (
        <div className="min-h-screen bg-[#f3f4f6] font-sans flex flex-col">
            {/* Header - Reused */}
            <AdminHeader />

            <div className="flex flex-1 overflow-hidden">
                <AdminSidebar activePage="members" />

                <main className="flex-1 overflow-y-auto p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                <Link to="/admin/members" className="hover:text-blue-600">Members</Link>
                                <span className="text-gray-300">/</span>
                                <span>Profile</span>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900">Member Profile</h1>
                        </div>
                        <Link to="/admin/members" className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition">
                            <FaArrowLeft size={12} /> Back to List
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Profile Card */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center text-center">
                                <div className="w-32 h-32 rounded-full p-1 border-2 border-blue-100 mb-4 bg-gray-50">
                                    <img src={member.photo} alt={member.name} className="w-full h-full rounded-full object-cover" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">{member.name} {member.surname}</h2>
                                <p className="text-sm text-gray-500 mb-1">{member.job}</p>
                                <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-100 mb-6">Active Member</span>

                                <div className="w-full flex gap-3 text-sm">
                                    <Link to={`/admin/members/edit/${id}`} className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2">
                                        <FaEdit /> Edit
                                    </Link>
                                    <button className="flex-1 bg-white border border-gray-200 text-gray-700 py-2 rounded-lg font-bold hover:bg-gray-50 transition flex items-center justify-center gap-2">
                                        <FaPhoneAlt /> Call
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
                                <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">Contact Details</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                            <FaPhoneAlt size={12} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Mobile Number</p>
                                            <p className="text-sm font-bold text-gray-900">{member.mobile}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                                            <FaWhatsapp size={14} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">WhatsApp</p>
                                            <p className="text-sm font-bold text-gray-900">{member.mobile}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                                            <FaEnvelope size={12} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Email Address</p>
                                            <p className="text-sm font-bold text-gray-900">{member.email}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Details Tab */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                                    <h3 className="font-bold text-gray-900">Personal Information</h3>
                                </div>
                                <div className="p-6">
                                    <DetailRow label="Member ID" value={member.id} />
                                    <DetailRow label="Full Name" value={`${member.surname} ${member.name}`} />
                                    <DetailRow label="Father's Name" value={member.fatherName} />
                                    <DetailRow label="Date of Birth" value={member.dob} />
                                    <DetailRow label="Age" value={`${member.age} Years`} />
                                    <DetailRow label="Gender" value={member.gender} />
                                    <DetailRow label="Blood Group" value={member.bloodGroup} />
                                    <DetailRow label="Education" value={member.educationLevel} />
                                    <DetailRow label="Occupation" value={member.occupation} />
                                    <DetailRow label="Jobe Sector" value={member.jobSector} />
                                    <DetailRow label="Organization" value={member.jobOrganization} />
                                    <DetailRow label="Designation" value={member.jobDesignation} />
                                    <DetailRow label="Marital Status" value={member.maritalStatus} />
                                    <DetailRow label="Spouse Name" value={member.spouse} />
                                    <DetailRow label="Caste / Community" value={`${member.caste} - ${member.subCaste}`} />
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6">
                                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                                    <h3 className="font-bold text-gray-900">Banking & Financial</h3>
                                </div>
                                <div className="p-6">
                                    <DetailRow label="Bank Name" value={member.bankDetails?.bankName} />
                                    <DetailRow label="Branch" value={member.bankDetails?.branchName} />
                                    <DetailRow label="Account Number" value={member.bankDetails?.accountNumber} />
                                    <DetailRow label="IFSC Code" value={member.bankDetails?.ifscCode} />
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6">
                                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                                    <h3 className="font-bold text-gray-900">Address & Family</h3>
                                </div>
                                <div className="p-6">
                                    <DetailRow label="Present Address" value={member.address} />
                                    <DetailRow label="Permanent Address" value={member.permAddress} />
                                    <DetailRow label="Ration Card" value={member.rationCard} />
                                    <DetailRow label="Aadhar Number" value={member.aadhar} />
                                    <DetailRow label="Family Income" value={member.income} />
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MemberProfile;
