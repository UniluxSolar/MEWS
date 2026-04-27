import React, { useState } from 'react';
import AdminHeader from '../components/AdminHeader';
import AdminSidebar from '../components/AdminSidebar';
import Notifications from './Notifications';

const AdminNotifications = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
        window.dispatchEvent(new CustomEvent('toggle-admin-sidebar'));
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col dark:bg-slate-900 transition-colors duration-300">
            <AdminHeader onToggleSidebar={toggleSidebar} />
            <div className="flex flex-1 overflow-hidden relative">
                <AdminSidebar activePage="notifications" showMobileHeader={false} />
                <main className="flex-1 overflow-y-auto bg-slate-50 relative">
                    <div className="p-4 md:p-8 lg:p-12">
                        <Notifications isAdminView={true} />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminNotifications;
