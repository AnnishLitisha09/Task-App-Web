import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, Trash2, Clock, Info, AlertTriangle, Check, ShieldAlert } from 'lucide-react';
import api from '../../utils/api';
import { formatDistanceToNow } from 'date-fns';

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, unread

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const data = await api('/notifications');
            setNotifications(data.notifications || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api(`/notifications/${id}/read`, { method: 'PUT' });
            setNotifications(notifications.map(n => 
                n.notification_id === id ? { ...n, is_read: true } : n
            ));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const deleteNotification = async (id) => {
        try {
            await api(`/notifications/${id}`, { method: 'DELETE' });
            setNotifications(notifications.filter(n => n.notification_id !== id));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'task_created': return <Bell className="text-blue-500" />;
            case 'task_approved': return <CheckCircle className="text-emerald-500" />;
            case 'task_rejected': return <AlertTriangle className="text-rose-500" />;
            case 'task_escalation': return <ShieldAlert className="text-amber-500" />;
            case 'task_approval_request': return <Info className="text-indigo-500" />;
            default: return <Bell className="text-slate-400" />;
        }
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread') return !n.is_read;
        return true;
    });

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                <div className="min-w-0">
                    <h1 className="text-[2rem] font-extrabold text-slate-900 tracking-tight m-0 max-sm:text-[1.75rem] truncate">Notifications Center</h1>
                    <p className="text-slate-500 mt-1.5 text-base max-sm:text-sm font-medium italic">Manage your real-time alerts and activity updates</p>
                </div>

                <div className="flex items-center gap-2.5 p-1.5 bg-slate-100/80 backdrop-blur-sm rounded-2xl w-fit max-sm:w-full">
                    <button 
                        onClick={() => setFilter('all')}
                        className={`flex-1 min-w-[100px] px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 border-none cursor-pointer ${filter === 'all' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Detailed Feed
                    </button>
                    <button 
                        onClick={() => setFilter('unread')}
                        className={`flex-1 min-w-[100px] px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 border-none cursor-pointer ${filter === 'unread' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        New {unreadCount > 0 && <span className="ml-1.5 bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-lg text-[10px] tabular-nums">{unreadCount}</span>}
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[32px] border border-slate-100 shadow-sm">
                    <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-500 rounded-full animate-spin"></div>
                    <p className="mt-4 text-slate-400 font-bold uppercase tracking-wider text-[0.65rem]">Synchronizing Alerts...</p>
                </div>
            ) : filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[32px] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] px-6 text-center">
                    <div className="w-20 h-20 bg-indigo-50 text-indigo-300 rounded-[28px] flex items-center justify-center mb-6 shadow-inner ring-4 ring-indigo-50/50">
                        <Bell size={40} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-xl font-extrabold text-slate-800">Workspace Clear</h3>
                    <p className="text-slate-500 mt-2 max-w-xs text-sm leading-relaxed font-medium">You've addressed all notification items in this category.</p>
                </div>
            ) : (
                <div className="grid gap-5">
                    {filteredNotifications.map((notification) => (
                        <div 
                            key={notification.notification_id}
                            className={`group relative flex items-start gap-5 p-6 rounded-[28px] border transition-all duration-300 max-md:p-5 max-sm:gap-4 ${
                                notification.is_read 
                                ? 'bg-white border-slate-100 opacity-70 grayscale-[0.5]' 
                                : 'bg-white border-indigo-100 shadow-[0_15px_45px_-15px_rgba(99,102,241,0.12)] ring-1 ring-indigo-50/50'
                            }`}
                        >
                            <div className={`mt-0.5 w-[56px] h-[56px] rounded-[20px] flex items-center justify-center shrink-0 shadow-sm max-sm:w-11 max-sm:h-11 ${
                                notification.is_read ? 'bg-slate-50 text-slate-400' : 'bg-indigo-500 text-white shadow-indigo-100'
                            }`}>
                                {getIcon(notification.type)}
                            </div>

                            <div className="flex-1 min-w-0 pr-2">
                                <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                                    <h3 className={`font-extrabold text-[1.1rem] truncate max-w-[85%] max-sm:text-base ${notification.is_read ? 'text-slate-700' : 'text-slate-900'}`}>
                                        {notification.title}
                                    </h3>
                                    <span className="text-[10px] font-black text-slate-400 flex items-center gap-1.5 whitespace-nowrap bg-slate-50 px-2.5 py-1.5 rounded-xl uppercase tracking-wider">
                                        <Clock size={12} />
                                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                    </span>
                                </div>
                                <p className={`text-[0.95rem] leading-relaxed max-sm:text-[0.875rem] ${notification.is_read ? 'text-slate-500' : 'text-slate-600 font-bold'}`}>
                                    {notification.msg}
                                </p>

                                <div className="mt-5 flex items-center gap-3">
                                    {!notification.is_read && (
                                        <button 
                                            onClick={() => markAsRead(notification.notification_id)}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black transition-all hover:bg-indigo-600 hover:text-white border-none cursor-pointer active:scale-95 shadow-sm"
                                        >
                                            <Check size={16} />
                                            <span>Mark Resolved</span>
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => deleteNotification(notification.notification_id)}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-100 text-slate-400 rounded-xl text-xs font-black transition-all hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100 cursor-pointer active:scale-95 sm:opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={16} />
                                        <span>Archive</span>
                                    </button>
                                </div>
                            </div>

                            {!notification.is_read && (
                                <div className="absolute top-6 right-6 w-2.5 h-2.5 bg-indigo-500 rounded-full animate-ping shrink-0 sm:hidden"></div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NotificationsPage;
