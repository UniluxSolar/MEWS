import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import { FaDownload, FaPhoneAlt, FaCheck } from 'react-icons/fa';
import jsPDF from 'jspdf';
import mewsLogo from '../assets/mews_main_logo_new.png';
import { BASE_URL } from '../api';
import './MemberIDCardStyles.css';

const MemberIDCard = ({ member }) => {
    const frontRef = useRef(null);
    const backRef = useRef(null);

    const handleDownloadPDF = async () => {
        const pdF = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: [85.6, 54] // CR80
        });

        if (frontRef.current) {
            const canvas = await html2canvas(frontRef.current, { scale: 4, useCORS: true, backgroundColor: '#ffffff' });
            pdF.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 85.6, 54);
        }

        if (backRef.current) {
            pdF.addPage([85.6, 54], 'landscape');
            const canvas = await html2canvas(backRef.current, { scale: 4, useCORS: true, backgroundColor: '#ffffff' });
            pdF.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 85.6, 54);
        }

        pdF.save(`ID_Card_${member.mewsId || 'Member'}.pdf`);
    };

    // Helper to format relation string
    const getRelationString = () => {
        if (member.gender === 'Male') return `S/o ${member.fatherName}`;
        if (member.maritalStatus === 'Married') return `W/o ${member.fatherName}`; // Or spouse name if available, but staying consistent with existing logic
        return `D/o ${member.fatherName}`;
    };

    // Helper for valid until
    const getValidUntil = () => {
        const date = new Date();
        date.setFullYear(date.getFullYear() + 5);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    // Address Formatting
    const address = member.permanentAddress || member.address || {};
    const fullAddress = [
        address.houseNumber ? `H.No: ${address.houseNumber}` : '',
        address.street,
        (address.village?.name || address.village) ? `${address.village?.name || address.village} (V)` : '',
        (address.mandal?.name || address.mandal) ? `${address.mandal?.name || address.mandal} (M)` : '',
        (address.constituency?.name || address.constituency) ? `${address.constituency?.name || address.constituency} (C)` : '',
        (address.district?.name || address.district) ? `${address.district?.name || address.district} (D)` : '',
        address.state || 'Telangana',
        address.pinCode
    ].filter(Boolean).join(', ');

    // Role based colors
    const roleColors = {
        'SUPER_ADMIN': '#8B1D1D',
        'STATE_ADMIN': '#4A2C6D',
        'DISTRICT_ADMIN': '#1F3A5F',
        'MANDAL_ADMIN': '#2F6B3F',
        'VILLAGE_ADMIN': '#C9A227',
        'MEMBER': '#6B7280'
    };

    console.log('MemberIDCard Debug:', { role: member.role, mewsId: member.mewsId, color: roleColors[member.role] });

    const effectiveRole = member.role || 'MEMBER';
    const headerColor = roleColors[effectiveRole] || roleColors['MEMBER'];

    // Helper to proxy image URLs to avoid CORS issues with html2canvas (and GCS)
    const getProxyImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('data:') || url.startsWith('blob:')) return url;

        const baseUrl = BASE_URL;

        if (url.startsWith('http')) {
            return `${baseUrl}/api/proxy-image?url=${encodeURIComponent(url)}`;
        }

        const cleanUrl = url.startsWith('/') ? url : `/${url}`;
        return `${baseUrl}${cleanUrl}`;
    };

    return (
        <div className="flex flex-col items-center gap-6">
            <div className="flex justify-end w-full max-w-[850px]">
                <button
                    onClick={handleDownloadPDF}
                    className="bg-[#1e2a4a] hover:bg-[#2a3b66] text-white px-5 py-2 rounded-lg font-bold flex items-center gap-2 shadow-md transition-all"
                >
                    <FaDownload /> Download ID Card
                </button>
            </div>

            <div className="flex flex-wrap gap-8 justify-center id-card-scale-wrapper transition-transform duration-300">
                {/* FRONT SIDE */}
                <div ref={frontRef} className="w-[400px] h-[252px] bg-white rounded-xl shadow-lg border border-gray-300 overflow-hidden relative flex flex-col shrink-0">
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
                        <div className="h-[30px] flex items-center justify-between px-4 pl-[70px]" style={{ backgroundColor: headerColor }}>
                            <h2 className="text-white font-bold text-[10px] tracking-[0.15em] uppercase drop-shadow-sm">
                                {member.role === 'ADMIN' ? 'ADMIN' : (member.role === 'MEMBER' ? 'MEMBER' : member.role.replace('_', ' '))}
                            </h2>
                            <div className="text-[10px] font-bold text-white tracking-wide bg-white/10 px-2 py-0.5 rounded">
                                ID: <span className="font-mono">{member.mewsId || 'PENDING'}</span>
                            </div>
                        </div>
                        <div className="absolute top-1 left-2 w-[55px] h-[65px] bg-white rounded-b-lg shadow-md p-0.5 border-t-0 border-x border-b border-gray-200 z-30">
                            <div className="w-full h-full rounded-b overflow-hidden bg-white flex items-center justify-center">
                                <img src={mewsLogo} alt="Logo" className="w-full h-full object-contain" />
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex px-4 pt-3 pb-2 relative z-10 w-full">
                        {/* Photo */}
                        <div className="w-[90px] mr-3 flex flex-col gap-2">
                            <div className="w-[90px] h-[110px] bg-gray-100 border border-gray-300 shadow-sm p-0.5 relative overflow-hidden flex items-center justify-center">
                                {member.photoUrl ? (
                                    <img
                                        src={getProxyImageUrl(member.photoUrl)}
                                        alt="Member"
                                        className="w-full h-full object-cover"
                                        crossOrigin="anonymous"
                                    />
                                ) : (
                                    <span className="text-3xl font-bold text-gray-300">{(member.name || '?').charAt(0)}</span>
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
                                    {getRelationString()}
                                </div>
                            )}

                            <div className="text-gray-700 text-[10px] font-semibold uppercase leading-tight mt-0.5 max-w-[220px]">
                                {fullAddress}
                            </div>

                            <div className="flex items-center gap-1 mt-0.5 text-[10px] font-bold text-gray-800">
                                <FaPhoneAlt className="text-[9px] text-[#1e2a4a]" />
                                <span>{member.mobileNumber}</span>
                            </div>

                            {/* Digital Signature */}
                            <div className="mt-auto w-full flex justify-end items-end relative z-20">
                                <div className="relative right-[6px] bottom-[10px] bg-white/95 border-2 border-gray-300 p-1 px-2 w-fit max-w-[145px] rounded-sm shadow-sm scale-95 origin-bottom-right">
                                    <div className="relative z-10 text-right">
                                        <span className="text-[11px] font-bold text-black leading-none block mb-0.5 text-left">Signature valid</span>
                                        <div className="text-[6px] text-black font-medium leading-[1.1] text-left">
                                            Digitally signed by <br />
                                            <span className="font-bold">GENERAL SECRETARY</span><br />
                                            Date: {new Date().toLocaleString('en-GB', { timeZone: 'Asia/Kolkata', hour12: false }).split(',')[0]}
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
                                        <FaCheck className="text-green-600 text-[35px] opacity-80" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BACK SIDE */}
                <div ref={backRef} className="w-[400px] h-[252px] bg-white rounded-xl shadow-lg border border-gray-300 overflow-hidden relative flex flex-col shrink-0">
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.08] pointer-events-none z-0">
                        <img src={mewsLogo} alt="Watermark" className="h-[180px] w-auto object-contain grayscale mix-blend-multiply" />
                    </div>

                    <div className="relative z-20 flex-1 p-4 flex flex-col h-full">
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
                                <span className="font-bold text-gray-800">: {getValidUntil()}</span>
                            </div>
                        </div>

                        <div className="flex-1 min-h-0">
                            <h4 className="text-[9px] font-bold text-[#1e2a4a] uppercase mb-1.5">Directives & Returns</h4>
                            <ul className="text-[8px] text-slate-600 space-y-1 list-disc pl-3 leading-tight">
                                <li>This card is the property of <b>Mala Educational Welfare Society</b>.</li>
                                <li>It must be returned to the issuing authority upon termination of membership.</li>
                                <li>Misuse of this card is a punishable offense.</li>
                            </ul>
                        </div>

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
    );
};

export default MemberIDCard;
