import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    CheckCircle2, Clock, AlertTriangle, Users, Search, 
    Calendar, RefreshCw, ChevronRight, Filter, BookOpen, 
    GraduationCap, Briefcase, Shield, UserCheck, Mail, Info
} from 'lucide-react';
import api from '../../../utils/api';
import Pagination from '../../../components/UI/Pagination/Pagination';
import UniversalModal from '../../../components/UI/UniversalModal';

// --- CONFIG ---
const ROLE_META = {
    student: { label: 'Student', icon: GraduationCap, color: '#6366f1', bg: '#e0e7ff' },
    faculty: { label: 'Faculty', icon: UserCheck, color: '#10b981', bg: '#d1fae5' },
    staff: { label: 'Staff', icon: Briefcase, color: '#3b82f6', bg: '#dbeafe' },
    'role-user': { label: 'Role User', icon: Shield, color: '#f59e0b', bg: '#fef3c7' },
    hod: { label: 'HOD', icon: Shield, color: '#8b5cf6', bg: '#ede9fe' },
    principal: { label: 'Principal', icon: Shield, color: '#ec4899', bg: '#fce7f3' },
    incharge: { label: 'Incharge', icon: Shield, color: '#06b6d4', bg: '#cffafe' },
    admin: { label: 'Admin', icon: CheckCircle2, color: '#f43f5e', bg: '#ffe4e6' },
    others: { label: 'Other', icon: Users, color: '#64748b', bg: '#f1f5f9' }
};

