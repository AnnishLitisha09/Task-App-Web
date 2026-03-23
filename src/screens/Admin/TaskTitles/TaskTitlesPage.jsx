import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckSquare, Users, Plus, Search,
    Edit2, Trash2, LayoutGrid, List, Upload, X, CheckCircle2, AlertCircle
} from 'lucide-react';
import api from '../../../utils/api';
import TaskTitleModal from '../../../components/UI/TaskTitleModal/TaskTitleModal';
import DeleteConfirmModal from '../../../components/UI/DeleteConfirmModal/DeleteConfirmModal';
import Pagination from '../../../components/UI/Pagination/Pagination';

const TaskTitlesPage = () => {
    const [taskTitles, setTaskTitles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('table');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTitle, setSelectedTitle] = useState(null);
    const [modalMode, setModalMode] = useState('create');
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [bulkResult, setBulkResult] = useState(null);
    const [isBulkUploading, setIsBulkUploading] = useState(false);
    const bulkInputRef = useRef(null);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => { fetchTaskTitles(); }, []);

    const fetchTaskTitles = async () => {
        setIsLoading(true);
        try {
            const response = await api('/tasks/titles');
            setTaskTitles(Array.isArray(response) ? response : (response.titles || []));
        } catch (err) { console.error('Failed to fetch task titles:', err); }
        finally { setIsLoading(false); }
    };

    // Reset pagination on search change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handleCreate = () => { setSelectedTitle(null); setModalMode('create'); setIsModalOpen(true); };
    const handleEdit = (title) => { setSelectedTitle(title); setModalMode('edit'); setIsModalOpen(true); };
    const handleDeleteClick = (title) => { setSelectedTitle(title); setIsDeleteOpen(true); };

    const handleDeleteConfirm = async () => {
        if (!selectedTitle) return;
        try {
            const id = selectedTitle.id;
            await api(`/tasks/titles/${id}`, { method: 'DELETE' });
            setTaskTitles(prev => prev.filter(t => t.id !== id));
        } catch (err) { console.error('Failed to delete task title:', err); }
        finally { setIsDeleteOpen(false); setSelectedTitle(null); }
    };

    const handleBulkUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsBulkUploading(true);
        setBulkResult(null);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await api('/tasks/titles/bulk', { method: 'POST', body: formData });
            setBulkResult(res);
            fetchTaskTitles();
        } catch (err) {
            setBulkResult({ error: err.message });
        } finally {
            setIsBulkUploading(false);
            e.target.value = '';
        }
    };

    const filteredTitles = taskTitles.filter(title =>
        (title.task_title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (title.target_role || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Paginated result
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const paginatedTitles = filteredTitles.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredTitles.length / itemsPerPage);

    const stats = [
        { label: 'Total Titles', value: taskTitles.length, icon: CheckSquare, color: '#6366f1' },
        { label: 'Targeting All', value: taskTitles.filter(t => t.target_role === 'all').length, icon: Users, color: '#10b981' },
    ];

    // Auto-switch view based on screen size
    useEffect(() => {
        const handleResize = () => { if (window.innerWidth < 1024) setViewMode('grid'); };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <motion.div className="p-10 max-lg:p-8 max-md:p-6 max-sm:p-4 h-full overflow-y-auto bg-white min-h-screen font-sans" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-10 max-md:mb-8">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Task Dictionary & Registry</h1>
                <p className="text-xs text-slate-400 mt-1.5 uppercase tracking-widest font-bold opacity-70">Cataloging & Protocol Naming Conventions</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6 mb-12 max-md:mb-10">
                {stats.map((stat, idx) => (
                    <motion.div key={idx} className="bg-white p-6 max-sm:p-5 rounded-[32px] border border-slate-100 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.03)] hover:shadow-[0_25px_50px_-15px_rgba(0,0,0,0.07)] hover:border-indigo-100 hover:-translate-y-1 transition-all group"
                        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                        <div className="w-16 h-16 max-sm:w-14 max-sm:h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 shadow-lg font-bold" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                            <stat.icon size={32} strokeWidth={2.5} className="max-sm:w-6 max-sm:h-6" />
                        </div>
                        <div className="flex-1">
                            <span className="block text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</span>
                            <h3 className="text-2xl max-sm:text-xl font-bold text-slate-900 tracking-tight leading-none">{stat.value}</h3>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Header */}
            <div className="flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-6 mb-12 max-md:mb-10">
                <div className="relative flex-1 max-w-2xl group">
                    <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                    <input type="text" placeholder="Search terminology or sector-specific titles..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full py-4 pl-14 pr-6 bg-white border-2 border-slate-100 rounded-[22px] text-[0.95rem] font-bold text-slate-700 outline-none transition-all focus:border-indigo-400 focus:shadow-[0_15px_30px_-10px_rgba(99,102,241,0.1)] placeholder:text-slate-300" />
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    <div className="flex bg-slate-100 p-1.5 rounded-[18px] border border-slate-200 shadow-inner max-lg:hidden">
                        <button className={`p-2.5 rounded-[13px] border-none cursor-pointer flex transition-all ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-md' : 'bg-transparent text-slate-400 hover:text-slate-600'}`} onClick={() => setViewMode('grid')}><LayoutGrid size={20} strokeWidth={2.5} /></button>
                        <button className={`p-2.5 rounded-[13px] border-none cursor-pointer flex transition-all ${viewMode === 'table' ? 'bg-white text-indigo-600 shadow-md' : 'bg-transparent text-slate-400 hover:text-slate-600'}`} onClick={() => setViewMode('table')}><List size={20} strokeWidth={2.5} /></button>
                    </div>
                    
                    <div className="flex gap-4">
                        <input ref={bulkInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleBulkUpload} />
                        <button
                            onClick={() => bulkInputRef.current?.click()}
                            disabled={isBulkUploading}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-3 border-2 border-indigo-100 text-indigo-600 bg-white px-8 py-4 rounded-[22px] text-xs font-bold uppercase tracking-widest hover:bg-indigo-50 hover:border-indigo-300 transition-all disabled:opacity-50 active:scale-95 shadow-sm"
                        >
                            <Upload size={18} strokeWidth={2.5} />
                            <span>{isBulkUploading ? 'Ingesting…' : 'Batch Ingest'}</span>
                        </button>
                        <button onClick={handleCreate} className="flex-1 sm:flex-none bg-slate-900 hover:bg-indigo-600 text-white px-8 py-4 rounded-[22px] text-xs font-bold uppercase tracking-widest shadow-xl transition-all active:scale-95 border-none cursor-pointer flex items-center justify-center gap-3">
                            <Plus size={20} strokeWidth={3} />
                            <span>Append Title</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Bulk Upload Result Banner */}
            <AnimatePresence>
                {bulkResult && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className={`mb-5 p-4 rounded-xl flex items-start gap-3 border ${bulkResult.error ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
                        {bulkResult.error ? <AlertCircle size={18} className="mt-0.5 shrink-0" /> : <CheckCircle2 size={18} className="mt-0.5 shrink-0" />}
                        <div className="flex-1">
                            {bulkResult.error
                                ? <p className="font-bold text-sm">Upload failed: {bulkResult.error}</p>
                                : <><p className="font-bold text-sm">Bulk Upload Complete!</p>
                                    <p className="text-xs mt-0.5">✅ Created: {bulkResult.success ?? 0} &nbsp;⏭ Skipped: {bulkResult.skipped ?? 0} &nbsp;❌ Errors: {bulkResult.errors?.length ?? 0}</p>
                                    {bulkResult.errors?.length > 0 && <p className="text-xs mt-1 text-red-600">{bulkResult.errors.slice(0, 3).join(', ')}</p>}
                                </>
                            }
                        </div>
                        <button onClick={() => setBulkResult(null)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Content */}
            {isLoading ? (
                <div className="py-16 flex flex-col items-center gap-4 text-slate-500">
                    <div className="w-10 h-10 border-[3px] border-slate-100 border-t-indigo-500 rounded-full animate-spin"></div>
                    <p>Loading task titles...</p>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6">
                    {paginatedTitles.map((title, idx) => (
                        <motion.div key={title.id || idx}
                            className="bg-white rounded-[20px] p-6 border border-slate-200 flex flex-col justify-between transition-all cursor-pointer gap-6 hover:-translate-y-1 hover:border-indigo-500 hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.1)]"
                            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}
                            onClick={() => handleEdit(title)}>
                            <div className="flex justify-between items-start">
                                <div className="w-11 h-11 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center shrink-0"><CheckSquare size={24} /></div>
                                <div className="flex gap-1">
                                    <button onClick={(e) => { e.stopPropagation(); handleEdit(title); }} className="bg-white border border-slate-200 rounded-[10px] p-2 text-slate-500 cursor-pointer hover:text-indigo-500 hover:border-indigo-500"><Edit2 size={16} /></button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteClick(title); }} className="bg-white border border-slate-200 rounded-[10px] p-2 text-slate-500 cursor-pointer hover:text-red-500 hover:border-red-200 hover:bg-red-50"><Trash2 size={16} /></button>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-[1.25rem] font-bold text-slate-800 m-0 mb-3 leading-tight">{title.task_title}</h3>
                                <div className="flex flex-col gap-2.5">
                                    <div className="flex items-center gap-2.5 text-slate-500 text-[0.9rem]">
                                        <Users size={14} className="text-slate-400" />
                                        <span>Role: <strong className="text-slate-700 capitalize">{title.target_role}</strong></span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-[20px] border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full border-collapse min-w-[800px]">
                            <thead>
                                <tr>
                                    {['Task Title', 'Target Role', 'Actions'].map((h, i) => (
                                        <th key={i} className={`bg-slate-50 px-5 py-4 text-left text-[0.75rem] font-bold text-slate-500 uppercase border-b border-slate-100 ${h === 'Actions' ? 'text-right' : ''}`}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {paginatedTitles.map((title, idx) => (
                                    <tr key={title.id || idx} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-5 py-4 border-b border-slate-100 text-[0.95rem] text-slate-700 font-semibold">
                                            {title.task_title}
                                        </td>
                                        <td className="px-5 py-4 border-b border-slate-100">
                                            <span className={`px-3 py-1 rounded-lg text-[0.85rem] font-semibold ${title.target_role === 'all' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                {title.target_role}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 border-b border-slate-100 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleEdit(title)} className="w-[34px] h-[34px] rounded-lg border border-slate-200 bg-white text-slate-500 flex items-center justify-center cursor-pointer hover:text-indigo-500 hover:border-indigo-500"><Edit2 size={16} /></button>
                                                <button onClick={() => handleDeleteClick(title)} className="w-[34px] h-[34px] rounded-lg border border-slate-200 bg-white text-slate-500 flex items-center justify-center cursor-pointer hover:text-red-500 hover:border-red-200 hover:bg-red-50"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={setItemsPerPage}
                totalItems={filteredTitles.length}
                showingCount={paginatedTitles.length}
            />

            <TaskTitleModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} taskTitleData={selectedTitle} mode={modalMode} onSuccess={() => { fetchTaskTitles(); setIsModalOpen(false); }} />
            <DeleteConfirmModal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={handleDeleteConfirm} title="Delete Task Title?" confirmText="Delete Title"
                message={<>Are you sure you want to remove <strong>{selectedTitle?.task_title}</strong>? This action cannot be undone.</>} />
        </motion.div>
    );
};

export default TaskTitlesPage;
