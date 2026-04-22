import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../api';
import AdminHeader from '../components/AdminHeader';
import AdminSidebar from '../components/AdminSidebar';
import { FaShieldAlt, FaEye, FaEdit, FaCheckSquare, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const AdminAuthorization = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const notification = location.state?.notification;
    const [loading, setLoading] = useState(false);
    const [isApproved, setIsApproved] = useState(notification?.isRead || false);
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        const info = sessionStorage.getItem('adminInfo') || sessionStorage.getItem('memberInfo');
        if (info) {
            setUserRole(JSON.parse(info).role);
        }
    }, []);

    const isForwarded = notification?.message?.includes('[Forwarded from Scrutiny Admin]');
    const isDistrictOrState = userRole === 'DISTRICT_ADMIN' || userRole === 'STATE_ADMIN';
    const isUserRequest = notification?.notificationType === 'USER_REQUEST' || (!notification?.notificationType && notification?.relatedModel === 'FundRequest');

    const handleAction = async (status) => {
        if (!notification || !notification.relatedId || loading) return;
        
        try {
            setLoading(true);
            const endpoint = isForwarded && isDistrictOrState
                ? `/fund-requests/${notification.relatedId}/forward-status`
                : `/fund-requests/${notification.relatedId}/status`; // Fallback for regular updates

            await API.put(endpoint, {
                status,
                remarks: `${status} by ${userRole} on ${new Date().toLocaleDateString()}`
            });
            
            // Mark notification as read as well since it's processed
            try {
                await API.put(`/notifications/${notification.id || notification._id}/read`);
            } catch (notifErr) {
                console.warn("Could not mark notification as read after processing", notifErr);
            }

            setIsApproved(status === 'APPROVED');
            alert(`Application ${status.toLowerCase()} successfully`);
            navigate('/admin/notifications');
        } catch (error) {
            console.error("Action failed", error);
            alert("Failed to process the request. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleApproveLegacy = async () => {
        if (!notification || !notification.relatedId || isApproved) return;
        
        try {
            setLoading(true);
            await API.put(`/fund-requests/${notification.relatedId}/approve`, {
                notes: `Approved by Scrutiny Admin on ${new Date().toLocaleDateString()}`
            });
            
            // Mark notification as read as well since it's processed
            try {
                await API.put(`/notifications/${notification.id || notification._id}/read`);
            } catch (notifErr) {
                console.warn("Could not mark notification as read after approval", notifErr);
            }

            setIsApproved(true);
        } catch (error) {
            console.error("Approval failed", error);
            alert("Failed to approve the application. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f3f4f6] font-sans flex flex-col dark:bg-slate-900 transition-colors duration-300">
            <AdminHeader />
            <div className="flex flex-1 overflow-hidden">
                <AdminSidebar activePage="authorization" />
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-4xl mx-auto">
                        {/* Header Section */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                            <div>
                                <h1 className="text-2xl font-bold text-[#1e2a4a] dark:text-white flex items-center gap-3">
                                    <FaShieldAlt className="text-blue-600" />
                                    Authorization Portal
                                </h1>
                                <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">
                                    Process and authorize pending scrutiny tasks
                                </p>
                            </div>

                            {/* Control Options */}
                            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1.5 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
                                {isForwarded && isDistrictOrState ? (
                                    <>
                                        {isUserRequest ? (
                                            <>
                                                <button 
                                                    onClick={() => handleAction('APPROVED')}
                                                    disabled={loading}
                                                    className="flex items-center gap-2 px-4 py-2 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 rounded-lg text-sm font-bold text-green-700 dark:text-green-400 transition-all disabled:opacity-50"
                                                >
                                                    <FaCheckCircle />
                                                    <span>Approve</span>
                                                </button>
                                                <div className="w-px h-6 bg-gray-200 dark:bg-slate-700 mx-1"></div>
                                                <button 
                                                    onClick={() => handleAction('REJECTED')}
                                                    disabled={loading}
                                                    className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 rounded-lg text-sm font-bold text-red-700 dark:text-red-400 transition-all disabled:opacity-50"
                                                >
                                                    <FaTimesCircle />
                                                    <span>Reject</span>
                                                </button>
                                            </>
                                        ) : (
                                            <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg text-sm font-bold text-gray-700 dark:text-slate-300 transition-all">
                                                <FaEye className="text-blue-500" />
                                                <span>View</span>
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg text-sm font-bold text-gray-700 dark:text-slate-300 transition-all">
                                            <FaEye className="text-blue-500" />
                                            <span>View</span>
                                        </button>
                                        {isUserRequest && (
                                            <>
                                                <div className="w-px h-6 bg-gray-200 dark:bg-slate-700 mx-1"></div>
                                                <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg text-sm font-bold text-gray-700 dark:text-slate-300 transition-all">
                                                    <FaEdit className="text-amber-500" />
                                                    <span>Edit</span>
                                                </button>
                                                <div className="w-px h-6 bg-gray-200 dark:bg-slate-700 mx-1"></div>
                                                <label className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${loading || isApproved ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-slate-700/50' : 'hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer'}`}>
                                                    <input 
                                                        type="checkbox" 
                                                        checked={isApproved}
                                                        onChange={handleApproveLegacy}
                                                        disabled={loading || isApproved}
                                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <span className="text-sm font-bold text-gray-700 dark:text-slate-300">
                                                        {isApproved ? 'Approved' : loading ? 'Processing...' : 'Approve'}
                                                    </span>
                                                </label>
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
                            {notification ? (
                                <div className="p-8">
                                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100 dark:border-slate-700">
                                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                                            <FaShieldAlt size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{notification.title}</h2>
                                            <p className="text-sm text-gray-500 dark:text-slate-400">
                                                Received on {new Date(notification.createdAt).toLocaleDateString()} at {new Date(notification.createdAt).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Message Details</label>
                                            <div className="bg-gray-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-gray-100 dark:border-slate-700/50">
                                                <p className="text-gray-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                                                    {notification.message}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Metadata</label>
                                                <div className="space-y-3">
                                                    <div className="flex justify-between p-3 bg-gray-50 dark:bg-slate-900/30 rounded-lg">
                                                        <span className="text-xs text-gray-500">Type</span>
                                                        <span className="text-xs font-bold text-gray-700 dark:text-slate-300 capitalize">{notification.type}</span>
                                                    </div>
                                                    <div className="flex justify-between p-3 bg-gray-50 dark:bg-slate-900/30 rounded-lg">
                                                        <span className="text-xs text-gray-500">Status</span>
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isApproved ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                                            {isApproved ? 'APPROVED' : 'PENDING'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {notification.targetAudience && (
                                                <div>
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Target Audience</label>
                                                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg border border-blue-100 dark:border-blue-900/30 font-bold text-xs">
                                                        {notification.targetAudience}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
                                    <div className="w-20 h-20 bg-gray-50 dark:bg-slate-900 rounded-full flex items-center justify-center text-gray-200 dark:text-slate-700 mb-6">
                                        <FaShieldAlt size={40} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">No Notification Selected</h3>
                                    <p className="text-gray-500 dark:text-slate-400 mt-2 max-w-sm">
                                        Please select a notification from the notifications section to authorize or scrutinize the details.
                                    </p>
                                    <button 
                                        onClick={() => window.history.back()}
                                        className="mt-8 px-6 py-3 bg-[#1e2a4a] text-white font-bold rounded-xl shadow-lg hover:shadow-blue-900/20 active:scale-95 transition-all"
                                    >
                                        Back to Notifications
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminAuthorization;
