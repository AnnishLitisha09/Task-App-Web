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

    const handleDownloadReport = async (type: 'venue' | 'resource') => {
        try {
            const endpoint = type === 'venue' ? '/resources/venues/export' : '/resources/export';
            const response = await api(endpoint, {
                method: 'GET',
                responseType: 'blob' // We will assume the frontend `api` handles blob or we fetch it natively if needed.
            });

            // Note: Since standard api wrapper might not support blob easily, using fetch directly:
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5000/api${endpoint}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `admin_${type}_utilisation_${Date.now()}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error(`Failed to download ${type} report:`, error);
        }
    };

    return (
        <div className="p-10 bg-white min-h-screen flex flex-col box-border font-['Inter',sans-serif] max-lg:p-8 max-md:p-6 max-sm:p-4">
            {/* Header */}
            <header className="flex justify-between items-start mb-10 max-md:mb-8 max-sm:mb-6 max-md:flex-col max-md:gap-4 max-md:items-stretch">
                <div className="min-w-0">
                    <h1 className="text-[2rem] font-extrabold text-slate-900 m-0 tracking-[-0.5px] max-md:text-[1.75rem] max-sm:text-[1.5rem] truncate">Dashboard Overview</h1>
                    <p className="text-slate-500 mt-1.5 text-base max-sm:text-sm">Welcome to the <strong>AdminSphere</strong> Institutional Portal</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-[0.75rem] font-bold border border-emerald-100 shadow-sm w-fit">
                    <CheckCircle2 size={16} />
                    <span>System Status: Optimal</span>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6 mb-10 max-lg:gap-5 max-md:grid-cols-2 max-sm:grid-cols-2 max-md:mb-8">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_20px_-8px_rgba(0,0,0,0.05)] hover:border-indigo-500 max-lg:p-5 max-sm:p-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 max-sm:w-11 max-sm:h-11" style={{ background: `${stat.color}10`, color: stat.color }}>
                            <stat.icon size={22} className="max-sm:size-5" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-[1.6rem] font-extrabold text-slate-900 m-0 max-md:text-[1.4rem] max-sm:text-[1.25rem] truncate">{isLoading ? '...' : stat.value}</h3>
                            <p className="text-[0.8rem] font-bold text-slate-400 uppercase tracking-[0.05em] mt-0.5 truncate">{stat.label}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* System Reports Panel */}
            <section className="bg-white rounded-[24px] border border-slate-200 grow flex flex-col overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white max-sm:px-5 max-sm:py-5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 text-indigo-500 rounded-lg">
                            <ShieldAlert size={20} />
                        </div>
                        <div>
                            <h2 className="text-[1.25rem] font-extrabold text-slate-900 m-0 max-sm:text-base">System Reports & Analytics</h2>
                            <p className="text-xs text-slate-500 mt-1 max-sm:hidden">Download comprehensive administrative data and utilisation logs.</p>
                        </div>
                    </div>
                </div>

                <div className="p-8 grid grid-cols-2 gap-6 max-lg:grid-cols-1 max-sm:p-5 max-sm:gap-4">
                    {/* Venue Report Card */}
                    <div className="group border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 hover:border-indigo-300 transition-all shadow-sm bg-white hover:shadow-md">
                        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            <Building2 size={28} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-slate-900 max-sm:text-base">Venue Utilisation Report</h3>
                            <p className="text-sm text-slate-500 mt-1 mb-4 line-clamp-2 max-sm:text-xs">View occupancy, booking trends, and maintenance logs across all institutional venues.</p>
                            <button
                                onClick={() => handleDownloadReport('venue')}
                                className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:text-indigo-600 hover:border-indigo-600 hover:shadow-sm transition-all active:scale-95 max-sm:w-full max-sm:justify-center"
                            >
                                <ArrowUpRight size={16} />
                                Download .xlsx
                            </button>
                        </div>
                    </div>

                    {/* Resource Report Card */}
                    <div className="group border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 hover:border-emerald-300 transition-all shadow-sm bg-white hover:shadow-md">
                        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                            <MapPin size={28} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-slate-900 max-sm:text-base">Resource Inventory Report</h3>
                            <p className="text-sm text-slate-500 mt-1 mb-4 line-clamp-2 max-sm:text-xs">Full breakdown of physical resources, health statuses, and asset tracking histories.</p>
                            <button
                                onClick={() => handleDownloadReport('resource')}
                                className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:text-emerald-600 hover:border-emerald-600 hover:shadow-sm transition-all active:scale-95 max-sm:w-full max-sm:justify-center"
                            >
                                <ArrowUpRight size={16} />
                                Download .xlsx
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AdminDashboard;
