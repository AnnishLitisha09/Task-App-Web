import React from 'react';
import { motion } from 'framer-motion';
import './UI.css';

export const Button = ({ children, onClick, type = 'button', className = '', variant = 'primary' }) => {
    return (
        <motion.button
            type={type}
            className={`custom-button ${variant} ${className}`}
            onClick={onClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            {children}
        </motion.button>
    );
};
