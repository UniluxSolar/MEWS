import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft, FaUniversity, FaUser, FaClock, FaCheckCircle, FaFileAlt, FaMapMarkerAlt } from 'react-icons/fa';

const ApplicationDetails = () => {
    const { id } = useParams();
    const [application, setApplication] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchApplication = async () => {
            try {
                const adminInfo = JSON.parse(localStorage.getItem('adminInfo'));
                const token = adminInfo?.token;

                if (!token) return;

                const response = await fetch(`/api/fund-requests/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    setApplication(data);
                } else {
                    setError('Application not found');
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load application details');
            } finally {
                setIsLoading(false);
            }
        };

        fetchApplication();
    }, [id]);

    if (isLoading) return <div className="p-8 text-center">Loading...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
    if (!application) return null;

    const StatusBadge = ({ status }) => {
        const styles = {
            'SUBMITTED': 'bg-pink-100 text-pink-700',
            'PENDING_APPROVAL': 'bg-yellow-100 text-yellow-700',
            'ACTIVE': 'bg-blue-100 text-blue-700',
            'COMPLETED': 'bg-green-100 text-green-700',
            'REJECTED': 'bg-red-100 text-red-700'
        };
        return (
            <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${styles[application.status] || 'bg-gray-100'}`}>
                {application.status.replace('_', ' ')}
            </span>
        );
    };

    return (
        <div className="max-w-5xl mx-auto pb-10">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <Link to="/dashboard/applications" className="flex items-center gap-2 text-gray-500 hover:text-primary transition font-bold">
                    <FaArrowLeft /> Back to Funding Request
                </Link>
                <div className="text-sm text-gray-400">
                    Applied on {new Date(application.createdAt).toLocaleDateString()}
                </div>
            </div>

            {/* Title Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-2xl font-bold text-gray-900">{application.purpose} Scholarship</h1>
                        <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-500">#{application._id.substr(-6).toUpperCase()}</span>
                    </div>
                    <p className="text-gray-500">{application.description}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={application.status} />
                    <div className="text-2xl font-bold text-primary">
                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(application.amountRequired)}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column - Details */}
                <div className="md:col-span-2 space-y-6">
                    {/* Student Info */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <FaUser className="text-primary" /> Beneficiary Details
                        </h3>
                        <div className="grid grid-cols-2 gap-y-4 text-sm">
                            <div className="text-gray-500">Name</div>
                            <div className="font-bold text-gray-800">{application.beneficiary?.name} {application.beneficiary?.surname}</div>

                            <div className="text-gray-500">Course</div>
                            <div className="font-bold text-gray-800">{application.courseName || 'N/A'}</div>

                            <div className="text-gray-500">Institution</div>
                            <div className="font-bold text-gray-800">{/* Institution logic/field */} N/A</div>
                        </div>
                    </div>

                    {/* Bank Details */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <FaUniversity className="text-primary" /> Bank Information
                        </h3>
                        <div className="grid grid-cols-2 gap-y-4 text-sm">
                            <div className="text-gray-500">Bank Name</div>
                            <div className="font-bold text-gray-800">{application.bankDetails?.bankName}</div>

                            <div className="text-gray-500">Account Number</div>
                            <div className="font-bold text-gray-800">{application.bankDetails?.accountNumber}</div>

                            <div className="text-gray-500">IFSC Code</div>
                            <div className="font-bold text-gray-800">{application.bankDetails?.ifscCode}</div>

                            <div className="text-gray-500">Branch</div>
                            <div className="font-bold text-gray-800">{application.bankDetails?.branchName}</div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Status/Timeline */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <FaClock className="text-primary" /> Timeline
                        </h3>
                        {/* Placeholder Timeline */}
                        <div className="space-y-6 relative border-l-2 border-gray-100 ml-2">
                            <div className="pl-6 relative">
                                <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-primary border-4 border-white shadow-sm"></span>
                                <div className="text-sm font-bold text-gray-800">Application Submitted</div>
                                <div className="text-xs text-gray-500">{new Date(application.createdAt).toLocaleDateString()}</div>
                            </div>
                            <div className="pl-6 relative opacity-50">
                                <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-gray-200 border-4 border-white"></span>
                                <div className="text-sm font-bold text-gray-800">Under Review</div>
                                <div className="text-xs text-gray-500">Pending</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApplicationDetails;
