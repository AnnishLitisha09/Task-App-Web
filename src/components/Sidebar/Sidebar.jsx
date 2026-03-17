import { motion } from 'framer-motion';
import {
    LayoutDashboard, Users, ShieldCheck, Building2,
    MapPin, Box, ClipboardList, Trophy, Ticket,
    CheckSquare, LogOut, ChevronRight, ShieldAlert, BellDot
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
                    max-md:w-[260px]`}
            >
                {/* Header */}
                <div className="px-6 py-8 mb-2.5">
                    <div className="flex items-center gap-3">
                        <div className="w-[42px] h-[42px] bg-indigo-500 text-white rounded-xl flex items-center justify-center shadow-[0_8px_16px_-4px_rgba(99,102,241,0.4)]">
                            <ShieldCheck size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                            <span className="text-lg font-extrabold text-slate-900 tracking-tight block max-md:text-base">AdminSphere</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.5px]">Management Suite</span>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto px-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-xl">
                    {navGroups.map((group, gi) => (
                        <div key={gi} className={gi > 0 ? 'mt-5' : ''}>
                            <span className="pl-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">{group.groupLabel}</span>
                            {group.items.map((item) => {
                                const isActive = activeTab === item.label;
                                return (
                                    <button
                                        key={item.id}
                                        className={`w-full relative flex items-center justify-between px-3 py-2.5 rounded-xl mb-1 cursor-pointer transition-all duration-200 border-none
                                            ${isActive
                                                ? 'text-indigo-500 bg-[#f5f7ff]'
                                                : 'text-slate-500 bg-transparent hover:text-slate-900 hover:bg-slate-50'
                                            }`}
                                        onClick={() => setActiveTab(item.label)}
                                    >
                                        <div className="flex items-center gap-3 z-2">
                                            <item.icon size={20} />
                                            <span className="text-sm font-semibold">{item.label}</span>
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
                <div className="px-4 py-5 border-t border-slate-100 flex flex-col gap-3">
                    <button className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border-none text-left cursor-pointer w-full">
                        <div className="w-8 h-8 bg-slate-200 rounded-lg grid place-items-center text-xs font-bold text-slate-600">
                            {userTitle ? userTitle.substring(0, 2).toUpperCase() : 'AD'}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[13px] font-bold text-slate-900 block">{userTitle || 'Admin User'}</span>
                            <span className="text-[11px] text-slate-400">{userRole || 'Super Admin'}</span>
                        </div>
                    </button>
                    <button
                        className="flex items-center gap-2.5 px-3 py-2.5 bg-transparent border-none text-rose-500 text-sm font-semibold cursor-pointer rounded-xl transition-colors hover:bg-[#fff1f2] w-full"
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