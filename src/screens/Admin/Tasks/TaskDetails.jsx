import React from 'react';
import {
    Calendar, MapPin, ShieldCheck,
    ArrowLeft, CheckCircle2, AlertCircle,
    Users, QrCode, Camera, FileText, MoreVertical, Star
} from 'lucide-react';

const TaskDetails = ({ task, onBack }) => {
    if (!task) return null;

    const isFullyApproved = task.status === 'Completed';

    const getPriorityColor = (p) => ({ Critical: '#ef4444', High: '#f59e0b', Medium: '#6366f1', Low: '#10b981' }[p] || '#64748b');
    const getMethodIcon = (m) => ({ 'QR Scan': <QrCode size={16} />, 'Photo': <Camera size={16} />, 'Doc Upload': <FileText size={16} /> }[m] || <CheckCircle2 size={16} />);

    return (
        <div className="p-8 max-w-[1200px] mx-auto animate-[fadeIn_0.4s_ease]">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <button onClick={onBack} className="flex items-center gap-2 px-5 py-2.5 bg-white border-[1.5px] border-slate-200 rounded-[10px] text-slate-600 font-semibold text-[0.9rem] cursor-pointer transition-all hover:bg-slate-50 hover:border-slate-300">
                    <ArrowLeft size={18} /><span>Back to Directives</span>
                </button>
                <button className="p-2.5 bg-white border-[1.5px] border-slate-200 rounded-[10px] text-slate-500 cursor-pointer transition-all hover:bg-slate-50">
                    <MoreVertical size={18} />
                </button>
            </div>

            {/* Status Banner */}
            <div className={`flex items-center gap-3 px-6 py-4 rounded-xl font-semibold text-[0.9rem] tracking-[0.5px] mb-8 ${isFullyApproved ? 'bg-green-50 text-green-800 border-[1.5px] border-green-300' : 'bg-amber-50 text-amber-800 border-[1.5px] border-amber-200'}`}>
                {isFullyApproved ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                <span>{isFullyApproved ? 'FULLY AUTHORIZED' : 'PENDING AUTHORIZATION'}</span>
            </div>

            {/* Main Content */}
            <div className="flex flex-col gap-8">
                {/* Title Section */}
                <div className="bg-white p-8 rounded-2xl border-[1.5px] border-slate-200">
                    <div className="flex gap-3 items-center mb-4">
                        <span className="px-3.5 py-1.5 rounded-lg text-[0.75rem] font-extrabold tracking-[0.5px]" style={{ backgroundColor: `${getPriorityColor(task.priority)}15`, color: getPriorityColor(task.priority) }}>
                            {task.priority.toUpperCase()}
                        </span>
                        <div className="flex items-center gap-1.5 text-[0.85rem] text-slate-500 font-semibold">
                            <Calendar size={14} /><span>Due {task.dueDate}</span>
                        </div>
                    </div>
                    <h1 className="text-[2rem] font-bold text-slate-900 m-0 mb-3 leading-[1.2]">{task.title}</h1>
                    <p className="text-base text-slate-500 leading-relaxed m-0">{task.description}</p>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-5">
                    {[
                        { icon: MapPin, color: '#6366f1', label: 'Location', value: task.location },
                        { icon: Users, color: '#10b981', label: 'Assignees', value: `${task.assignees} Members` },
                        { icon: Star, color: '#f59e0b', label: 'Score', value: `${task.score} Points` },
                    ].map((card, i) => (
                        <div key={i} className="bg-white p-6 rounded-xl border-[1.5px] border-slate-200 flex items-center gap-4">
                            <div className="w-[52px] h-[52px] rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${card.color}15`, color: card.color }}>
                                <card.icon size={20} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[0.8rem] text-slate-400 font-semibold mb-1 uppercase tracking-[0.5px]">{card.label}</span>
                                <span className="text-[1.1rem] text-slate-900 font-semibold">{card.value}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Two-Column */}
                <div className="grid grid-cols-2 gap-6 max-lg:grid-cols-1">
                    <div className="flex flex-col gap-6">
                        {/* Execution Proof */}
                        <div className="bg-white p-7 rounded-2xl border-[1.5px] border-slate-200">
                            <h2 className="text-[1.1rem] font-extrabold text-slate-900 m-0 mb-5">Execution Proof Requirements</h2>
                            <div className="flex flex-col gap-3">
                                {task.methods.map((method, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                                        <div className="w-9 h-9 rounded-[10px] bg-white border-[1.5px] border-slate-200 flex items-center justify-center text-indigo-500">{getMethodIcon(method)}</div>
                                        <span className="flex-1 font-bold text-slate-600 text-[0.9rem]">{method}</span>
                                        <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-md text-[0.7rem] font-extrabold tracking-[0.5px]">MANDATORY</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Assignees */}
                        <div className="bg-white p-7 rounded-2xl border-[1.5px] border-slate-200">
                            <h2 className="text-[1.1rem] font-extrabold text-slate-900 m-0 mb-5">Assigned Members</h2>
                            <div className="flex flex-col gap-3">
                                {[
                                    { name: 'Alex Rivera', role: 'Lead', color: '#6366f1' },
                                    { name: 'Sarah Chen', role: 'Member', color: '#10b981' },
                                    { name: 'James Wilson', role: 'Member', color: '#f59e0b' },
                                ].map((person, i) => (
                                    <div key={i} className="flex items-center gap-3.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                                        <div className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-[1.1rem]" style={{ backgroundColor: `${person.color}15`, color: person.color }}>{person.name[0]}</div>
                                        <div className="flex flex-col">
                                            <span className="font-extrabold text-slate-900 text-[0.95rem]">{person.name}</span>
                                            <span className="text-[0.8rem] text-slate-500 font-semibold uppercase tracking-[0.5px]">{person.role}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskDetails;
