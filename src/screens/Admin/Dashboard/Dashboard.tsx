import React from 'react';
import { motion } from 'framer-motion';
import {
    Users, ShieldCheck, Activity, Clock, AlertTriangle,
    MapPin, ArrowUpRight, ShieldAlert, UserCircle, Building2,
    CheckCircle2
} from 'lucide-react';
import './Dashboard.css';

const AdminDashboard = () => {
    const stats = [
        { label: 'Total Students', value: '1,284', icon: Users, color: '#6366f1' },
        { label: 'Total Faculty', value: '84', icon: UserCircle, color: '#10b981' },
        { label: 'Role Users', value: '12', icon: ShieldCheck, color: '#f59e0b' },
        { label: 'Active Tasks', value: '42', icon: Activity, color: '#3b82f6' },
        { label: 'Pending Approvals', value: '18', icon: Clock, color: '#f43f5e' },
    ];

    const alerts = [
        { id: 1, title: 'Unassigned Department', detail: 'Biotechnology Dept lacks a verified HOD.', status: 'Critical', icon: Building2, color: '#f43f5e' },
        { id: 2, title: 'Infrastructure Ownership', detail: 'Lab 402 has no assigned faculty owner.', status: 'Pending', icon: MapPin, color: '#f59e0b' },
        { id: 3, title: 'Mandatory Task Overdue', detail: 'Monthly Safety Audit is 2 days late.', status: 'Overdue', icon: AlertTriangle, color: '#f59e0b' },
        { id: 4, title: 'Role Permission Leak', detail: 'External Guest role has elevated access.', status: 'Critical', icon: ShieldAlert, color: '#f43f5e' },
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
                            <h3>{stat.value}</h3>
                            <p>{stat.label}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* --- Main Governance Section (Full Width) --- */}
            <section className="governance-container">
                <div className="panel-header">
                    <div className="panel-title">
                        <ShieldAlert size={20} className="title-icon" />
                        <h2>Governance & Compliance Alerts</h2>
                    </div>
                    <button className="panel-action-btn">Export Report</button>
                </div>

                {/* ... inside the governance-container section ... */}
                <div className="alerts-table">
                    <div className="table-header">
                        <span>Issue Detail</span>
                        <span>Severity</span>
                        <span>Status</span>
                        <span className="text-right">Action</span> {/* Added class here */}
                    </div>
                    {alerts.map((alert) => (
                        <motion.div
                            key={alert.id}
                            className="table-row"
                            whileHover={{ backgroundColor: '#fcfdfe' }}
                        >
                            <div className="alert-main-info">
                                <div className="alert-type-icon" style={{ color: alert.color }}>
                                    <alert.icon size={18} />
                                </div>
                                <div className="alert-details">
                                    <strong>{alert.title}</strong>
                                    <p>{alert.detail}</p>
                                </div>
                            </div>

                            <div className="alert-severity">
                                <span className="severity-pill" style={{ backgroundColor: `${alert.color}10`, color: alert.color }}>
                                    {alert.status}
                                </span>
                            </div>

                            <div className="alert-status-text">Requires Attention</div>

                            <div className="alert-actions text-right"> {/* Added class here */}
                                <button className="resolve-button">Resolve Issue</button>
                            </div>
                        </motion.div>
                    ))}
                </div>            </section>
        </div>
    );
};

export default AdminDashboard;