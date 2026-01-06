import React from 'react';
import mewsLogo from '../assets/mews_main_logo_new.png';

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
        if (url.startsWith('http')) {
            return `${import.meta.env.VITE_API_URL || ''}/api/proxy-image?url=${encodeURIComponent(url)}`;
        }
        // Local relative path
        const baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
        return `${baseUrl}/${url.replace(/\\/g, '/')}`;
    };

    return (
        <div className="print-page bg-white font-sans text-gray-800 p-[10mm] max-w-[210mm] mx-auto relative">
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
            <div className="flex justify-between items-end border-b-2 border-black pb-1 mb-6">
                <div className="flex items-end gap-2">
                    <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Member ID:</div>
                    <div className="text-xl font-black text-black leading-none">{data.mewsId || 'PENDING'}</div>
                </div>
                <div className="flex items-end gap-2">
                    <div className="text-[10px] text-gray-500 uppercase font-bold mb-0.5">Date of Application:</div>
                    <div className="text-sm font-bold text-black leading-none mb-0.5">{new Date().toLocaleDateString('en-GB')}</div>
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

            <div className="grid grid-cols-2 gap-6">
                {/* Present Address */}
                <div>
                    <SectionHeader title="Present Address" />
                    <div className="border border-gray-200 rounded-sm overflow-hidden">
                        <table className="w-full">
                            <tbody>
                                <InfoRow label="Address Line" value={`${data.address?.houseNumber}, ${data.address?.street}`} />
                                <InfoRow label="Village / Mandal" value={`${resolve(data.address?.village, 'village')}, ${resolve(data.address?.mandal, 'mandal')}`} />
                                <InfoRow label="District / State" value={`${resolve(data.address?.district, 'district')}, Telangana`} />
                                <InfoRow label="Constituency / Pin" value={`${data.address?.constituency || '-'} - ${data.address?.pinCode}`} />
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
                                <InfoRow label="Village / Mandal" value={`${resolve(data.address?.permVillage || data.address?.village, 'village')}, ${resolve(data.address?.permMandal || data.address?.mandal, 'mandal')}`} />
                                <InfoRow label="District / State" value={`${resolve(data.address?.permDistrict || data.address?.district, 'district')}, Telangana`} />
                                <InfoRow label="Constituency / Pin" value={`${data.address?.permConstituency || data.address?.constituency || '-'} - ${data.address?.permPinCode || data.address?.pinCode}`} />
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-6">
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
                                    <th className="py-2 px-3 text-left font-bold text-gray-700">#</th>
                                    <th className="py-2 px-3 text-left font-bold text-gray-700">Name & Relation</th>
                                    <th className="py-2 px-3 text-left font-bold text-gray-700">Age / Gen</th>
                                    <th className="py-2 px-3 text-left font-bold text-gray-700">Occupation</th>
                                    <th className="py-2 px-3 text-left font-bold text-gray-700">Aadhaar</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {data.familyMembers.map((fm, i) => (
                                    <tr key={i}>
                                        <td className="py-2 px-3 text-gray-500 border-r border-gray-100">{i + 1}</td>
                                        <td className="py-2 px-3 text-gray-900 border-r border-gray-100 font-bold uppercase">
                                            {fm.name} {fm.surname} <span className="text-[9px] text-gray-500 font-normal">({fm.relation})</span>
                                        </td>
                                        <td className="py-2 px-3 text-gray-700 border-r border-gray-100">{fm.age} / {fm.gender ? fm.gender.charAt(0) : '-'}</td>
                                        <td className="py-2 px-3 text-gray-700 border-r border-gray-100">{fm.occupation}</td>
                                        <td className="py-2 px-3 text-gray-700 font-mono">{fm.aadhaarNumber}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            <Separator />

            <SectionHeader title="Declaration" />
            <p className="text-[10px] text-gray-700 leading-relaxed text-justify mb-12">
                I, <span className="font-bold uppercase">{data.name} {data.surname}</span>, hereby declare that all the information furnished in this application is true, complete, and correct to the best of my knowledge and belief. I understand that my membership is subject to the rules and regulations of the <strong>Mala Educational Welfare Society</strong>. I accept that any misrepresentation may lead to cancellation of my membership.
            </p>

            <div className="flex justify-between items-end mt-8">
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
