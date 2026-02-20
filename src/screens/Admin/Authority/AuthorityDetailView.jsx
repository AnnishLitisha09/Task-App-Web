import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, ShieldCheck, Mail, Building2, CheckCircle2, Edit2, ShieldAlert, History } from 'lucide-react';

const AuthorityDetailView = ({ isOpen, onClose, authority }) => {
    if (!isOpen || !authority) return null;

    const getPermissions = (scope) => {
        if (scope === 'Institution') return ['Create Task', 'Assign Task', 'Approve Task', 'View Reports', 'Manage Resource Calendar'];
        if (scope === 'Department') return ['Create Task', 'Assign Task', 'Approve Task', 'View Reports'];
        return ['Approve Task', 'Manage Resource Calendar'];
    };
    const permissions = getPermissions(authority.scope_type);

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000] flex">
                <div className="flex-1" onClick={onClose} />
                <motion.div
                    className="bg-white w-full max-w-[500px] h-full flex flex-col shadow-2xl"
                    initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 100 }}>
                    {/* Header */}
                    <div className="flex justify-between items-center px-7 py-5 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-500 text-white rounded-xl flex items-center justify-center"><ShieldCheck size={20} /></div>
                            <div><h2 className="text-base font-extrabold text-slate-900">Authority Detail</h2><p className="text-[0.75rem] text-slate-400">Detailed role and permission breakdown</p></div>
                        </div>
                        <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-slate-100 rounded-lg" onClick={onClose}><X size={20} /></button>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto px-7 py-6 space-y-6">
                        {/* Profile */}
                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                            <div className="flex items-center gap-4 mb-5">
                                <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold">{authority.name.charAt(0)}</div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">{authority.name}</h3>
                                    <div className="flex items-center gap-2 text-slate-500 text-sm mt-1"><Mail size={14} /><span>{authority.email}</span></div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { label: 'Role Name', value: authority.role },
                                    { label: 'Scope Type', value: authority.scope_type },
                                    { label: 'Target', value: authority.scope_name },
                                    { label: 'Hierarchy Level', value: authority.hierarchy, cls: 'text-indigo-600' },
                                ].map((item, i) => (
                                    <div key={i} className="flex flex-col gap-1">
                                        <span className="text-[10px] uppercase tracking-[0.08em] text-slate-400 font-bold">{item.label}</span>
                                        <span className={`font-semibold ${item.cls || 'text-slate-700'}`}>{item.value || 'N/A'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Permissions */}
                        <div>
                            <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2"><Shield size={16} className="text-indigo-500" />Permissions Panel (Read-only)</h4>
                            <div className="space-y-2">
                                {permissions.map(perm => (
                                    <div key={perm} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                                        <span className="text-sm font-medium text-slate-700">{perm}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Assignment Impact */}
                        <div>
                            <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2"><Building2 size={16} className="text-indigo-500" />Assignment Impact</h4>
                            <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-3">
                                <div className="flex justify-between text-sm"><span className="text-slate-500">Can assign to:</span><span className="font-bold text-indigo-700">{authority.scope_type} Users</span></div>
                                <div className="flex justify-between text-sm"><span className="text-slate-500">Receives escalation:</span><span className="font-bold text-slate-700">{authority.scope_type === 'Institution' ? 'Yes' : 'No'}</span></div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-7 py-5 border-t border-slate-100 bg-slate-50/50 space-y-3">
                        <div className="flex gap-3">
                            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-500 text-white font-bold text-sm rounded-xl hover:bg-indigo-600 transition-all" onClick={onClose}>
                                <Edit2 size={16} />Edit Authority
                            </button>
                            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-rose-200 text-rose-600 font-bold text-sm rounded-xl hover:bg-rose-50 transition-all">
                                <ShieldAlert size={16} />Disable Role
                            </button>
                        </div>
                        <button className="w-full flex items-center justify-center gap-2 py-2.5 border border-slate-200 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-100 transition-all">
                            <History size={16} />Transfer Authority
                        </button>
                        <button className="w-full text-slate-400 text-[11px] font-bold uppercase tracking-[0.08em] hover:text-slate-600 transition-colors" onClick={onClose}>Close Panel</button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AuthorityDetailView;
