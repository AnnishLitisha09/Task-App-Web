import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Plus, Filter, MoreVertical,
    MapPin, Calendar, CheckCircle2,
    Clock, AlertCircle, QrCode, Camera,
    FileText, Edit3, Trash2, Eye, LayoutGrid, List
} from 'lucide-react';
import TaskDetails from './TaskDetails';
import CreateTask from './CreateTask';
import './TasksPage.css';

const mockTasks = [
    {
        id: 1,
        title: 'Annual Academic Audit',
        category: 'Academic',
        priority: 'Critical',
        status: 'Active',
        dueDate: '2024-03-15',
        location: 'Main Hall',
        methods: ['QR Scan', 'Photo', 'Doc Upload'],
        assignees: 3,
        score: 100,
        description: 'Comprehensive audit of academic processes'
    },
    {
        id: 2,
        title: 'Lab Equipment Inspection',
        category: 'Compliance',
        priority: 'Medium',
        status: 'Review',
        dueDate: '2024-03-18',
        location: 'Lab 101',
        methods: ['Photo', 'Doc Upload'],
        assignees: 2,
        score: 75,
        description: 'Quarterly equipment safety check'
    },
    {
        id: 3,
        title: 'Faculty Meeting Minutes',
        category: 'Administrative',
        priority: 'Low',
        status: 'Completed',
        dueDate: '2024-03-10',
        location: 'Conference Room',
        methods: ['Doc Upload'],
        assignees: 1,
        score: 50,
        description: 'Document monthly faculty discussions'
    },
];

const TasksPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [tasks, setTasks] = useState(mockTasks);
    const [selectedTask, setSelectedTask] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [viewMode, setViewMode] = useState('grid');
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');

    const handleTaskClick = (task) => {
        setSelectedTask(task);
    };

    const handleDelete = (taskId) => {
        setTasks(tasks.filter(t => t.id !== taskId));
    };

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
        const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
        return matchesSearch && matchesStatus && matchesPriority;
    });

    const stats = [
        {
            label: 'Total Directives',
            value: tasks.length.toString(),
            icon: FileText,
            color: '#6366f1'
        },
        {
            label: 'Active',
            value: tasks.filter(t => t.status === 'Active').length.toString(),
            icon: Clock,
            color: '#3b82f6'
        },
        {
            label: 'In Review',
            value: tasks.filter(t => t.status === 'Review').length.toString(),
            icon: AlertCircle,
            color: '#f59e0b'
        },
        {
            label: 'Completed',
            value: tasks.filter(t => t.status === 'Completed').length.toString(),
            icon: CheckCircle2,
            color: '#10b981'
        },
    ];

    if (selectedTask) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <TaskDetails task={selectedTask} onBack={() => setSelectedTask(null)} />
            </motion.div>
        );
    }

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'Critical': return '#ef4444';
            case 'High': return '#f59e0b';
            case 'Medium': return '#6366f1';
            case 'Low': return '#10b981';
            default: return '#64748b';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Active': return '#3b82f6';
            case 'Review': return '#f59e0b';
            case 'Completed': return '#10b981';
            default: return '#64748b';
        }
    };

    const getMethodIcon = (method) => {
        switch (method) {
            case 'QR Scan': return <QrCode size={14} />;
            case 'Photo': return <Camera size={14} />;
            case 'Doc Upload': return <FileText size={14} />;
            default: return <CheckCircle2 size={14} />;
        }
    };

    return (
        <motion.div
            className="tasks-page"
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
                        placeholder="Search directives, categories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="action-group">
                    <div className="filter-group">
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
                            <option value="all">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Review">Review</option>
                            <option value="Completed">Completed</option>
                        </select>
                        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="filter-select">
                            <option value="all">All Priority</option>
                            <option value="Critical">Critical</option>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                        </select>
                    </div>
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
                    <button className="primary-btn" onClick={() => setIsCreating(true)}>
                        <Plus size={18} />
                        <span>Create Directive</span>
                    </button>
                </div>
            </div>

            {/* Content Area */}
            {viewMode === 'grid' ? (
                <div className="tasks-grid">
                    {filteredTasks.map((task, idx) => (
                        <motion.div
                            key={task.id}
                            className="task-card"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            whileHover={{ y: -5 }}
                        >
                            <div className="task-card-header">
                                <div className="task-meta">
                                    <span className="priority-badge" style={{
                                        backgroundColor: `${getPriorityColor(task.priority)}15`,
                                        color: getPriorityColor(task.priority)
                                    }}>
                                        {task.priority}
                                    </span>
                                    <span className="status-badge" style={{
                                        backgroundColor: `${getStatusColor(task.status)}15`,
                                        color: getStatusColor(task.status)
                                    }}>
                                        {task.status}
                                    </span>
                                </div>
                                <button className="task-menu-btn">
                                    <MoreVertical size={16} />
                                </button>
                            </div>

                            <div className="task-card-body" onClick={() => handleTaskClick(task)}>
                                <h3 className="task-title">{task.title}</h3>
                                <p className="task-category">{task.category}</p>

                                <div className="task-details">
                                    <div className="task-detail-item">
                                        <MapPin size={14} />
                                        <span>{task.location}</span>
                                    </div>
                                    <div className="task-detail-item">
                                        <Calendar size={14} />
                                        <span>{task.dueDate}</span>
                                    </div>
                                </div>

                                <div className="task-methods">
                                    {task.methods.map((method, i) => (
                                        <div key={i} className="method-chip">
                                            {getMethodIcon(method)}
                                            <span>{method}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="task-card-footer">
                                <div className="task-assignees">
                                    <span className="assignees-count">{task.assignees} Assignees</span>
                                </div>
                                <div className="task-score">
                                    <span className="score-value">{task.score} pts</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="tasks-table">
                    <div className="table-header">
                        <span>Directive</span>
                        <span>Category</span>
                        <span>Priority</span>
                        <span>Status</span>
                        <span>Due Date</span>
                        <span>Location</span>
                        <span className="text-right">Actions</span>
                    </div>
                    {filteredTasks.map((task) => (
                        <motion.div
                            key={task.id}
                            className="table-row"
                            whileHover={{ backgroundColor: '#fcfdfe' }}
                        >
                            <div className="table-cell-main">
                                <strong>{task.title}</strong>
                                <p>{task.description}</p>
                            </div>
                            <div className="table-cell">{task.category}</div>
                            <div className="table-cell">
                                <span className="priority-badge" style={{
                                    backgroundColor: `${getPriorityColor(task.priority)}15`,
                                    color: getPriorityColor(task.priority)
                                }}>
                                    {task.priority}
                                </span>
                            </div>
                            <div className="table-cell">
                                <span className="status-badge" style={{
                                    backgroundColor: `${getStatusColor(task.status)}15`,
                                    color: getStatusColor(task.status)
                                }}>
                                    {task.status}
                                </span>
                            </div>
                            <div className="table-cell">{task.dueDate}</div>
                            <div className="table-cell">{task.location}</div>
                            <div className="table-cell-actions">
                                <button className="action-btn" onClick={() => handleTaskClick(task)}>
                                    <Eye size={16} />
                                </button>
                                <button className="action-btn">
                                    <Edit3 size={16} />
                                </button>
                                <button className="action-btn danger" onClick={() => handleDelete(task.id)}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Create Task Modal */}
            <AnimatePresence>
                {isCreating && (
                    <CreateTask
                        onCancel={() => setIsCreating(false)}
                        onSuccess={() => {
                            setIsCreating(false);
                        }}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default TasksPage;
