import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, History, Search, ArrowRight,
    Calendar, CheckCircle2, ShieldAlert
} from 'lucide-react';
import './AuthorityModal.css';

const AuthorityTransferModal = ({ isOpen, onClose, currentAuthority, onSuccess }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);

    if (!isOpen || !currentAuthority) return null;

    const handleSearch = (val) => {
        setSearchTerm(val);
        if (val.length < 2) {
            setSearchResults([]);
            return;
        }
        // Mock search
        const mockUsers = [
            { id: 'u10', name: 'Dr. Alan Turing', email: 'alan.t@univ.edu', role: 'faculty' },
            { id: 'u11', name: 'James Clerk', email: 'james.c@univ.edu', role: 'faculty' }
        ].filter(u => u.name.toLowerCase().includes(val.toLowerCase()));
        setSearchResults(mockUsers);
    };

    return (
        <AnimatePresence>
            <div className="modal-overlay">
                <motion.div
                    className="resource-modal"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    style={{ maxWidth: '600px', width: '90%' }}
                >
                    <div className="modal-header">
                        <div className="header-title-box">
                            <div className="header-icon"><History size={20} /></div>
                            <div>
                                <h2>Transfer Authority</h2>
                                <p className="header-subtitle">Reassign powers from one user to another</p>
                            </div>
                        </div>
                        <button className="close-btn" onClick={onClose}><X size={20} /></button>
                    </div>

                    <div className="modal-body space-y-8 overflow-y-auto" style={{ maxHeight: '70vh' }}>
                        {/* Current Authority Card */}
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                            <h3 className="text-[10px] uppercase font-bold text-slate-400 mb-3 tracking-widest">Active Authority</h3>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                                    {currentAuthority.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">{currentAuthority.name}</p>
                                    <p className="text-[11px] text-slate-500">{currentAuthority.role} • {currentAuthority.scope_name}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center text-indigo-400">
                            <ArrowRight size={24} />
                        </div>

                        {/* New User Selector */}
                        <div className="space-y-4">
                            {!selectedUser ? (
                                <div className="form-group relative">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Select Recipient</label>
                                    <div className="input-with-icon">
                                        <Search size={16} className="field-icon" />
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => handleSearch(e.target.value)}
                                            placeholder="Search by name or email..."
                                        />
                                    </div>
                                    {searchResults.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-50 mt-1">
                                            {searchResults.map(u => (
                                                <div
                                                    key={u.id}
                                                    className="p-3 hover:bg-slate-50 cursor-pointer flex items-center gap-3"
                                                    onClick={() => setSelectedUser(u)}
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs">
                                                        {u.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-700">{u.name}</p>
                                                        <p className="text-[10px] text-slate-400">{u.email}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                                            {selectedUser.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">{selectedUser.name}</p>
                                            <p className="text-[11px] text-emerald-600">New Authority Holder</p>
                                        </div>
                                    </div>
                                    <button className="text-emerald-400" onClick={() => setSelectedUser(null)}><X size={16} /></button>
                                </div>
                            )}

                            <div className="form-group">
                                <label className="text-xs font-bold text-slate-500 uppercase">Effective Date</label>
                                <div className="input-with-icon">
                                    <Calendar size={16} className="field-icon" />
                                    <input
                                        type="date"
                                        value={effectiveDate}
                                        onChange={(e) => setEffectiveDate(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3">
                            <ShieldAlert size={18} className="text-amber-600 mt-0.5" />
                            <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                                <strong>Warning:</strong> Authority transfer will revoke all listed powers from the current user and immediately assign them to the recipient on the effective date.
                            </p>
                        </div>
                    </div>

                    <div className="modal-footer bg-slate-50 border-t border-slate-100">
                        <button className="cancel-pill" onClick={onClose}>Cancel</button>
                        <button
                            className="submit-pill px-8"
                            disabled={!selectedUser}
                            onClick={() => onSuccess()}
                        >
                            <CheckCircle2 size={18} />
                            <span>Confirm Transfer</span>
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AuthorityTransferModal;
