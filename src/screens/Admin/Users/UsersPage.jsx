import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import api from '../../../utils/api';
import CreateUserModal from '../../../components/UI/CreateUserModal/CreateUserModal';
import DeleteConfirmModal from '../../../components/UI/DeleteConfirmModal/DeleteConfirmModal';
import ViewUserModal from '../../../components/UI/ViewUserModal/ViewUserModal';
import {
    Search, UserPlus, FileSpreadsheet, Filter, Eye,
    Edit3, UserMinus, Users, UserCircle, ShieldCheck, ChevronDown, Upload, CheckCircle2,
    Shield, History, Layers
} from 'lucide-react';
import AuthorityModal from '../../../components/UI/AuthorityModal/AuthorityModal';
import AuthorityTransferModal from '../../../components/UI/AuthorityModal/AuthorityTransferModal';
import './UsersPage.css';

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

    // Modal States
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    // Toast State
    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState('');

    const [usersList, setUsersList] = useState([]);
    const [apiCounts, setApiCounts] = useState(null);
    const [isUsersLoading, setIsUsersLoading] = useState(true);

    // Authority Modal States
    const [isAuthorityOpen, setIsAuthorityOpen] = useState(false);
    const [isTransferOpen, setIsTransferOpen] = useState(false);
    const [authMode, setAuthMode] = useState('create');

    // Fetch Resources
    React.useEffect(() => {
        const fetchResources = async () => {
            try {
                const [depts, vns] = await Promise.all([
                    api('/resources/departments'),
                    api('/resources/venues')
                ]);
                setDepartments(Array.isArray(depts) ? depts : (depts?.departments || depts?.data || []));
                setVenues(Array.isArray(vns) ? vns : (vns?.venues || vns?.data || []));
            } catch (err) {
                console.error('Failed to fetch resources:', err);
            }
        };

        const fetchUsers = async () => {
            setIsUsersLoading(true);
            try {
                const response = await api('/users/dashboard/all');

                if (response && response.users) {
                    // Mapping/Flattening Logic
                    const mappedUsers = response.users.map(u => {
                        const info = u.student_info || u.faculty_info || u.staff_info || u.role_user_info || {};
                        return {
                            ...u,
                            ...info, // Spread info to get IDs like department_id
                            name: info.name || (u.role === 'admin' ? 'Admin' : 'Unknown'),
                            email: info.email || 'N/A',
                            dept: info.department_name || (u.role_assignments?.[0]?.department) || 'N/A',
                            regNo: info.reg_no || 'N/A',
                            score: parseFloat(info.score || 0),
                            penalty: parseFloat(info.penalty || 0),
                            year: info.year || 'N/A',
                            designation: info.designation || 'N/A'
                        };
                    });
                    setUsersList(mappedUsers);
                }

                if (response && response.counts) {
                    setApiCounts(response.counts);
                }
            } catch (err) {
                console.error('Failed to fetch users:', err);
            } finally {
                setIsUsersLoading(false);
            }
        };

        fetchResources();
        fetchUsers();
    }, []);

    // Stats linked to API counts
    const stats = [
        {
            label: 'Total Users',
            value: apiCounts?.total_active_users?.toString() || usersList.length.toString(),
            icon: Users,
            color: '#6366f1'
        },
        {
            label: 'Students',
            value: apiCounts?.students?.toString() || usersList.filter(u => u.role === 'student').length.toString(),
            icon: UserCircle,
            color: '#10b981'
        },
        {
            label: 'Faculty Members',
            value: apiCounts?.faculty?.toString() || usersList.filter(u => u.role === 'faculty').length.toString(),
            icon: ShieldCheck,
            color: '#f59e0b'
        },
        {
            label: 'Role Users',
            value: apiCounts?.role_users?.toString() || usersList.filter(u => u.role === 'role-user').length.toString(),
            icon: ShieldCheck,
            color: '#3b82f6'
        },
    ];

    // UI Departments for filter dropdown
    const filterDepartments = ['all', ...new Set(usersList.map(u => u.dept))];

    // Filtering Logic
    const filteredUsers = usersList.filter(user => {
        if (!user) return false;

        const matchesCategory = activeTab === 'all' ||
            (activeTab === 'authority' ? user.role === 'role-user' : user.role === activeTab);

        const matchesStatus = statusFilter === 'all' || (user.status || '').toLowerCase() === statusFilter.toLowerCase();

        const matchesDept = deptFilter === 'all' || user.dept === deptFilter;

        const matchesSearch =
            (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.regNo || '').toLowerCase().includes(searchTerm.toLowerCase());

        return matchesCategory && matchesStatus && matchesDept && matchesSearch;
    });

    const isFiltered = activeTab !== 'all' || statusFilter !== 'all' || deptFilter !== 'all' || searchTerm !== '';

    const handleClearFilters = () => {
        setActiveTab('all');
        setStatusFilter('all');
        setDeptFilter('all');
        setSearchTerm('');
    };

    const handleCreateNew = () => {
        setIsEditMode(false);
        setSelectedUser(null);
        setIsModalOpen(true);
    };

    const handleView = (user) => {
        setSelectedUser(user);
        setIsViewOpen(true);
    };

    const handleEdit = (user) => {
        setIsEditMode(true);
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (user) => {
        setSelectedUser(user);
        setIsDeleteOpen(true);
    };

    const handleDeleteConfirm = () => {
        setUsersList(prev => prev.filter(u => u.id !== selectedUser.id));
        setSelectedUser(null);
        setIsDeleteOpen(false);
    };

    const [isBulkLoading, setIsBulkLoading] = useState(false);

    const handleBulkUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsBulkLoading(true);
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                const result = await api('/users/bulk-create', {
                    method: 'POST',
                    body: { users: jsonData }
                });

                alert(`Successfully uploaded ${result.count || jsonData.length} users!`);
            } catch (err) {
                console.error('Bulk upload error:', err);
                alert(`Error: ${err.message}`);
            } finally {
                setIsBulkLoading(false);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleExportExcel = () => {
        const dataToExport = filteredUsers.map(user => ({
            "Name": user.name,
            "Email": user.email,
            "Category": user.category,
            "Department": user.dept,
            "Year": user.year,
            "Credit Score": user.score,
            "Penalty": user.penalty,
            "Status": user.status,
            "Advisor": user.advisor || 'N/A'
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
        XLSX.writeFile(workbook, `users_export_${new Date().toLocaleDateString()}.xlsx`);
    };

    return (
        <motion.div
            className="users-container"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="page-header">
                <div className="header-left">
                    <h1>User Directory</h1>
                    <p>Manage institutional profiles and credentials</p>
                </div>
                <div className="header-right">
                    <label className="secondary-btn cursor-pointer">
                        <Upload size={18} />
                        Excel Upload
                        <input
                            type="file"
                            hidden
                            accept=".xlsx, .xls, .csv"
                            onChange={handleBulkUpload}
                        />
                    </label>
                    <button className="primary-btn" onClick={handleCreateNew}>
                        <UserPlus size={18} />
                        Create New User
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="stats-strip">
                {stats.map((stat, i) => (
                    <div key={i} className="mini-stat-card">
                        <div className="stat-icon-sm" style={{ background: `${stat.color} 15`, color: stat.color }}>
                            <stat.icon size={18} />
                        </div>
                        <div className="stat-content">
                            <p>{stat.label}</p>
                            <h4>{stat.value}</h4>
                        </div>
                    </div>
                ))}
            </div>

            <div className="table-controls">
                <div className="filter-group-left">
                    <div className="category-select-wrapper">
                        <select
                            className="category-dropdown"
                            value={activeTab}
                            onChange={(e) => setActiveTab(e.target.value)}
                        >
                            <option value="all">All Categories</option>
                            <option value="student">Students</option>
                            <option value="faculty">Faculty</option>
                            <option value="staff">Staff</option>
                            <option value="authority">Authorities</option>
                        </select>
                        <ChevronDown size={14} className="dropdown-chevron" />
                    </div>

                    <div className="category-select-wrapper">
                        <select
                            className="category-dropdown"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active Only</option>
                            <option value="pending">Pending Only</option>
                        </select>
                        <ChevronDown size={14} className="dropdown-chevron" />
                    </div>

                    <div className="category-select-wrapper">
                        <select
                            className="category-dropdown"
                            value={deptFilter}
                            onChange={(e) => setDeptFilter(e.target.value)}
                        >
                            <option value="all">All Departments</option>
                            {departments.map(dept => (
                                <option key={dept.id} value={dept.name}>
                                    {dept.name}
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="dropdown-chevron" />
                    </div>

                    {isFiltered && (
                        <button className="clear-filters-btn" onClick={handleClearFilters}>
                            Clear Filters
                        </button>
                    )}
                </div>

                <div className="search-wrapper">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="users-table-wrapper">
                {isUsersLoading ? (
                    <div className="table-loader-container">
                        <div className="loader-spinner"></div>
                        <p>Fetching user directory...</p>
                    </div>
                ) : (
                    <>
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>User Name</th>
                                    <th>Category</th>
                                    <th>Department</th>
                                    <th>Year / Role</th>
                                    <th>Credit Score</th>
                                    <th>Penalty</th>
                                    <th>Status</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user.id || Math.random()}>
                                        <td>
                                            <div className="user-info-cell">
                                                <div className="user-avatar-text">{(user.name || 'U').charAt(0)}</div>
                                                <div>
                                                    <span className="user-name">{user.name || 'Unknown'}</span>
                                                    <span className="user-email">{user.email || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`cat-badge ${user.role || 'student'}`}>
                                                {user.role || 'student'}
                                            </span>
                                        </td>
                                        <td>{user.dept || 'N/A'}</td>
                                        <td>
                                            {user.role === 'student' ? (user.year || 'N/A') :
                                                (user.role === 'staff' ? (user.designation || 'N/A') :
                                                    (user.role === 'role-user' ? (user.role_assignments?.[0]?.role || 'N/A') : 'N/A'))}
                                        </td>
                                        <td>
                                            <span className={(user.score || 0) > 0 ? 'score-text' : ''}>
                                                {user.score || 0}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={(user.penalty || 0) > 0 ? 'penalty-text' : ''}>
                                                {user.penalty || 0}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-pill ${(user.status || 'active').toLowerCase()}`}>
                                                {user.status || 'Active'}
                                            </span>
                                        </td>
                                        <td className="text-right">
                                            <div className="action-btns">
                                                <button title="View" onClick={() => handleView(user)}><Eye size={16} /></button>
                                                <button title="Edit" onClick={() => handleEdit(user)}><Edit3 size={16} /></button>
                                                <button title="Delete" className="delete-btn" onClick={() => handleDeleteClick(user)}><UserMinus size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredUsers.length === 0 && (
                            <div className="no-users-hint">
                                No users found matching your search and filter criteria.
                            </div>
                        )}
                    </>
                )}
            </div>

            <CreateUserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                isEdit={isEditMode}
                userData={selectedUser}
                departments={departments}
                venues={venues}
                onSuccess={(data) => {
                    // Success Toast
                    setToastMsg(isEditMode ? 'User updated successfully!' : 'User created successfully!');
                    setShowToast(true);
                    setTimeout(() => setShowToast(false), 3000);

                    // Mapping backend data to match table fields
                    const mappedUser = {
                        ...data,
                        name: data.name || 'New User',
                        email: data.email || 'N/A',
                        role: data.role || data.category || 'student',
                        dept: data.dept || data.department_name || 'General',
                        status: data.status || 'Active',
                        score: data.score || 0,
                        penalty: data.penalty || 0,
                        year: data.year || 'N/A'
                    };

                    if (isEditMode) {
                        setUsersList(prev => prev.map(u => u.id === mappedUser.id ? mappedUser : u));
                    } else {
                        setUsersList(prev => [mappedUser, ...prev]);
                    }
                }}
            />

            <ViewUserModal
                isOpen={isViewOpen}
                onClose={() => setIsViewOpen(false)}
                user={selectedUser}
                onEdit={handleEdit}
                onAssignAuthority={(user) => {
                    setSelectedUser(user);
                    setAuthMode('create');
                    setIsAuthorityOpen(true);
                }}
                onTransferAuthority={(user) => {
                    setSelectedUser(user);
                    setIsTransferOpen(true);
                }}
            />

            <AuthorityModal
                isOpen={isAuthorityOpen}
                onClose={() => setIsAuthorityOpen(false)}
                authorityData={authMode === 'edit' ? selectedUser : null}
                initialUser={authMode === 'create' ? selectedUser : null}
                mode={authMode}
                onSuccess={() => {
                    setIsAuthorityOpen(false);
                    setToastMsg('Authority assigned successfully!');
                    setShowToast(true);
                    setTimeout(() => setShowToast(false), 3000);
                }}
            />

            <AuthorityTransferModal
                isOpen={isTransferOpen}
                onClose={() => setIsTransferOpen(false)}
                currentAuthority={selectedUser}
                onSuccess={() => {
                    setIsTransferOpen(false);
                    setToastMsg('Authority transferred successfully!');
                    setShowToast(true);
                    setTimeout(() => setShowToast(false), 3000);
                }}
            />


            {selectedUser && (
                <DeleteConfirmModal
                    isOpen={isDeleteOpen}
                    onClose={() => setIsDeleteOpen(false)}
                    userName={selectedUser.name}
                    onConfirm={handleDeleteConfirm}
                    title="Delete User?"
                    confirmText="Delete User"
                />
            )}
            {/* Simple Toast UI */}
            <AnimatePresence>
                {showToast && (
                    <motion.div
                        className="quick-toast"
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.9 }}
                    >
                        <CheckCircle2 size={18} />
                        {toastMsg}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default UsersPage;