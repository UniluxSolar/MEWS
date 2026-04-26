import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAdminLocation from '../hooks/useAdminLocation';
import API from '../api';
import {
    FaBell, FaCircle, FaBriefcase, FaGraduationCap, FaCheckCircle,
    FaExclamationCircle, FaInfoCircle, FaTrashAlt, FaCheckDouble, FaFileAlt, FaBullseye,
    FaChevronDown, FaChevronUp, FaShieldAlt
} from 'react-icons/fa';

const NotificationTable = ({ notifications, title, showCount = false }) => (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden min-h-[500px] p-6 md:p-8 animate-fadeIn">
        <h2 className="text-lg font-bold text-gray-900 mb-6">
            {title}{showCount ? ` (${notifications.length})` : ''}
        </h2>
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50 text-gray-500 text-[10px] uppercase tracking-wider border-b border-gray-100">
                            <th className="py-4 pl-6 font-bold text-left whitespace-nowrap">Type of Admin</th>
                            <th className="py-4 font-bold text-left whitespace-nowrap">Originator</th>
                            <th className="py-4 font-bold text-left whitespace-nowrap">Date of Announcement</th>
                            <th className="py-4 font-bold text-left">Message</th>
                        </tr>
                    </thead>
                    <tbody>
                        {notifications.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="py-20 text-center">
                                    <div className="flex flex-col items-center justify-center gap-4">
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                                            <FaBullseye size={30} className="text-gray-200" />
                                        </div>
                                        <p className="text-gray-400 text-sm font-medium">
                                            {title === 'Tickets Received' ? 'No tickets received.' : (title === 'Announcements' ? 'No announcements found.' : `No ${title.toLowerCase()} found.`)}
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            notifications.map((n) => (
                                <tr key={n._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                    <td className="py-4 pl-6">
                                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-[10px] font-bold whitespace-nowrap uppercase">
                                            {n.targetAudience || n.notificationType || 'System Admin'}
                                        </span>
                                    </td>
                                    <td className="py-4 text-sm font-bold text-gray-900 whitespace-nowrap">
                                        {n.senderInfo || n.title || 'System'}
                                    </td>
                                    <td className="py-4 text-xs font-medium text-gray-600 whitespace-nowrap">
                                        {new Date(n.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="py-4 pr-6">
                                        <div className="text-sm text-gray-600 leading-relaxed max-w-md">
                                            {n.message}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);

const NotificationItem = ({ 
    id, type, title, message, time, isRead, onRead, onDelete, attachments, 
    targetAudience, onClick, isSelectable, isSelected, onToggleSelect, 
    showActions, onApprove, onReject, active, relatedModel, relatedId,
    // New Props
    selectedActions = [], onToggleAction, mandalName, districtName
}) => {
    
    // Sanitize names to prevent duplication
    const cleanMandal = (targetAudience || mandalName || '').replace(/Mandal/i, '').trim();
    const cleanDistrict = (districtName || 'District').replace(/District/i, '').trim();

    const isApproveSelected = selectedActions.includes('APPROVE');
    const isForwardSelected = selectedActions.includes('FORWARD');

    const assistanceType = relatedId?.purpose ? `${relatedId.purpose} Support` : (type === 'application' ? 'Fund Application' : type);
    const applicantName = relatedId?.beneficiary ? `${relatedId.beneficiary.surname || ''} ${relatedId.beneficiary.name || ''}`.trim() : null;
    const fundAmount = relatedId?.amountRequired || 0;
    const documents = relatedId?.supportingDocuments || attachments || [];

    const getIcon = () => {
        switch (type) {
            case 'job': return <FaBriefcase className="text-blue-500" />;
            case 'application': return <FaGraduationCap className="text-green-500" />;
            case 'alert': return <FaExclamationCircle className="text-red-500" />;
            case 'success': return <FaCheckCircle className="text-green-600" />;
            case 'info': return <FaInfoCircle className="text-blue-400" />;
            default: return <FaInfoCircle className="text-gray-500" />;
        }
    };

    const isLongMessage = message.length > 300;
    const displayMessage = (isLongMessage && !active) ? message.substring(0, 300) + '...' : message;

    return (
        <div 
            onClick={onClick}
            className={`p-5 border-b border-gray-100 hover:bg-gray-50 transition-all duration-300 flex gap-4 cursor-pointer relative overflow-hidden ${active ? 'bg-blue-50/60 shadow-md z-10 ring-1 ring-blue-100 mb-2 rounded-lg mx-2 my-1' : (!isRead ? 'bg-blue-50/40' : 'bg-white')} ${(!isRead || active) ? 'before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-blue-600' : ''} ${active ? 'before:w-1.5' : ''}`}
        >
            {isSelectable && (
                <div onClick={(e) => { e.stopPropagation(); onToggleSelect(id); }} className="flex items-center justify-center shrink-0 pr-2">
                    <input 
                        type="checkbox" 
                        checked={isSelected} 
                        onChange={() => {}} 
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                </div>
            )}
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm ${!isRead ? 'bg-white text-blue-600' : 'bg-gray-50 text-gray-400'}`}>
                {getIcon()}
            </div>
            <div className="flex-1">
                <div className="flex justify-between items-start mb-1.5">
                    <div className="flex flex-col">
                        <h4 className={`text-base ${!isRead ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>{title}</h4>
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter">{assistanceType}</span>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-2 bg-gray-100 px-2 py-1 rounded-sm">{time}</span>
                </div>
                
                <div className="mb-2">
                    <p className={`text-sm leading-relaxed whitespace-pre-wrap ${!isRead ? 'text-gray-800' : 'text-gray-500'}`}>
                        {displayMessage}
                    </p>
                    {isLongMessage && !active && (
                        <div 
                            className="text-xs font-bold text-blue-600 hover:underline mt-2 flex items-center gap-1"
                        >
                            <FaChevronDown size={10} /> View Full Message
                        </div>
                    )}
                </div>

                {active && (
                    <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-y border-blue-100 py-4 mb-2">
                            <div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Request Information</span>
                                <div className="space-y-2">
                                    {applicantName && (
                                        <div className="flex justify-between text-xs bg-white/50 p-2.5 rounded-xl border border-blue-50">
                                            <span className="text-gray-500">Applicant</span>
                                            <span className="font-extrabold text-[#1e2a4a]">{applicantName}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-xs bg-white/50 p-2.5 rounded-xl border border-blue-50">
                                        <span className="text-gray-500">Assistance Type</span>
                                        <span className="font-extrabold text-blue-600 uppercase italic">{relatedId?.purpose || type}</span>
                                    </div>
                                    {fundAmount > 0 && (
                                        <div className="flex justify-between text-xs bg-green-50 p-2.5 rounded-xl border border-green-100">
                                            <span className="text-green-600 font-bold">Requested Amount</span>
                                            <span className="font-black text-green-700 text-sm">₹{fundAmount.toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {documents.length > 0 && (
                                <div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Support Documents</span>
                                    <div className="grid grid-cols-1 gap-2">
                                        {documents.map((file, idx) => (
                                            <a
                                                key={idx}
                                                href={file.startsWith('http') ? file : `${API.defaults.baseURL || ''}/${file}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="flex items-center gap-2.5 p-2.5 bg-white/80 hover:bg-white rounded-xl border border-blue-50 text-[10px] font-bold text-gray-700 transition-all hover:shadow-md hover:border-blue-200"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                                                    <FaFileAlt size={14} />
                                                </div>
                                                <span className="truncate flex-1">{file.split('/').pop()}</span>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        {relatedId?.description && (
                             <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Case Description / Reason</span>
                                <p className="text-sm italic text-gray-600 leading-relaxed">"{relatedId.description}"</p>
                             </div>
                        )}
                    </div>
                )}
                
                <div className="flex flex-wrap items-center gap-3 mb-4">
                    {!active && (message?.includes('[Forwarded from Scrutiny Admin]') || message?.includes('[ESCALATED')) && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-md text-[10px] font-bold border border-amber-100 shadow-sm">
                            <FaShieldAlt size={10} />
                            Escalated / Forwarded
                        </div>
                    )}

                    {!active && documents && documents.length > 0 && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 text-gray-600 rounded-md text-[10px] font-bold border border-gray-100">
                             <FaFileAlt size={10} /> {documents.length} attachment{documents.length !== 1 ? 's' : ''}
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-4 border-t border-gray-50 pt-3">
                    {!isRead && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onRead(id); }}
                            className="text-xs font-bold text-blue-600 hover:text-blue-800 transition flex items-center gap-1.5"
                        >
                            <FaCheckDouble size={12} /> Mark as Read
                        </button>
                    )}

                    {showActions && (
                        <div className="flex flex-wrap gap-3">
                            {/* Enhanced Approve Button */}
                            <button
                                onClick={(e) => { e.stopPropagation(); onToggleAction(id, 'APPROVE'); }}
                                className={`px-4 py-2 border rounded-xl flex items-center gap-3 transition-all duration-300 relative overflow-hidden ${isApproveSelected ? 'bg-green-600 text-white border-green-600 shadow-lg shadow-green-200 scale-[1.02]' : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'}`}
                            >
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isApproveSelected ? 'border-white bg-white/20' : 'border-green-300'}`}>
                                    {isApproveSelected && <div className="w-2.5 h-2.5 rounded-full bg-white animate-in zoom-in duration-200" />}
                                </div>
                                <div className="flex flex-col items-start leading-tight">
                                    <span className="text-xs font-black uppercase tracking-tight">Approve</span>
                                    <span className={`text-[9px] font-bold ${isApproveSelected ? 'text-green-100' : 'text-green-600/70'}`}>
                                        for this {cleanMandal} Mandal
                                    </span>
                                </div>
                            </button>

                            {/* New Forward To Button */}
                            <button
                                onClick={(e) => { e.stopPropagation(); onToggleAction(id, 'FORWARD'); }}
                                className={`px-4 py-2 border rounded-xl flex items-center gap-3 transition-all duration-300 relative overflow-hidden ${isForwardSelected ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200 scale-[1.02]' : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-green-100'}`}
                            >
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isForwardSelected ? 'border-white bg-white/20' : 'border-blue-300'}`}>
                                    {isForwardSelected && <div className="w-2.5 h-2.5 rounded-full bg-white animate-in zoom-in duration-200" />}
                                </div>
                                <div className="flex flex-col items-start leading-tight">
                                    <span className="text-xs font-black uppercase tracking-tight">Forward To</span>
                                    <span className={`text-[9px] font-bold ${isForwardSelected ? 'text-blue-100' : 'text-blue-600/70'}`}>
                                        {cleanDistrict} District
                                    </span>
                                </div>
                            </button>

                            {/* Original Reject Button - Unchanged functionalily */}
                            <button
                                onClick={(e) => { e.stopPropagation(); onReject(id); }}
                                className="px-3 py-2 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                            >
                                <FaExclamationCircle size={12} /> Reject
                            </button>
                        </div>
                    )}

                    {!showActions && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(id); }}
                            className="text-xs font-bold text-gray-400 hover:text-red-500 transition flex items-center gap-1.5"
                        >
                            <FaTrashAlt size={12} /> Remove
                        </button>
                    )}
                    
                    {active && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onClick(); }}
                            className="ml-auto text-xs font-black text-gray-400 hover:text-gray-600 transition flex items-center gap-1"
                        >
                            Collapse <FaChevronUp size={10} />
                        </button>
                    )}
                </div>
            </div>
            {!isRead && <div className="w-2 h-2 rounded-full bg-red-500 mt-2"></div>}
        </div>
    );
};

// Success Popup Component
const SuccessPopup = ({ message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full flex flex-col items-center text-center animate-in zoom-in duration-300">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-inner ring-8 ring-green-50">
                    <FaCheckCircle size={40} className="animate-in slide-in-from-bottom-4 duration-500" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">Approved Successfully</h2>
                <p className="text-gray-500 text-sm font-medium">{message || 'The request has been processed and updated.'}</p>
                <button 
                    onClick={onClose}
                    className="mt-8 px-8 py-3 bg-[#1e2a4a] text-white rounded-xl font-bold text-sm hover:bg-[#2a3b66] transition-all active:scale-95 shadow-lg shadow-gray-200"
                >
                    Dismiss
                </button>
            </div>
        </div>
    );
};

const Notifications = ({ isAdminView = false }) => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('all'); // all, unread
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState('');
    const [mandalName, setMandalName] = useState('');
    const [mandalId, setMandalId] = useState('');
    const [activeSubTab, setActiveSubTab] = useState('announcements'); // announcements, requests, tickets
    const [showSuccess, setShowSuccess] = useState(false);
    const { adminLocation } = useAdminLocation();

    useEffect(() => {
        const info = sessionStorage.getItem('savedUser') || sessionStorage.getItem('adminInfo') || sessionStorage.getItem('memberInfo');
        if (info) {
            const parsed = JSON.parse(info);
            const role = (parsed.role || '').toUpperCase().replace(/-/g, '_');
            setUserRole(role);
            setMandalName(parsed.mandal_name || '');
            setMandalId(parsed.mandal_id || '');
        }
    }, []);

    const fetchNotifications = async () => {
        try {
            const { data } = await API.get('/notifications');
            const dataArray = Array.isArray(data) ? data : [];
            
            // Filter notifications based on type and importance
            const filteredData = dataArray.filter(n => {
                const type = n.type?.toLowerCase();
                const notifType = n.notificationType?.toUpperCase();
                
                // ALWAYS show system status messages
                if (notifType === 'SYSTEM') return true;

                // FOR ADMINS: Show everything the backend sends (backend handles regional/role filtering)
                if (isAdminView) {
                    // Only hide the internal system status message if it looks like debug info
                    if (notifType === 'SYSTEM' && n.title === 'Notification System Online') return false;
                    return true;
                }

                // For Members, keep it to personal/relevant info
                return (
                    type === 'alert' || 
                    type === 'info' || 
                    type === 'success' ||
                    notifType === 'ANNOUNCEMENT' ||
                    notifType === 'SYSTEM' ||
                    n.relatedModel === 'Announcement' ||
                    n.isVirtual === true
                );
            });
            
            setNotifications(filteredData);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleMarkRead = async (id) => {
        try {
            await API.put(`/notifications/${id}/read`);
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const markAllRead = async () => {
        try {
            await API.put('/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error("Failed to mark all read", error);
        }
    };

    const [activeId, setActiveId] = useState(null);

    const handleAction = async (id, actionType, remarks = '') => {
        const notif = notifications.find(n => n._id === id);
        if (!notif || !notif.relatedId) return;

        const relatedId = notif.relatedId._id || notif.relatedId;
        const isForwarded = notif.message?.includes('[Forwarded from Scrutiny Admin]') || notif.message?.includes('[ESCALATED');

        try {
            setLoading(true);
            if (actionType === 'APPROVE') {
                // If Scrutiny, use legacy approve for auto-escalation check
                if (userRole === 'SCRUTINY_ADMIN') {
                   await API.put(`/fund-requests/${relatedId}/approve`, {
                        notes: remarks || `Approved by ${userRole} on ${new Date().toLocaleDateString()}`
                    });
                } else {
                    // District/State/etc.
                    const endpoint = isForwarded ? `/fund-requests/${relatedId}/forward-status` : `/fund-requests/${relatedId}/status`;
                    await API.put(endpoint, {
                        status: 'APPROVED',
                        remarks: remarks || `Approved by ${userRole}`
                    });
                }
                setShowSuccess(true);
            } else if (actionType === 'REJECT') {
                const endpoint = (isForwarded && (userRole === 'DISTRICT_ADMIN' || userRole === 'STATE_ADMIN')) 
                    ? `/fund-requests/${relatedId}/forward-status` 
                    : `/fund-requests/${relatedId}/status`;
                
                await API.put(endpoint, {
                    status: 'REJECTED',
                    remarks: remarks || `Rejected by ${userRole}`
                });
                alert("Request Rejected Successfully");
            } else if (actionType === 'FORWARD') {
                const forwardTo = userRole === 'DISTRICT_ADMIN' ? 'STATE' : 'DISTRICT';
                await API.post('/fund-requests/forward', {
                    notificationIds: [id],
                    forwardTo: forwardTo
                });
                alert(`Request Forwarded to ${forwardTo} Level Successfully`);
            }

            // Mark notification as read after processing
            await handleMarkRead(id);
            await fetchNotifications();
        } catch (error) {
            console.error("Action failed", error);
            alert(error.response?.data?.message || "Failed to process the request.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Remove this notification?")) return;
        try {
            await API.delete(`/notifications/${id}`);
            setNotifications(notifications.filter(n => n._id !== id));
        } catch (error) {
            console.error("Delete failed", error);
        }
    };

    const isExcludedRole = userRole === 'MEMBER' || userRole === 'SCRUTINY_ADMIN';
    const showTabs = isAdminView && !isExcludedRole;

    const filteredNotifications = (filter === 'all' ? notifications : notifications.filter(n => !n.isRead))
        .filter(n => {
            if (!showTabs) return true;

            const isAnnouncement = n.notificationType === 'ANNOUNCEMENT' || n.relatedModel === 'Announcement' || n.notificationType === 'SYSTEM';
            const isFundRequest = n.relatedModel === 'FundRequest' || n.notificationType === 'USER_REQUEST';

            if (activeSubTab === 'announcements') {
                return isAnnouncement && !isFundRequest;
            } else if (activeSubTab === 'requests') {
                return isFundRequest;
            } else {
                // Tickets Received / Others
                return !isAnnouncement && !isFundRequest;
            }
        });

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="w-full max-w-4xl mx-auto pb-12">
            {showSuccess && <SuccessPopup onClose={() => setShowSuccess(false)} />}
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 px-2 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#1e2a4a] flex items-center gap-4">
                        Notifications
                        {unreadCount > 0 && (
                            <span className="px-3 py-1 bg-red-500 text-white text-[10px] uppercase font-black rounded-full shadow-lg shadow-red-200 animate-pulse">
                                {unreadCount} New
                            </span>
                        )}
                    </h1>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2 ml-1">
                        {isAdminView ? 'Admin Control Center' : 'Official Announcements & Updates'}
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={markAllRead}
                        className="px-4 py-2 bg-white border border-gray-200 text-[#1e2a4a] text-[10px] font-black uppercase rounded-xl hover:bg-gray-50 transition shadow-sm"
                    >
                        Mark All Read
                    </button>
                    <div className="flex bg-gray-100 p-1 rounded-xl shadow-inner">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${filter === 'all' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${filter === 'unread' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Unread
                        </button>
                    </div>
                </div>
            </div>

            {showTabs && (
                <div className="flex border-b border-gray-200 mb-6 bg-white shadow-sm overflow-x-auto scrollbar-hide">
                    <button
                        onClick={() => setActiveSubTab('announcements')}
                        className={`px-8 py-4 text-[11px] font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${activeSubTab === 'announcements' ? 'border-[#1e2a4a] text-[#1e2a4a]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                    >
                        Announcements
                    </button>
                    <button
                        onClick={() => setActiveSubTab('requests')}
                        className={`px-8 py-4 text-[11px] font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${activeSubTab === 'requests' ? 'border-[#1e2a4a] text-[#1e2a4a]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                    >
                        Received Fund Requests
                    </button>
                    {!(userRole === 'MEMBER_ADMIN' || userRole === 'MEMBER') && (
                        <button
                            onClick={() => setActiveSubTab('tickets')}
                            className={`px-8 py-4 text-[11px] font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${activeSubTab === 'tickets' ? 'border-[#1e2a4a] text-[#1e2a4a]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                        >
                            Tickets Received
                        </button>
                    )}
                </div>
            )}

            {showTabs ? (
                <NotificationTable 
                    notifications={filteredNotifications} 
                    title={activeSubTab === 'announcements' ? 'Announcements' : (activeSubTab === 'requests' ? 'Received Fund Requests' : 'Tickets Received')} 
                    showCount={activeSubTab === 'tickets' || activeSubTab === 'requests'}
                />
            ) : (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden min-h-[500px]">
                    <div className="animate-fadeIn">
                        {loading && notifications.length === 0 ? (
                            <div className="py-20 flex flex-col items-center justify-center">
                                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                <p className="mt-4 text-[10px] uppercase font-black text-gray-400 tracking-widest">Loading notifications...</p>
                            </div>
                        ) : filteredNotifications.length === 0 ? (
                            <div className="py-20 flex flex-col items-center justify-center text-gray-300">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                    <FaBell size={32} className="opacity-20" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-widest">No notifications available.</span>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {filteredNotifications.map((ann) => (
                                    <NotificationItem
                                        key={ann._id}
                                        id={ann._id}
                                        {...ann}
                                        time={new Date(ann.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                        onRead={handleMarkRead}
                                        onDelete={() => handleDelete(ann._id)}
                                        onClick={() => setActiveId(activeId === ann._id ? null : ann._id)}
                                        active={activeId === ann._id}
                                        showActions={isAdminView && (ann.relatedModel === 'FundRequest' || ann.notificationType === 'USER_REQUEST')}
                                        onToggleAction={(id, type) => handleAction(id, type)}
                                        onReject={(id) => {
                                            if (window.confirm("Reject this request?")) {
                                                handleAction(id, 'REJECT');
                                            }
                                        }}
                                        mandalName={mandalName}
                                        districtName={adminLocation?.districtName || 'District'}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notifications;
