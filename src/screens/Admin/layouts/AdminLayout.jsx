import React, { useState } from 'react';
import Sidebar from '../../../components/Sidebar/Sidebar';
import AdminDashboard from '../Dashboard/Dashboard';
import UsersPage from '../Users/UsersPage';
import DepartmentsPage from '../Departments/DepartmentsPage';
import InfrastructurePage from '../Infrastructure/InfrastructurePage';
import { Edit2, Bell, Menu, X } from 'lucide-react';
import './AdminLayout.css';

const AdminLayout = ({ user, onLogout }) => {
    // 1. Lifted state: This controls what is shown in the content area
    const [activeTab, setActiveTab] = useState('Dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    // 2. Logic to switch components based on activeTab
    const renderContent = () => {
        switch (activeTab) {
            case 'Dashboard':
                return <AdminDashboard />;
            case 'Users':
                return <UsersPage />;
            case 'Authority':
                return <div className="placeholder-view"><h2>Authority Settings</h2><p>Manage roles and permissions.</p></div>;
            case 'Departments':
                return <DepartmentsPage />;
            case 'Infrastructure':
                return <InfrastructurePage />;
            // Add other cases as you build the pages
            default:
                return <div className="placeholder-view"><h2>Coming Soon</h2><p>Page is under construction.</p></div>;
        }
    };

    return (
        <div className="admin-layout">
            {/* 3. Pass state and setter to Sidebar */}
            <Sidebar
                activeTab={activeTab}
                setActiveTab={(tab) => {
                    setActiveTab(tab);
                    closeSidebar();
                }}
                onLogout={onLogout}
                userTitle={user.title}
                isOpen={isSidebarOpen}
                onClose={closeSidebar}
            />

            <main className="admin-main">
                <header className="admin-header">
                    <div className="header-left">
                        <button className="mobile-menu-toggle" onClick={toggleSidebar}>
                            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                        <h2 className="tab-title">
                            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                        </h2>
                    </div>

                    <div className="header-right">
                        <button className="icon-notification-btn">
                            <Bell size={20} />
                            <span className="notif-badge"></span>
                        </button>

                        <div className="header-divider"></div>

                        <div className="user-profile-summary">
                            <div className="summary-text">
                                <span className="summary-name">{user.title}</span>
                                <button className="edit-profile-trigger">
                                    <Edit2 size={10} />
                                    Manage Profile
                                </button>
                            </div>
                            <div className="summary-avatar">
                                <img
                                    src={`https://ui-avatars.com/api/?name=${user.title}&background=6366f1&color=fff&bold=true&rounded=true`}
                                    alt="User"
                                />
                            </div>
                        </div>
                    </div>
                </header>

                <section className="admin-content">
                    {/* 4. Dynamic rendering based on sidebar click */}
                    {renderContent()}
                </section>
            </main>
        </div>
    );
};

export default AdminLayout;