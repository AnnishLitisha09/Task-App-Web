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
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Notifications</h1>
                    <p className="text-slate-500 mt-1 font-medium">Manage your alerts and task updates</p>
                </div>

                <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit">
                    <button 
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${filter === 'all' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        All
                    </button>
                    <button 
                        onClick={() => setFilter('unread')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${filter === 'unread' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Unread {unreadCount > 0 && <span className="ml-1 bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-md text-[10px]">{unreadCount}</span>}
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-4xl border border-slate-100 shadow-sm">
                    <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin"></div>
                    <p className="mt-4 text-slate-500 font-semibold">Loading notifications...</p>
                </div>
            ) : filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-4xl border border-slate-100 shadow-sm px-6 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6">
                        <Bell size={40} className="text-slate-200" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">All caught up!</h3>
                    <p className="text-slate-500 mt-2 max-w-xs">You don't have any {filter === 'unread' ? 'unread ' : ''}notifications at the moment.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredNotifications.map((notification) => (
                        <div 
                            key={notification.notification_id}
                            className={`group flex items-start gap-4 p-5 rounded-4xl border transition-all duration-300 ${
                                notification.is_read 
                                ? 'bg-white border-slate-100 opacity-80' 
                                : 'bg-white border-indigo-100 shadow-[0_10px_30px_-15px_rgba(99,102,241,0.1)] ring-1 ring-indigo-50'
                            }`}
                        >
                            <div className={`mt-1 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                                notification.is_read ? 'bg-slate-50' : 'bg-indigo-50'
                            }`}>
                                {getIcon(notification.type)}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                                    <h3 className={`font-bold text-base truncate ${notification.is_read ? 'text-slate-700' : 'text-slate-900'}`}>
                                        {notification.title}
                                    </h3>
                                    <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 whitespace-nowrap">
                                        <Clock size={12} />
                                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                    </span>
                                </div>
                                <p className={`text-sm leading-relaxed ${notification.is_read ? 'text-slate-500' : 'text-slate-600 font-medium'}`}>
                                    {notification.msg}
                                </p>

                                <div className="mt-4 flex items-center gap-3">
                                    {!notification.is_read && (
                                        <button 
                                            onClick={() => markAsRead(notification.notification_id)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold transition-all hover:bg-indigo-100"
                                        >
                                            <Check size={14} />
                                            Mark as read
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => deleteNotification(notification.notification_id)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-500 rounded-xl text-xs font-bold transition-all hover:bg-rose-100 opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={14} />
                                        Delete
                                    </button>
                                </div>
                            </div>

                            {!notification.is_read && (
                                <div className="mt-2 w-2 h-2 bg-indigo-500 rounded-full animate-pulse shrink-0"></div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NotificationsPage;
