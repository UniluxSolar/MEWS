import React from 'react';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';

const ReportsAnalytics = () => {
    return (
        <div className="min-h-screen bg-[#f3f4f6] font-sans flex flex-col">
            <AdminHeader />
            <div className="flex flex-1 overflow-hidden">
                <AdminSidebar activePage="reports" />
                <main className="flex-1 p-8">
                    <h1 className="text-2xl font-bold mb-4">Reports & Analytics</h1>
                    <p className="text-gray-500">View detailed reports and system analytics.</p>
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="h-64 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center">
                            <span className="text-gray-400">Activity Chart Placeholder</span>
                        </div>
                        <div className="h-64 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center">
                            <span className="text-gray-400">Demographics Pie Placeholder</span>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ReportsAnalytics;
