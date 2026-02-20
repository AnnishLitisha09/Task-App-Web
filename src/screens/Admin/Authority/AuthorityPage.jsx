import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Plus, Search, Filter,
    Trash2, Edit2, Shield, LayoutGrid, List
} from 'lucide-react';
import AuthorityModal from '../../../components/UI/AuthorityModal/AuthorityModal';
import AuthorityDetailView from './AuthorityDetailView';
import DeleteConfirmModal from '../../../components/UI/DeleteConfirmModal/DeleteConfirmModal';
import Pagination from '../../../components/UI/Pagination/Pagination';

const mockAuthorities = [
    { id: '1', name: 'Dr. Sarah Wilson', email: 'sarah.wilson@univ.edu', role: 'Dean', scope_type: 'Institution', scope_name: 'All Campuses', hierarchy: 'Level 1', status: 'Active' },
    { id: '2', name: 'Prof. James Smith', email: 'j.smith@cs.univ.edu', role: 'HOD', scope_type: 'Department', scope_name: 'Computer Science', hierarchy: 'Level 2', status: 'Active' },
    { id: '3', name: 'Robert Brown', email: 'r.brown@staff.univ.edu', role: 'Seminar Hall Incharge', scope_type: 'Infrastructure', scope_name: 'Einstein Hall', hierarchy: 'Level 4', status: 'Active' },
];

