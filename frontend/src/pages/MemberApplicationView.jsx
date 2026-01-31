import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api';
import { MemberDocument } from './MemberDocument';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { FaDownload, FaArrowLeft, FaSpinner } from 'react-icons/fa';
import AdminHeader from '../components/AdminHeader';

const MemberApplicationView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [member, setMember] = useState(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMember = async () => {
            try {
                // Fetch member details (API handles signing URLs)
                const { data } = await API.get(`/members/${id}`);
                setMember(data);
            } catch (err) {
                console.error("Failed to fetch member application:", err);
                setError("Failed to load application details. Please verify your login session.");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchMember();
    }, [id]);

    const handleDownloadPDF = async () => {
        setDownloading(true);
        const input = document.getElementById('application-form-content');

        // Temporarily force desktop width for consistent render
        const originalWidth = input.style.width;
        input.style.width = '210mm';

        try {
            const canvas = await html2canvas(input, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Application_${member.name || 'Member'}.pdf`);
        } catch (err) {
            console.error("PDF Generation failed:", err);
            alert("Failed to generate PDF. Please try again.");
        } finally {
            input.style.width = originalWidth; // Restore
            setDownloading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
            <FaSpinner className="animate-spin text-4xl text-blue-600 mb-4" />
            <p className="text-gray-600 font-medium">Loading Application...</p>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg shadow-sm max-w-md text-center">
                <p className="font-bold mb-2">Access Denied / Error</p>
                <p>{error}</p>
                <button onClick={() => navigate('/login')} className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition">
                    Go to Login
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
            <AdminHeader />

            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-[210mm] mx-auto mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium px-4 py-2 bg-white rounded shadow-sm border border-gray-200 transition"
                    >
                        <FaArrowLeft /> Back
                    </button>

                    <button
                        onClick={handleDownloadPDF}
                        disabled={downloading}
                        className="flex items-center gap-2 bg-[#E08E35] hover:bg-[#c77a28] text-white font-bold px-6 py-2.5 rounded shadow-md transition disabled:opacity-70"
                    >
                        {downloading ? <FaSpinner className="animate-spin" /> : <FaDownload />}
                        Download Application PDF
                    </button>
                </div>

                <div className="flex justify-center">
                    <div id="application-form-content" className="bg-white shadow-lg">
                        <MemberDocument data={member} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MemberApplicationView;
