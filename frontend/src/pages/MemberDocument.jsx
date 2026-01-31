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

    return (
        <div className="print-page bg-white font-sans text-gray-800 p-4 md:p-[10mm] w-full md:max-w-[210mm] mx-auto relative shadow-md md:shadow-none my-4 md:my-0">
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
                                <InfoRow label="Village / Mandal" value={`${resolve(data.address?.village, 'village')}, ${resolve(data.address?.mandal, 'mandal')}`} />
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
                                <InfoRow label="Village / Mandal" value={`${resolve(data.permanentAddress?.village, 'village')}, ${resolve(data.permanentAddress?.mandal, 'mandal')}`} />
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
                        <InfoRow label="Aadhaar No." value={data.aadhaarNumber} />
                    </tbody>
                </table>
            </div>

            {data.familyMembers && data.familyMembers.length > 0 && (
                <>
                    <Separator />
                    <SectionHeader title="Family Members" />
                    <div className="border border-gray-200 rounded-sm overflow-hidden mb-6">
                        <table className="w-full text-[10px]">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="py-2 px-2 text-left font-bold text-gray-700 w-8">#</th>
                                    <th className="py-2 px-2 text-left font-bold text-gray-700">Name & Relation</th>
                                    <th className="py-2 px-2 text-left font-bold text-gray-700">Personal Info</th>
                                    <th className="py-2 px-2 text-left font-bold text-gray-700">Education & Work</th>
                                    <th className="py-2 px-2 text-left font-bold text-gray-700">IDs & Contact</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {data.familyMembers.map((fm, i) => (
                                    <tr key={i}>
                                        <td className="py-2 px-2 text-gray-500 border-r border-gray-100 align-top">{i + 1}</td>
                                        <td className="py-2 px-2 text-gray-900 border-r border-gray-100 align-top">
                                            <div className="font-bold uppercase">{fm.name} {fm.surname}</div>
                                            <div className="text-[9px] text-gray-500">({fm.relation})</div>
                                            {fm.maritalStatus && <div className="text-[9px] text-gray-500 italic mt-0.5">{fm.maritalStatus}</div>}
                                        </td>
                                        <td className="py-2 px-2 text-gray-700 border-r border-gray-100 align-top">
                                            <div>{fm.age} Yrs / {fm.gender ? fm.gender.charAt(0) : '-'}</div>
                                            {fm.dob && <div className="text-[9px] text-gray-400">{new Date(fm.dob).toLocaleDateString('en-GB')}</div>}
                                        </td>
                                        <td className="py-2 px-2 text-gray-700 border-r border-gray-100 align-top">
                                            <div className="font-semibold">{fm.occupation || '-'}</div>
                                            {fm.educationLevel && <div className="text-[9px] text-gray-500">{fm.educationLevel}</div>}
                                        </td>
                                        <td className="py-2 px-2 text-gray-700 align-top">
                                            <div className="font-mono text-[9px]">Aadhaar: {fm.aadhaarNumber || '-'}</div>
                                            {fm.mobileNumber && <div className="font-mono text-[9px]">Ph: {fm.mobileNumber}</div>}
                                            {fm.epicNumber && <div className="font-mono text-[9px]">Voter: {fm.epicNumber}</div>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
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
    );
};

export { MemberDocument };
