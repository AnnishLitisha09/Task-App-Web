import React from 'react';
import {
    Calendar, MapPin, ShieldCheck,
    ArrowLeft, CheckCircle2, AlertCircle,
    Clock, School, DoorOpen, Users,
    QrCode, Camera, FileText, MoreVertical, Star
} from 'lucide-react';
import './TaskDetails.css';

const TaskDetails = ({ task, onBack }) => {
    if (!task) return null;

    const isFullyApproved = task.status === 'Completed';

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'Critical': return '#ef4444';
            case 'High': return '#f59e0b';
            case 'Medium': return '#6366f1';
            case 'Low': return '#10b981';
            default: return '#64748b';
        }
    };

    const getMethodIcon = (method) => {
        switch (method) {
            case 'QR Scan': return <QrCode size={16} />;
            case 'Photo': return <Camera size={16} />;
            case 'Doc Upload': return <FileText size={16} />;
            default: return <CheckCircle2 size={16} />;
        }
    };

    return (
        <div className="task-details-page">
            {/* Header */}
            <div className="details-header">
                <button className="back-btn" onClick={onBack}>
                    <ArrowLeft size={18} />
                    <span>Back to Directives</span>
                </button>
                <button className="more-btn">
                    <MoreVertical size={18} />
                </button>
            </div>

            {/* Status Banner */}
            <div className={`status-banner ${isFullyApproved ? 'approved' : 'pending'}`}>
                {isFullyApproved ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                <span>{isFullyApproved ? 'FULLY AUTHORIZED' : 'PENDING AUTHORIZATION'}</span>
            </div>

            {/* Main Content */}
            <div className="details-content">
                {/* Title Section */}
                <div className="title-section">
                    <div className="title-badges">
                        <span className="priority-badge" style={{
                            backgroundColor: `${getPriorityColor(task.priority)}15`,
                            color: getPriorityColor(task.priority)
                        }}>
                            {task.priority.toUpperCase()}
                        </span>
                        <div className="due-date">
                            <Calendar size={14} />
                            <span>Due {task.dueDate}</span>
                        </div>
                    </div>
                    <h1>{task.title}</h1>
                    <p className="task-description">{task.description}</p>
                </div>

                {/* Info Grid */}
                <div className="info-grid">
                    <div className="info-card">
                        <div className="info-icon" style={{ backgroundColor: '#6366f115', color: '#6366f1' }}>
                            <MapPin size={20} />
                        </div>
                        <div className="info-content">
                            <span className="info-label">Location</span>
                            <span className="info-value">{task.location}</span>
                        </div>
                    </div>
                    <div className="info-card">
                        <div className="info-icon" style={{ backgroundColor: '#10b98115', color: '#10b981' }}>
                            <Users size={20} />
                        </div>
                        <div className="info-content">
                            <span className="info-label">Assignees</span>
                            <span className="info-value">{task.assignees} Members</span>
                        </div>
                    </div>
                    <div className="info-card">
                        <div className="info-icon" style={{ backgroundColor: '#f59e0b15', color: '#f59e0b' }}>
                            <Star size={20} />
                        </div>
                        <div className="info-content">
                            <span className="info-label">Score</span>
                            <span className="info-value">{task.score} Points</span>
                        </div>
                    </div>
                </div>

                {/* Two Column Layout */}
                <div className="details-grid">
                    {/* Left Column */}
                    <div className="details-column">
                        {/* Execution Proof */}
                        <div className="section-card">
                            <h2 className="section-title">Execution Proof Requirements</h2>
                            <div className="proof-list">
                                {
                                    task.methods.map((method, i) => (
                                        <div key={i} className="proof-item">
                                            <div className="proof-icon-box">
                                                {getMethodIcon(method)}
                                            </div>
                                            <span className="proof-name">{method}</span>
                                            <span className="mandatory-tag">MANDATORY</span>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>

                        {/* Assignees */}
                        <div className="section-card">
                            <h2 className="section-title">Assigned Members</h2>
                            <div className="assignees-list">
                                {
                                    [
                                        { name: 'Alex Rivera', role: 'Lead', color: '#6366f1' },
                                        { name: 'Sarah Chen', role: 'Member', color: '#10b981' },
                                        { name: 'James Wilson', role: 'Member', color: '#f59e0b' }
                                    ].map((person, i) => (
                                        <div key={i} className="assignee-item">
                                            <div className="assignee-avatar" style={{ backgroundColor: `${person.color}15`, color: person.color }}>
                                                {person.name[0]}
                                            </div>
                                            <div className="assignee-info">
                                                <span className="assignee-name">{person.name}</span>
                                                <span className="assignee-role">{person.role}</span>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskDetails;
