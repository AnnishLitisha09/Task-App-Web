import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldCheck, UserPlus, Search, ShieldAlert,
    MoreVertical, Trash2, Edit2, Shield,
    User, CheckCircle2, History, Filter, Plus
} from 'lucide-react';
import AuthorityModal from '../../../components/UI/AuthorityModal/AuthorityModal';
import AuthorityDetailView from './AuthorityDetailView';
import DeleteConfirmModal from '../../../components/UI/DeleteConfirmModal/DeleteConfirmModal';
import './AuthorityPage.css';

// Mock Data
const mockAuthorities = [
    {
        id: '1',
        name: 'Dr. Sarah Wilson',
        email: 'sarah.wilson@univ.edu',
        role: 'Dean',
        scope_type: 'Institution',
        scope_name: 'All Campuses',
        hierarchy: 'Level 1',
        status: 'Active'
    },
    {
        id: '2',
        name: 'Prof. James Smith',
        email: 'j.smith@cs.univ.edu',
        role: 'HOD',
        scope_type: 'Department',
        scope_name: 'Computer Science',
        hierarchy: 'Level 2',
        status: 'Active'
    },
    {
        id: '3',
        name: 'Robert Brown',
        email: 'r.brown@staff.univ.edu',
        role: 'Seminar Hall Incharge',
        scope_type: 'Infrastructure',
        scope_name: 'Einstein Hall',
        hierarchy: 'Level 4',
        status: 'Active'
    }
];

const rolesList = [
    'Principal', 'Dean', 'HOD', 'Department Coordinator',
    'Lab Incharge', 'Library Incharge', 'Seminar Hall Incharge'
];

const AuthorityPage = () => {
    const [authorities, setAuthorities] = useState(mockAuthorities);
    const [searchTerm, setSearchTerm] = useState('');
    const [scopeFilter, setScopeFilter] = useState('All');
    const [roleFilter, setRoleFilter] = useState('All');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedAuthority, setSelectedAuthority] = useState(null);
    const [modalMode, setModalMode] = useState('create');

    const handleCreate = () => {
        setSelectedAuthority(null);
        setModalMode('create');
        setIsModalOpen(true);
    };

    const handleEdit = (authority) => {
        setSelectedAuthority(authority);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleView = (authority) => {
        setSelectedAuthority(authority);
        setIsDetailOpen(true);
    };

    const handleDeleteClick = (authority) => {
        setSelectedAuthority(authority);
        setIsDeleteOpen(true);
    };

    const handleDeleteConfirm = () => {
        setAuthorities(prev => prev.filter(a => a.id !== selectedAuthority.id));
        setIsDeleteOpen(false);
        setSelectedAuthority(null);
    };

    const filteredAuthorities = authorities.filter(auth => {
        const matchesSearch = auth.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            auth.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesScope = scopeFilter === 'All' || auth.scope_type === scopeFilter;
        const matchesRole = roleFilter === 'All' || auth.role === roleFilter;

        return matchesSearch && matchesScope && matchesRole;
    });

    return (
        <motion.div
            className="authority-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Authority Roles</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage institutional, department, and infrastructure authorities</p>
                </div>
                <button className="primary-btn" onClick={handleCreate}>
                    <Plus size={18} />
                    <span>Create Authority</span>
                </button>
            </div>

            {/* Advanced Filters */}
            <div className="filters-bar bg-white p-4 rounded-2xl border border-slate-200 mb-6 flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-3">
                    <Filter size={16} className="text-slate-400" />
                    <select
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none"
                        value={scopeFilter}
                        onChange={(e) => setScopeFilter(e.target.value)}
                    >
                        <option value="All">All Scopes</option>
                        <option value="Institution">Institution</option>
                        <option value="Department">Department</option>
                        <option value="Infrastructure">Infrastructure</option>
                    </select>

                    <select
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option value="All">All Roles</option>
                        {rolesList.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>

                </div>
            </div>

            {/* Authority Table */}
            <div className="table-container">
                <table className="custom-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Role Name</th>
                            <th>Scope Type</th>
                            <th>Target</th>
                            <th>Hierarchy</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAuthorities.map((auth) => (
                            <tr key={auth.id}>
                                <td>
                                    <div className="user-cell">
                                        <div className="user-avatar">{auth.name.charAt(0)}</div>
                                        <div className="user-info">
                                            <span className="u-name">{auth.name}</span>
                                            <span className="u-email">{auth.email}</span>
                                        </div>
                                    </div>
                                </td>
                                <td><span className="role-badge">{auth.role}</span></td>
                                <td><span className="scope-tag">{auth.scope_type}</span></td>
                                <td><span className="text-slate-600 font-medium">{auth.scope_name}</span></td>
                                <td>
                                    <span className="hierarchy-label">{auth.hierarchy}</span>
                                </td>
                                <td className="text-right">
                                    <div className="action-btns">
                                        <button onClick={() => handleView(auth)} title="View Detail"><Shield size={16} /></button>
                                        <button onClick={() => handleEdit(auth)} title="Edit"><Edit2 size={16} /></button>
                                        <button onClick={() => handleDeleteClick(auth)} className="revoke-btn text-rose-500 hover:bg-rose-50" title="Delete">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <AuthorityModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                authorityData={selectedAuthority}
                mode={modalMode}
                onSuccess={() => setIsModalOpen(false)}
            />

            {/* Detail View Panel Placeholder */}
            {isDetailOpen && selectedAuthority && (
                <AuthorityDetailView
                    isOpen={isDetailOpen}
                    onClose={() => setIsDetailOpen(false)}
                    authority={selectedAuthority}
                />
            )}

            {isDeleteOpen && selectedAuthority && (
                <DeleteConfirmModal
                    isOpen={isDeleteOpen}
                    onClose={() => setIsDeleteOpen(false)}
                    userName={selectedAuthority.name}
                    onConfirm={handleDeleteConfirm}
                    title="Revoke Authority?"
                    confirmText="Revoke"
                    message={
                        <>Are you sure you want to revoke authority from <strong>{selectedAuthority.name}</strong>? They will lose all administrative privileges for <strong>{selectedAuthority.scope_name}</strong> immediately.</>
                    }
                />
            )}
        </motion.div>
    );
};

export default AuthorityPage;
