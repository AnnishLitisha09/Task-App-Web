import React, { useState, useEffect } from 'react';
import {
    Calendar, MapPin, ShieldCheck,
    ArrowLeft, CheckCircle2, AlertCircle,
    Users, QrCode, Camera, FileText, MoreVertical, Star, Check
} from 'lucide-react';
import api from '../../../utils/api';

const TaskDetails = ({ task: initialTask, onBack }) => {
    const [task, setTask] = useState(initialTask);
    const [acks, setAcks] = useState([]);

    useEffect(() => {
        const fetchAcks = async () => {
            if (!task) return;
            try {
                const res = await api(`tasks/${task.task_id}/acknowledgments`);
                setAcks(res || []);
            } catch (err) {
                console.error("Failed to fetch acknowledgments", err);
            }
        };
        fetchAcks();
    }, [task?.task_id]);

    const handleApprove = async () => {
        try {
            await api(`tasks/${task.task_id}/approve`, {
                method: 'PUT',
                body: { is_approved: true }
            });
            setTask({ ...task, is_approved: true, status: 'Active' });
        } catch (err) {
            alert('Error approving task: ' + err.message);
        }
    };

    const handleAcknowledge = async (userId) => {
        try {
            await api(`tasks/acknowledge-general`, {
                method: 'POST',
                body: { task_id: task.task_id, user_id: userId }
            });
            const res = await api(`tasks/${task.task_id}/acknowledgments`);
            setAcks(res || []);
        } catch (err) {
            alert('Error acknowledging task: ' + err.message);
        }
    };

    if (!task) return null;

    const getTaskStatus = (t) => {
        if (t.is_completed) return 'Completed';
        if (t.is_approved === false) return 'Review';
        return 'Active';
    };

    const isFullyAuthorized = task.is_approved === true || task.status === 'Completed';

    const getPriorityColor = (p) => ({ Critical: '#ef4444', High: '#f59e0b', Medium: '#6366f1', Low: '#10b981' }[p] || '#64748b');
    const getMethodIcon = (m) => ({ 'QR Scan': <QrCode size={16} />, 'Photo': <Camera size={16} />, 'Doc Upload': <FileText size={16} /> }[m] || <CheckCircle2 size={16} />);

    const getTaskDate = (t) => {
        if (!t.TaskType) return 'N/A';
        return t.TaskType.start_date || 'Ongoing';
    };

    const getTaskLocation = (t) => {
        return t.Venue ? t.Venue.name : (t.venue_id ? `Venue #${t.venue_id}` : 'Remote');
    };

    const getAssigneeCount = (t) => {
        return t.TaskAssigns ? t.TaskAssigns.length : 0;
    };

    return (
        <div className="p-8 max-w-[1200px] mx-auto animate-[fadeIn_0.4s_ease]">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <button onClick={onBack} className="flex items-center gap-2 px-5 py-2.5 bg-white border-[1.5px] border-slate-200 rounded-[10px] text-slate-600 font-semibold text-[0.9rem] cursor-pointer transition-all hover:bg-slate-50 hover:border-slate-300">
                    <ArrowLeft size={18} /><span>Back to Directives</span>
                </button>
                <div className="flex gap-2">
                    {task.is_approved === false && (
                        <button onClick={handleApprove} className="px-5 py-2.5 bg-indigo-500 text-white rounded-[10px] font-semibold text-[0.9rem] cursor-pointer shadow-sm transition-all hover:bg-indigo-600">
                            Approve Task
                        </button>
                    )}
                    <button className="p-2.5 bg-white border-[1.5px] border-slate-200 rounded-[10px] text-slate-500 cursor-pointer transition-all hover:bg-slate-50">
                        <MoreVertical size={18} />
                    </button>
                </div>
            </div>

            {/* Status Banner */}
            <div className={`flex items-center gap-3 px-6 py-4 rounded-xl font-semibold text-[0.9rem] tracking-[0.5px] mb-8 ${getTaskStatus(task) === 'Completed' ? 'bg-green-50 text-green-800 border-[1.5px] border-green-300' : 'bg-amber-50 text-amber-800 border-[1.5px] border-amber-200'}`}>
                {getTaskStatus(task) === 'Completed' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                <span>{getTaskStatus(task).toUpperCase()} {isFullyAuthorized ? '(FULLY AUTHORIZED)' : '(PENDING AUTHORIZATION)'}</span>
            </div>

            {/* Main Content */}
            <div className="flex flex-col gap-8">
                {/* Title Section */}
                <div className="bg-white p-8 rounded-2xl border-[1.5px] border-slate-200">
                    <div className="flex gap-3 items-center mb-4">
                        <span className="px-3.5 py-1.5 rounded-lg text-[0.75rem] font-extrabold tracking-[0.5px]" style={{ backgroundColor: `${getPriorityColor(task.priority)}15`, color: getPriorityColor(task.priority) }}>
                            {(task.priority || 'Medium').toUpperCase()}
                        </span>
                        <div className="flex items-center gap-1.5 text-[0.85rem] text-slate-500 font-semibold">
                            <Calendar size={14} /><span>Date: {getTaskDate(task)}</span>
                        </div>
                    </div>
                    <h1 className="text-[2rem] font-bold text-slate-900 m-0 mb-3 leading-[1.2]">{task.title}</h1>
                    <p className="text-base text-slate-500 leading-relaxed m-0">{task.description}</p>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-5">
                    {[
                        { icon: MapPin, color: '#6366f1', label: 'Location', value: getTaskLocation(task) },
                        { icon: Users, color: '#10b981', label: 'Assignees', value: `${getAssigneeCount(task)} Members` },
                        { icon: Star, color: '#f59e0b', label: 'Score', value: `${task.score || 0} Points` },
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
                                {['OTP Verify', 'Photo Upload'].map((method, i) => (
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
                                {task.TaskAssigns && task.TaskAssigns.length > 0 ? (
                                    task.TaskAssigns.map((assign, i) => {
                                        const user = assign.User || {};
                                        return (
                                            <div key={i} className="flex justify-between items-center p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                                                <div className="flex items-center gap-3.5">
                                                    <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-[1.1rem]">
                                                        {user.name ? user.name[0] : (assign.user_id || 'U')}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-extrabold text-slate-900 text-[0.95rem]">{user.name || `User ID: ${assign.user_id}`}</span>
                                                        <span className="text-[0.8rem] text-slate-500 font-semibold uppercase tracking-[0.5px]">{user.role || 'Member'}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {(() => {
                                                        const userAck = acks.find(a => a.user_id === assign.user_id);
                                                        if (userAck) {
                                                            return (
                                                                <span className="text-[0.75rem] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md flex items-center gap-1 border border-emerald-100">
                                                                    <CheckCircle2 size={12} /> Acknowledged
                                                                </span>
                                                            );
                                                        } else {
                                                            return (
                                                                <button onClick={() => handleAcknowledge(assign.user_id)} className="text-[0.75rem] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1.5 rounded-md border border-indigo-100 cursor-pointer transition-all hover:bg-indigo-100 whitespace-nowrap">
                                                                    Mark Acknowledged
                                                                </button>
                                                            );
                                                        }
                                                    })()}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-4 text-slate-400 text-sm">No specific assignees found.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskDetails;
