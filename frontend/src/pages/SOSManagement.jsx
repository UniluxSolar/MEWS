import React, { useState, useEffect } from 'react';
import API from '../api';
import {
    FaPhoneAlt, FaCheckCircle, FaMapMarkerAlt, FaExternalLinkAlt, FaArrowRight, FaSync
} from 'react-icons/fa';
import AdminHeader from '../components/AdminHeader';
import AdminSidebar from '../components/AdminSidebar';

const SOSCard = ({ id, name, memberId, age, gender, photo, type, time, location, description, isResolved }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4 flex flex-col lg:flex-row gap-6 hover:shadow-md transition-shadow relative overflow-hidden ${!isResolved ? 'border-l-4 border-l-red-500' : ''}`}>

        {/* Left Indicator for Active Emergency */}
        {!isResolved && (
            <div className="absolute top-0 left-0 bottom-0 w-1 bg-red-500"></div>
        )}

        <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-2 px-2 py-1 bg-red-50 text-red-600 text-[10px] font-bold uppercase rounded border border-red-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></div>
                        Active Emergency
                    </span>
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-[10px] font-bold rounded">
                        {type}
                    </span>
                </div>
                <span className="text-xs font-bold text-red-500">{time}</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <img src={photo || 'https://randomuser.me/api/portraits/men/32.jpg'} alt={name} className="w-16 h-16 rounded-full object-cover border-2 border-gray-100" />
                <div>
                    <h3 className="font-bold text-lg text-gray-900 leading-tight">{name}</h3>
                    <div className="text-xs text-gray-500 mt-1">
                        Member ID: <span className="font-medium">{memberId}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                        Age: {age} | {gender}
                    </div>
                </div>

                <div className="hidden sm:block w-px bg-gray-200 mx-2"></div>

                <div className="flex-1">
                    <div className="flex items-start gap-2 mb-2">
                        <FaMapMarkerAlt className="text-red-500 mt-0.5 flex-shrink-0" size={12} />
                        <div>
                            <div className="text-sm font-bold text-gray-800 leading-tight">{location.address}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{description}</div>
                        </div>
                    </div>
                    <a href="#" className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:underline ml-5">
                        View Map Location <FaExternalLinkAlt size={8} />
                    </a>
                </div>
            </div>
        </div>

        <div className="flex flex-row lg:flex-col justify-center gap-3 lg:w-48 lg:border-l lg:border-gray-100 lg:pl-6">
            <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition">
                <FaPhoneAlt /> Call Member
            </button>
            <button className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 py-2.5 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition">
                <FaCheckCircle className="text-gray-400" /> Mark Resolved
            </button>
            <button className="flex-1 bg-white border border-orange-200 text-orange-600 hover:bg-orange-50 py-2.5 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition">
                <FaArrowRight /> Escalate to Mandal
            </button>
        </div>

    </div>
);

const SOSManagement = () => {
    const [sosAlerts, setSosAlerts] = useState([]);

    useEffect(() => {
        const fetchSOS = async () => {
            try {
                const { data } = await API.get('/sos');
                const mapped = data.map(alert => ({
                    id: alert._id,
                    name: alert.name || 'Unknown',
                    memberId: alert.member || 'Guest',
                    age: 'N/A',
                    gender: 'N/A',
                    photo: 'https://randomuser.me/api/portraits/men/32.jpg',
                    type: alert.type,
                    time: new Date(alert.createdAt).toLocaleTimeString(),
                    location: {
                        address: alert.location?.address || 'Unknown Location',
                        lat: alert.location?.latitude,
                        lng: alert.location?.longitude
                    },
                    description: alert.description,
                    isResolved: alert.status === 'RESOLVED'
                }));
                setSosAlerts(mapped);
            } catch (error) {
                console.error("Failed to fetch SOS", error);
            }
        };

        fetchSOS();
        const interval = setInterval(fetchSOS, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-[#f3f4f6] font-sans flex flex-col">
            <AdminHeader />
            <div className="flex flex-1 overflow-hidden">
                <AdminSidebar activePage="sos" />
                <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#f8fafc]">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">SOS Emergency Panel</h1>
                            <p className="text-sm text-gray-500 mt-1">Live monitoring of emergency alerts | Auto-refresh every 5 seconds</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-sm font-bold text-red-600 animate-pulse">
                                <div className="w-2 h-2 rounded-full bg-red-600"></div>
                                {sosAlerts.length} Live Alerts
                            </div>
                            <button className="bg-[#1e2a4a] hover:bg-[#2a3b66] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition">
                                <FaSync size={12} /> Manual Refresh
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4 mb-8">
                        {sosAlerts.map(alert => (
                            <SOSCard key={alert.id} {...alert} />
                        ))}
                    </div>

                    {sosAlerts.length === 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                                <FaCheckCircle className="text-green-500 text-3xl" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">All Monitoring Areas Clear</h3>
                            <p className="text-sm text-gray-500">No active emergency alerts at this time.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default SOSManagement;
