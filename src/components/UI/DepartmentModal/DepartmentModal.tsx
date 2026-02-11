import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, UserPlus, Check, Search, AlertCircle, Info } from 'lucide-react';
import api from '../../../utils/api';
import './DepartmentModal.css';

interface DepartmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    deptData?: any;
    mode: 'create' | 'edit' | 'assign';
    onSuccess: () => void;
}

const DepartmentModal: React.FC<DepartmentModalProps> = ({
    isOpen, onClose, deptData, mode, onSuccess
}) => {
    const [deptName, setDeptName] = useState('');
    const [selectedFaculty, setSelectedFaculty] = useState<any>(null);
    const [facultyList, setFacultyList] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFacultyLoading, setIsFacultyLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (deptData) {
                setDeptName(deptData.name || '');
                const hid = deptData.user_id || deptData.hod?.id || deptData.hod?.user_id;
                if (hid) {
                    setSelectedFaculty({ id: hid, name: deptData.hod_name || deptData.hod?.name });
                } else {
                    setSelectedFaculty(null);
                }
            } else {
                setDeptName('');
                setSelectedFaculty(null);
            }
            fetchFaculty();
        }
    }, [isOpen, deptData]);

    const fetchFaculty = async () => {
        setIsFacultyLoading(true);
        try {
            // Fetch users with HOD role for selection
            const response = await api('/users/hods');
            const hodsList = Array.isArray(response) ? response : (response.hods || []);

            // Map to simplified format for dropdown
            const simplifiedFaculty = hodsList.map((h: any) => ({
                id: h.id || h.user_id,
                name: h.name || 'Unknown HOD',
                reg_no: h.department_name || 'HOD'
            }));
            setFacultyList(simplifiedFaculty);
        } catch (err) {
            console.error('Failed to fetch hods:', err);
        } finally {
            setIsFacultyLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!deptName && mode !== 'assign') {
            setError('Department name is required');
            return;
        }

        setIsLoading(true);
        setError('');
        try {
            if (mode === 'create') {
                await api('/resources/departments', {
                    method: 'POST',
                    body: {
                        name: deptName
                    }
                });
            } else if (mode === 'edit' || mode === 'assign') {
                const did = deptData.id || deptData.department_id;
                await api(`/resources/departments/${did}`, {
                    method: 'PUT',
                    body: {
                        name: deptName,
                        user_id: selectedFaculty?.id || null
                    }
                });
            }
            onSuccess();
        } catch (err: any) {
            setError(err.message || 'Operation failed');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="modal-overlay">
                <motion.div
                    className="dept-modal"
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                >
                    <div className="modal-header">
                        <div className="header-info">
                            <div className="icon-badge">
                                {mode === 'assign' ? <UserPlus size={20} /> : <Building2 size={20} />}
                            </div>
                            <div>
                                <h2>
                                    {mode === 'create' ? 'Create New Department' :
                                        mode === 'edit' ? 'Edit Department' : 'Assign HOD'}
                                </h2>
                                <p className="header-subtitle">
                                    {mode === 'assign' ? `Selecting Authority for ${deptName}` : 'Manage institutional structures'}
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
                            {/* Dept Name - Visible in all modes, editable in create/edit */}
                            <div className="form-group">
                                <label>Department Name</label>
                                <div className={`search-wrapper ${mode === 'assign' ? 'readonly' : ''}`}>
                                    <div className="search-input-box">
                                        <Building2 size={18} className="search-icon-sm" />
                                        <input
                                            type="text"
                                            className={`modern-input ${mode === 'assign' ? 'readonly-field' : ''}`}
                                            placeholder="e.g. Computer Science and Engineering"
                                            value={deptName}
                                            onChange={(e) => setDeptName(e.target.value)}
                                            readOnly={mode === 'assign'}
                                        />
                                    </div>
                                </div>
                                <span className="field-helper">
                                    {mode === 'assign' ? 'The department receiving a new authority figure.' : 'Official name for the institutional division.'}
                                </span>
                            </div>

                            {/* HOD Assignment */}
                            <div className="form-group">
                                <label>Headed By (HOD)</label>
                                <div className="search-wrapper">
                                    <div className="search-input-box">
                                        <select
                                            className="modern-select"
                                            value={selectedFaculty?.id?.toString() || ''}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                const faculty = facultyList.find(f => f.id.toString() === val);
                                                setSelectedFaculty(faculty || null);
                                            }}
                                        >
                                            <option value="">Select HOD...</option>
                                            {facultyList.map(faculty => (
                                                <option key={faculty.id} value={faculty.id.toString()}>
                                                    {faculty.name} ({faculty.reg_no})
                                                </option>
                                            ))}
                                        </select>
                                        {isFacultyLoading && <div className="spinner-mini"></div>}
                                    </div>
                                </div>
                                <span className="field-helper">The primary authority figure for this department.</span>

                            </div>
                        </div>

                        {mode === 'assign' && (
                            <div className="info-guide">
                                <Info size={16} />
                                <p>Assigning an HOD grants that user management privileges over this department's resources and staff.</p>
                            </div>
                        )}
                    </div>

                    <div className="modal-footer">
                        <button className="secondary-btn" onClick={onClose}>Cancel</button>
                        <button
                            className="primary-btn"
                            onClick={handleSubmit}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="spinner-inline"></div>
                            ) : (
                                <>
                                    <Check size={18} />
                                    <span>{mode === 'create' ? 'Create Department' :
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

export default DepartmentModal;
