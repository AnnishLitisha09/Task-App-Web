import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, ShieldCheck, Check,
    ShieldAlert, Shield, Info, MapPin, Building2, ChevronDown, Search
} from 'lucide-react';
import './AuthorityModal.css';

const rolesConfig = {
    'Principal': { level: 'Level 1' },
    'Dean': { level: 'Level 1' },
    'HOD': { level: 'Level 2' },
    'Department Coordinator': { level: 'Level 3' },
    'Lab Incharge': { level: 'Level 4' },
    'Library Incharge': { level: 'Level 4' },
    'Seminar Hall Incharge': { level: 'Level 4' }
};

const scopePermissions = {
    'Institution': [
        'Create Task', 'Assign Task', 'Approve Task',
        'View Reports', 'Manage Resource Calendar'
    ],
    'Department': [
        'Create Task', 'Assign Task', 'Approve Task',
        'View Reports'
    ],
    'Infrastructure': [
        'Approve Task',
        'Manage Resource Calendar'
    ]
};

const departments = ['Computer Science', 'Electrical', 'Mechanical', 'Civil', 'Architecture'];
const venues = ['Einstein Hall', 'Newton Lab', 'Main Auditorium', 'Sports Ground'];

const AuthorityModal = ({ isOpen, onClose, authorityData, mode, onSuccess, initialUser = null }) => {
    const [formData, setFormData] = useState({
        user_id: '',
        name: '',
        email: '',
        role: 'HOD',
        scopeType: 'Department',
        department: 'Computer Science',
        venue: 'Einstein Hall'
    });

    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUser, setSelectedUser] = useState(initialUser);

    useEffect(() => {
        if (isOpen) {
            setUserSearchTerm('');
            setSearchResults([]);
            if (authorityData) {
                setFormData({
                    user_id: authorityData.user_id || '',
                    name: authorityData.name || '',
                    email: authorityData.email || '',
                    role: authorityData.role || 'HOD',
                    scopeType: authorityData.scope_type || 'Department',
                    department: authorityData.scope_type === 'Department' ? authorityData.scope_name : 'Computer Science',
                    venue: authorityData.scope_type === 'Infrastructure' ? authorityData.scope_name : 'Einstein Hall'
                });
                setSelectedUser({
                    id: authorityData.user_id,
                    name: authorityData.name,
                    email: authorityData.email,
                    role: authorityData.base_role || 'faculty'
                });
            } else if (initialUser) {
                setSelectedUser(initialUser);
                setFormData(prev => ({
                    ...prev,
                    user_id: initialUser.id,
                    name: initialUser.name,
                    email: initialUser.email
                }));
            }
        }
    }, [isOpen, authorityData, initialUser]);

    const handleUserSearch = (val) => {
        setUserSearchTerm(val);
        if (val.length < 2) {
            setSearchResults([]);
            return;
        }
        // Mock search
        const mockUsers = [
            { id: 'u1', name: 'Dr. Sarah Wilson', email: 'sarah.w@univ.edu', role: 'faculty' },
            { id: 'u2', name: 'James Smith', email: 'james.s@univ.edu', role: 'staff' },
            { id: 'u3', name: 'Robert Brown', email: 'robert.b@univ.edu', role: 'faculty' }
        ].filter(u => u.name.toLowerCase().includes(val.toLowerCase()) || u.email.toLowerCase().includes(val.toLowerCase()));
        setSearchResults(mockUsers);
    };

    const selectUser = (user) => {
        setSelectedUser(user);
        setFormData(prev => ({
            ...prev,
            user_id: user.id,
            name: user.name,
            email: user.email
        }));
        setUserSearchTerm('');
        setSearchResults([]);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };


    // Auto-calculated values
    const currentHierarchy = rolesConfig[formData.role]?.level || 'Level 4';
    const currentPermissions = scopePermissions[formData.scopeType] || [];

    const previewData = {
        canCreate: formData.scopeType !== 'Infrastructure' ? 'Yes' : 'No',
        assignTo: formData.scopeType,
        canApprove: 'Yes',
        escalations: formData.scopeType === 'Institution' ? 'Yes' : 'No',
        resourceControl: formData.scopeType !== 'Department' ? 'Yes' : 'No'
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="modal-overlay">
                <motion.div
                    className="resource-modal authority-advanced-modal light-theme"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    style={{ maxWidth: '800px', width: '90%' }}
                >
                    <div className="modal-header">
                        <div className="header-title-box">
                            <div className="header-icon"><ShieldCheck size={20} /></div>
                            <div>
                                <h2>{mode === 'create' ? 'Assign Scope & Authority' : 'Edit Scope & Authority'}</h2>
                                <p className="header-subtitle">Define operational power for {selectedUser?.name || 'Selected User'}</p>
                            </div>
                        </div>
                        <button className="close-btn" onClick={onClose}><X size={20} /></button>
                    </div>

                    <div className="modal-body overflow-y-auto p-8" style={{ maxHeight: '70vh' }}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

                            {/* Left Side: Configuration */}
                            <div className="space-y-8">
                                {!selectedUser ? (
                                    <div className="form-group relative">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Search User to Assign</label>
                                        <div className="input-with-icon">
                                            <Search size={16} className="field-icon text-indigo-500" />
                                            <input
                                                type="text"
                                                value={userSearchTerm}
                                                onChange={(e) => handleUserSearch(e.target.value)}
                                                placeholder="Search by name or email..."
                                                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                                            />
                                        </div>
                                        {searchResults.length > 0 && (
                                            <div className="absolute top-full left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-50 mt-1 max-h-48 overflow-y-auto">
                                                {searchResults.map(user => (
                                                    <div
                                                        key={user.id}
                                                        className="p-3 hover:bg-slate-50 cursor-pointer flex items-center gap-3 border-b border-slate-100 last:border-0"
                                                        onClick={() => selectUser(user)}
                                                    >
                                                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                                                            {user.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-700">{user.name}</p>
                                                            <p className="text-[10px] text-slate-400">{user.email}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="user-context-strip p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-200">
                                                {formData.name?.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{formData.name || 'Member'}</p>
                                                <p className="text-[11px] text-indigo-500 font-medium uppercase tracking-wider">{formData.role} Configuration</p>
                                            </div>
                                        </div>
                                        {!initialUser && mode === 'create' && (
                                            <button className="text-slate-400 hover:text-rose-500 transition-colors" onClick={() => setSelectedUser(null)}>
                                                <X size={16} />
                                            </button>
                                        )}
                                    </div>
                                )}

                                <div className="space-y-5">
                                    <div className="form-group">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Authority Role</label>
                                        <div className="input-with-icon">
                                            <Shield size={16} className="field-icon text-indigo-500" />
                                            <select name="role" value={formData.role} onChange={handleChange} className="bg-white border-slate-200">
                                                {Object.keys(rolesConfig).map(r => <option key={r} value={r}>{r}</option>)}
                                            </select>
                                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Scope Type</label>
                                        <div className="input-with-icon">
                                            <Building2 size={16} className="field-icon text-indigo-500" />
                                            <select name="scopeType" value={formData.scopeType} onChange={handleChange} className="bg-white border-slate-200">
                                                <option value="Institution">Institution-Wide</option>
                                                <option value="Department">Departmental</option>
                                                <option value="Infrastructure">Infrastructure/Venue</option>
                                            </select>
                                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>

                                    {formData.scopeType === 'Department' && (
                                        <div className="form-group">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Target Department</label>
                                            <div className="input-with-icon">
                                                <MapPin size={16} className="field-icon text-indigo-500" />
                                                <select name="department" value={formData.department} onChange={handleChange} className="bg-white border-slate-200">
                                                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                                                </select>
                                                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                            </div>
                                        </div>
                                    )}

                                    {formData.scopeType === 'Infrastructure' && (
                                        <div className="form-group">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Target Venue</label>
                                            <div className="input-with-icon">
                                                <MapPin size={16} className="field-icon text-indigo-500" />
                                                <select name="venue" value={formData.venue} onChange={handleChange} className="bg-white border-slate-200">
                                                    {venues.map(v => <option key={v} value={v}>{v}</option>)}
                                                </select>
                                                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                            </div>
                                        </div>
                                    )}

                                </div>
                            </div>

                            {/* Right Side: Authority Preview (Light Theme) */}
                            <div className="space-y-6">
                                <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <ShieldCheck size={80} />
                                    </div>
                                    <h3 className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-5 flex items-center gap-2">
                                        <Info size={14} />
                                        Authority Impact Preview
                                    </h3>

                                    <div className="grid grid-cols-2 gap-4 relative z-10">
                                        <div className="preview-item p-3 bg-white border border-slate-100 rounded-xl">
                                            <label className="text-[8px] font-bold text-slate-400 uppercase block mb-1">Hierarchy</label>
                                            <span className="text-sm font-bold text-slate-800">{currentHierarchy}</span>
                                        </div>
                                        <div className="preview-item p-3 bg-white border border-slate-100 rounded-xl">
                                            <label className="text-[8px] font-bold text-slate-400 uppercase block mb-1">Task Creation</label>
                                            <span className={`text-sm font-bold ${previewData.canCreate === 'Yes' ? 'text-emerald-500' : 'text-rose-500'}`}>{previewData.canCreate}</span>
                                        </div>
                                        <div className="preview-item p-3 bg-white border border-slate-100 rounded-xl">
                                            <label className="text-[8px] font-bold text-slate-400 uppercase block mb-1">Assign Scope</label>
                                            <span className="text-sm font-bold text-slate-800">{previewData.assignTo} Users</span>
                                        </div>
                                        <div className="preview-item p-3 bg-white border border-slate-100 rounded-xl">
                                            <label className="text-[8px] font-bold text-slate-400 uppercase block mb-1">Approval Power</label>
                                            <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-700 font-bold rounded-md">ENABLED</span>
                                        </div>
                                    </div>

                                    <div className="mt-8">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 block">System Permissions</label>
                                        <div className="flex flex-wrap gap-2">
                                            {currentPermissions.map(perm => (
                                                <span key={perm} className="px-3 py-1.5 bg-white text-indigo-700 text-[10px] font-bold rounded-lg border border-slate-100 flex items-center gap-1.5 shadow-sm">
                                                    <Check size={12} className="text-emerald-500" />
                                                    {perm}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <p className="text-[9px] text-slate-400 mt-6 italic">This user will be able to manage tasks and resources within their assigned {formData.scopeType}.</p>
                                </div>
                            </div>

                        </div>
                    </div>

                    <div className="modal-footer border-t border-slate-100 bg-slate-50/50 p-6">
                        <div className="flex justify-end gap-3 w-full">
                            <button className="cancel-pill px-6" onClick={onClose}>Cancel</button>
                            <button className="submit-pill px-10 bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all rounded-xl py-3 flex items-center gap-2 shadow-lg shadow-indigo-100" onClick={() => onSuccess()}>
                                <ShieldCheck size={18} />
                                <span>{mode === 'create' ? 'Confirm Scope Assignment' : 'Update Scope Authority'}</span>
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AuthorityModal;
