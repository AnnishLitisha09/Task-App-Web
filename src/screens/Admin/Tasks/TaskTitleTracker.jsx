import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, Filter, Clock, MapPin, 
    CheckCircle2, AlertCircle, ChevronRight, X,
    LayoutGrid, Activity, Calendar
} from 'lucide-react';
import api from '../../../utils/api';

const TaskTitleTracker = () => {
    const [tasks, setTasks] = useState([]);
    const [titleWiseSummary, setTitleWiseSummary] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTitle, setSelectedTitle] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedVenue, setSelectedVenue] = useState('all');
    const [lookingAtTask, setLookingAtTask] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // Default to today

    useEffect(() => {
        fetchData();
    }, [selectedDate]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Optimized: Fetch filtered tasks and specialized title stats in parallel
            const [tasksRes, statsRes] = await Promise.all([
                api(`tasks?date=${selectedDate}`),
                api(`tasks/analytics/title-wise?date=${selectedDate}`)
            ]);
            
            setTasks(Array.isArray(tasksRes) ? tasksRes : (tasksRes.items || []));
            setTitleWiseSummary(statsRes || []);
        } catch (err) {
            console.error("Failed to fetch tracking data:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredTasks = tasks.filter(task => {
        const matchesTitle = selectedTitle === 'all' || 
                             task.title === selectedTitle || 
                             task.TaskTitle?.task_title === selectedTitle;
        const matchesSearch = (task.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                             (task.Venue?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                             (task.Faculty?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
        
        const taskDate = task.date || (task.TaskTypes?.[0]?.start_date) || '';
        const matchesDate = !selectedDate || taskDate.startsWith(selectedDate);

        const statusLabel = task.is_completed ? 'completed' : 
                           (task.is_approved ? 'active' : 'pending');
        const matchesStatus = selectedStatus === 'all' || statusLabel === selectedStatus;
        const matchesVenue = selectedVenue === 'all' || task.Venue?.name === selectedVenue;
        
        return matchesTitle && matchesSearch && matchesDate && matchesStatus && matchesVenue;
    });

    const uniqueVenues = Array.from(new Set(tasks.map(t => t.Venue?.name).filter(Boolean)));

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium">Analyzing Task Streams...</p>
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="p-2 space-y-8 h-full overflow-y-auto"
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50 p-6 rounded-[24px] border border-slate-100">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Task Lifecycle Tracker</h2>
                    <p className="text-sm text-slate-500 mt-1">Filter and monitor active directives by title across all venues.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-48">
                        <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input 
                            type="date" 
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-[14px] text-sm font-bold text-slate-700 focus:border-indigo-500 outline-none transition-all shadow-sm appearance-none"
                        />
                    </div>
                    <div className="relative flex-1 md:w-64">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search active streams..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-[14px] text-sm focus:border-indigo-500 outline-none transition-all shadow-sm"
                        />
                    </div>
                    <div className="relative group">
                        <button 
                            onClick={() => setShowFilters(!showFilters)}
                            className={`p-3 rounded-[14px] border transition-all flex items-center gap-2 relative ${
                                showFilters || selectedTitle !== 'all' || selectedStatus !== 'all' || selectedVenue !== 'all'
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm' 
                                : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                            }`}
                        >
                            <Filter size={18} />
                            <span className="text-xs font-bold hidden md:block">Refine</span>
                            {(selectedTitle !== 'all' || selectedStatus !== 'all' || selectedVenue !== 'all') && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-600 rounded-full border-2 border-white"></div>
                            )}
                        </button>

                        <AnimatePresence>
                            {showFilters && (
                                <>
                                    {/* Backdrop for closing */}
                                    <div 
                                        className="fixed inset-0 z-[60]" 
                                        onClick={() => setShowFilters(false)}
                                    ></div>

                                    <motion.div 
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 mt-3 w-[320px] bg-white rounded-[24px] shadow-2xl border border-slate-100 p-6 z-[70] origin-top-right"
                                    >
                                        <div className="flex items-center justify-between mb-6">
                                            <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Precision Filters</h4>
                                            <button onClick={() => setShowFilters(false)} className="text-slate-300 hover:text-slate-600">
                                                <X size={16} />
                                            </button>
                                        </div>

                                        <div className="space-y-6">
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Operational Title</label>
                                                <div className="relative">
                                                    <select 
                                                        value={selectedTitle}
                                                        onChange={(e) => setSelectedTitle(e.target.value)}
                                                        className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer hover:border-indigo-300 transition-all appearance-none"
                                                    >
                                                        <option value="all">Every Title</option>
                                                        {Array.from(new Set(tasks.map(t => t.TaskTitle?.task_title || t.title).filter(Boolean))).sort().map(title => (
                                                            <option key={title} value={title}>{title}</option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                                                        <ChevronRight size={14} className="rotate-90" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Campus Venue</label>
                                                <div className="relative">
                                                    <select 
                                                        value={selectedVenue}
                                                        onChange={(e) => setSelectedVenue(e.target.value)}
                                                        className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer hover:border-indigo-300 transition-all appearance-none"
                                                    >
                                                        <option value="all">Every Venue</option>
                                                        {uniqueVenues.sort().map(v => (
                                                            <option key={v} value={v}>{v}</option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                                                        <ChevronRight size={14} className="rotate-90" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Stream State</label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {['all', 'active', 'pending', 'completed'].map(s => (
                                                        <button 
                                                            key={s}
                                                            onClick={() => setSelectedStatus(s)}
                                                            className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border ${
                                                                selectedStatus === s 
                                                                ? 'bg-slate-900 border-slate-900 text-white shadow-md' 
                                                                : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'
                                                            }`}
                                                        >
                                                            {s}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-8 pt-6 border-t border-slate-50 flex gap-2">
                                            <button 
                                                onClick={() => { setSelectedTitle('all'); setSelectedStatus('all'); setSelectedVenue('all'); setSearchQuery(''); setShowFilters(false); }}
                                                className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                                            >
                                                Reset All
                                            </button>
                                            <button 
                                                onClick={() => setShowFilters(false)}
                                                className="flex-1 py-3 rounded-xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                                            >
                                                Apply
                                            </button>
                                        </div>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Quick Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-5 rounded-[22px] border ${selectedTitle === 'all' ? 'border-indigo-500 bg-indigo-50 shadow-md' : 'border-slate-100 bg-white shadow-sm'} cursor-pointer hover:border-indigo-300 transition-all`}
                    onClick={() => setSelectedTitle('all')}
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-xl bg-slate-100 text-slate-600`}>
                            <LayoutGrid size={20} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md bg-slate-900 text-white shadow-sm">
                            {tasks.length} Total
                        </span>
                    </div>
                    <h4 className="font-bold text-slate-800 leading-tight mb-1">Show All Tasks</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Unified Stream</p>
                </motion.div>

                {titleWiseSummary.filter(s => s.activeCount > 0 || s.totalCount > 0).map((summary, idx) => (
                    <motion.div 
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`p-5 rounded-[22px] border ${selectedTitle === summary.task_title ? 'border-indigo-500 bg-indigo-50 shadow-md' : 'border-slate-100 bg-white shadow-sm'} cursor-pointer hover:border-indigo-300 transition-all`}
                        onClick={() => setSelectedTitle(summary.task_title)}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${summary.activeCount > 0 ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
                                <Activity size={20} />
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${summary.activeCount > 0 ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-200 text-slate-500'}`}>
                                {summary.activeCount} Active
                            </span>
                        </div>
                        <h4 className="font-bold text-slate-800 leading-tight mb-1 truncate">{summary.task_title}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Target: {summary.target_role}</p>
                    </motion.div>
                ))}
            </div>

            {/* Detailed Tasks Table */}
            <div className="bg-white border border-slate-100 rounded-[28px] shadow-xl overflow-hidden mb-10">
                <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                        Monitoring: {selectedTitle === 'all' ? 'All Active Streams' : selectedTitle}
                    </h3>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">
                        {filteredTasks.length} results
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-slate-50">
                                <th className="px-6 py-5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Ongoing Task Instance</th>
                                <th className="px-6 py-5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Venue/Zone</th>
                                <th className="px-6 py-5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Duration</th>
                                <th className="px-6 py-5"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredTasks.length > 0 ? (
                                filteredTasks.map((task, idx) => (
                                    <tr key={task.task_id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">{task.title}</span>
                                                <span className="text-[11px] text-slate-400 font-medium mt-0.5">{task.category || 'General Directive'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2 text-slate-600 text-sm">
                                                <MapPin size={14} className="text-slate-300" />
                                                <span className="font-medium">{task.Venue?.name || (task.venue_id ? `Venue #${task.venue_id}` : 'Remote/Digital')}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${task.is_completed ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></div>
                                                <span className={`text-[11px] font-black uppercase tracking-widest ${task.is_completed ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                    {task.is_completed ? 'Finished' : 'In Progress'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
                                                <Clock size={14} />
                                                <span>{task.timing || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <button 
                                                onClick={() => setLookingAtTask(task)}
                                                className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                                            >
                                                <ChevronRight size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <LayoutGrid size={48} className="text-slate-200" />
                                            <h4 className="text-slate-500 font-bold">No matching task instances found</h4>
                                            <p className="text-slate-400 text-xs">Try adjusting your filters or search criteria</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Task Detail Modal */}
            <AnimatePresence>
                {lookingAtTask && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-end p-4 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div 
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="w-full max-w-md h-full bg-white rounded-l-[32px] shadow-2xl overflow-hidden flex flex-col border-l border-slate-100"
                        >
                            <div className="p-8 bg-white border-b border-slate-50 relative">
                                <button 
                                    onClick={() => setLookingAtTask(null)}
                                    className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 text-slate-400 hover:bg-rose-500 hover:text-white transition-all"
                                >
                                    <X size={20} />
                                </button>
                                <div className="inline-block px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-4">
                                    {lookingAtTask.category || 'Institutional Directive'}
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 mb-1 leading-tight">{lookingAtTask.title}</h2>
                                <p className="text-slate-400 text-sm font-medium">Tracking Task ID: #{lookingAtTask.task_id}</p>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-8">
                                <section>
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Live Execution Details</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                            <div className="flex items-center gap-2 mb-2 text-indigo-500">
                                                <Calendar size={14} />
                                                <span className="text-[10px] font-bold uppercase">Date</span>
                                            </div>
                                            <div className="font-bold text-slate-800">{new Date(lookingAtTask.TaskTypes?.[0]?.start_date).toLocaleDateString()}</div>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                            <div className="flex items-center gap-2 mb-2 text-emerald-500">
                                                <Clock size={14} />
                                                <span className="text-[10px] font-bold uppercase">Timing</span>
                                            </div>
                                            <div className="font-bold text-slate-800">
                                                {lookingAtTask.TaskTypes?.[0]?.start_time?.slice(0, 5)} - {lookingAtTask.TaskTypes?.[0]?.end_time?.slice(0, 5)}
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Operational Summary</h4>
                                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500 font-medium">Assigned Faculty</span>
                                            <span className="font-bold text-slate-800">{lookingAtTask.Faculty?.name || 'Unassigned'}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500 font-medium">Target Venue</span>
                                            <span className="font-bold text-slate-800">{lookingAtTask.Venue?.name || 'Remote/Digital'}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500 font-medium">Priority Tier</span>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                lookingAtTask.priority === 'high' ? 'bg-rose-100 text-rose-600' : 'bg-slate-200 text-slate-600'
                                            }`}>
                                                {lookingAtTask.priority}
                                            </span>
                                        </div>
                                    </div>
                                </section>

                                {lookingAtTask.description && (
                                    <section>
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Detailed Directives</h4>
                                        <p className="text-slate-600 text-sm leading-relaxed bg-indigo-50/50 p-4 rounded-2xl italic border border-indigo-100">
                                            "{lookingAtTask.description}"
                                        </p>
                                    </section>
                                )}

                                <section>
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Performance Metrics</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center p-4">
                                            <div className="text-2xl font-black text-indigo-600">{lookingAtTask.score}</div>
                                            <div className="text-[9px] font-bold uppercase text-slate-400">Target Score</div>
                                        </div>
                                        <div className="text-center p-4">
                                            <div className="text-2xl font-black text-rose-500">{lookingAtTask.penalty_per_hour}</div>
                                            <div className="text-[9px] font-bold uppercase text-slate-400">Penalty/hr</div>
                                        </div>
                                    </div>
                                </section>
                            </div>

                            <div className="p-8 border-t border-slate-100 flex gap-3 bg-slate-50 text-[10px]">
                                <div className="flex-1 text-slate-400 italic">
                                    Last synced with operational logs at {new Date().toLocaleTimeString()}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default TaskTitleTracker;
