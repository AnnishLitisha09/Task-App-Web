import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Search, AlertCircle, Info, Box, AlignLeft, UserPlus, Monitor } from 'lucide-react';
import api from '../../../utils/api';

const inputCls = "w-full py-2.5 pl-10 pr-3 rounded-xl border border-slate-200 bg-white text-[0.9rem] text-slate-800 outline-none transition-all focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)]";
const labelCls = "block text-[0.75rem] font-bold text-slate-500 uppercase tracking-wide mb-1.5";

const ResourceModal = ({ isOpen, onClose, resourceData, mode, onSuccess }) => {
    const [name, setName] = useState('');
    const [details, setDetails] = useState('');
    const [inchargeSearch, setInchargeSearch] = useState('');
    const [selectedIncharge, setSelectedIncharge] = useState(null);
    const [facultyList, setFacultyList] = useState([]);
    const [showFacultyDropdown, setShowFacultyDropdown] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isFacultyLoading, setIsFacultyLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (resourceData) {
                setName(resourceData.name || '');
                setDetails(resourceData.description || resourceData.details || '');
                const incharge = resourceData.incharge || resourceData.owner;
                if (incharge) { setSelectedIncharge({ id: incharge.id || incharge.user_id, name: incharge.name, role: incharge.role || incharge.role_name }); setInchargeSearch(incharge.name); }
                else if (resourceData.user_id) { setSelectedIncharge({ id: resourceData.user_id, name: resourceData.user_name || resourceData.owner_name || 'Assigned User', role: resourceData.role }); setInchargeSearch(resourceData.user_name || ''); }
                else { setSelectedIncharge(null); setInchargeSearch(''); }
            } else { setName(''); setDetails(''); setSelectedIncharge(null); setInchargeSearch(''); }
            setError(''); fetchFaculty();
        }
    }, [isOpen, resourceData]);

    const fetchFaculty = async () => {
        setIsFacultyLoading(true);
        try {
            const response = await api('/users/incharges');
            const incList = Array.isArray(response) ? response : (response.incharges || []);
            setFacultyList(incList.map(u => ({ id: u.id || u.user_id, name: u.name, reg_no: u.reg_no || u.id, role: u.role || 'Incharge' })));
        } catch (err) { console.error(err); }
        finally { setIsFacultyLoading(false); }
    };

    const filteredUsers = facultyList.filter(u => u.name.toLowerCase().includes(inchargeSearch.toLowerCase()) || u.reg_no.toString().toLowerCase().includes(inchargeSearch.toLowerCase()));

    const handleSubmit = async () => {
        if (!name && mode !== 'assign') { setError('Resource name is required'); return; }
        setIsLoading(true); setError('');
        try {
            const payload = { name, description: details, user_id: selectedIncharge?.id || null };
            if (mode === 'create') await api('/resources', { method: 'POST', body: payload });
            else { const rid = resourceData.id || resourceData.resource_id; await api(`/resources/${rid}`, { method: 'PUT', body: payload }); }
            onSuccess();
        } catch (err) { setError(err.message || 'Operation failed'); }
        finally { setIsLoading(false); }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
                <motion.div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
                    initial={{ opacity: 0, scale: 0.98, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: 10 }}>
                    <div className="flex justify-between items-center px-7 py-5 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-500 text-white rounded-xl flex items-center justify-center">
                                {mode === 'assign' ? <UserPlus size={20} /> : <Box size={20} />}
                            </div>
                            <div>
                                <h2 className="text-base font-extrabold text-slate-900">{mode === 'create' ? 'Add New Resource' : mode === 'edit' ? 'Edit Resource' : 'Assign Resource'}</h2>
                                <p className="text-[0.75rem] text-slate-400">{mode === 'assign' ? `Manage assignment for ${name}` : 'Asset & Resource Management'}</p>
                            </div>
                        </div>
                        <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-slate-100 rounded-lg" onClick={onClose}><X size={20} /></button>
                    </div>

                    <div className="px-7 py-6 space-y-5">
                        {error && <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm"><AlertCircle size={16} /><span>{error}</span></div>}

                        <div>
                            <label className={labelCls}>Resource Name</label>
                            <div className="relative"><Monitor size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input type="text" className={inputCls} placeholder="e.g. Dell XPS 15, Projector A1" value={name} onChange={(e) => setName(e.target.value)} readOnly={mode === 'assign'} /></div>
                        </div>

                        <div>
                            <label className={labelCls}>Details / Description</label>
                            <div className="relative"><AlignLeft size={16} className="absolute left-3 top-3 text-slate-400" />
                                <textarea className="w-full py-2.5 pl-10 pr-3 rounded-xl border border-slate-200 bg-white text-[0.9rem] outline-none focus:border-indigo-500 resize-none"
                                    placeholder="Add details about specifications..." value={details} onChange={(e) => setDetails(e.target.value)} rows={3} readOnly={mode === 'assign'} /></div>
                        </div>

                        <div className="relative">
                            <label className={labelCls}>Assign To (Staff/Role User)</label>
                            <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input type="text" className={inputCls} placeholder="Search user..." value={inchargeSearch}
                                    onChange={(e) => { setInchargeSearch(e.target.value); setShowFacultyDropdown(true); }}
                                    onFocus={() => setShowFacultyDropdown(true)} /></div>
                            <p className="text-xs text-slate-400 mt-1">Person responsible for this asset.</p>
                            <AnimatePresence>
                                {showFacultyDropdown && inchargeSearch && (
                                    <motion.div className="absolute left-0 right-0 top-[calc(100%-24px)] bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-44 overflow-y-auto"
                                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                        {filteredUsers.length > 0 ? filteredUsers.map(user => (
                                            <div key={user.id} className={`p-3 hover:bg-slate-50 cursor-pointer flex items-center gap-3 border-b border-slate-100 last:border-0 ${selectedIncharge?.id === user.id ? 'bg-indigo-50' : ''}`}
                                                onClick={() => { setSelectedIncharge(user); setInchargeSearch(user.name); setShowFacultyDropdown(false); }}>
                                                <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xs">{user.name.charAt(0)}</div>
                                                <div><span className="block text-sm font-bold text-slate-700">{user.name}</span><span className="text-xs text-slate-400">{user.reg_no} • {user.role}</span></div>
                                                {selectedIncharge?.id === user.id && <Check size={16} className="ml-auto text-indigo-500" />}
                                            </div>
                                        )) : <div className="p-3 text-sm text-slate-500 text-center">No users found.</div>}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {mode === 'assign' && (
                            <div className="flex items-start gap-2.5 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                                <Info size={16} className="text-blue-500 mt-0.5 shrink-0" />
                                <p className="text-[0.8rem] text-blue-700">Checking out this asset to a user makes them responsible for its safety and maintenance status.</p>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 px-7 py-5 border-t border-slate-100 bg-slate-50/50">
                        <button className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-100" onClick={onClose}>Discard</button>
                        <button className="px-5 py-2.5 rounded-xl bg-indigo-500 text-white font-bold text-sm flex items-center gap-2 hover:bg-indigo-600 transition-all disabled:opacity-60"
                            onClick={handleSubmit} disabled={isLoading}>
                            {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Check size={18} /><span>{mode === 'create' ? 'Create Resource' : mode === 'edit' ? 'Save Changes' : 'Confirm Assignment'}</span></>}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ResourceModal;
