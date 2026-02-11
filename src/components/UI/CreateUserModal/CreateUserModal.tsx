import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Check, UserPlus, Search as SearchIcon, AlertCircle } from 'lucide-react';
import api from '../../../utils/api';
import './CreateUserModal.css';

interface CreateUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    isEdit?: boolean;
    userData?: any;
    onSuccess?: (data: any) => void;
    departments: any[];
    venues: any[];
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({
    isOpen, onClose, isEdit = false, userData = null, onSuccess,
    departments = [], venues = []
}) => {
    const [step, setStep] = useState(1);
    const [category, setCategory] = useState('');
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [advisorSearch, setAdvisorSearch] = useState('');
    const [showAdvisorDropdown, setShowAdvisorDropdown] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Field States for API
    const [regNo, setRegNo] = useState('');
    const [deptId, setDeptId] = useState<number | string>('');
    const [year, setYear] = useState<number | string>('');
    const [cgpa, setCgpa] = useState<number | string>('');
    const [score, setScore] = useState<number | string>(100);
    const [facultyId, setFacultyId] = useState<number | string>('');
    const [designation, setDesignation] = useState('');
    const [venueId, setVenueId] = useState<number | string>('');
    const [roleName, setRoleName] = useState('');
    const [facultyType, setFacultyType] = useState('Professor');

    // Mock Faculty List for Dropdown
    const facultyList = [
        { id: 'FAC101', name: 'Dr. John Wick' },
        { id: 'FAC102', name: 'Dr. Sarah Smith' },
        { id: 'FAC103', name: 'Prof. Robert Wilson' },
        { id: 'FAC104', name: 'Dr. Emily Brown' },
        { id: 'FAC105', name: 'Prof. Michael Chen' },
    ];

    const filteredFaculty = facultyList.filter(f =>
        f.name.toLowerCase().includes(advisorSearch.toLowerCase()) ||
        f.id.toLowerCase().includes(advisorSearch.toLowerCase())
    );

    // Pre-fill data when editing
    React.useEffect(() => {
        if (isEdit && userData && isOpen) {
            const role = userData.role || userData.category || '';
            setCategory(role);
            if (role) setStep(2); // Auto-advance to fields if editing

            setEmail(userData.email || '');
            setFullName(userData.name || '');
            setRegNo(userData.reg_no || userData.regNo || '');
            setDeptId(userData.department_id || '');
            setYear(userData.year || '');
            setCgpa(userData.c_gpa || userData.cgpa || '');
            setScore(userData.score || userData.credit_score || 100);
            setFacultyId(userData.faculty_id || '');
            setDesignation(userData.designation || '');
            setVenueId(userData.venue_id || '');
            setRoleName(userData.role_assignments?.[0]?.role || userData.roleName || '');
            setFacultyType(userData.type || userData.faculty_type || 'Professor');

            if (userData.faculty_info?.name || userData.advisor_name) {
                setAdvisorSearch(`${userData.faculty_info?.name || userData.advisor_name} (${userData.faculty_id})`);
            }
        } else if (!isOpen) {
            resetForm();
        }
    }, [isEdit, userData, isOpen]);

    const resetForm = () => {
        setStep(1);
        setCategory('');
        setEmail('');
        setFullName('');
        setRegNo('');
        setDeptId('');
        setYear('');
        setCgpa('');
        setScore(100);
        setFacultyId('');
        setDesignation('');
        setVenueId('');
        setRoleName('');
        setAdvisorSearch('');
        setError('');
    };

    const handleFinalize = async () => {
        setIsLoading(true);
        setError('');

        // Validation for department_id
        const isDepartmentRequired = ['student', 'faculty', 'role-user'].includes(category);
        const isDeptEmpty = deptId === '' || deptId === null || deptId === undefined;

        if (isDepartmentRequired && isDeptEmpty) {
            setError('Please Select a Department');
            setIsLoading(false);
            return;
        }

        try {
            let endpoint = '';
            let payload: any = {
                name: fullName,
                email: email,
                category: category
            };

            // STRICT PARSING: Ensure we only send numbers to the backend for ID fields
            const parseId = (val: any) => {
                if (val === '' || val === null || val === undefined) return null;
                const num = Number(val);
                return isNaN(num) ? null : num;
            };

            const parsedDeptId = parseId(deptId);
            const parsedVenueId = parseId(venueId);

            console.log('Submission Payload Analysis:', {
                category,
                rawDept: deptId,
                parsedDept: parsedDeptId,
                rawVenue: venueId,
                parsedVenue: parsedVenueId
            });

            switch (category) {
                case 'student':
                    endpoint = '/users/student';
                    payload = {
                        ...payload,
                        reg_no: regNo,
                        department_id: parsedDeptId,
                        year: Number(year),
                        cgpa: Number(cgpa) || 0,
                        credit_score: Number(score),
                        faculty_id: facultyId ? Number(facultyId) : null
                    };
                    break;
                case 'faculty':
                    endpoint = '/users/faculty';
                    payload = {
                        ...payload,
                        reg_no: regNo,
                        department_id: parsedDeptId,
                        faculty_type: facultyType
                    };
                    break;
                case 'staff':
                    endpoint = '/users/staff';
                    payload = {
                        ...payload,
                        reg_no: regNo || undefined,
                        designation: designation
                    };
                    break;
                case 'role-user':
                    endpoint = '/users/role-user';
                    payload = {
                        ...payload,
                        roleName: roleName,
                        department_id: parsedDeptId,
                        venue_id: parsedVenueId
                    };
                    break;
                default:
                    throw new Error('Please select a valid category');
            }

            const newUser = await api(endpoint, {
                method: 'POST',
                body: payload
            });

            if (onSuccess) onSuccess(newUser);
            onClose();
        } catch (err: any) {
            console.error('Submission error:', err);
            setError(err.message || 'Operation failed');
        } finally {
            setIsLoading(false);
        }
    };

    const renderCategoryFields = () => {
        switch (category) {
            case 'student':
                return (
                    <div className="input-grid">
                        <div className="input-group">
                            <label>Institutional Email</label>
                            <input type="email" value={email} readOnly className="modern-input readonly-field" />
                        </div>
                        <div className="input-group">
                            <label>Registration No</label>
                            <input type="text" placeholder="2024CS101" value={regNo} onChange={e => setRegNo(e.target.value)} className="modern-input" />
                        </div>
                        <div className="input-group">
                            <label>Full Name</label>
                            <input type="text" placeholder="Enter student's full name" value={fullName} onChange={e => setFullName(e.target.value)} className="modern-input" />
                        </div>
                        <div className="input-group">
                            <label>Department</label>
                            <select value={deptId} onChange={e => setDeptId(e.target.value)} className="modern-select">
                                <option value="">Select Department</option>
                                {departments.map(d => (
                                    <option key={d.id || d.department_id || d.departmentId} value={d.id || d.department_id || d.departmentId}>
                                        {d.name || d.department_name || d.departmentName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Current Year</label>
                            <select value={year} onChange={e => setYear(e.target.value)} className="modern-select">
                                <option value="">Select Year</option>
                                {[1, 2, 3, 4].map(y => <option key={y} value={y}>{y}st Year</option>)}
                            </select>
                        </div>
                        <div className="input-group">
                            <label>CGPA</label>
                            <input type="number" step="0.01" value={cgpa} onChange={e => setCgpa(e.target.value)} className="modern-input" />
                        </div>
                        <div className="input-group">
                            <label>Faculty Advisor</label>
                            <div className="search-wrapper">
                                <div className="search-input-box">
                                    <SearchIcon size={14} className="search-icon-sm" />
                                    <input
                                        type="text"
                                        placeholder="Search faculty..."
                                        value={advisorSearch}
                                        onChange={e => { setAdvisorSearch(e.target.value); setShowAdvisorDropdown(true); }}
                                        onFocus={() => setShowAdvisorDropdown(true)}
                                        className="modern-input"
                                    />
                                </div>
                                {showAdvisorDropdown && (
                                    <div className="dropdown-panel">
                                        {filteredFaculty.map(f => (
                                            <div key={f.id} className="dropdown-item" onClick={() => { setFacultyId(f.id); setAdvisorSearch(`${f.name} (${f.id})`); setShowAdvisorDropdown(false); }}>
                                                <span className="item-name">{f.name}</span>
                                                <span className="item-id">{f.id}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            case 'faculty':
                return (
                    <div className="input-grid">
                        <div className="input-group">
                            <label>Institutional Email</label>
                            <input type="email" value={email} readOnly className="modern-input readonly-field" />
                        </div>
                        <div className="input-group">
                            <label>Employee ID</label>
                            <input type="text" placeholder="FAC501" value={regNo} onChange={e => setRegNo(e.target.value)} className="modern-input" />
                        </div>
                        <div className="input-group">
                            <label>Full Name</label>
                            <input type="text" placeholder="Enter full name" value={fullName} onChange={e => setFullName(e.target.value)} className="modern-input" />
                        </div>
                        <div className="input-group">
                            <label>Faculty Type</label>
                            <select value={facultyType} onChange={e => setFacultyType(e.target.value)} className="modern-select">
                                {['Professor', 'Associate Professor', 'Assistant Professor', 'Guest Faculty'].map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Department</label>
                            <select value={deptId} onChange={e => setDeptId(e.target.value)} className="modern-select">
                                <option value="">Select Department</option>
                                {departments.map(d => (
                                    <option key={d.id || d.department_id || d.departmentId} value={d.id || d.department_id || d.departmentId}>
                                        {d.name || d.department_name || d.departmentName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                );
            case 'staff':
                return (
                    <div className="input-grid">
                        <div className="input-group">
                            <label>Email Address</label>
                            <input type="email" value={email} readOnly className="modern-input readonly-field" />
                        </div>
                        <div className="input-group">
                            <label>Staff ID</label>
                            <input type="text" value={regNo} onChange={e => setRegNo(e.target.value)} className="modern-input" />
                        </div>
                        <div className="input-group">
                            <label>Full Name</label>
                            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="modern-input" />
                        </div>
                        <div className="input-group">
                            <label>Designation</label>
                            <input type="text" value={designation} onChange={e => setDesignation(e.target.value)} className="modern-input" />
                        </div>
                    </div>
                );
            case 'role-user':
                return (
                    <div className="input-grid">
                        <div className="input-group">
                            <label>Authority Name</label>
                            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="modern-input" />
                        </div>
                        <div className="input-group">
                            <label>Role</label>
                            <select value={roleName} onChange={e => setRoleName(e.target.value)} className="modern-select">
                                <option value="">Select Role</option>
                                {['HOD', 'PRINCIPAL', 'LIBRARY_INCHARGE', 'DIRECTOR'].map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Department (Optional)</label>
                            <select value={deptId} onChange={e => setDeptId(e.target.value)} className="modern-select">
                                <option value="">None</option>
                                {departments.map(d => (
                                    <option key={d.id || d.department_id || d.departmentId} value={d.id || d.department_id || d.departmentId}>
                                        {d.name || d.department_name || d.departmentName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Venue (Optional)</label>
                            <select value={venueId} onChange={e => setVenueId(e.target.value)} className="modern-select">
                                <option value="">None</option>
                                {venues.map(v => (
                                    <option key={v.id || v.venue_id || v.venueId} value={v.id || v.venue_id || v.venueId}>
                                        {v.name || v.venue_name || v.venueName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                );
            default:
                return <div className="no-items">Please select a user category in Step 1 to continue</div>;
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="modal-overlay">
                    <div className="modal-card">
                        <div className="modal-header">
                            <div className="header-info">
                                <div className="icon-badge">
                                    <UserPlus size={20} />
                                </div>
                                <div>
                                    <h2>{isEdit ? 'Edit User Profile' : 'Create New User'}</h2>
                                    <p>{isEdit ? 'Institutional Access' : 'New Account Setup'}</p>
                                </div>
                            </div>
                            <button className="close-x-btn" onClick={onClose} aria-label="Close modal">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="step-tracker">
                            <div className={`step-item ${step >= 1 ? 'active' : ''}`}>
                                <div className="step-circle">{step > 1 ? <Check size={14} /> : '1'}</div>
                                <span>Basic Details</span>
                            </div>
                            <div className={`step-connector ${step > 1 ? 'active' : ''}`}></div>
                            <div className={`step-item ${step === 2 ? 'active' : ''}`}>
                                <div className="step-circle">2</div>
                                <span>Specific Info</span>
                            </div>
                        </div>

                        <div className="modal-body-scroll">
                            <AnimatePresence mode="wait">
                                {step === 1 ? (
                                    <motion.div
                                        key="step1"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        className="form-container"
                                    >
                                        <div className="form-section">
                                            <span className="form-section-title">Identity</span>
                                            <div className="input-group">
                                                <label>Institutional Email</label>
                                                <input
                                                    type="email"
                                                    placeholder="user@inst.edu"
                                                    value={email}
                                                    onChange={e => setEmail(e.target.value)}
                                                    readOnly={isEdit}
                                                    className={`modern-input ${isEdit ? 'readonly-field' : ''}`}
                                                />
                                            </div>
                                        </div>

                                        <div className="form-section">
                                            <span className="form-section-title">Account Type</span>
                                            <div className="input-group">
                                                <label>User Category</label>
                                                <select
                                                    value={category}
                                                    onChange={e => setCategory(e.target.value)}
                                                    className="modern-select"
                                                    disabled={isEdit}
                                                >
                                                    <option value="">-- Choose Category --</option>
                                                    <option value="student">Student</option>
                                                    <option value="faculty">Faculty</option>
                                                    <option value="staff">Staff</option>
                                                    <option value="role-user">Authority</option>
                                                </select>
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="step2"
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className="form-container"
                                    >
                                        {renderCategoryFields()}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="modal-footer">
                            <div className="error-container">
                                {error && (
                                    <div className="error-alert">
                                        <AlertCircle size={14} />
                                        <span>{error}</span>
                                    </div>
                                )}
                            </div>

                            <div className="footer-actions">
                                <button className="secondary-btn" onClick={step === 1 ? onClose : () => setStep(1)} disabled={isLoading}>
                                    {step === 1 ? 'Cancel' : 'Back'}
                                </button>
                                <button
                                    className="primary-btn"
                                    onClick={step === 1 ? () => setStep(2) : handleFinalize}
                                    disabled={isLoading || (step === 1 && (!category || !email))}
                                >
                                    {isLoading ? 'Wait...' : (
                                        <>
                                            {step === 1 ? 'Next' : (isEdit ? 'Save' : 'Create')}
                                            {step === 1 && <ChevronRight size={16} />}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CreateUserModal;