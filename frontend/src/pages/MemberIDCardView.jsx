import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api';
import MemberIDCardTemplate from '../components/MemberIDCardTemplate';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { FaDownload, FaArrowLeft, FaSpinner } from 'react-icons/fa';
import AdminHeader from '../components/AdminHeader';

const MemberIDCardView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [member, setMember] = useState(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMember = async () => {
            try {
                const { data } = await API.get(`/members/${id}`);
                setMember(data);
            } catch (err) {
                console.error("Failed to fetch member ID card:", err);
                setError("Failed to load ID card. Please verify your login session.");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchMember();
    }, [id]);

    const handleDownloadPDF = async () => {
        setDownloading(true);
        const pdF = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: [85.6, 54] // CR80
        });

        const frontElement = document.getElementById('single-card-front');
        const backElement = document.getElementById('single-card-back');

        try {
            if (frontElement) {
                const canvas = await html2canvas(frontElement, { scale: 3, useCORS: true, logging: false, backgroundColor: '#ffffff' });
                const imgData = canvas.toDataURL('image/png');
                pdF.addImage(imgData, 'PNG', 0, 0, 85.6, 54);
            }

            if (backElement) {
                const canvas = await html2canvas(backElement, { scale: 3, useCORS: true, logging: false, backgroundColor: '#ffffff' });
                const imgData = canvas.toDataURL('image/png');
                pdF.addPage([85.6, 54], 'landscape');
                pdF.addImage(imgData, 'PNG', 0, 0, 85.6, 54);
            }

            pdF.save(`ID_Card_${member.mewsId || member.name}.pdf`);
        } catch (err) {
            console.error("PDF Error:", err);
            alert("Failed to generate PDF.");
        } finally {
            setDownloading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
            <FaSpinner className="animate-spin text-4xl text-blue-600 mb-4" />
            <p className="text-gray-600 font-medium">Loading ID Card...</p>
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

            <div className="flex-1 flex flex-col items-center p-4 md:p-8 overflow-y-auto">
                <div className="w-full max-w-4xl mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium px-4 py-2 bg-white rounded shadow-sm border border-gray-200 transition"
                    >
                        <FaArrowLeft /> Back
                    </button>

                    <button
                        onClick={handleDownloadPDF}
                        disabled={downloading}
                        className="flex items-center gap-2 bg-[#1e2a4a] hover:bg-[#2a3b66] text-white font-bold px-6 py-2.5 rounded shadow-md transition disabled:opacity-70"
                    >
                        {downloading ? <FaSpinner className="animate-spin" /> : <FaDownload />}
                        Download ID Card PDF
                    </button>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                    <MemberIDCardTemplate member={member} />
                </div>
            </div>
        </div>
    );
};

export default MemberIDCardView;