const rolesList = ['Principal', 'Dean', 'HOD', 'Department Coordinator', 'Lab Incharge', 'Library Incharge', 'Seminar Hall Incharge'];

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
    const [viewMode, setViewMode] = useState('table');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const handleCreate = () => { setSelectedAuthority(null); setModalMode('create'); setIsModalOpen(true); };
    const handleEdit = (a) => { setSelectedAuthority(a); setModalMode('edit'); setIsModalOpen(true); };
    const handleView = (a) => { setSelectedAuthority(a); setIsDetailOpen(true); };
    const handleDeleteClick = (a) => { setSelectedAuthority(a); setIsDeleteOpen(true); };
    const handleDeleteConfirm = () => { setAuthorities(prev => prev.filter(a => a.id !== selectedAuthority.id)); setIsDeleteOpen(false); setSelectedAuthority(null); };

    // Reset pagination on filter change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, scopeFilter, roleFilter]);

    const filteredAuthorities = authorities.filter(auth => {
        const matchesSearch = auth.name.toLowerCase().includes(searchTerm.toLowerCase()) || auth.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesScope = scopeFilter === 'All' || auth.scope_type === scopeFilter;
        const matchesRole = roleFilter === 'All' || auth.role === roleFilter;
        return matchesSearch && matchesScope && matchesRole;
    });

    // Paginated Authorities
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const paginatedAuthorities = filteredAuthorities.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredAuthorities.length / itemsPerPage);

    return (
        <motion.div className="p-10 h-full overflow-y-auto bg-slate-50 min-h-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Header */}
            <div className="flex justify-between items-center mb-8 max-md:flex-col max-md:items-stretch max-md:gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Authority Roles</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage institutional, department, and infrastructure authorities</p>
                </div>
                <button
                    className="flex items-center gap-2 bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold border-none cursor-pointer shadow-[0_4px_12px_rgba(99,102,241,0.2)] transition-all hover:bg-indigo-600 hover:-translate-y-0.5 max-md:justify-center"
                    onClick={handleCreate}
                >
                    <Plus size={18} /><span>Create Authority</span>
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-5 rounded-[20px] border border-slate-200 mb-8 flex flex-wrap gap-5 items-center max-md:flex-col max-md:items-stretch">
                <div className="flex bg-slate-100 rounded-xl p-1 gap-1 border border-slate-200">
                    {[{ mode: 'grid', Icon: LayoutGrid }, { mode: 'table', Icon: List }].map(({ mode, Icon }) => (
                        <button
                            key={mode}
                            className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all ${viewMode === mode ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                            onClick={() => setViewMode(mode)}
                        >
                            <Icon size={18} />
                        </button>
                    ))}
                </div>
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none transition-colors focus:border-indigo-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3">
                    <Filter size={16} className="text-slate-400" />
                    <select className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none cursor-pointer focus:border-indigo-500" value={scopeFilter} onChange={(e) => setScopeFilter(e.target.value)}>
                        <option value="All">All Scopes</option>
                        <option value="Institution">Institution</option>
                        <option value="Department">Department</option>
                        <option value="Infrastructure">Infrastructure</option>
                    </select>
                    <select className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none cursor-pointer focus:border-indigo-500" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                        <option value="All">All Roles</option>
                        {rolesList.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
            </div>

            {/* Content View */}
            <div className="min-h-[200px]">
                {viewMode === 'table' ? (
                    <div className="bg-white rounded-[20px] border border-slate-200 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] overflow-hidden">
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full border-collapse min-w-[900px]">
                                <thead>
                                    <tr>
                                        {['Name', 'Role Name', 'Scope Type', 'Target', 'Hierarchy', ''].map((h, i) => (
                                            <th key={i} className={`bg-slate-50 px-6 py-4 text-left text-[0.75rem] font-bold text-slate-500 uppercase border-b border-slate-100 ${h === '' ? 'text-right' : ''}`}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedAuthorities.map((auth) => (
                                        <tr key={auth.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 border-b border-slate-100 text-[0.9rem] text-slate-700">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-indigo-500 text-white rounded-[10px] flex items-center justify-center font-bold">{auth.name.charAt(0)}</div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-800">{auth.name}</span>
                                                        <span className="text-[0.8rem] text-slate-500">{auth.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 border-b border-slate-100"><span className="bg-indigo-50 text-indigo-500 px-2.5 py-1 rounded-lg text-[0.75rem] font-bold">{auth.role}</span></td>
                                            <td className="px-6 py-4 border-b border-slate-100"><span className="bg-green-50 text-green-700 px-2.5 py-1 rounded-lg text-[0.75rem] font-bold">{auth.scope_type}</span></td>
                                            <td className="px-6 py-4 border-b border-slate-100 text-slate-600 font-medium">{auth.scope_name}</td>
                                            <td className="px-6 py-4 border-b border-slate-100 text-[0.8rem] font-semibold text-slate-500">{auth.hierarchy}</td>
                                            <td className="px-6 py-4 border-b border-slate-100 text-right">
                                                <div className="flex justify-end gap-2.5">
                                                    <button onClick={() => handleView(auth)} title="View Detail" className="w-[34px] h-[34px] rounded-lg border border-slate-200 bg-white text-slate-500 flex items-center justify-center cursor-pointer transition-all hover:bg-slate-100 hover:text-indigo-500 hover:border-indigo-500"><Shield size={16} /></button>
                                                    <button onClick={() => handleEdit(auth)} title="Edit" className="w-[34px] h-[34px] rounded-lg border border-slate-200 bg-white text-slate-500 flex items-center justify-center cursor-pointer transition-all hover:bg-slate-100 hover:text-indigo-500 hover:border-indigo-500"><Edit2 size={16} /></button>
                                                    <button onClick={() => handleDeleteClick(auth)} title="Delete" className="w-[34px] h-[34px] rounded-lg border border-slate-200 bg-white text-slate-500 flex items-center justify-center cursor-pointer transition-all hover:bg-red-50 hover:text-red-500 hover:border-red-200"><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6">
                        {paginatedAuthorities.map((auth) => (
                            <motion.div
                                key={auth.id}
                                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col hover:shadow-md transition-shadow"
                                whileHover={{ y: -4 }}
                            >
                                <div className="flex items-center gap-4 mb-5">
                                    <div className="w-12 h-12 bg-indigo-500 text-white rounded-2xl flex items-center justify-center text-xl font-bold shadow-sm shadow-indigo-100">{auth.name.charAt(0)}</div>
                                    <div className="flex flex-col min-w-0">
                                        <h3 className="font-bold text-slate-900 text-[1.05rem] leading-tight truncate">{auth.name}</h3>
                                        <span className="text-[0.8rem] text-slate-500 truncate">{auth.email}</span>
                                    </div>
                                </div>

                                <div className="space-y-3.5 mb-6 flex-1">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-400 font-medium">Role</span>
                                        <span className="bg-indigo-50 text-indigo-600 px-2.5 py-0.5 rounded-lg text-[0.75rem] font-bold">{auth.role}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-400 font-medium">Scope</span>
                                        <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-lg text-[0.75rem] font-bold">{auth.scope_type}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-400 font-medium">Target</span>
                                        <span className="text-slate-700 font-bold truncate max-w-[150px]">{auth.scope_name}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-400 font-medium">Hierarchy</span>
                                        <span className="text-indigo-500 font-extrabold">{auth.hierarchy}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-4 border-t border-slate-50">
                                    <button onClick={() => handleView(auth)} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-50 text-slate-600 font-bold text-sm transition-all hover:bg-indigo-50 hover:text-indigo-600 active:scale-95"><Shield size={16} /> View</button>
                                    <button onClick={() => handleEdit(auth)} className="w-[48px] flex items-center justify-center py-3 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-indigo-500 hover:border-indigo-200 transition-all active:scale-95"><Edit2 size={16} /></button>
                                    <button onClick={() => handleDeleteClick(auth)} className="w-[48px] flex items-center justify-center py-3 rounded-xl bg-red-50 text-red-400 hover:text-red-500 transition-all active:scale-95"><Trash2 size={16} /></button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    onItemsPerPageChange={setItemsPerPage}
                    totalItems={filteredAuthorities.length}
                    showingCount={paginatedAuthorities.length}
                />
            </div>

            <AuthorityModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} authorityData={selectedAuthority} mode={modalMode} onSuccess={() => setIsModalOpen(false)} />
            {isDetailOpen && selectedAuthority && <AuthorityDetailView isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} authority={selectedAuthority} />}
            {isDeleteOpen && selectedAuthority && (
                <DeleteConfirmModal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} userName={selectedAuthority.name} onConfirm={handleDeleteConfirm} title="Revoke Authority?" confirmText="Revoke"
                    message={<>Are you sure you want to revoke authority from <strong>{selectedAuthority.name}</strong>? They will lose all administrative privileges for <strong>{selectedAuthority.scope_name}</strong> immediately.</>}
                />
            )}
        </motion.div>
    );
};

export default AuthorityPage;
