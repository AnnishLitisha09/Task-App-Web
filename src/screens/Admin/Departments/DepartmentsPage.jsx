import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building2, Users, UserCheck, Plus, Search,
    MoreVertical, Edit2, UserPlus, Trash2,
    ChevronRight, LayoutGrid, List
} from 'lucide-react';
import api from '../../../utils/api';
import DepartmentModal from '../../../components/UI/DepartmentModal/DepartmentModal';
import './DepartmentsPage.css';

const DepartmentsPage = () => {
    const [departments, setDepartments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDept, setSelectedDept] = useState(null);
    const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'assign'

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        setIsLoading(true);
        try {
            // Assuming this endpoint returns { departments: [{ id, name, hod: { name }, faculty_count }] }
            // or we'll map it if it's simpler
            const response = await api('/resources/departments');
            setDepartments(Array.isArray(response) ? response : (response.departments || []));
        } catch (err) {
            console.error('Failed to fetch departments:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedDept(null);
        setModalMode('create');
        setIsModalOpen(true);
    };

    const handleEdit = (dept) => {
        setSelectedDept(dept);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleAssignHOD = (dept) => {
        setSelectedDept(dept);
        setModalMode('assign');
        setIsModalOpen(true);
    };

    const filteredDepartments = departments.filter(dept =>
        (dept.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (dept.hod_name || dept.hod?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = [
        { label: 'Total Departments', value: departments.length, icon: Building2, color: '#6366f1' },
        { label: 'Total Faculty', value: departments.reduce((acc, d) => acc + (d.faculty_count || 0), 0), icon: Users, color: '#10b981' },
        { label: 'Assigned HODs', value: departments.filter(d => d.hod_id || d.hod).length, icon: UserCheck, color: '#f59e0b' },
    ];

    return (
        <motion.div
            className="departments-page"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* Stats Overview */}
            <div className="stats-grid">
                {stats.map((stat, idx) => (
                    <motion.div
                        key={idx}
                        className="stat-card"
                        whileHover={{ y: -5 }}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <div className="stat-icon" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                            <stat.icon size={24} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-label">{stat.label}</span>
                            <h3 className="stat-value">{stat.value}</h3>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Header / Actions */}
            <div className="page-header">
                <div className="search-box">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search departments or HODs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="action-group">
                    <div className="view-toggle">
                        <button
                            className={viewMode === 'grid' ? 'active' : ''}
                            onClick={() => setViewMode('grid')}
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button
                            className={viewMode === 'table' ? 'active' : ''}
                            onClick={() => setViewMode('table')}
                        >
                            <List size={18} />
                        </button>
                    </div>
                    <button className="primary-btn" onClick={handleCreate}>
                        <Plus size={18} />
                        <span>Add Department</span>
                    </button>
                </div>
            </div>

            {/* Content Area */}
            {isLoading ? (
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading departments...</p>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="dept-grid">
                    {filteredDepartments.map((dept, idx) => (
                        <motion.div
                            key={dept.id || idx}
                            className={`dept-card ${selectedDept?.id === dept.id ? 'selected' : ''}`}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => setSelectedDept(dept)}
                        >
                            <div className="dept-card-header">
                                <div className="dept-icon-box">
                                    <Building2 size={24} />
                                </div>
                                <div className="dept-actions">
                                    <button onClick={(e) => { e.stopPropagation(); handleEdit(dept); }} title="Edit">
                                        <Edit2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="dept-card-body">
                                <h3>{dept.name}</h3>
                                <div className="dept-meta">
                                    <div className="meta-item">
                                        <Users size={14} />
                                        <span>{dept.faculty_count || 0} Faculty Members</span>
                                    </div>
                                    <div className="meta-item hod-info">
                                        <UserCheck size={14} />
                                        <span className={dept.hod_name || dept.hod?.name ? 'assigned' : 'unassigned'}>
                                            {dept.hod_name || dept.hod?.name || 'No HOD Assigned'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="dept-card-footer">
                                <button className="assign-btn" onClick={(e) => { e.stopPropagation(); handleAssignHOD(dept); }}>
                                    <UserPlus size={16} />
                                    <span>{dept.hod_id ? 'Change HOD' : 'Assign HOD'}</span>
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="table-container">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>Department Name</th>
                                <th>HOD / Head of Dept</th>
                                <th>Faculty Count</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDepartments.map((dept, idx) => (
                                <tr key={dept.id || idx}>
                                    <td>
                                        <div className="dept-name-cell">
                                            <div className="dept-avatar">{dept.name.substring(0, 2).toUpperCase()}</div>
                                            <span>{dept.name}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="hod-cell">
                                            <span className={`hod-badge ${dept.hod_name || dept.hod?.name ? 'active' : 'empty'}`}>
                                                {dept.hod_name || dept.hod?.name || 'Not Specified'}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="count-chip">
                                            {dept.faculty_count || 0} Members
                                        </div>
                                    </td>
                                    <td className="text-right">
                                        <div className="action-btns">
                                            <button onClick={() => handleEdit(dept)} title="Edit Division"><Edit2 size={16} /></button>
                                            <button onClick={() => handleAssignHOD(dept)} title="Assign Authority"><UserPlus size={16} /></button>
                                            <button className="delete-btn"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <DepartmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                deptData={selectedDept}
                mode={modalMode}
                onSuccess={() => {
                    fetchDepartments();
                    setIsModalOpen(false);
                }}
            />
        </motion.div>
    );
};

export default DepartmentsPage;
