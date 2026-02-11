import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, MapPin, UserPlus, Check, Search,
    AlertCircle, Info, Building, Box,
    AlignLeft, Upload, Camera, Trash2
} from 'lucide-react';
import api from '../../../utils/api';
import './VenueModal.css';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface VenueModalProps {
    isOpen: boolean;
    onClose: () => void;
    venueData?: any;
    mode: 'create' | 'edit' | 'assign';
    onSuccess: () => void;
}

const venueTypes = ['Class', 'Laboratory', 'Auditorium', 'Conference Room', 'Others'];

const VenueModal: React.FC<VenueModalProps> = ({
    isOpen, onClose, venueData, mode, onSuccess
}) => {
    const [name, setName] = useState('');
    const [type, setType] = useState('Class');
    const [imagePreview, setImagePreview] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
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
                // Find matching type regardless of case
                const matchedType = venueTypes.find(t => t.toLowerCase() === (venueData.venue_type || '').toLowerCase());
                setType(matchedType || venueTypes[0]);

                // Handle image URL
                let img = venueData.image_url || venueData.image || '';
                if (img && img.startsWith('/') && !img.startsWith('http')) {
                    img = `${BASE_URL}${img}`;
                }
                setImagePreview(img);
                setImageFile(null);

                setLocation(venueData.location || '');
                setDescription(venueData.description || '');

                const incharge = venueData.incharge || venueData.owner;
                if (incharge) {
                    setSelectedIncharge({ id: incharge.id || incharge.user_id, name: incharge.name });
                    setInchargeSearch(incharge.name || '');
                } else if (venueData.owner_id) {
                    setSelectedIncharge({ id: venueData.owner_id, name: venueData.owner_name });
                    setInchargeSearch(venueData.owner_name || '');
                } else {
                    setSelectedIncharge(null);
                    setInchargeSearch('');
                }
            } else {
                setName('');
                setType(venueTypes[0]);
                setImagePreview('');
                setImageFile(null);
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
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
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
            const formData = new FormData();
            formData.append('name', name);
            formData.append('venue_type', type.toLowerCase()); // Backend expects venue_type
            formData.append('location', location);
            formData.append('description', description);
            if (imageFile) {
                formData.append('image', imageFile);
            }
            if (selectedIncharge?.id) {
                formData.append('owner_id', selectedIncharge.id);
            }

            if (mode === 'create') {
                await api('/resources/venues', {
                    method: 'POST',
                    body: formData
                });
            } else {
                const vid = venueData.id || venueData.venue_id;
                await api(`/resources/venues/${vid}`, {
                    method: 'PUT',
                    body: formData
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
                        <div className="header-info">
                            <div className="icon-badge">
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
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Venue Name</label>
                                    <div className="search-wrapper">
                                        <div className="search-input-box">
                                            <Building size={18} className="search-icon-sm" />
                                            <input
                                                type="text"
                                                className="modern-input"
                                                placeholder="e.g. Einstein Seminar Hall"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                readOnly={mode === 'assign'}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Venue Type</label>
                                    <div className="search-wrapper">
                                        <div className="search-input-box">
                                            <Box size={18} className="search-icon-sm" />
                                            <select
                                                className="modern-select"
                                                value={type}
                                                onChange={(e) => setType(e.target.value)}
                                                disabled={mode === 'assign'}
                                            >
                                                {venueTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Location / Floor</label>
                                <div className="search-wrapper">
                                    <div className="search-input-box">
                                        <MapPin size={18} className="search-icon-sm" />
                                        <input
                                            type="text"
                                            className="modern-input"
                                            placeholder="e.g. Block A, 2nd Floor"
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            readOnly={mode === 'assign'}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Venue Image</label>
                                <div className="image-upload-wrapper">
                                    {imagePreview ? (
                                        <div className="image-preview-box">
                                            <img src={imagePreview} alt="Preview" />
                                            <button className="remove-img" onClick={() => { setImagePreview(''); setImageFile(null); }}>
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
                                <div className="search-wrapper">
                                    <div className="search-input-box">
                                        <AlignLeft size={18} className="search-icon-sm" />
                                        <textarea
                                            className="modern-input"
                                            placeholder="Add details about capacity, equipment, etc..."
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            rows={3}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Incharge Assignment */}
                            <div className="form-group">
                                <label>Assign Incharge (Owner)</label>
                                <div className="search-wrapper">
                                    <div className="search-input-box">
                                        <Search size={18} className="search-icon-sm" />
                                        <input
                                            type="text"
                                            className="modern-input"
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
                                </div>
                                <span className="field-helper">The primary official responsible for this venue.</span>

                                <AnimatePresence>
                                    {showFacultyDropdown && inchargeSearch && (
                                        <motion.div
                                            className="dropdown-panel"
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                        >
                                            {filteredIncharges.length > 0 ? (
                                                filteredIncharges.map(person => (
                                                    <div
                                                        key={person.id}
                                                        className={`dropdown-item ${selectedIncharge?.id === person.id ? 'selected' : ''}`}
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
                        <button className="secondary-btn" onClick={onClose}>Discard</button>
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
