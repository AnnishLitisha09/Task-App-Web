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
            className="p-10 max-lg:p-8 max-md:p-6 max-sm:p-4 min-h-screen bg-white"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
        >
            {/* Page Header */}
            <div className="mb-10 max-md:mb-8">
                <h1 className="text-3xl max-md:text-2xl font-black text-slate-900 tracking-tight mb-2">Academic Divisions</h1>
                <p className="text-slate-500 font-medium max-md:text-sm">Management and governance of institutional departments and leadership.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6 mb-12 max-md:mb-10 max-sm:grid-cols-2 max-sm:gap-4">
                {stats.map((stat, idx) => (
                    <motion.div 
                        key={idx} 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white p-8 max-sm:p-6 rounded-[32px] border border-slate-100 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.03)] hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all group"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className={`w-14 h-14 max-sm:w-12 max-sm:h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg ${
                                stat.color === 'indigo' ? 'bg-indigo-500 text-white shadow-indigo-100' :
                                stat.color === 'emerald' ? 'bg-emerald-500 text-white shadow-emerald-100' :
                                'bg-amber-500 text-white shadow-amber-100'
                            }`}>
                                <stat.icon size={26} strokeWidth={2.5} className="max-sm:w-5 max-sm:h-5" />
                            </div>
                            <div className="text-right">
                                <span className="block text-[0.65rem] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</span>
                                <h3 className="text-3xl max-sm:text-2xl font-black text-slate-900 leading-none">{stat.value}</h3>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 pt-4 border-t border-slate-50">
                            <div className={`w-1.5 h-1.5 rounded-full ${
                                stat.color === 'indigo' ? 'bg-indigo-500' :
                                stat.color === 'emerald' ? 'bg-emerald-500' :
                                'bg-amber-500'
                            }`}></div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.subtitle}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Controls Section */}
            <div className="bg-slate-50/50 p-6 max-sm:p-4 rounded-[32px] border border-slate-100 mb-8 backdrop-blur-xl">
                <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
                    <div className="relative w-full lg:max-w-md group">
                        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Search by division name or HOD..." 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full py-4 pl-12 pr-6 rounded-[22px] border-2 border-white bg-white shadow-sm text-[0.95rem] font-bold text-slate-700 outline-none transition-all focus:border-indigo-500 focus:shadow-[0_15px_30px_-10px_rgba(99,102,241,0.1)] placeholder:text-slate-300" 
                        />
                    </div>
                    
                    <div className="flex items-center gap-4 w-full lg:w-auto overflow-x-auto no-scrollbar pb-1 lg:pb-0">
                        <div className="flex bg-white p-1.5 rounded-[20px] shadow-sm border border-slate-100 max-lg:hidden">
                            <button 
                                className={`px-5 py-2.5 rounded-[14px] border-none cursor-pointer flex items-center gap-2 transition-all ${viewMode === 'grid' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-100' : 'bg-transparent text-slate-400 hover:text-slate-600'}`} 
                                onClick={() => setViewMode('grid')}
                            >
                                <LayoutGrid size={18} strokeWidth={2.5} />
                                <span className="text-[11px] font-black uppercase tracking-wider">Grid</span>
                            </button>
                            <button 
                                className={`px-5 py-2.5 rounded-[14px] border-none cursor-pointer flex items-center gap-2 transition-all ${viewMode === 'table' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-100' : 'bg-transparent text-slate-400 hover:text-slate-600'}`} 
                                onClick={() => setViewMode('table')}
                            >
                                <List size={18} strokeWidth={2.5} />
                                <span className="text-[11px] font-black uppercase tracking-wider">List</span>
                            </button>
                        </div>
                        
                        <button 
                            className="flex-1 lg:flex-none bg-slate-900 text-white py-4 px-8 rounded-[22px] flex items-center justify-center gap-3 font-black text-xs uppercase tracking-[0.2em] border-none cursor-pointer shadow-xl hover:bg-indigo-600 hover:-translate-y-0.5 active:translate-y-0 transition-all"
                            onClick={handleCreate}
                        >
                            <Plus size={20} strokeWidth={3} />
                            <span>Add Division</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Visualization Content */}
            {isLoading ? (
                <div className="py-24 flex flex-col items-center justify-center gap-5 text-slate-300">
                    <div className="w-14 h-14 border-4 border-slate-100 border-t-indigo-500 rounded-full animate-spin"></div>
                    <p className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-slate-400">Restoring Organizational State...</p>
                </div>
            ) : filteredDepartments.length === 0 ? (
                <div className="py-24 bg-slate-50/30 rounded-[40px] border-2 border-dashed border-slate-100 flex flex-col items-center text-center px-6">
                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-xl mb-6 text-slate-200">
                        <Building2 size={40} strokeWidth={1} />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 mb-2">No Divisions Found</h3>
                    <p className="text-slate-400 font-medium max-w-xs">No institutional departments match your current search criteria.</p>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] max-sm:grid-cols-1 gap-8 max-sm:gap-6">
                    {paginatedDepartments.map((dept, idx) => (
                        <motion.div 
                            key={dept.id || idx}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-white rounded-[40px] p-8 max-sm:p-6 border border-slate-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.03)] flex flex-col transition-all cursor-pointer hover:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.08)] hover:-translate-y-2 group"
                            onClick={() => handleEdit(dept)}
                        >
                            <div className="flex justify-between items-start mb-8">
                                <div className="w-16 h-16 bg-slate-50 text-indigo-500 rounded-3xl flex items-center justify-center shadow-inner group-hover:bg-indigo-500 group-hover:text-white transition-all duration-500 group-hover:rotate-6">
                                    <h2 className="text-2xl font-black">{dept.name.substring(0, 2).toUpperCase()}</h2>
                                </div>
                                <div className="flex gap-2 translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 max-lg:opacity-100 max-lg:translate-y-0">
                                    <button onClick={(e) => { e.stopPropagation(); handleEdit(dept); }} className="w-10 h-10 bg-white border border-slate-200 rounded-xl text-slate-500 flex items-center justify-center hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all"><Edit2 size={16} /></button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteClick(dept); }} className="w-10 h-10 bg-white border border-slate-200 rounded-xl text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all"><Trash2 size={16} /></button>
                                </div>
                            </div>

                            <div className="mb-8 flex-1">
                                <h3 className="text-2xl max-md:text-xl font-black text-slate-900 mb-6 truncate" title={dept.name}>{dept.name}</h3>
                                
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                                        <div className="flex items-center gap-3">
                                            <Users size={16} className="text-slate-400" />
                                            <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Instructional Cohort</span>
                                        </div>
                                        <span className="text-sm font-black text-slate-900">{dept.faculty_count || 0}</span>
                                    </div>
                                    
                                    <div className={`flex items-center justify-between p-4 rounded-2xl border ${
                                        dept.hod_name || dept.hod?.name 
                                            ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800' 
                                            : 'bg-rose-50/50 border-rose-100 text-rose-800'
                                    }`}>
                                        <div className="flex items-center gap-3">
                                            <UserCheck size={16} className="opacity-60" />
                                            <span className="text-[11px] font-black uppercase tracking-widest opacity-60">Executive Lead</span>
                                        </div>
                                        <span className="text-xs font-black truncate max-w-[150px]">{dept.hod_name || dept.hod?.name || 'UNDESIGNATED'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-50">
                                <button 
                                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all hover:bg-indigo-600 shadow-lg"
                                    onClick={(e) => { e.stopPropagation(); handleAssignHOD(dept); }}
                                >
                                    <UserPlus size={16} strokeWidth={3} />
                                    <span>{dept.user_id ? 'Reassign Authority' : 'Delegate Authority'}</span>
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-[40px] border border-slate-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.03)] overflow-hidden">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full border-collapse min-w-[1000px]">
                            <thead className="bg-slate-50/40 border-b border-slate-100/50">
                                <tr>
                                    {['Academic Division', 'Executive Leadership', 'Faculty Cohort', 'Interface'].map((h, i) => (
                                        <th key={i} className={`px-8 py-6 text-[0.65rem] font-black uppercase tracking-[0.2em] text-slate-400 ${i === 3 ? 'text-right' : 'text-left'}`}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {paginatedDepartments.map((dept, idx) => (
                                    <tr key={dept.id || idx} className="hover:bg-indigo-50/20 transition-all duration-300 group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:scale-110 transition-transform group-hover:bg-indigo-500 group-hover:text-white">
                                                    <span className="text-sm font-black group-hover:rotate-12 transition-transform">{dept.name.substring(0, 2).toUpperCase()}</span>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-base font-black text-slate-900 truncate max-w-[280px]">{dept.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider italic">Institutional Core</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-xl text-[0.7rem] font-black uppercase tracking-tight ${
                                                dept.hod_name || dept.hod?.name ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                                            }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${dept.hod_name || dept.hod?.name ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`}></div>
                                                {dept.hod_name || dept.hod?.name || 'Awaiting Delegation'}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="flex -space-x-3">
                                                    {[1, 2, 3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 text-[10px] flex items-center justify-center font-black text-slate-400">?</div>)}
                                                </div>
                                                <span className="text-sm font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-full">{dept.faculty_count || 0}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-3 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                                                <button onClick={() => handleEdit(dept)} className="w-[38px] h-[38px] rounded-xl border border-slate-200 bg-white text-slate-500 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all"><Edit2 size={16} /></button>
                                                <button onClick={() => handleAssignHOD(dept)} className="w-[38px] h-[38px] rounded-xl border border-slate-200 bg-white text-slate-500 flex items-center justify-center hover:bg-indigo-500 hover:text-white transition-all"><UserPlus size={16} /></button>
                                                <button onClick={() => handleDeleteClick(dept)} className="w-[38px] h-[38px] rounded-xl border border-slate-200 bg-white text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div className="mt-10">
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

            <DepartmentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} deptData={selectedDept} mode={modalMode} onSuccess={() => { fetchDepartments(); setIsModalOpen(false); }} />
            <DeleteConfirmModal 
                isOpen={isDeleteOpen} 
                onClose={() => setIsDeleteOpen(false)} 
                onConfirm={handleDeleteConfirm} 
                title="System Protocol: Delete Unit" 
                confirmText="Execute Deletion"
                message={<div className="font-medium text-slate-600 leading-relaxed">System warning: Are you certain you wish to terminate the operational profile for <strong>{selectedDept?.name}</strong>? This action results in permanent removal of all departmental associations and HOD designations.</div>} 
            />
        </motion.div>
    );
};

export default DepartmentsPage;
