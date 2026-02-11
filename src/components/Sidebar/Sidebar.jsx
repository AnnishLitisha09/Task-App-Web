import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    LayoutDashboard, Users, ShieldCheck, Building2,
    MapPin, Box, ClipboardList, Trophy, Ticket,
    History, UserCircle, LogOut, ChevronRight
} from 'lucide-react';
import './Sidebar.css';

const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'users', icon: Users, label: 'Users' },
    { id: 'authority', icon: ShieldCheck, label: 'Authority' },
    { id: 'departments', icon: Building2, label: 'Departments' },
    { id: 'infrastructure', icon: MapPin, label: 'Infrastructure' },
    { id: 'resources', icon: Box, label: 'Resources' },
    { id: 'tasks', icon: ClipboardList, label: 'Directives' },
    { id: 'scoreboard', icon: Trophy, label: 'Scoreboard' },
    { id: 'coupons', icon: Ticket, label: 'Coupons' },
];

const Sidebar = ({ onLogout, isOpen, onClose, activeTab, setActiveTab, userTitle, userRole }) => {
    // Note: activeTab and setActiveTab are now passed from Layout to keep them in sync

    return (
        <>
            {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="brand-logo">
                        <div className="logo-icon">
                            <ShieldCheck size={24} strokeWidth={2.5} />
                        </div>
                        <div className="brand-text">
                            <span className="brand-name">AdminSphere</span>
                            <span className="brand-tagline">Management Suite</span>
                        </div>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <div className="nav-group">
                        <span className="nav-group-label">General</span>
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                className={`nav-button ${activeTab === item.label ? 'active' : ''}`}
                                onClick={() => setActiveTab(item.label)}
                            >
                                <div className="nav-button-content">
                                    <item.icon size={20} className="nav-icon" />
                                    <span className="nav-label">{item.label}</span>
                                </div>
                                {activeTab === item.label && (
                                    <motion.div
                                        layoutId="active-pill"
                                        className="active-pill"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <ChevronRight size={14} className="nav-arrow" />
                            </button>
                        ))}
                    </div>
                </nav>

                <div className="sidebar-footer">
                    <button className="footer-action user-profile">
                        <div className="avatar-mini">{userTitle ? userTitle.substring(0, 2).toUpperCase() : 'AD'}</div>
                        <div className="user-info">
                            <span className="user-name">{userTitle || 'Admin User'}</span>
                            <span className="user-role">{userRole || 'Super Admin'}</span>
                        </div>
                    </button>
                    <button className="logout-button" onClick={onLogout}>
                        <LogOut size={18} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;