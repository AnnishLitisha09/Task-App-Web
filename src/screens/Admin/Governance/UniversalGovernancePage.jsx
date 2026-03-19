import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, Filter, Users, GraduationCap, ArrowRight, List, Trash2, 
    Plus, User, Mail, Hash, BookOpen, Star, AlertTriangle, 
    CheckCircle2, Clock, MapPin, Calendar, Clipboard, MousePointer2,
    RefreshCw, ChevronRight, X, LayoutGrid, Info, Briefcase, Shield, UserCheck,
    Eye, Edit2, FileText, Tag, Layers, CheckSquare
} from 'lucide-react';
import api from '../../../utils/api';
import Pagination from '../../../components/UI/Pagination/Pagination';
import UniversalModal from '../../../components/UI/UniversalModal';

// --- CONFIG ---
const STATUS_COLORS = {
    pending: { bg: '#fef3c7', text: '#d97706', label: 'Pending' },
    accepted: { bg: '#d1fae5', text: '#059669', label: 'Accepted' },
    active: { bg: '#dbeafe', text: '#2563eb', label: 'Active' },
    completed: { bg: '#e0e7ff', text: '#4f46e5', label: 'Completed' },
    rejected: { bg: '#fee2e2', text: '#dc2626', label: 'Rejected' },
    paused: { bg: '#f1f5f9', text: '#475569', label: 'Paused' }
};

const PRIORITY_COLORS = {
    Critical: { bg: '#fef2f2', text: '#ef4444' },
    High: { bg: '#fff7ed', text: '#f97316' },
    Medium: { bg: '#f0f9ff', text: '#0ea5e9' },
    Low: { bg: '#f0fdf4', text: '#22c55e' }
};

const ROLE_META = {
    student: { label: 'Student', icon: GraduationCap, color: '#6366f1', bg: '#e0e7ff' },
    faculty: { label: 'Faculty', icon: UserCheck, color: '#10b981', bg: '#d1fae5' },
    staff: { label: 'Staff', icon: Briefcase, color: '#3b82f6', bg: '#dbeafe' },
    'role-user': { label: 'Role User', icon: Shield, color: '#f59e0b', bg: '#fef3c7' },
    admin: { label: 'Admin', icon: Star, color: '#f43f5e', bg: '#ffe4e6' }
};

// --- COMPONENTS ---

// User Card Component
const UserCard = ({ user, onClick }) => {
    const role = ROLE_META[user.role?.toLowerCase()] || ROLE_META.student;
    const Icon = role.icon;

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, shadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
            onClick={() => onClick(user)}
            className="bg-white border border-slate-100 rounded-2xl p-5 cursor-pointer transition-all hover:border-indigo-200 group"
        >
            <div className="flex items-start justify-between mb-4">
                <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors group-hover:text-white"
                    style={{ backgroundColor: `${role.color}15`, color: role.color }}
                >
                    <Icon size={24} className="group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex flex-col items-end">
                    <span 
                        className="text-[0.65rem] font-black px-2 py-0.5 rounded-full uppercase tracking-wider"
                        style={{ background: role.bg, color: role.color }}
                    >
                        {role.label}
                    </span>
                    <span className="text-sm font-extrabold text-slate-900 mt-1">{user.score || 0} pts</span>
                </div>
            </div>
            
            <h3 className="text-sm font-bold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">{user.name}</h3>
            <p className="text-[0.75rem] text-slate-500 mb-4 flex items-center gap-1.5">
                <Mail size={12} className="text-slate-400" /> {user.email || 'No Email'}
            </p>

            <div className="space-y-2">
                <div className="flex items-center gap-2 text-[0.75rem] text-slate-600 bg-slate-50 p-2 rounded-lg">
                    {user.role === 'staff' ? <Briefcase size={12} className="text-slate-400" /> : <BookOpen size={12} className="text-slate-400" />}
                    <span className="truncate">{user.department_name || user.designation || 'General'}</span>
                </div>
                <div className="flex items-center justify-between text-[0.7rem] font-bold uppercase tracking-tight text-slate-400 px-1">
                    <span>{user.reg_no || 'ID: ' + user.user_id}</span>
                    <span className={user.penalty > 0 ? 'text-rose-500' : ''}>
                        {user.penalty > 0 ? `-${user.penalty} Penalty` : 'Safe'}
                    </span>
                </div>
            </div>
        </motion.div>
    );
};

