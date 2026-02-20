import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users, ShieldCheck, Activity, Clock, AlertTriangle,
    MapPin, ArrowUpRight, ShieldAlert, UserCircle, Building2,
    CheckCircle2
} from 'lucide-react';
import api from '../../../utils/api';
import './Dashboard.css';

const AdminDashboard = () => {
    const [counts, setCounts] = useState({
        students: 0,
        faculty: 0,
        staff: 0,
        role_users: 0,
        active_tasks: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setIsLoading(true);
        try {
            const response = await api('/users/dashboard/stats');
            if (response.success) {
                setCounts(response.counts);
            }
        } catch (err) {
            console.error('Failed to fetch dashboard stats:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const stats = [
        { label: 'Total Students', value: counts.students.toLocaleString(), icon: Users, color: '#6366f1' },
        { label: 'Total Faculty', value: counts.faculty.toLocaleString(), icon: UserCircle, color: '#10b981' },
        { label: 'Total Staff', value: counts.staff.toLocaleString(), icon: Users, color: '#3b82f6' },
        { label: 'Role Users', value: counts.role_users.toLocaleString(), icon: ShieldCheck, color: '#f59e0b' },
        // { label: 'Active Tasks', value: counts.active_tasks.toLocaleString(), icon: Activity, color: '#8b5cf6' },
    ];

    const alerts = [
        { id: 1, title: 'Unassigned Department', detail: 'Biotechnology Dept lacks a verified HOD.', status: 'Critical', icon: Building2, color: '#f43f5e', time: '2h ago' },
        { id: 2, title: 'Infrastructure Ownership', detail: 'Lab 402 has no assigned faculty owner.', status: 'Pending', icon: MapPin, color: '#f59e0b', time: '5h ago' },
        { id: 3, title: 'Mandatory Task Overdue', detail: 'Monthly Safety Audit is 2 days late.', status: 'Overdue', icon: AlertTriangle, color: '#f59e0b', time: '1d ago' },
        { id: 4, title: 'Role Permission Leak', detail: 'External Guest role has elevated access.', status: 'Critical', icon: ShieldAlert, color: '#f43f5e', time: '3d ago' },
    ];

    return (
        <div className="dashboard-wrapper">
            <header className="dashboard-header">
                <div className="header-text">
                    <h1>Dashboard Overview</h1>
                    <p>Welcome to the <strong>AdminSphere</strong> Institutional Portal</p>
                </div>
                <div className="header-date">
                    <CheckCircle2 size={16} />
                    <span>System Status: Optimal</span>
                </div>
            </header>

            {/* --- Stats Row --- */}
            <div className="stats-grid">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        className="stat-card"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <div className="stat-icon-box" style={{ background: `${stat.color}10`, color: stat.color }}>
                            <stat.icon size={22} />
                        </div>
                        <div className="stat-info">
                            <h3>{isLoading ? '...' : stat.value}</h3>
                            <p>{stat.label}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* --- Main Governance Section --- */}
            <section className="governance-container">
                <div className="panel-header">
                    <div className="panel-title">
                        <ShieldAlert size={20} className="title-icon" />
                        <div>
                            <h2>Governance & Compliance</h2>
                            <p className="text-xs text-slate-500 mt-1">Real-time alerts requiring administrative action</p>
                        </div>
                    </div>
                    <button className="export-btn">
                        <ArrowUpRight size={16} />
                        <span>Export Report</span>
                    </button>
                </div>

                <div className="gov-table-wrapper">
                    <table className="gov-table">
                        <thead>
                            <tr>
                                <th>Issue Detail</th>
                                <th>Severity</th>
                                <th>Reported</th>
                                <th className="text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {alerts.map((alert, i) => (
                                <motion.tr
                                    key={alert.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 + (i * 0.05) }}
                                >
                                    <td>
                                        <div className="alert-cell">
                                            <div className="alert-cell-icon" style={{ backgroundColor: `${alert.color}15`, color: alert.color }}>
                                                <alert.icon size={18} />
                                            </div>
                                            <div className="alert-cell-text">
                                                <span className="alert-title">{alert.title}</span>
                                                <span className="alert-desc">{alert.detail}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="sev-badge" style={{ backgroundColor: `${alert.color}10`, color: alert.color }}>
                                            {alert.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="time-col">
                                            <Clock size={12} />
                                            <span>{alert.time}</span>
                                        </div>
                                    </td>
                                    <td className="text-right">
                                        <button className="resolve-btn">Resolve</button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default AdminDashboard;
