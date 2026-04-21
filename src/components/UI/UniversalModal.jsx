import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, AlertCircle, Info, Trash2, HelpCircle } from 'lucide-react';

const UniversalModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    type = 'info', // 'info' | 'success' | 'warning' | 'danger' | 'question'
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    children,
    isLoading = false,
    maxWidth = 'max-w-md'
}) => {
    const themes = {
        info: {
            icon: Info,
            color: 'text-indigo-500',
            bg: 'bg-indigo-50',
            btn: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
        },
        success: {
            icon: Check,
            color: 'text-emerald-500',
            bg: 'bg-emerald-50',
            btn: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
        },
        warning: {
            icon: AlertCircle,
            color: 'text-amber-500',
            bg: 'bg-amber-50',
            btn: 'bg-amber-600 hover:bg-amber-700 shadow-amber-200'
        },
        danger: {
            icon: Trash2,
            color: 'text-rose-500',
            bg: 'bg-rose-50',
            btn: 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'
        },
        question: {
            icon: HelpCircle,
            color: 'text-sky-500',
            bg: 'bg-sky-50',
            btn: 'bg-sky-600 hover:bg-sky-700 shadow-sky-200'
        }
    };

    const theme = themes[type] || themes.info;
    const Icon = theme.icon;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-1000 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className={`relative w-full ${maxWidth} bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header Section */}
                        <div className="p-8 pb-4 flex justify-between items-start">
                            <div className="flex items-center gap-4">
                                <div className={`w-14 h-14 ${theme.bg} ${theme.color} rounded-2xl flex items-center justify-center shadow-inner`}>
                                    <Icon size={28} />
                                </div>
                                <div className="flex flex-col">
                                    <span className={`text-[10px] font-bold uppercase tracking-widest ${theme.color} opacity-80 mb-1`}>{type} Action</span>
                                    <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-none">{title}</h3>
                                </div>
                            </div>
                            <button 
                                onClick={onClose}
                                className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content Section */}
                        <div className="px-8 py-4">
                            {description && (
                                <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6">
                                    {description}
                                </p>
                            )}
                            <div className="min-h-0">
                                {children}
                            </div>
                        </div>

                        {/* Footer Section */}
                        <div className="p-8 pt-4 flex gap-4">
                            <button
                                onClick={onClose}
                                className="flex-1 px-6 py-4 rounded-2xl border border-slate-100 text-slate-500 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={onConfirm}
                                disabled={isLoading}
                                className={`flex-1 px-6 py-4 rounded-2xl ${theme.btn} text-white font-bold text-[10px] uppercase tracking-widest shadow-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2`}
                            >
                                {isLoading ? (
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : (
                                    confirmText
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default UniversalModal;
