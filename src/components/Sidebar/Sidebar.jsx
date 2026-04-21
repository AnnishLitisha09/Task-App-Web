import { motion } from 'framer-motion';
import {
    LayoutDashboard, Users, ShieldCheck, Building2,
    MapPin, Box, ClipboardList, Trophy, Ticket,
    CheckSquare, LogOut, ChevronRight, ShieldAlert, BellDot, Activity
} from 'lucide-react';

const navGroups = [
    {
        groupLabel: 'General',
        items: [
            { id: 'dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'users',      icon: Users,           label: 'Users' },
            { id: 'departments',icon: Building2,       label: 'Departments' },
            { id: 'infrastructure', icon: MapPin,      label: 'Infrastructure' },
            { id: 'resources',  icon: Box,             label: 'Resources' },
            { id: 'tasks',      icon: ClipboardList,   label: 'Directives' },
            { id: 'tracking',   icon: Activity,        label: 'Live Tracking' },
            { id: 'task-titles',icon: CheckSquare,     label: 'Task Titles' },
            { id: 'scoreboard', icon: Trophy,          label: 'Scoreboard' },
            { id: 'coupons',    icon: Ticket,          label: 'Coupons' },
        ]
    },
    {
        groupLabel: 'Governance',
        items: [

            { id: 'system-gov', icon: Users, label: 'System Governance' },
            { id: 'ack-tracking',    icon: BellDot,      label: 'Ack. Tracking' },
            { id: 'active-sessions', icon: ShieldAlert,  label: 'Active Sessions' },
        ]
    },
];

const Sidebar = ({ onLogout, isOpen, onClose, activeTab, setActiveTab, userTitle, userRole }) => {
    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-999 animate-[fadeIn_0.2s_ease-out]"
                    onClick={onClose}
                />
            )}
            <aside
                className={`w-[280px] h-screen bg-white border-r border-slate-200 flex flex-col sticky top-0 z-1000 transition-transform duration-300 ease-in-out
                    max-lg:fixed max-lg:left-0 max-lg:shadow-[20px_0_50px_-10px_rgba(0,0,0,0.1)]
                    ${isOpen ? 'max-lg:translate-x-0' : 'max-lg:-translate-x-full'}
                    max-md:w-[270px] max-sm:w-[260px]`}
            >
                {/* Header */}
                <div className="px-6 py-8 mb-2 max-md:py-6">
                    <div className="flex items-center gap-3">
                        <div className="w-[42px] h-[42px] bg-white rounded-xl flex items-center justify-center shadow-sm overflow-hidden shrink-0 border border-slate-100">
                             <img src="/logo.png" alt="Task Sync" className="w-[34px] h-[34px] object-contain" />
                        </div>
                        <div className="min-w-0">
                            <span className="text-lg font-bold text-slate-900 tracking-tight block max-md:text-base truncate">Task Sync</span>
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.5px] block truncate">Unified Workspace</span>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto px-4 custom-scrollbar">
                    {navGroups.map((group, gi) => (
                        <div key={gi} className={gi > 0 ? 'mt-6' : ''}>
                            <span className="pl-3 text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3 block opacity-80">{group.groupLabel}</span>
                            {group.items.map((item) => {
                                const isActive = activeTab === item.label;
                                return (
                                    <button
                                        key={item.id}
                                        className={`w-full relative flex items-center justify-between px-3 py-2.5 rounded-xl mb-1 cursor-pointer transition-all duration-200 border-none
                                            ${isActive
                                                ? 'text-indigo-600 bg-indigo-50/50'
                                                : 'text-slate-500 bg-transparent hover:text-slate-900 hover:bg-slate-50'
                                            }`}
                                        onClick={() => setActiveTab(item.label)}
                                    >
                                        <div className="flex items-center gap-3 z-2">
                                            <item.icon size={20} strokeWidth={isActive ? 2 : 1.5} />
                                            <span className={`text-sm ${isActive ? 'font-semibold text-indigo-700' : 'font-medium'}`}>{item.label}</span>
                                        </div>
                                        {isActive && (
                                            <motion.div
                                                layoutId="active-pill"
                                                className="absolute left-0 w-1 h-5 bg-indigo-500 rounded-r-[4px]"
                                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            />
                                        )}
                                        <ChevronRight
                                            size={14}
                                            className={`text-slate-400 transition-all duration-200 ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-1.5'}`}
                                        />
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </nav>

                {/* Footer */}
                <div className="px-4 py-5 border-t border-slate-100 flex flex-col gap-2.5 bg-white">
                    <button className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-slate-100 text-left cursor-pointer w-full shadow-sm hover:border-indigo-200 transition-colors">
                        <div className="w-9 h-9 bg-indigo-500 text-white rounded-lg grid place-items-center text-xs font-extrabold shadow-sm shrink-0">
                            {userTitle ? userTitle.substring(0, 2).toUpperCase() : 'AD'}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-[13px] font-semibold text-slate-900 block truncate">{userTitle || 'Admin User'}</span>
                            <span className="text-[11px] font-medium text-slate-500 truncate">{userRole || 'Super Admin'}</span>
                        </div>
                    </button>
                    <button
                        className="flex items-center gap-2.5 px-3 py-2.5 bg-transparent border-none text-rose-500 text-sm font-semibold cursor-pointer rounded-xl transition-all hover:bg-rose-50 w-full active:scale-[0.98]"
                        onClick={onLogout}
                    >
                        <LogOut size={18} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;