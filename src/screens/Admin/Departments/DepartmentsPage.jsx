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

    // Reset pagination on search change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

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

    // Paginated Departments
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const paginatedDepartments = filteredDepartments.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage);

    const stats = [
        { label: 'Total Departments', value: departments.length, icon: Building2, color: '#6366f1' },
        { label: 'Total Faculty', value: departments.reduce((acc, d) => acc + (d.faculty_count || 0), 0), icon: Users, color: '#10b981' },
        { label: 'Assigned HODs', value: departments.filter(d => d.user_id || d.hod_name || d.hod).length, icon: UserCheck, color: '#f59e0b' },
    ];

    return (
        <motion.div className="p-6 h-full overflow-y-auto bg-slate-50 min-h-screen" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Stats */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-5 mb-8">
                {stats.map((stat, idx) => (
                    <motion.div key={idx} className="bg-white p-6 rounded-2xl flex items-center gap-4 shadow-sm border border-slate-200 transition-all hover:-translate-y-1 hover:shadow-md"
                        whileHover={{ y: -5 }} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.1 }}>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}><stat.icon size={24} /></div>
                        <div>
                            <span className="block text-[0.8rem] font-bold text-slate-400 uppercase mb-1">{stat.label}</span>
                            <h3 className="text-[1.5rem] font-extrabold text-slate-800 m-0">{stat.value}</h3>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Header */}
            <div className="flex justify-between items-center mb-6 gap-4 max-md:flex-col max-md:items-stretch">
                <div className="relative flex-1 max-w-[400px] max-md:max-w-none">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Search departments or HODs..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full py-2.5 pl-10 pr-3 rounded-[10px] border border-slate-200 text-[0.9rem] transition-all bg-white text-slate-800 outline-none focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)]" />
                </div>
                <div className="flex items-center gap-4 max-md:justify-between">
                    <div className="flex bg-slate-100 p-1 rounded-[10px] border border-slate-200">
                        <button className={`px-3 py-2 rounded-lg border-none cursor-pointer flex ${viewMode === 'grid' ? 'bg-white text-indigo-500 shadow-sm' : 'bg-transparent text-slate-500'}`} onClick={() => setViewMode('grid')}><LayoutGrid size={18} /></button>
                        <button className={`px-3 py-2 rounded-lg border-none cursor-pointer flex ${viewMode === 'table' ? 'bg-white text-indigo-500 shadow-sm' : 'bg-transparent text-slate-500'}`} onClick={() => setViewMode('table')}><List size={18} /></button>
                    </div>
                    <button className="bg-indigo-500 text-white py-2.5 px-[18px] rounded-[10px] flex items-center gap-2 font-bold border-none cursor-pointer shadow-[0_4px_12px_rgba(99,102,241,0.2)]" onClick={handleCreate}>
                        <Plus size={18} /><span>Add Department</span>
                    </button>
                </div>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="py-16 flex flex-col items-center gap-4 text-slate-500">
                    <div className="w-10 h-10 border-[3px] border-slate-100 border-t-indigo-500 rounded-full animate-spin"></div>
                    <p>Loading departments...</p>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6">
                    {paginatedDepartments.map((dept, idx) => (
                        <motion.div key={dept.id || idx}
                            className="bg-white rounded-[20px] p-6 border border-slate-200 flex flex-col justify-between transition-all cursor-pointer gap-6 hover:-translate-y-1 hover:border-indigo-500 hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.1)]"
                            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}
                            onClick={() => setSelectedDept(dept)}>
                            <div className="flex justify-between items-center">
                                <div className="w-11 h-11 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center"><Building2 size={24} /></div>
                                <div className="flex gap-1">
                                    <button onClick={(e) => { e.stopPropagation(); handleEdit(dept); }} className="bg-white border border-slate-200 rounded-[10px] p-2 text-slate-500 cursor-pointer hover:text-indigo-500 hover:border-indigo-500"><Edit2 size={16} /></button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteClick(dept); }} className="bg-white border border-slate-200 rounded-[10px] p-2 text-slate-500 cursor-pointer hover:text-red-500 hover:border-red-200 hover:bg-red-50"><Trash2 size={16} /></button>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-[1.25rem] font-extrabold text-slate-800 m-0">{dept.name}</h3>
                                <div className="flex flex-col gap-2.5 mt-4">
                                    <div className="flex items-center gap-2.5 text-slate-500 text-[0.9rem]"><Users size={14} className="text-slate-400" /><span>{dept.faculty_count || 0} Faculty Members</span></div>
                                    <div className="flex items-center gap-2.5 text-[0.9rem]">
                                        <UserCheck size={14} className="text-slate-400" />
                                        <span className={dept.hod_name || dept.hod?.name ? 'text-emerald-600 font-bold' : 'text-red-500 italic'}>
                                            {dept.hod_name || dept.hod?.name || 'No HOD Assigned'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="border-t border-slate-100 pt-5">
                                <button className="w-full bg-white border border-slate-200 text-indigo-500 py-2.5 rounded-[10px] font-bold cursor-pointer flex items-center justify-center gap-2 hover:bg-indigo-50"
                                    onClick={(e) => { e.stopPropagation(); handleAssignHOD(dept); }}>
                                    <UserPlus size={16} /><span>{dept.user_id ? 'Change HOD' : 'Assign HOD'}</span>
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-[20px] border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full border-collapse min-w-[800px]">
                            <thead>
                                <tr>
                                    {['Department Name', 'HOD / Head of Dept', 'Faculty Count', ''].map((h, i) => (
                                        <th key={i} className={`bg-slate-50 px-5 py-4 text-left text-[0.75rem] font-bold text-slate-500 uppercase border-b border-slate-100 ${h === '' ? 'text-right' : ''}`}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {paginatedDepartments.map((dept, idx) => (
                                    <tr key={dept.id || idx} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-5 py-4 border-b border-slate-100 text-[0.95rem] text-slate-700">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-indigo-50 text-indigo-500 rounded-[10px] flex items-center justify-center text-[0.85rem] font-extrabold">{dept.name.substring(0, 2).toUpperCase()}</div>
                                                <span>{dept.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 border-b border-slate-100">
                                            <span className={`px-3 py-1 rounded-lg text-[0.85rem] font-semibold ${dept.hod_name || dept.hod?.name ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {dept.hod_name || dept.hod?.name || 'Not Specified'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 border-b border-slate-100">
                                            <span className="inline-flex px-3 py-1 bg-slate-100 rounded-2xl text-[0.85rem] font-semibold text-slate-600">{dept.faculty_count || 0} Members</span>
                                        </td>
                                        <td className="px-5 py-4 border-b border-slate-100 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleEdit(dept)} className="w-[34px] h-[34px] rounded-lg border border-slate-200 bg-white text-slate-500 flex items-center justify-center cursor-pointer hover:text-indigo-500 hover:border-indigo-500"><Edit2 size={16} /></button>
                                                <button onClick={() => handleAssignHOD(dept)} className="w-[34px] h-[34px] rounded-lg border border-slate-200 bg-white text-slate-500 flex items-center justify-center cursor-pointer hover:text-indigo-500 hover:border-indigo-500"><UserPlus size={16} /></button>
                                                <button onClick={() => handleDeleteClick(dept)} className="w-[34px] h-[34px] rounded-lg border border-slate-200 bg-white text-slate-500 flex items-center justify-center cursor-pointer hover:text-red-500 hover:border-red-200 hover:bg-red-50"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={setItemsPerPage}
                totalItems={filteredDepartments.length}
                showingCount={paginatedDepartments.length}
            />

            <DepartmentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} deptData={selectedDept} mode={modalMode} onSuccess={() => { fetchDepartments(); setIsModalOpen(false); }} />
            <DeleteConfirmModal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={handleDeleteConfirm} title="Delete Department?" confirmText="Delete Division"
                message={<>Are you sure you want to remove the <strong>{selectedDept?.name}</strong>? This will permanently remove the department and its administrative associations.</>} />
        </motion.div>
    );
};

export default DepartmentsPage;
