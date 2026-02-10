import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Check, UserPlus, Search as SearchIcon } from 'lucide-react';
import './CreateUserModal.css';

interface CreateUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    isEdit?: boolean;
    userData?: any;
    onSuccess?: (data: any) => void;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onClose, isEdit = false, userData = null, onSuccess }) => {
    const [step, setStep] = useState(1);
    const [category, setCategory] = useState('');
    const [email, setEmail] = useState('');
    const [roleUserScope, setRoleUserScope] = useState('');
    const [fullName, setFullName] = useState('');
    const [advisor, setAdvisor] = useState('');
    const [advisorSearch, setAdvisorSearch] = useState('');
    const [showAdvisorDropdown, setShowAdvisorDropdown] = useState(false);

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
            setCategory(userData.category || '');
            setEmail(userData.email || '');
            setFullName(userData.name || '');
            setRoleUserScope(userData.scope || '');
            setAdvisor(userData.advisor || '');
            setStep(userData.step || 1);
        } else if (!isOpen) {
            // Reset on close
            setStep(1);
            setCategory('');
            setEmail('');
            setFullName('');
            setRoleUserScope('');
            setAdvisor('');
            setAdvisorSearch('');
            setShowAdvisorDropdown(false);
        }
    }, [isEdit, userData, isOpen]);

    // Field switch logic
    const renderCategoryFields = () => {
        switch (category) {
            case 'student':
                return (
                    <>
                        <div className="input-group">
                            <label>Institutional Email</label>
                            <input type="email" value={email} readOnly className="modern-input readonly-field" />
                        </div>
                        <div className="input-group">
                            <label>Registration No (Reg_no)</label>
                            <input type="text" placeholder="e.g. 2024CS101" required defaultValue={isEdit ? userData?.regNo : ''} />
                        </div>
                        <div className="input-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                placeholder="Enter student's full name"
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />
                        </div>
                        <div className="input-group">
                            <label>Department</label>
                            <select required defaultValue={isEdit ? userData?.dept?.toLowerCase() : ''}>
                                <option value="">Select Department</option>
                                <option value="cse">Computer Science</option>
                                <option value="ece">Electronics</option>
                                <option value="mech">Mechanical</option>
                                <option value="biotech">Biotechnology</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Current Year</label>
                            <select required defaultValue={isEdit ? userData?.year : ''}>
                                <option value="">Select Year</option>
                                <option value="1">1st Year</option>
                                <option value="2">2nd Year</option>
                                <option value="3">3rd Year</option>
                                <option value="4">4th Year</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Current C.GPA (Optional)</label>
                            <input type="text" placeholder="e.g. 8.5" defaultValue={isEdit ? userData?.score : ''} />
                        </div>
                        <div className="input-group">
                            <label>Faculty Advisor</label>
                            <div className="searchable-dropdown-wrapper">
                                <div className="search-input-box">
                                    <SearchIcon size={14} className="search-icon-sm" />
                                    <input
                                        type="text"
                                        placeholder="Search faculty name or ID..."
                                        value={advisorSearch}
                                        onChange={(e) => {
                                            setAdvisorSearch(e.target.value);
                                            setShowAdvisorDropdown(true);
                                        }}
                                        onFocus={() => setShowAdvisorDropdown(true)}
                                    />
                                </div>

                                {showAdvisorDropdown && (
                                    <div className="dropdown-panel">
                                        {filteredFaculty.length > 0 ? (
                                            filteredFaculty.map(f => (
                                                <div
                                                    key={f.id}
                                                    className={`dropdown-item ${advisor === `${f.name} (${f.id})` ? 'selected' : ''}`}
                                                    onClick={() => {
                                                        setAdvisor(`${f.name} (${f.id})`);
                                                        setAdvisorSearch(`${f.name} (${f.id})`);
                                                        setShowAdvisorDropdown(false);
                                                    }}
                                                >
                                                    <div className="item-name">{f.name}</div>
                                                    <div className="item-id">{f.id}</div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="no-items">No faculty found</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                );
            case 'faculty':
                return (
                    <>
                        <div className="input-group">
                            <label>Institutional Email</label>
                            <input type="email" value={email} readOnly className="modern-input readonly-field" />
                        </div>
                        <div className="input-group">
                            <label>Employee ID / Reg_no</label>
                            <input type="text" placeholder="e.g. FAC501" required defaultValue={isEdit ? userData?.regNo : ''} />
                        </div>
                        <div className="input-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                placeholder="Enter professor's full name"
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />
                        </div>
                        <div className="input-group">
                            <label>Department</label>
                            <select required defaultValue={isEdit ? userData?.dept?.toLowerCase() : ''}>
                                <option value="">Select Department</option>
                                <option value="cse">Computer Science</option>
                                <option value="ece">Electronics</option>
                                <option value="mech">Mechanical</option>
                                <option value="biotech">Biotechnology</option>
                            </select>
                        </div>
                    </>
                );
            case 'staff':
                return (
                    <>
                        <div className="input-group">
                            <label>Institutional Email</label>
                            <input type="email" value={email} readOnly className="modern-input readonly-field" />
                        </div>
                        <div className="input-group">
                            <label>Staff ID</label>
                            <input type="text" placeholder="e.g. STF201" required defaultValue={isEdit ? userData?.regNo : ''} />
                        </div>
                        <div className="input-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                placeholder="Enter staff name"
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />
                        </div>
                        <div className="input-group">
                            <label>Designation</label>
                            <select required defaultValue={isEdit ? userData?.designation : ''}>
                                <option value="">Select Designation</option>
                                <option value="transport">Transport</option>
                                <option value="cleaning">Cleaning</option>
                                <option value="nmc">NMC</option>
                            </select>
                        </div>
                    </>
                );
            case 'role-user':
                return (
                    <>
                        <div className="input-group">
                            <label>Institutional Email</label>
                            <input type="email" value={email} readOnly className="modern-input readonly-field" />
                        </div>
                        <div className="input-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                placeholder="Enter authority's name"
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />
                        </div>
                        <div className="input-group">
                            <label>Role</label>
                            <select required defaultValue={isEdit ? userData?.role : ''}>
                                <option value="">Select Role</option>
                                <option value="principal">Principal</option>
                                <option value="hod">HOD</option>
                                <option value="incharge">Incharge</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Scope</label>
                            <select
                                value={roleUserScope}
                                onChange={(e) => setRoleUserScope(e.target.value)}
                                required
                            >
                                <option value="">Select Scope</option>
                                <option value="institution">Institution</option>
                                <option value="department">Department</option>
                                <option value="infrastructure">Infrastructure</option>
                            </select>
                        </div>

                        {(roleUserScope === 'department' || (isEdit && userData?.scope === 'department')) && (
                            <div className="input-group">
                                <label>Target Department (Optional)</label>
                                <select defaultValue={isEdit ? userData?.dept?.toLowerCase() : ''}>
                                    <option value="">Select Department</option>
                                    <option value="cse">Computer Science</option>
                                    <option value="ece">Electronics</option>
                                    <option value="mech">Mechanical</option>
                                </select>
                            </div>
                        )}

                        {(roleUserScope === 'infrastructure' || (isEdit && userData?.scope === 'infrastructure')) && (
                            <div className="input-group">
                                <label>Target Venue (Optional)</label>
                                <select defaultValue={isEdit ? userData?.venue : ''}>
                                    <option value="">Select Venue</option>
                                    <option value="main_auditorium">Main Auditorium</option>
                                    <option value="seminar_hall_1">Seminar Hall 1</option>
                                    <option value="it_lab_1">IT Lab 1</option>
                                </select>
                            </div>
                        )}
                    </>
                );
            default:
                return <div className="selection-hint-box"><p>Please select a user category in Step 1 to continue</p></div>;
        }
    };

    const handleFinalize = () => {
        if (onSuccess) {
            onSuccess({
                ...userData,
                name: fullName,
                email,
                category,
                scope: roleUserScope,
                advisor
            });
        }
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="modal-overlay">
                    <motion.div
                        className="modal-card"
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    >
                        <div className="modal-header">
                            <div className="header-info">
                                <div className="icon-badge">
                                    <UserPlus size={20} />
                                </div>
                                <div>
                                    <h2>{isEdit ? 'Edit User Profile' : 'Create New User'}</h2>
                                    <p>{isEdit ? 'Update Institutional Details' : 'Institutional Profile Setup'}</p>
                                </div>
                            </div>
                            <button className="close-x-btn" onClick={onClose} aria-label="Close modal">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="step-tracker">
                            <div className={`step-item ${step >= 1 ? 'active' : ''}`}>
                                <div className="step-circle">{step > 1 ? <Check size={14} /> : '1'}</div>
                                <span>{isEdit ? 'Verify Account' : 'Auth Setup'}</span>
                            </div>
                            <div className={`step-connector ${step > 1 ? 'active' : ''}`}></div>
                            <div className={`step-item ${step === 2 ? 'active' : ''}`}>
                                <div className="step-circle">2</div>
                                <span>Profile Details</span>
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
                                            <label className="group-label">Identification</label>
                                            <div className="input-group">
                                                <label>Institutional Email</label>
                                                <input
                                                    type="email"
                                                    placeholder="user@institution.edu"
                                                    className="modern-input"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    readOnly={isEdit}
                                                />
                                            </div>
                                        </div>

                                        <div className="form-section">
                                            <label className="group-label">Account Classification</label>
                                            <div className="input-group">
                                                <label>User Category</label>
                                                <select
                                                    value={category}
                                                    onChange={(e) => setCategory(e.target.value)}
                                                    required
                                                    className="modern-select"
                                                    disabled={isEdit}
                                                >
                                                    <option value="">-- Choose Category --</option>
                                                    <option value="student">Student</option>
                                                    <option value="faculty">Faculty Member</option>
                                                    <option value="staff">Institutional Staff</option>
                                                    <option value="role-user">Role-Based Admin</option>
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
                                        <div className="category-header">
                                            <span className="category-tag">{category.replace('-', ' ').toUpperCase()}</span>
                                            <h3>{isEdit ? 'Update Information' : 'Additional Information'}</h3>
                                        </div>
                                        <div className="dynamic-form-grid">
                                            {renderCategoryFields()}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="modal-action-bar">
                            <div className="action-left">
                                {step === 2 && (
                                    <button className="back-link-btn" onClick={() => setStep(1)}>
                                        Modify Step 1
                                    </button>
                                )}
                            </div>
                            <div className="action-right">
                                <button className="modal-cancel-btn" onClick={onClose}>Cancel</button>
                                <button
                                    className="modal-submit-btn"
                                    onClick={() => step === 1 ? setStep(2) : handleFinalize()}
                                    disabled={step === 1 && !category}
                                >
                                    {step === 1 ? 'Continue' : (isEdit ? 'Update User' : 'Create User')}
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CreateUserModal;