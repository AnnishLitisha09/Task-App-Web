import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit3, Mail, MapPin, Briefcase, GraduationCap, Shield } from 'lucide-react';
import './ViewUserModal.css';

interface ViewUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
    onEdit: (user: any) => void;
}

const ViewUserModal: React.FC<ViewUserModalProps> = ({ isOpen, onClose, user, onEdit }) => {
    if (!user) return null;

    const userRole = user.role || user.category || 'student';
    const userName = user.name || 'Unknown User';

    const renderDetail = (icon: any, label: string, value: string) => (
        <div className="detail-item">
            <div className="detail-icon">{React.createElement(icon, { size: 18 })}</div>
            <div className="detail-info">
                <span className="detail-label">{label}</span>
                <span className="detail-value">{value || 'N/A'}</span>
            </div>
        </div>
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="modal-overlay">
                    <motion.div
                        className="view-card"
                        initial={{ opacity: 0, scale: 0.95, x: 50 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95, x: 50 }}
                    >
                        <div className="view-card-header">
                            <div className="view-user-primary">
                                <div className="view-avatar-lg">{userName.charAt(0)}</div>
                                <div>
                                    <h2>{userName}</h2>
                                    <span className={`cat-badge ${userRole}`}>{(userRole).toUpperCase()}</span>
                                </div>
                            </div>
                            <button className="close-x-btn" onClick={onClose}><X size={20} /></button>
                        </div>

                        <div className="view-card-body">
                            <div className="details-grid">
                                {renderDetail(Mail, "Institutional Email", user.email)}
                                {renderDetail(Shield, "Registration / Employee ID", user.regNo)}
                                {renderDetail(MapPin, "Department", user.dept)}

                                {userRole === 'student' && (
                                    <>
                                        {renderDetail(GraduationCap, "Current Year", user.year)}
                                        {renderDetail(Shield, "Faculty Advisor", user.advisor)}
                                    </>
                                )}
                                {userRole === 'staff' && renderDetail(Briefcase, "Designation", user.designation)}

                                {userRole === 'role-user' && (
                                    <>
                                        {renderDetail(Shield, "Authority Role", user.role_name || user.role)}
                                        {renderDetail(MapPin, "Scope", user.scope)}
                                        {user.venue && renderDetail(MapPin, "Target Venue", user.venue)}
                                    </>
                                )}
                            </div>

                            <div className="stats-mini-row">
                                <div className="mini-stat">
                                    <span>Credit Score</span>
                                    <h4 className="score-text">{user.score || 0}</h4>
                                </div>
                                <div className="mini-stat">
                                    <span>Penalties</span>
                                    <h4 className="penalty-text">{user.penalty || 0}</h4>
                                </div>
                                <div className="mini-stat">
                                    <span>Status</span>
                                    <h4 className={(user.status || 'active').toLowerCase()}>{user.status || 'Active'}</h4>
                                </div>
                            </div>
                        </div>

                        <div className="view-card-footer">
                            <button className="secondary-btn" onClick={onClose}>Close</button>
                            <button className="primary-pill-btn" onClick={() => { onEdit(user); onClose(); }}>
                                <Edit3 size={16} />
                                Edit Profile
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ViewUserModal;
