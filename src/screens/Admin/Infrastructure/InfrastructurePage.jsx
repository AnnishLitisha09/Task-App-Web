import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Box, UserCheck, Plus, Search, Edit2, UserPlus, Trash2, LayoutGrid, List, CheckCircle2, XCircle, Clock, Upload, X, AlertCircle } from 'lucide-react';
import api from '../../../utils/api';
import VenueModal from '../../../components/UI/VenueModal/VenueModal';
import DeleteConfirmModal from '../../../components/UI/DeleteConfirmModal/DeleteConfirmModal';
import Pagination from '../../../components/UI/Pagination/Pagination';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const statusStyles = {
    available: 'bg-emerald-100 text-emerald-700',
    maintenance: 'bg-amber-100 text-amber-700',
    occupied: 'bg-red-100 text-red-700',
};

const InfrastructurePage = () => {
    const [venues, setVenues] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Auto-switch to grid view on tablets/mobile
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1100) setViewMode('grid');
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedVenue, setSelectedVenue] = useState(null);
    const [modalMode, setModalMode] = useState('create');
    const [bulkResult, setBulkResult] = useState(null);
    const [isBulkUploading, setIsBulkUploading] = useState(false);
    const bulkInputRef = useRef(null);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => { fetchVenues(); }, []);

    const fetchVenues = async () => {
        setIsLoading(true);
        try {
            const response = await api('/resources/venues');
            const data = Array.isArray(response) ? response : (response.venues || []);
            setVenues(data.map(v => ({ ...v, id: v.id || v.venue_id })));
        } catch (err) { console.error('Failed to fetch venues:', err); }
        finally { setIsLoading(false); }
    };

    // Reset pagination on search change
    useEffect(() => { setCurrentPage(1); }, [searchTerm]);

    const handleCreate = () => { setSelectedVenue(null); setModalMode('create'); setIsModalOpen(true); };
    const handleEdit = (venue) => { setSelectedVenue(venue); setModalMode('edit'); setIsModalOpen(true); };
    const handleAssignIncharge = (venue) => { setSelectedVenue(venue); setModalMode('assign'); setIsModalOpen(true); };
    const handleDeleteClick = (venue) => { setSelectedVenue(venue); setIsDeleteOpen(true); };
    const handleDeleteConfirm = async () => {
        if (!selectedVenue) return;
        try { await api(`/resources/venues/${selectedVenue.id}`, { method: 'DELETE' }); setVenues(prev => prev.filter(v => v.id !== selectedVenue.id)); }
        catch (err) { console.error(err); }
        finally { setIsDeleteOpen(false); setSelectedVenue(null); }
    };

    const handleBulkUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsBulkUploading(true);
        setBulkResult(null);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await api('/resources/venues/bulk', { method: 'POST', body: formData });
            setBulkResult(res);
            fetchVenues();
        } catch (err) {
            setBulkResult({ error: err.message });
        } finally {
            setIsBulkUploading(false);
            e.target.value = '';
        }
    };

    const filteredVenues = venues.filter(v =>
        (v.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.incharge?.name || v.owner_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.venue_type || v.type || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const paginatedVenues = filteredVenues.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredVenues.length / itemsPerPage);

    const stats = [
        { label: 'Total Venues', value: venues.length, icon: MapPin, color: '#6366f1' },
        { label: 'Available Now', value: venues.filter(v => (v.status || 'available') === 'available').length, icon: CheckCircle2, color: '#10b981' },
        { label: 'Maintenance', value: venues.filter(v => v.status === 'maintenance').length, icon: Clock, color: '#f59e0b' },
    ];

    const getImageUrl = (url) => { if (!url) return null; if (url.startsWith('http')) return url; return `${BASE_URL}${url}`; };

    return (
        <motion.div
            className="p-4 sm:p-6 lg:p-8 bg-white min-h-screen"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="max-w-[1600px] mx-auto">

                {/* ── Page Header ── */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-1">
                        Infrastructure
                    </h1>
                    <p className="text-slate-500 font-medium text-sm sm:text-base">
                        Manage venues, facilities and in-charge assignments.
                    </p>
                </div>

                {/* ── Stats Grid — always 3 cols ── */}
                <div className="grid grid-cols-3 gap-2 sm:gap-6 mb-6 sm:mb-8 lg:mb-10">
                    {stats.map((s, idx) => (
                        <motion.div
                            key={idx}
                            className="group bg-white p-3 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:border-indigo-200 hover:-translate-y-1 transition-all duration-300"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            {/* Mobile: stacked. Desktop: side-by-side */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-5">
                                <div
                                    className="w-8 h-8 sm:w-[52px] sm:h-[52px] rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 ring-4 ring-slate-50 transition-transform group-hover:scale-110"
                                    style={{ background: `${s.color}15`, color: s.color }}
                                >
                                    <s.icon size={15} strokeWidth={2.5} className="sm:hidden" />
                                    <s.icon size={22} strokeWidth={2} className="hidden sm:block" />
                                </div>
                                <div className="min-w-0">
                                    <p className="hidden sm:block text-[0.7rem] font-black text-slate-400 uppercase tracking-[0.15em] mb-1 group-hover:text-slate-500 transition-colors">
                                        {s.label}
                                    </p>
                                    <h3 className="text-lg sm:text-2xl font-black text-slate-800 tabular-nums leading-none">{s.value}</h3>
                                </div>
                            </div>
                            {/* Label visible only on mobile (below number) */}
                            <p className="sm:hidden text-[8px] font-black text-slate-400 uppercase tracking-widest truncate mt-1">{s.label}</p>
                        </motion.div>
                    ))}
                </div>

                {/* ── Controls ── */}
                <div className="flex flex-col gap-4 mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                        {/* Search */}
                        <div className="relative flex-1 group">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search by name, in-charge or location..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-5 py-3.5 sm:py-4 rounded-[20px] border border-slate-200 bg-slate-50/30 text-sm sm:text-[0.95rem] font-medium outline-none focus:bg-white focus:border-indigo-500 focus:shadow-[0_0_0_5px_rgba(99,102,241,0.1)] transition-all placeholder:text-slate-400"
                            />
                        </div>

                        {/* Right controls */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                            {/* View toggle — desktop only */}
                            <div className="hidden lg:flex items-center bg-slate-100/80 backdrop-blur-sm rounded-[18px] p-1.5 gap-1 border border-slate-200/50">
                                {[{ mode: 'grid', Icon: LayoutGrid }, { mode: 'table', Icon: List }].map(({ mode, Icon }) => (
                                    <button
                                        key={mode}
                                        className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all border-none cursor-pointer ${viewMode === mode ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-100/50' : 'text-slate-400 hover:text-indigo-600 hover:bg-white'}`}
                                        onClick={() => setViewMode(mode)}
                                        title={mode}
                                    >
                                        <Icon size={17} />
                                    </button>
                                ))}
                            </div>

                            {/* Bulk + Add buttons */}
                            <button
                                onClick={() => bulkInputRef.current?.click()}
                                disabled={isBulkUploading}
                                className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 sm:px-6 py-3.5 sm:py-4 rounded-[18px] font-black text-xs uppercase tracking-wider hover:bg-slate-50 hover:border-indigo-300 transition-all disabled:opacity-50 active:scale-95 shadow-sm whitespace-nowrap"
                            >
                                <Upload size={16} className="shrink-0" />
                                <span className="hidden sm:inline">Bulk</span>
                            </button>
                            <button
                                className="flex items-center justify-center gap-2 bg-slate-900 border-none text-white px-4 sm:px-6 py-3.5 sm:py-4 rounded-[18px] font-black text-xs uppercase tracking-wider hover:bg-indigo-600 transition-all shadow-[0_10px_30px_-5px_rgba(0,0,0,0.1)] active:scale-95 whitespace-nowrap"
                                onClick={handleCreate}
                            >
                                <Plus size={17} className="shrink-0" />
                                <span>Add Venue</span>
                            </button>
                        </div>
                    </div>
                </div>

                <input ref={bulkInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleBulkUpload} />

                {/* ── Bulk Result Banner ── */}
                <AnimatePresence>
                    {bulkResult && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className={`mb-6 p-4 sm:p-6 rounded-3xl flex items-start gap-4 border-2 shadow-sm ${bulkResult.error ? 'bg-rose-50 border-rose-100 text-rose-800' : 'bg-emerald-50 border-emerald-100 text-emerald-900'}`}
                        >
                            <div className={`p-2 rounded-xl scale-110 ${bulkResult.error ? 'bg-rose-100/50' : 'bg-emerald-100/50'}`}>
                                {bulkResult.error ? <AlertCircle size={20} className="shrink-0" /> : <CheckCircle2 size={20} className="shrink-0" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                {bulkResult.error
                                    ? <p className="font-black text-sm uppercase tracking-tight">Deployment Error: {bulkResult.error}</p>
                                    : <div className="space-y-1">
                                        <p className="font-black text-sm uppercase tracking-tight text-emerald-800">Operational Update Dispatched</p>
                                        <div className="flex flex-wrap gap-3 text-xs font-bold opacity-80">
                                            <span>SUCCESS: {(bulkResult.results || []).filter(r => r.status === 'created').length}</span>
                                            <span>UNCHANGED: {(bulkResult.results || []).filter(r => r.status === 'skipped').length}</span>
                                            <span>FAILURES: {(bulkResult.results || []).filter(r => r.status === 'failed').length}</span>
                                        </div>
                                    </div>
                                }
                            </div>
                            <button onClick={() => setBulkResult(null)} className="p-2 hover:bg-black/5 rounded-xl transition-colors border-none bg-transparent cursor-pointer shrink-0">
                                <X size={18} className="text-slate-400" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Content ── */}
                {isLoading ? (
                    <div className="py-20 sm:py-24 flex flex-col items-center justify-center gap-5 text-slate-300">
                        <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-500 rounded-full animate-spin" />
                        <p className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-slate-400 text-center">
                            Restoring Inventory State...
                        </p>
                    </div>
                ) : paginatedVenues.length === 0 ? (
                    <div className="py-16 sm:py-24 flex flex-col items-center justify-center gap-6 bg-slate-50/50 rounded-[32px] sm:rounded-[40px] border-2 border-dashed border-slate-200">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-3xl flex items-center justify-center shadow-lg text-slate-200 ring-8 ring-slate-50/50">
                            <MapPin size={36} strokeWidth={1.5} />
                        </div>
                        <div className="text-center px-6">
                            <h3 className="text-lg font-black text-slate-800 mb-1">Infrastructure Point Not Found</h3>
                            <p className="text-sm font-medium text-slate-400">Modify your parameters or initialize a new venue point above.</p>
                        </div>
                    </div>
                ) : viewMode === 'grid' ? (
                    /* ── Grid View ── */
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
                        {paginatedVenues.map((v, idx) => {
                            const hasIncharge = v.incharge?.name || v.owner_name;
                            return (
                                <motion.div
                                    key={v.id || idx}
                                    layout
                                    className="group bg-white rounded-[28px] sm:rounded-[32px] border border-slate-200/60 overflow-hidden hover:border-indigo-400 transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(99,102,241,0.15)] flex flex-col h-full"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 + 0.1 }}
                                >
                                    {/* Card image */}
                                    <div className="relative h-44 sm:h-52 bg-slate-100 overflow-hidden shrink-0">
                                        {getImageUrl(v.image_url || v.image) ? (
                                            <img src={getImageUrl(v.image_url || v.image)} alt={v.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-200 gap-3">
                                                <Box size={44} strokeWidth={1} />
                                                <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-60">Visual Missing</span>
                                            </div>
                                        )}
                                        {/* Status badge */}
                                        <div className="absolute top-3 left-3">
                                            <span className={`px-2.5 py-1 rounded-xl text-[0.65rem] font-black uppercase tracking-wider backdrop-blur-md border border-white/20 shadow-lg ${
                                                (v.status || 'available') === 'available' ? 'bg-emerald-500/90 text-white' : 'bg-amber-500/90 text-white'
                                            }`}>
                                                {v.status || 'available'}
                                            </span>
                                        </div>
                                        {/* Action buttons on image — always visible */}
                                        <div className="absolute top-3 right-3 flex gap-2">
                                            <button
                                                className="w-9 h-9 bg-white text-slate-600 rounded-xl flex items-center justify-center shadow-xl border-none cursor-pointer hover:bg-slate-900 hover:text-white transition-colors"
                                                onClick={(e) => { e.stopPropagation(); handleEdit(v); }}
                                                title="Edit"
                                            >
                                                <Edit2 size={15} />
                                            </button>
                                            <button
                                                className="w-9 h-9 bg-white text-rose-500 rounded-xl flex items-center justify-center shadow-xl border-none cursor-pointer hover:bg-rose-500 hover:text-white transition-colors"
                                                onClick={(e) => { e.stopPropagation(); handleDeleteClick(v); }}
                                                title="Delete"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Card body */}
                                    <div className="p-5 sm:p-6 flex flex-col flex-1">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="min-w-0 pr-3">
                                                <h3 className="text-lg sm:text-xl font-black text-slate-900 truncate mb-1" title={v.name}>
                                                    {v.name}
                                                </h3>
                                                <div className="flex items-center gap-1.5 text-slate-400">
                                                    <MapPin size={11} className="shrink-0" />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest truncate">
                                                        {v.location || 'Central Complex'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="bg-indigo-50 text-indigo-500 p-2.5 rounded-2xl ring-4 ring-indigo-50/50 shrink-0">
                                                <Box size={18} strokeWidth={2.5} />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 mb-5">
                                            <div className="bg-slate-50/50 p-3 rounded-[18px] border border-slate-100/50">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Category</p>
                                                <p className="text-[0.8rem] font-extrabold text-slate-700 truncate">
                                                    {v.venue_type || v.type || 'Institutional'}
                                                </p>
                                            </div>
                                            <div className="bg-slate-50/50 p-3 rounded-[18px] border border-slate-100/50">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1.5">In-Charge</p>
                                                <p className={`text-[0.8rem] font-extrabold truncate ${hasIncharge ? 'text-indigo-600' : 'text-slate-300'}`}>
                                                    {hasIncharge || 'Unassigned'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-auto">
                                            <button
                                                className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3.5 rounded-2xl text-[0.7rem] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-[0.97] border-none cursor-pointer"
                                                onClick={(e) => { e.stopPropagation(); handleAssignIncharge(v); }}
                                            >
                                                <UserPlus size={15} />
                                                <span>Assign Privileges</span>
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    /* ── Table View ── */
                    <div className="bg-white rounded-[28px] sm:rounded-[40px] border border-slate-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.03)] overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse min-w-[800px]">
                                <thead className="bg-slate-50/40 border-b border-slate-100/50">
                                    <tr>
                                        {['Unit Identity', 'Classification', 'State', 'Delegate', 'Actions'].map((h, i) => (
                                            <th key={i} className={`px-5 lg:px-8 py-5 text-[0.65rem] font-black uppercase tracking-[0.2em] text-slate-400 ${i === 4 ? 'text-right' : 'text-left'}`}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {paginatedVenues.map((v, idx) => (
                                        <tr key={v.id || idx} className="hover:bg-indigo-50/20 transition-all duration-300 group">
                                            <td className="px-5 lg:px-8 py-4 lg:py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform">
                                                        {getImageUrl(v.image_url || v.image)
                                                            ? <img src={getImageUrl(v.image_url || v.image)} className="w-full h-full object-cover" alt="" />
                                                            : <Box size={22} className="text-slate-200" />
                                                        }
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm sm:text-base font-black text-slate-900 truncate max-w-[160px] lg:max-w-[240px]">{v.name}</p>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{v.location || 'Institutional Facility'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 lg:px-8 py-4 lg:py-6">
                                                <div className="bg-slate-100/50 inline-block px-3 py-1 rounded-lg">
                                                    <p className="text-xs font-black text-slate-700 uppercase tracking-tight">{v.venue_type || v.type || 'General'}</p>
                                                </div>
                                            </td>
                                            <td className="px-5 lg:px-8 py-4 lg:py-6">
                                                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[0.65rem] font-black uppercase tracking-[0.05em] border-2 shadow-sm ${
                                                    (v.status || 'available') === 'available' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                                }`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${(v.status || 'available') === 'available' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                                                    {v.status || 'available'}
                                                </span>
                                            </td>
                                            <td className="px-5 lg:px-8 py-4 lg:py-6">
                                                <p className={`text-sm font-black ${ (v.incharge?.name || v.owner_name) ? 'text-slate-800' : 'text-slate-300' }`}>
                                                    {v.incharge?.name || v.owner_name || 'PENDING'}
                                                </p>
                                            </td>
                                            {/* Always-visible action buttons */}
                                            <td className="px-5 lg:px-8 py-4 lg:py-6">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => handleEdit(v)} className="w-9 h-9 rounded-[14px] bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-400 hover:shadow-lg transition-all cursor-pointer" title="Edit">
                                                        <Edit2 size={15} />
                                                    </button>
                                                    <button onClick={() => handleAssignIncharge(v)} className="w-9 h-9 rounded-[14px] bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:border-emerald-400 hover:shadow-lg transition-all cursor-pointer" title="Assign">
                                                        <UserPlus size={15} />
                                                    </button>
                                                    <button onClick={() => handleDeleteClick(v)} className="w-9 h-9 rounded-[14px] bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:border-rose-400 hover:shadow-lg transition-all cursor-pointer" title="Delete">
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
                <div className="mt-8 lg:mt-12 mb-4">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        itemsPerPage={itemsPerPage}
                        onItemsPerPageChange={setItemsPerPage}
                        totalItems={filteredVenues.length}
                        showingCount={paginatedVenues.length}
                    />
                </div>
            </div>

            {/* Modals */}
            <VenueModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} venueData={selectedVenue} mode={modalMode} onSuccess={() => { fetchVenues(); setIsModalOpen(false); }} />
            <DeleteConfirmModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Protocol: Delete Access"
                confirmText="Execute Deletion"
                message={<div className="font-medium text-slate-600 leading-relaxed">System warning: Are you certain you wish to terminate the operational profile for <strong>{selectedVenue?.name}</strong>? This action will result in permanent removal of all infrastructure associations.</div>}
            />
        </motion.div>
    );
};

export default InfrastructurePage;
