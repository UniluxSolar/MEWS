import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MandalDashboard from './MandalDashboard';
import DistrictDashboard from './DistrictDashboard';
import VillageDashboard from './VillageDashboard';
import StateDashboard from './StateDashboard';
import MunicipalityDashboard from './MunicipalityDashboard';

const AdminDashboard = () => {
    // Robust retrieval of admin info with fallbacks
    const adminInfoStr = sessionStorage.getItem('adminInfo') || sessionStorage.getItem('memberInfo') || sessionStorage.getItem('savedUser');
    const adminInfo = adminInfoStr ? JSON.parse(adminInfoStr) : null;

    if (!adminInfo) {
        // If info is missing but we're here, it might be a session race condition.
        // Return a better message or a reload trigger.
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4">
                <div className="p-10 text-center font-bold text-[#1e2a4a]">Session information missing. Please click below to refresh.</div>
                <button 
                    onClick={() => window.location.reload()}
                    className="bg-[#1e2a4a] text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-900 transition"
                >
                    Refresh Dashboard
                </button>
            </div>
        );
    }

    const role = (adminInfo.role || '').toUpperCase();
    const navigate = useNavigate();

    useEffect(() => {
        if (role === 'SUPER_ADMIN') {
            navigate('/super-admin/dashboard', { replace: true });
        } else if (role === 'STATE_ADMIN') {
            navigate('/state-admin/dashboard', { replace: true });
        }
    }, [role, navigate]);

    if (role === 'SUPER_ADMIN' || role === 'STATE_ADMIN') {
        return null; // Let useEffect handle navigation
    }

    if (role === 'DISTRICT_ADMIN') {
        return <DistrictDashboard />;
    }

    if (role === 'MANDAL_ADMIN') {
        return <MandalDashboard />;
    }

    if (role === 'MUNICIPALITY_ADMIN') {
        return <MunicipalityDashboard />;
    }

    if (role === 'VILLAGE_ADMIN' || role === 'WARD_ADMIN' || role === 'MEMBER_ADMIN') {
        return <VillageDashboard />;
    }

    // Default Fallback
    return <VillageDashboard />;
};

export default AdminDashboard;

