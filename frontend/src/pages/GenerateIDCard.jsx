import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import API from '../api';
import {
    FaSearch, FaShieldAlt, FaBell, FaChevronDown, FaThLarge, FaUsers, FaBuilding,
    FaExclamationTriangle, FaFileAlt, FaHandHoldingUsd, FaChartLine, FaCog,
    FaQuestionCircle, FaBullhorn, FaSignOutAlt, FaPrint, FaDownload,
    FaWhatsapp, FaEnvelope, FaCheckCircle
} from 'react-icons/fa';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import member2 from '../assets/member2.png'; // Fallback
import mewsLogo from '../assets/mews_main_logo_new.png';

// Sidebar Item Component
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';

const GenerateIDCard = () => {
    const location = useLocation();

    // Default valid until date (1 year from now)
    const getValidUntil = () => {
        const date = new Date();
        date.setFullYear(date.getFullYear() + 1);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMember, setSelectedMember] = useState({
        name: 'Priya Sharma',
        surname: '',
        id: 'MEW2024001234',
        mobile: '+91 9876543210',
        photo: member2,
        bloodGroup: 'B+',
        village: 'Peddakaparthy',
        validUntil: 'Dec 2025'
    });



    // ...

    // Effect to load data from navigation state (Registration -> Generate ID)
    useEffect(() => {
        const loadMemberData = async () => {
            if (location.state && location.state.newMember) {
                console.log("GenerateIDCard State:", location.state);
                const newMember = location.state.newMember;
                const rawData = location.state.rawData || {}; // Fallback data if populated data fails
                const resolvedNames = location.state.resolvedNames || {};
                console.log("Raw Data for fallback:", rawData);

                const generatedId = newMember.mewsId || `MEW${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`;

                // Helper to resolve name (string ID -> fetch, Object -> use name)
                const resolveLocationName = async (loc, fallbackId, preResolvedName) => {
                    // 1. Best: Pre-resolved name passed from previous page
                    if (preResolvedName) return preResolvedName;

                    // 2. Good: Populated object from backend
                    if (typeof loc === 'object' && loc && loc.name) return loc.name;

                    // 3. Fallback: Fetch by ID
                    const idToFetch = (typeof loc === 'string' && loc.length === 24) ? loc : (fallbackId && fallbackId.length === 24 ? fallbackId : null);

                    if (idToFetch) {
                        try {
                            const { data } = await API.get(`/locations/${idToFetch}`);
                            return data.name;
                        } catch (e) {
                            console.error("Loc lookup failed", e);
                            return '';
                        }
                    }
                    return loc || '';
                };

                const vName = await resolveLocationName(newMember.address?.village, rawData.presentVillage, resolvedNames.village);
                const mName = await resolveLocationName(newMember.address?.mandal, rawData.presentMandal, resolvedNames.mandal);
                const dName = await resolveLocationName(newMember.address?.district, rawData.presentDistrict, resolvedNames.district);

                const pincode = newMember.address?.pinCode || resolvedNames.pincode || rawData.presentPincode || '';
                const houseNo = newMember.address?.houseNumber || resolvedNames.houseNo || rawData.presentHouseNo || '';
                const street = newMember.address?.street || resolvedNames.street || rawData.presentStreet || '';
                const landmark = resolvedNames.landmark || rawData.presentLandmark || ''; // Fetch landmark from rawData since it's not in address schema

                // Construct full address properly
                const addrParts = [];
                if (houseNo) addrParts.push(`H.No: ${houseNo}`);
                if (street) addrParts.push(street);
                if (landmark) addrParts.push(landmark);
                if (vName) addrParts.push(vName + ' (Vil)');
                if (mName) addrParts.push(mName + ' (Mdl)');
                if (dName) addrParts.push(dName + ' (Dist)');
                addrParts.push('Telangana');
                if (pincode) addrParts.push(pincode);

                const fullAddress = addrParts.join(', ');

                setSelectedMember({
                    name: newMember.name || 'Unknown',
                    surname: newMember.surname || '',
                    id: generatedId,
                    mobile: newMember.mobileNumber || '+91 XXXXX XXXXX',
                    // Handle both full URL from backend or relative path if needed
                    photo: newMember.photoUrl ? (newMember.photoUrl.startsWith('http') ? newMember.photoUrl : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/${newMember.photoUrl.replace(/\\/g, '/')}`) : member2,
                    bloodGroup: newMember.bloodGroup || '-',
                    village: vName || 'Unknown',
                    mandal: mName || '',
                    district: dName || '',
                    fullAddress: fullAddress, // New Field
                    dob: newMember.dob ? new Date(newMember.dob).toISOString().split('T')[0] : '',
                    fatherName: newMember.fatherName || '',
                    validUntil: getValidUntil()
                });
                setSearchTerm(`${newMember.name || ''} ${newMember.surname || ''}`.trim());
            }
        };

        loadMemberData();
    }, [location.state]);

    const handleDownloadPDF = async () => {
        const element = document.getElementById('id-card-element');
        if (!element) return;

        try {
            const canvas = await html2canvas(element, {
                scale: 3, // Higher resolution
                useCORS: true, // Allow loading cross-origin images (backend uploads)
                logging: true,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: [85.6, 54] // Standard ID Card size (CR80)
            });

            pdf.addImage(imgData, 'PNG', 0, 0, 85.6, 54);
            pdf.save(`${selectedMember.name}_ID_Card.pdf`);
        } catch (error) {
            console.error("Failed to generate PDF", error);
            alert("Failed to download ID Card. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-[#f3f4f6] font-sans flex flex-col">
            {/* Top Header */}
            <AdminHeader />

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <AdminSidebar activePage="members" />

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-8">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Member ID Card</h1>
                        <p className="text-gray-500 text-sm mt-1">Create official government ID cards for village members</p>
                    </div>

                    {/* Section 1: Select Member */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                        <h2 className="text-lg font-bold text-gray-800 mb-4">Select Member</h2>
                        <div className="flex gap-4 mb-6">
                            <div className="relative flex-1">
                                <FaSearch className="absolute left-4 top-3.5 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by name, ID number, or phone"
                                    className="w-full bg-white border border-gray-300 rounded-lg py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow"
                                />
                            </div>
                            <button className="bg-[#1e2a4a] hover:bg-[#2a3b66] text-white px-8 py-3 rounded-lg font-bold text-sm transition">
                                Search
                            </button>
                        </div>

                        {/* Selected Member Result */}
                        {selectedMember && (
                            <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full border-2 border-white shadow-sm overflow-hidden">
                                        <img src={selectedMember.photo} alt={selectedMember.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900">{selectedMember.name} {selectedMember.surname}</div>
                                        <div className="text-xs text-gray-500">ID: <span className="text-gray-700 font-medium">{selectedMember.id}</span></div>
                                        <div className="text-xs text-gray-500">Phone: {selectedMember.mobile}</div>
                                    </div>
                                </div>
                                <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1">
                                    <FaCheckCircle size={10} /> Verified
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Section 2: Preview - Enhanced UI */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-gray-800">ID Card Preview</h2>
                            <button onClick={handleDownloadPDF} className="text-blue-600 font-bold text-sm hover:underline flex items-center gap-1">
                                <FaDownload /> Download PDF
                            </button>
                        </div>

                        <div className="flex justify-center bg-gray-50 py-10 rounded-xl border border-dashed border-gray-300">
                            {/* ID Card Container - Scalable */}
                            <div id="id-card-element" className="w-[400px] h-[252px] bg-white rounded-xl shadow-xl border border-gray-300 overflow-hidden relative flex flex-col">
                                {/* Watermark */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none z-0">
                                    <FaShieldAlt size={180} />
                                </div>

                                {/* Header Section */}
                                <div className="flex flex-col relative z-20">
                                    {/* Top Dark Band */}
                                    <div className="h-[45px] bg-[#0f172a] flex items-center justify-center pl-[60px]">
                                        <div className="text-white font-bold text-[13px] tracking-wide uppercase text-center leading-tight drop-shadow-sm">
                                            Mala Educational Welfare Society
                                        </div>
                                    </div>
                                    {/* Bottom Accent Band */}
                                    <div className="h-[30px] bg-[#1e2a4a] flex items-center justify-center pl-[60px]">
                                        <h2 className="text-white font-bold text-[11px] tracking-[0.2em] uppercase drop-shadow-sm">
                                            EMPOWERING COMMUNITIES
                                        </h2>
                                    </div>

                                    {/* Floating Logo - Overlapping Both Bands */}
                                    <div className="absolute top-1 left-2 w-[55px] h-[65px] bg-white rounded-b-lg shadow-md p-0.5 border-t-0 border-x border-b border-gray-200 z-30">
                                        <div className="w-full h-full rounded-b overflow-hidden bg-white flex items-center justify-center">
                                            <img src={mewsLogo} alt="Logo" className="w-full h-full object-contain" />
                                        </div>
                                    </div>
                                </div>

                                {/* ID Number Floating Top Right */}
                                <div className="absolute top-[80px] right-4 z-20">
                                    <div className="text-[11px] font-bold text-gray-800 tracking-wide">
                                        ID NO. <span className="text-black text-[12px]">{selectedMember.id}</span>
                                    </div>
                                </div>

                                {/* Main Content Body */}
                                <div className="flex-1 flex px-4 pt-8 pb-2 relative z-10">
                                    {/* Left Column: Photo & Details */}
                                    <div className="flex items-start gap-4 w-full mt-1">
                                        {/* Photo */}
                                        <div className="flex flex-col gap-2">
                                            <div className="w-[90px] h-[110px] bg-gray-100 border border-gray-300 shadow-sm p-0.5">
                                                <img
                                                    src={selectedMember.photo}
                                                    alt="Member"
                                                    className="w-full h-full object-cover"
                                                    crossOrigin="anonymous"
                                                />
                                            </div>
                                        </div>

                                        {/* Right Details */}
                                        <div className="flex-1 flex flex-col pt-1">
                                            <div className="text-[#1e2a4a] text-[13px] font-extrabold uppercase leading-snug tracking-wide mb-1">
                                                {selectedMember.name} {selectedMember.surname}
                                            </div>

                                            <div className="text-gray-800 text-[11px] font-bold uppercase mb-0.5">
                                                MEMBER
                                            </div>

                                            <div className="text-gray-700 text-[10px] font-semibold uppercase leading-tight mb-3">
                                                {selectedMember.village} VILLAGE <br />
                                                {selectedMember.mandal} (M), {selectedMember.district} (D)
                                            </div>

                                            {/* Footer Area inside body for alignment */}
                                            <div className="mt-auto w-full flex justify-between items-end">
                                                {/* Left: QR or Valid Until */}
                                                <div>
                                                    <div className="text-[8px] text-gray-500 font-bold uppercase mb-0.5">Valid Until</div>
                                                    <div className="text-[10px] text-[#1e2a4a] font-bold">{selectedMember.validUntil}</div>
                                                </div>

                                                {/* Right: Signature */}
                                                <div className="flex flex-col items-center">
                                                    {/* Signature Img Placeholder */}
                                                    <div className="text-[14px] font-signature text-[#1e2a4a] mb-0 leading-none">Auth Sign</div>
                                                    <div className="text-[8px] font-bold text-gray-800 border-t border-gray-400 capitalize px-1 pt-0.5">
                                                        General Secretary
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute bottom-2 left-[30%] opacity-20">
                                    {/* Hologram/Seal placeholder effect if wanted, else standard styling */}
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* Section 3: Actions */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-4">Actions</h2>
                        <div className="flex flex-wrap gap-4">
                            <button onClick={handleDownloadPDF} className="flex-1 bg-[#1e2a4a] hover:bg-[#2a3b66] text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition shadow-md">
                                <FaDownload /> Download PDF
                            </button>
                            <button className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition shadow-sm">
                                <FaEnvelope /> Share via Email
                            </button>
                            <button className="flex-1 bg-[#25D366] hover:bg-[#20bd5a] text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition shadow-md">
                                <FaWhatsapp size={18} /> Share WhatsApp
                            </button>
                            <button className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition shadow-sm">
                                <FaPrint /> Print Card
                            </button>
                        </div>
                    </div>
                </main >
            </div >
        </div >
    );
};

export default GenerateIDCard;
