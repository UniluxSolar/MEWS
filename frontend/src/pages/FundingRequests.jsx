import React from 'react';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';

const FundingRequests = () => {
    return (
        <div className="min-h-screen bg-[#f3f4f6] font-sans flex flex-col">
            <AdminHeader />
            <div className="flex flex-1 overflow-hidden">
                <AdminSidebar activePage="funding" />
                <main className="flex-1 p-8">
                    <h1 className="text-2xl font-bold mb-4">Funding Requests</h1>
                    <p className="text-gray-500">Manage funding proposals and disbursements here.</p>
                    <div className="mt-8 p-6 bg-white rounded-xl border border-dashed border-gray-300 text-center text-gray-400">
                        No active funding requests found.
                    </div>
                </main>
            </div>
        </div>
    );
};

export default FundingRequests;
