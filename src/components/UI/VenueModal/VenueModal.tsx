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
    const [selectedIncharge, setSelectedIncharge] = useState<any>(null);
    const [facultyList, setFacultyList] = useState<any[]>([]);
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
                    setSelectedIncharge({
                        id: incharge.id || incharge.user_id,
                        name: incharge.name,
                        role: incharge.role || incharge.role_name
                    });
                } else if (venueData.user_id) {
                    setSelectedIncharge({
                        id: venueData.user_id,
                        name: venueData.user_name || venueData.owner_name,
                        role: venueData.role || venueData.role_name
                    });
                } else {
                    setSelectedIncharge(null);
                }
            } else {
                setName('');
                setType(venueTypes[0]);
                setImagePreview('');
                setImageFile(null);
                setLocation('');
                setDescription('');
                setSelectedIncharge(null);
            }
            setError('');
            fetchFaculty();
        }
    }, [isOpen, venueData]);

    const fetchFaculty = async () => {
        setIsFacultyLoading(true);
        try {
            const response = await api('/users/incharges');
            const incList = Array.isArray(response) ? response : (response.incharges || []);

            const simplifiedList = incList.map((i: any) => ({
                id: i.id || i.user_id,
                name: i.name || 'Unknown User',
                reg_no: i.venue_name || 'Incharge',
                role: i.role || 'Incharge'
            }));
            setFacultyList(simplifiedList);
        } catch (err) {
            console.error('Failed to fetch incharges:', err);
        } finally {
            setIsFacultyLoading(false);
        }
    };

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
                formData.append('user_id', selectedIncharge.id.toString());
                // Use existing role or default to VENUE_INCHARGE as per context
                formData.append('role_name', selectedIncharge.role || 'VENUE_INCHARGE');
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
                                        <select
                                            className="modern-select"
                                            value={selectedIncharge?.id?.toString() || ''}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                const person = facultyList.find(f => f.id.toString() === val);
                                                setSelectedIncharge(person || null);
                                            }}
                                        >
                                            <option value="">Select Incharge...</option>
                                            {facultyList.map(person => (
                                                <option key={person.id} value={person.id.toString()}>
                                                    {person.name} ({person.reg_no})
                                                </option>
                                            ))}
                                        </select>
                                        {isFacultyLoading && <div className="spinner-mini"></div>}
                                    </div>
                                </div>
                                <span className="field-helper">The primary official responsible for this venue.</span>

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
