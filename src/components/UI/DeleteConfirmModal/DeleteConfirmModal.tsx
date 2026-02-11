import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';
import './DeleteConfirmModal.css';

interface DeleteConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    userName?: string;
    title?: string;
    message?: string;
    confirmText?: string;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    userName,
    title = "Delete?",
    message,
    confirmText = "Delete"
}) => {
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
                            <h3>{title}</h3>
                            <p>
                                {message || (
                                    <>Are you sure you want to remove <strong>{userName}</strong>? This action cannot be undone and will revoke all access immediately.</>
                                )}
                            </p>
                        </div>

                        <div className="confirm-actions">
                            <button className="cancel-pill-btn" onClick={onClose}>Cancel</button>
                            <button className="delete-pill-btn" onClick={() => { onConfirm(); onClose(); }}>
                                {confirmText}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default DeleteConfirmModal;
