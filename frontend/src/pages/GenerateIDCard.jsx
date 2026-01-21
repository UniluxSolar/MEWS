import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import API from '../api';
import {
    FaSearch, FaShieldAlt, FaBell, FaChevronDown, FaThLarge, FaUsers, FaBuilding,
    FaExclamationTriangle, FaFileAlt, FaHandHoldingUsd, FaChartLine, FaCog,
    FaQuestionCircle, FaBullhorn, FaSignOutAlt, FaPrint, FaDownload,
    FaWhatsapp, FaEnvelope, FaCheckCircle, FaArrowLeft, FaPhoneAlt, FaCheck
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
    const navigate = useNavigate();

    // Default valid until date (1 year from now)
    const getValidUntil = () => {
        const date = new Date();
        date.setFullYear(date.getFullYear() + 5);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    const [allMembers, setAllMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Effect to load data from navigation state (Registration -> Generate ID)
    useEffect(() => {
        const loadMemberData = async () => {
            const stateData = location.state;
            if (stateData && (stateData.newMember || stateData.member)) {
                console.log("GenerateIDCard State:", stateData);
                // Support both keys: newMember (Registration) or member (Management)
                const newMember = stateData.newMember || stateData.member;
                const rawData = stateData.rawData || {};
                const resolvedNames = stateData.resolvedNames || {};

                // ... resolveLocationName function ...
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

                const vName = await resolveLocationName(newMember.address?.village, rawData.presentVillage, resolvedNames.village);
                const mName = await resolveLocationName(newMember.address?.mandal, rawData.presentMandal, resolvedNames.mandal);
                const dName = await resolveLocationName(newMember.address?.district, rawData.presentDistrict, resolvedNames.district);

                // FIX: Force set ID from state username if available (Source of Truth)
                if (stateData.username) {
                    newMember.mewsId = stateData.username;
                }

                const processMember = (member, isDependent = false) => {
                    // Use state username as primary fallback if member.mewsId is missing
                    const generatedId = member.mewsId || stateData.username || `MEW${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`;
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

                    // Robust Photo Logic
                    let photoSrc = null; // No default photo per user request
                    const rawPhoto = member.photoUrl || member.photo;

                    if (rawPhoto) {
                        if (rawPhoto.startsWith('blob:')) {
                            photoSrc = rawPhoto;
                        } else {
                            // Cache buster
                            const activeDate = member.updatedAt ? new Date(member.updatedAt).getTime() : Date.now();
                            const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '');

                            if (rawPhoto.startsWith('http')) {
                                photoSrc = `${baseUrl}/api/proxy-image?url=${encodeURIComponent(rawPhoto)}&t=${activeDate}`;
                            } else {
                                const normalized = rawPhoto.replace(/\\/g, '/').replace(/^\//, '');
                                photoSrc = `${baseUrl}/${normalized}?t=${activeDate}`;
                            }
                        }
                    }

                    return {
                        name: member.name || rawData.name || rawData.firstName || '',
                        surname: member.surname || rawData.surname || rawData.lastName || '',
                        id: member.mewsId || generatedId, // Fallback to generated if missing
                        mobile: member.mobileNumber || rawData.mobileNumber || '+91 XXXXX XXXXX',
                        photo: photoSrc,
                        bloodGroup: member.bloodGroup || rawData.bloodGroup || '-',
                        village: vName || 'Unknown',
                        mandal: mName || '',
                        district: dName || '',
                        fullAddress: fullAddress,
                        dob: (() => {
                            const dVal = member.dob || rawData.dob;
                            if (!dVal) return '';
                            const d = new Date(dVal);
                            return !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : '';
                        })(),
                        fatherName: member.fatherName || rawData.fatherName,
                        gender: member.gender || rawData.gender,
                        maritalStatus: member.maritalStatus || rawData.maritalStatus,
                        validUntil: validUntil,
                        relation: isDependent ? rel : 'Member',
                        houseNo,
                        street,
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

                // 2. Fetch Dependents (Optimization: Check if passed from Registration Response first)
                if (newMember.dependents && Array.isArray(newMember.dependents) && newMember.dependents.length > 0) {
                    console.log("Using pre-loaded dependents from response:", newMember.dependents.length);

                    // Use these as Source of Truth
                    cards.length = 1; // Clear embedded
                    for (const dep of newMember.dependents) {
                        cards.push(processMember(dep, true));
                    }
                } else {
                    // Fallback: Fetch from API (Only if ID exists)
                    // Check for _id AND id (Mongoose sometimes serializes to id)
                    const headId = newMember._id || newMember.id;

                    if (headId) {
                        try {
                            console.log("Fetching dependents for HEAD:", headId);
                            const { data: dependents } = await API.get(`/members?headOfFamily=${headId}`);

                            if (dependents && Array.isArray(dependents) && dependents.length > 0) {
                                console.log("Found dependents via API:", dependents.length);
                                cards.length = 1; // Clear embedded
                                for (const dep of dependents) {
                                    cards.push(processMember(dep, true));
                                }
                            }
                        } catch (err) {
                            console.error("Failed to fetch dependents:", err);
                        }
                    } else {
                        // Only warn if we truly expected dependents but couldn't fetch them
                        if (newMember.familyMembers && newMember.familyMembers.length > 0) {
                            console.warn("Head Member ID missing (skipping dependent fetch). Using embedded family data.");
                        }
                    }
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
            // FRONT Side
            const frontElement = document.getElementById(`id-card-front-${i}`);
            if (frontElement) {
                try {
                    const canvas = await html2canvas(frontElement, {
                        scale: 3,
                        useCORS: true,
                        logging: false,
                        backgroundColor: '#ffffff'
                    });
                    const imgData = canvas.toDataURL('image/png');

                    if (i > 0) pdF.addPage([85.6, 54], 'landscape'); // Add new page for next member
                    pdF.addImage(imgData, 'PNG', 0, 0, 85.6, 54);
                } catch (e) {
                    console.error("Error capturing front card", i, e);
                }
            }

            // BACK Side
            const backElement = document.getElementById(`id-card-back-${i}`);
            if (backElement) {
                try {
                    const canvas = await html2canvas(backElement, {
                        scale: 3,
                        useCORS: true,
                        logging: false,
                        backgroundColor: '#ffffff'
                    });
                    const imgData = canvas.toDataURL('image/png');

                    pdF.addPage([85.6, 54], 'landscape'); // Add new page for back side
                    pdF.addImage(imgData, 'PNG', 0, 0, 85.6, 54);
                } catch (e) {
                    console.error("Error capturing back card", i, e);
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
                    <div className="mb-6 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate(-1)} className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition shadow-sm">
                                <FaArrowLeft /> Back
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Generated ID Cards</h1>
                                <p className="text-gray-500 text-sm mt-1">Review and download ID cards for the registered family.</p>
                            </div>
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
                                <div key={idx} className="flex flex-col gap-6 items-center bg-white p-6 rounded-xl border border-gray-200">
                                    <div className="w-full flex justify-between items-center mb-2 border-b border-gray-100 pb-2">
                                        <div>
                                            <span className="text-sm font-bold uppercase bg-blue-50 text-blue-900 px-3 py-1 rounded-md">{member.surname} {member.name}</span>
                                            <span className="text-xs text-slate-500 ml-2">({member.relation})</span>
                                        </div>
                                        <div className="text-xs font-mono text-slate-400">Card View</div>
                                    </div>

                                    <div className="flex flex-wrap gap-8 justify-center">
                                        {/* FRONT SIDE */}
                                        <div id={`id-card-front-${idx}`} className="w-[400px] h-[252px] bg-white rounded-xl shadow-lg border border-gray-300 overflow-hidden relative flex flex-col shrink-0">
                                            {/* Watermark */}
                                            <div className="absolute inset-0 flex items-center justify-center opacity-[0.08] pointer-events-none z-0">
                                                <img src={mewsLogo} alt="Watermark" className="h-[180px] w-auto object-contain grayscale mix-blend-multiply" />
                                            </div>

                                            {/* Header */}
                                            <div className="relative z-20">
                                                <div className="h-[45px] bg-[#0f172a] flex items-center justify-center pl-[60px]">
                                                    <div className="text-white font-bold text-[13px] tracking-wide uppercase text-center leading-tight drop-shadow-sm">
                                                        Mala Educational Welfare Society
                                                    </div>
                                                </div>
                                                <div className="h-[30px] bg-[#1e2a4a] flex items-center justify-between px-4 pl-[70px]">
                                                    <h2 className="text-white font-bold text-[10px] tracking-[0.15em] uppercase drop-shadow-sm">
                                                        {member.designation || 'MEMBER'}
                                                    </h2>
                                                    <div className="text-[10px] font-bold text-white tracking-wide bg-white/10 px-2 py-0.5 rounded">
                                                        ID: <span className="font-mono">{member.mewsId || member.id}</span>
                                                    </div>
                                                </div>
                                                <div className="absolute top-1 left-2 w-[55px] h-[65px] bg-white rounded-b-lg shadow-md p-0.5 border-t-0 border-x border-b border-gray-200 z-30">
                                                    <div className="w-full h-full rounded-b overflow-hidden bg-white flex items-center justify-center">
                                                        <img src={mewsLogo} alt="Logo" className="w-full h-full object-contain" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* ID Number Removed from Absolute Position */}

                                            {/* Content */}
                                            <div className="flex-1 flex px-4 pt-3 pb-2 relative z-10 w-full">
                                                {/* Photo */}
                                                <div className="w-[90px] mr-3 flex flex-col gap-2">
                                                    <div className="w-[90px] h-[110px] bg-gray-100 border border-gray-300 shadow-sm p-0.5 relative overflow-hidden flex items-center justify-center">
                                                        <span className="text-3xl font-bold text-gray-300 select-none">{(member.name || '?').charAt(0)}</span>
                                                        {member.photo && (
                                                            <img
                                                                src={member.photo}
                                                                alt="Member"
                                                                className="w-full h-full object-cover absolute top-0 left-0"
                                                                crossOrigin="anonymous"
                                                                onError={(e) => { e.target.style.display = 'none'; }}
                                                            />
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Details */}
                                                <div className="flex-1 flex flex-col pt-0.5">
                                                    <div className="text-[#1e2a4a] text-[15px] font-extrabold uppercase leading-tight tracking-wide mb-0.5 break-words">
                                                        {member.name} {member.surname}
                                                    </div>

                                                    {member.fatherName && (
                                                        <div className="text-[11px] font-bold text-gray-900 uppercase mb-1">
                                                            {member.gender === 'Male' ? 'S/o ' : ((member.maritalStatus === 'Married' || (member.relation && ['Spouse', 'Wife', 'Mother'].includes(member.relation))) ? 'W/o ' : 'D/o ')}
                                                            {member.fatherName}
                                                        </div>
                                                    )}

                                                    <div className="text-gray-700 text-[10px] font-semibold uppercase leading-tight mt-0.5 max-w-[220px]">
                                                        {member.houseNo && `H.No: ${member.houseNo}, `} {member.street && `${member.street},`} <br />
                                                        {member.village && `${member.village} (V),`} {member.mandal && `${member.mandal} (M)`} <br />
                                                        {member.district && `${member.district} (D),`} {member.state} - {member.pincode}
                                                    </div>

                                                    {/* Phone Number */}
                                                    <div className="flex items-center gap-1 mt-0.5 text-[10px] font-bold text-gray-800">
                                                        <FaPhoneAlt className="text-[9px] text-[#1e2a4a]" />
                                                        <span>{member.mobile}</span>
                                                    </div>

                                                    {/* Digital Signature Block (Adobe/Aadhaar Text Overlay Style with Border) */}
                                                    <div className="mt-auto w-full flex justify-end items-end relative z-20">
                                                        <div className="relative right-[0px] bottom-[5px] bg-white/95 border-2 border-gray-300 p-1 px-2 w-fit max-w-[145px] rounded-sm shadow-sm scale-95 origin-bottom-right">
                                                            {/* Content Layer */}
                                                            <div className="relative z-10 text-right">
                                                                <span className="text-[11px] font-bold text-black leading-none block mb-0.5 text-left">Signature valid</span>
                                                                <div className="text-[6px] text-black font-medium leading-[1.1] text-left">
                                                                    Digitally signed by <br />
                                                                    <span className="font-bold">GENERAL SECRETARY</span><br />
                                                                    Date: {new Date().toLocaleString('en-GB', { timeZone: 'Asia/Kolkata', hour12: false }).replace(',', '')} IST
                                                                </div>
                                                            </div>

                                                            {/* Overlay Tick Layer */}
                                                            <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
                                                                <FaCheck className="text-green-600 text-[35px] opacity-80" style={{ filter: 'drop-shadow(0px 0px 1px rgba(255,255,255,0.8))' }} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* BACK SIDE */}
                                        <div id={`id-card-back-${idx}`} className="w-[400px] h-[252px] bg-white rounded-xl shadow-lg border border-gray-300 overflow-hidden relative flex flex-col shrink-0">
                                            {/* Watermark */}
                                            <div className="absolute inset-0 flex items-center justify-center opacity-[0.08] pointer-events-none z-0">
                                                <img src={mewsLogo} alt="Watermark" className="h-[180px] w-auto object-contain grayscale mix-blend-multiply" />
                                            </div>

                                            <div className="relative z-20 flex-1 p-4 flex flex-col h-full">
                                                {/* Top Info List - Back Side */}
                                                <div className="flex flex-col gap-1.5 mb-3 border-b border-gray-200 pb-3 pt-2 text-[10px]">
                                                    <div className="flex items-center">
                                                        <span className="w-[80px] font-bold text-gray-600">Blood Group</span>
                                                        <span className="font-bold text-gray-800">: {member.bloodGroup || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <span className="w-[80px] font-bold text-gray-600">Date of Issue</span>
                                                        <span className="font-bold text-gray-800">: {new Date().toLocaleDateString('en-GB')}</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <span className="w-[80px] font-bold text-gray-600">Valid Upto</span>
                                                        <span className="font-bold text-gray-800">: {member.validUntil}</span>
                                                    </div>
                                                </div>

                                                {/* Privacy & Returns */}
                                                <div className="flex-1 min-h-0">
                                                    <h4 className="text-[9px] font-bold text-[#1e2a4a] uppercase mb-1.5">Directives & Returns</h4>
                                                    <ul className="text-[8px] text-slate-600 space-y-1 list-disc pl-3 leading-tight">
                                                        <li>This card is the property of <b>Mala Educational Welfare Society</b>.</li>
                                                        <li>It must be returned to the issuing authority upon termination of membership.</li>
                                                        <li>If found, please return to the Registered Office address below.</li>
                                                        <li>Misuse of this card is a punishable offense.</li>
                                                    </ul>
                                                </div>

                                                {/* Bottom Footer Address */}
                                                <div className="mt-auto pt-2 border-t border-gray-200 text-center">
                                                    <div className="text-[9px] font-bold text-[#1e2a4a] uppercase">Registered Office</div>
                                                    <p className="text-[8px] text-slate-500 leading-tight mt-0.5">
                                                        Plot No 24,25,30,31, Green Valley, Bandlaguda, Gandipet,<br />
                                                        Rangareddy, Telangana, India.
                                                    </p>
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
