import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert, AlertCircle, RefreshCw, UserMinus, ShieldCheck } from 'lucide-react';
import api from "../../utils/api";

const RevokeRoleModal = ({ isOpen, onClose, user, onSuccess }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [revokingIdx, setRevokingIdx] = useState(null);
    const [localRoles, setLocalRoles] = useState([]);

    // Sync local roles whenever the user or modal changes
    React.useEffect(() => {
        if (user) setLocalRoles(user.all_roles || [user.role]);
    }, [user, isOpen]);

    const handleRevoke = async (roleName, index) => {
        setIsLoading(true);
        setError('');
        setRevokingIdx(index);

        const isPrimaryProfile = ['student', 'faculty', 'staff'].includes(roleName.toLowerCase());
        const payload = {};

        if (isPrimaryProfile) {
            payload.remove_profile = roleName.toLowerCase();
        } else {
            const assignment = user.role_assignments?.find(a => a.role === roleName);
            if (assignment) {
                payload.remove_assignments = [{
                    role: roleName,
                    assignment_id: assignment.assignment_id || assignment.id
                }];
            } else {
                // If no assignment record, we can't revoke it this way
                setError(`Could not find assignment record for ${roleName}`);
                setIsLoading(false);
                setRevokingIdx(null);
                return;
            }
        }

        try {
            const result = await api(`/users/${user.id}/roles`, {
                method: 'PUT',
                body: payload
            });

            const updatedUser = result?.user;
            // Update local role list immediately so the modal reflects the change
            if (updatedUser?.all_roles) {
                setLocalRoles(updatedUser.all_roles);
            } else {
                // fallback: optimistically remove the revoked role
                setLocalRoles(prev => prev.filter(r => r !== roleName));
            }

            if (onSuccess && updatedUser) onSuccess(updatedUser);

            // Close if no roles remain
            if (!updatedUser?.all_roles?.length) onClose();
        } catch (err) {
            console.error('Revoke error:', err);
            setError(err.message || 'Failed to revoke role');
        } finally {
            setIsLoading(false);
            setRevokingIdx(null);
        }
    };

    if (!user) return null;

    const allRoles = localRoles;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-5000 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 30 }}
                        className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-white/20"
                    >
                        {/* Header */}
                        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                                    <ShieldAlert size={20} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-extrabold text-slate-800 leading-tight">Revoke Account Role</h2>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Manage effective permissions</p>
                                </div>
                            </div>
                            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all border-none bg-transparent cursor-pointer" onClick={onClose}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-8 space-y-6">
                            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100/50">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Target Account</p>
                                <p className="text-[0.95rem] font-extrabold text-slate-800">{user.name}</p>
                                <p className="text-[0.8rem] text-slate-500">{user.email}</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-1 h-3 bg-indigo-500 rounded-full"></div>
                                    <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest">Active Permissions</span>
                                </div>
                                
                                {allRoles.map((role, idx) => (
                                    <div 
                                        key={idx}
                                        className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl group transition-all hover:border-indigo-200 hover:bg-indigo-50/10"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center">
                                                <ShieldCheck size={16} />
                                            </div>
                                            <span className="text-[0.9rem] font-bold text-slate-700 capitalize">{role}</span>
                                        </div>
                                        <button
                                            onClick={() => handleRevoke(role, idx)}
                                            disabled={isLoading}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
                                                revokingIdx === idx 
                                                    ? 'bg-slate-100 text-slate-400' 
                                                    : 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white'
                                            }`}
                                        >
                                            {revokingIdx === idx ? <RefreshCw size={14} className="animate-spin" /> : <UserMinus size={14} />}
                                            <span>{revokingIdx === idx ? 'Revoking...' : 'Revoke'}</span>
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {error && (
                                <div className="flex items-center gap-3 p-4 bg-rose-50 rounded-2xl border border-rose-100 text-rose-600">
                                    <AlertCircle size={18} className="shrink-0" />
                                    <span className="text-xs font-bold uppercase">{error}</span>
                                </div>
                            )}

                            <p className="text-[0.7rem] text-slate-400 italic text-center leading-relaxed">
                                Warning: Revoking a role will immediate strip the user of all corresponding dashboard and task privileges.
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="px-8 py-5 border-t border-slate-100 flex justify-end bg-slate-50/30">
                            <button className="px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest text-slate-500 bg-white border-2 border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all border-none cursor-pointer" onClick={onClose}>
                                Close Management
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default RevokeRoleModal;
