import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Check, UserPlus, Search as SearchIcon, AlertCircle } from 'lucide-react';
import api from '../../../utils/api';
// import './CreateUserModal.css';

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
    const [isFetchingFaculty, setIsFetchingFaculty] = useState(false);
    const [error, setError] = useState('');
    const [facultyList, setFacultyList] = useState<{ id: string | number; name: string }[]>([]);

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

    // Fetch Faculty List
    useEffect(() => {
        if (isOpen) {
            fetchFaculty();
        }
    }, [isOpen]);

    const fetchFaculty = async () => {
        setIsFetchingFaculty(true);
        try {
            const response = await api('/users/dashboard/all');
            if (response?.users) {
                const faculty = response.users
                    .filter((u: any) => u.role === 'faculty')
                    .map((u: any) => ({
                        id: u.faculty_info?.faculty_id || u.faculty_info?.id || u.id,
                        name: u.faculty_info?.name || 'Unknown Faculty'
                    }));
                setFacultyList(faculty);
            }
        } catch (err) {
            console.error('Failed to fetch faculty list:', err);
        } finally {
            setIsFetchingFaculty(false);
        }
    };

    const filteredFaculty = facultyList.filter(f =>
        f.name.toLowerCase().includes(advisorSearch.toLowerCase()) ||
        String(f.id).toLowerCase().includes(advisorSearch.toLowerCase())
    );

    // Pre-fill data when editing
    useEffect(() => {
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
        const inputGridClasses = "grid grid-cols-1 md:grid-cols-2 gap-4 gap-y-5";
        const inputGroupClasses = "flex flex-col gap-1.5";
        const labelClasses = "text-[0.85rem] font-bold text-slate-700";
        const inputClasses = "w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[0.9rem] outline-none transition-all focus:border-indigo-500 focus:shadow-[0_0_0_4px_rgba(99,102,241,0.1)] placeholder:text-slate-400";
        const selectClasses = "w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[0.9rem] outline-none transition-all focus:border-indigo-500 focus:shadow-[0_0_0_4px_rgba(99,102,241,0.1)] appearance-none cursor-pointer placeholder:text-slate-400";
        const readonlyClasses = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[0.9rem] outline-none text-slate-500 cursor-not-allowed";

        switch (category) {
            case 'student':
                return (
                    <div className={inputGridClasses}>
                        <div className={inputGroupClasses}>
                            <label className={labelClasses}>Institutional Email</label>
                            <input type="email" value={email} readOnly className={readonlyClasses} />
                        </div>
                        <div className={inputGroupClasses}>
                            <label className={labelClasses}>Registration No</label>
                            <input type="text" placeholder="2024CS101" value={regNo} onChange={e => setRegNo(e.target.value)} className={inputClasses} />
                        </div>
                        <div className={inputGroupClasses}>
                            <label className={labelClasses}>Full Name</label>
                            <input type="text" placeholder="Enter student's full name" value={fullName} onChange={e => setFullName(e.target.value)} className={inputClasses} />
                        </div>
                        <div className={inputGroupClasses}>
                            <label className={labelClasses}>Department</label>
                            <select value={deptId} onChange={e => setDeptId(e.target.value)} className={selectClasses}>
                                <option value="">Select Department</option>
                                {departments.map(d => (
                                    <option key={d.id || d.department_id || d.departmentId} value={d.id || d.department_id || d.departmentId}>
                                        {d.name || d.department_name || d.departmentName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className={inputGroupClasses}>
                            <label className={labelClasses}>Current Year</label>
                            <select value={year} onChange={e => setYear(e.target.value)} className={selectClasses}>
                                <option value="">Select Year</option>
                                {[1, 2, 3, 4].map(y => <option key={y} value={y}>{y}st Year</option>)}
                            </select>
                        </div>
                        <div className={inputGroupClasses}>
                            <label className={labelClasses}>CGPA</label>
                            <input type="number" step="0.01" value={cgpa} onChange={e => setCgpa(e.target.value)} className={inputClasses} />
                        </div>
                        <div className={inputGroupClasses}>
                            <label className={labelClasses}>Faculty Advisor</label>
                            <div className="relative">
                                <div className="relative">
                                    <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search faculty..."
                                        value={advisorSearch}
                                        onChange={e => { setAdvisorSearch(e.target.value); setShowAdvisorDropdown(true); }}
                                        onFocus={() => setShowAdvisorDropdown(true)}
                                        className={`${inputClasses} pl-9`}
                                    />
                                </div>
                                {showAdvisorDropdown && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto">
                                        {isFetchingFaculty ? (
                                            <div className="p-4 text-sm text-slate-500 text-center">Fetching faculty...</div>
                                        ) : filteredFaculty.length > 0 ? (
                                            filteredFaculty.map(f => (
                                                <div key={f.id} className="px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 cursor-pointer flex justify-between items-center transition-colors" onClick={() => { setFacultyId(f.id); setAdvisorSearch(`${f.name} (${f.id})`); setShowAdvisorDropdown(false); }}>
                                                    <span className="font-medium text-slate-700">{f.name}</span>
                                                    <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md font-mono">{f.id}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-4 text-sm text-slate-500 text-center">No faculty found</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            case 'faculty':
                return (
                    <div className={inputGridClasses}>
                        <div className={inputGroupClasses}>
                            <label className={labelClasses}>Institutional Email</label>
                            <input type="email" value={email} readOnly className={readonlyClasses} />
                        </div>
                        <div className={inputGroupClasses}>
                            <label className={labelClasses}>Employee ID</label>
                            <input type="text" placeholder="FAC501" value={regNo} onChange={e => setRegNo(e.target.value)} className={inputClasses} />
                        </div>
                        <div className={inputGroupClasses}>
                            <label className={labelClasses}>Full Name</label>
                            <input type="text" placeholder="Enter full name" value={fullName} onChange={e => setFullName(e.target.value)} className={inputClasses} />
                        </div>
                        <div className={inputGroupClasses}>
                            <label className={labelClasses}>Faculty Type</label>
                            <select value={facultyType} onChange={e => setFacultyType(e.target.value)} className={selectClasses}>
                                {['Professor', 'Associate Professor', 'Assistant Professor', 'Guest Faculty'].map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className={inputGroupClasses}>
                            <label className={labelClasses}>Department</label>
                            <select value={deptId} onChange={e => setDeptId(e.target.value)} className={selectClasses}>
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
                    <div className={inputGridClasses}>
                        <div className={inputGroupClasses}>
                            <label className={labelClasses}>Email Address</label>
                            <input type="email" value={email} readOnly className={readonlyClasses} />
                        </div>
                        <div className={inputGroupClasses}>
                            <label className={labelClasses}>Staff ID</label>
                            <input type="text" value={regNo} onChange={e => setRegNo(e.target.value)} className={inputClasses} />
                        </div>
                        <div className={inputGroupClasses}>
                            <label className={labelClasses}>Full Name</label>
                            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className={inputClasses} />
                        </div>
                        <div className={inputGroupClasses}>
                            <label className={labelClasses}>Designation</label>
                            <input type="text" value={designation} onChange={e => setDesignation(e.target.value)} className={inputClasses} />
                        </div>
                    </div>
                );
            case 'role-user':
                return (
                    <div className={inputGridClasses}>
                        <div className={inputGroupClasses}>
                            <label className={labelClasses}>Authority Name</label>
                            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className={inputClasses} />
                        </div>
                        <div className={inputGroupClasses}>
                            <label className={labelClasses}>Role</label>
                            <select value={roleName} onChange={e => setRoleName(e.target.value)} className={selectClasses}>
                                <option value="">Select Role</option>
                                {['HOD', 'PRINCIPAL', 'LIBRARY_INCHARGE', 'DIRECTOR'].map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        <div className={inputGroupClasses}>
                            <label className={labelClasses}>Department (Optional)</label>
                            <select value={deptId} onChange={e => setDeptId(e.target.value)} className={selectClasses}>
                                <option value="">None</option>
                                {departments.map(d => (
                                    <option key={d.id || d.department_id || d.departmentId} value={d.id || d.department_id || d.departmentId}>
                                        {d.name || d.department_name || d.departmentName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className={inputGroupClasses}>
                            <label className={labelClasses}>Venue (Optional)</label>
                            <select value={venueId} onChange={e => setVenueId(e.target.value)} className={selectClasses}>
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
                return <div className="text-center py-12 text-slate-500">Please select a user category in Step 1 to continue</div>;
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white z-10 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center">
                                    <UserPlus size={20} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800 m-0 leading-tight">{isEdit ? 'Edit User Profile' : 'Create New User'}</h2>
                                    <p className="text-sm text-slate-500 m-0 mt-0.5">{isEdit ? 'Institutional Access' : 'New Account Setup'}</p>
                                </div>
                            </div>
                            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors" onClick={onClose} aria-label="Close modal">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex items-center gap-2 px-6 py-4 bg-slate-50 border-b border-slate-100 shrink-0">
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${step >= 1 ? 'text-indigo-600 bg-white shadow-sm' : 'text-slate-400'}`}>
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-500'}`}>{step > 1 ? <Check size={14} /> : '1'}</div>
                                <span>Basic Details</span>
                            </div>
                            <div className={`h-[2px] w-8 transition-colors ${step > 1 ? 'bg-indigo-500' : 'bg-slate-200'}`}></div>
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${step === 2 ? 'text-indigo-600 bg-white shadow-sm' : 'text-slate-400'}`}>
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${step === 2 ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-500'}`}>2</div>
                                <span>Specific Info</span>
                            </div>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                            <AnimatePresence mode="wait">
                                {step === 1 ? (
                                    <motion.div
                                        key="step1"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        className="flex flex-col gap-6"
                                    >
                                        <div className="flex flex-col gap-4">
                                            <span className="text-sm font-bold text-slate-800 uppercase tracking-wider">Identity</span>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[0.85rem] font-bold text-slate-700">Institutional Email</label>
                                                <input
                                                    type="email"
                                                    placeholder="user@inst.edu"
                                                    value={email}
                                                    onChange={e => setEmail(e.target.value)}
                                                    readOnly={isEdit}
                                                    className={`w-full px-4 py-2.5 border rounded-xl text-[0.9rem] outline-none transition-all ${isEdit ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed' : 'bg-white border-slate-200 focus:border-indigo-500 focus:shadow-[0_0_0_4px_rgba(99,102,241,0.1)] placeholder:text-slate-400'}`}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-4">
                                            <span className="text-sm font-bold text-slate-800 uppercase tracking-wider">Account Type</span>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[0.85rem] font-bold text-slate-700">User Category</label>
                                                <select
                                                    value={category}
                                                    onChange={e => setCategory(e.target.value)}
                                                    className={`w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[0.9rem] outline-none transition-all cursor-pointer appearance-none ${isEdit ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : 'focus:border-indigo-500 focus:shadow-[0_0_0_4px_rgba(99,102,241,0.1)]'}`}
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
                                        className="flex flex-col gap-6"
                                    >
                                        {renderCategoryFields()}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
                            <div className="flex-1">
                                {error && (
                                    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg w-fit">
                                        <AlertCircle size={14} />
                                        <span>{error}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <button className="px-5 py-2.5 rounded-xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-800 transition-colors" onClick={step === 1 ? onClose : () => setStep(1)} disabled={isLoading}>
                                    {step === 1 ? 'Cancel' : 'Back'}
                                </button>
                                <button
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-indigo-500 border-none hover:bg-indigo-600 transition-all shadow-[0_4px_12px_rgba(99,102,241,0.2)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-indigo-500 disabled:shadow-none"
                                    onClick={step === 1 ? () => setStep(2) : handleFinalize}
                                    disabled={isLoading || (step === 1 && !isEdit && (!category || !email))}
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