import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Check, Shield, Info, MapPin, Building2, ChevronDown, Search } from 'lucide-react';

const rolesConfig = {
    'Principal': { level: 'Level 1' }, 'Dean': { level: 'Level 1' }, 'HOD': { level: 'Level 2' },
    'Department Coordinator': { level: 'Level 3' }, 'Lab Incharge': { level: 'Level 4' },
    'Library Incharge': { level: 'Level 4' }, 'Seminar Hall Incharge': { level: 'Level 4' }
};
const scopePermissions = {
    'Institution': ['Create Task', 'Assign Task', 'Approve Task', 'View Reports', 'Manage Resource Calendar'],
    'Department': ['Create Task', 'Assign Task', 'Approve Task', 'View Reports'],
    'Infrastructure': ['Approve Task', 'Manage Resource Calendar']
};
const departments = ['Computer Science', 'Electrical', 'Mechanical', 'Civil', 'Architecture'];
const venues = ['Einstein Hall', 'Newton Lab', 'Main Auditorium', 'Sports Ground'];

const selectCls = "w-full py-2.5 pl-10 pr-3 rounded-xl border border-slate-200 bg-white text-[0.9rem] text-slate-800 outline-none focus:border-indigo-500 appearance-none";
const labelCls = "block text-[0.7rem] font-bold text-slate-400 uppercase tracking-[0.05em] mb-1.5";

