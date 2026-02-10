import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as XLSX from 'xlsx';
import CreateUserModal from '../../../components/UI/CreateUserModal/CreateUserModal';
import DeleteConfirmModal from '../../../components/UI/DeleteConfirmModal/DeleteConfirmModal';
import ViewUserModal from '../../../components/UI/ViewUserModal/ViewUserModal';
import {
    Search, UserPlus, FileSpreadsheet, Filter, Eye,
    Edit3, UserMinus, Users, UserCircle, ShieldCheck, ChevronDown, Upload
} from 'lucide-react';
import './UsersPage.css';

const UsersPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [deptFilter, setDeptFilter] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    // Modal States
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    // Mock Stats
    const stats = [
        { label: 'Total Users', value: '1,380', icon: Users, color: '#6366f1' },
        { label: 'Active Students', value: '1,284', icon: UserCircle, color: '#10b981' },
        { label: 'Faculty Members', value: '84', icon: ShieldCheck, color: '#f59e0b' },
        { label: 'Role Admins', value: '12', icon: ShieldCheck, color: '#3b82f6' },
    ];

    // Mock Data (Expanded)
    const [usersList, setUsersList] = useState([
        { id: 1, name: 'Arun Kumar', category: 'student', dept: 'CSE', status: 'Active', score: 850, penalty: 0, year: '3rd', email: 'arun.k@inst.edu', regNo: '2021CSE001', advisor: 'Dr. Ramesh' },
        { id: 2, name: 'Dr. Sarah Smith', category: 'faculty', dept: 'Biotech', status: 'Active', score: 980, penalty: 10, year: 'N/A', email: 'sarah.s@inst.edu', regNo: 'FAC102' },
        { id: 3, name: 'John Doe', category: 'role-user', dept: 'Admin', status: 'Pending', score: 0, penalty: 0, year: 'N/A', email: 'john.d@inst.edu', role: 'HOD', scope: 'infrastructure', venue: 'main_auditorium' },
        { id: 4, name: 'Robert Wilson', category: 'staff', dept: 'Transport', status: 'Active', score: 720, penalty: 5, year: 'N/A', email: 'robert.w@inst.edu', designation: 'transport', regNo: 'STF990' },
    ]);

    // Unique Departments for dropdown
    const departments = ['all', ...new Set(usersList.map(u => u.dept))];

    // Filtering Logic
    const filteredUsers = usersList.filter(user => {
        const matchesCategory = activeTab === 'all' ||
            (activeTab === 'authority' ? user.category === 'role-user' : user.category === activeTab);

        const matchesStatus = statusFilter === 'all' || user.status.toLowerCase() === statusFilter.toLowerCase();

        const matchesDept = deptFilter === 'all' || user.dept === deptFilter;

        const matchesSearch =
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.regNo?.toLowerCase().includes(searchTerm.toLowerCase());

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

    const handleBulkUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            const newUsers = jsonData.map((row, index) => ({
                id: Date.now() + index,
                name: row.Name || 'Unknown',
                email: row.Email || '',
                category: (row.Category || 'student').toLowerCase(),
                dept: row.Department || 'General',
                status: 'Active',
                score: row.Score || 0,
                penalty: row.Penalty || 0,
                year: row.Year || 'N/A',
                regNo: row.RegID || row.RegistrationID || '',
                advisor: row.Advisor || ''
            }));

            setUsersList(prev => [...prev, ...newUsers]);
            alert(`Successfully uploaded ${newUsers.length} users!`);
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
                    <button className="secondary-btn" onClick={handleExportExcel}>
                        <FileSpreadsheet size={18} />
                        Export Data
                    </button>
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
                            {departments.map(dept => (
                                <option key={dept} value={dept}>
                                    {dept === 'all' ? 'All Departments' : dept}
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
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>User Name</th>
                            <th>Category</th>
                            <th>Department</th>
                            <th>Year</th>
                            <th>Credit Score</th>
                            <th>Penalty</th>
                            <th>Status</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user) => (
                            <tr key={user.id}>
                                <td>
                                    <div className="user-info-cell">
                                        <div className="user-avatar-text">{user.name.charAt(0)}</div>
                                        <div>
                                            <span className="user-name">{user.name}</span>
                                            <span className="user-email">{user.email}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span className={`cat - badge ${user.category} `}>
                                        {user.category}
                                    </span>
                                </td>
                                <td>{user.dept}</td>
                                <td>{user.year}</td>
                                <td>
                                    <span className={user.score > 0 ? 'score-text' : ''}>
                                        {user.score}
                                    </span>
                                </td>
                                <td>
                                    <span className={user.penalty > 0 ? 'penalty-text' : ''}>
                                        {user.penalty}
                                    </span>
                                </td>
                                <td>
                                    <span className={`status - pill ${user.status.toLowerCase()} `}>
                                        {user.status}
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
            </div>

            <CreateUserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                isEdit={isEditMode}
                userData={selectedUser}
                onSuccess={(data) => {
                    if (isEditMode) {
                        setUsersList(prev => prev.map(u => u.id === data.id ? data : u));
                    } else {
                        setUsersList(prev => [...prev, { ...data, id: Date.now(), status: 'Active', score: 0, penalty: 0 }]);
                    }
                }}
            />

            <ViewUserModal
                isOpen={isViewOpen}
                onClose={() => setIsViewOpen(false)}
                user={selectedUser}
                onEdit={handleEdit}
            />

            {selectedUser && (
                <DeleteConfirmModal
                    isOpen={isDeleteOpen}
                    onClose={() => setIsDeleteOpen(false)}
                    userName={selectedUser.name}
                    onConfirm={handleDeleteConfirm}
                />
            )}
        </motion.div>
    );
};

export default UsersPage;