import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import api from '../../../utils/api';
import CreateUserModal from '../../../components/UI/CreateUserModal/CreateUserModal';
import DeleteConfirmModal from '../../../components/UI/DeleteConfirmModal/DeleteConfirmModal';
import ViewUserModal from '../../../components/UI/ViewUserModal/ViewUserModal';
import {
    Search, UserPlus, Eye,
    Edit3, UserMinus, Users, UserCircle, ShieldCheck, ChevronDown, Upload, CheckCircle2,
    LayoutGrid, List
} from 'lucide-react';
import AuthorityModal from '../../../components/UI/AuthorityModal/AuthorityModal';
import AuthorityTransferModal from '../../../components/UI/AuthorityModal/AuthorityTransferModal';
import Pagination from '../../../components/UI/Pagination/Pagination';

const UsersPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [deptFilter, setDeptFilter] = useState('all');
    const [departments, setDepartments] = useState([]);
    const [venues, setVenues] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState('');
    const [usersList, setUsersList] = useState([]);
    const [apiCounts, setApiCounts] = useState(null);
    const [isUsersLoading, setIsUsersLoading] = useState(true);
    const [isAuthorityOpen, setIsAuthorityOpen] = useState(false);
    const [isTransferOpen, setIsTransferOpen] = useState(false);
    const [authMode, setAuthMode] = useState('create');
    const [isBulkLoading, setIsBulkLoading] = useState(false);
    const [viewMode, setViewMode] = useState('table');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    React.useEffect(() => {
        const fetchResources = async () => {
            try {
                const [depts, vns] = await Promise.all([api('/resources/departments'), api('/resources/venues')]);
                setDepartments(Array.isArray(depts) ? depts : (depts?.departments || depts?.data || []));
                setVenues(Array.isArray(vns) ? vns : (vns?.venues || vns?.data || []));
            } catch (err) { console.error('Failed to fetch resources:', err); }
        };

        const fetchUsers = async () => {
            setIsUsersLoading(true);
            try {
                const response = await api('/users/dashboard/all');
                if (response?.users) {
                    const mappedUsers = response.users.map(u => {
                        const info = u.student_info || u.faculty_info || u.staff_info || u.role_user_info || {};
                        return { ...u, ...info, name: info.name || (u.role === 'admin' ? 'Admin' : 'Unknown'), email: info.email || 'N/A', dept: info.department_name || (u.role_assignments?.[0]?.department) || 'N/A', regNo: info.reg_no || 'N/A', score: parseFloat(info.score || 0), penalty: parseFloat(info.penalty || 0), year: info.year || 'N/A', designation: info.designation || 'N/A' };
                    });
                    setUsersList(mappedUsers);
                }
                if (response?.counts) setApiCounts(response.counts);
            } catch (err) { console.error('Failed to fetch users:', err); }
            finally { setIsUsersLoading(false); }
        };

        fetchResources(); fetchUsers();
    }, []);

    // Reset pagination on filter change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, activeTab, statusFilter, deptFilter]);

    const stats = [
        { label: 'Total Users', value: apiCounts?.total_active_users?.toString() || usersList.length.toString(), icon: Users, color: '#6366f1' },
        { label: 'Students', value: apiCounts?.students?.toString() || usersList.filter(u => u.role === 'student').length.toString(), icon: UserCircle, color: '#10b981' },
        { label: 'Faculty Members', value: apiCounts?.faculty?.toString() || usersList.filter(u => u.role === 'faculty').length.toString(), icon: ShieldCheck, color: '#f59e0b' },
        { label: 'Role Users', value: apiCounts?.role_users?.toString() || usersList.filter(u => u.role === 'role-user').length.toString(), icon: ShieldCheck, color: '#3b82f6' },
    ];

    const filteredUsers = usersList.filter(user => {
        if (!user) return false;
        const matchesCategory = activeTab === 'all' || (activeTab === 'authority' ? user.role === 'role-user' : user.role === activeTab);
        const matchesStatus = statusFilter === 'all' || (user.status || '').toLowerCase() === statusFilter.toLowerCase();
        const matchesDept = deptFilter === 'all' || user.dept === deptFilter;
        const matchesSearch = (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) || (user.regNo || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesStatus && matchesDept && matchesSearch;
    });

    // Paginated Users
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const paginatedUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    const isFiltered = activeTab !== 'all' || statusFilter !== 'all' || deptFilter !== 'all' || searchTerm !== '';

    const handleClearFilters = () => { setActiveTab('all'); setStatusFilter('all'); setDeptFilter('all'); setSearchTerm(''); };
    const handleCreateNew = () => { setIsEditMode(false); setSelectedUser(null); setIsModalOpen(true); };
    const handleView = (user) => { setSelectedUser(user); setIsViewOpen(true); };
    const handleEdit = (user) => { setIsEditMode(true); setSelectedUser(user); setIsModalOpen(true); };
    const handleDeleteClick = (user) => { setSelectedUser(user); setIsDeleteOpen(true); };
    const handleDeleteConfirm = () => { setUsersList(prev => prev.filter(u => u.id !== selectedUser.id)); setSelectedUser(null); setIsDeleteOpen(false); };

    const handleBulkUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        setIsBulkLoading(true);
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);
                const result = await api('/users/bulk-create', { method: 'POST', body: { users: jsonData } });
                alert(`Successfully uploaded ${result.count || jsonData.length} users!`);
            } catch (err) { alert(`Error: ${err.message}`); }
            finally { setIsBulkLoading(false); }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleExportExcel = () => {
        const dataToExport = filteredUsers.map(user => ({ "Name": user.name, "Email": user.email, "Category": user.category, "Department": user.dept, "Year": user.year, "Credit Score": user.score, "Penalty": user.penalty, "Status": user.status, "Advisor": user.advisor || 'N/A' }));
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
        XLSX.writeFile(workbook, `users_export_${new Date().toLocaleDateString()}.xlsx`);
    };

    const getCatBadgeClass = (role) => {
        switch (role) {
            case 'student': return 'bg-indigo-50 text-indigo-500';
            case 'faculty': return 'bg-emerald-50 text-emerald-600';
            case 'staff': return 'bg-slate-100 text-slate-500';
            case 'authority': case 'role-user': return 'bg-orange-50 text-orange-700';
            default: return 'bg-slate-100 text-slate-500';
        }
    };

    return (
        <motion.div
            className="p-8 animate-[fadeIn_0.5s_ease] bg-slate-50 min-h-screen max-md:p-5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* Header */}
            <div className="flex justify-between items-center mb-10 max-md:flex-col max-md:items-stretch max-md:gap-6">
                <div>
                    <h1 className="text-[2rem] text-slate-800 font-extrabold m-0 tracking-[-0.5px]">User Directory</h1>
                    <p className="text-slate-500 text-base mt-1.5">Manage institutional profiles and credentials</p>
                </div>
                <div className="flex gap-3 max-md:w-full">
                    <label className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-[22px] py-2.5 rounded-xl font-bold cursor-pointer transition-colors hover:bg-slate-50 max-md:flex-1 max-md:justify-center">
                        <Upload size={18} />
                        <span className="max-[480px]:hidden">Excel Upload</span>
                        <span className="min-[481px]:hidden text-xs">Upload</span>
                        <input type="file" hidden accept=".xlsx, .xls, .csv" onChange={handleBulkUpload} />
                    </label>
                    <button
                        className="flex items-center gap-2 bg-indigo-500 text-white border-none px-[22px] py-2.5 rounded-xl font-bold cursor-pointer transition-all shadow-[0_4px_12px_rgba(99,102,241,0.2)] hover:bg-indigo-600 max-md:flex-1 max-md:justify-center"
                        onClick={handleCreateNew}
                    >
                        <UserPlus size={18} />
                        <span className="max-[520px]:hidden">Create New User</span>
                        <span className="min-[521px]:hidden text-xs">Add User</span>
                    </button>
                </div>
            </div>

            {/* Stats Strip */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6 mb-10 max-lg:grid-cols-2 max-[480px]:grid-cols-1">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center gap-4 transition-all duration-300 shadow-sm hover:-translate-y-1 hover:shadow-[0_12px_20px_-8px_rgba(0,0,0,0.05)] hover:border-indigo-500">
                        <div className="w-11 h-11 rounded-xl grid place-items-center" style={{ background: `${stat.color}15`, color: stat.color }}>
                            <stat.icon size={18} />
                        </div>
                        <div>
                            <p className="text-[0.8rem] font-semibold text-slate-400 m-0 uppercase tracking-[0.5px]">{stat.label}</p>
                            <h4 className="text-[1.4rem] font-bold text-slate-800 m-0">{stat.value}</h4>
                        </div>
                    </div>
                ))}
            </div>

            {/* Table Controls */}
            <div className="flex justify-between items-center mb-6 gap-4 max-md:flex-col max-md:items-stretch">
                <div className="flex gap-3 items-center max-md:flex-col max-md:items-stretch flex-1">
                    <div className="flex gap-2 items-center">
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
                    </div>
                    <div className="flex gap-3 items-center overflow-x-auto pb-2 hide-scrollbar max-md:w-full max-md:grid max-md:grid-cols-2 max-[480px]:grid-cols-1">
                        {/* Category Select */}
                        <div className="relative flex items-center shrink-0 max-md:w-full">
                            <select
                                className="appearance-none bg-white border border-slate-200 py-2.5 pl-4 pr-9 rounded-xl text-[0.85rem] font-semibold text-slate-600 cursor-pointer min-w-[160px] transition-colors hover:border-slate-300 hover:bg-slate-50 outline-none max-md:w-full"
                                value={activeTab} onChange={(e) => setActiveTab(e.target.value)}
                            >
                                <option value="all">All Categories</option>
                                <option value="student">Students</option>
                                <option value="faculty">Faculty</option>
                                <option value="staff">Staff</option>
                                <option value="authority">Authorities</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-3 text-slate-400 pointer-events-none" />
                        </div>
                        <div className="relative flex items-center shrink-0 max-md:w-full">
                            <select
                                className="appearance-none bg-white border border-slate-200 py-2.5 pl-4 pr-9 rounded-xl text-[0.85rem] font-semibold text-slate-600 cursor-pointer min-w-[160px] transition-colors hover:border-slate-300 hover:bg-slate-50 outline-none max-md:w-full"
                                value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active Only</option>
                                <option value="pending">Pending Only</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-3 text-slate-400 pointer-events-none" />
                        </div>
                        <div className="relative flex items-center shrink-0 max-md:w-full">
                            <select
                                className="appearance-none bg-white border border-slate-200 py-2.5 pl-4 pr-9 rounded-xl text-[0.85rem] font-semibold text-slate-600 cursor-pointer min-w-[160px] transition-colors hover:border-slate-300 hover:bg-slate-50 outline-none max-md:w-full"
                                value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}
                            >
                                <option value="all">All Departments</option>
                                {departments.map(dept => <option key={dept.id} value={dept.name}>{dept.name}</option>)}
                            </select>
                            <ChevronDown size={14} className="absolute right-3 text-slate-400 pointer-events-none" />
                        </div>
                        {isFiltered && (
                            <button
                                className="bg-transparent border-none text-indigo-500 text-[0.85rem] font-bold cursor-pointer px-3 py-2 rounded-lg transition-colors hover:bg-[#f5f3ff] hover:underline shrink-0 max-md:text-left"
                                onClick={handleClearFilters}
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                </div>
                <div className="relative flex-1 max-w-[450px] max-md:max-w-none">
                    <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full py-3 pl-10 pr-3.5 bg-white border border-slate-200 rounded-xl text-[0.95rem] transition-all outline-none focus:border-indigo-500 focus:shadow-[0_0_0_4px_rgba(99,102,241,0.1)]"
                    />
                </div>
            </div>

            {/* Table / Card View Component */}
            <div className="min-h-[200px]">
                {isUsersLoading ? (
                    <div className="bg-white rounded-[20px] border border-slate-200 py-16 flex flex-col items-center justify-center gap-6 text-slate-500 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
                        <div className="w-10 h-10 border-[3px] border-slate-100 border-t-indigo-500 rounded-full animate-spin"></div>
                        <p>Fetching user directory...</p>
                    </div>
                ) : (
                    <>
                        {viewMode === 'table' ? (
                            <div className="bg-white rounded-[20px] border border-slate-200 overflow-hidden shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
                                <div className="overflow-x-auto custom-scrollbar shadow-inner">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr>
                                                <th className="bg-slate-50 px-4 py-3 text-left text-[0.7rem] font-bold text-slate-500 uppercase border-b border-slate-100 min-w-[200px]">User Name</th>
                                                <th className="bg-slate-50 px-4 py-3 text-left text-[0.7rem] font-bold text-slate-500 uppercase border-b border-slate-100 min-w-[120px]">Category</th>
                                                <th className="bg-slate-50 px-4 py-3 text-left text-[0.7rem] font-bold text-slate-500 uppercase border-b border-slate-100 min-w-[150px]">Department</th>
                                                <th className="bg-slate-50 px-4 py-3 text-left text-[0.7rem] font-bold text-slate-500 uppercase border-b border-slate-100 min-w-[120px]">Year / Role</th>
                                                <th className="bg-slate-50 px-4 py-3 text-left text-[0.7rem] font-bold text-slate-500 uppercase border-b border-slate-100 min-w-[100px]">Credit Score</th>
                                                <th className="bg-slate-50 px-4 py-3 text-left text-[0.7rem] font-bold text-slate-500 uppercase border-b border-slate-100 min-w-[100px]">Penalty</th>
                                                <th className="bg-slate-50 px-4 py-3 text-left text-[0.7rem] font-bold text-slate-500 uppercase border-b border-slate-100 min-w-[100px]">Status</th>
                                                <th className="bg-slate-50 px-4 py-3 text-right text-[0.7rem] font-bold text-slate-500 uppercase border-b border-slate-100 min-w-[120px]">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedUsers.map((user) => (
                                                <tr key={user.id || Math.random()} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-4 py-3 border-b border-slate-100 text-[0.85rem] text-slate-700 align-middle">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-[34px] h-[34px] bg-indigo-500 text-white rounded-[10px] grid place-items-center font-bold text-[0.85rem]">{(user.name || 'U').charAt(0)}</div>
                                                            <div>
                                                                <span className="block font-bold text-slate-800">{user.name || 'Unknown'}</span>
                                                                <span className="block text-[0.75rem] text-slate-500">{user.email || 'N/A'}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 border-b border-slate-100 text-[0.85rem] text-slate-700 align-middle">
                                                        <span className={`px-2.5 py-1 rounded-md text-[0.75rem] font-bold capitalize ${getCatBadgeClass(user.role)}`}>
                                                            {user.role || 'student'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 border-b border-slate-100 text-[0.85rem] text-slate-700 align-middle">{user.dept || 'N/A'}</td>
                                                    <td className="px-4 py-3 border-b border-slate-100 text-[0.85rem] text-slate-700 align-middle">
                                                        {user.role === 'student' ? (user.year || 'N/A') : (user.role === 'staff' ? (user.designation || 'N/A') : (user.role === 'role-user' ? (user.role_assignments?.[0]?.role || 'N/A') : 'N/A'))}
                                                    </td>
                                                    <td className="px-4 py-3 border-b border-slate-100 text-[0.85rem] align-middle">
                                                        <span className={(user.score || 0) > 0 ? 'text-emerald-500 font-bold' : 'text-slate-700'}>{user.score || 0}</span>
                                                    </td>
                                                    <td className="px-4 py-3 border-b border-slate-100 text-[0.85rem] align-middle">
                                                        <span className={(user.penalty || 0) > 0 ? 'text-red-500 font-bold' : 'text-slate-700'}>{user.penalty || 0}</span>
                                                    </td>
                                                    <td className="px-4 py-3 border-b border-slate-100 text-[0.85rem] align-middle">
                                                        <span className={`px-2.5 py-1 rounded-full text-[0.75rem] font-semibold capitalize ${(user.status || 'active').toLowerCase() === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-800'}`}>
                                                            {user.status || 'Active'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 border-b border-slate-100 text-[0.85rem] text-slate-700 align-middle text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <button title="View" onClick={() => handleView(user)} className="w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-500 grid place-items-center cursor-pointer transition-all hover:bg-slate-100 hover:text-indigo-500 hover:border-indigo-500"><Eye size={16} /></button>
                                                            <button title="Edit" onClick={() => handleEdit(user)} className="w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-500 grid place-items-center cursor-pointer transition-all hover:bg-slate-100 hover:text-indigo-500 hover:border-indigo-500"><Edit3 size={16} /></button>
                                                            <button title="Delete" onClick={() => handleDeleteClick(user)} className="w-8 h-8 rounded-lg border border-red-100 bg-red-50 text-red-500 grid place-items-center transition-all active:scale-95"><UserMinus size={16} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
                                {paginatedUsers.map((user) => (
                                    <CardView key={user.id || Math.random()} user={user} handleView={handleView} handleEdit={handleEdit} handleDeleteClick={handleDeleteClick} getCatBadgeClass={getCatBadgeClass} />
                                ))}
                            </div>
                        )}

                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            itemsPerPage={itemsPerPage}
                            onItemsPerPageChange={setItemsPerPage}
                            totalItems={filteredUsers.length}
                            showingCount={paginatedUsers.length}
                        />

                        {filteredUsers.length === 0 && (
                            <div className="bg-white rounded-[20px] border border-slate-200 py-12 text-center text-slate-500 font-semibold shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
                                No users found matching your search and filter criteria.
                            </div>
                        )}
                    </>
                )}
            </div>

            <CreateUserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} isEdit={isEditMode} userData={selectedUser} departments={departments} venues={venues}
                onSuccess={(data) => {
                    setToastMsg(isEditMode ? 'User updated successfully!' : 'User created successfully!');
                    setShowToast(true); setTimeout(() => setShowToast(false), 3000);
                    const mappedUser = { ...data, name: data.name || 'New User', email: data.email || 'N/A', role: data.role || data.category || 'student', dept: data.dept || data.department_name || 'General', status: data.status || 'Active', score: data.score || 0, penalty: data.penalty || 0, year: data.year || 'N/A' };
                    if (isEditMode) setUsersList(prev => prev.map(u => u.id === mappedUser.id ? mappedUser : u));
                    else setUsersList(prev => [mappedUser, ...prev]);
                }}
            />
            <ViewUserModal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} user={selectedUser} onEdit={handleEdit}
                onAssignAuthority={(user) => { setSelectedUser(user); setAuthMode('create'); setIsAuthorityOpen(true); }}
                onTransferAuthority={(user) => { setSelectedUser(user); setIsTransferOpen(true); }}
            />
            <AuthorityModal isOpen={isAuthorityOpen} onClose={() => setIsAuthorityOpen(false)} authorityData={authMode === 'edit' ? selectedUser : null} initialUser={authMode === 'create' ? selectedUser : null} mode={authMode}
                onSuccess={() => { setIsAuthorityOpen(false); setToastMsg('Authority assigned successfully!'); setShowToast(true); setTimeout(() => setShowToast(false), 3000); }}
            />
            <AuthorityTransferModal isOpen={isTransferOpen} onClose={() => setIsTransferOpen(false)} currentAuthority={selectedUser}
                onSuccess={() => { setIsTransferOpen(false); setToastMsg('Authority transferred successfully!'); setShowToast(true); setTimeout(() => setShowToast(false), 3000); }}
            />
            {selectedUser && (
                <DeleteConfirmModal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} userName={selectedUser.name} onConfirm={handleDeleteConfirm} title="Delete User?" confirmText="Delete User" />
            )}

            <AnimatePresence>
                {showToast && (
                    <motion.div
                        className="fixed bottom-6 right-6 bg-slate-800 text-white px-6 py-3 rounded-xl flex items-center gap-3 z-5000 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.2)] font-semibold border border-white/10"
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.9 }}
                    >
                        <CheckCircle2 size={18} className="text-emerald-400" />
                        {toastMsg}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const CardView = ({ user, handleView, handleEdit, handleDeleteClick, getCatBadgeClass }) => (
    <motion.div
        className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm"
        whileHover={{ y: -2 }}
    >
        <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-500 text-white rounded-xl grid place-items-center font-bold text-sm">{(user.name || 'U').charAt(0)}</div>
                <div>
                    <h4 className="font-bold text-slate-800 text-[1rem] leading-tight">{user.name || 'Unknown'}</h4>
                    <span className="text-[0.75rem] text-slate-500">{user.email || 'N/A'}</span>
                </div>
            </div>
            <span className={`px-2 py-0.5 rounded-lg text-[0.65rem] font-bold capitalize ${getCatBadgeClass(user.role)}`}>
                {user.role || 'student'}
            </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex flex-col gap-0.5">
                <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider">Dept / Year</span>
                <span className="text-[0.85rem] text-slate-700 font-medium truncate">{user.dept || 'N/A'} • {user.role === 'student' ? (user.year || 'N/A') : (user.role === 'staff' ? (user.designation || 'N/A') : (user.role_assignments?.[0]?.role || 'N/A'))}</span>
            </div>
            <div className="flex flex-col gap-0.5 items-end">
                <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider">Status</span>
                <span className={`px-2 py-0.5 rounded-full text-[0.7rem] font-bold block ${(user.status || 'active').toLowerCase() === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-800'}`}>
                    {user.status || 'Active'}
                </span>
            </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-1">
            <div className="flex gap-4">
                <div className="flex flex-col">
                    <span className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-wider">Score</span>
                    <span className={`text-[1rem] font-extrabold ${(user.score || 0) > 0 ? 'text-emerald-500' : 'text-slate-700'}`}>{user.score || 0}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-wider">Penalty</span>
                    <span className={`text-[1rem] font-extrabold ${(user.penalty || 0) > 0 ? 'text-red-500' : 'text-slate-700'}`}>{user.penalty || 0}</span>
                </div>
            </div>
            <div className="flex gap-2">
                <button title="View" onClick={() => handleView(user)} className="w-9 h-9 rounded-xl border border-slate-200 bg-white text-slate-500 grid place-items-center transition-all active:scale-95"><Eye size={16} /></button>
                <button title="Edit" onClick={() => handleEdit(user)} className="w-9 h-9 rounded-xl border border-slate-200 bg-white text-slate-500 grid place-items-center transition-all active:scale-95"><Edit3 size={16} /></button>
                <button title="Delete" onClick={() => handleDeleteClick(user)} className="w-9 h-9 rounded-xl border border-red-100 bg-red-50 text-red-500 grid place-items-center transition-all active:scale-95"><UserMinus size={16} /></button>
            </div>
        </div>
    </motion.div>
);

export default UsersPage;