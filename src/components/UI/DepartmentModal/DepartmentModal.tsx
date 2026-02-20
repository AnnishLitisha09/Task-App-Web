import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, UserPlus, Check, AlertCircle, Info } from 'lucide-react';
import api from '../../../utils/api';

interface DepartmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    deptData?: any;
    mode: 'create' | 'edit' | 'assign';
    onSuccess: () => void;
}

const inputCls = "w-full py-2.5 pl-10 pr-3 rounded-xl border border-slate-200 bg-white text-[0.9rem] text-slate-800 outline-none transition-all focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)]";
const selectCls = "w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-white text-[0.9rem] text-slate-700 outline-none focus:border-indigo-500";
const labelCls = "block text-[0.75rem] font-bold text-slate-500 uppercase tracking-wide mb-1.5";

const DepartmentModal: React.FC<DepartmentModalProps> = ({ isOpen, onClose, deptData, mode, onSuccess }) => {
    const [deptName, setDeptName] = useState('');
    const [selectedFaculty, setSelectedFaculty] = useState<any>(null);
    const [facultyList, setFacultyList] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFacultyLoading, setIsFacultyLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (deptData) {
                setDeptName(deptData.name || '');
                const hid = deptData.user_id || deptData.hod?.id || deptData.hod?.user_id;
                setSelectedFaculty(hid ? { id: hid, name: deptData.hod_name || deptData.hod?.name } : null);
            } else {
                setDeptName(''); setSelectedFaculty(null);
            }
            fetchFaculty();
        }
    }, [isOpen, deptData]);

    const fetchFaculty = async () => {
        setIsFacultyLoading(true);
        try {
            const response = await api('/users/hods');
            const hodsList = Array.isArray(response) ? response : (response.hods || []);
            setFacultyList(hodsList.map((h: any) => ({ id: h.id || h.user_id, name: h.name || 'Unknown HOD', reg_no: h.department_name || 'HOD' })));
        } catch (err) { console.error(err); }
        finally { setIsFacultyLoading(false); }
    };

    const handleSubmit = async () => {
        if (!deptName && mode !== 'assign') { setError('Department name is required'); return; }
        setIsLoading(true); setError('');
        try {
            if (mode === 'create') {
                await api('/resources/departments', { method: 'POST', body: { name: deptName } });
            } else {
                const did = deptData.id || deptData.department_id;
                await api(`/resources/departments/${did}`, { method: 'PUT', body: { name: deptName, user_id: selectedFaculty?.id || null } });
            }
            onSuccess();
        } catch (err: any) { setError(err.message || 'Operation failed'); }
        finally { setIsLoading(false); }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
                <motion.div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
                    initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}>
                    {/* Header */}
                    <div className="flex justify-between items-center px-7 py-5 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-500 text-white rounded-xl flex items-center justify-center">
                                {mode === 'assign' ? <UserPlus size={20} /> : <Building2 size={20} />}
                            </div>
                            <div>
                                <h2 className="text-base font-extrabold text-slate-900">
                                    {mode === 'create' ? 'Create New Department' : mode === 'edit' ? 'Edit Department' : 'Assign HOD'}
                                </h2>
                                <p className="text-[0.75rem] text-slate-400">{mode === 'assign' ? `Selecting Authority for ${deptName}` : 'Manage institutional structures'}</p>
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
                            <label className={labelCls}>Department Name</label>
                            <div className="relative">
                                <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input type="text" placeholder="e.g. Computer Science and Engineering" value={deptName} onChange={(e) => setDeptName(e.target.value)} readOnly={mode === 'assign'} className={`${inputCls} ${mode === 'assign' ? 'bg-slate-50 text-slate-500' : ''}`} />
                            </div>
                            <p className="text-xs text-slate-400 mt-1">{mode === 'assign' ? 'The department receiving a new authority figure.' : 'Official name for the institutional division.'}</p>
                        </div>

                        <div>
                            <label className={labelCls}>Headed By (HOD)</label>
                            <select className={selectCls} value={selectedFaculty?.id?.toString() || ''}
                                onChange={(e) => { const f = facultyList.find(f => f.id.toString() === e.target.value); setSelectedFaculty(f || null); }}>
                                <option value="">Select HOD...</option>
                                {facultyList.map(f => <option key={f.id} value={f.id.toString()}>{f.name} ({f.reg_no})</option>)}
                            </select>
                            {isFacultyLoading && <p className="text-xs text-indigo-400 mt-1">Loading HODs...</p>}
                        </div>

                        {mode === 'assign' && (
                            <div className="flex items-start gap-2.5 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                                <Info size={16} className="text-blue-500 mt-0.5 shrink-0" />
                                <p className="text-[0.8rem] text-blue-700">Assigning an HOD grants that user management privileges over this department's resources and staff.</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 px-7 py-5 border-t border-slate-100 bg-slate-50/50">
                        <button className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-100" onClick={onClose}>Cancel</button>
                        <button className="px-5 py-2.5 rounded-xl bg-indigo-500 text-white font-bold text-sm flex items-center gap-2 hover:bg-indigo-600 transition-all shadow-[0_4px_12px_rgba(99,102,241,0.2)] disabled:opacity-60"
                            onClick={handleSubmit} disabled={isLoading}>
                            {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Check size={18} /><span>{mode === 'create' ? 'Create Department' : mode === 'edit' ? 'Save Changes' : 'Confirm Assignment'}</span></>}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default DepartmentModal;
