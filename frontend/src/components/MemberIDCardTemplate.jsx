import React from 'react';
import { FaPhoneAlt, FaCheck } from 'react-icons/fa';
import mewsLogo from '../assets/mews_main_logo_new.png';

const MemberIDCardTemplate = ({ member, idPrefix = "single-card" }) => {
    // Robust Photo Logic
    let photoSrc = null;
    const rawPhoto = member.photoUrl || member.photo;

    if (rawPhoto) {
        if (rawPhoto.startsWith('blob:') || rawPhoto.startsWith('data:')) {
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

    // Default validity if not provided
    const validUntil = member.validUntil || (() => {
        const date = new Date();
        date.setFullYear(date.getFullYear() + 5);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    })();

    // Default Designation
    const designation = member.designation || (member.role === 'VILLAGE_ADMIN' ? 'Village Admin' : (member.role === 'MANDAL_ADMIN' ? 'Mandal Admin' : (member.role === 'DISTRICT_ADMIN' ? 'District Admin' : 'Member')));

    // Determine Relation label
    let fatherLabel = 'S/o ';
    if (member.gender === 'Female') {
        if (member.maritalStatus === 'Married' || (member.relation && ['Spouse', 'Wife', 'Mother'].includes(member.relation))) {
            fatherLabel = 'W/o ';
        } else {
            fatherLabel = 'D/o ';
        }
    }

    return (
        <div className="flex flex-wrap gap-8 justify-center">
            {/* FRONT SIDE */}
            <div id={`${idPrefix}-front`} className="w-[400px] h-[252px] bg-white rounded-xl shadow-lg border border-gray-300 overflow-hidden relative flex flex-col shrink-0">
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
                            {designation}
                        </h2>
                        <div className="text-[10px] font-bold text-white tracking-wide bg-white/10 px-2 py-0.5 rounded">
                            ID: <span className="font-mono">{member.mewsId || "PENDING"}</span>
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
                            <span className="text-3xl font-bold text-gray-300 select-none">{(member.name || '?').charAt(0)}</span>
                            {photoSrc && (
                                <img
                                    src={photoSrc}
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
                                {fatherLabel}
                                {member.fatherName}
                            </div>
                        )}

                        <div className="text-gray-700 text-[10px] font-semibold uppercase leading-tight mt-0.5 max-w-[220px]">
                            {/* Address Construction Logic handled safely inside JSX */}
                            {member.houseNo && `H.No: ${member.houseNo}, `} {member.street && `${member.street},`}
                            {(member.houseNo || member.street) && <br />}
                            {member.village && `${member.village} (V),`} {member.mandal && `${member.mandal} (M)`}
                            {(member.village || member.mandal) && <br />}
                            {member.district && `${member.district} (D),`} {member.state || 'Telangana'} {member.pincode ? `- ${member.pincode}` : ''}
                        </div>

                        {/* Phone Number */}
                        <div className="flex items-center gap-1 mt-0.5 text-[10px] font-bold text-gray-800">
                            <FaPhoneAlt className="text-[9px] text-[#1e2a4a]" />
                            <span>{member.mobile || member.mobileNumber}</span>
                        </div>

                        {/* Digital Signature Block */}
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
            <div id={`${idPrefix}-back`} className="w-[400px] h-[252px] bg-white rounded-xl shadow-lg border border-gray-300 overflow-hidden relative flex flex-col shrink-0">
                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.08] pointer-events-none z-0">
                    <img src={mewsLogo} alt="Watermark" className="h-[180px] w-auto object-contain grayscale mix-blend-multiply" />
                </div>

                <div className="relative z-20 flex-1 p-4 flex flex-col h-full">
                    {/* Top Info List - Back Side */}
                    <div className="flex flex-col gap-1.5 mb-3 border-b border-gray-200 pb-3 pt-2 text-[10px]">
                        <div className="flex items-center">
                            <span className="w-[80px] font-bold text-gray-600">Blood Group</span>
                            <span className="font-bold text-gray-800">: {member.bloodGroup || member.bloodGroup || 'N/A'}</span>
                        </div>
                        <div className="flex items-center">
                            <span className="w-[80px] font-bold text-gray-600">Date of Issue</span>
                            <span className="font-bold text-gray-800">: {new Date().toLocaleDateString('en-GB')}</span>
                        </div>
                        <div className="flex items-center">
                            <span className="w-[80px] font-bold text-gray-600">Valid Upto</span>
                            <span className="font-bold text-gray-800">: {validUntil}</span>
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
    );
};

export default MemberIDCardTemplate;
