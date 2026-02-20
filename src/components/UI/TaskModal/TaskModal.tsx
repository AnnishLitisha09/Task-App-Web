import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, ClipboardList, Target, MapPin,
    Calendar, Info, CheckCircle2, QrCode, Camera, FileText
} from 'lucide-react';

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    taskData?: any;
    mode: 'create' | 'edit';
    onSuccess: () => void;
}

const inputCls = "w-full py-2.5 pl-10 pr-3 rounded-xl border border-slate-200 bg-white text-[0.9rem] text-slate-800 outline-none transition-all focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)]";
const selectCls = "w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-white text-[0.9rem] text-slate-700 outline-none focus:border-indigo-500";
const labelCls = "block text-[0.75rem] font-bold text-slate-500 uppercase tracking-wide mb-1.5";

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, taskData, mode, onSuccess }) => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Assessment');
    const [priority, setPriority] = useState('Medium');
    const [venue, setVenue] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [methods, setMethods] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (mode === 'edit' && taskData) {
            setTitle(taskData.title || ''); setCategory(taskData.category || 'Assessment');
            setPriority(taskData.priority || 'Medium'); setVenue(taskData.venue || '');
            setDueDate(taskData.dueDate || ''); setMethods(taskData.methods || []);
        }
    }, [mode, taskData]);

    const toggleMethod = (method: string) => setMethods(prev =>
        prev.includes(method) ? prev.filter(m => m !== method) : [...prev, method]
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setIsLoading(true);
        setTimeout(() => { setIsLoading(false); onSuccess(); onClose(); }, 1000);
    };

    if (!isOpen) return null;

    const methodsList = [
        { id: 'QR Scan', icon: <QrCode size={18} /> },
        { id: 'Photo', icon: <Camera size={18} /> },
        { id: 'Doc Upload', icon: <FileText size={18} /> }
    ];

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-1000 flex items-center justify-center p-4">
                <motion.div
                    className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                >
                    {/* Header */}
                    <div className="flex justify-between items-center px-8 py-5 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-500 text-white rounded-xl flex items-center justify-center">
                                <ClipboardList size={20} />
                            </div>
                            <div>
                                <h2 className="text-base font-extrabold text-slate-900">{mode === 'create' ? 'Create Directive' : 'Edit Directive'}</h2>
                                <p className="text-[0.75rem] text-slate-400">Set up academic workflow and requirements</p>
                            </div>
                        </div>
                        <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-slate-100 rounded-lg" onClick={onClose}><X size={20} /></button>
                    </div>

                    {/* Body */}
                    <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5 max-h-[65vh] overflow-y-auto">
                        <div>
                            <label className={labelCls}>Directive Title</label>
                            <div className="relative">
                                <Target size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input type="text" placeholder="e.g. End Semester Lab Assessment" value={title} onChange={(e) => setTitle(e.target.value)} required className={inputCls} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelCls}>Category</label>
                                <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectCls}>
                                    {['Assessment', 'Event', 'Infrastructure', 'Administration'].map(o => <option key={o}>{o}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelCls}>Priority</label>
                                <select value={priority} onChange={(e) => setPriority(e.target.value)} className={selectCls}>
                                    {['Critical', 'High', 'Medium', 'Low'].map(o => <option key={o}>{o}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelCls}>Venue / Location</label>
                                <div className="relative">
                                    <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input type="text" placeholder="Select venue..." value={venue} onChange={(e) => setVenue(e.target.value)} className={inputCls} />
                                </div>
                            </div>
                            <div>
                                <label className={labelCls}>Due Date</label>
                                <div className="relative">
                                    <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputCls} />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className={labelCls}>Execution Verification Methods</label>
                            <div className="flex gap-3 flex-wrap">
                                {methodsList.map(m => (
                                    <button key={m.id} type="button"
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-semibold text-sm transition-all ${methods.includes(m.id) ? 'bg-indigo-50 border-indigo-300 text-indigo-600' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
                                        onClick={() => toggleMethod(m.id)}>
                                        {m.icon}<span>{m.id}</span>
                                        {methods.includes(m.id) && <CheckCircle2 size={14} className="text-indigo-500" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-start gap-2.5 p-4 bg-blue-50 rounded-xl border border-blue-100">
                            <Info size={16} className="text-blue-500 mt-0.5 shrink-0" />
                            <p className="text-[0.8rem] text-blue-700">Directives require multi-stage approval from assigned faculty and venue incharges before execution.</p>
                        </div>
                    </form>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 px-8 py-5 border-t border-slate-100 bg-slate-50/50">
                        <button type="button" className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-100" onClick={onClose}>Cancel</button>
                        <button type="submit" className="px-6 py-2.5 rounded-xl bg-indigo-500 text-white font-bold text-sm hover:bg-indigo-600 transition-all shadow-[0_4px_12px_rgba(99,102,241,0.2)] disabled:opacity-60"
                            onClick={handleSubmit} disabled={isLoading || !title}>
                            {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (mode === 'create' ? 'Publish Directive' : 'Update Directive')}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default TaskModal;
