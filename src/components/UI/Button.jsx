import React from 'react';
import { motion } from 'framer-motion';

const variantClasses = {
    primary: 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-[0_4px_12px_rgba(99,102,241,0.2)]',
    secondary: 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50',
    danger: 'bg-red-500 text-white hover:bg-red-600 shadow-[0_4px_12px_rgba(239,68,68,0.2)]',
    ghost: 'text-slate-600 hover:bg-slate-100',
};

export const Button = ({ children, onClick, type = 'button', className = '', variant = 'primary', disabled = false }) => {
    return (
        <motion.button
            type={type}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed ${variantClasses[variant] || variantClasses.primary} ${className}`}
            onClick={onClick}
            whileHover={disabled ? {} : { scale: 1.02 }}
            whileTap={disabled ? {} : { scale: 0.98 }}
            disabled={disabled}
        >
            {children}
        </motion.button>
    );
};
