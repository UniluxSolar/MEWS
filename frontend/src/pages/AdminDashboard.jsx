import React from 'react';
import MandalDashboard from './MandalDashboard';
import DistrictDashboard from './DistrictDashboard';
import VillageDashboard from './VillageDashboard';
import StateDashboard from './StateDashboard';

const AdminDashboard = () => {
    const adminInfo = localStorage.getItem('adminInfo') ? JSON.parse(localStorage.getItem('adminInfo')) : null;

    if (!adminInfo) {
        return <div className="p-10 text-center">Please log in.</div>;
    }

    if (adminInfo.role === 'STATE_ADMIN') {
        return <StateDashboard />;
    }

    if (adminInfo.role === 'DISTRICT_ADMIN') {
        return <DistrictDashboard />;
    }

    if (adminInfo.role === 'MANDAL_ADMIN') {
        return <MandalDashboard />;
    }

    // Default to Village Dashboard for VILLAGE_ADMIN or others
    return <VillageDashboard />;
};

export default AdminDashboard;
