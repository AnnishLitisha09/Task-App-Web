import React, { useState, useEffect } from 'react';
import Sidebar from '../../../components/Sidebar/Sidebar';
import AdminDashboard from '../Dashboard/Dashboard';
import UsersPage from '../Users/UsersPage';
import DepartmentsPage from '../Departments/DepartmentsPage';
import InfrastructurePage from '../Infrastructure/InfrastructurePage';
import TasksPage from '../Tasks/TasksPage';
import ScoreboardPage from '../Scoreboard/ScoreboardPage';
import ResourcesPage from '../Resources/ResourcesPage';
import CoupenPage from '../Coupons/CouponsPage';
import AuthorityPage from '../Authority/AuthorityPage';
import { Edit2, Bell, Menu, X } from 'lucide-react';
import api from '../../../utils/api';

const AdminLayout = ({ user: initialUser, onLogout }) => {
    const [activeTab, setActiveTab] = useState('Dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [user, setUser] = useState(initialUser);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const data = await api('/users/me');
            setUser({
                id: data.user_id,
                role: data.role,
                name: data.profile?.name || 'Admin',
                email: data.profile?.email,
                avatar: data.profile?.avatar
            });
        } catch (err) {
            console.error('Failed to fetch profile:', err);
        }
    };

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    const displayName = user.name || user.title || 'Admin User';

    const renderContent = () => {
        switch (activeTab) {
            case 'Dashboard': return <AdminDashboard />;
            case 'Users': return <UsersPage />;
            case 'Authority': return <AuthorityPage />;
            case 'Departments': return <DepartmentsPage />;
            case 'Infrastructure': return <InfrastructurePage />;
            case 'Directives': return <TasksPage />;
            case 'Scoreboard': return <ScoreboardPage />;
            case 'Resources': return <ResourcesPage />;
            case 'Coupons': return <CoupenPage />;
            default:
                return (
                    <div className="flex flex-col items-center justify-center p-16 text-slate-500">
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Coming Soon</h2>
                        <p>Page is under construction.</p>
                    </div>
                );
        }
    };

    return (
        <div className="flex min-h-screen bg-white">
            <Sidebar
                activeTab={activeTab}
                setActiveTab={(tab) => { setActiveTab(tab); closeSidebar(); }}
                onLogout={onLogout}
                userTitle={displayName}
                userRole={user.role}
                isOpen={isSidebarOpen}
                onClose={closeSidebar}
            />

            <main className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-[72px] bg-white/95 backdrop-blur-sm border-b border-slate-100 px-10 flex items-center justify-between sticky top-0 z-[90] max-lg:px-5 max-md:h-16 max-md:px-4">
                    <div className="flex items-center">
                        <button
                            className="hidden max-lg:flex bg-transparent text-slate-500 cursor-pointer p-2 mr-3"
                            onClick={toggleSidebar}
                        >
                            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                        <h2 className="text-lg font-bold text-slate-800 max-md:text-[1.1rem]">
                            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                        </h2>
                    </div>

                    <div className="flex items-center gap-5 max-md:gap-3">
                        <button className="hidden max-[480px]:hidden bg-transparent text-slate-500 cursor-pointer relative p-[5px] grid place-items-center transition-colors hover:text-indigo-500">
                            <Bell size={20} />
                            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-rose-500 border-2 border-white rounded-full"></span>
                        </button>
                        <div className="hidden max-[480px]:hidden w-px h-6 bg-slate-200"></div>

                        <div className="flex items-center gap-3.5">
                            <div className="hidden flex-col items-end max-md:hidden">
                                <span className="text-sm font-bold text-slate-900">{displayName}</span>
                                <button className="flex items-center gap-1 text-[11px] font-semibold text-indigo-500 bg-none border-none cursor-pointer p-0">
                                    <Edit2 size={10} />
                                    Manage Profile
                                </button>
                            </div>
                            <div className="summary-avatar">
                                <img
                                    src={user.avatar || `https://ui-avatars.com/api/?name=${displayName}&background=6366f1&color=fff&bold=true&rounded=true`}
                                    alt="User"
                                    className="w-10 h-10 rounded-[10px] object-cover border-2 border-slate-50 max-md:w-[34px] max-md:h-[34px]"
                                />
                            </div>
                        </div>
                    </div>
                </header>

                <section className="p-10 flex-1 flex flex-col min-w-0 max-lg:p-5 max-md:p-4">
                    {renderContent()}
                </section>
            </main>
        </div>
    );
};

export default AdminLayout;