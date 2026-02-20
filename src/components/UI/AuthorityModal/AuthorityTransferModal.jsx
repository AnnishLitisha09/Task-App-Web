import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, History, Search, ArrowRight, Calendar, CheckCircle2, ShieldAlert } from 'lucide-react';

const AuthorityTransferModal = ({ isOpen, onClose, currentAuthority, onSuccess }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);

    if (!isOpen || !currentAuthority) return null;

    const handleSearch = (val) => {
        setSearchTerm(val);
        if (val.length < 2) { setSearchResults([]); return; }
        const mock = [{ id: 'u10', name: 'Dr. Alan Turing', email: 'alan.t@univ.edu', role: 'faculty' }, { id: 'u11', name: 'James Clerk', email: 'james.c@univ.edu', role: 'faculty' }].filter(u => u.name.toLowerCase().includes(val.toLowerCase()));
        setSearchResults(mock);
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-1000 flex items-center justify-center p-4">
                <motion.div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                    <div className="flex justify-between items-center px-7 py-5 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-500 text-white rounded-xl flex items-center justify-center"><History size={20} /></div>
                            <div>
                                <h2 className="text-base font-extrabold text-slate-900">Transfer Authority</h2>
                                <p className="text-[0.75rem] text-slate-400">Reassign powers from one user to another</p>
                            </div>
                        </div>
                        <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-slate-100 rounded-lg" onClick={onClose}><X size={20} /></button>
                    </div>

                    <div className="px-7 py-6 space-y-5 max-h-[65vh] overflow-y-auto">
                        {/* Current Authority */}
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                            <h3 className="text-[10px] uppercase font-bold text-slate-400 mb-3 tracking-widest">Active Authority</h3>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">{currentAuthority.name.charAt(0)}</div>
                                <div><p className="text-sm font-bold text-slate-900">{currentAuthority.name}</p><p className="text-[11px] text-slate-500">{currentAuthority.role} • {currentAuthority.scope_name}</p></div>
                            </div>
                        </div>

                        <div className="flex justify-center text-indigo-400"><ArrowRight size={24} /></div>

                        {/* New User */}
                        {!selectedUser ? (
                            <div className="relative">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Select Recipient</label>
                                <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input type="text" value={searchTerm} onChange={(e) => handleSearch(e.target.value)} placeholder="Search by name or email..."
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-indigo-500" /></div>
                                {searchResults.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-50 mt-1">
                                        {searchResults.map(u => (
                                            <div key={u.id} className="p-3 hover:bg-slate-50 cursor-pointer flex items-center gap-3" onClick={() => setSelectedUser(u)}>
                                                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs">{u.name.charAt(0)}</div>
                                                <div><p className="text-sm font-bold text-slate-700">{u.name}</p><p className="text-[10px] text-slate-400">{u.email}</p></div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">{selectedUser.name.charAt(0)}</div>
                                    <div><p className="text-sm font-bold text-slate-900">{selectedUser.name}</p><p className="text-[11px] text-emerald-600">New Authority Holder</p></div>
                                </div>
                                <button className="text-emerald-400 hover:text-emerald-600" onClick={() => setSelectedUser(null)}><X size={16} /></button>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Effective Date</label>
                            <div className="relative"><Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input type="date" value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)}
                                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-indigo-500" /></div>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                            <ShieldAlert size={18} className="text-amber-600 mt-0.5 shrink-0" />
                            <p className="text-[11px] text-amber-800 leading-relaxed font-medium"><strong>Warning:</strong> Authority transfer will revoke all listed powers from the current user and immediately assign them to the recipient on the effective date.</p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 px-7 py-5 border-t border-slate-100 bg-slate-50/50">
                        <button className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-100" onClick={onClose}>Cancel</button>
                        <button className="px-5 py-2.5 rounded-xl bg-indigo-500 text-white font-bold text-sm flex items-center gap-2 hover:bg-indigo-600 transition-all disabled:opacity-50"
                            disabled={!selectedUser} onClick={() => onSuccess()}>
                            <CheckCircle2 size={18} /><span>Confirm Transfer</span>
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AuthorityTransferModal;
