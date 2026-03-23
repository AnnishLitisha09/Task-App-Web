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
            className="p-10 max-lg:p-8 max-md:p-6 max-sm:p-4 bg-white min-h-screen font-sans flex flex-col gap-10 max-md:gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-indigo-500 text-[10px] uppercase tracking-[0.3em] mb-2 font-bold opacity-80">
                        <Monitor size={12} strokeWidth={3} /> Security Protocols
                    </div>
                    <h1 className="text-3xl max-md:text-2xl font-bold text-slate-900 tracking-tight leading-none">
                        Active <span className="text-indigo-600">Sessions</span>
                    </h1>
                    <p className="text-xs text-slate-400 uppercase tracking-widest font-bold opacity-60 mt-2">Live authentication monitoring & system access control</p>
                </div>

                <div className="flex items-center gap-3 self-end xl:self-auto uppercase">
                    <button 
                        onClick={fetchSessions}
                        className="flex items-center gap-3 px-8 py-4 bg-white text-slate-600 rounded-[22px] text-xs font-bold tracking-widest border-2 border-slate-50 shadow-sm transition-all hover:bg-slate-50 hover:border-indigo-100 active:scale-95"
                    >
                        <RefreshCcw size={18} className={isLoading ? "animate-spin" : ""} strokeWidth={2.5} />
                        Refresh Registry
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mb-2">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-[32px] border border-slate-100 flex items-center gap-5 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.03)] hover:shadow-[0_25px_50px_-15px_rgba(0,0,0,0.07)] hover:border-indigo-100 hover:-translate-y-1 transition-all group">
                        <div className="w-16 h-16 max-sm:w-14 max-sm:h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 shadow-lg font-bold" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                            <stat.icon size={28} strokeWidth={2.5} />
                        </div>
                        <div className="flex-1">
                            <span className="block text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</span>
                            <h3 className="text-2xl max-sm:text-xl font-bold text-slate-900 tracking-tight leading-none">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Content / Search */}
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.03)] overflow-hidden min-h-[500px] flex flex-col">
                <div className="p-8 max-md:p-6 border-b border-slate-50 bg-slate-50/20">
                    <div className="relative group max-w-2xl">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
                        <input 
                            type="text" 
                            placeholder="Search via name, email or access role..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border-2 border-slate-100 rounded-[22px] py-4 pl-14 pr-6 text-[0.95rem] font-bold text-slate-700 outline-none transition-all focus:border-indigo-400 focus:shadow-[0_15px_30px_-10px_rgba(99,102,241,0.1)] placeholder:text-slate-300"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full border-collapse min-w-[800px]">
                        <thead>
                            <tr className="border-b border-slate-50 bg-white">
                                <th className="text-left py-6 px-8 text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest">Personnel Registry</th>
                                <th className="text-left py-6 px-8 text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest">Access Level</th>
                                <th className="text-left py-6 px-8 text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest">Live Status</th>
                                <th className="text-right py-6 px-8 text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="4" className="py-8 px-8"><div className="h-12 bg-slate-50 rounded-2xl w-full" /></td>
                                    </tr>
                                ))
                            ) : filteredSessions.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="py-32 text-center">
                                        <div className="flex flex-col items-center gap-4 text-slate-300">
                                            <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-2">
                                                <ShieldAlert size={40} strokeWidth={1.5} />
                                            </div>
                                            <p className="font-bold uppercase tracking-widest text-xs">Security Protocol: No Active Sessions</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredSessions.map(session => (
                                    <tr key={session.user_id} className="group hover:bg-white transition-all">
                                        <td className="py-6 px-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-[14px] bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm shadow-sm">
                                                    {session.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <span className="block font-bold text-slate-800 tracking-tight">{session.name}</span>
                                                    <span className="text-[0.7rem] text-slate-400 font-bold uppercase tracking-wide">{session.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-6 px-8">
                                            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-slate-200">
                                                {session.role}
                                            </span>
                                        </td>
                                        <td className="py-6 px-8">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Active Connection</span>
                                            </div>
                                        </td>
                                        <td className="py-6 px-8 text-right">
                                            <button 
                                                onClick={() => handleLogoutUser(session.user_id)}
                                                disabled={actionLoading === session.user_id}
                                                className="inline-flex items-center gap-2 px-6 py-3 bg-rose-50 text-rose-500 rounded-2xl font-bold text-[10px] uppercase tracking-widest border border-rose-100 cursor-pointer transition-all hover:bg-rose-500 hover:text-white hover:shadow-lg hover:shadow-rose-200 active:scale-95 disabled:opacity-50"
                                            >
                                                {actionLoading === session.user_id ? (
                                                    <RefreshCcw size={14} className="animate-spin" />
                                                ) : (
                                                    <LogOut size={14} strokeWidth={3} />
                                                )}
                                                Terminate
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
