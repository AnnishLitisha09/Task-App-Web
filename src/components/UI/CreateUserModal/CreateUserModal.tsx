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
    const [scopeName, setScopeName] = useState('');
    const [facultyType, setFacultyType] = useState('Professor');

    // Auto-map scope when roleName changes
    const ROLE_SCOPE_MAP: Record<string, string> = {
        HOD: 'departmental',
        DEAN: 'institutional',
        PRINCIPAL: 'institutional',
        INCHARGE: 'infrastructure',
        DIRECTOR: 'institutional',
    };
    const ROLE_OPTIONS = ['HOD', 'DEAN', 'PRINCIPAL', 'INCHARGE', 'DIRECTOR'];

    useEffect(() => {
        if (roleName && ROLE_SCOPE_MAP[roleName]) {
            setScopeName(ROLE_SCOPE_MAP[roleName]);
        }
    }, [roleName]);

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
        setScopeName('');
        setAdvisorSearch('');
        setError('');
    };

    const handleFinalize = async () => {
        setIsLoading(true);
        setError('');

        // Dept only required for student, faculty, AND role-user when role is HOD
        const isDepartmentRequired = ['student', 'faculty'].includes(category) || (category === 'role-user' && roleName === 'HOD');
        const isDeptEmpty = deptId === '' || deptId === null || deptId === undefined;

        if (isDepartmentRequired && isDeptEmpty) {
            setError(roleName === 'HOD' ? 'Please select a Department for HOD' : 'Please Select a Department');
            setIsLoading(false);
            return;
        }

        if (category === 'role-user') {
            if (!fullName.trim()) {
                setError('Please enter the Authority Name');
                setIsLoading(false);
                return;
            }
            if (!roleName) {
                setError('Please select a Role');
                setIsLoading(false);
                return;
            }
            if (!scopeName) {
                setError('Please select a Scope');
                setIsLoading(false);
                return;
            }
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
                        scope: scopeName,
                        department_id: roleName === 'HOD' ? parsedDeptId : null,
                        venue_id: (roleName === 'INCHARGE' || roleName === 'LIBRARY_INCHARGE') ? parsedVenueId : null
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
            case 'role-user': {
                const isHOD = roleName === 'HOD';
                const isIncharge = roleName === 'INCHARGE';
                const needsDept = isHOD;
                const needsVenue = isIncharge;
                return (
                    <div className={inputGridClasses}>
                        <div className={inputGroupClasses}>
                            <label className={labelClasses}>Authority Name</label>
                            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className={inputClasses} />
                        </div>
                        <div className={inputGroupClasses}>
                            <label className={labelClasses}>Role / Designation</label>
                            <select value={roleName} onChange={e => setRoleName(e.target.value)} className={selectClasses}>
                                <option value="">Select Role</option>
                                {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
                            </select>
                        </div>

                        {/* HOD: needs department */}
                        {needsDept && (
                            <div className={`${inputGroupClasses} md:col-span-2`}>
                                <label className={`${labelClasses} text-indigo-600`}>📚 Department <span className="text-red-500">*</span></label>
                                <select value={deptId} onChange={e => setDeptId(e.target.value)} className={selectClasses}>
                                    <option value="">Select Department</option>
                                    {departments.map(d => (
                                        <option key={d.id || d.department_id} value={d.id || d.department_id}>
                                            {d.name || d.department_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* INCHARGE: needs venue */}
                        {needsVenue && (
                            <div className={`${inputGroupClasses} md:col-span-2`}>
                                <label className={`${labelClasses} text-amber-600`}>🏢 Venue / Facility <span className="text-red-500">*</span></label>
                                <select value={venueId} onChange={e => setVenueId(e.target.value)} className={selectClasses}>
                                    <option value="">Select Venue</option>
                                    {venues.map(v => (
                                        <option key={v.id || v.venue_id} value={v.id || v.venue_id}>
                                            {v.name || v.venue_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Scope — auto-mapped but override allowed */}
                        {roleName && (
                            <div className={`${inputGroupClasses} md:col-span-2`}>
                                <label className={labelClasses}>
                                    🔑 Authority Scope
                                    <span className="ml-2 text-[0.7rem] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                        AUTO-MAPPED
                                    </span>
                                </label>
                                <select value={scopeName} onChange={e => setScopeName(e.target.value)} className={`${selectClasses} border-emerald-300 focus:border-emerald-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]`}>
                                    <option value="">Select Scope</option>
                                    <option value="departmental">🏫 Departmental — Access to one department</option>
                                    <option value="institutional">🏛️ Institutional — Access to full institution</option>
                                    <option value="infrastructure">🏢 Infrastructure — Access to venues/facilities</option>
                                </select>
                                <p className="text-[0.7rem] text-slate-400 mt-1">Auto-set based on role. You can override if needed.</p>
                            </div>
                        )}
                    </div>
                );
            }
            default:
                return <div className="text-center py-12 text-slate-500">Please select a user category in Step 1 to continue</div>;
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-5000 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh] border border-white/20"
                    >
                        {/* Header */}
                        <div className="px-6 py-5 sm:px-8 sm:py-6 border-b border-slate-100 flex justify-between items-center bg-white z-10 shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
                                    <UserPlus size={24} strokeWidth={2.5} />
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-xl sm:text-2xl font-black text-slate-800 m-0 leading-tight truncate">
                                        {isEdit ? 'Refine Profile' : 'New Identity'}
                                    </h2>
                                    <p className="text-xs sm:text-sm font-bold text-slate-400 m-0 mt-0.5 uppercase tracking-widest italic opacity-70">
                                        {isEdit ? 'Operational Access' : 'Credential Initialization'}
                                    </p>
                                </div>
                            </div>
                            <button className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all border-none bg-transparent cursor-pointer active:scale-90" onClick={onClose}>
                                <X size={24} />
                            </button>
                        </div>

                        {/* Progress Stepper */}
                        <div className="flex items-center gap-2 px-6 py-4 sm:px-8 bg-slate-50/50 border-b border-slate-100 shrink-0 overflow-x-auto no-scrollbar">
                            <div className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all whitespace-nowrap ${step >= 1 ? 'text-indigo-600 bg-white shadow-sm ring-1 ring-slate-100' : 'text-slate-400'}`}>
                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>{step > 1 ? <Check size={14} strokeWidth={3} /> : '01'}</div>
                                <span className="uppercase tracking-wider">Classification</span>
                            </div>
                            <div className={`h-[2px] min-w-[20px] flex-1 transition-colors ${step > 1 ? 'bg-indigo-600' : 'bg-slate-200/50'}`}></div>
                            <div className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all whitespace-nowrap ${step === 2 ? 'text-indigo-600 bg-white shadow-sm ring-1 ring-slate-100' : 'text-slate-400'}`}>
                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${step === 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>02</div>
                                <span className="uppercase tracking-wider">Parameters</span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 sm:p-8 overflow-y-auto flex-1 custom-scrollbar">
                            <AnimatePresence mode="wait">
                                {step === 1 ? (
                                    <motion.div
                                        key="step1"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-8"
                                    >
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1 h-4 bg-indigo-500 rounded-full"></div>
                                                <span className="text-[0.65rem] font-black text-slate-400 uppercase tracking-[0.2em]">Contact Vector</span>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Email Identifier</label>
                                                <input
                                                    type="email"
                                                    placeholder="identifier@institution.edu"
                                                    value={email}
                                                    onChange={e => setEmail(e.target.value)}
                                                    readOnly={isEdit}
                                                    className={`w-full px-5 py-4 border-2 rounded-[20px] text-[0.95rem] font-bold outline-none transition-all ${isEdit ? 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed opacity-70' : 'bg-white border-slate-100 focus:border-indigo-500 focus:bg-white focus:shadow-[0_15px_30px_-10px_rgba(99,102,241,0.1)] placeholder:text-slate-300'}`}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1 h-4 bg-amber-500 rounded-full"></div>
                                                <span className="text-[0.65rem] font-black text-slate-400 uppercase tracking-[0.2em]">Domain Assignment</span>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Entity Category</label>
                                                <div className="relative group">
                                                    <select
                                                        value={category}
                                                        onChange={e => setCategory(e.target.value)}
                                                        className={`w-full px-5 py-4 bg-white border-2 border-slate-100 rounded-[20px] text-[0.95rem] font-bold outline-none transition-all cursor-pointer appearance-none ${isEdit ? 'bg-slate-50 text-slate-400 cursor-not-allowed opacity-70' : 'group-hover:border-slate-200 focus:border-indigo-500 focus:shadow-[0_15px_30px_-10px_rgba(99,102,241,0.1)]'}`}
                                                        disabled={isEdit}
                                                    >
                                                        <option value="">-- Select Category --</option>
                                                        <option value="student">Student — Academic Track</option>
                                                        <option value="faculty">Faculty — Instruction/Research</option>
                                                        <option value="staff">Staff — Technical/Admin</option>
                                                        <option value="role-user">Authority — Governance</option>
                                                    </select>
                                                    <ChevronRight size={20} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none rotate-90" />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="step2"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-2"
                                    >
                                        <div className="mb-6 flex items-center justify-between bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-indigo-500 text-white flex items-center justify-center font-bold text-xs uppercase">
                                                    {category.substring(0, 1)}
                                                </div>
                                                <span className="text-xs font-black text-indigo-700 uppercase tracking-widest">{category} Profile Details</span>
                                            </div>
                                            <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest italic">{email}</div>
                                        </div>
                                        {renderCategoryFields()}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-5 sm:px-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white shrink-0">
                            <div className="flex-1 w-full sm:w-auto">
                                <AnimatePresence>
                                    {error && (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.9 }} 
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="flex items-center gap-2.5 text-[0.7rem] font-black uppercase tracking-tight text-rose-600 bg-rose-50 border border-rose-100 px-4 py-2.5 rounded-xl w-full sm:w-fit"
                                        >
                                            <AlertCircle size={16} />
                                            <span>{error}</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="flex gap-3 w-full sm:w-auto">
                                <button className="flex-1 sm:flex-none px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 bg-white border-2 border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all border-none cursor-pointer active:scale-95" onClick={step === 1 ? onClose : () => setStep(1)} disabled={isLoading}>
                                    {step === 1 ? 'Cancel' : 'Return'}
                                </button>
                                <button
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] text-white bg-slate-900 border-none hover:bg-indigo-600 transition-all shadow-[0_15px_30px_-10px_rgba(0,0,0,0.2)] disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                                    onClick={step === 1 ? () => setStep(2) : handleFinalize}
                                    disabled={isLoading || (step === 1 && !isEdit && (!category || !email))}
                                >
                                    {isLoading ? 'Processing...' : (
                                        <>
                                            <span>{step === 1 ? 'Configure' : (isEdit ? 'Update' : 'Commit')}</span>
                                            {step === 1 && <ChevronRight size={18} strokeWidth={3} />}
                                        </>
                                    )}
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