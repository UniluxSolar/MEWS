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

    const [allMembers, setAllMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Effect to load data from navigation state (Registration -> Generate ID)
    useEffect(() => {
        const loadMemberData = async () => {
            if (location.state && location.state.newMember) {
                console.log("GenerateIDCard State:", location.state);
                const newMember = location.state.newMember;
                const rawData = location.state.rawData || {};
                const resolvedNames = location.state.resolvedNames || {};

                // Helper to resolve name (string ID -> fetch, Object -> use name)
                const resolveLocationName = async (loc, fallbackId, preResolvedName) => {
                    if (preResolvedName) return preResolvedName;
                    if (typeof loc === 'object' && loc && loc.name) return loc.name;

                    const idToFetch = (typeof loc === 'string' && loc.length === 24) ? loc : (fallbackId && fallbackId.length === 24 ? fallbackId : null);
                    if (idToFetch) {
                        try {
                            const { data } = await API.get(`/locations/${idToFetch}`);
                            return data.name;
                        } catch (e) {
                            return '';
                        }
                    }
                    return loc || '';
                };

                // Common Location Data (Usually same for family)
                const vName = await resolveLocationName(newMember.address?.village, rawData.presentVillage, resolvedNames.village);
                const mName = await resolveLocationName(newMember.address?.mandal, rawData.presentMandal, resolvedNames.mandal);
                const dName = await resolveLocationName(newMember.address?.district, rawData.presentDistrict, resolvedNames.district);

                const processMember = (member, isDependent = false) => {
                    const generatedId = member.mewsId || `MEW${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`;
                    const pincode = member.address?.pinCode || resolvedNames.pincode || rawData.presentPincode || '';
                    const houseNo = member.address?.houseNumber || resolvedNames.houseNo || rawData.presentHouseNo || '';
                    const street = member.address?.street || resolvedNames.street || rawData.presentStreet || '';
                    const landmark = member.address?.landmark || resolvedNames.landmark || rawData.presentLandmark || '';

                    // Construct full address properly
                    const addrParts = [];
                    if (houseNo) addrParts.push(`H.No: ${houseNo}`);
                    if (street) addrParts.push(street);
                    // if (landmark) addrParts.push(landmark);
                    if (vName) addrParts.push(vName + ' (Vil)');
                    if (mName) addrParts.push(mName + ' (Mdl)');
                    if (dName) addrParts.push(dName + ' (Dist)');
                    addrParts.push('Telangana');
                    // if (pincode) addrParts.push(pincode);

                    const fullAddress = addrParts.join(', ');

                    const validUntil = getValidUntil();
                    const rel = member.relationToHead || member.relation || 'Family';

                    return {
                        name: member.name,
                        surname: member.surname,
                        id: member.mewsId || 'PENDING',
                        mobile: member.mobileNumber || '+91 XXXXX XXXXX',
                        photo: member.photoUrl ? (member.photoUrl.startsWith('http') ? member.photoUrl : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/${member.photoUrl.replace(/\\/g, '/').replace(/^uploads\//, 'uploads/')}`) : (member.photo || member2), // Embedded uses photo, API uses photoUrl
                        bloodGroup: member.bloodGroup || '-',
                        village: vName || 'Unknown',
                        mandal: mName || '',
                        district: dName || '',
                        fullAddress: fullAddress,
                        dob: member.dob ? new Date(member.dob).toISOString().split('T')[0] : '',
                        fatherName: member.fatherName,
                        gender: member.gender,
                        maritalStatus: member.maritalStatus,
                        validUntil: validUntil,
                        relation: isDependent ? rel : 'Member',
                        houseNo,
                        street,
                        pincode,
                        pincode,
                        state: 'Telangana',
                        // Map designation from possible sources
                        designation: member.designation || (member.role === 'VILLAGE_ADMIN' ? 'Village Admin' : (member.role === 'MANDAL_ADMIN' ? 'Mandal Admin' : (member.role === 'DISTRICT_ADMIN' ? 'District Admin' : 'Member')))
                    };
                }

                const mainMemberCard = processMember(newMember);
                const cards = [mainMemberCard];

                // Fetch Dependents (or use embedded if available)
                const processedIds = new Set();
                processedIds.add(newMember._id);

                // 1. Process Embedded Family Members (Immediate Data)
                if (newMember.familyMembers && Array.isArray(newMember.familyMembers)) {
                    console.log("Processing embedded family members:", newMember.familyMembers.length);
                    for (const fm of newMember.familyMembers) {
                        cards.push(processMember(fm, true));
                    }
                }

                // 2. Fetch Dependents
                try {
                    console.log("Fetching dependents for HEAD:", newMember._id);
                    const { data: dependents } = await API.get(`/members?headOfFamily=${newMember._id}`);

                    if (dependents && Array.isArray(dependents) && dependents.length > 0) {
                        console.log("Found dependents via API:", dependents.length);

                        // STRICT DEDUPLICATION:
                        // If API returns dependents, these are the "Single Source of Truth".
                        // We should REMOVE the temporary embedded cards we added above (except the main member).
                        // Why? Because API data has the real MewsIDs and is cleaner.
                        // And fixing 'deduplication' by matching names is risky (typos).

                        // Reset cards to just the Main Member
                        cards.length = 1;

                        for (const dep of dependents) {
                            cards.push(processMember(dep, true));
                        }
                    }
                } catch (err) {
                    console.error("Failed to fetch dependents:", err);
                }

                setAllMembers(cards);
                setLoading(false);
            } else {
                setLoading(false);
            }
        };

        loadMemberData();
    }, [location.state]);

    const handleDownloadAllPDF = async () => {
        const pdF = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: [85.6, 54] // Standard ID Card size (CR80)
        });

        for (let i = 0; i < allMembers.length; i++) {
            const element = document.getElementById(`id-card-${i}`);
            if (element) {
                try {
                    const canvas = await html2canvas(element, {
                        scale: 3,
                        useCORS: true,
                        logging: false,
                        backgroundColor: '#ffffff'
                    });
                    const imgData = canvas.toDataURL('image/png');

                    if (i > 0) pdF.addPage();
                    pdF.addImage(imgData, 'PNG', 0, 0, 85.6, 54);
                } catch (e) {
                    console.error("Error capturing card", i, e);
                }
            }
        }
        pdF.save(`Family_ID_Cards_${allMembers[0].name}.pdf`);
    };

    return (
        <div className="min-h-screen bg-[#f3f4f6] font-sans flex flex-col">
            <AdminHeader />
            <div className="flex flex-1 overflow-hidden">
                <AdminSidebar activePage="members" />
                <main className="flex-1 overflow-y-auto p-8">
                    <div className="mb-6 flex justify-between items-end">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Generated ID Cards</h1>
                            <p className="text-gray-500 text-sm mt-1">Review and download ID cards for the registered family.</p>
                        </div>
                        <button onClick={handleDownloadAllPDF} className="bg-[#1e2a4a] hover:bg-[#2a3b66] text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition shadow-md">
                            <FaDownload /> Download All as PDF
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div></div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                            {allMembers.map((member, idx) => (
                                <div key={idx} className="flex flex-col gap-4">
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-bold uppercase bg-blue-100 text-blue-800 px-2 py-1 rounded">{member.surname} {member.name}</span>
                                            <span className="text-[10px] text-gray-500">{member.relation}</span>
                                        </div>

                                        <div className="flex justify-center bg-gray-50 py-4 rounded-lg border border-dashed border-gray-300 overflow-hidden">
                                            {/* ID Card Element */}
                                            <div id={`id-card-${idx}`} className="w-[400px] h-[252px] bg-white rounded-xl shadow-md border border-gray-300 overflow-hidden relative flex flex-col shrink-0 transform scale-[0.8] origin-center">
                                                {/* Watermark */}
                                                <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none z-0">
                                                    <FaShieldAlt size={180} />
                                                </div>

                                                {/* Header Section */}
                                                <div className="flex flex-col relative z-20">
                                                    <div className="h-[45px] bg-[#0f172a] flex items-center justify-center pl-[60px]">
                                                        <div className="text-white font-bold text-[13px] tracking-wide uppercase text-center leading-tight drop-shadow-sm">
                                                            Mala Educational Welfare Society
                                                        </div>
                                                    </div>
                                                    <div className="h-[30px] bg-[#1e2a4a] flex items-center justify-center">
                                                        <h2 className="text-white font-bold text-[11px] tracking-[0.2em] uppercase drop-shadow-sm">
                                                            {member.designation || 'MEMBER'}
                                                        </h2>
                                                    </div>
                                                    <div className="absolute top-1 left-2 w-[55px] h-[65px] bg-white rounded-b-lg shadow-md p-0.5 border-t-0 border-x border-b border-gray-200 z-30">
                                                        <div className="w-full h-full rounded-b overflow-hidden bg-white flex items-center justify-center">
                                                            <img src={mewsLogo} alt="Logo" className="w-full h-full object-contain" />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="absolute top-[80px] right-4 z-20">
                                                    <div className="text-[11px] font-bold text-gray-800 tracking-wide">
                                                        ID NO. <span className="text-black text-[12px]">{member.id}</span>
                                                    </div>
                                                </div>

                                                <div className="flex-1 flex px-4 pt-8 pb-2 relative z-10">
                                                    <div className="flex items-start gap-4 w-full mt-1">
                                                        <div className="flex flex-col gap-2">
                                                            <div className="w-[90px] h-[110px] bg-gray-100 border border-gray-300 shadow-sm p-0.5">
                                                                <img
                                                                    src={member.photo}
                                                                    alt="Member"
                                                                    className="w-full h-full object-cover"
                                                                    crossOrigin="anonymous"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 flex flex-col pt-1">
                                                            <div className="text-[#1e2a4a] text-[13px] font-extrabold uppercase leading-snug tracking-wide mb-1">
                                                                {member.name} {member.surname}
                                                                {member.fatherName && (
                                                                    <div className="text-[10px] font-bold text-black mt-0.5">
                                                                        {member.gender === 'Male' ? 'S/o ' : ((member.maritalStatus === 'Married' || member.relation === 'Spouse' || member.relation === 'Wife' || member.relation === 'Mother') ? 'W/o ' : 'D/o ')}
                                                                        {member.fatherName}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {/* Relation removed as per request */}

                                                            <div className="text-gray-700 text-[10px] font-semibold uppercase leading-tight mb-3 mt-1">
                                                                {member.houseNo && `H.No: ${member.houseNo}, `} {member.street && `${member.street},`} <br />
                                                                {member.village} (V), {member.mandal} (M) <br />
                                                                {member.district} (D), {member.state} - {member.pincode}
                                                            </div>
                                                            <div className="mt-auto w-full flex justify-between items-end">
                                                                <div>
                                                                    <div className="text-[8px] text-gray-500 font-bold uppercase mb-0.5">Valid Until</div>
                                                                    <div className="text-[10px] text-[#1e2a4a] font-bold">{member.validUntil}</div>
                                                                </div>
                                                                <div className="flex flex-col items-center">
                                                                    <div className="text-[14px] font-signature text-[#1e2a4a] mb-0 leading-none">Auth Sign</div>
                                                                    <div className="text-[8px] font-bold text-gray-800 capitalize px-1 pt-0.5">
                                                                        General Secretary
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main >
            </div >
        </div >
    );
};

export default GenerateIDCard;
