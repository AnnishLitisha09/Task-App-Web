import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckSquare, Check, AlertCircle } from 'lucide-react';
import api from '../../../utils/api';

interface TaskTitleModalProps {
    isOpen: boolean;
    onClose: () => void;
    taskTitleData?: any;
    mode: 'create' | 'edit';
    onSuccess: () => void;
}

const inputCls = "w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-white text-[0.9rem] text-slate-800 outline-none transition-all focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)]";
const selectCls = "w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-white text-[0.9rem] text-slate-700 outline-none focus:border-indigo-500";
const labelCls = "block text-[0.75rem] font-bold text-slate-500 uppercase tracking-wide mb-1.5";

const TaskTitleModal: React.FC<TaskTitleModalProps> = ({ isOpen, onClose, taskTitleData, mode, onSuccess }) => {
    const [taskTitle, setTaskTitle] = useState('');
    const [targetRole, setTargetRole] = useState('all');
    const [customRole, setCustomRole] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (taskTitleData) {
                setTaskTitle(taskTitleData.task_title || '');
                const role = taskTitleData.target_role || 'all';
                if (['all', 'faculty', 'student', 'role-user', 'staff'].includes(role)) {
                    setTargetRole(role);
                    setCustomRole('');
                } else {
                    setTargetRole('custom');
                    setCustomRole(role);
                }
            } else {
                setTaskTitle('');
                setTargetRole('all');
                setCustomRole('');
            }
        }
    }, [isOpen, taskTitleData]);

    const handleSubmit = async () => {
        if (!taskTitle) { setError('Task Title is required'); return; }
        const finalRole = targetRole === 'custom' ? customRole : targetRole;
        if (!finalRole) { setError('Target Role is required'); return; }

        setIsLoading(true); setError('');
        try {
            if (mode === 'create') {
                await api('/tasks/titles', { method: 'POST', body: { task_title: taskTitle, target_role: finalRole } });
            } else {
                const id = taskTitleData.id;
                // Based on curl, update might just update task_title or both
                await api(`/tasks/titles/${id}`, { method: 'PUT', body: { task_title: taskTitle, target_role: finalRole } });
            }
            onSuccess();
        } catch (err: any) { setError(err.message || 'Operation failed'); }
        finally { setIsLoading(false); }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-1000 flex items-center justify-center p-4">
                <motion.div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
                    initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}>
                    {/* Header */}
                    <div className="flex justify-between items-center px-7 py-5 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-500 text-white rounded-xl flex items-center justify-center">
                                <CheckSquare size={20} />
                            </div>
                            <div>
                                <h2 className="text-base font-extrabold text-slate-900">
                                    {mode === 'create' ? 'Create Task Title' : 'Edit Task Title'}
                                </h2>
                                <p className="text-[0.75rem] text-slate-400">Manage standard directives for users</p>
                            </div>
                        </div>
                        <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-slate-100 rounded-lg" onClick={onClose}><X size={20} /></button>
                    </div>

                    {/* Body */}
                    <div className="px-7 py-6 space-y-5">
                        {error && (
                            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                                <AlertCircle size={16} /><span>{error}</span>
                            </div>
                        )}
                        <div>
                            <label className={labelCls}>Task Title</label>
                            <input type="text" placeholder="e.g. Attendance Marking" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} className={inputCls} />
                            <p className="text-xs text-slate-400 mt-1">The name of the task to be presented to users.</p>
                        </div>

                        <div>
                            <label className={labelCls}>Target Role</label>
                            <select className={selectCls} value={targetRole} onChange={(e) => setTargetRole(e.target.value)}>
                                <option value="all">All Roles</option>
                                <option value="faculty">Faculty</option>
                                <option value="student">Student</option>
                                <option value="role-user">Role-User</option>
                                <option value="staff">Staff</option>
                                <option value="custom">Custom...</option>
                            </select>
                        </div>

                        {targetRole === 'custom' && (
                            <div>
                                <label className={labelCls}>Custom Role</label>
                                <input type="text" placeholder="e.g. admin" value={customRole} onChange={(e) => setCustomRole(e.target.value)} className={inputCls} />
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 px-7 py-5 border-t border-slate-100 bg-slate-50/50">
                        <button className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-100" onClick={onClose}>Cancel</button>
                        <button className="px-5 py-2.5 rounded-xl bg-indigo-500 text-white font-bold text-sm flex items-center gap-2 hover:bg-indigo-600 transition-all shadow-[0_4px_12px_rgba(99,102,241,0.2)] disabled:opacity-60"
                            onClick={handleSubmit} disabled={isLoading}>
                            {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Check size={18} /><span>{mode === 'create' ? 'Create Title' : 'Save Changes'}</span></>}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default TaskTitleModal;
