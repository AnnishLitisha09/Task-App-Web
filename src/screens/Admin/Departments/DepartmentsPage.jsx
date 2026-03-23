import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Building2, Users, UserCheck, Plus, Search,
    Edit2, UserPlus, Trash2, LayoutGrid, List
} from 'lucide-react';
import api from '../../../utils/api';
import DepartmentModal from '../../../components/UI/DepartmentModal/DepartmentModal';
import DeleteConfirmModal from '../../../components/UI/DeleteConfirmModal/DeleteConfirmModal';
import Pagination from '../../../components/UI/Pagination/Pagination';

const DepartmentsPage = () => {
    const [departments, setDepartments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('table');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDept, setSelectedDept] = useState(null);
    const [modalMode, setModalMode] = useState('create');
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => { fetchDepartments(); }, []);

    const fetchDepartments = async () => {
        setIsLoading(true);
        try {
            const response = await api('/resources/departments');
            setDepartments(Array.isArray(response) ? response : (response.departments || []));
        } catch (err) { console.error('Failed to fetch departments:', err); }
        finally { setIsLoading(false); }
    };

    // Auto-switch view based on screen size
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) setViewMode('grid');
            else setViewMode('table');
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleCreate = () => { setSelectedDept(null); setModalMode('create'); setIsModalOpen(true); };
    const handleEdit = (dept) => { setSelectedDept(dept); setModalMode('edit'); setIsModalOpen(true); };
    const handleAssignHOD = (dept) => { setSelectedDept(dept); setModalMode('assign'); setIsModalOpen(true); };
    const handleDeleteClick = (dept) => { setSelectedDept(dept); setIsDeleteOpen(true); };

    const handleDeleteConfirm = async () => {
        if (!selectedDept) return;
        try {
            const did = selectedDept.id || selectedDept.department_id;
            await api(`/resources/departments/${did}`, { method: 'DELETE' });
            setDepartments(prev => prev.filter(d => (d.id || d.department_id) !== did));
        } catch (err) { console.error('Failed to delete department:', err); }
        finally { setIsDeleteOpen(false); setSelectedDept(null); }
    };

    const filteredDepartments = departments.filter(dept =>
        (dept.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (dept.hod_name || dept.hod?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const paginatedDepartments = filteredDepartments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage);

    const stats = [
        { label: 'Total Units', value: departments.length, icon: Building2, color: 'indigo', subtitle: 'Constituent Divs' },
        { label: 'Human Assets', value: departments.reduce((acc, d) => acc + (d.faculty_count || 0), 0), icon: Users, color: 'emerald', subtitle: 'Instructional Org' },
        { label: 'Leadership', value: departments.filter(d => d.user_id || d.hod_name || d.hod).length, icon: UserCheck, color: 'amber', subtitle: 'Assigned HODs' },
    ];

    return (
        <motion.div
            className="p-6 sm:p-8 lg:p-10 min-h-screen bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            {/* ── Page Header ── */}
            <div className="mb-8 lg:mb-10">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-2">
                    Academic Divisions
                </h1>
                <p className="text-slate-500 font-medium text-sm">
                    Management and governance of institutional departments and leadership.
                </p>
            </div>

            {/* ── Stats Grid — always 3 cols ── */}
            <div className="grid grid-cols-3 gap-2 sm:gap-6 mb-8 lg:mb-12">
                {stats.map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white p-3 sm:p-8 rounded-2xl sm:rounded-[32px] border border-slate-100 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.03)] hover:-translate-y-1 transition-all group"
                    >
                        {/* Mobile: stacked. Desktop: side-by-side */}
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1 sm:mb-6 gap-1.5">
                            <div className={`w-8 h-8 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-md ${
                                stat.color === 'indigo' ? 'bg-indigo-500 text-white shadow-indigo-100' :
                                stat.color === 'emerald' ? 'bg-emerald-500 text-white shadow-emerald-100' :
                                'bg-amber-500 text-white shadow-amber-100'
                            }`}>
                                <stat.icon size={15} strokeWidth={2.5} className="sm:hidden" />
                                <stat.icon size={22} strokeWidth={2.5} className="hidden sm:block" />
                            </div>
                            <div className="sm:text-right">
                                <span className="hidden sm:block text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                    {stat.label}
                                </span>
                                <h3 className="text-lg sm:text-2xl font-bold text-slate-900 leading-none">
                                    {stat.value}
                                </h3>
                            </div>
                        </div>
                        {/* Label visible only on mobile (below number) */}
                        <p className="sm:hidden text-[8px] font-bold text-slate-400 uppercase tracking-widest truncate">{stat.label}</p>
                        {/* Bottom subtitle row — desktop only */}
                        <div className="hidden sm:flex items-center gap-2 pt-4 border-t border-slate-50">
                            <div className={`w-1.5 h-1.5 rounded-full ${
                                stat.color === 'indigo' ? 'bg-indigo-500' :
                                stat.color === 'emerald' ? 'bg-emerald-500' :
                                'bg-amber-500'
                            }`} />
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                {stat.subtitle}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* ── Controls Section ── */}
            <div className="bg-slate-50/50 p-4 sm:p-6 rounded-[28px] sm:rounded-[32px] border border-slate-100 mb-6 sm:mb-8 backdrop-blur-xl">
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
                    {/* Search */}
                    <div className="relative w-full sm:max-w-md group">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by division name or HOD..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full py-3.5 sm:py-4 pl-11 pr-5 rounded-[20px] sm:rounded-[22px] border-2 border-white bg-white shadow-sm text-sm sm:text-[0.95rem] font-bold text-slate-700 outline-none transition-all focus:border-indigo-500 focus:shadow-[0_15px_30px_-10px_rgba(99,102,241,0.1)] placeholder:text-slate-300"
                        />
                    </div>

                    {/* Right controls */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                        {/* Grid/List toggle — hidden on mobile (auto-set to grid) */}
                        <div className="hidden lg:flex bg-white p-1.5 rounded-[20px] shadow-sm border border-slate-100">
                            <button
                                className={`px-4 py-2.5 rounded-[14px] border-none cursor-pointer flex items-center gap-2 transition-all ${viewMode === 'grid' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-100' : 'bg-transparent text-slate-400 hover:text-slate-600'}`}
                                onClick={() => setViewMode('grid')}
                                title="Grid view"
                            >
                                <LayoutGrid size={16} strokeWidth={2.5} />
                                <span className="text-[11px] font-bold uppercase tracking-wider">Grid</span>
                            </button>
                            <button
                                className={`px-4 py-2.5 rounded-[14px] border-none cursor-pointer flex items-center gap-2 transition-all ${viewMode === 'table' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-100' : 'bg-transparent text-slate-400 hover:text-slate-600'}`}
                                onClick={() => setViewMode('table')}
                                title="List view"
                            >
                                <List size={16} strokeWidth={2.5} />
                                <span className="text-[11px] font-bold uppercase tracking-wider">List</span>
                            </button>
                        </div>

                        {/* Add Division button */}
                        <button
                            className="bg-slate-900 text-white py-3 sm:py-3.5 px-5 sm:px-6 rounded-xl flex items-center justify-center gap-2 font-bold text-[10px] sm:text-xs uppercase tracking-wider border-none cursor-pointer shadow-sm hover:bg-indigo-600 hover:-translate-y-0.5 active:translate-y-0 transition-all whitespace-nowrap"
                            onClick={handleCreate}
                        >
                            <Plus size={16} strokeWidth={2.5} />
                            <span>Add Division</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Content ── */}
            {isLoading ? (
                <div className="py-20 sm:py-24 flex flex-col items-center justify-center gap-5 text-slate-300">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 border-4 border-slate-100 border-t-indigo-500 rounded-full animate-spin" />
                    <p className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-400 text-center">
                        Restoring Organizational State...
                    </p>
                </div>
            ) : filteredDepartments.length === 0 ? (
                <div className="py-16 sm:py-24 bg-white rounded-3xl sm:rounded-[40px] border border-dashed border-slate-200 flex flex-col items-center text-center px-6">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-5 sm:mb-6 text-slate-300">
                        <Building2 size={36} strokeWidth={1} />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-2">No Divisions Found</h3>
                    <p className="text-slate-400 font-medium max-w-xs text-sm">
                        No institutional departments match your current search criteria.
                    </p>
                </div>
            ) : viewMode === 'grid' ? (
                /* ── Grid View — responsive card grid ── */
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
                    {paginatedDepartments.map((dept, idx) => (
                        <motion.div
                            key={dept.id || idx}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-white rounded-[28px] sm:rounded-[40px] p-5 sm:p-8 border border-slate-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.03)] flex flex-col transition-all cursor-pointer hover:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.08)] hover:-translate-y-1 sm:hover:-translate-y-2 group"
                            onClick={() => handleEdit(dept)}
                        >
                            {/* Card header */}
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-14 h-14 bg-slate-50 text-indigo-500 rounded-2xl flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all duration-300 flex-shrink-0">
                                    <h2 className="text-lg font-bold">{dept.name.substring(0, 2).toUpperCase()}</h2>
                                </div>
                                {/* Action buttons — always visible on mobile, hover-revealed on desktop */}
                                <div className="flex gap-2 lg:translate-y-2 lg:opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleEdit(dept); }}
                                        className="w-9 h-9 sm:w-10 sm:h-10 bg-white border border-slate-200 rounded-xl text-slate-500 flex items-center justify-center hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all"
                                        title="Edit"
                                    >
                                        <Edit2 size={15} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteClick(dept); }}
                                        className="w-9 h-9 sm:w-10 sm:h-10 bg-white border border-slate-200 rounded-xl text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all"
                                        title="Delete"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>

                            {/* Card body */}
                            <div className="mb-6 flex-1">
                                <h3
                                    className="text-base sm:text-lg font-bold text-slate-900 mb-5 truncate"
                                    title={dept.name}
                                >
                                    {dept.name}
                                </h3>

                                <div className="space-y-3">
                                    {/* Faculty count */}
                                    <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100/50">
                                        <div className="flex items-center gap-2.5">
                                            <Users size={15} className="text-slate-400 flex-shrink-0" />
                                            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                                                Instructional Cohort
                                            </span>
                                        </div>
                                        <span className="text-sm font-bold text-slate-900">{dept.faculty_count || 0}</span>
                                    </div>

                                    {/* HOD / Leadership */}
                                    <div className={`flex items-center justify-between p-3.5 rounded-xl border ${
                                        dept.hod_name || dept.hod?.name
                                            ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800'
                                            : 'bg-rose-50/50 border-rose-100 text-rose-800'
                                    }`}>
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <UserCheck size={15} className="opacity-60 flex-shrink-0" />
                                            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest opacity-60">
                                                Executive Lead
                                            </span>
                                        </div>
                                        <span className="text-xs font-bold truncate max-w-[120px] sm:max-w-[150px] ml-2">
                                            {dept.hod_name || dept.hod?.name || 'UNDESIGNATED'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Card footer */}
                            <div className="pt-5 border-t border-slate-50">
                                <button
                                    className="w-full bg-slate-900 text-white py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:bg-indigo-600 shadow-sm"
                                    onClick={(e) => { e.stopPropagation(); handleAssignHOD(dept); }}
                                >
                                    <UserPlus size={14} strokeWidth={2.5} />
                                    <span>{dept.user_id ? 'Reassign Authority' : 'Delegate Authority'}</span>
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                /* ── Table View (desktop only, with horizontal scroll) ── */
                <div className="bg-white rounded-[28px] sm:rounded-[40px] border border-slate-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.03)] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse min-w-[800px]">
                            <thead className="bg-white border-b border-slate-100">
                                <tr>
                                    {['Academic Division', 'Executive Leadership', 'Faculty Cohort', 'Actions'].map((h, i) => (
                                        <th
                                            key={i}
                                            className={`px-5 lg:px-8 py-4 text-[0.65rem] font-bold uppercase tracking-wider text-slate-400 ${i === 3 ? 'text-right' : 'text-left'}`}
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {paginatedDepartments.map((dept, idx) => (
                                    <tr key={dept.id || idx} className="hover:bg-indigo-50/20 transition-all duration-300 group">
                                        {/* Division name */}
                                        <td className="px-5 lg:px-8 py-4 lg:py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-xs sm:text-sm font-bold">
                                                        {dept.name.substring(0, 2).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-slate-900 truncate max-w-[180px] lg:max-w-[280px]">
                                                        {dept.name}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider italic">
                                                        Institutional Core
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* HOD / Leadership */}
                                        <td className="px-5 lg:px-8 py-4 lg:py-6">
                                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-tight ${
                                                dept.hod_name || dept.hod?.name
                                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                    : 'bg-rose-50 text-rose-600 border border-rose-100'
                                            }`}>
                                                <div className={`w-1 h-1 rounded-full flex-shrink-0 ${dept.hod_name || dept.hod?.name ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`} />
                                                <span className="truncate max-w-[120px] lg:max-w-none">
                                                    {dept.hod_name || dept.hod?.name || 'Awaiting Delegation'}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Faculty count */}
                                        <td className="px-5 lg:px-8 py-4 lg:py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="hidden sm:flex -space-x-3">
                                                    {[1, 2, 3].map(i => (
                                                        <div key={i} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-white bg-slate-100 text-[9px] flex items-center justify-center font-bold text-slate-400">
                                                            ?
                                                        </div>
                                                    ))}
                                                </div>
                                                <span className="text-sm font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-full">
                                                    {dept.faculty_count || 0}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Action buttons — always visible (not hover-only) */}
                                        <td className="px-5 lg:px-8 py-4 lg:py-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(dept)}
                                                    className="w-9 h-9 rounded-xl border border-slate-200 bg-white text-slate-500 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={15} />
                                                </button>
                                                <button
                                                    onClick={() => handleAssignHOD(dept)}
                                                    className="w-9 h-9 rounded-xl border border-slate-200 bg-white text-slate-500 flex items-center justify-center hover:bg-indigo-500 hover:text-white transition-all"
                                                    title="Assign HOD"
                                                >
                                                    <UserPlus size={15} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(dept)}
                                                    className="w-9 h-9 rounded-xl border border-slate-200 bg-white text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── Pagination ── */}
            <div className="mt-8 lg:mt-10">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    onItemsPerPageChange={setItemsPerPage}
                    totalItems={filteredDepartments.length}
                    showingCount={paginatedDepartments.length}
                />
            </div>

            <DepartmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                deptData={selectedDept}
                mode={modalMode}
                onSuccess={() => { fetchDepartments(); setIsModalOpen(false); }}
            />
            <DeleteConfirmModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="System Protocol: Delete Unit"
                confirmText="Execute Deletion"
                message={
                    <div className="font-medium text-slate-600 leading-relaxed">
                        System warning: Are you certain you wish to terminate the operational profile for{' '}
                        <strong>{selectedDept?.name}</strong>? This action results in permanent removal of all
                        departmental associations and HOD designations.
                    </div>
                }
            />
        </motion.div>
    );
};

export default DepartmentsPage;
