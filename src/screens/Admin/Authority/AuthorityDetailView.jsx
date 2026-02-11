import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, User, Shield, ShieldCheck,
    Mail, Briefcase, MapPin, Building2,
    CheckCircle2, XCircle, AlertTriangle,
    Edit2, ShieldAlert, History
} from 'lucide-react';

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
            <div className="modal-overlay">
                <motion.div
                    className="resource-modal detail-view-panel shadow-2xl"
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    style={{ maxWidth: '500px', marginLeft: 'auto', height: '100%', borderRadius: '0' }}
                >
                    <div className="modal-header">
                        <div className="header-title-box">
                            <div className="header-icon">
                                <ShieldCheck size={20} />
                            </div>
                            <div>
                                <h2>Authority Detail</h2>
                                <p className="header-subtitle">Detailed role and permission breakdown</p>
                            </div>
                        </div>
                        <button className="close-btn" onClick={onClose}><X size={20} /></button>
                    </div>

                    <div className="modal-body overflow-y-auto">
                        {/* Profile Card */}
                        <div className="bg-slate-50 rounded-2xl p-6 mb-6 border border-slate-200">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold font-sans">
                                    {authority.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">{authority.name}</h3>
                                    <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                                        <Mail size={14} />
                                        <span>{authority.email}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-6">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Role Name</span>
                                    <span className="font-semibold text-slate-700">{authority.role}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Scope Type</span>
                                    <span className="font-semibold text-slate-700">{authority.scope_type}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Target</span>
                                    <span className="font-semibold text-slate-700">{authority.scope_name}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Hierarchy Level</span>
                                    <span className="font-semibold text-indigo-600 font-sans">{authority.hierarchy}</span>
                                </div>
                            </div>
                        </div>

                        {/* Permissions Panel */}
                        <div className="mb-8">
                            <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Shield size={16} className="text-indigo-500" />
                                Permissions Panel (Read-only)
                            </h4>
                            <div className="grid grid-cols-1 gap-2">
                                {permissions.map(perm => (
                                    <div key={perm} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                                        <CheckCircle2 size={16} className="text-emerald-500" />
                                        <span className="text-sm font-medium text-slate-700 font-sans">{perm}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Assignment Impact */}
                        <div>
                            <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Building2 size={16} className="text-indigo-500" />
                                Assignment Impact
                            </h4>
                            <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                                <div className="flex flex-col gap-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Can assign to:</span>
                                        <span className="font-bold text-indigo-700">{authority.scope_type} Users</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Receives escalation:</span>
                                        <span className="font-bold text-slate-700">{authority.scope_type === 'Institution' ? 'Yes' : 'No'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer mt-auto bg-white border-t border-slate-100 p-6">
                        <div className="flex flex-col gap-3 w-full">
                            <div className="flex gap-3">
                                <button className="submit-pill flex-1 justify-center bg-indigo-600" onClick={() => { onClose(); }}>
                                    <Edit2 size={16} />
                                    <span>Edit Authority</span>
                                </button>
                                <button className="cancel-pill flex-1 justify-center border-rose-200 text-rose-600 hover:bg-rose-50">
                                    <ShieldAlert size={16} />
                                    <span>Disable Role</span>
                                </button>
                            </div>
                            <button className="cancel-pill w-full justify-center border-slate-200 text-slate-600 hover:bg-slate-50">
                                <History size={16} />
                                <span>Transfer Authority</span>
                            </button>
                            <button className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mt-2 hover:text-slate-600 transition-colors" onClick={onClose}>
                                Close Panel
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AuthorityDetailView;
