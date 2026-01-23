import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../api';
import {
    FaDownload, FaArrowLeft
} from 'react-icons/fa';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Sidebar Item Component
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import MemberIDCardTemplate from '../components/MemberIDCardTemplate';

const GenerateIDCard = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Default valid until date (5 years from now)
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

                const vName = await resolveLocationName(newMember.permanentAddress?.village || newMember.address?.village, rawData.permVillage || rawData.presentVillage, resolvedNames.village);
                const mName = await resolveLocationName(newMember.permanentAddress?.mandal || newMember.address?.mandal, rawData.permMandal || rawData.presentMandal, resolvedNames.mandal);
                const dName = await resolveLocationName(newMember.permanentAddress?.district || newMember.address?.district, rawData.permDistrict || rawData.presentDistrict, resolvedNames.district);

                // FIX: Force set ID from state username if available (Source of Truth)
                if (stateData.username) {
                    newMember.mewsId = stateData.username;
                }

                const processMember = (member, isDependent = false) => {
                    // FIX: REMOVED Random ID Generation. Strictly use mewsId or null.
                    const addressSource = member.permanentAddress || member.address || {};
                    const pincode = addressSource.pinCode || resolvedNames.pincode || rawData.permPincode || rawData.presentPincode || '';
                    const houseNo = addressSource.houseNumber || resolvedNames.houseNo || rawData.permHouseNo || rawData.presentHouseNo || '';
                    const street = addressSource.street || resolvedNames.street || rawData.permStreet || rawData.presentStreet || '';

                    const validUntil = getValidUntil();
                    const rel = member.relationToHead || member.relation || 'Family';

                    return {
                        ...member, // Keep original fields
                        name: member.name || rawData.name || rawData.firstName || '',
                        surname: member.surname || rawData.surname || rawData.lastName || '',
                        mewsId: member.mewsId, // Simply pass what we have
                        id: member.id || member._id, // Pass Mongo ID as backup for keying/debugging

                        // Calculated fields for Template
                        photoUrl: member.photoUrl || member.photo,
                        validUntil: validUntil,
                        relation: isDependent ? rel : 'Member',

                        // Address fields explicitly for template/display logic
                        houseNo,
                        street,
                        village: vName,
                        mandal: mName,
                        district: dName,
                        pincode,
                        state: 'Telangana',

                        // Designation Logic
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
                    for (const fm of newMember.familyMembers) {
                        cards.push(processMember(fm, true));
                    }
                }

                // 2. Fetch Dependents logic (Simplified for Refactor)
                if (newMember.dependents && Array.isArray(newMember.dependents) && newMember.dependents.length > 0) {
                    cards.length = 1; // Clear embedded
                    for (const dep of newMember.dependents) cards.push(processMember(dep, true));
                } else {
                    // Check for _id AND id
                    const headId = newMember._id || newMember.id;
                    if (headId) {
                        try {
                            // Only fetch if we have a valid ID
                            const { data: dependents } = await API.get(`/members?headOfFamily=${headId}`);
                            if (dependents && Array.isArray(dependents) && dependents.length > 0) {
                                cards.length = 1; // Clear embedded
                                for (const dep of dependents) cards.push(processMember(dep, true));
                            }
                        } catch (err) {
                            console.error("Failed to fetch dependents:", err);
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
            format: [85.6, 54] // CR80
        });

        for (let i = 0; i < allMembers.length; i++) {
            const frontElement = document.getElementById(`id-card-${i}-front`);
            const backElement = document.getElementById(`id-card-${i}-back`);

            if (frontElement) {
                try {
                    const canvas = await html2canvas(frontElement, { scale: 3, useCORS: true, logging: false, backgroundColor: '#ffffff' });
                    const imgData = canvas.toDataURL('image/png');
                    if (i > 0) pdF.addPage([85.6, 54], 'landscape');
                    pdF.addImage(imgData, 'PNG', 0, 0, 85.6, 54);
                } catch (e) {
                    console.error("Error capturing front", i, e);
                }
            }

            if (backElement) {
                try {
                    const canvas = await html2canvas(backElement, { scale: 3, useCORS: true, logging: false, backgroundColor: '#ffffff' });
                    const imgData = canvas.toDataURL('image/png');
                    pdF.addPage([85.6, 54], 'landscape');
                    pdF.addImage(imgData, 'PNG', 0, 0, 85.6, 54);
                } catch (e) {
                    console.error("Error capturing back", i, e);
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

                                    {/* Usage of Shared Template */}
                                    <MemberIDCardTemplate member={member} idPrefix={`id-card-${idx}`} />
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