const AcknowledgmentTrackingPage = () => {
    const [history, setHistory] = useState([]);
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [dateRange, setDateRange] = useState(7);
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    // Modal state
    const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', description: '', type: 'info' });

    const fetchData = useCallback(async () => {
        setRefreshing(true);
        try {
            // Fetch History
            const historyData = await api(`/tasks/acknowledgments/history?days=${dateRange}`);
            setHistory(historyData.acknowledgments || []);

            // Fetch Today's Report
            const reportData = await api('/tasks/acknowledgments/unacknowledged-report');
            setReport(reportData);
        } catch (err) {
            console.error('Failed to fetch acknowledgment data:', err);
            setModalConfig({
                isOpen: true,
                title: "Fetch Failed",
                description: "Could not retrieve acknowledgment logs from the server.",
                type: "danger"
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [dateRange]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filteredHistory = history.filter(ack => {
        const matchesSearch = (ack.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                             (ack.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                             (ack.task_title || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'all' || ack.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const paginatedHistory = filteredHistory.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const getStatusStyle = (status) => {
        if (status === 'acknowledged') return { bg: '#d1fae5', text: '#059669', label: 'Completed' };
        return { bg: '#fef3c7', text: '#d97706', label: 'Pending' };
    };

    return (
        <div className="flex flex-col gap-8">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="bg-indigo-600 p-1.5 rounded-lg text-white shadow-lg shadow-indigo-100">
                            <CheckCircle2 size={16} />
                        </div>
                        <span className="text-[0.7rem] font-bold text-indigo-600 uppercase tracking-widest">Compliance Registry</span>
                    </div>
                    <h1 className="text-[2rem] font-extrabold text-slate-900 m-0 tracking-tight">Ack. Tracking Matrix</h1>
                    <p className="text-slate-500 mt-2 text-base">Monitor daily morning awareness protocols and track personnel acknowledgment status.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={fetchData}
                        className="p-3.5 rounded-2xl bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-all border border-slate-200"
                        title="Sync Records"
                    >
                        <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
                    </button>
                    <div className="bg-white border border-slate-100 px-5 py-3 rounded-2xl flex items-center gap-3 shadow-sm">
                        <div className="flex flex-col">
                            <span className="text-[0.6rem] font-bold uppercase text-slate-400 leading-none mb-1">Tracking Window</span>
                            <select 
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                                className="text-sm font-extrabold text-slate-900 bg-transparent border-none outline-none cursor-pointer"
                            >
                                <option value={1}>Last 24 Hours</option>
                                <option value={7}>Last 7 Days</option>
                                <option value={30}>Last 30 Days</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                {[
                    { 
                        title: 'Today\'s Completion', 
                        value: report ? `${Math.round(((report.total_users - report.total_unacknowledged) / report.total_users || 0) * 100)}%` : '0%',
                        sub: report ? `${report.total_users - report.total_unacknowledged} of ${report.total_users} users` : 'Syncing...',
                        icon: CheckCircle2,
                        color: '#10b981',
                        bg: '#d1fae5'
                    },
                    { 
                        title: 'Awaiting Ack.', 
                        value: report?.total_unacknowledged || 0,
                        sub: 'Protocols pending',
                        icon: Clock,
                        color: '#f59e0b',
                        bg: '#fef3c7'
                    },
                    { 
                        title: 'Faculty Compliance', 
                        value: report ? `${(report.report?.faculty?.length === 0 && report.total_users > 0) ? '100%' : 'Check List'}` : '...',
                        sub: report?.report?.faculty?.length ? `${report.report.faculty.length} Pending` : 'All Clear',
                        icon: UserCheck,
                        color: '#6366f1',
                        bg: '#e0e7ff'
                    },
                    { 
                        title: 'Student Compliance', 
                        value: report?.report?.student?.length || 0,
                        sub: 'Inactive records',
                        icon: GraduationCap,
                        color: '#f43f5e',
                        bg: '#ffe4e6'
                    }
                ].map((m, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm flex items-center gap-5 hover:border-indigo-100 transition-colors"
                    >
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: m.bg, color: m.color }}>
                            <m.icon size={28} />
                        </div>
                        <div className="min-w-0">
                            <span className="block text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest mb-1 truncate">{m.title}</span>
                            <div className="flex flex-col">
                                <span className="text-2xl font-black text-slate-900 leading-none mb-1">{m.value}</span>
                                <span className="text-[0.7rem] text-slate-500 font-medium truncate">{m.sub}</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Content Section */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
                {/* Table Filters */}
                <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Filter by name, task or email..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all text-sm font-medium"
                        />
                    </div>
                    <div className="flex gap-2">
                        <div className="relative min-w-[160px]">
                            <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <select 
                                value={roleFilter}
                                onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
                                className="w-full h-12 pl-11 pr-10 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all text-sm font-bold text-slate-600 appearance-none cursor-pointer"
                            >
                                <option value="all">All Roles</option>
                                <option value="student">Student</option>
                                <option value="faculty">Faculty</option>
                                <option value="staff">Staff</option>
                                <option value="role-user">Management</option>
                            </select>
                            <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Table Body */}
                <div className="flex-1 overflow-x-auto">
                    {loading ? (
                        <div className="p-8 space-y-4">
                            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 bg-slate-50 animate-pulse rounded-2xl" />)}
                        </div>
                    ) : paginatedHistory.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 text-slate-400">
                            <Info size={48} strokeWidth={1} className="mb-4 opacity-20" />
                            <p className="font-medium text-slate-500">No acknowledgment logs found matching your criteria</p>
                        </div>
                    ) : (
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="text-left border-b border-slate-100">
                                    <th className="px-8 py-5 text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Personnel</th>
                                    <th className="px-8 py-5 text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Protocol Group</th>
                                    <th className="px-8 py-5 text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Acknowledge Time</th>
                                    <th className="px-8 py-5 text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedHistory.map((ack, i) => {
                                    const role = ROLE_META[ack.role?.toLowerCase()] || ROLE_META.others;
                                    const status = getStatusStyle(ack.status);
                                    const RoleIcon = role.icon;
                                    const ackTime = ack.acknowledged_at ? new Date(ack.acknowledged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
                                    const ackDate = ack.acknowledge_date ? new Date(ack.acknowledge_date).toLocaleDateString([], { month: 'short', day: 'numeric' }) : '—';

                                    return (
                                        <motion.tr 
                                            key={`${ack.user_id}-${i}`}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                                        >
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold" style={{ background: role.bg, color: role.color }}>
                                                        {ack.name?.charAt(0) || '?'}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-slate-800">{ack.name}</span>
                                                        <span className="text-[0.7rem] text-slate-400">{ack.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 rounded-lg bg-slate-100 text-slate-500">
                                                        <RoleIcon size={14} />
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-600">{role.label}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-extrabold text-slate-700">{ackTime}</span>
                                                    <span className="text-[0.65rem] text-slate-400 font-bold uppercase">{ackDate}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span 
                                                    className="inline-flex items-center px-2.5 py-1 rounded-full text-[0.65rem] font-black uppercase tracking-wider"
                                                    style={{ background: status.bg, color: status.text }}
                                                >
                                                    {status.label}
                                                </span>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                <div className="p-6 bg-slate-50/30 border-t border-slate-100">
                    <Pagination 
                        currentPage={currentPage}
                        totalPages={Math.ceil(filteredHistory.length / pageSize)}
                        onPageChange={setCurrentPage}
                        itemsPerPage={pageSize}
                        totalItems={filteredHistory.length}
                        showingCount={paginatedHistory.length}
                    />
                </div>
            </div>

            <UniversalModal 
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                onConfirm={() => setModalConfig({ ...modalConfig, isOpen: false })}
                title={modalConfig.title}
                description={modalConfig.description}
                type={modalConfig.type}
                confirmText="Acknowledge"
            />
        </div>
    );
};

export default AcknowledgmentTrackingPage;
