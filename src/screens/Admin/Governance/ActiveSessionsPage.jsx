import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    Users, 
    Monitor, 
    LogOut, 
    RefreshCcw, 
    Search,
    ShieldAlert,
    CheckCircle2,
    Clock
} from 'lucide-react';
import api from '../../../utils/api';

const ActiveSessionsPage = () => {
    const [sessions, setSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [actionLoading, setActionLoading] = useState(null);

    const fetchSessions = async () => {
        setIsLoading(true);
        try {
            const data = await api('auth/active-sessions');
            setSessions(data || []);
        } catch (err) {
            console.error("Failed to fetch active sessions:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    const handleLogoutUser = async (userId) => {
        if (!window.confirm("Are you sure you want to force logout this user from all devices?")) return;
        
        setActionLoading(userId);
        try {
            await api(`auth/admin/logout/${userId}`, { method: 'POST' });
            setSessions(sessions.filter(s => s.user_id !== userId));
        } catch (err) {
            alert("Logout failed: " + err.message);
        } finally {
            setActionLoading(null);
        }
    };

    const filteredSessions = sessions.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = [
        { label: 'Total Active', value: sessions.length, icon: Users, color: '#6366f1' },
        { label: 'Online Status', value: 'Live', icon: CheckCircle2, color: '#10b981' },
        { label: 'System Health', value: 'Stable', icon: RefreshCcw, color: '#3b82f6' },
    ];

    return (
        <motion.div 
            className="flex flex-col gap-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* Stats */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-5 shadow-sm">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <span className="block text-[0.8rem] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{stat.label}</span>
                            <h3 className="text-2xl font-black text-slate-800 m-0">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Header / Search */}
            <div className="flex flex-col gap-6 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center max-md:flex-col max-md:items-stretch gap-4">
                    <div>
                        <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
                            <Monitor className="text-indigo-500" />
                            Live Sessions
                        </h2>
                        <p className="text-sm text-slate-500 font-medium">Manage and monitor currently authenticated users in the system.</p>
                    </div>
                    <button 
                        onClick={fetchSessions}
                        className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold border-none cursor-pointer transition-all hover:bg-slate-200"
                    >
                        <RefreshCcw size={18} className={isLoading ? "animate-spin" : ""} />
                        Refresh List
                    </button>
                </div>

                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by name, email or role..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-[0.95rem] outline-none transition-all focus:bg-white focus:border-indigo-500 focus:shadow-[0_0_0_4px_rgba(99,102,241,0.15)]"
                    />
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="text-left py-4 px-2 text-[0.75rem] font-black text-slate-400 uppercase tracking-widest">User</th>
                                <th className="text-left py-4 px-2 text-[0.75rem] font-black text-slate-400 uppercase tracking-widest">Role</th>
                                <th className="text-left py-4 px-2 text-[0.75rem] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="text-right py-4 px-2 text-[0.75rem] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse border-b border-slate-50">
                                        <td colSpan="4" className="py-4 px-2 h-16 bg-slate-50/50 rounded-lg"></td>
                                    </tr>
                                ))
                            ) : filteredSessions.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3 text-slate-400">
                                            <ShieldAlert size={40} strokeWidth={1.5} />
                                            <p className="font-bold">No active sessions found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredSessions.map(session => (
                                    <tr key={session.user_id} className="border-b border-slate-50 group hover:bg-slate-50/50 transition-colors">
                                        <td className="py-5 px-2">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                                                    {session.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <span className="block font-bold text-slate-800">{session.name}</span>
                                                    <span className="text-xs text-slate-400 font-medium">{session.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-5 px-2">
                                            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-wider">
                                                {session.role}
                                            </span>
                                        </td>
                                        <td className="py-5 px-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                                <span className="text-xs font-bold text-emerald-600 uppercase">Active</span>
                                            </div>
                                        </td>
                                        <td className="py-5 px-2 text-right">
                                            <button 
                                                onClick={() => handleLogoutUser(session.user_id)}
                                                disabled={actionLoading === session.user_id}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-500 rounded-xl font-bold text-xs border border-rose-100 cursor-pointer transition-all hover:bg-rose-500 hover:text-white disabled:opacity-50"
                                            >
                                                {actionLoading === session.user_id ? (
                                                    <RefreshCcw size={14} className="animate-spin" />
                                                ) : (
                                                    <LogOut size={14} />
                                                )}
                                                Force Logout
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
};

export default ActiveSessionsPage;
