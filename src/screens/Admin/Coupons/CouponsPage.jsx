import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Ticket, Plus, X, Calendar, Hash, Award, TrendingUp, Gift, Sparkles, CheckCircle2, AlertCircle, Edit3, Trash2
} from 'lucide-react';
import api from '../../../utils/api';
import DeleteConfirmModal from '../../../components/UI/DeleteConfirmModal/DeleteConfirmModal';
import './CouponsPage.css';

const THEME_COLOR = '#6366f1';

const CouponsPage = () => {
    const [coupons, setCoupons] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState(null);
    const [showToast, setShowToast] = useState(false);
    const [toastType, setToastType] = useState('success');
    const [toastMsg, setToastMsg] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        validity: '',
        total_count: '',
        points: ''
    });

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        setIsLoading(true);
        try {
            const data = await api('/coupons');
            setCoupons(data || []);
        } catch (err) {
            console.error('Failed to fetch coupons:', err);
            triggerToast('error', 'Failed to load coupons');
        } finally {
            setIsLoading(false);
        }
    };

    const triggerToast = (type, msg) => {
        setToastType(type);
        setToastMsg(msg);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 4000);
    };

    const handleCreateNew = () => {
        setFormData({ name: '', validity: '', total_count: '', points: '' });
        setSelectedCoupon(null);
        setIsModalOpen(true);
    };

    const handleEdit = (coupon) => {
        setFormData({
            name: coupon.name,
            validity: coupon.validity?.split('T')[0] || coupon.validity,
            total_count: coupon.total_count,
            points: coupon.points
        });
        setSelectedCoupon(coupon);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (coupon) => {
        setSelectedCoupon(coupon);
        setIsDeleteOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedCoupon) return;
        try {
            await api(`/coupons/${selectedCoupon.id}`, { method: 'DELETE' });
            setCoupons(prev => prev.filter(c => c.id !== selectedCoupon.id));
            triggerToast('success', 'Coupon deleted successfully!');
        } catch (err) {
            console.error('Failed to delete coupon:', err);
            triggerToast('error', 'Failed to delete coupon');
        } finally {
            setIsDeleteOpen(false);
            setSelectedCoupon(null);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                ...formData,
                total_count: parseInt(formData.total_count),
                points: parseInt(formData.points)
            };

            if (selectedCoupon) {
                const response = await api(`/coupons/${selectedCoupon.id}`, {
                    method: 'PUT',
                    body: payload
                });
                setCoupons(prev => prev.map(c => c.id === selectedCoupon.id ? response : c));
                triggerToast('success', 'Coupon updated successfully!');
            } else {
                const response = await api('/coupons', {
                    method: 'POST',
                    body: payload
                });
                setCoupons(prev => [response, ...prev]);
                triggerToast('success', 'Coupon created successfully!');
            }

            setFormData({ name: '', validity: '', total_count: '', points: '' });
            setIsModalOpen(false);
            setSelectedCoupon(null);
        } catch (err) {
            console.error('Failed to process coupon:', err);
            triggerToast('error', err.message || 'Failed to process coupon');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            className="coupons-container"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="page-header">
                <div className="header-left">
                    <Ticket size={32} className="header-icon" style={{ color: THEME_COLOR }} />
                    <div>
                        <h1>Coupon Management</h1>
                        <p>Create and manage reward coupons</p>
                    </div>
                </div>
                <button className="primary-btn" onClick={handleCreateNew} style={{ backgroundColor: THEME_COLOR }}>
                    <Plus size={18} />
                    Create Coupon
                </button>
            </div>

            {/* Stats */}
            <div className="coupon-stats">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: `${THEME_COLOR}15`, color: THEME_COLOR }}>
                        <Gift size={20} />
                    </div>
                    <div className="stat-content">
                        <p>Total Coupons</p>
                        <h4>{coupons.length}</h4>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: `${THEME_COLOR}15`, color: THEME_COLOR }}>
                        <Sparkles size={20} />
                    </div>
                    <div className="stat-content">
                        <p>Active Coupons</p>
                        <h4>{coupons.filter(c => c.remaining_count > 0).length}</h4>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: `${THEME_COLOR}15`, color: THEME_COLOR }}>
                        <TrendingUp size={20} />
                    </div>
                    <div className="stat-content">
                        <p>Total Issued</p>
                        <h4>{coupons.reduce((sum, c) => sum + (c.totalCount - c.remaining_count), 0)}</h4>
                    </div>
                </div>
            </div>

            {/* Coupons Grid */}
            {isLoading ? (
                <div className="loading-container">
                    <div className="loader-spinner"></div>
                    <p>Fetching coupons...</p>
                </div>
            ) : (
                <div className="coupons-grid">
                    {coupons.length === 0 ? (
                        <div className="no-coupons">No coupons available</div>
                    ) : (
                        coupons.map((coupon, idx) => (
                            <motion.div
                                key={coupon.id || idx}
                                className="coupon-card"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                whileHover={{ y: -8 }}
                            >
                                <div className="coupon-header" style={{ background: `linear-gradient(135deg, ${THEME_COLOR}15, ${THEME_COLOR}05)` }}>
                                    <div className="header-top-row">
                                        <div className="coupon-icon" style={{ background: THEME_COLOR }}>
                                            <Ticket size={24} />
                                        </div>
                                        <div className="coupon-actions">
                                            <button className="action-btn edit" onClick={() => handleEdit(coupon)} title="Edit Coupon">
                                                <Edit3 size={16} />
                                            </button>
                                            <button className="action-btn delete" onClick={() => handleDeleteClick(coupon)} title="Delete Coupon">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="coupon-badge" style={{ background: `${THEME_COLOR}20`, color: THEME_COLOR }}>
                                        {coupon.remaining_count > 0 ? 'Active' : 'Depleted'}
                                    </div>
                                </div>

                                <div className="coupon-body">
                                    <h3>{coupon.name}</h3>

                                    <div className="coupon-details">
                                        <div className="detail-item">
                                            <Calendar size={16} />
                                            <span>Valid until {coupon.validity?.split('T')[0] || coupon.validity}</span>
                                        </div>
                                        <div className="detail-item">
                                            <Award size={16} />
                                            <span>{coupon.points} points required</span>
                                        </div>
                                    </div>

                                    <div className="coupon-progress">
                                        <div className="progress-header">
                                            <span className="progress-label">Remaining</span>
                                            <span className="progress-value">{coupon.remaining_count} / {coupon.total_count}</span>
                                        </div>
                                        <div className="progress-bar">
                                            <motion.div
                                                className="progress-fill"
                                                style={{ background: THEME_COLOR }}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(coupon.remaining_count / coupon.total_count) * 100}%` }}
                                                transition={{ duration: 0.8, delay: idx * 0.05 }}
                                            />
                                        </div>
                                    </div>

                                    <div className="coupon-footer">
                                        <div className="usage-stat">
                                            <Hash size={14} />
                                            <span>{coupon.total_count - coupon.remaining_count} issued</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            )}

            {/* Create Coupon Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsModalOpen(false)}
                    >
                        <motion.div
                            className="modal-content"
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h2>{selectedCoupon ? 'Edit Coupon' : 'Create New Coupon'}</h2>
                                <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Coupon Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Academic Excellence"
                                        required
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Validity Date</label>
                                        <input
                                            type="date"
                                            name="validity"
                                            value={formData.validity}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Total Count</label>
                                        <input
                                            type="number"
                                            name="total_count"
                                            value={formData.total_count}
                                            onChange={handleInputChange}
                                            placeholder="100"
                                            min="1"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Score Needed</label>
                                    <input
                                        type="number"
                                        name="points"
                                        value={formData.points}
                                        onChange={handleInputChange}
                                        placeholder="500"
                                        min="0"
                                        required
                                    />
                                </div>

                                <div className="modal-footer">
                                    <button type="button" className="secondary-btn" onClick={() => setIsModalOpen(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="primary-btn" disabled={isSubmitting} style={{ backgroundColor: THEME_COLOR }}>
                                        {isSubmitting ? (
                                            <div className="loader-spinner" style={{ width: 18, height: 18, borderTopColor: 'white' }}></div>
                                        ) : (
                                            <>
                                                {selectedCoupon ? <CheckCircle2 size={18} /> : <Plus size={18} />}
                                                {selectedCoupon ? 'Update Coupon' : 'Create Coupon'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Delete Coupon?"
                confirmText="Delete Coupon"
                message={
                    <>Are you sure you want to remove <strong>{selectedCoupon?.name}</strong>? This reward will no longer be available for students to claim.</>
                }
            />

            {/* Quick Toast */}
            <AnimatePresence>
                {showToast && (
                    <motion.div
                        className={`quick-toast ${toastType}`}
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.9 }}
                    >
                        {toastType === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                        {toastMsg}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default CouponsPage;