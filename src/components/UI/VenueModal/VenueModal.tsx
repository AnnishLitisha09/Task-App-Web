import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, MapPin, UserPlus, Check, Search,
    AlertCircle, Info, Building, Box,
    AlignLeft, Upload, Camera, Trash2
} from 'lucide-react';
import api from '../../../utils/api';
import './VenueModal.css';

interface VenueModalProps {
    isOpen: boolean;
    onClose: () => void;
    venueData?: any;
    mode: 'create' | 'edit' | 'assign';
    onSuccess: () => void;
}

const venueTypes = ['Classroom', 'Laboratory', 'Auditorium', 'Conference Room', 'Office', 'Sports Ground', 'Other'];

const VenueModal: React.FC<VenueModalProps> = ({
    isOpen, onClose, venueData, mode, onSuccess
}) => {
    const [name, setName] = useState('');
    const [type, setType] = useState('Classroom');
    const [image, setImage] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [inchargeSearch, setInchargeSearch] = useState('');
    const [selectedIncharge, setSelectedIncharge] = useState<any>(null);
    const [facultyList, setFacultyList] = useState<any[]>([]);
    const [showFacultyDropdown, setShowFacultyDropdown] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isFacultyLoading, setIsFacultyLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (venueData) {
                setName(venueData.name || '');
                setType(venueData.type || 'Classroom');
                setImage(venueData.image || '');
                setLocation(venueData.location || '');
                setDescription(venueData.description || '');
                if (venueData.owner_id) {
                    setSelectedIncharge({ id: venueData.owner_id, name: venueData.owner_name });
                    setInchargeSearch(venueData.owner_name || '');
                } else {
                    setSelectedIncharge(null);
                    setInchargeSearch('');
                }
            } else {
                setName('');
                setType('Classroom');
                setImage('');
                setLocation('');
                setDescription('');
                setSelectedIncharge(null);
                setInchargeSearch('');
            }
            setError('');
            fetchFaculty();
        }
    }, [isOpen, venueData]);

    const fetchFaculty = async () => {
        setIsFacultyLoading(true);
        try {
            const response = await api('/users/dashboard/all');
            const allUsers = Array.isArray(response) ? response : (response.users || []);
            const allowedUsers = allUsers.filter((u: any) => u.role === 'faculty' || u.role === 'role-user');

            const simplifiedList = allowedUsers.map((u: any) => {
                const info = u.faculty_info || u.role_user_info || {};
                return {
                    id: u.id,
                    name: info.name || 'Unknown User',
                    reg_no: info.reg_no || 'N/A',
                    role: u.role
                };
            });
            setFacultyList(simplifiedList);
        } catch (err) {
            console.error('Failed to fetch faculty:', err);
        } finally {
            setIsFacultyLoading(false);
        }
    };

    const filteredIncharges = facultyList.filter(f =>
        f.name.toLowerCase().includes(inchargeSearch.toLowerCase()) ||
        f.reg_no.toLowerCase().includes(inchargeSearch.toLowerCase())
    );

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        if (!name && mode !== 'assign') {
            setError('Venue name is required');
            return;
        }

        setIsLoading(true);
        setError('');
        try {
            const payload = {
                name,
                type,
                image,
                location,
                description,
                owner_id: selectedIncharge?.id || null
            };

            if (mode === 'create') {
                await api('/resources/venues', {
                    method: 'POST',
                    body: payload
                });
            } else {
                await api(`/resources/venues/${venueData.id}`, {
                    method: 'PUT',
                    body: payload
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
                    className="venue-modal"
                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, y: 10 }}
                >
                    <div className="modal-header">
                        <div className="header-title-box">
                            <div className="header-icon">
                                {mode === 'assign' ? <UserPlus size={20} /> : <MapPin size={20} />}
                            </div>
                            <div>
                                <h2>
                                    {mode === 'create' ? 'Add New Venue' :
                                        mode === 'edit' ? 'Edit Venue Details' : 'Assign Venue Incharge'}
                                </h2>
                                <p className="header-subtitle">
                                    {mode === 'assign' ? `Assingning authority for ${name}` : 'Institutional infrastructure management'}
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
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Venue Name</label>
                                    <div className={`input-with-icon ${mode === 'assign' ? 'readonly' : ''}`}>
                                        <Building size={18} className="field-icon" />
                                        <input
                                            type="text"
                                            placeholder="e.g. Einstein Seminar Hall"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            readOnly={mode === 'assign'}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Venue Type</label>
                                    <div className={`input-with-icon ${mode === 'assign' ? 'readonly' : ''}`}>
                                        <Box size={18} className="field-icon" />
                                        <select
                                            value={type}
                                            onChange={(e) => setType(e.target.value)}
                                            disabled={mode === 'assign'}
                                        >
                                            {venueTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Location / Floor</label>
                                <div className={`input-with-icon ${mode === 'assign' ? 'readonly' : ''}`}>
                                    <MapPin size={18} className="field-icon" />
                                    <input
                                        type="text"
                                        placeholder="e.g. Block A, 2nd Floor"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        readOnly={mode === 'assign'}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Venue Image</label>
                                <div className="image-upload-wrapper">
                                    {image ? (
                                        <div className="image-preview-box">
                                            <img src={image} alt="Preview" />
                                            <button className="remove-img" onClick={() => setImage('')}>
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="upload-dropzone">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                hidden
                                            />
                                            <div className="upload-icon-box">
                                                <Camera size={24} />
                                            </div>
                                            <span>Upload Venue Image</span>
                                            <span className="browse-text">or click to browse files</span>
                                        </label>
                                    )}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Brief Description</label>
                                <div className="input-with-icon textarea-group">
                                    <AlignLeft size={18} className="field-icon" />
                                    <textarea
                                        placeholder="Add details about capacity, equipment, etc..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={3}
                                    />
                                </div>
                            </div>

                            {/* Incharge Assignment */}
                            <div className="form-group">
                                <label>Assign Incharge (Owner)</label>
                                <div className="input-with-icon searchable">
                                    <Search size={18} className="field-icon" />
                                    <input
                                        type="text"
                                        placeholder="Search faculty or role-user..."
                                        value={inchargeSearch}
                                        onChange={(e) => {
                                            setInchargeSearch(e.target.value);
                                            setShowFacultyDropdown(true);
                                        }}
                                        onFocus={() => setShowFacultyDropdown(true)}
                                    />
                                    {isFacultyLoading && <div className="spinner-mini"></div>}
                                </div>
                                <span className="field-helper">The primary official responsible for this venue.</span>

                                <AnimatePresence>
                                    {showFacultyDropdown && inchargeSearch && (
                                        <motion.div
                                            className="faculty-dropdown"
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                        >
                                            {filteredIncharges.length > 0 ? (
                                                filteredIncharges.map(person => (
                                                    <div
                                                        key={person.id}
                                                        className={`faculty-option ${selectedIncharge?.id === person.id ? 'selected' : ''}`}
                                                        onClick={() => {
                                                            setSelectedIncharge(person);
                                                            setInchargeSearch(person.name);
                                                            setShowFacultyDropdown(false);
                                                        }}
                                                    >
                                                        <div className="faculty-avatar">
                                                            {person.name.charAt(0)}
                                                        </div>
                                                        <div className="faculty-info">
                                                            <span className="fn-name">{person.name}</span>
                                                            <span className="fn-id">{person.reg_no} • {person.role}</span>
                                                        </div>
                                                        {selectedIncharge?.id === person.id && <Check size={16} className="check-icon" />}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="no-result">No eligible users found.</div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {mode === 'assign' && (
                            <div className="info-guide">
                                <Info size={16} />
                                <p>The assigned incharge will receive notifications for all booking requests and maintenance alerts for this venue.</p>
                            </div>
                        )}
                    </div>

                    <div className="modal-footer">
                        <button className="cancel-pill" onClick={onClose}>Discard</button>
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
                                    <span>{mode === 'create' ? 'Create Venue' :
                                        mode === 'edit' ? 'Save Changes' : 'Confirm Incharge'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default VenueModal;
