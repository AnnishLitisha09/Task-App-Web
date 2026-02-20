import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users, ShieldCheck, Clock, AlertTriangle,
    MapPin, ArrowUpRight, ShieldAlert, UserCircle, Building2,
    CheckCircle2
} from 'lucide-react';
import api from '../../../utils/api';

const AdminDashboard = () => {
    const [counts, setCounts] = useState({ students: 0, faculty: 0, staff: 0, role_users: 0, active_tasks: 0 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => { fetchStats(); }, []);

    const fetchStats = async () => {
        setIsLoading(true);
        try {
            const response = await api('/users/dashboard/stats');
            if (response.success) setCounts(response.counts);
        } catch (err) {
            console.error('Failed to fetch dashboard stats:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const stats = [
        { label: 'Total Students', value: counts.students.toLocaleString(), icon: Users, color: '#6366f1' },
        { label: 'Total Faculty', value: counts.faculty.toLocaleString(), icon: UserCircle, color: '#10b981' },
        { label: 'Total Staff', value: counts.staff.toLocaleString(), icon: Users, color: '#3b82f6' },
        { label: 'Role Users', value: counts.role_users.toLocaleString(), icon: ShieldCheck, color: '#f59e0b' },
    ];

    const alerts = [
        { id: 1, title: 'Unassigned Department', detail: 'Biotechnology Dept lacks a verified HOD.', status: 'Critical', icon: Building2, color: '#f43f5e', time: '2h ago' },
        { id: 2, title: 'Infrastructure Ownership', detail: 'Lab 402 has no assigned faculty owner.', status: 'Pending', icon: MapPin, color: '#f59e0b', time: '5h ago' },
        { id: 3, title: 'Mandatory Task Overdue', detail: 'Monthly Safety Audit is 2 days late.', status: 'Overdue', icon: AlertTriangle, color: '#f59e0b', time: '1d ago' },
        { id: 4, title: 'Role Permission Leak', detail: 'External Guest role has elevated access.', status: 'Critical', icon: ShieldAlert, color: '#f43f5e', time: '3d ago' },
    ];

    return (
        <div className="p-10 bg-slate-50 min-h-screen flex flex-col box-border font-['Inter',sans-serif] max-md:p-6">
            {/* Header */}
            <header className="flex justify-between items-start mb-10 max-md:flex-col max-md:gap-4 max-md:items-stretch">
                <div>
                    <h1 className="text-[2rem] font-extrabold text-slate-900 m-0 tracking-[-0.5px] max-md:text-[1.75rem]">Dashboard Overview</h1>
                    <p className="text-slate-500 mt-1.5 text-base">Welcome to the <strong>AdminSphere</strong> Institutional Portal</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white text-green-800 rounded-full text-[0.8rem] font-bold border border-green-100 shadow-sm">
                    <CheckCircle2 size={16} />
                    <span>System Status: Optimal</span>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6 mb-10 max-md:grid-cols-2 max-md:gap-4 max-[480px]:grid-cols-1">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_20px_-8px_rgba(0,0,0,0.05)] hover:border-indigo-500 max-md:p-5"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${stat.color}10`, color: stat.color }}>
                            <stat.icon size={22} />
                        </div>
                        <div>
                            <h3 className="text-[1.6rem] font-extrabold text-slate-900 m-0 max-md:text-[1.4rem]">{isLoading ? '...' : stat.value}</h3>
                            <p className="text-[0.8rem] font-bold text-slate-400 uppercase tracking-[0.05em] mt-0.5">{stat.label}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Governance Panel */}
            <section className="bg-white rounded-[20px] border border-slate-200 grow flex flex-col overflow-hidden shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white">
                    <div className="flex items-center gap-3">
                        <ShieldAlert size={20} className="text-indigo-500" />
                        <div>
                            <h2 className="text-[1.25rem] font-extrabold text-slate-900 m-0">Governance &amp; Compliance</h2>
                            <p className="text-xs text-slate-500 mt-1">Real-time alerts requiring administrative action</p>
                        </div>
                    </div>
                    <button className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-[18px] py-2.5 rounded-xl text-[0.85rem] font-bold text-slate-600 cursor-pointer transition-all hover:bg-white hover:text-indigo-500 hover:border-indigo-500 hover:shadow-[0_4px_12px_rgba(99,102,241,0.1)] hover:-translate-y-px">
                        <ArrowUpRight size={16} />
                        <span>Export Report</span>
                    </button>
                </div>

                <div className="px-6 py-4 pb-10 overflow-x-auto custom-scrollbar">
                    <table className="w-full border-collapse border-spacing-0 border-spacing-y-2 min-w-[800px]">
                        <thead>
                            <tr>
                                <th className="py-3 px-4 text-left text-[0.75rem] font-bold text-slate-400 uppercase tracking-[0.05em]">Issue Detail</th>
                                <th className="py-3 px-4 text-left text-[0.75rem] font-bold text-slate-400 uppercase tracking-[0.05em]">Severity</th>
                                <th className="py-3 px-4 text-left text-[0.75rem] font-bold text-slate-400 uppercase tracking-[0.05em]">Reported</th>
                                <th className="py-3 px-4 text-right text-[0.75rem] font-bold text-slate-400 uppercase tracking-[0.05em]">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {alerts.map((alert, i) => (
                                <motion.tr
                                    key={alert.id}
                                    className="bg-white hover:bg-slate-50 transition-colors"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 + (i * 0.05) }}
                                >
                                    <td className="py-4 px-4 align-middle border-t border-b border-slate-100 first:border-l first:rounded-l-xl last:border-r last:rounded-r-xl">
                                        <div className="flex items-center gap-3.5">
                                            <div className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0" style={{ backgroundColor: `${alert.color}15`, color: alert.color }}>
                                                <alert.icon size={18} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[0.95rem] font-bold text-slate-900">{alert.title}</span>
                                                <span className="text-[0.8rem] text-slate-500 mt-0.5">{alert.detail}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 align-middle border-t border-b border-slate-100">
                                        <span className="px-3 py-1 rounded-full text-[0.72rem] font-bold uppercase inline-flex" style={{ backgroundColor: `${alert.color}10`, color: alert.color }}>
                                            {alert.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 align-middle border-t border-b border-slate-100">
                                        <div className="flex items-center gap-1.5 text-slate-400 text-[0.8rem] font-semibold">
                                            <Clock size={12} />
                                            <span>{alert.time}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 align-middle border-t border-b border-slate-100 text-right">
                                        <button className="bg-slate-100 text-slate-600 border-none px-4 py-2 rounded-lg text-[0.8rem] font-bold cursor-pointer transition-all hover:bg-indigo-500 hover:text-white hover:shadow-[0_4px_12px_rgba(99,102,241,0.25)]">
                                            Resolve
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default AdminDashboard;
