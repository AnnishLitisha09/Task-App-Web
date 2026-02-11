import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, ClipboardList, Target, MapPin,
    Users, Calendar, AlertCircle, Info,
    CheckCircle2, QrCode, Camera, FileText
} from 'lucide-react';
import './TaskModal.css';

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    taskData?: any;
    mode: 'create' | 'edit';
    onSuccess: () => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, taskData, mode, onSuccess }) => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Assessment');
    const [priority, setPriority] = useState('Medium');
    const [type, setType] = useState('Fixed Time Task');
    const [venue, setVenue] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [methods, setMethods] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (mode === 'edit' && taskData) {
            setTitle(taskData.title || '');
            setCategory(taskData.category || 'Assessment');
            setPriority(taskData.priority || 'Medium');
            setType(taskData.type || 'Fixed Time Task');
            setVenue(taskData.venue || '');
            setDueDate(taskData.dueDate || '');
            setMethods(taskData.methods || []);
        }
    }, [mode, taskData]);

    const toggleMethod = (method: string) => {
        setMethods(prev =>
            prev.includes(method)
                ? prev.filter(m => m !== method)
                : [...prev, method]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Mock API call
        setTimeout(() => {
            setIsLoading(false);
            onSuccess();
            onClose();
        }, 1000);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="modal-overlay">
                <motion.div
                    className="task-modal"
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                >
                    <div className="modal-header">
                        <div className="header-title-box">
                            <div className="header-icon">
                                <ClipboardList size={24} />
                            </div>
                            <div>
                                <h2>{mode === 'create' ? 'Create Directive' : 'Edit Directive'}</h2>
                                <p className="header-subtitle">Set up academic workflow and requirements</p>
                            </div>
                        </div>
                        <button className="close-btn" onClick={onClose}><X size={20} /></button>
                    </div>

                    <form onSubmit={handleSubmit} className="modal-body">
                        <div className="form-sections">
                            <div className="form-group">
                                <label>Directive Title</label>
                                <div className="input-with-icon">
                                    <Target size={18} className="field-icon" />
                                    <input
                                        type="text"
                                        placeholder="e.g. End Semester Lab Assessment"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Category</label>
                                    <select value={category} onChange={(e) => setCategory(e.target.value)}>
                                        <option>Assessment</option>
                                        <option>Event</option>
                                        <option>Infrastructure</option>
                                        <option>Administration</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Priority</label>
                                    <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                                        <option>Critical</option>
                                        <option>High</option>
                                        <option>Medium</option>
                                        <option>Low</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Venue / Location</label>
                                    <div className="input-with-icon">
                                        <MapPin size={18} className="field-icon" />
                                        <input
                                            type="text"
                                            placeholder="Select venue..."
                                            value={venue}
                                            onChange={(e) => setVenue(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Due Date</label>
                                    <div className="input-with-icon">
                                        <Calendar size={18} className="field-icon" />
                                        <input
                                            type="date"
                                            value={dueDate}
                                            onChange={(e) => setDueDate(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Execution Verification Methods</label>
                                <div className="methods-grid">
                                    {[
                                        { id: 'QR Scan', icon: <QrCode size={18} /> },
                                        { id: 'Photo', icon: <Camera size={18} /> },
                                        { id: 'Doc Upload', icon: <FileText size={18} /> }
                                    ].map(method => (
                                        <button
                                            key={method.id}
                                            type="button"
                                            className={`method-toggle ${methods.includes(method.id) ? 'active' : ''}`}
                                            onClick={() => toggleMethod(method.id)}
                                        >
                                            {method.icon}
                                            <span>{method.id}</span>
                                            {methods.includes(method.id) && <CheckCircle2 size={14} className="check-mark" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="info-guide">
                            <Info size={18} />
                            <p>Directives require multi-stage approval from assigned faculty and venue incharges before execution.</p>
                        </div>
                    </form>

                    <div className="modal-footer">
                        <button type="button" className="cancel-pill" onClick={onClose}>Cancel</button>
                        <button
                            type="submit"
                            className="submit-pill"
                            onClick={handleSubmit}
                            disabled={isLoading || !title}
                        >
                            {isLoading ? (
                                <div className="spinner-mini"></div>
                            ) : (
                                mode === 'create' ? 'Publish Directive' : 'Update Directive'
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default TaskModal;
