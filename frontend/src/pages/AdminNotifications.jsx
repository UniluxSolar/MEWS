import React from 'react';
import AdminHeader from '../components/AdminHeader';
import AdminSidebar from '../components/AdminSidebar';
import Notifications from './Notifications';

const AdminNotifications = () => {
    return (
        <div className="min-h-screen bg-[#f3f4f6] font-sans flex flex-col dark:bg-slate-900 transition-colors duration-300">
            <AdminHeader />
            <div className="flex flex-1 overflow-hidden">
                <AdminSidebar activePage="notifications" />
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    <Notifications isAdminView={true} />
                </main>
            </div>
        </div>
    );
};

export default AdminNotifications;
