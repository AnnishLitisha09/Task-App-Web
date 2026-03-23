import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Search, AlertCircle, Info, Box, AlignLeft, UserPlus, Monitor, Layers, Activity } from 'lucide-react';
import api from '../../../utils/api';

const inputCls = "w-full py-3 pl-10 pr-3 rounded-2xl border border-slate-200 bg-white text-[0.9rem] text-slate-800 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50";
const labelCls = "block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2";

const ResourceModal = ({ isOpen, onClose, resourceData, mode, onSuccess }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [quantity, setQuantity] = useState(0);
    const [status, setStatus] = useState('available');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (resourceData) {
                setName(resourceData.name || '');
                setDescription(resourceData.description || resourceData.details || '');
                setQuantity(resourceData.quantity || 0);
                setStatus(resourceData.status || 'available');
            } else {
                setName('');
                setDescription('');
                setQuantity(0);
                setStatus('available');
            }
            setError('');
        }
    }, [isOpen, resourceData]);

    const handleSubmit = async () => {
        if (!name) { setError('Resource name is required'); return; }
        setIsLoading(true); setError('');
        try {
            const payload = { 
                name, 
                description, 
                quantity: parseInt(quantity), 
                status 
            };
            
            if (mode === 'create') {
                await api('/resources', { method: 'POST', body: payload });
            } else {
                const rid = resourceData.id || resourceData.resource_id;
                await api(`/resources/${rid}`, { method: 'PUT', body: payload });
            }
            onSuccess();
        } catch (err) {
            setError(err.message || 'Operation failed');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-1000 flex items-center justify-center p-4">
                <motion.div 
                    className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden"
                    initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                    animate={{ opacity: 1, scale: 1, y: 0 }} 
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                >
                    <div className="flex justify-between items-center px-8 py-6 border-b border-slate-50">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
                                <Box size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">
                                    {mode === 'create' ? 'Define Master Asset' : 'Refine Asset Specs'}
                                </h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inventory Master Record</p>
                            </div>
                        </div>
                        <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:bg-slate-50 rounded-xl transition-colors" onClick={onClose}>
                            <X size={20} />
                        </button>
                    </div>

                    <div className="px-8 py-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                        {error && (
                            <div className="flex items-center gap-3 px-5 py-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-bold">
                                <AlertCircle size={18} />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className={labelCls}>Resource Name</label>
                                <div className="relative">
                                    <Monitor size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input 
                                        type="text" 
                                        className={inputCls} 
                                        placeholder="e.g. Projector 4K Ultra" 
                                        value={name} 
                                        onChange={(e) => setName(e.target.value)} 
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>Total Quantity</label>
                                    <div className="relative">
                                        <Layers size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input 
                                            type="number" 
                                            className={inputCls} 
                                            placeholder="0" 
                                            value={quantity} 
                                            onChange={(e) => setQuantity(e.target.value)} 
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelCls}>Current Status</label>
                                    <div className="relative">
                                        <Activity size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <select 
                                            className={`${inputCls} appearance-none`}
                                            value={status} 
                                            onChange={(e) => setStatus(e.target.value)}
                                        >
                                            <option value="available">Available</option>
                                            <option value="maintenance">Maintenance</option>
                                            <option value="out_of_stock">Out of Stock</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className={labelCls}>Specifications / Description</label>
                                <div className="relative">
                                    <AlignLeft size={18} className="absolute left-4 top-4 text-slate-400" />
                                    <textarea 
                                        className="w-full py-4 pl-12 pr-4 rounded-2xl border border-slate-200 bg-white text-[0.9rem] text-slate-800 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 resize-none"
                                        placeholder="Add detailed specifications, warranty info, etc..." 
                                        value={description} 
                                        onChange={(e) => setDescription(e.target.value)} 
                                        rows={4} 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 px-8 py-6 border-t border-slate-50 bg-slate-50/30">
                        <button className="px-6 py-3 rounded-2xl text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-colors" onClick={onClose}>
                            Cancel
                        </button>
                        <button 
                            className="px-8 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95 disabled:opacity-60"
                            onClick={handleSubmit} 
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <><Check size={18} /><span>{mode === 'create' ? 'Deploy Asset' : 'Apply Changes'}</span></>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ResourceModal;

