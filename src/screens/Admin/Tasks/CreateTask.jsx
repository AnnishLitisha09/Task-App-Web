import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../utils/api';
import {
    X, Check, ChevronRight, ChevronLeft, Search,
    AlignLeft, Clock, Calendar, User, ShieldCheck,
    Star, AlertTriangle, QrCode, Camera, CheckCircle2,
    FileText, Key, Laptop, Presentation,
    Truck, Cpu, Plus, Trash2, Upload, File
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
    const [venues, setVenues] = useState([]);
    const [taskTitles, setTaskTitles] = useState([]);
    const [excelFile, setExcelFile] = useState(null);
    const [taskData, setTaskData] = useState({
        taskCategory: 'Directive Task', 
        title: '', description: '', priority: 'Medium', category: 'Academic',
        taskType: 'Fixed Time Task', ownerId: null, assigneeIds: [],
        venue_id: '',
        score: 100, penaltyRule: { penaltyValue: 5 },
        subTasks: [], requiresApproval: false, approver_id: null,
        isPackageTask: false, allowPause: false,
        is_document: true, requiredDocuments: [],
        completionMethods: ['OTP Verify'],
        selectedDate: new Date().toISOString().split('T')[0],
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        startTime: '09:00', endTime: '17:00',
        time_quota_hours: 2.5,
        task_title_id: '',
        is_faculty: false, faculty_ids: [],
        is_mandatory_flag: false
    });

    const [allUsers, setAllUsers] = useState([]);
    const [apiData, setApiData] = useState(null);
    const [pickerTarget, setPickerTarget] = useState('assigneeIds'); 

    useEffect(() => {
        if (!apiData) return;
        const flattened = [];
        Object.values(apiData).forEach(value => {
            if (Array.isArray(value)) {
                flattened.push(...value);
            } else if (typeof value === 'object') {
                Object.values(value).forEach(deptUsers => {
                    if (Array.isArray(deptUsers)) {
                        flattened.push(...deptUsers);
                    }
                });
            }
        });
        const unique = Array.from(new Map(flattened.map(u => [String(u.user_id), u])).values());
        setAllUsers(unique);
    }, [apiData]);
    
    // User Selection Modal State
    const [showUserPicker, setShowUserPicker] = useState(false);
    const [pickerLevel, setPickerLevel] = useState(0); // 0: Role, 1: Dept, 2: Users
    const [pickerRole, setPickerRole] = useState(null);
    const [pickerDept, setPickerDept] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchBaseData = async () => {
            try {
                const [venuesData, titlesData, deptUsersData] = await Promise.all([
                    api('tasks/venues/my-list'),
                    api('tasks/titles'),
                    api('users/by-department')
                ]);
                setVenues(venuesData.venues || []);
                setTaskTitles(titlesData || []);
                setApiData(deptUsersData);
            } catch (err) {
                console.error("Error fetching dependencies:", err);
            }
        };
        fetchBaseData();
    }, []);

    const hi = (key, value) => setTaskData(prev => ({ ...prev, [key]: value }));
    const addSubTask = () => hi('subTasks', [...taskData.subTasks, { id: Date.now(), title: '', assigneeId: 'Select Assignee', duration: 1.0, order: taskData.subTasks.length + 1 }]);
    const removeSubTask = (id) => hi('subTasks', taskData.subTasks.filter(s => s.id !== id));
    const updateSubTask = (id, key, val) => hi('subTasks', taskData.subTasks.map(s => s.id === id ? { ...s, [key]: val } : s));
    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

    // --- User Picker Helpers ---
    const getRoleUserCount = (roleKey) => {
        if (!apiData) return 0;
        if (['staff', 'principal', 'dean'].includes(roleKey)) return (apiData[roleKey] || []).length;
        let count = 0;
        const depts = apiData[roleKey] || {};
        Object.values(depts).forEach(users => count += users.length);
        return count;
    };
    const getDeptUserCount = (dept) => {
        if (!apiData) return 0;
        return (apiData[pickerRole]?.[dept] || []).length;
    };
    const isItemSelected = (id) => {
        const val = taskData[pickerTarget];
        if (Array.isArray(val)) return val.includes(String(id));
        return String(val) === String(id);
    };
    const toggleUser = (id) => {
        const strId = String(id);
        const currentSelected = taskData[pickerTarget];
        if (pickerTarget === 'approver_id') {
            hi(pickerTarget, strId);
            return;
        }
        if (isItemSelected(strId)) {
            hi(pickerTarget, currentSelected.filter(i => i !== strId));
        } else {
            hi(pickerTarget, [...currentSelected, strId]);
        }
    };
    const toggleGroup = (usersInGroup) => {
        const currentSelectedArr = taskData[pickerTarget];
        const allSelected = usersInGroup.length > 0 && usersInGroup.every(u => isItemSelected(u.user_id));
        if (allSelected) {
            const groupIds = usersInGroup.map(u => String(u.user_id));
            hi(pickerTarget, currentSelectedArr.filter(id => !groupIds.includes(id)));
        } else {
            const currentSelected = new Set(currentSelectedArr);
            usersInGroup.forEach(u => currentSelected.add(String(u.user_id)));
            hi(pickerTarget, Array.from(currentSelected));
        }
    };

    const ROLE_OPTIONS = [
        { title: "Principal", subtitle: "Institutional Head", roleKey: "principal", icon: ShieldCheck },
        { title: "Dean", subtitle: "Institutional Dean", roleKey: "dean", icon: ShieldCheck },
        { title: "HODs", subtitle: "Department Heads", roleKey: "hods", icon: User },
        { title: "All Faculty", subtitle: "Grouped by Department", roleKey: "faculty", icon: User },
        { title: "Staff", subtitle: "Technical & Admin Staff", roleKey: "staff", icon: User },
        { title: "All Students", subtitle: "Grouped by Department", roleKey: "students", icon: User }
    ];

    const HIERARCHY = ['admin', 'principal', 'dean', 'hods', 'faculty', 'students', 'staff'];
    const currentUserRole = (localStorage.getItem('userRole') || 'admin').toLowerCase();
    const roleMap = { 'hod': 'hods', 'student': 'students' };
    const normalizedUserRole = roleMap[currentUserRole] || currentUserRole;
    const userRoleIndex = HIERARCHY.indexOf(normalizedUserRole);

    const getFilteredOptions = () => {
        if (pickerTarget === 'faculty_ids') {
            return ROLE_OPTIONS.filter(opt => ['faculty', 'hods', 'dean', 'principal'].includes(opt.roleKey));
        }
        return ROLE_OPTIONS;
    };

    const handleSubmit = async () => {
        if (!taskData.task_title_id && !taskData.title) {
            alert("Please select a valid Task Title.");
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            
            let task_type_data = {
                task_name: taskData.taskType,
            };

            if (taskData.taskType === 'Fixed Time Task') {
                task_type_data.start_date = taskData.selectedDate;
                task_type_data.end_date = taskData.selectedDate;
                task_type_data.start_time = `${taskData.startTime}:00`;
                task_type_data.end_time = taskData.taskCategory === 'Self Log' ? `${taskData.endTime}:00` : null;
                task_type_data.time_quota_hours = taskData.time_quota_hours;
            } else {
                task_type_data.start_date = taskData.startDate;
                task_type_data.end_date = taskData.endDate;
                task_type_data.start_time = `${taskData.startTime}:00`;
                task_type_data.end_time = taskData.taskCategory === 'Self Log' ? `${taskData.endTime}:00` : null;
                task_type_data.time_quota_hours = taskData.time_quota_hours;
            }

            const payload = {
                title: taskData.title,
                category: taskData.category,
                description: taskData.description,
                priority: taskData.priority,
                is_package: taskData.isPackageTask,
                venue_id: taskData.venue_id || null,
                is_pause_allowed: taskData.allowPause,
                score: taskData.score,
                penalty_per_hour: taskData.penaltyRule.penaltyValue,
                is_document: taskData.is_document,
                task_type_data: task_type_data,
                task_title_id: taskData.task_title_id || null,
                origin_type: taskData.taskCategory === 'Self Log' ? 'self' : 'directive',
                assignee_ids: taskData.assigneeIds,
                requires_approval: taskData.requiresApproval,
                approver_id: taskData.approver_id,
                is_faculty: taskData.is_faculty,
                faculty_ids: taskData.faculty_ids,
                is_mandatory: taskData.is_mandatory_flag,
                closure_ids: taskData.completionMethods.map(m => {
                    if (m === 'OTP Verify') return 1;
                    if (m === 'Photo Upload') return 2;
                    if (m === 'QR Scan') return 3;
                    return 1;
                })
            };

            if (taskData.isPackageTask) {
                payload.sub_tasks = taskData.subTasks.map(s => ({
                    title: s.title,
                    assignee_id: s.assigneeId === 'Select Assignee' ? null : s.assigneeId,
                    order_index: s.order,
                    allocated_hours: parseFloat(s.duration) || 0
                }));
            }

            Object.keys(payload).forEach(key => {
                if (payload[key] === null || payload[key] === undefined) return;
                if (typeof payload[key] === 'object') {
                    formData.append(key, JSON.stringify(payload[key]));
                } else {
                    formData.append(key, payload[key]);
                }
            });

            if (excelFile) {
                formData.append('file', excelFile);
            }

            await api('tasks/unified-create', {
                method: 'POST',
                body: formData
            });

            onSuccess();
        } catch (err) {
            console.error("Submission failed:", err);
            alert("Failed to create task: " + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const priorityColors = { Low: 'border-slate-300 text-slate-500', Medium: 'border-blue-400 text-blue-500', High: 'border-amber-400 text-amber-600', Critical: 'border-red-400 text-red-600' };
    const priorityActiveColors = { Low: 'bg-slate-100 border-slate-400 text-slate-700', Medium: 'bg-blue-50 border-blue-400 text-blue-700', High: 'bg-amber-50 border-amber-400 text-amber-700', Critical: 'bg-red-50 border-red-400 text-red-700' };

    const renderSection1 = () => (
        <div className="space-y-5">
            <div><label className={labelCls}>TASK CATEGORY</label>
                <select className={selectCls} value={taskData.taskCategory} onChange={(e) => hi('taskCategory', e.target.value)}>
                    <option>Directive Task</option>
                    <option>Self Log</option>
                </select>
            </div>
            <div><label className={labelCls}>TASK CLASSIFICATION / CATEGORY</label>
                <select className={selectCls} value={taskData.category} onChange={(e) => hi('category', e.target.value)}>
                    <option>Academic</option>
                    <option>Administrative</option>
                    <option>Compliance</option>
                    <option>Others</option>
                </select>
            </div>
            <div><label className={labelCls}>{taskData.taskCategory === 'Self Log' ? 'ACTIVITY TITLE' : 'TASK TITLE'}</label>
                <select className={selectCls} value={taskData.task_title_id} onChange={(e) => {
                    const title = taskTitles.find(t => t.id === parseInt(e.target.value));
                    hi('task_title_id', e.target.value);
                    if (title) hi('title', title.task_title);
                }}>
                    <option value="">Select a standard title...</option>
                    {taskTitles.map(t => <option key={t.id} value={t.id}>{t.task_title}</option>)}
                </select>
            </div>

            <div><label className={labelCls}>Description</label>
                <div className="relative"><AlignLeft size={16} className="absolute left-3 top-3 text-slate-400" />
                    <textarea className={`${inputCls} pl-10 resize-none`} placeholder="Provide detailed instructions..." value={taskData.description} onChange={(e) => hi('description', e.target.value)} rows={taskData.taskCategory === 'Self Log' ? 5 : 3} /></div></div>
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><label className={labelCls}>Priority</label>
                    <div className="flex gap-2 flex-wrap">
                        {['Low', 'Medium', 'High', 'Critical'].map(p => (
                            <button key={p} type="button" className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${taskData.priority === p ? priorityActiveColors[p] : priorityColors[p]}`}
                                onClick={() => hi('priority', p)}>{p}</button>))}
                    </div></div>
            </div>
            {taskData.taskCategory !== 'Self Log' && (
                <ToggleRow label="Is Package Task" desc="Combine multiple steps into a sequential workflow" checked={taskData.isPackageTask} onChange={(e) => hi('isPackageTask', e.target.checked)} />
            )}
        </div>
    );

    const renderSection2 = () => (
        <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls}>Task Type</label>
                    <select className={selectCls} value={taskData.taskType} onChange={(e) => hi('taskType', e.target.value)}>
                        {['Fixed Time Task', 'Long Task', 'Recurring Task', 'Bidding Task'].map(o => <option key={o}>{o}</option>)}</select></div>
                <div><label className={labelCls}>Venue / Location</label>
                    <select className={selectCls} value={taskData.venue_id} onChange={(e) => hi('venue_id', e.target.value)}>
                        <option value="">No Venue / Remote</option>
                        {venues.map(v => <option key={v.venue_id} value={v.venue_id}>{v.name} ({v.location})</option>)}</select></div>
            </div>
            {!taskData.isPackageTask && (
                <div className="border-t border-dashed border-slate-200 pt-4">
                    <p className="text-[0.7rem] font-extrabold text-slate-400 uppercase tracking-[0.08em] mb-4">Time Configuration</p>
                    {taskData.taskType === 'Fixed Time Task' ? (
                        <div className="space-y-4">
                            <div><label className={labelCls}>Select Date</label>
                                <div className="relative"><Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input type="date" className={`${inputCls} pl-10`} value={taskData.selectedDate} onChange={(e) => hi('selectedDate', e.target.value)} /></div></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className={labelCls}>Start Time</label>
                                    <div className="relative"><Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input type="time" className={`${inputCls} pl-10`} value={taskData.startTime} onChange={(e) => hi('startTime', e.target.value)} /></div></div>
                                {taskData.taskCategory === 'Self Log' ? (
                                    <div><label className={labelCls}>End Time</label>
                                        <div className="relative"><Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input type="time" className={`${inputCls} pl-10`} value={taskData.endTime} onChange={(e) => hi('endTime', e.target.value)} /></div></div>
                                ) : (
                                    <div><label className={labelCls}>Duration (Hours)</label>
                                        <div className="relative"><Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input type="number" step="0.5" className={`${inputCls} pl-10`} value={taskData.time_quota_hours} onChange={(e) => hi('time_quota_hours', parseFloat(e.target.value))} /></div></div>
                                )}
                            </div></div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            {[{ label: 'Valid From', key: 'startDate' }, { label: 'Valid Until', key: 'endDate' }].map(({ label, key }) => (
                                <div key={key}><label className={labelCls}>{label}</label>
                                    <div className="relative"><Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input type="date" className={`${inputCls} pl-10`} value={taskData[key]} onChange={(e) => hi(key, e.target.value)} /></div></div>
                            ))}</div>
                    )}
                </div>
            )}
            <ToggleRow label="Allow Pause" desc="Allow assignees to pause and resume the task" checked={taskData.allowPause} onChange={(e) => hi('allowPause', e.target.checked)} />
        </div>
    );

    const renderSection3 = () => (
        <div className="space-y-5">
            {!taskData.isPackageTask ? (
                <>
                    <div className={`flex items-center gap-3 p-4 border rounded-2xl transition-all ${excelFile ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-dashed border-slate-300 hover:border-indigo-300 hover:bg-indigo-50/30'}`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${excelFile ? 'bg-green-100 text-green-600' : 'bg-indigo-100 text-indigo-600'}`}>
                            {excelFile ? <Check size={18} /> : <Upload size={18} />}
                        </div>
                        <div className="flex-1">
                            <label className={labelCls}>Assign via Excel (.xlsx)</label>
                            <span className={`text-sm font-semibold ${excelFile ? 'text-green-700' : 'text-slate-500'}`}>
                                {excelFile ? excelFile.name : "Bulk Assign via Excel"}
                            </span>
                        </div>
                        <input type="file" hidden id="excel-up" accept=".xlsx, .xls" onChange={(e) => setExcelFile(e.target.files[0])} />
                        {excelFile ? (
                            <button onClick={() => setExcelFile(null)} className="text-xs font-bold text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                        ) : (
                            <label htmlFor="excel-up" className="text-xs font-bold text-indigo-500 cursor-pointer">Browse File</label>
                        )}
                    </div>
                    
                    <div className="border-t border-dashed border-slate-200 pt-4">
                        <p className="text-[0.7rem] font-extrabold text-slate-400 uppercase tracking-[0.08em] mb-4">Manual Assignee Selection</p>
                        
                        <div onClick={() => { setPickerTarget('assigneeIds'); setShowUserPicker(true); }} className="flex items-center gap-3 p-4 border rounded-2xl bg-slate-50 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/50 transition-all border-dashed border-slate-300">
                            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                <User size={18} />
                            </div>
                            <div className="flex-1">
                                <span className="block text-[0.65rem] font-extrabold text-slate-400 uppercase tracking-widest mb-0.5">ASSIGN TO</span>
                                <span className={`text-[0.85rem] font-bold ${taskData.assigneeIds.length === 0 ? 'text-slate-500' : 'text-slate-900'}`}>
                                    {taskData.assigneeIds.length === 0 ? "Select Users, Roles or Depts" : `${taskData.assigneeIds.length} users selected`}
                                </span>
                            </div>
                            <ChevronRight size={18} className="text-slate-400" />
                        </div>
                        
                        {taskData.assigneeIds.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                                {taskData.assigneeIds.map(id => {
                                    const user = allUsers.find(u => u.user_id === id);
                                    return (
                                        <div key={id} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100/50 text-indigo-700 rounded-lg border border-indigo-100">
                                            <span className="text-[0.75rem] font-bold">{user?.name || `User ${id}`}</span>
                                            <button onClick={(e) => { e.stopPropagation(); hi('assigneeIds', taskData.assigneeIds.filter(i => i !== id)); }} className="hover:text-red-500 transition-colors pointer-events-auto"><X size={14} /></button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="border-t border-dashed border-slate-200 pt-4"><p className="text-[0.7rem] font-extrabold text-slate-400 uppercase tracking-[0.08em] mb-4">Governance</p>
                        <ToggleRow label="Is Faculty Managed" desc="Assign a faculty member in charge" checked={taskData.isFaculty} onChange={(e) => hi('isFaculty', e.target.checked)} />
                        {taskData.isFaculty && (
                            <div className="mt-3">
                                <div onClick={() => { setPickerTarget('faculty_ids'); setShowUserPicker(true); }} className="flex items-center gap-3 p-4 border rounded-2xl bg-slate-50 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/50 transition-all border border-slate-200">
                                    <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                                        <User size={18} />
                                    </div>
                                    <div className="flex-1">
                                        <span className="block text-[0.65rem] font-extrabold text-slate-400 uppercase tracking-widest mb-0.5">FACULTY IN CHARGE</span>
                                        <span className={`text-[0.85rem] font-bold ${taskData.faculty_ids.length === 0 ? 'text-slate-500' : 'text-slate-900'}`}>
                                            {taskData.faculty_ids.length === 0 ? "Select Faculty..." : `${taskData.faculty_ids.length} faculty selected`}
                                        </span>
                                    </div>
                                    <ChevronRight size={18} className="text-slate-400" />
                                </div>

                                {taskData.faculty_ids.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                                        {taskData.faculty_ids.map(id => {
                                            const user = allUsers.find(u => String(u.user_id) === String(id));
                                            return (
                                                <div key={id} className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-100/50 text-orange-700 rounded-lg border border-orange-100">
                                                    <span className="text-[0.75rem] font-bold">{user?.name || `User ${id}`}</span>
                                                    <button onClick={(e) => { e.stopPropagation(); hi('faculty_ids', taskData.faculty_ids.filter(i => String(i) !== String(id))); }} className="hover:text-red-500 transition-colors pointer-events-auto"><X size={14} /></button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
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
                                    <div className="w-24 shrink-0">
                                        <input type="number" step="0.5" className={`${inputCls}`} placeholder="Hours" value={sub.duration} onChange={(e) => updateSubTask(sub.id, 'duration', e.target.value)} />
                                    </div>
                                    <select className="bg-transparent border-none text-xs font-bold text-slate-500 outline-none w-32 shrink-0" value={sub.assigneeId} onChange={(e) => updateSubTask(sub.id, 'assigneeId', e.target.value)}>
                                        <option>Select Assignee</option>
                                        {allUsers.map(u => <option key={u.user_id} value={u.user_id}>{u.name}</option>)}
                                    </select>
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
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    {[{ label: 'Score', icon: Star, value: taskData.score, onChange: (v) => hi('score', parseInt(v)) }, { label: 'Penalty', icon: AlertTriangle, value: taskData.penaltyRule.penaltyValue, onChange: (v) => hi('penaltyRule', { penaltyValue: parseInt(v) }) }].map(({ label, icon: Icon, value, onChange }) => (
                        <div key={label}><label className={labelCls}>{label}</label>
                            <div className="relative"><Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input type="number" className={`${inputCls} pl-10`} value={value} onChange={(e) => onChange(e.target.value)} /></div></div>
                    ))}
                </div>
                
                <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 pb-1">
                    <p className="text-[0.65rem] font-extrabold text-slate-400 uppercase tracking-widest pt-4 mb-1 px-0">Task Flags</p>
                    {[{ key: 'is_document', label: 'Mandatory Documentation', desc: 'Requires proof uploads' }, { key: 'is_mandatory_flag', label: 'Is Mandatory Task?', desc: 'Required activity for all assignees' }].map(item => (
                        <ToggleRow key={item.key} label={item.label} desc={item.desc} checked={taskData[item.key]} onChange={(e) => hi(item.key, e.target.checked)} />))}
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 pb-1">
                     <p className="text-[0.65rem] font-extrabold text-slate-400 uppercase tracking-widest pt-4 mb-1 px-0">Closure Rules</p>
                     {['OTP Verify', 'Photo Upload', 'QR Scan'].map(method => (
                         <ToggleRow 
                            key={method} 
                            label={method} 
                            desc={method === 'OTP Verify' ? 'Verify completion via One-Time Password' : method === 'Photo Upload' ? 'Require a photo for task completion' : 'Require scanning a location/task QR'} 
                            checked={taskData.completionMethods.includes(method)} 
                            onChange={(e) => {
                                const checked = e.target.checked;
                                hi('completionMethods', checked 
                                    ? [...taskData.completionMethods, method]
                                    : taskData.completionMethods.filter(m => m !== method)
                                );
                            }} 
                        />
                     ))}
                </div>
            </div>
        );
    };

    return createPortal(
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-999 flex items-center justify-center p-4">
            <motion.div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative"
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
                <div className="flex-1 overflow-y-auto px-8 py-6 relative">
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
                    <div className="flex gap-3">
                        {currentStep < 3 ? (
                            <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-600 transition-all" onClick={nextStep}>Continue <ChevronRight size={18} /></button>
                        ) : (
                            <button className={`flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition-all ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={handleSubmit} disabled={isSubmitting}>{isSubmitting ? 'Publishing...' : 'Publish Directive'}</button>
                        )}
                    </div>
                </div>

                {/* Overlay User Picker over the entire CreateTask modal */}
                {showUserPicker && (
                    <div className="absolute inset-0 bg-white z-50 flex flex-col p-6 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-3">
                                    {pickerLevel > 0 && (
                                        <button 
                                            onClick={() => {
                                                if (pickerLevel === 2 && pickerRole !== 'staff') {
                                                    setPickerLevel(1);
                                                    setPickerDept(null);
                                                } else {
                                                    setPickerLevel(0);
                                                    setPickerRole(null);
                                                    setPickerDept(null);
                                                }
                                                setSearchQuery('');
                                            }}
                                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                    )}
                                    <h3 className="text-[1.1rem] font-extrabold text-slate-900 flex items-center gap-2">
                                        <User size={20} className="text-indigo-500"/>
                                        {pickerLevel === 0 ? "Select Role" : pickerLevel === 1 ? `Select ${pickerRole} Department` : `Select ${pickerRole === 'staff' ? 'Staff' : pickerDept}`}
                                    </h3>
                                </div>
                                <button onClick={() => setShowUserPicker(false)} className="bg-slate-100 p-2 rounded-xl text-slate-500 hover:bg-slate-200 transition-all cursor-pointer"><X size={18} /></button>
                            </div>

                            {pickerLevel > 0 && (
                                <div className="flex items-center gap-2 mb-4 px-2 py-1 bg-slate-50 rounded-lg w-fit border border-slate-100">
                                    <span className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest">{pickerRole}</span>
                                    {pickerDept && (
                                        <>
                                            <ChevronRight size={12} className="text-slate-300" />
                                            <span className="text-[0.65rem] font-bold text-slate-700 uppercase tracking-widest">{pickerDept}</span>
                                        </>
                                    )}
                                </div>
                            )}

                            {pickerLevel === 2 && (
                                <div className="relative mb-5">
                                    <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        className={`${inputCls} pl-11 py-3 text-[0.9rem]`}
                                        placeholder={`Search users by name or ID...`}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            )}

                            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                                {!apiData ? (
                                    <div className="flex justify-center py-10"><div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full" /></div>
                                 ) : pickerLevel === 0 ? (
                                    getFilteredOptions().map(role => {
                                        const count = getRoleUserCount(role.roleKey);
                                        const usersInGroup = ['staff', 'principal', 'dean'].includes(role.roleKey) ? [...(apiData[role.roleKey] || [])] : [];
                                        if (!['staff', 'principal', 'dean'].includes(role.roleKey)) {
                                            const depts = apiData[role.roleKey] || {};
                                            Object.values(depts).forEach(group => {
                                                if (Array.isArray(group)) {
                                                    usersInGroup.push(...group);
                                                }
                                            });
                                        }
                                        const allSelected = usersInGroup.length > 0 && usersInGroup.every(u => isItemSelected(u.user_id));
                                        
                                        return (
                                            <div key={role.roleKey} onClick={() => {
                                                setPickerRole(role.roleKey);
                                                 if (['staff', 'principal', 'dean'].includes(role.roleKey)) {
                                                    setPickerLevel(2);
                                                    setPickerDept(role.title);
                                                } else {
                                                    setPickerLevel(1);
                                                }
                                                setSearchQuery('');
                                            }} className={`flex items-center p-4 rounded-2xl border transition-all cursor-pointer ${allSelected ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-100 hover:border-indigo-300 shadow-sm'}`}>
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 transition-colors ${allSelected ? 'bg-indigo-500 text-white shadow-md shadow-indigo-200' : 'bg-indigo-50 text-indigo-600'}`}>
                                                    <role.icon size={20} />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-[0.95rem] font-bold text-slate-900 mb-0.5">{role.title} ({count})</h4>
                                                    <p className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest">{role.subtitle}</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); toggleGroup(usersInGroup); }}
                                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.7rem] font-extrabold border transition-all ${
                                                            allSelected
                                                              ? 'bg-indigo-500 border-indigo-500 text-white shadow-md shadow-indigo-200'
                                                              : 'bg-white border-indigo-300 text-indigo-600 hover:bg-indigo-50'
                                                        }`}
                                                    >
                                                        {allSelected ? <><Check size={12} /> Deselect All</> : 'Select All'}
                                                    </button>
                                                    <ChevronRight size={20} className="text-slate-300" />
                                                </div>
                                            </div>
                                        )
                                    })
                                ) : pickerLevel === 1 ? (
                                    Object.keys(apiData[pickerRole] || {}).sort().filter(d => d.toLowerCase().includes(searchQuery.toLowerCase())).map(dept => {
                                        const count = getDeptUserCount(dept);
                                        const usersInGroup = apiData[pickerRole]?.[dept] || [];
                                        const allSelected = usersInGroup.length > 0 && usersInGroup.every(u => isItemSelected(u.user_id));
                                        
                                        return (
                                            <div key={dept} onClick={() => {
                                                setPickerDept(dept);
                                                setPickerLevel(2);
                                                setSearchQuery('');
                                            }} className={`flex items-center p-4 rounded-xl border transition-all cursor-pointer ${allSelected ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-100 hover:border-indigo-300'}`}>
                                                <div className="flex-1">
                                                    <h4 className="text-[0.9rem] font-bold text-slate-800 mb-1">{dept} ({count})</h4>
                                                    <p className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest">Target all in {dept}</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); toggleGroup(usersInGroup); }}
                                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.7rem] font-extrabold border transition-all ${
                                                            allSelected
                                                              ? 'bg-indigo-500 border-indigo-500 text-white shadow-md shadow-indigo-200'
                                                              : 'bg-white border-indigo-300 text-indigo-600 hover:bg-indigo-50'
                                                        }`}
                                                    >
                                                        {allSelected ? <><Check size={12} /> Deselect</> : 'Select All'}
                                                    </button>
                                                    <ChevronRight size={18} className="text-slate-300" />
                                                </div>
                                            </div>
                                        )
                                    })
                                ) : (
                                    (pickerRole === 'staff' ? (apiData.staff || []) : (apiData[pickerRole]?.[pickerDept] || []))
                                    .filter(u => u?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || String(u?.user_id || '').includes(searchQuery))
                                    .map(user => {
                                        const isSelected = isItemSelected(user.user_id);
                                        return (
                                            <button
                                                key={user.user_id}
                                                onClick={() => toggleUser(user.user_id)}
                                                className={`w-full flex items-center justify-between p-3.5 rounded-xl text-left transition-all cursor-pointer ${isSelected ? 'bg-indigo-50 border border-indigo-200 shadow-[0_2px_10px_-4px_rgba(99,102,241,0.3)]' : 'bg-white border border-slate-100 hover:border-indigo-300'}`}
                                            >
                                                <div className="flex items-center gap-3.5">
                                                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-[1.1rem] transition-colors ${isSelected ? 'bg-indigo-500 text-white shadow-md shadow-indigo-200' : 'bg-slate-100 text-slate-500'}`}>
                                                        {user.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <span className={`block text-[0.9rem] font-extrabold ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>{user.name}</span>
                                                        <span className="text-[0.7rem] text-slate-500 font-bold uppercase tracking-[0.5px] mt-0.5">{user.designation || pickerRole} &middot; {user.reg_no || `#${user.user_id}`}</span>
                                                    </div>
                                                </div>
                                                {isSelected && <CheckCircle2 size={20} className="text-indigo-600" />}
                                            </button>
                                        );
                                    })
                                )}
                            </div>

                            <div className="pt-5 mt-auto border-t border-slate-100">
                                <button onClick={() => setShowUserPicker(false)} className="w-full py-3.5 bg-slate-900 text-white font-extrabold text-[0.9rem] rounded-xl shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all cursor-pointer">
                                    Done &middot; {pickerTarget === 'approver_id' ? (taskData.approver_id ? 1 : 0) : taskData[pickerTarget].length} Selected
                                </button>
                            </div>
                    </div>
                )}
            </motion.div>
        </div>,
        document.body
    );
};

export default CreateTask;
