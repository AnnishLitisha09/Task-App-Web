import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Check, ChevronRight, ChevronLeft,
    AlignLeft, Clock, Calendar, User, ShieldCheck,
    Star, AlertTriangle, QrCode, Camera,
    FileText, Key, Laptop, Presentation,
    Truck, Cpu, Plus, Trash2
} from 'lucide-react';

const STEPS = [
    { id: 0, title: "Identity", subtitle: "Basic details & Classification" },
    { id: 1, title: "Time & Venue", subtitle: "Configuration & Location" },
    { id: 2, title: "Responsibility", subtitle: "Governance & Assignees" },
    { id: 3, title: "Closing Rules", subtitle: "Evaluation & Resources" }
];

const inputCls = "w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 outline-none focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] transition-all";
const selectCls = "w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:border-indigo-500";
const labelCls = "block text-[0.7rem] font-extrabold text-slate-400 uppercase tracking-[0.08em] mb-1.5";

const ToggleRow = ({ label, desc, checked, onChange }) => (
    <div className="flex justify-between items-center py-3.5 border-b border-slate-100 last:border-0">
        <div><span className="block text-xs font-bold text-slate-600 uppercase">{label}</span>{desc && <p className="text-xs text-slate-400 mt-0.5">{desc}</p>}</div>
        <label className="relative cursor-pointer">
            <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
            <div className={`w-11 h-6 rounded-full transition-all ${checked ? 'bg-indigo-500' : 'bg-slate-200'}`} />
            <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${checked ? 'translate-x-5' : ''}`} />
        </label>
    </div>
);

const CreateTask = ({ onCancel, onSuccess }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [taskData, setTaskData] = useState({
        title: '', description: '', category: 'Academic', priority: 'Medium',
        taskType: 'Fixed Time Task', ownerId: 'Admin User', assigneeIds: [],
        targetType: 'Individual', locationId: 'Main Hall', resources: [],
        score: 100, penaltyRule: { penaltyValue: 5 }, completionMethods: [],
        subTasks: [], requiresApproval: true, approvalAuthority: 'Department Head',
        isPackageTask: false, allowPause: false, delegationAllowed: false,
        autoEscalation: true, mandatoryDocumentation: true, requiredDocuments: [],
        selectedDate: new Date().toISOString().split('T')[0],
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        startTime: '09:00', endTime: '17:00'
    });

    const hi = (key, value) => setTaskData(prev => ({ ...prev, [key]: value }));
    const toggleMultiSelect = (key, value) => setTaskData(prev => { const list = prev[key]; return { ...prev, [key]: list.includes(value) ? list.filter(i => i !== value) : [...list, value] }; });
    const addSubTask = () => hi('subTasks', [...taskData.subTasks, { id: Date.now(), title: '', assigneeId: 'Select Assignee', order: taskData.subTasks.length + 1 }]);
    const removeSubTask = (id) => hi('subTasks', taskData.subTasks.filter(s => s.id !== id));
    const updateSubTask = (id, key, val) => hi('subTasks', taskData.subTasks.map(s => s.id === id ? { ...s, [key]: val } : s));
    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));
    const handleSubmit = async () => { setIsSubmitting(true); setTimeout(() => { setIsSubmitting(false); onSuccess(); }, 1500); };

    const priorityColors = { Low: 'border-slate-300 text-slate-500', Medium: 'border-blue-400 text-blue-500', High: 'border-amber-400 text-amber-600', Critical: 'border-red-400 text-red-600' };
    const priorityActiveColors = { Low: 'bg-slate-100 border-slate-400 text-slate-700', Medium: 'bg-blue-50 border-blue-400 text-blue-700', High: 'bg-amber-50 border-amber-400 text-amber-700', Critical: 'bg-red-50 border-red-400 text-red-700' };

    const renderSection1 = () => (
        <div className="space-y-5">
            <div><label className={labelCls}>Task Title</label>
                <input className={inputCls} placeholder="e.g. Annual Audit Report" value={taskData.title} onChange={(e) => hi('title', e.target.value)} /></div>
            <div><label className={labelCls}>Description</label>
                <div className="relative"><AlignLeft size={16} className="absolute left-3 top-3 text-slate-400" />
                    <textarea className={`${inputCls} pl-10 resize-none`} placeholder="Provide detailed instructions..." value={taskData.description} onChange={(e) => hi('description', e.target.value)} rows={3} /></div></div>
            <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls}>Category</label>
                    <select className={selectCls} value={taskData.category} onChange={(e) => hi('category', e.target.value)}>
                        {['Academic', 'Administrative', 'Compliance'].map(o => <option key={o}>{o}</option>)}</select></div>
                <div><label className={labelCls}>Priority</label>
                    <div className="flex gap-2 flex-wrap">
                        {['Low', 'Medium', 'High', 'Critical'].map(p => (
                            <button key={p} type="button" className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${taskData.priority === p ? priorityActiveColors[p] : priorityColors[p]}`}
                                onClick={() => hi('priority', p)}>{p}</button>))}
                    </div></div>
            </div>
            <ToggleRow label="Is Package Task" desc="Combine multiple steps into a sequential workflow" checked={taskData.isPackageTask} onChange={(e) => hi('isPackageTask', e.target.checked)} />
        </div>
    );

    const renderSection2 = () => (
        <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls}>Task Type</label>
                    <select className={selectCls} value={taskData.taskType} onChange={(e) => hi('taskType', e.target.value)}>
                        {['Fixed Time Task', 'Long Task', 'Recurring Task', 'Bidding Task'].map(o => <option key={o}>{o}</option>)}</select></div>
                <div><label className={labelCls}>Venue / Location</label>
                    <select className={selectCls} value={taskData.locationId} onChange={(e) => hi('locationId', e.target.value)}>
                        {['Main Hall', 'Lab 101', 'Conference Room', 'Remote'].map(o => <option key={o}>{o}</option>)}</select></div>
            </div>
            <div className="border-t border-dashed border-slate-200 pt-4"><p className="text-[0.7rem] font-extrabold text-slate-400 uppercase tracking-[0.08em] mb-4">Time Configuration</p>
                {taskData.taskType === 'Fixed Time Task' ? (
                    <div className="space-y-4">
                        <div><label className={labelCls}>Select Date</label>
                            <div className="relative"><Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input type="date" className={`${inputCls} pl-10`} value={taskData.selectedDate} onChange={(e) => hi('selectedDate', e.target.value)} /></div></div>
                        <div className="grid grid-cols-2 gap-4">
                            {[{ label: 'Start Time', key: 'startTime' }, { label: 'End Time', key: 'endTime' }].map(({ label, key }) => (
                                <div key={key}><label className={labelCls}>{label}</label>
                                    <div className="relative"><Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input type="time" className={`${inputCls} pl-10`} value={taskData[key]} onChange={(e) => hi(key, e.target.value)} /></div></div>
                            ))}</div></div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        {[{ label: 'Valid From', key: 'startDate' }, { label: 'Valid Until', key: 'endDate' }].map(({ label, key }) => (
                            <div key={key}><label className={labelCls}>{label}</label>
                                <div className="relative"><Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input type="date" className={`${inputCls} pl-10`} value={taskData[key]} onChange={(e) => hi(key, e.target.value)} /></div></div>
                        ))}</div>
                )}
            </div>
            <ToggleRow label="Allow Pause" desc="Allow assignees to pause and resume the task" checked={taskData.allowPause} onChange={(e) => hi('allowPause', e.target.checked)} />
        </div>
    );

    const renderSection3 = () => (
        <div className="space-y-5">
            {!taskData.isPackageTask ? (
                <>
                    {[
                        { icon: ShieldCheck, label: 'Task Owner', value: taskData.ownerId, cls: 'bg-indigo-100 text-indigo-600' },
                        { icon: User, label: 'Assignees', value: `${taskData.assigneeIds.length || 'No'} assignees selected`, cls: 'bg-blue-100 text-blue-600' }
                    ].map(({ icon: Icon, label, value, cls }) => (
                        <div key={label} className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cls}`}><Icon size={18} /></div>
                            <div className="flex-1"><label className={labelCls}>{label}</label><span className="text-sm font-semibold text-slate-700">{value}</span></div>
                            <button className="text-xs font-bold text-indigo-500 hover:text-indigo-700">Change</button>
                        </div>
                    ))}
                    <div className="flex items-center gap-3 p-4 bg-slate-50 border border-dashed border-slate-300 rounded-2xl cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-all">
                        <FileText size={18} className="text-slate-400" />
                        <span className="text-sm font-semibold text-slate-500">Assign via Excel (.xlsx)</span>
                        <input type="file" hidden id="excel-up" />
                        <label htmlFor="excel-up" className="ml-auto text-xs font-bold text-indigo-500 cursor-pointer">Browse File</label>
                    </div>
                    <div><label className={labelCls}>Target Entity</label>
                        <select className={selectCls} value={taskData.targetType} onChange={(e) => hi('targetType', e.target.value)}>
                            {['Individual', 'Role', 'Infrastructure', 'Group'].map(o => <option key={o}>{o}</option>)}</select></div>
                    <ToggleRow label="Requires Approval" desc="Validation needed before task is considered done" checked={taskData.requiresApproval} onChange={(e) => hi('requiresApproval', e.target.checked)} />
                    {taskData.requiresApproval && (
                        <div className="flex items-center gap-4 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-100 text-amber-600"><ShieldCheck size={18} /></div>
                            <div className="flex-1"><label className={labelCls}>Approval Authority</label><span className="text-sm font-semibold text-slate-700">{taskData.approvalAuthority}</span></div>
                            <button className="text-xs font-bold text-amber-600 hover:text-amber-700">Change</button>
                        </div>
                    )}
                </>
            ) : (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-[0.7rem] font-extrabold text-slate-400 uppercase tracking-[0.08em]">Workflow Sequence</span>
                        <button onClick={addSubTask} className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 font-bold text-xs rounded-lg hover:bg-indigo-100"><Plus size={14} />Add Step</button>
                    </div>
                    <div className="space-y-2">
                        <AnimatePresence>
                            {taskData.subTasks.map((sub, idx) => (
                                <motion.div key={sub.id} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl"
                                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                    <span className="w-7 h-7 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center font-bold text-xs shrink-0">{idx + 1}</span>
                                    <input className={`${inputCls} flex-1`} placeholder="Step Title" value={sub.title} onChange={(e) => updateSubTask(sub.id, 'title', e.target.value)} />
                                    <div className="flex items-center gap-1.5 text-xs text-slate-400"><User size={12} /><span>{sub.assigneeId}</span></div>
                                    <button onClick={() => removeSubTask(sub.id)} className="text-slate-300 hover:text-red-400 transition-colors"><Trash2 size={15} /></button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {taskData.subTasks.length === 0 && <div className="text-center py-8 text-slate-400 text-sm">No steps added. Click "Add Step" to begin.</div>}
                    </div>
                </div>
            )}
        </div>
    );

    const renderSection4 = () => {
        const methods = [{ id: 'OTP Verify', icon: Key }, { id: 'Photo Upload', icon: Camera }, { id: 'QR Scan', icon: QrCode }, { id: 'Doc Upload', icon: FileText }];
        const resources = [{ id: 'Laptop', icon: Laptop }, { id: 'Projector', icon: Presentation }, { id: 'Vehicle', icon: Truck }, { id: 'Software', icon: Cpu }];
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    {[{ label: 'Score', icon: Star, value: taskData.score, onChange: (v) => hi('score', parseInt(v)) }, { label: 'Penalty', icon: AlertTriangle, value: taskData.penaltyRule.penaltyValue, onChange: (v) => hi('penaltyRule', { penaltyValue: parseInt(v) }) }].map(({ label, icon: Icon, value, onChange }) => (
                        <div key={label}><label className={labelCls}>{label}</label>
                            <div className="relative"><Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input type="number" className={`${inputCls} pl-10`} value={value} onChange={(e) => onChange(e.target.value)} /></div></div>
                    ))}
                </div>
                <div><p className="text-[0.7rem] font-extrabold text-slate-400 uppercase tracking-[0.08em] mb-3">Completion Methods</p>
                    <div className="flex flex-wrap gap-2">
                        {methods.map(m => (<button key={m.id} type="button" onClick={() => toggleMultiSelect('completionMethods', m.id)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${taskData.completionMethods.includes(m.id) ? 'bg-indigo-50 border-indigo-300 text-indigo-600' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                            <m.icon size={14} />{m.id}</button>))}
                    </div></div>
                <div><p className="text-[0.7rem] font-extrabold text-slate-400 uppercase tracking-[0.08em] mb-3">Required Resources</p>
                    <div className="flex flex-wrap gap-2">
                        {resources.map(r => (<button key={r.id} type="button" onClick={() => toggleMultiSelect('resources', r.id)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${taskData.resources.includes(r.id) ? 'bg-indigo-50 border-indigo-300 text-indigo-600' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                            <r.icon size={14} />{r.id}</button>))}
                    </div></div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 pb-1">
                    {[{ key: 'autoEscalation', label: 'Auto Escalation', desc: 'Notify superiors if task is overdue' }, { key: 'mandatoryDocumentation', label: 'Mandatory Documentation', desc: 'Requires proof uploads' }, { key: 'delegationAllowed', label: 'Allow Delegation', desc: 'Assignees can delegate to others' }].map(item => (
                        <ToggleRow key={item.key} label={item.label} desc={item.desc} checked={taskData[item.key]} onChange={(e) => hi(item.key, e.target.checked)} />))}
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-999 flex items-center justify-center p-4">
            <motion.div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}>
                {/* Header */}
                <div className="flex justify-between items-center px-8 py-5 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <button className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-all" onClick={onCancel}><ChevronLeft size={20} /></button>
                        <div><h2 className="text-base font-extrabold text-slate-900">Create Directive</h2><p className="text-[0.75rem] text-slate-400">Step {currentStep + 1}: {STEPS[currentStep].subtitle}</p></div>
                    </div>
                    <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-slate-100 rounded-lg" onClick={onCancel}><X size={20} /></button>
                </div>

                {/* Stepper */}
                <div className="px-8 py-4 border-b border-slate-100">
                    <div className="relative flex items-center justify-between">
                        <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-200">
                            <div className="h-full bg-indigo-500 transition-all" style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }} />
                        </div>
                        {STEPS.map((step) => (
                            <div key={step.id} className="flex flex-col items-center gap-1.5 z-10 cursor-pointer" onClick={() => setCurrentStep(step.id)}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${currentStep >= step.id ? 'bg-indigo-500 text-white' : 'bg-white border-2 border-slate-200 text-slate-400'}`}>
                                    {currentStep > step.id ? <Check size={14} /> : step.id + 1}
                                </div>
                                <span className={`text-[0.7rem] font-bold uppercase tracking-wide ${currentStep === step.id ? 'text-indigo-600' : 'text-slate-400'}`}>{step.title}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-8 py-6">
                    <AnimatePresence mode="wait">
                        <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                            {currentStep === 0 && renderSection1()}
                            {currentStep === 1 && renderSection2()}
                            {currentStep === 2 && renderSection3()}
                            {currentStep === 3 && renderSection4()}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center px-8 py-5 border-t border-slate-100 bg-slate-50/50">
                    <div>{currentStep > 0 && <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-100" onClick={prevStep}><ChevronLeft size={18} />Back</button>}</div>
                    <div>
                        {currentStep < 3 ? (
                            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 text-white font-bold text-sm hover:bg-indigo-600 transition-all" onClick={nextStep}>Continue<ChevronRight size={18} /></button>
                        ) : (
                            <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-500 text-white font-bold text-sm hover:bg-indigo-600 transition-all disabled:opacity-60"
                                onClick={handleSubmit} disabled={isSubmitting || !taskData.title}>
                                {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Publish Directive'}
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default CreateTask;
