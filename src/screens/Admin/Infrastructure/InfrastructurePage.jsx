import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin, Box, UserCheck, Plus, Search,
    MoreVertical, Edit2, UserPlus, Trash2,
    LayoutGrid, List, CheckCircle2, XCircle, Clock
} from 'lucide-react';
import api from '../../../utils/api';
import VenueModal from '../../../components/UI/VenueModal/VenueModal';
import DeleteConfirmModal from '../../../components/UI/DeleteConfirmModal/DeleteConfirmModal';
import './InfrastructurePage.css';

const InfrastructurePage = () => {
    const [venues, setVenues] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedVenue, setSelectedVenue] = useState(null);
    const [modalMode, setModalMode] = useState('create');

    useEffect(() => {
        fetchVenues();
    }, []);

    const fetchVenues = async () => {
        setIsLoading(true);
        try {
            const response = await api('/resources/venues');
            const data = Array.isArray(response) ? response : (response.venues || []);
            // Normalize ID field
            setVenues(data.map(v => ({ ...v, id: v.id || v.venue_id })));
        } catch (err) {
            console.error('Failed to fetch venues:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedVenue(null);
        setModalMode('create');
        setIsModalOpen(true);
    };

    const handleEdit = (venue) => {
        setSelectedVenue(venue);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleAssignIncharge = (venue) => {
        setSelectedVenue(venue);
        setModalMode('assign');
        setIsModalOpen(true);
    };

    const handleDeleteClick = (venue) => {
        setSelectedVenue(venue);
        setIsDeleteOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedVenue) return;
        try {
            await api(`/resources/venues/${selectedVenue.id}`, { method: 'DELETE' });
            setVenues(prev => prev.filter(v => v.id !== selectedVenue.id));
        } catch (err) {
            console.error('Failed to delete venue:', err);
            // Optionally add toast here if available in this page's context
        } finally {
            setIsDeleteOpen(false);
            setSelectedVenue(null);
        }
    };

    const filteredVenues = venues.filter(venue =>
        (venue.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (venue.incharge?.name || venue.owner_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (venue.venue_type || venue.type || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = [
        { label: 'Total Venues', value: venues.length, icon: MapPin, color: '#6366f1' },
        { label: 'Available Now', value: venues.filter(v => (v.status || 'available') === 'available').length, icon: CheckCircle2, color: '#10b981' },
        { label: 'Under Maintenance', value: venues.filter(v => v.status === 'maintenance').length, icon: Clock, color: '#f59e0b' },
    ];

    const BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const getImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `${BASE_URL}${url}`;
    };

    return (
        <motion.div
            className="infrastructure-page"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* Stats Overview */}
            <div className="stats-grid">
                {stats.map((stat, idx) => (
                    <motion.div
                        key={idx}
                        className="stat-card"
                        whileHover={{ y: -5 }}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <div className="stat-icon" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                            <stat.icon size={24} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-label">{stat.label}</span>
                            <h3 className="stat-value">{stat.value}</h3>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Header / Actions */}
            <div className="page-header">
                <div className="search-box">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search venues, types or owners..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="action-group">
                    <div className="view-toggle">
                        <button
                            className={viewMode === 'grid' ? 'active' : ''}
                            onClick={() => setViewMode('grid')}
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button
                            className={viewMode === 'table' ? 'active' : ''}
                            onClick={() => setViewMode('table')}
                        >
                            <List size={18} />
                        </button>
                    </div>
                    <button className="primary-btn" onClick={handleCreate}>
                        <Plus size={18} />
                        <span>Add Venue</span>
                    </button>
                </div>
            </div>

            {/* Content Area */}
            {isLoading ? (
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Fetching infrastructure details...</p>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="venue-grid">
                    {filteredVenues.map((venue, idx) => (
                        <motion.div
                            key={venue.id || idx}
                            className={`venue-card ${selectedVenue?.id === venue.id ? 'selected' : ''}`}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => setSelectedVenue(venue)}
                        >
                            <div className="venue-card-header">
                                <div className="venue-image-container">
                                    {(venue.image_url || venue.image) ? (
                                        <img src={getImageUrl(venue.image_url || venue.image)} alt={venue.name} className="venue-card-img" />
                                    ) : (
                                        <div className="venue-image-placeholder">
                                            <MapPin size={24} />
                                        </div>
                                    )}
                                </div>
                                <div className="venue-actions">
                                    <button onClick={(e) => { e.stopPropagation(); handleEdit(venue); }} title="Edit">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteClick(venue); }} title="Delete" className="delete-btn">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="venue-card-body">
                                <div className="venue-title-row">
                                    <h3>{venue.name}</h3>
                                    <div className={`status-tag ${venue.status || 'available'}`}>
                                        <span className="status-dot"></span>
                                        <span>{venue.status || 'Available'}</span>
                                    </div>
                                </div>
                                <p className="venue-card-desc">{venue.description || 'No description available for this venue.'}</p>
                                <div className="venue-meta">
                                    <div className="meta-item">
                                        <Box size={14} />
                                        <span>{venue.venue_type || venue.type || 'General'}</span>
                                    </div>
                                    <div className="meta-item location-info">
                                        <MapPin size={14} />
                                        <span>{venue.location || 'Main Campus'}</span>
                                    </div>
                                    <div className="meta-item">
                                        <UserCheck size={14} />
                                        <span className={(venue.incharge?.name || venue.owner_name) ? 'assigned' : 'unassigned'}>
                                            {venue.incharge?.name || venue.owner_name || 'Unassigned'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="venue-card-footer">
                                <button className="assign-btn" onClick={(e) => { e.stopPropagation(); handleAssignIncharge(venue); }}>
                                    <UserPlus size={16} />
                                    <span>{(venue.incharge || venue.owner_id) ? 'Change Incharge' : 'Assign Incharge'}</span>
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="table-container">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>Venue Name</th>
                                <th>Type & Location</th>
                                <th>Status</th>
                                <th>Owner / Incharge</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredVenues.map((venue, idx) => (
                                <tr key={venue.id || idx}>
                                    <td>
                                        <div className="venue-name-cell">
                                            <div className="venue-table-img">
                                                {(venue.image_url || venue.image) ? <img src={getImageUrl(venue.image_url || venue.image)} alt="" /> : <span>{venue.name.substring(0, 2).toUpperCase()}</span>}
                                            </div>
                                            <div className="venue-info-text">
                                                <span className="v-name">{venue.name}</span>
                                                <span className="v-desc-inline">{venue.description ? `${venue.description.substring(0, 40)}...` : 'No description'}</span>
                                                <span className="v-loc-sub">{venue.location}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="location-cell">
                                            <span className="v-type">{venue.type}</span>
                                            <span className="v-loc">{venue.location}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={`status-pill ${venue.status || 'available'}`}>
                                            {venue.status === 'available' ? <CheckCircle2 size={14} /> :
                                                venue.status === 'maintenance' ? <Clock size={14} /> : <XCircle size={14} />}
                                            <span>{(venue.status || 'Available').toUpperCase()}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="owner-cell">
                                            <span className={`owner-badge ${venue.owner_name ? 'active' : 'empty'}`}>
                                                {venue.owner_name || 'Unassigned'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="text-right">
                                        <div className="action-btns">
                                            <button onClick={() => handleEdit(venue)} title="Edit Venue"><Edit2 size={16} /></button>
                                            <button onClick={() => handleAssignIncharge(venue)} title="Assign Authority"><UserPlus size={16} /></button>
                                            <button onClick={() => handleDeleteClick(venue)} className="delete-btn" title="Delete Venue"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <VenueModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                venueData={selectedVenue}
                mode={modalMode}
                onSuccess={() => {
                    fetchVenues();
                    setIsModalOpen(false);
                }}
            />

            <DeleteConfirmModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Delete Venue?"
                confirmText="Delete Venue"
                message={
                    <>Are you sure you want to remove <strong>{selectedVenue?.name}</strong>? This action will permanently remove the venue from the institutional infrastructure.</>
                }
            />
        </motion.div>
    );
};

export default InfrastructurePage;
