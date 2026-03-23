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
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all'); // all, acknowledged, pending
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 12;

    // Modal state
    const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', description: '', type: 'info' });

    const fetchData = useCallback(async () => {
        setRefreshing(true);
        try {
            const reportData = await api(`/tasks/acknowledgments/unacknowledged-report?date=${selectedDate}`);
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
    }, [selectedDate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAcknowledgeUser = async (userId, name) => {
        try {
            await api('/tasks/acknowledge-general', {
                method: 'POST',
                body: JSON.stringify({ user_id: userId, date: selectedDate })
            });
            
            // Show success modal or toast
            setModalConfig({
                isOpen: true,
                title: "Success",
                description: `Successfully acknowledged schedule for ${name}.`,
                type: "success"
            });
            
            // Refresh data
            fetchData();
        } catch (err) {
            setModalConfig({
                isOpen: true,
                title: "Approval Failed",
                description: err.message || "Failed to mark as acknowledged.",
                type: "danger"
            });
        }
    };

    // Flatten all users from report for table
    const allUsers = report ? [
        ...report.report.acknowledged.map(u => ({ ...u, status: 'acknowledged' })),
        ...report.report.unacknowledged.student.map(u => ({ ...u, status: 'pending' })),
        ...report.report.unacknowledged.faculty.map(u => ({ ...u, status: 'pending' })),
        ...report.report.unacknowledged.staff.map(u => ({ ...u, status: 'pending' })),
        ...report.report.unacknowledged.hod.map(u => ({ ...u, status: 'pending' })),
        ...report.report.unacknowledged.principal.map(u => ({ ...u, status: 'pending' })),
        ...report.report.unacknowledged.incharge.map(u => ({ ...u, status: 'pending' })),
        ...report.report.unacknowledged.others.map(u => ({ ...u, status: 'pending' }))
    ] : [];

    const filteredUsers = allUsers.filter(user => {
        const matchesSearch = (user.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                             (user.email || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
        return matchesSearch && matchesRole && matchesStatus;
    });

    const paginatedUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const getStatusStyle = (status) => {
        if (status === 'acknowledged') return { bg: '#d1fae5', text: '#059669', label: 'Acknowledged' };
        return { bg: '#fee2e2', text: '#dc2626', label: 'Pending' };
    };

    return (
        <div className="p-10 max-lg:p-8 max-md:p-6 max-sm:p-4 bg-white min-h-screen font-sans flex flex-col gap-10 max-md:gap-8">
            {/* Header Section */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-indigo-500 text-[10px] uppercase tracking-[0.3em] mb-2 font-bold opacity-80">
                        <CheckCircle2 size={12} strokeWidth={3} /> Compliance Monitoring
                    </div>
                    <h1 className="text-3xl max-md:text-2xl font-bold text-slate-900 tracking-tight leading-none">
                        Acknowledgment <span className="text-indigo-600">Matrix</span>
                    </h1>
                    <p className="text-xs text-slate-400 uppercase tracking-widest font-bold opacity-60 mt-2">Daily awareness protocols & personnel tracking</p>
                </div>

                <div className="flex items-center gap-3 self-end xl:self-auto">
                    <button 
                        onClick={fetchData}
                        className="p-4 rounded-2xl bg-white text-slate-400 hover:text-indigo-600 hover:shadow-lg transition-all border border-slate-100 shadow-sm"
                        title="Sync Records"
                    >
                        <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} strokeWidth={2.5} />
                    </button>
                    <div className="bg-white border-2 border-slate-50 px-6 py-3 rounded-2xl flex items-center gap-4 shadow-sm group focus-within:border-indigo-100 transition-all">
                        <Calendar size={18} className="text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                        <input 
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="text-sm font-bold text-slate-700 bg-transparent border-none outline-none cursor-pointer"
                        />
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
                {[
                    { 
                        title: 'Completion Rate', 
                        value: report ? `${Math.round((report.total_acknowledged / report.report.total_users || 0) * 100)}%` : '0%',
                        sub: report ? `${report.total_acknowledged} of ${report.report.total_users} users` : 'Syncing...',
                        icon: CheckCircle2,
                        color: '#10b981',
                        bg: '#d1fae5'
                    },
                    { 
                        title: 'Pending Now', 
                        value: report?.total_unacknowledged || 0,
                        sub: 'Requires manual ack.',
                        icon: Clock,
                        color: '#f59e0b',
                        bg: '#fef3c7'
                    },
                    { 
                        title: 'Faculty Pending', 
                        value: report?.report?.unacknowledged?.faculty?.length || 0,
                        sub: 'Staff awaiting check',
                        icon: UserCheck,
                        color: '#6366f1',
                        bg: '#e0e7ff'
                    },
                    { 
                        title: 'Student Pending', 
                        value: report?.report?.unacknowledged?.student?.length || 0,
                        sub: 'Blocked from tasks',
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
                                <span className="text-2xl max-md:text-xl font-bold text-slate-900 leading-none mb-1">{m.value}</span>
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
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all text-sm font-medium"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select 
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                            className="h-12 px-4 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all text-sm font-bold text-slate-600 cursor-pointer"
                        >
                            <option value="all">All Status</option>
                            <option value="acknowledged">Acknowledged</option>
                            <option value="pending">Pending</option>
                        </select>
                        <select 
                            value={roleFilter}
                            onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
                            className="h-12 px-4 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all text-sm font-bold text-slate-600 cursor-pointer"
                        >
                            <option value="all">All Roles</option>
                            <option value="student">Student</option>
                            <option value="faculty">Faculty</option>
                            <option value="staff">Staff</option>
                            <option value="role-user">Management</option>
                        </select>
                    </div>
                </div>

                {/* Table Body */}
                <div className="flex-1 overflow-x-auto">
                    {loading ? (
                        <div className="p-8 space-y-4">
                            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 bg-slate-50 animate-pulse rounded-2xl" />)}
                        </div>
                    ) : paginatedUsers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 text-slate-400">
                            <Info size={48} strokeWidth={1} className="mb-4 opacity-20" />
                            <p className="font-medium text-slate-500">No users found matching your criteria</p>
                        </div>
                    ) : (
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="text-left border-b border-slate-100">
                                    <th className="px-8 py-5 text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Personnel</th>
                                    <th className="px-8 py-5 text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Role</th>
                                    <th className="px-8 py-5 text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Ack. Status</th>
                                    <th className="px-8 py-5 text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedUsers.map((user, i) => {
                                    const role = ROLE_META[user.role?.toLowerCase()] || ROLE_META.others;
                                    const statusStyle = getStatusStyle(user.status);
                                    const RoleIcon = role.icon;
                                    const ackTime = user.acknowledged_at ? new Date(user.acknowledged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';

                                    return (
                                        <motion.tr 
                                            key={`${user.user_id}-${i}`}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="border-b border-slate-50 hover:bg-white transition-colors"
                                        >
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold" style={{ background: role.bg, color: role.color }}>
                                                        {user.name?.charAt(0) || '?'}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-slate-800">{user.name}</span>
                                                        <span className="text-[0.7rem] text-slate-400">{user.email}</span>
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
                                                    <span 
                                                        className="inline-flex items-center px-2.5 py-1 rounded-full text-[0.6rem] font-bold uppercase tracking-wider w-fit"
                                                        style={{ background: statusStyle.bg, color: statusStyle.text }}
                                                    >
                                                        {statusStyle.label}
                                                    </span>
                                                    {user.acknowledged_at && (
                                                        <span className="text-[0.65rem] text-slate-400 font-bold mt-1">at {ackTime}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                {user.status === 'pending' ? (
                                                    <button 
                                                        onClick={() => handleAcknowledgeUser(user.user_id, user.name)}
                                                        className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-100"
                                                    >
                                                        Approve
                                                    </button>
                                                ) : (
                                                    <div className="text-emerald-500 pr-4">
                                                        <CheckCircle2 size={20} />
                                                    </div>
                                                )}
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
                        totalPages={Math.ceil(filteredUsers.length / pageSize)}
                        onPageChange={setCurrentPage}
                        itemsPerPage={pageSize}
                        totalItems={filteredUsers.length}
                        showingCount={paginatedUsers.length}
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
                confirmText="Okay"
            />
        </div>
    );
};

export default AcknowledgmentTrackingPage;
