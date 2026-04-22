import React from 'react';
import mewsLogo from '../assets/mews_main_logo_new.png';
import { BASE_URL } from '../api';

const MemberDocument = ({ data, lookups }) => {
    if (!data) return null;

    // Helper to resolve names
    const resolve = (id, type) => {
        if (!id) return '-';
        if (typeof id === 'object' && id.name) return id.name;
        if (lookups) {
            let list = [];
            if (type === 'district') list = lookups.districts || [];
            if (type === 'mandal') list = lookups.mandals || [];
            if (type === 'village') list = lookups.villages || [];
            if (type === 'constituency') list = lookups.constituencies || lookups.permConstituencies || [];
            const found = list.find(item => item._id === id);
            if (found) return found.name;
        }
        return id;
    };

    // Helper for table rows
    const InfoRow = ({ label, value }) => (
        <tr className="border-b border-gray-200">
            <td className="py-1.5 px-3 text-[11px] font-bold text-gray-600 bg-gray-50/50 w-1/3 border-r border-gray-200">{label}</td>
            <td className="py-1.5 px-3 text-[11px] font-bold text-gray-900">{value || '-'}</td>
        </tr>
    );

    const SectionHeader = ({ title }) => (
        <div
            className="text-[#E08E35] font-bold text-sm uppercase tracking-wide mb-2 mt-3"
            style={{ textShadow: '1px 1px 0px #b06d26, 2px 2px 0px rgba(0,0,0,0.1)' }}
        >
            {title}
        </div>
    );

    const Separator = () => (
        <div className="border-t-2 border-[#E08E35] opacity-80 my-3"></div>
    );

    // Photo URL
    const getPhotoUrl = (url) => {
        if (!url) return null;

        // Handle local blob URLs (previews) directly
        if (url.startsWith('blob:')) return url;

        // Cache buster using timestamp if available in data, else current time for fresh fetch provided by caller/context if possible, 
        // but here we might just rely on the url being correct. 
        // Ideally data.updatedAt should be used.
        const timestamp = data.updatedAt ? new Date(data.updatedAt).getTime() : '';
        const timeParam = timestamp ? `&t=${timestamp}` : '';

        if (url.startsWith('http')) {
            const baseUrl = BASE_URL;
            return `${baseUrl}/api/proxy-image?url=${encodeURIComponent(url)}${timeParam}`;
        }

        // Local relative path
        const baseUrl = BASE_URL;
        // Ensure url starts with /
        const normalizedPath = url.replace(/\\/g, '/').replace(/^\//, '');
        return `${baseUrl}/${normalizedPath}?t=${timestamp}`;
    };

    // Helper to chunk arrays for pagination
    const chunkArray = (arr, size) => {
        const result = [];
        for (let i = 0; i < arr.length; i += size) {
            result.push(arr.slice(i, i + size));
        }
        return result;
    };

    const renderFamilyMembersList = (members, startIndex = 0) => (
        <div className="flex flex-col gap-4 mb-6 relative z-10">
            {members.map((fm, i) => (
                <div key={i} className="border border-gray-200 rounded-sm overflow-hidden bg-white/80">
                    <div className="bg-gray-50 border-b border-gray-200 px-3 py-1.5 flex justify-between items-center">
                        <span className="text-[11px] font-bold text-gray-700">Member #{startIndex + i + 1}</span>
                        <span className="text-[11px] font-bold text-blue-800 uppercase bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{fm.relation}</span>
                    </div>
                    <div className="flex gap-4 p-3">
                        {/* Photo */}
                        <div className="w-[28mm] h-[36mm] border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center shrink-0">
                            {fm.photoUrl || fm.photo ? (
                                <img
                                    src={getPhotoUrl(fm.photoUrl || (typeof fm.photo === 'string' ? fm.photo : (fm.photo?.url || '')))}
                                    alt="Family Member"
                                    className="w-full h-full object-cover"
                                    crossOrigin="anonymous"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                            ) : (
                                <span className="text-[8px] text-gray-400 font-bold text-center">NO<br />PHOTO</span>
                            )}
                        </div>
                        {/* Details */}
                        <div className="flex-1">
                            <table className="w-full text-[10px]">
                                <tbody>
                                    <tr>
                                        <td className="py-1 text-gray-500 w-24">Name:</td>
                                        <td className="py-1 font-bold text-gray-900 uppercase">{fm.name} {fm.surname}</td>
                                        <td className="py-1 text-gray-500 w-24">S/O, W/O, D/O:</td>
                                        <td className="py-1 font-bold text-gray-900 uppercase">{fm.fatherName || '-'}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1 text-gray-500">Date of Birth:</td>
                                        <td className="py-1 font-bold text-gray-900">{fm.dob ? new Date(fm.dob).toLocaleDateString('en-GB') : '-'}</td>
                                        <td className="py-1 text-gray-500">Age / Gender:</td>
                                        <td className="py-1 font-bold text-gray-900">{fm.age || '-'} Yrs / {fm.gender || '-'}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1 text-gray-500">Occupation:</td>
                                        <td className="py-1 font-bold text-gray-900">{fm.occupation || '-'}</td>
                                        <td className="py-1 text-gray-500">Mobile No:</td>
                                        <td className="py-1 font-bold text-gray-900">{fm.mobileNumber || '-'}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1 text-gray-500">EPIC Number:</td>
                                        <td className="py-1 font-bold text-gray-900">{fm.epicNumber || '-'}</td>
                                        <td className="py-1 text-gray-500">Polling Booth:</td>
                                        <td className="py-1 font-bold text-gray-900">{fm.pollingBooth || '-'}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    const mainPageMembers = data.familyMembers ? data.familyMembers.slice(0, 1) : [];
    const extraMembersChunks = data.familyMembers && data.familyMembers.length > 1
        ? chunkArray(data.familyMembers.slice(1), 5)
        : [];

    return (
        <div className="print-documents-container w-full">
            <div className="print-page bg-white font-sans text-gray-800 p-4 md:p-[10mm] w-full md:max-w-[210mm] mx-auto relative shadow-md md:shadow-none my-4 md:my-0" style={{ minHeight: '297mm' }}>
                <style>
                    {`
                    @media print {
                        .print-page { padding: 0 !important; max-width: none !important; }
                        @page { margin: 10mm; size: A4; }
                        body { -webkit-print-color-adjust: exact; }
                    }
                `}
                </style>

                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0">
                    <img
                        src={mewsLogo}
                        alt="Watermark"
                        className="w-[120mm] opacity-[0.08] mix-blend-multiply"
                    />
                </div>

                {/* Header */}
                <div className="flex flex-col items-center justify-center mb-6">
                    <div className="flex items-center gap-4 mb-2">
                        <img src={mewsLogo} alt="MEWS Logo" className="h-16 w-auto mix-blend-multiply" />
                        <div>
                            <h1
                                className="text-[#E08E35] text-2xl font-black uppercase tracking-wider mb-1"
                                style={{ textShadow: '1px 1px 0px #b06d26, 2px 2px 0px #b06d26, 3px 3px 0px rgba(0,0,0,0.15)' }}
                            >
                                Mala Educational Welfare Society
                            </h1>
                            <div className="text-xs font-bold tracking-[0.4em] text-gray-500 uppercase text-center">Membership Registration Application</div>
                        </div>
                    </div>
                </div>

                {/* Member ID Header line */}
                <div className="flex justify-between items-baseline border-b-2 border-black pb-2 mb-6">
                    <div className="flex items-baseline gap-2">
                        <div className="text-[10px] text-gray-500 uppercase font-bold">MEMBER ID:</div>
                        <div className="text-xl font-black text-black leading-none">{data.mewsId || 'PENDING'}</div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <div className="text-[10px] text-gray-500 uppercase font-bold">DATE OF APPLICATION:</div>
                        <div className="text-sm font-bold text-black leading-none">{new Date().toLocaleDateString('en-GB')}</div>
                    </div>
                </div>

                <SectionHeader title="Basic Information" />

                <div className="flex gap-6 mb-4">
                    {/* Photo */}
                    <div className="w-[35mm] h-[45mm] border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center shrink-0">
                        {data.photoUrl ? (
                            <img
                                src={getPhotoUrl(data.photoUrl)}
                                alt="Member"
                                className="w-full h-full object-cover"
                                crossOrigin="anonymous"
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        ) : (
                            <span className="text-[9px] text-gray-400 font-bold text-center">PASSPORT<br />SIZE<br />PHOTO</span>
                        )}
                    </div>

                    {/* Basic Info Table */}
                    <div className="flex-1 border border-gray-200 rounded-sm overflow-hidden">
                        <table className="w-full">
                            <tbody>
                                <InfoRow label="Full Name" value={`${data.name} ${data.surname}`} />
                                <InfoRow label="S/o , W/o, D/o" value={data.fatherName} />
                                <InfoRow label="Date of Birth / Age" value={`${data.dob ? new Date(data.dob).toLocaleDateString('en-GB') : '-'} (${data.age} Years)`} />
                                <InfoRow label="Gender / Blood Group" value={`${data.gender} / ${data.bloodGroup || '-'}`} />
                                <InfoRow label="Occupation" value={data.occupation} />
                                <InfoRow label="Mobile Number" value={data.mobileNumber} />
                            </tbody>
                        </table>
                    </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Present Address */}
                    <div>
                        <SectionHeader title="Present Address" />
                        <div className="border border-gray-200 rounded-sm overflow-hidden">
                            <table className="w-full">
                                <tbody>
                                    <InfoRow label="Address Line" value={`${data.address?.houseNumber}, ${data.address?.street}`} />
                                    <InfoRow 
                                        label={data.areaType === 'URBAN' ? "Ward / Municipality" : "Village / Mandal"} 
                                        value={data.areaType === 'URBAN' 
                                            ? `${data.wardNumber || data.address?.wardNumber || '-'}, ${data.municipalityName || resolve(data.address?.municipality, 'municipality') || '-'}`
                                            : `${resolve(data.address?.village, 'village')}, ${resolve(data.address?.mandal, 'mandal')}`
                                        } 
                                    />
                                    <InfoRow label="District / State" value={`${resolve(data.address?.district, 'district')}, ${data.address?.state || 'Telangana'}`} />
                                    <InfoRow label="Constituency / Pin" value={`${resolve(data.address?.constituency, 'constituency')} - ${data.address?.pinCode}`} />
                                    <InfoRow label="Residence Type" value={data.address?.residencyType} />
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Permanent Address */}
                    <div>
                        <SectionHeader title="Permanent Address" />
                        <div className="border border-gray-200 rounded-sm overflow-hidden">
                            <table className="w-full">
                                <tbody>
                                    <InfoRow label="Address Line" value={`${data.address?.permHouseNumber || data.address?.houseNumber}, ${data.address?.permStreet || data.address?.street}`} />
                                    <InfoRow 
                                        label={data.areaType === 'URBAN' || data.permanentAddress?.areaType === 'URBAN' ? "Ward / Municipality" : "Village / Mandal"} 
                                        value={data.areaType === 'URBAN' || data.permanentAddress?.areaType === 'URBAN'
                                            ? `${data.permanentAddress?.wardNumber || data.wardNumber || '-'}, ${resolve(data.permanentAddress?.municipality, 'municipality') || data.municipalityName || '-'}`
                                            : `${resolve(data.permanentAddress?.village, 'village')}, ${resolve(data.permanentAddress?.mandal, 'mandal')}`
                                        } 
                                    />
                                    <InfoRow label="District / State" value={`${resolve(data.permanentAddress?.district, 'district')}, ${data.permanentAddress?.state || 'Telangana'}`} />
                                    <InfoRow label="Constituency / Pin" value={`${resolve(data.permanentAddress?.constituency, 'constituency')} - ${data.permanentAddress?.pinCode}`} />
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <SectionHeader title="Caste & Community" />
                        <div className="border border-gray-200 rounded-sm overflow-hidden">
                            <table className="w-full">
                                <tbody>
                                    <InfoRow label="Caste / Sub-Caste" value={`${data.casteDetails?.caste} / ${data.casteDetails?.subCaste}`} />
                                    <InfoRow label="Cert No." value={data.casteDetails?.communityCertNumber} />
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div>
                        <SectionHeader title="Marriage Information" />
                        <div className="border border-gray-200 rounded-sm overflow-hidden">
                            <table className="w-full">
                                <tbody>
                                    <InfoRow label="Status" value={data.maritalStatus} />
                                    {data.maritalStatus === 'Married' && (
                                        <InfoRow label="Partner" value={data.isInterCaste === 'Yes' ? `${data.partnerCaste} (${data.partnerSubCaste})` : '-'} />
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <Separator />

                <SectionHeader title="Family & Economic" />
                <div className="border border-gray-200 rounded-sm overflow-hidden mb-6">
                    <table className="w-full">
                        <tbody>
                            <InfoRow label="Annual Income" value={data.familyDetails?.annualIncome} />
                            <InfoRow label="Ration Card" value={`${data.rationCard?.number || '-'} (${data.familyDetails?.rationCardType || '-'})`} />
                            <InfoRow label="Voter ID" value={data.voterId?.epicNumber} />

                        </tbody>
                    </table>
                </div>

                {mainPageMembers.length > 0 && (
                    <div className="relative z-10">
                        <Separator />
                        <SectionHeader title="Family Members" />
                        {renderFamilyMembersList(mainPageMembers, 0)}
                    </div>
                )}

                <Separator />

                <SectionHeader title="Declaration" />
                <p className="text-[10px] text-gray-700 leading-relaxed text-justify mb-6">
                    I, <span className="font-bold uppercase">{data.name} {data.surname}</span>, hereby declare that all the information furnished in this application is true, complete, and correct to the best of my knowledge and belief. I understand that my membership is subject to the rules and regulations of the <strong>Mala Educational Welfare Society</strong>. I accept that any misrepresentation may lead to cancellation of my membership.
                </p>

                <div className="flex justify-between items-end mt-4">
                    <div className="w-48">
                        <div className="text-xs font-bold uppercase mb-2 pl-2 text-gray-800">{resolve(data.address?.village, 'village')}</div>
                        <div className="border-t-2 border-black pt-1 text-[10px] uppercase font-bold text-center">Place</div>
                    </div>
                    <div className="w-48">
                        <div className="border-t-2 border-black pt-1 text-[10px] uppercase font-bold text-center">Signature of Applicant</div>
                    </div>
                </div>

            </div>

            {/* Additional Pages for Extra Family Members */}
            {extraMembersChunks.map((chunk, chunkIndex) => (
                <div key={`fm-page-${chunkIndex}`} className="print-page bg-white font-sans text-gray-800 p-4 md:p-[10mm] w-full md:max-w-[210mm] mx-auto relative shadow-md md:shadow-none my-4 md:my-0" style={{ minHeight: '297mm' }}>
                    {/* Watermark */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0">
                        <img
                            src={mewsLogo}
                            alt="Watermark"
                            className="w-[120mm] opacity-[0.08] mix-blend-multiply"
                        />
                    </div>

                    {/* Header for Continued Pages */}
                    <div className="flex flex-col items-center justify-center mb-6 relative z-10">
                        <div className="flex items-center gap-4 mb-2 border-b-2 border-[#E08E35] pb-2 px-8">
                            <img src={mewsLogo} alt="MEWS Logo" className="h-10 w-auto mix-blend-multiply" />
                            <div>
                                <h2 className="text-[#E08E35] text-lg font-black uppercase tracking-wider">
                                    Family Members (Continued)
                                </h2>
                                <div className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">
                                    Application ID: {data.mewsId || 'PENDING'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {renderFamilyMembersList(chunk, 1 + (chunkIndex * 5))}

                    {/* Footer Page Number */}
                    <div className="absolute bottom-4 right-4 text-[10px] text-gray-400 font-bold">
                        Page {chunkIndex + 2}
                    </div>
                </div>
            ))}
        </div>
    );
};

export { MemberDocument };
