import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';
import './DeleteConfirmModal.css';

interface DeleteConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    userName: string;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ isOpen, onClose, onConfirm, userName }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="modal-overlay">
                    <motion.div
                        className="confirm-card"
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    >
                        <div className="confirm-header">
                            <div className="alert-icon-bg">
                                <AlertCircle size={24} color="#ef4444" />
                            </div>
                            <button className="close-x-btn" onClick={onClose}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="confirm-body">
                            <h3>Delete User?</h3>
                            <p>Are you sure you want to remove <strong>{userName}</strong>? This action cannot be undone and will revoke all access immediately.</p>
                        </div>

                        <div className="confirm-actions">
                            <button className="cancel-pill-btn" onClick={onClose}>Cancel</button>
                            <button className="delete-pill-btn" onClick={() => { onConfirm(); onClose(); }}>
                                Delete User
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default DeleteConfirmModal;
