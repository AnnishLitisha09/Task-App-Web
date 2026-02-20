import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit3, Mail, MapPin, Briefcase, GraduationCap, Shield } from 'lucide-react';

interface ViewUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
    onEdit: (user: any) => void;
}

const roleBadgeColors: Record<string, string> = {
    student: 'bg-blue-100 text-blue-700',
    faculty: 'bg-indigo-100 text-indigo-700',
    staff: 'bg-amber-100 text-amber-700',
    'role-user': 'bg-purple-100 text-purple-700',
};

const ViewUserModal: React.FC<ViewUserModalProps> = ({ isOpen, onClose, user, onEdit }) => {
    if (!user) return null;
    const userRole = user.role || user.category || 'student';
    const userName = user.name || 'Unknown User';

    const renderDetail = (icon: any, label: string, value: string) => (
        <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="w-9 h-9 bg-indigo-50 text-indigo-500 rounded-[10px] flex items-center justify-center shrink-0">
                {React.createElement(icon, { size: 18 })}
            </div>
            <div className="flex flex-col min-w-0">
                <span className="text-[0.7rem] font-bold text-slate-400 uppercase tracking-[0.05em]">{label}</span>
                <span className="text-[0.9rem] font-semibold text-slate-800 truncate">{value || 'N/A'}</span>
            </div>
        </div>
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-1000 flex items-center justify-center p-4">
                    <motion.div
                        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
                        initial={{ opacity: 0, scale: 0.95, x: 50 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95, x: 50 }}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center p-6 border-b border-slate-100">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-indigo-500 text-white rounded-2xl flex items-center justify-center text-2xl font-bold">
                                    {userName.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">{userName}</h2>
                                    <span className={`text-[0.7rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${roleBadgeColors[userRole] || 'bg-slate-100 text-slate-600'}`}>
                                        {userRole}
                                    </span>
                                </div>
                            </div>
                            <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-slate-100 rounded-lg transition-all" onClick={onClose}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-3 max-h-[55vh] overflow-y-auto">
                            {renderDetail(Mail, "Institutional Email", user.email)}
                            {renderDetail(Shield, "Registration / Employee ID", user.regNo)}
                            {renderDetail(MapPin, "Department", user.dept)}
                            {userRole === 'student' && (<>
                                {renderDetail(GraduationCap, "Current Year", user.year)}
                                {renderDetail(Shield, "Faculty Advisor", user.advisor)}
                            </>)}
                            {userRole === 'staff' && renderDetail(Briefcase, "Designation", user.designation)}
                            {userRole === 'role-user' && (<>
                                {renderDetail(Shield, "Authority Role", user.role_name || user.role)}
                                {renderDetail(MapPin, "Scope", user.scope)}
                                {user.venue && renderDetail(MapPin, "Target Venue", user.venue)}
                            </>)}

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-3 mt-2">
                                {[
                                    { label: 'Credit Score', value: user.score || 0, cls: 'text-indigo-500' },
                                    { label: 'Penalties', value: user.penalty || 0, cls: 'text-red-500' },
                                    { label: 'Status', value: user.status || 'Active', cls: 'text-green-500' },
                                ].map((s, i) => (
                                    <div key={i} className="text-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <span className="block text-[0.7rem] text-slate-400 font-semibold mb-1">{s.label}</span>
                                        <span className={`text-lg font-extrabold ${s.cls}`}>{s.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex gap-3 justify-end p-5 border-t border-slate-100 bg-slate-50/50">
                            <button className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-100 transition-all" onClick={onClose}>Close</button>
                            <button className="px-5 py-2.5 rounded-xl bg-indigo-500 text-white font-bold text-sm flex items-center gap-2 hover:bg-indigo-600 transition-all shadow-[0_4px_12px_rgba(99,102,241,0.2)]"
                                onClick={() => { onEdit(user); onClose(); }}>
                                <Edit3 size={16} />Edit Profile
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ViewUserModal;
