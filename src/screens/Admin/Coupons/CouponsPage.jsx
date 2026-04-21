import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, Plus, X, Calendar, Hash, Award, TrendingUp, Gift, Sparkles, CheckCircle2, AlertCircle, Edit3, Trash2, LayoutGrid, List } from 'lucide-react';
import api from '../../../utils/api';
import DeleteConfirmModal from '../../../components/UI/DeleteConfirmModal/DeleteConfirmModal';
import Pagination from '../../../components/UI/Pagination/Pagination';

const THEME_COLOR = '#6366f1';

const CouponsPage = () => {
    const [coupons, setCoupons] = useState([]);
    const [couponStats, setCouponStats] = useState({ active_coupons: 0, inactive_coupons: 0, total_issued: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState(null);
    const [showToast, setShowToast] = useState(false);
    const [toastType, setToastType] = useState('success');
    const [toastMsg, setToastMsg] = useState('');
    const [formData, setFormData] = useState({ name: '', validity: '', total_count: '', points: '', status: 'active' });
    const [viewMode, setViewMode] = useState('table');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => { fetchCoupons(); }, []);

    // Reset pagination when data changes
    useEffect(() => { setCurrentPage(1); }, [coupons.length]);

    const fetchCoupons = async () => {
        setIsLoading(true);
        try {
            const response = await api('/coupons');
            if (response.success) {
                setCoupons(response.items || response.coupons || []);
                setCouponStats(response.stats || { active_coupons: 0, inactive_coupons: 0, total_issued: 0 });
            } else {
                setCoupons(Array.isArray(response) ? response : []);
            }
        } catch (err) { triggerToast('error', 'Failed to load coupons'); }
        finally { setIsLoading(false); }
    };

    const triggerToast = (type, msg) => {
        setToastType(type); setToastMsg(msg); setShowToast(true);
        setTimeout(() => setShowToast(false), 4000);
    };
    const handleCreateNew = () => { setFormData({ name: '', validity: '', total_count: '', points: '', status: 'active' }); setSelectedCoupon(null); setIsModalOpen(true); };
    const handleEdit = (c) => { 
        setFormData({ 
            name: c.name, 
            validity: c.validity?.split('T')[0] || c.validity, 
            total_count: c.total_count, 
            points: c.points,
            status: c.status || 'active'
        }); 
        setSelectedCoupon(c); 
        setIsModalOpen(true); 
    };
    const handleDeleteClick = (c) => { setSelectedCoupon(c); setIsDeleteOpen(true); };
    const handleDeleteConfirm = async () => {
        if (!selectedCoupon) return;
        try { await api(`/coupons/${selectedCoupon.id}`, { method: 'DELETE' }); setCoupons(prev => prev.filter(c => c.id !== selectedCoupon.id)); triggerToast('success', 'Coupon deleted!'); }
        catch { triggerToast('error', 'Failed to delete coupon'); }
        finally { setIsDeleteOpen(false); setSelectedCoupon(null); }
    };
    const handleInputChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
    const handleSubmit = async (e) => {
        e.preventDefault(); setIsSubmitting(true);
        try {
            const payload = { 
                ...formData, 
                total_count: parseInt(formData.total_count), 
                points: parseInt(formData.points) 
            };
            
            if (selectedCoupon) {
                const r = await api(`/coupons/${selectedCoupon.id}`, { method: 'PUT', body: payload });
                const updatedCoupon = r.coupon || r;
                setCoupons(prev => prev.map(c => c.id === selectedCoupon.id ? updatedCoupon : c));
                triggerToast('success', 'Coupon updated!');
            } else {
                const r = await api('/coupons', { method: 'POST', body: payload });
                const newCoupon = r.coupon || r;
                setCoupons(prev => [newCoupon, ...prev]);
                triggerToast('success', 'Coupon created!');
            }
            setFormData({ name: '', validity: '', total_count: '', points: '', status: 'active' }); 
            setIsModalOpen(false); 
            setSelectedCoupon(null);
            fetchCoupons(); // Refetch to sync stats
        } catch (err) { triggerToast('error', err.message || 'Failed to process coupon'); }
        finally { setIsSubmitting(false); }
    };

    const inputCls = "w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all";

    // Paginated Coupons
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const paginatedCoupons = coupons.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(coupons.length / itemsPerPage);

    // Auto-switch view based on screen size
    useEffect(() => {
        const handleResize = () => { if (window.innerWidth < 1024) setViewMode('grid'); };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <motion.div
            className="p-4 sm:p-6 lg:p-8 xl:p-10 bg-white min-h-screen font-sans"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 mb-8 sm:mb-10 lg:mb-12">
                <div className="flex items-center gap-4 sm:gap-6">
                    <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-[20px] sm:rounded-[22px] bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-lg shadow-indigo-100/50 flex-shrink-0" style={{ width: 52, height: 52 }}>
                        <Ticket size={26} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Reward <span className="text-indigo-600">Protocols</span></h1>
                        <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold opacity-70">
                            Coupon Generation &amp; Redemption
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto flex-shrink-0">
                    {/* Grid/List toggle — desktop only, kept as requested */}
                    <div className="hidden lg:flex bg-slate-100 p-1.5 rounded-[18px] border border-slate-200 shadow-inner">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2.5 rounded-[13px] transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                            title="Grid view"
                        >
                            <LayoutGrid size={18} strokeWidth={2.5} />
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-2.5 rounded-[13px] transition-all cursor-pointer ${viewMode === 'table' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                            title="List view"
                        >
                            <List size={18} strokeWidth={2.5} />
                        </button>
                    </div>

                    <button
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2.5 bg-slate-900 hover:bg-indigo-600 text-white px-5 sm:px-8 py-3.5 sm:py-4 rounded-[20px] sm:rounded-[22px] text-xs font-bold uppercase tracking-widest shadow-xl transition-all active:scale-95 border-none cursor-pointer whitespace-nowrap"
                        onClick={handleCreateNew}
                    >
                        <Plus size={18} strokeWidth={3} />
                        <span>Issue Coupon</span>
                    </button>
                </div>
            </div>

            {/* ── Stats — always 3 cols ── */}
            <div className="grid grid-cols-3 gap-2 sm:gap-6 mb-8 sm:mb-10 lg:mb-12">
                {[
                    { icon: Gift, label: 'Total Registry', val: coupons.length, color: '#6366f1' },
                    { icon: Sparkles, label: 'Active State', val: couponStats.active_coupons, color: '#10b981' },
                    { icon: AlertCircle, label: 'Inactive State', val: couponStats.inactive_coupons, color: '#ef4444' },
                    { icon: TrendingUp, label: 'Circulation', val: couponStats.total_issued, color: '#f59e0b' }
                ].map((s, i) => (
                    <div
                        key={i}
                        className="bg-white p-3 sm:p-6 rounded-2xl sm:rounded-[32px] border border-slate-100 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.03)] hover:shadow-[0_25px_50px_-15px_rgba(0,0,0,0.07)] hover:border-indigo-100 hover:-translate-y-1 transition-all group"
                    >
                        {/* Mobile: stacked. Desktop: side-by-side */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-5">
                            <div
                                className="w-8 h-8 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 shadow-lg font-bold"
                                style={{ backgroundColor: `${s.color}15`, color: s.color }}
                            >
                                <s.icon size={15} strokeWidth={2.5} className="sm:hidden" />
                                <s.icon size={24} strokeWidth={2.5} className="hidden sm:block" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <span className="hidden sm:block text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest mb-1">{s.label}</span>
                                <h3 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight leading-none">{s.val}</h3>
                            </div>
                        </div>
                        {/* Label visible only on mobile (below number) */}
                        <p className="sm:hidden text-[8px] font-bold text-slate-400 uppercase tracking-widest truncate mt-1">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* ── Content ── */}
            {isLoading ? (
                <div className="py-16 flex flex-col items-center gap-4 text-slate-500">
                    <div className="w-10 h-10 border-[3px] border-slate-100 border-t-indigo-500 rounded-full animate-spin" />
                    <p className="text-sm font-medium">Fetching coupons...</p>
                </div>
            ) : viewMode === 'grid' ? (
                /* ── Grid View — 1→2→3 cols ── */
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    {coupons.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-slate-400 font-medium">No coupons available</div>
                    ) : paginatedCoupons.map((coupon, idx) => (
                        <motion.div
                            key={coupon.id || idx}
                            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:-translate-y-1 hover:shadow-md transition-all"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            {/* Card header */}
                            <div className="p-5" style={{ background: `linear-gradient(135deg, ${THEME_COLOR}15, ${THEME_COLOR}05)` }}>
                                <div className="flex justify-between items-center mb-3">
                                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: THEME_COLOR }}>
                                        <Ticket size={20} />
                                    </div>
                                    {/* Action buttons — always visible */}
                                    <div className="flex gap-1.5">
                                        <button
                                            className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-500 hover:text-indigo-500 hover:border-indigo-500 cursor-pointer transition-all"
                                            onClick={() => handleEdit(coupon)}
                                            title="Edit"
                                        >
                                            <Edit3 size={14} />
                                        </button>
                                        <button
                                            className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-500 hover:text-red-500 hover:border-red-200 cursor-pointer transition-all"
                                            onClick={() => handleDeleteClick(coupon)}
                                            title="Delete"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                                <span
                                    className="px-2.5 py-1 rounded-lg text-[0.7rem] font-bold uppercase"
                                    style={{ 
                                        backgroundColor: coupon.status === 'active' 
                                            ? (coupon.remaining_count > 0 ? `${THEME_COLOR}20` : '#fef3c7') 
                                            : '#f1f5f9',
                                        color: coupon.status === 'active' 
                                            ? (coupon.remaining_count > 0 ? THEME_COLOR : '#d97706') 
                                            : '#64748b'
                                    }}
                                >
                                    {coupon.status === 'active' 
                                        ? (coupon.remaining_count > 0 ? 'Active' : 'Depleted') 
                                        : 'Inactive'}
                                </span>
                            </div>

                            {/* Card body */}
                            <div className="p-5">
                                <h3 className="text-base font-bold text-slate-800 mb-3">{coupon.name}</h3>
                                <div className="flex flex-col gap-2 mb-4">
                                    <div className="flex items-center gap-2 text-slate-500 text-[0.85rem]">
                                        <Calendar size={14} />
                                        <span>Valid until {coupon.validity?.split('T')[0] || coupon.validity}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500 text-[0.85rem]">
                                        <Award size={14} />
                                        <span>{coupon.points} points required</span>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1.5">
                                        <span>Remaining</span>
                                        <span>{coupon.remaining_count} / {coupon.total_count}</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full rounded-full"
                                            style={{ backgroundColor: THEME_COLOR }}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(coupon.remaining_count / coupon.total_count) * 100}%` }}
                                            transition={{ duration: 0.8, delay: idx * 0.05 }}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 text-[0.8rem] text-slate-500">
                                    <Hash size={13} />
                                    <span>{coupon.total_count - coupon.remaining_count} issued</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                /* ── Table View — horizontal scroll on small screens ── */
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[640px]">
                            <thead className="bg-white border-b border-slate-100 text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                                <tr>
                                    <th className="px-4 sm:px-6 py-4">Coupon Name</th>
                                    <th className="px-4 sm:px-6 py-4">Validity</th>
                                    <th className="px-4 sm:px-6 py-4 text-center">Remaining</th>
                                    <th className="px-4 sm:px-6 py-4 text-center">Score Needed</th>
                                    <th className="px-4 sm:px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {paginatedCoupons.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-medium">
                                            No coupons available
                                        </td>
                                    </tr>
                                ) : paginatedCoupons.map((coupon, idx) => (
                                    <tr key={coupon.id || idx} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-4 sm:px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 flex-shrink-0">
                                                    <Ticket size={15} />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-sm font-bold text-slate-800 truncate max-w-[140px] sm:max-w-none">
                                                        {coupon.name}
                                                    </div>
                                                    <div className={`text-[10px] uppercase tracking-wide font-bold ${
                                                        coupon.status === 'active' 
                                                            ? (coupon.remaining_count > 0 ? 'text-emerald-500' : 'text-amber-500') 
                                                            : 'text-slate-400'
                                                    }`}>
                                                        {coupon.status === 'active' 
                                                            ? (coupon.remaining_count > 0 ? 'Active' : 'Depleted') 
                                                            : 'Inactive'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 text-xs text-slate-500 font-medium whitespace-nowrap">
                                            {coupon.validity?.split('T')[0] || coupon.validity}
                                        </td>
                                        <td className="px-4 sm:px-6 py-4">
                                            <div className="flex flex-col items-center gap-1.5">
                                                <div className="text-xs font-bold text-slate-700">
                                                    {coupon.remaining_count} / {coupon.total_count}
                                                </div>
                                                <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full rounded-full" style={{ backgroundColor: THEME_COLOR, width: `${(coupon.remaining_count / coupon.total_count) * 100}%` }} />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 text-center">
                                            <span className="bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap">
                                                {coupon.points} pts
                                            </span>
                                        </td>
                                        {/* Always-visible action buttons */}
                                        <td className="px-4 sm:px-6 py-4 text-right">
                                            <div className="flex justify-end gap-1.5 sm:gap-2">
                                                <button
                                                    onClick={() => handleEdit(coupon)}
                                                    className="w-8 h-8 sm:p-1.5 flex items-center justify-center rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                                                    title="Edit"
                                                >
                                                    <Edit3 size={15} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(coupon)}
                                                    className="w-8 h-8 sm:p-1.5 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── Pagination ── */}
            <div className="mt-6 sm:mt-8">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    onItemsPerPageChange={setItemsPerPage}
                    totalItems={coupons.length}
                    showingCount={paginatedCoupons.length}
                />
            </div>

            {/* ── Create/Edit Modal ── */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000] flex items-center justify-center p-4"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setIsModalOpen(false)}
                    >
                        <motion.div
                            className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center px-6 sm:px-7 py-4 sm:py-5 border-b border-slate-100">
                                <h2 className="text-base font-bold text-slate-900">
                                    {selectedCoupon ? 'Edit Coupon' : 'Create New Coupon'}
                                </h2>
                                <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-slate-100 rounded-lg" onClick={() => setIsModalOpen(false)}>
                                    <X size={18} />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="px-6 sm:px-7 py-5 sm:py-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Coupon Name</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g., Academic Excellence" required className={inputCls} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Validity Date</label>
                                        <input type="date" name="validity" value={formData.validity} onChange={handleInputChange} required className={inputCls} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Total Count</label>
                                        <input type="number" name="total_count" value={formData.total_count} onChange={handleInputChange} placeholder="100" min="1" required className={inputCls} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Score Needed</label>
                                    <input type="number" name="points" value={formData.points} onChange={handleInputChange} placeholder="500" min="0" required className={inputCls} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Coupon Status</label>
                                    <select 
                                        name="status" 
                                        value={formData.status} 
                                        onChange={handleInputChange} 
                                        required 
                                        className={inputCls}
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <button type="button" className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm" onClick={() => setIsModalOpen(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="px-5 py-2.5 rounded-xl text-white font-bold text-sm flex items-center gap-2" style={{ backgroundColor: THEME_COLOR }} disabled={isSubmitting}>
                                        {isSubmitting
                                            ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            : <>{selectedCoupon ? <CheckCircle2 size={16} /> : <Plus size={16} />}{selectedCoupon ? 'Update Coupon' : 'Create Coupon'}</>
                                        }
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <DeleteConfirmModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Delete Coupon?"
                confirmText="Delete Coupon"
                message={<>Are you sure you want to remove <strong>{selectedCoupon?.name}</strong>? This reward will no longer be available.</>}
            />

            {/* ── Toast ── */}
            <AnimatePresence>
                {showToast && (
                    <motion.div
                        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 flex items-center gap-3 px-4 sm:px-5 py-3 rounded-2xl text-white font-semibold shadow-2xl z-[2000] text-sm ${toastType === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.9 }}
                    >
                        {toastType === 'success' ? <CheckCircle2 size={17} /> : <AlertCircle size={17} />}
                        {toastMsg}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default CouponsPage;