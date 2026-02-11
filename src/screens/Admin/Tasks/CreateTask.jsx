import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Check, ChevronRight, ChevronLeft,
    Target, AlignLeft, BarChart3, Clock,
    MapPin, Calendar, User, ShieldCheck,
    Star, AlertTriangle, QrCode, Camera,
    FileText, Key, Laptop, Presentation,
    Truck, Cpu, Upload, Plus, Trash2
} from 'lucide-react';
import './CreateTask.css';

const STEPS = [
    { id: 0, title: "Identity", subtitle: "Basic details & Classification" },
    { id: 1, title: "Time & Venue", subtitle: "Configuration & Location" },
    { id: 2, title: "Responsibility", subtitle: "Governance & Assignees" },
    { id: 3, title: "Closing Rules", subtitle: "Evaluation & Resources" }
];

const CreateTask = ({ onCancel, onSuccess }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- TASK STATE ---
    const [taskData, setTaskData] = useState({
        title: '',
        description: '',
        category: 'Academic',
        priority: 'Medium',
        taskType: 'Fixed Time Task',
        ownerId: 'Admin User',
        assigneeIds: [],
        targetType: 'Individual',
        locationId: 'Main Hall',
        resources: [],
        score: 100,
        penaltyRule: { penaltyValue: 5 },
        completionMethods: [],
        subTasks: [],
        requiresApproval: true,
        approvalAuthority: 'Department Head',
        isPackageTask: false,
        allowPause: false,
        delegationAllowed: false,
        autoEscalation: true,
        mandatoryDocumentation: true,
        requiredDocuments: [],
        selectedDate: new Date().toISOString().split('T')[0],
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '17:00'
    });

    const handleInputChange = (key, value) => {
        setTaskData(prev => ({ ...prev, [key]: value }));
    };

    const toggleMultiSelect = (key, value) => {
        setTaskData(prev => {
            const list = prev[key];
            const newList = list.includes(value)
                ? list.filter(item => item !== value)
                : [...list, value];
            return { ...prev, [key]: newList };
        });
    };

    const addSubTask = () => {
        const newSub = {
            id: Date.now(),
            title: '',
            assigneeId: 'Select Assignee',
            order: taskData.subTasks.length + 1
        };
        handleInputChange('subTasks', [...taskData.subTasks, newSub]);
    };

    const removeSubTask = (id) => {
        handleInputChange('subTasks', taskData.subTasks.filter(s => s.id !== id));
    };

    const updateSubTask = (id, key, val) => {
        handleInputChange('subTasks', taskData.subTasks.map(s => s.id === id ? { ...s, [key]: val } : s));
    };

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

    const handleSubmit = async () => {
        setIsSubmitting(true);
        // Mock API Submission
        setTimeout(() => {
            setIsSubmitting(false);
            onSuccess();
        }, 1500);
    };

    // --- RENDERING HELPERS ---

    const renderStepProgress = () => (
        <div className="stepper-wrapper">
            <div className="stepper-track">
                <div
                    className="stepper-fill"
                    style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
                ></div>
                {STEPS.map((step) => (
                    <div
                        key={step.id}
                        className={`step-node ${currentStep >= step.id ? 'active' : ''} ${currentStep === step.id ? 'current' : ''}`}
                        onClick={() => setCurrentStep(step.id)}
                    >
                        <div className="node-dot">
                            {currentStep > step.id ? <Check size={14} /> : step.id + 1}
                        </div>
                        <span className="node-label">{step.title}</span>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderSection1 = () => (
        <div className="section-content">
            <div className="form-group full">
                <label>TASK TITLE</label>
                <div className="input-with-icon">
                    <Target size={20} className="f-icon" />
                    <input
                        placeholder="e.g. Annual Audit Report"
                        value={taskData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                    />
                </div>
            </div>
            <div className="form-group full">
                <label>DESCRIPTION</label>
                <div className="input-with-icon textarea-box">
                    <AlignLeft size={20} className="f-icon" />
                    <textarea
                        placeholder="Provide detailed instructions..."
                        value={taskData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows={3}
                    />
                </div>
            </div>
            <div className="form-grid">
                <div className="form-group">
                    <label>CATEGORY</label>
                    <select value={taskData.category} onChange={(e) => handleInputChange('category', e.target.value)}>
                        <option>Academic</option>
                        <option>Administrative</option>
                        <option>Compliance</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>PRIORITY</label>
                    <div className="priority-select">
                        {['Low', 'Medium', 'High', 'Critical'].map(p => (
                            <button
                                key={p}
                                className={`p-btn ${taskData.priority === p ? 'active' : ''}`}
                                onClick={() => handleInputChange('priority', p)}
                                type="button"
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <div className="toggle-box">
                <div className="toggle-text">
                    <span className="t-label">IS PACKAGE TASK</span>
                    <p className="t-desc">Combine multiple steps into a sequential workflow</p>
                </div>
                <label className="switch">
                    <input
                        type="checkbox"
                        checked={taskData.isPackageTask}
                        onChange={(e) => handleInputChange('isPackageTask', e.target.checked)}
                    />
                    <span className="slider round"></span>
                </label>
            </div>
        </div>
    );

    const renderSection2 = () => (
        <div className="section-content">
            <div className="form-grid">
                <div className="form-group">
                    <label>TASK TYPE</label>
                    <select value={taskData.taskType} onChange={(e) => handleInputChange('taskType', e.target.value)}>
                        <option>Fixed Time Task</option>
                        <option>Long Task</option>
                        <option>Recurring Task</option>
                        <option>Bidding Task</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>VENUE / LOCATION</label>
                    <div className="input-with-icon">
                        <MapPin size={20} className="f-icon" />
                        <select value={taskData.locationId} onChange={(e) => handleInputChange('locationId', e.target.value)}>
                            <option>Main Hall</option>
                            <option>Lab 101</option>
                            <option>Conference Room</option>
                            <option>Remote</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="divider-label">TIME CONFIGURATION</div>

            {taskData.taskType === 'Fixed Time Task' ? (
                <div className="time-config-card">
                    <div className="form-group full">
                        <label>SELECT DATE</label>
                        <div className="input-with-icon">
                            <Calendar size={20} className="f-icon" />
                            <input
                                type="date"
                                value={taskData.selectedDate}
                                onChange={(e) => handleInputChange('selectedDate', e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>START TIME</label>
                            <div className="input-with-icon">
                                <Clock size={20} className="f-icon" />
                                <input
                                    type="time"
                                    value={taskData.startTime}
                                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>END TIME</label>
                            <div className="input-with-icon">
                                <Clock size={20} className="f-icon" />
                                <input
                                    type="time"
                                    value={taskData.endTime}
                                    onChange={(e) => handleInputChange('endTime', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="time-config-card">
                    <div className="form-grid">
                        <div className="form-group">
                            <label>VALID FROM</label>
                            <div className="input-with-icon">
                                <Calendar size={20} className="f-icon" />
                                <input
                                    type="date"
                                    value={taskData.startDate}
                                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>VALID UNTIL</label>
                            <div className="input-with-icon">
                                <Calendar size={20} className="f-icon" />
                                <input
                                    type="date"
                                    value={taskData.endDate}
                                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="toggle-box">
                <div className="toggle-text">
                    <span className="t-label">ALLOW PAUSE</span>
                    <p className="t-desc">Allow assignees to pause and resume the task</p>
                </div>
                <label className="switch">
                    <input
                        type="checkbox"
                        checked={taskData.allowPause}
                        onChange={(e) => handleInputChange('allowPause', e.target.checked)}
                    />
                    <span className="slider round"></span>
                </label>
            </div>
        </div>
    );

    const renderSection3 = () => (
        <div className="section-content">
            {!taskData.isPackageTask ? (
                <>
                    <div className="responsibility-items">
                        <div className="user-picker-card">
                            <div className="up-icon"><ShieldCheck size={20} /></div>
                            <div className="up-info">
                                <label>TASK OWNER</label>
                                <span>{taskData.ownerId}</span>
                            </div>
                            <button className="change-btn">Change</button>
                        </div>

                        <div className="user-picker-card">
                            <div className="up-icon accent"><User size={20} /></div>
                            <div className="up-info">
                                <label>ASSIGNEES</label>
                                <span>{taskData.assigneeIds.length || 'No'} assignees selected</span>
                            </div>
                            <button className="change-btn">Add Manually</button>
                        </div>

                        <div className="excel-upload-zone">
                            <div className="excel-icon"><FileText size={20} /></div>
                            <span>Assign via Excel (.xlsx)</span>
                            <input type="file" hidden id="excel-up" />
                            <label htmlFor="excel-up">Browse File</label>
                        </div>
                    </div>

                    <div className="form-group full">
                        <label>TARGET ENTITY</label>
                        <select value={taskData.targetType} onChange={(e) => handleInputChange('targetType', e.target.value)}>
                            <option>Individual</option>
                            <option>Role</option>
                            <option>Infrastructure</option>
                            <option>Group</option>
                        </select>
                    </div>

                    <div className="toggle-box">
                        <div className="toggle-text">
                            <span className="t-label">REQUIRES APPROVAL</span>
                            <p className="t-desc">Validation needed before task is considered done</p>
                        </div>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={taskData.requiresApproval}
                                onChange={(e) => handleInputChange('requiresApproval', e.target.checked)}
                            />
                            <span className="slider round"></span>
                        </label>
                    </div>

                    {taskData.requiresApproval && (
                        <div className="user-picker-card animate-slide-down">
                            <div className="up-icon gold"><ShieldCheck size={20} /></div>
                            <div className="up-info">
                                <label>APPROVAL AUTHORITY</label>
                                <span>{taskData.approvalAuthority}</span>
                            </div>
                            <button className="change-btn">Change</button>
                        </div>
                    )}
                </>
            ) : (
                <div className="sequence-workflow">
                    <div className="seq-header">
                        <span className="seq-label">WORKFLOW SEQUENCE</span>
                        <button onClick={addSubTask} className="add-step-btn">
                            <Plus size={16} /> Add Step
                        </button>
                    </div>
                    <div className="seq-list">
                        <AnimatePresence>
                            {taskData.subTasks.map((sub, idx) => (
                                <motion.div
                                    key={sub.id}
                                    className="seq-card"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                >
                                    <div className="seq-num">{idx + 1}</div>
                                    <div className="seq-fields">
                                        <input
                                            placeholder="Step Title"
                                            value={sub.title}
                                            onChange={(e) => updateSubTask(sub.id, 'title', e.target.value)}
                                        />
                                        <div className="sub-assignee">
                                            <User size={14} />
                                            <span>{sub.assigneeId}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => removeSubTask(sub.id)} className="del-btn">
                                        <Trash2 size={16} />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {taskData.subTasks.length === 0 && (
                            <div className="empty-seq">
                                No steps added. Click "Add Step" to begin.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );

    const renderSection4 = () => (
        <div className="section-content">
            <div className="form-grid">
                <div className="form-group">
                    <label>SCORE</label>
                    <div className="input-with-icon">
                        <Star size={20} className="f-icon" />
                        <input
                            type="number"
                            value={taskData.score}
                            onChange={(e) => handleInputChange('score', parseInt(e.target.value))}
                        />
                    </div>
                </div>
                <div className="form-group">
                    <label>PENALTY</label>
                    <div className="input-with-icon">
                        <AlertTriangle size={20} className="f-icon" />
                        <input
                            type="number"
                            value={taskData.penaltyRule.penaltyValue}
                            onChange={(e) => handleInputChange('penaltyRule', { penaltyValue: parseInt(e.target.value) })}
                        />
                    </div>
                </div>
            </div>

            <div className="divider-label">COMPLETION METHODS</div>
            <div className="chips-grid">
                {[
                    { id: 'OTP Verify', icon: <Key size={18} /> },
                    { id: 'Photo Upload', icon: <Camera size={18} /> },
                    { id: 'QR Scan', icon: <QrCode size={18} /> },
                    { id: 'Doc Upload', icon: <FileText size={18} /> }
                ].map(m => (
                    <button
                        key={m.id}
                        className={`chip-btn ${taskData.completionMethods.includes(m.id) ? 'active' : ''}`}
                        onClick={() => toggleMultiSelect('completionMethods', m.id)}
                    >
                        {m.icon}
                        <span>{m.id}</span>
                    </button>
                ))}
            </div>

            <div className="divider-label">REQUIRED RESOURCES</div>
            <div className="chips-grid">
                {[
                    { id: 'Laptop', icon: <Laptop size={18} /> },
                    { id: 'Projector', icon: <Presentation size={18} /> },
                    { id: 'Vehicle', icon: <Truck size={18} /> },
                    { id: 'Software', icon: <Cpu size={18} /> }
                ].map(r => (
                    <button
                        key={r.id}
                        className={`chip-btn ${taskData.resources.includes(r.id) ? 'active' : ''}`}
                        onClick={() => toggleMultiSelect('resources', r.id)}
                    >
                        {r.icon}
                        <span>{r.id}</span>
                    </button>
                ))}
            </div>

            <div className="toggle-list">
                {[
                    { key: 'autoEscalation', label: 'AUTO ESCALATION', desc: 'Notify superiors if task is overdue' },
                    { key: 'mandatoryDocumentation', label: 'MANDATORY DOCUMENTATION', desc: 'Requires proof uploads' },
                    { key: 'delegationAllowed', label: 'ALLOW DELEGATION', desc: 'Assignees can delegate to others' }
                ].map(item => (
                    <div key={item.key} className="toggle-box compact">
                        <div className="toggle-text">
                            <span className="t-label">{item.label}</span>
                        </div>
                        <label className="switch small">
                            <input
                                type="checkbox"
                                checked={taskData[item.key]}
                                onChange={(e) => handleInputChange(item.key, e.target.checked)}
                            />
                            <span className="slider round"></span>
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );

    // --- MAIN RENDER ---
    return (
        <div className="create-directive-overlay">
            <motion.div
                className="create-directive-container"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
            >
                <div className="create-header">
                    <div className="ch-left">
                        <button className="back-circle-btn" onClick={onCancel}><ChevronLeft size={24} /></button>
                        <div className="ch-titles">
                            <h2>Create Directive</h2>
                            <p>Step {currentStep + 1}: {STEPS[currentStep].subtitle}</p>
                        </div>
                    </div>
                    <button className="close-x-btn" onClick={onCancel}><X size={24} /></button>
                </div>

                {renderStepProgress()}

                <div className="create-body">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {currentStep === 0 && renderSection1()}
                            {currentStep === 1 && renderSection2()}
                            {currentStep === 2 && renderSection3()}
                            {currentStep === 3 && renderSection4()}
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="create-footer">
                    <div className="cf-left">
                        {currentStep > 0 && (
                            <button className="btn-secondary" onClick={prevStep}>
                                <ChevronLeft size={20} /> Back
                            </button>
                        )}
                    </div>
                    <div className="cf-right">
                        {currentStep < 3 ? (
                            <button className="btn-primary" onClick={nextStep}>
                                Continue <ChevronRight size={20} />
                            </button>
                        ) : (
                            <button
                                className="btn-primary publish"
                                onClick={handleSubmit}
                                disabled={isSubmitting || !taskData.title}
                            >
                                {isSubmitting ? <div className="spinner-mini"></div> : 'Publish Directive'}
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default CreateTask;
