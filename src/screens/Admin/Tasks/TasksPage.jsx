import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Plus, MoreVertical,
    MapPin, Calendar, CheckCircle2,
    Clock, AlertCircle, QrCode, Camera,
    FileText, Edit3, Trash2, Eye, LayoutGrid, List
} from 'lucide-react';
import TaskDetails from './TaskDetails';
import CreateTask from './CreateTask';
import Pagination from '../../../components/UI/Pagination/Pagination';
import api from '../../../utils/api';

const TasksPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [viewMode, setViewMode] = useState('table');
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');

    const adminId = localStorage.getItem('userId');

    const fetchTasks = async () => {
        setIsLoading(true);
        try {
            // Fetch tasks created by this admin
            const response = await api(`tasks/created-by/${adminId}`);
            setTasks(response.items || []);
        } catch (err) {
            console.error("Failed to fetch tasks:", err);
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        if (adminId) fetchTasks();
    }, [adminId]);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const handleTaskClick = (task) => setSelectedTask(task);
    const handleDelete = async (taskId) => {
        if (window.confirm("Are you sure you want to delete this task?")) {
            try {
                await api(`tasks/${taskId}`, { method: 'DELETE' });
                setTasks(tasks.filter(t => t.task_id !== taskId));
            } catch (err) {
                alert("Delete failed: " + err.message);
            }
        }
    };

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             (task.category && task.category.toLowerCase().includes(searchQuery.toLowerCase()));
        
        let taskStatus = 'Active';
        if (task.is_completed) taskStatus = 'Completed';
        else if (task.is_approved === false) taskStatus = 'Review';

        const matchesStatus = statusFilter === 'all' || taskStatus === statusFilter;
        const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
        return matchesSearch && matchesStatus && matchesPriority;
    });

    // Reset pagination on filter change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter, priorityFilter]);

    // Paginated Tasks
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const paginatedTasks = filteredTasks.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);

    const stats = [
        { label: 'Total Directives', value: tasks.length.toString(), icon: FileText, color: '#6366f1' },
        { label: 'Active', value: tasks.filter(t => t.status === 'Active').length.toString(), icon: Clock, color: '#3b82f6' },
        { label: 'In Review', value: tasks.filter(t => t.status === 'Review').length.toString(), icon: AlertCircle, color: '#f59e0b' },
        { label: 'Completed', value: tasks.filter(t => t.status === 'Completed').length.toString(), icon: CheckCircle2, color: '#10b981' },
    ];

    if (selectedTask) {
        return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}><TaskDetails task={selectedTask} onBack={() => setSelectedTask(null)} /></motion.div>;
    }

    const getTaskStatus = (task) => {
        if (task.is_completed) return 'Completed';
        if (task.is_approved === false) return 'Review';
        return 'Active';
    };

    const getTaskDate = (task) => {
        if (!task.TaskType) return 'N/A';
        const data = task.TaskType;
        return data.start_date || 'Ongoing';
    };

    const getTaskLocation = (task) => {
        return task.Venue ? task.Venue.name : (task.venue_id ? `Venue #${task.venue_id}` : 'Remote');
    };

    const getAssigneeCount = (task) => {
        return task.TaskAssigns ? task.TaskAssigns.length : 0;
    };

    const getTaskMethods = (task) => {
        // Backend might have closure_ids or completionMethods array
        // For now, return a placeholder or map if available
        return ['QR Scan', 'Photo']; 
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'Critical': return '#ef4444';
            case 'High': return '#f59e0b';
            case 'Medium': return '#3b82f6';
            case 'Low': return '#64748b';
            default: return '#94a3b8';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return '#10b981';
            case 'Review': return '#f59e0b';
            case 'Active': return '#3b82f6';
            default: return '#64748b';
        }
    };

    const getMethodIcon = (method) => {
        if (method === 'QR Scan') return <QrCode size={14} className="text-indigo-500" />;
        if (method === 'Photo') return <Camera size={14} className="text-emerald-500" />;
        return <CheckCircle2 size={14} className="text-slate-400" />;
    };

    return (
        <motion.div
            className="p-6 w-full bg-white min-h-screen max-md:p-4"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* Stats Grid */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6 mb-10 max-md:grid-cols-1 max-md:gap-4">
                {stats.map((stat, idx) => (
                    <motion.div key={idx} className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center gap-5 transition-all shadow-sm hover:-translate-y-1"
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.1 }} whileHover={{ y: -5 }}>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                            <stat.icon size={24} />
                        </div>
                        <div className="flex-1">
                            <span className="block text-[0.8rem] font-bold text-slate-400 uppercase tracking-[0.05em] mb-1">{stat.label}</span>
                            <h3 className="text-[1.5rem] font-extrabold text-slate-800 m-0">{stat.value}</h3>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Header / Actions */}
            <div className="flex justify-between items-center mb-10 gap-6 max-md:flex-col max-md:items-stretch max-md:gap-4">
                <div className="relative flex-1 max-w-[480px] max-md:max-w-none">
                    <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Search directives, categories..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full py-3 pl-10 pr-3.5 bg-white border border-slate-200 rounded-xl text-[0.95rem] outline-none transition-all focus:border-indigo-500 focus:shadow-[0_0_0_4px_rgba(99,102,241,0.1)]" />
                </div>
                <div className="flex gap-3 items-center max-md:flex-col max-md:items-stretch">
                    <div className="flex gap-2 max-md:grid max-md:grid-cols-2">
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="py-2.5 px-4 bg-white border border-slate-200 rounded-[10px] text-[0.85rem] font-semibold text-slate-600 outline-none max-md:w-full">
                            <option value="all">All Status</option><option value="Active">Active</option><option value="Review">Review</option><option value="Completed">Completed</option>
                        </select>
                        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="py-2.5 px-4 bg-white border border-slate-200 rounded-[10px] text-[0.85rem] font-semibold text-slate-600 outline-none max-md:w-full">
                            <option value="all">All Priority</option><option value="Critical">Critical</option><option value="High">High</option><option value="Medium">Medium</option><option value="Low">Low</option>
                        </select>
                    </div>
                    <div className="flex gap-3 items-center">
                        <div className="flex bg-slate-100 p-1 rounded-[10px] border border-slate-200">
                            <button className={`p-2 rounded-[7px] border-none cursor-pointer flex ${viewMode === 'grid' ? 'bg-white text-indigo-500 shadow-sm' : 'bg-transparent text-slate-500'}`} onClick={() => setViewMode('grid')}><LayoutGrid size={18} /></button>
                            <button className={`p-2 rounded-[7px] border-none cursor-pointer flex ${viewMode === 'table' ? 'bg-white text-indigo-500 shadow-sm' : 'bg-transparent text-slate-500'}`} onClick={() => setViewMode('table')}><List size={18} /></button>
                        </div>
                        <button className="flex items-center gap-2 bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold border-none cursor-pointer shadow-[0_4px_12px_rgba(99,102,241,0.2)] flex-1 justify-center whitespace-nowrap" onClick={() => setIsCreating(true)}>
                            <Plus size={18} /><span className="max-sm:hidden">Create Directive</span><span className="sm:hidden">Create</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : filteredTasks.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                    <FileText size={48} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="text-lg font-bold text-slate-600">No Directives Found</h3>
                    <p className="text-slate-400">Click "Create Directive" to issue a new task.</p>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
                    {paginatedTasks.map((task, idx) => (
                        <motion.div key={task.task_id} className="bg-white rounded-[18px] border border-slate-200 p-6 flex flex-col gap-5 cursor-pointer transition-all hover:border-indigo-500 hover:-translate-y-1.5 hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.1)]"
                            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }} whileHover={{ y: -5 }}>
                            <div className="flex justify-between items-center">
                                <div className="flex gap-2">
                                    <span className="px-2.5 py-1 rounded-lg text-[0.7rem] font-bold uppercase tracking-[0.02em]" style={{ backgroundColor: `${getPriorityColor(task.priority)}15`, color: getPriorityColor(task.priority) }}>{task.priority}</span>
                                    <span className="px-2.5 py-1 rounded-lg text-[0.7rem] font-bold uppercase tracking-[0.02em]" style={{ backgroundColor: `${getStatusColor(getTaskStatus(task))}15`, color: getStatusColor(getTaskStatus(task)) }}>{getTaskStatus(task)}</span>
                                </div>
                                <button className="bg-transparent border-none text-slate-400 p-1 cursor-pointer"><MoreVertical size={16} /></button>
                            </div>
                            <div onClick={() => handleTaskClick(task)}>
                                <h3 className="text-[1.1rem] font-bold text-slate-800 m-0">{task.title}</h3>
                                <p className="text-[0.85rem] text-slate-500 mt-1 mb-0">{task.category}</p>
                                <div className="flex flex-col gap-2 mt-3">
                                    <div className="flex items-center gap-2 text-[0.85rem] text-slate-500"><MapPin size={14} className="text-slate-400" /><span>{getTaskLocation(task)}</span></div>
                                    <div className="flex items-center gap-2 text-[0.85rem] text-slate-500"><Calendar size={14} className="text-slate-400" /><span>{getTaskDate(task)}</span></div>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {getTaskMethods(task).map((method, i) => (
                                        <div key={i} className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg text-[0.75rem] font-semibold text-slate-600">{getMethodIcon(method)}<span>{method}</span></div>
                                    ))}
                                </div>
                            </div>
                            <div className="border-t border-slate-100 pt-5 flex justify-between items-center">
                                <span className="text-[0.8rem] font-bold text-slate-800">{getAssigneeCount(task)} Assignees</span>
                                <span className="bg-sky-50 text-sky-900 px-2.5 py-1 rounded-lg text-[0.8rem] font-extrabold">{task.score} pts</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-[20px] border border-slate-200 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] overflow-hidden">
                    <div className="overflow-x-auto custom-scrollbar">
                        <div className="min-w-[1000px]">
                            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_140px] px-6 py-4 bg-slate-50 text-[0.75rem] font-bold text-slate-500 uppercase border-b border-slate-100">
                                <span>Directive</span><span>Category</span><span>Priority</span><span>Status</span><span>Date</span><span>Location</span><span className="text-right">Actions</span>
                            </div>
                            {paginatedTasks.map((task) => (
                                <motion.div key={task.task_id} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_140px] px-6 py-4 items-center gap-4 border-b border-slate-100" whileHover={{ backgroundColor: '#fcfdfe' }}>
                                    <div><strong className="block text-[0.95rem] text-slate-800">{task.title}</strong><p className="text-[0.8rem] text-slate-500 m-0 mt-0.5 max-w-[300px] truncate">{task.description}</p></div>
                                    <div className="text-[0.85rem] text-slate-600">{task.category}</div>
                                    <div><span className="px-2.5 py-1 rounded-lg text-[0.7rem] font-bold uppercase" style={{ backgroundColor: `${getPriorityColor(task.priority)}15`, color: getPriorityColor(task.priority) }}>{task.priority}</span></div>
                                    <div><span className="px-2.5 py-1 rounded-lg text-[0.7rem] font-bold uppercase" style={{ backgroundColor: `${getStatusColor(getTaskStatus(task))}15`, color: getStatusColor(getTaskStatus(task)) }}>{getTaskStatus(task)}</span></div>
                                    <div className="text-[0.85rem] text-slate-600">{getTaskDate(task)}</div>
                                    <div className="text-[0.85rem] text-slate-600 truncate">{getTaskLocation(task)}</div>
                                    <div className="flex justify-end gap-2">
                                        <button className="w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-500 flex items-center justify-center cursor-pointer transition-all hover:bg-slate-100 hover:text-indigo-500 hover:border-indigo-500" onClick={() => handleTaskClick(task)}><Eye size={16} /></button>
                                        <button className="w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-500 flex items-center justify-center cursor-pointer transition-all hover:bg-slate-100 hover:text-indigo-500 hover:border-indigo-500"><Edit3 size={16} /></button>
                                        <button className="w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-500 flex items-center justify-center cursor-pointer transition-all hover:bg-red-50 hover:text-red-500 hover:border-red-200" onClick={() => handleDelete(task.task_id)}><Trash2 size={16} /></button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={setItemsPerPage}
                totalItems={filteredTasks.length}
                showingCount={paginatedTasks.length}
            />

            <AnimatePresence>
                {isCreating && <CreateTask onCancel={() => setIsCreating(false)} onSuccess={() => setIsCreating(false)} />}
            </AnimatePresence>
        </motion.div>
    );
};

export default TasksPage;
