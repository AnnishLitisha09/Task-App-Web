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
    const [facultySearch, setFacultySearch] = useState('');
    const [selectedFaculty, setSelectedFaculty] = useState<any>(null);
    const [facultyList, setFacultyList] = useState<any[]>([]);
    const [showFacultyDropdown, setShowFacultyDropdown] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isFacultyLoading, setIsFacultyLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (deptData) {
                setDeptName(deptData.name || '');
                if (deptData.hod_id) {
                    setSelectedFaculty({ id: deptData.hod_id, name: deptData.hod_name || deptData.hod?.name });
                    setFacultySearch(deptData.hod_name || deptData.hod?.name || '');
                } else {
                    setSelectedFaculty(null);
                    setFacultySearch('');
                }
            } else {
                setDeptName('');
                setSelectedFaculty(null);
                setFacultySearch('');
            }
            fetchFaculty();
        }
    }, [isOpen, deptData]);

    const fetchFaculty = async () => {
        setIsFacultyLoading(true);
        try {
            // Fetch users with faculty role for HOD selection
            const response = await api('/users/dashboard/all');
            const allUsers = Array.isArray(response) ? response : (response.users || []);
            const facultyUsers = allUsers.filter((u: any) => u.role === 'faculty');

            // Map to include info from nested info objects
            const simplifiedFaculty = facultyUsers.map((u: any) => {
                const info = u.faculty_info || {};
                return {
                    id: u.id,
                    name: info.name || 'Unknown Faculty',
                    reg_no: info.reg_no || 'N/A'
                };
            });
            setFacultyList(simplifiedFaculty);
        } catch (err) {
            console.error('Failed to fetch faculty:', err);
        } finally {
            setIsFacultyLoading(false);
        }
    };

    const filteredFaculty = facultyList.filter(f =>
        f.name.toLowerCase().includes(facultySearch.toLowerCase()) ||
        f.reg_no.toLowerCase().includes(facultySearch.toLowerCase())
    );

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
                        name: deptName,
                        hod_id: selectedFaculty?.id || null
                    }
                });
            } else if (mode === 'edit' || mode === 'assign') {
                await api(`/resources/departments/${deptData.id}`, {
                    method: 'PUT',
                    body: {
                        name: deptName,
                        hod_id: selectedFaculty?.id || null
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
                        <div className="header-title-box">
                            <div className="header-icon">
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
                        <button className="close-btn" onClick={onClose}><X size={20} /></button>
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
                                <div className={`input-with-icon ${mode === 'assign' ? 'readonly' : ''}`}>
                                    <Building2 size={18} className="field-icon" />
                                    <input
                                        type="text"
                                        placeholder="e.g. Computer Science and Engineering"
                                        value={deptName}
                                        onChange={(e) => setDeptName(e.target.value)}
                                        readOnly={mode === 'assign'}
                                    />
                                </div>
                                <span className="field-helper">
                                    {mode === 'assign' ? 'The department receiving a new authority figure.' : 'Official name for the institutional division.'}
                                </span>
                            </div>

                            {/* HOD Assignment */}
                            <div className="form-group">
                                <label>Headed By (HOD)</label>
                                <div className="input-with-icon searchable">
                                    <Search size={18} className="field-icon" />
                                    <input
                                        type="text"
                                        placeholder="Search faculty by name or ID..."
                                        value={facultySearch}
                                        onChange={(e) => {
                                            setFacultySearch(e.target.value);
                                            setShowFacultyDropdown(true);
                                        }}
                                        onFocus={() => setShowFacultyDropdown(true)}
                                    />
                                    {isFacultyLoading && <div className="spinner-mini"></div>}
                                </div>
                                <span className="field-helper">The primary authority figure for this department.</span>

                                <AnimatePresence>
                                    {showFacultyDropdown && facultySearch && (
                                        <motion.div
                                            className="faculty-dropdown"
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                        >
                                            {filteredFaculty.length > 0 ? (
                                                filteredFaculty.map(faculty => (
                                                    <div
                                                        key={faculty.id}
                                                        className={`faculty-option ${selectedFaculty?.id === faculty.id ? 'selected' : ''}`}
                                                        onClick={() => {
                                                            setSelectedFaculty(faculty);
                                                            setFacultySearch(faculty.name);
                                                            setShowFacultyDropdown(false);
                                                        }}
                                                    >
                                                        <div className="faculty-avatar">
                                                            {faculty.name.charAt(0)}
                                                        </div>
                                                        <div className="faculty-info">
                                                            <span className="fn-name">{faculty.name}</span>
                                                            <span className="fn-id">{faculty.reg_no}</span>
                                                        </div>
                                                        {selectedFaculty?.id === faculty.id && <Check size={16} className="check-icon" />}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="no-result">No faculty members found.</div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
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
                        <button className="cancel-pill" onClick={onClose}>Cancel</button>
                        <button
                            className="submit-pill"
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
