import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Ticket, Plus, X, Calendar, Hash, Award, TrendingUp, Gift, Sparkles
} from 'lucide-react';
import './CouponsPage.css';

const THEME_COLOR = '#6366f1';

const mockCoupons = [
    { id: 1, name: 'Academic Excellence', validity: '2024-12-31', totalCount: 100, remaining: 75, scoreNeeded: 500 },
    { id: 2, name: 'Event Participation', validity: '2024-11-30', totalCount: 50, remaining: 30, scoreNeeded: 300 },
    { id: 3, name: 'Community Service', validity: '2024-10-15', totalCount: 75, remaining: 45, scoreNeeded: 400 },
    { id: 4, name: 'Sports Achievement', validity: '2024-09-30', totalCount: 60, remaining: 10, scoreNeeded: 350 },
];

const CouponsPage = () => {
    const [coupons, setCoupons] = useState(mockCoupons);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        validity: '',
        totalCount: '',
        scoreNeeded: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newCoupon = {
            id: Date.now(),
            ...formData,
            totalCount: parseInt(formData.totalCount),
            scoreNeeded: parseInt(formData.scoreNeeded),
            remaining: parseInt(formData.totalCount),
        };
        setCoupons([newCoupon, ...coupons]);
        setFormData({ name: '', validity: '', totalCount: '', scoreNeeded: '' });
        setIsModalOpen(false);
    };

    return (
        <motion.div
            className="coupons-container"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* Header */}
            <div className="page-header">
                <div className="header-left">
                    <Ticket size={32} className="header-icon" style={{ color: THEME_COLOR }} />
                    <div>
                        <h1>Coupon Management</h1>
                        <p>Create and manage reward coupons</p>
                    </div>
                </div>
                <button className="primary-btn" onClick={() => setIsModalOpen(true)} style={{ backgroundColor: THEME_COLOR }}>
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
                        <h4>{coupons.filter(c => c.remaining > 0).length}</h4>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: `${THEME_COLOR}15`, color: THEME_COLOR }}>
                        <TrendingUp size={20} />
                    </div>
                    <div className="stat-content">
                        <p>Total Issued</p>
                        <h4>{coupons.reduce((sum, c) => sum + (c.totalCount - c.remaining), 0)}</h4>
                    </div>
                </div>
            </div>

            {/* Coupons Grid */}
            <div className="coupons-grid">
                {coupons.map((coupon, idx) => (
                    <motion.div
                        key={coupon.id}
                        className="coupon-card"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ y: -8 }}
                    >
                        <div className="coupon-header" style={{ background: `linear-gradient(135deg, ${THEME_COLOR}15, ${THEME_COLOR}05)` }}>
                            <div className="coupon-icon" style={{ background: THEME_COLOR }}>
                                <Ticket size={24} />
                            </div>
                            <div className="coupon-badge" style={{ background: `${THEME_COLOR}20`, color: THEME_COLOR }}>
                                {coupon.remaining > 0 ? 'Active' : 'Depleted'}
                            </div>
                        </div>

                        <div className="coupon-body">
                            <h3>{coupon.name}</h3>

                            <div className="coupon-details">
                                <div className="detail-item">
                                    <Calendar size={16} />
                                    <span>Valid until {coupon.validity}</span>
                                </div>
                                <div className="detail-item">
                                    <Award size={16} />
                                    <span>{coupon.scoreNeeded} points required</span>
                                </div>
                            </div>

                            <div className="coupon-progress">
                                <div className="progress-header">
                                    <span className="progress-label">Remaining</span>
                                    <span className="progress-value">{coupon.remaining} / {coupon.totalCount}</span>
                                </div>
                                <div className="progress-bar">
                                    <motion.div
                                        className="progress-fill"
                                        style={{ background: THEME_COLOR }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(coupon.remaining / coupon.totalCount) * 100}%` }}
                                        transition={{ duration: 0.8, delay: idx * 0.05 }}
                                    />
                                </div>
                            </div>

                            <div className="coupon-footer">
                                <div className="usage-stat">
                                    <Hash size={14} />
                                    <span>{coupon.totalCount - coupon.remaining} issued</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

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
                                <h2>Create New Coupon</h2>
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
                                            name="totalCount"
                                            value={formData.totalCount}
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
                                        name="scoreNeeded"
                                        value={formData.scoreNeeded}
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
                                    <button type="submit" className="primary-btn" style={{ backgroundColor: THEME_COLOR }}>
                                        <Plus size={18} />
                                        Create Coupon
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default CouponsPage;