const AuthorityModal = ({ isOpen, onClose, authorityData, mode, onSuccess, initialUser = null }) => {
    const [formData, setFormData] = useState({ user_id: '', name: '', email: '', role: 'HOD', scopeType: 'Department', department: 'Computer Science', venue: 'Einstein Hall' });
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUser, setSelectedUser] = useState(initialUser);

    useEffect(() => {
        if (isOpen) {
            setUserSearchTerm(''); setSearchResults([]);
            if (authorityData) {
                setFormData({ user_id: authorityData.user_id || '', name: authorityData.name || '', email: authorityData.email || '', role: authorityData.role || 'HOD', scopeType: authorityData.scope_type || 'Department', department: authorityData.scope_type === 'Department' ? authorityData.scope_name : 'Computer Science', venue: authorityData.scope_type === 'Infrastructure' ? authorityData.scope_name : 'Einstein Hall' });
                setSelectedUser({ id: authorityData.user_id, name: authorityData.name, email: authorityData.email, role: authorityData.base_role || 'faculty' });
            } else if (initialUser) {
                setSelectedUser(initialUser);
                setFormData(prev => ({ ...prev, user_id: initialUser.id, name: initialUser.name, email: initialUser.email }));
            }
        }
    }, [isOpen, authorityData, initialUser]);

    const handleUserSearch = (val) => {
        setUserSearchTerm(val);
        if (val.length < 2) { setSearchResults([]); return; }
        const mock = [{ id: 'u1', name: 'Dr. Sarah Wilson', email: 'sarah.w@univ.edu', role: 'faculty' }, { id: 'u2', name: 'James Smith', email: 'james.s@univ.edu', role: 'staff' }, { id: 'u3', name: 'Robert Brown', email: 'robert.b@univ.edu', role: 'faculty' }].filter(u => u.name.toLowerCase().includes(val.toLowerCase()) || u.email.toLowerCase().includes(val.toLowerCase()));
        setSearchResults(mock);
    };
    const selectUser = (user) => { setSelectedUser(user); setFormData(prev => ({ ...prev, user_id: user.id, name: user.name, email: user.email })); setUserSearchTerm(''); setSearchResults([]); };
    const handleChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };

    const currentHierarchy = rolesConfig[formData.role]?.level || 'Level 4';
    const currentPermissions = scopePermissions[formData.scopeType] || [];
    const previewData = { canCreate: formData.scopeType !== 'Infrastructure' ? 'Yes' : 'No', assignTo: formData.scopeType, escalations: formData.scopeType === 'Institution' ? 'Yes' : 'No' };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-1000 flex items-center justify-center p-4">
                <motion.div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden"
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                    <div className="flex justify-between items-center px-8 py-5 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-500 text-white rounded-xl flex items-center justify-center"><ShieldCheck size={20} /></div>
                            <div>
                                <h2 className="text-base font-extrabold text-slate-900">{mode === 'create' ? 'Assign Scope & Authority' : 'Edit Scope & Authority'}</h2>
                                <p className="text-[0.75rem] text-slate-400">Define operational power for {selectedUser?.name || 'Selected User'}</p>
                            </div>
                        </div>
                        <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-slate-100 rounded-lg" onClick={onClose}><X size={20} /></button>
                    </div>

                    <div className="overflow-y-auto px-8 py-6 max-h-[70vh]">
                        <div className="grid grid-cols-2 gap-10 max-md:grid-cols-1">
                            {/* Left */}
                            <div className="space-y-6">
                                {!selectedUser ? (
                                    <div className="relative">
                                        <label className={labelCls}>Search User to Assign</label>
                                        <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500" />
                                            <input type="text" value={userSearchTerm} onChange={(e) => handleUserSearch(e.target.value)} placeholder="Search by name or email..."
                                                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500" /></div>
                                        {searchResults.length > 0 && (
                                            <div className="absolute top-full left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-50 mt-1 max-h-48 overflow-y-auto">
                                                {searchResults.map(user => (
                                                    <div key={user.id} className="p-3 hover:bg-slate-50 cursor-pointer flex items-center gap-3 border-b border-slate-100 last:border-0" onClick={() => selectUser(user)}>
                                                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">{user.name.charAt(0)}</div>
                                                        <div><p className="text-sm font-bold text-slate-700">{user.name}</p><p className="text-[10px] text-slate-400">{user.email}</p></div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl">{formData.name?.charAt(0) || 'U'}</div>
                                            <div><p className="text-sm font-bold text-slate-900">{formData.name || 'Member'}</p><p className="text-[11px] text-indigo-500 font-medium uppercase tracking-wider">{formData.role} Configuration</p></div>
                                        </div>
                                        {!initialUser && mode === 'create' && <button className="text-slate-400 hover:text-rose-500 transition-colors" onClick={() => setSelectedUser(null)}><X size={16} /></button>}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    {[
                                        { name: 'role', label: 'Authority Role', icon: Shield, opts: Object.keys(rolesConfig) },
                                        { name: 'scopeType', label: 'Scope Type', icon: Building2, opts: ['Institution', 'Department', 'Infrastructure'] },
                                    ].map(({ name, label, icon: Icon, opts }) => (
                                        <div key={name}>
                                            <label className={labelCls}>{label}</label>
                                            <div className="relative"><Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500 z-10" />
                                                <select name={name} value={formData[name]} onChange={handleChange} className={selectCls}>
                                                    {opts.map(o => <option key={o} value={o}>{o}</option>)}
                                                </select>
                                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" /></div>
                                        </div>
                                    ))}
                                    {formData.scopeType === 'Department' && (
                                        <div><label className={labelCls}>Target Department</label>
                                            <div className="relative"><MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500 z-10" />
                                                <select name="department" value={formData.department} onChange={handleChange} className={selectCls}>{departments.map(d => <option key={d} value={d}>{d}</option>)}</select>
                                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" /></div></div>
                                    )}
                                    {formData.scopeType === 'Infrastructure' && (
                                        <div><label className={labelCls}>Target Venue</label>
                                            <div className="relative"><MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500 z-10" />
                                                <select name="venue" value={formData.venue} onChange={handleChange} className={selectCls}>{venues.map(v => <option key={v} value={v}>{v}</option>)}</select>
                                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" /></div></div>
                                    )}
                                </div>
                            </div>

                            {/* Right: Preview */}
                            <div>
                                <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10"><ShieldCheck size={80} /></div>
                                    <h3 className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-5 flex items-center gap-2"><Info size={14} />Authority Impact Preview</h3>
                                    <div className="grid grid-cols-2 gap-3 relative z-10">
                                        {[
                                            { label: 'Hierarchy', value: currentHierarchy, cls: 'text-slate-800' },
                                            { label: 'Task Creation', value: previewData.canCreate, cls: previewData.canCreate === 'Yes' ? 'text-emerald-500' : 'text-rose-500' },
                                            { label: 'Assign Scope', value: `${previewData.assignTo} Users`, cls: 'text-slate-800' },
                                            { label: 'Approval Power', value: 'ENABLED', cls: 'text-emerald-600' },
                                        ].map((item, i) => (
                                            <div key={i} className="p-3 bg-white border border-slate-100 rounded-xl">
                                                <label className="text-[8px] font-bold text-slate-400 uppercase block mb-1">{item.label}</label>
                                                <span className={`text-sm font-bold ${item.cls}`}>{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-6">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">System Permissions</label>
                                        <div className="flex flex-wrap gap-1.5">
                                            {currentPermissions.map(perm => (
                                                <span key={perm} className="px-3 py-1.5 bg-white text-indigo-700 text-[10px] font-bold rounded-lg border border-slate-100 flex items-center gap-1.5 shadow-sm">
                                                    <Check size={12} className="text-emerald-500" />{perm}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 px-8 py-5 border-t border-slate-100 bg-slate-50/50">
                        <button className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-100" onClick={onClose}>Cancel</button>
                        <button className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100" onClick={() => onSuccess()}>
                            <ShieldCheck size={18} /><span>{mode === 'create' ? 'Confirm Scope Assignment' : 'Update Scope Authority'}</span>
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AuthorityModal;
