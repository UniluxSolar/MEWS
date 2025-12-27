import React, { useState, useEffect } from 'react';
import API from '../api';
import {
    FaBell, FaCircle, FaBriefcase, FaGraduationCap, FaCheckCircle,
    FaExclamationCircle, FaInfoCircle, FaTrashAlt, FaCheckDouble
} from 'react-icons/fa';

const NotificationItem = ({ id, type, title, message, time, isRead, onRead, onDelete }) => {
    const getIcon = () => {
        switch (type) {
            case 'job': return <FaBriefcase className="text-blue-500" />;
            case 'application': return <FaGraduationCap className="text-green-500" />;
            case 'alert': return <FaExclamationCircle className="text-red-500" />;
            case 'success': return <FaCheckCircle className="text-green-600" />;
            default: return <FaInfoCircle className="text-gray-500" />;
        }
    };

    return (
        <div className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition flex gap-4 ${!isRead ? 'bg-blue-50/40' : 'bg-white'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${!isRead ? 'bg-white shadow-sm' : 'bg-gray-100'}`}>
                {getIcon()}
            </div>
            <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                    <h4 className={`text-sm ${!isRead ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>{title}</h4>
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-2">{time}</span>
                </div>
                <p className={`text-sm ${!isRead ? 'text-gray-800' : 'text-gray-500'} mb-2`}>{message}</p>
                <div className="flex gap-4">
                    {!isRead && (
                        <button
                            onClick={() => onRead(id)}
                            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                        >
                            <FaCheckDouble /> Mark as Read
                        </button>
                    )}
                    <button
                        onClick={() => onDelete(id)}
                        className="text-xs font-bold text-gray-400 hover:text-red-500 flex items-center gap-1"
                    >
                        <FaTrashAlt /> Remove
                    </button>
                </div>
            </div>
            {!isRead && <div className="w-2 h-2 rounded-full bg-red-500 mt-2"></div>}
        </div>
    );
};

const Notifications = () => {
    const [filter, setFilter] = useState('all'); // all, unread
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const { data } = await API.get('/notifications');
            // Format time if needed, assuming backend returns ISO string
            // For now, let's map it or rely on a helper
            // We'll trust the time string or standard formatting
            // Adding a simple time formatter logic here or in render
            setNotifications(data);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleMarkRead = async (id) => {
        try {
            await API.put(`/notifications/${id}/read`);
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await API.delete(`/notifications/${id}`);
            setNotifications(notifications.filter(n => n._id !== id));
        } catch (error) {
            console.error("Failed to delete notification", error);
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

    const filteredNotifications = filter === 'all'
        ? notifications
        : notifications.filter(n => !n.isRead);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    // Time Ago Helper
    const timeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    };

    return (
        <div className="w-full max-w-4xl mx-auto pb-12">

            <div className="flex justify-between items-end mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[#1e2a4a] flex items-center gap-3">
                        Notifications
                        {unreadCount > 0 && (
                            <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                                {unreadCount} New
                            </span>
                        )}
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Stay updated with your latest activities</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition ${filter === 'all' ? 'bg-[#1e2a4a] text-white' : 'bg-white border border-gray-200 text-gray-600'}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition ${filter === 'unread' ? 'bg-[#1e2a4a] text-white' : 'bg-white border border-gray-200 text-gray-600'}`}
                    >
                        Unread
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[400px]">
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Recent Activity</span>
                    {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-xs font-bold text-primary hover:underline">
                            Mark all as read
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading notifications...</div>
                ) : filteredNotifications.length > 0 ? (
                    <div>
                        {filteredNotifications.map(notification => (
                            <NotificationItem
                                key={notification._id}
                                id={notification._id}
                                {...notification}
                                time={timeAgo(notification.createdAt)}
                                onRead={handleMarkRead}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
                            <FaBell size={24} />
                        </div>
                        <h3 className="font-bold text-gray-800">No notifications</h3>
                        <p className="text-sm text-gray-500 mt-1">You're all caught up!</p>
                    </div>
                )}
            </div>

        </div>
    );
};

export default Notifications;
