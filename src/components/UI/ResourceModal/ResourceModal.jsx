import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Check, Search, AlertCircle, Info,
    Box, AlignLeft, UserPlus, Monitor, PenTool
} from 'lucide-react';
import './ResourceModal.css';

// Mock Data for Assignees (since we don't have API connected yet or complex hook setup)
const MOCK_USERS = [
    { id: 'u1', name: 'John Doe', reg_no: 'FAC001', role: 'Faculty' },
    { id: 'u2', name: 'Jane Smith', reg_no: 'STF002', role: 'Staff' },
    { id: 'u3', name: 'Dr. Alan Grant', reg_no: 'HOD003', role: 'Role User' },
    { id: 'u4', name: 'Alice Cooper', reg_no: 'FAC004', role: 'Faculty' },
];

const ResourceModal = ({
    isOpen, onClose, resourceData, mode, onSuccess
}) => {
    // Mode: 'create' | 'edit' | 'assign'
    const [name, setName] = useState('');
    const [details, setDetails] = useState('');
    const [inchargeSearch, setInchargeSearch] = useState('');
    const [selectedIncharge, setSelectedIncharge] = useState(null);
    const [showFacultyDropdown, setShowFacultyDropdown] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (resourceData) {
                setName(resourceData.name || '');
                setDetails(resourceData.details || '');
                if (resourceData.assignedTo && resourceData.assignedTo !== '-') {
                    // Start with basic string matching for mock data
                    const assigneeName = resourceData.assignedTo;
                    setInchargeSearch(assigneeName);
                    // Try to find in mock users
                    const found = MOCK_USERS.find(u => assigneeName.includes(u.name));
                    setSelectedIncharge(found || { id: 'generic', name: assigneeName, role: 'User' });
                } else {
                    setSelectedIncharge(null);
                    setInchargeSearch('');
                }
            } else {
                setName('');
                setDetails('');
                setSelectedIncharge(null);
                setInchargeSearch('');
            }
            setError('');
        }
    }, [isOpen, resourceData]);

    const filteredUsers = MOCK_USERS.filter(u =>
        u.name.toLowerCase().includes(inchargeSearch.toLowerCase()) ||
        u.reg_no.toLowerCase().includes(inchargeSearch.toLowerCase())
    );

    const handleSubmit = async () => {
        if (!name && mode !== 'assign') {
            setError('Resource name is required');
            return;
        }

        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            const data = {
                name,
                details,
                assignedTo: selectedIncharge ? `${selectedIncharge.name} (${selectedIncharge.role})` : '-'
            };
            onSuccess(data);
        }, 600);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="modal-overlay">
                <motion.div
                    className="resource-modal"
                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, y: 10 }}
                >
                    <div className="modal-header">
                        <div className="header-info">
                            <div className="icon-badge">
                                {mode === 'assign' ? <UserPlus size={20} /> : <Box size={20} />}
                            </div>
                            <div>
                                <h2>
                                    {mode === 'create' ? 'Add New Resource' :
                                        mode === 'edit' ? 'Edit Resource' : 'Assign Resource'}
                                </h2>
                                <p className="header-subtitle">
                                    {mode === 'assign' ? `Manage assignment for ${name}` : 'Asset & Resource Management'}
                                </p>
                            </div>
                        </div>
                        <button className="close-x-btn" onClick={onClose}><X size={20} /></button>
                    </div>

                    <div className="modal-body">
                        {error && (
                            <div className="error-alert">
                                <AlertCircle size={16} />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="form-sections">
                            {/* Name Field */}
                            <div className="form-group">
                                <label>Resource Name</label>
                                <div className="search-wrapper">
                                    <div className="search-input-box">
                                        <Monitor size={18} className="search-icon-sm" />
                                        <input
                                            type="text"
                                            className="modern-input"
                                            placeholder="e.g. Dell XPS 15, Projector A1"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            readOnly={mode === 'assign'}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Details Field */}
                            <div className="form-group">
                                <label>Details / Description</label>
                                <div className="search-wrapper">
                                    <div className="search-input-box">
                                        <AlignLeft size={18} className="search-icon-sm" />
                                        <textarea
                                            className="modern-textarea"
                                            placeholder="Add details about specifications, location, service tag..."
                                            value={details}
                                            onChange={(e) => setDetails(e.target.value)}
                                            rows={3}
                                            readOnly={mode === 'assign'}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Assignment Field */}
                            <div className="form-group">
                                <label>Assign To (Staff/Role User)</label>
                                <div className="search-wrapper">
                                    <div className="search-input-box">
                                        <Search size={18} className="search-icon-sm" />
                                        <input
                                            type="text"
                                            className="modern-input"
                                            placeholder="Search user..."
                                            value={inchargeSearch}
                                            onChange={(e) => {
                                                setInchargeSearch(e.target.value);
                                                setShowFacultyDropdown(true);
                                            }}
                                            onFocus={() => setShowFacultyDropdown(true)}
                                        />
                                    </div>
                                </div>
                                <span className="field-helper">Person responsible for this asset.</span>

                                <AnimatePresence>
                                    {showFacultyDropdown && inchargeSearch && (
                                        <motion.div
                                            className="dropdown-panel"
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                        >
                                            {filteredUsers.length > 0 ? (
                                                filteredUsers.map(user => (
                                                    <div
                                                        key={user.id}
                                                        className={`dropdown-item ${selectedIncharge?.id === user.id ? 'selected' : ''}`}
                                                        onClick={() => {
                                                            setSelectedIncharge(user);
                                                            setInchargeSearch(user.name);
                                                            setShowFacultyDropdown(false);
                                                        }}
                                                    >
                                                        <div className="faculty-avatar">
                                                            {user.name.charAt(0)}
                                                        </div>
                                                        <div className="faculty-info">
                                                            <span className="fn-name">{user.name}</span>
                                                            <span className="fn-id">{user.reg_no} • {user.role}</span>
                                                        </div>
                                                        {selectedIncharge?.id === user.id && <Check size={16} className="check-icon" />}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="no-result p-3 text-sm text-slate-500 text-center">No users found.</div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {mode === 'assign' && (
                            <div className="info-guide">
                                <Info size={16} />
                                <p>Checking out this asset to a user makes them responsible for its safety and maintenance status.</p>
                            </div>
                        )}
                    </div>

                    <div className="modal-footer">
                        <button className="secondary-btn" onClick={onClose}>Discard</button>
                        <button
                            className="primary-btn"
                            onClick={handleSubmit}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="spinner-inline">...</div>
                            ) : (
                                <>
                                    <Check size={18} />
                                    <span>{mode === 'create' ? 'Create Resource' :
                                        mode === 'edit' ? 'Save Changes' : 'Confirm Assignment'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ResourceModal;