// ─── TASK DETAIL DRAWER ──────────────────────────────────────────────────────
const TaskDetailDrawer = ({ task, onClose }) => {
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!task) return;
        setLoading(true);
        const taskId = task.task_id || task.Task?.task_id;
        if (!taskId) return;
        setLoading(true);
        api(`/tasks/${taskId}/detail`)
            .then(d => setDetail(d))
            .catch(() => setDetail(null))
            .finally(() => setLoading(false));
    }, [task?.task_id, task?.Task?.task_id]);

    if (!task) return null;
    const sColor = STATUS_COLORS[task.status?.toLowerCase()] || STATUS_COLORS.pending;

    return (
        <motion.div
            className="fixed inset-0 z-50 flex justify-end"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
            <motion.div
                className="relative w-full max-w-[480px] bg-white h-full flex flex-col shadow-2xl overflow-y-auto"
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
                <div className="p-6 border-b border-slate-100 flex items-start justify-between sticky top-0 bg-white z-10">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[0.65rem] font-black px-2 py-0.5 rounded-full uppercase tracking-wider"
                                style={{ background: sColor.bg, color: sColor.text }}>
                                {sColor.label}
                            </span>
                        </div>
                        <h3 className="text-lg font-extrabold text-slate-900 leading-tight">{task.title || task.task_title}</h3>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors border-none">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 flex flex-col gap-6">
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { icon: MapPin, label: 'Location', value: detail?.task_types?.[0]?.venue?.name || detail?.task_types?.[0]?.location || detail?.location || task.location || '—' },
                            { icon: Calendar, label: 'Due Date', value: detail?.task_types?.[0]?.end_date ? new Date(detail.task_types[0].end_date).toLocaleDateString() : (detail?.due_date || task.due_date || task.end_date || '—') },
                            { icon: Tag, label: 'Category', value: detail?.category || task.category || '—' },
                            { icon: Layers, label: 'Task Type', value: detail?.task_types?.[0]?.task_name || detail?.task_type || task.task_type || '—' },
                        ].map(({ icon: Icon, label, value }) => (
                            <div key={label} className="bg-slate-50 rounded-xl p-3 border border-slate-100 shadow-sm">
                                <div className="flex items-center gap-1.5 text-slate-400 text-[0.65rem] font-black uppercase mb-1">
                                    <Icon size={12} /> {label}
                                </div>
                                <p className="text-slate-800 text-sm font-bold m-0">{value}</p>
                            </div>
                        ))}
                    </div>

                    {loading ? (
                         <div className="flex flex-col gap-2 p-4">
                             {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-50 animate-pulse rounded-xl" />)}
                         </div>
                    ) : ( 
                        <>
                            {detail?.description && (
                                <div>
                                    <h4 className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest mb-2">Detailed Directive</h4>
                                    <p className="text-sm text-slate-600 leading-relaxed bg-slate-100 p-4 rounded-2xl border border-slate-200">{detail.description}</p>
                                </div>
                            )}

                            {(detail?.assignees?.length > 0 || detail?.assignments?.length > 0) && (
                                <div>
                                    <h4 className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest mb-3">
                                        Target Personnel ({(detail?.assignees || detail?.assignments).length})
                                    </h4>
                                    <div className="flex flex-col gap-2">
                                        {(detail?.assignees || detail?.assignments).map((a, i) => (
                                            <div key={i} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                                                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 font-bold text-xs uppercase">
                                                    {(a.name || a.User?.name || '?').charAt(0)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-slate-800 truncate m-0">{a.name || a.User?.name || 'Unknown'}</p>
                                                    <p className="text-[0.65rem] text-slate-400 m-0 uppercase font-bold">{a.role || a.User?.role}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

// ─── EDIT TASK MODAL ──────────────────────────────────────────────────────────
const EditTaskModal = ({ task, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        title: task.title || task.task_title || '',
        location: task.location || '',
        due_date: task.due_date || task.end_date || '',
        priority: task.priority || 'Medium',
        category: task.category || ''
    });

    return (
        <motion.div 
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
            <motion.div 
                className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
            >
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-lg font-black text-slate-900 m-0">Modify Directive</h3>
                    <button onClick={onClose} className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-indigo-600 border-none transition-colors"><X size={20}/></button>
                </div>
                <div className="p-8 space-y-5">
                    <div className="space-y-2">
                        <label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest pl-1">Directive Title</label>
                        <input 
                            value={formData.title} 
                            onChange={e => setFormData({...formData, title: e.target.value})}
                            className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-bold text-slate-700"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest pl-1">Location</label>
                            <input 
                                value={formData.location} 
                                onChange={e => setFormData({...formData, location: e.target.value})}
                                className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-bold text-slate-700"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest pl-1">Priority</label>
                            <select 
                                value={formData.priority}
                                onChange={e => setFormData({...formData, priority: e.target.value})}
                                className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-bold text-slate-700 appearance-none"
                            >
                                <option value="Critical">Critical</option>
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="px-8 py-6 bg-slate-50 flex gap-3">
                    <button onClick={onClose} className="flex-1 h-12 rounded-xl border border-slate-200 text-slate-500 font-bold hover:bg-white transition-colors">Cancel</button>
                    <button onClick={() => onSave(formData)} className="flex-1 h-12 rounded-xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors">Save Changes</button>
                </div>
            </motion.div>
        </motion.div>
    );
};

// Task Assignment List
const UserTaskControl = ({ user, onBack, onAssign, onView, onUpdateStatus }) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ active: 0, pending: 0, completed: 0 });

    const fetchUserTasks = useCallback(async () => {
        if (!user?.user_id) return;
        setLoading(true);
        try {
            const response = await api(`/tasks/assigned-to/${user.user_id}`);
            const taskList = response.items || (Array.isArray(response) ? response : []);
            setTasks(taskList);
            
            const s = { active: 0, pending: 0, completed: 0 };
            taskList.forEach(t => {
                const st = (t.status || 'pending').toLowerCase();
                if (['active', 'accepted'].includes(st)) s.active++;
                else if (st === 'pending') s.pending++;
                else if (st === 'completed') s.completed++;
            });
            setStats(s);
        } catch (err) {
            console.error('Failed to fetch user tasks:', err);
        } finally {
            setLoading(false);
        }
    }, [user.user_id]);

    useEffect(() => {
        fetchUserTasks();
    }, [fetchUserTasks]);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={onBack}
                        className="p-2.5 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all border-none"
                    >
                        <X size={20} />
                    </button>
                    <div>
                        <h2 className="text-xl font-extrabold text-slate-900 m-0">{user.name}</h2>
                        <p className="text-sm text-slate-500 m-0">
                            {user.role?.toUpperCase()} • {user.reg_no || user.email}
                        </p>
                    </div>
                </div>
                <button 
                    onClick={() => onAssign(user)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold border-none cursor-pointer shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all"
                >
                    <Plus size={18} /> Assign Directives
                </button>
            </div>

            {/* Performance Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: 'Pending Approvals', value: stats.pending, icon: Clock, color: '#f59e0b' },
                    { label: 'Active Directives', value: stats.active, icon: MousePointer2, color: '#3b82f6' },
                    { label: 'Completion Rate', value: tasks.length ? `${Math.round((stats.completed / tasks.length) * 100)}%` : '0%', icon: CheckCircle2, color: '#10b981' }
                ].map((s, i) => (
                    <div key={i} className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${s.color}15`, color: s.color }}>
                            <s.icon size={20} />
                        </div>
                        <div>
                            <span className="block text-[0.7rem] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{s.label}</span>
                            <span className="text-lg font-extrabold text-slate-900 leading-none">{s.value}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden min-h-[400px]">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h3 className="text-sm font-bold text-slate-800 m-0 flex items-center gap-2">
                        <Clipboard size={16} className="text-indigo-500" /> Managed Directives
                    </h3>
                    <span className="text-[0.7rem] px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full font-bold uppercase">{tasks.length} total</span>
                </div>

                <div className="p-2">
                    {loading ? (
                        <div className="flex flex-col gap-2 p-4">
                            {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-50 animate-pulse rounded-xl" />)}
                        </div>
                    ) : tasks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                            <Clipboard size={48} strokeWidth={1} className="mb-4 opacity-20" />
                            <p className="font-medium">No tasks assigned to this user</p>
                            <button 
                                onClick={() => onAssign(user)}
                                className="mt-4 text-indigo-600 font-bold text-sm bg-transparent border-none cursor-pointer hover:underline"
                            >
                                Assign their first task
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {tasks.map((task, i) => {
                                const status = STATUS_COLORS[task.status?.toLowerCase()] || STATUS_COLORS.pending;
                                const priority = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.Low;
                                return (
                                    <motion.div 
                                        key={task.assignment_id || i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="group flex flex-col md:flex-row md:items-center justify-between p-4 bg-white border border-transparent rounded-xl hover:border-slate-100 hover:bg-slate-50 transition-all"
                                    >
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
                                                <Clipboard size={18} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <h4 className="text-sm font-bold text-slate-800 m-0 truncate">{task.title || task.Task?.title}</h4>
                                                    <span className="text-[0.65rem] font-bold px-2 py-0.5 rounded-full" style={{ background: priority.bg, color: priority.text }}>{task.priority || 'Low'}</span>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                                                    <span className="flex items-center gap-1"><MapPin size={12} /> {task.location || 'N/A'}</span>
                                                    <span className="flex items-center gap-1"><Calendar size={12} /> {task.due_date || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between md:justify-end gap-2 mt-4 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => onView(task)}
                                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all border-none shrink-0"
                                                    title="Track Progress"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                
                                                {/* Direct Status Selector */}
                                                <div className="relative">
                                                    <select 
                                                        value={task.status?.toLowerCase() || 'pending'}
                                                        onChange={(e) => onUpdateStatus(task, e.target.value, fetchUserTasks)}
                                                        className="appearance-none bg-slate-100 border-none px-3 py-1.5 pr-8 rounded-lg text-[0.65rem] font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-100 cursor-pointer hover:bg-slate-200 transition-all uppercase tracking-wider"
                                                    >
                                                        {Object.keys(STATUS_COLORS).map(s => (
                                                            <option key={s} value={s}>{STATUS_COLORS[s].label}</option>
                                                        ))}
                                                    </select>
                                                    <ChevronRight size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- MAIN PAGE ---
const UniversalGovernancePage = () => {
    const [view, setView] = useState('list'); // 'list' | 'control'
    const [selectedUser, setSelectedUser] = useState(null);
    const [trackTask, setTrackTask] = useState(null);
    const [editingTask, setEditingTask] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [roleFilter, setRoleFilter] = useState('all');
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 12;

    // Alert Modal State
    const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: '', description: '', type: 'info' });

    const fetchAllUsers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api('/users/dashboard/all');
            const flatUsers = (data.users || []).map(u => {
                const info = u.student_info || u.faculty_info || u.staff_info || u.role_user_info || {};
                return {
                    user_id: u.user_id,
                    role: u.role,
                    ...info
                };
            });
            setUsers(flatUsers);
        } catch (err) {
            console.error('Failed to fetch system users:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllUsers();
    }, [fetchAllUsers]);

    const filteredUsers = users.filter(u => {
        const matchesSearch = (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                             (u.reg_no || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                             (u.email || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDept = departmentFilter === 'all' || u.department_name === departmentFilter;
        const matchesRole = roleFilter === 'all' || u.role === roleFilter;
        return matchesSearch && matchesDept && matchesRole;
    });

    const paginatedUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    const departments = [...new Set(users.map(u => u.department_name))].filter(Boolean);
    const availableRoles = [...new Set(users.map(u => u.role))].filter(Boolean);

    const handleUserClick = (user) => {
        setSelectedUser(user);
        setView('control');
    };



    const handleAssignTask = async (user) => {
        setAlertConfig({
            isOpen: true,
            title: "Navigating to Matrix",
            description: `Redirecting to assignment matrix for ${user.name}. Please wait for session synchronization.`,
            type: "info"
        });
    };

    const handleUpdateAssignmentStatus = async (task, newStatus, onComplete) => {
        const assignmentId = task.assignment_id || task.id || task.TaskAssign?.id;
        if (!assignmentId) {
            console.error('Assignment ID missing for task:', task);
            setAlertConfig({
                isOpen: true,
                title: "Identifier Missing",
                description: "Status update failed: Missing assignment identifier in the registry.",
                type: "danger"
            });
            return;
        }
        
        try {
            await api(`/tasks/assignments/${assignmentId}/status`, {
                method: 'PUT',
                body: { status: newStatus }
            });
            if (onComplete) onComplete();
            else window.location.reload();
        } catch (err) {
            setAlertConfig({
                isOpen: true,
                title: "Transmission Failed",
                description: 'Status update failed: ' + err.message,
                type: "danger"
            });
        }
    };

    return (
        <div className="p-10 max-lg:p-8 max-md:p-6 max-sm:p-4 bg-[#fcfcfd] min-h-screen font-sans">
            <AnimatePresence mode="wait">
                {view === 'list' ? (
                    <motion.div 
                        key="list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col gap-10 max-md:gap-8"
                    >
                        {/* Header Section */}
                        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-indigo-500 text-[10px] uppercase tracking-[0.3em] mb-2 font-black opacity-80">
                                    <Users size={12} strokeWidth={3} /> Global Governance
                                </div>
                                <h1 className="text-4xl max-md:text-3xl font-black text-slate-900 tracking-tighter leading-none">
                                    System Control <span className="text-indigo-600">Matrix</span>
                                </h1>
                                <p className="text-xs text-slate-400 uppercase tracking-widest font-black opacity-60 mt-2">Institutional directives & multi-role compliance oversight</p>
                            </div>

                            <div className="flex items-center gap-3 self-end xl:self-auto">
                                <button 
                                    onClick={fetchAllUsers}
                                    className="p-4 rounded-2xl bg-white text-slate-400 hover:text-indigo-600 hover:shadow-lg transition-all border border-slate-100 shadow-sm"
                                    title="Sync Database"
                                >
                                    <RefreshCw size={20} className={loading ? 'animate-spin' : ''} strokeWidth={2.5} />
                                </button>
                                <div className="bg-emerald-50 text-emerald-700 px-6 py-3 rounded-2xl border border-emerald-100 flex items-center gap-4 shadow-sm">
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                    <div className="flex flex-col">
                                        <span className="text-[0.6rem] font-black uppercase text-emerald-600 leading-none mb-1 tracking-widest">Live Registry</span>
                                        <span className="text-sm font-black tracking-tight leading-none">{users.length} Active Accounts</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Search & Role Filters */}
                        <div className="flex flex-col xl:flex-row gap-4 bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                            <div className="flex-1 flex flex-col md:flex-row gap-4">
                                <div className="relative flex-1 group">
                                    <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                                    <input 
                                        type="text" 
                                        placeholder="Search by name, ID, or email..." 
                                        value={searchQuery}
                                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                        className="w-full h-14 pl-14 pr-6 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-indigo-100 transition-all text-sm font-bold text-slate-700 shadow-inner"
                                    />
                                </div>
                                
                                <div className="flex gap-2">
                                    <div className="relative">
                                        <Shield size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <select 
                                            value={roleFilter}
                                            onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
                                            className="h-14 pl-11 pr-10 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-indigo-500 transition-all text-sm font-bold text-slate-600 appearance-none cursor-pointer min-w-[150px]"
                                        >
                                            <option value="all">All Roles</option>
                                            {availableRoles.map(r => (
                                                <option key={r} value={r}>{ROLE_META[r]?.label || r.toUpperCase()}</option>
                                            ))}
                                        </select>
                                        <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" />
                                    </div>

                                    <div className="relative">
                                        <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <select 
                                            value={departmentFilter}
                                            onChange={(e) => { setDepartmentFilter(e.target.value); setCurrentPage(1); }}
                                            className="h-14 pl-11 pr-10 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-indigo-500 transition-all text-sm font-bold text-slate-600 appearance-none cursor-pointer min-w-[150px]"
                                        >
                                            <option value="all">All Departments</option>
                                            {departments.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                        <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Grid */}
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                    <div key={i} className="h-[220px] bg-slate-50 animate-pulse rounded-2xl" />
                                ))}
                            </div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-32 bg-slate-50/30 rounded-[32px] border-2 border-dashed border-slate-100">
                                <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-6 shadow-xl shadow-slate-200/50">
                                    <Users size={32} className="text-slate-200" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 m-0">No matching accounts found</h3>
                                <p className="text-slate-500 mt-2 max-w-[300px] text-center">Try adjusting your filters or search terms.</p>
                                <button 
                                    onClick={() => { setSearchQuery(''); setDepartmentFilter('all'); setRoleFilter('all'); }}
                                    className="mt-6 font-bold text-indigo-600 bg-indigo-50 px-6 py-2.5 rounded-xl border-none cursor-pointer hover:bg-indigo-100 transition-all"
                                >
                                    Reset All Controls
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                    {paginatedUsers.map(user => (
                                        <UserCard 
                                            key={user.user_id} 
                                            user={user} 
                                            onClick={handleUserClick}
                                        />
                                    ))}
                                </div>
                                
                                <div className="mt-4">
                                    <Pagination 
                                        currentPage={currentPage}
                                        totalPages={Math.ceil(filteredUsers.length / pageSize)}
                                        onPageChange={setCurrentPage}
                                        itemsPerPage={pageSize}
                                        totalItems={filteredUsers.length}
                                        showingCount={paginatedUsers.length}
                                    />
                                </div>
                            </>
                        )}
                    </motion.div>
                ) : (
                    <motion.div 
                        key="control"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <UserTaskControl 
                            user={selectedUser} 
                            onBack={() => setView('list')} 
                            onAssign={handleAssignTask}
                            onView={(t) => setTrackTask(t)}
                            onUpdateStatus={handleUpdateAssignmentStatus}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {trackTask && (
                    <TaskDetailDrawer 
                        task={trackTask} 
                        onClose={() => setTrackTask(null)} 
                    />
                )}
            </AnimatePresence>

            <UniversalModal
                isOpen={alertConfig.isOpen}
                onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })}
                onConfirm={() => setAlertConfig({ ...alertConfig, isOpen: false })}
                title={alertConfig.title}
                description={alertConfig.description}
                type={alertConfig.type}
                confirmText="Acknowledge"
            />
        </div>
    );
};

export default UniversalGovernancePage;
