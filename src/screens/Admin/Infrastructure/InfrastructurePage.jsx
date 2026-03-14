import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Box, UserCheck, Plus, Search, Edit2, UserPlus, Trash2, LayoutGrid, List, CheckCircle2, XCircle, Clock } from 'lucide-react';
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
    const [viewMode, setViewMode] = useState('table');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedVenue, setSelectedVenue] = useState(null);
    const [modalMode, setModalMode] = useState('create');

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
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

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

    const filteredVenues = venues.filter(v =>
        (v.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.incharge?.name || v.owner_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.venue_type || v.type || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Paginated Venues
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const paginatedVenues = filteredVenues.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredVenues.length / itemsPerPage);

    const stats = [
        { label: 'Total Venues', value: venues.length, icon: MapPin, color: '#6366f1' },
        { label: 'Available Now', value: venues.filter(v => (v.status || 'available') === 'available').length, icon: CheckCircle2, color: '#10b981' },
        { label: 'Under Maintenance', value: venues.filter(v => v.status === 'maintenance').length, icon: Clock, color: '#f59e0b' },
    ];

    const getImageUrl = (url) => { if (!url) return null; if (url.startsWith('http')) return url; return `${BASE_URL}${url}`; };

    return (
        <motion.div className="p-6 bg-white min-h-full" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="max-w-[1600px] mx-auto">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-5 mb-8 max-md:grid-cols-1">
                    {stats.map((s, idx) => (
                        <motion.div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-sm"
                            whileHover={{ y: -4 }} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.1 }}>
                            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${s.color}15`, color: s.color }}><s.icon size={22} /></div>
                            <div><p className="text-[0.75rem] font-bold text-slate-400 uppercase tracking-wide mb-0.5">{s.label}</p><h3 className="text-2xl font-extrabold text-slate-800">{s.value}</h3></div>
                        </motion.div>
                    ))}
                </div>

                {/* Header */}
                <div className="flex gap-4 mb-6 items-center flex-wrap">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" placeholder="Search venues, types or owners..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-indigo-500" />
                    </div>
                    <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-1">
                        {[{ mode: 'grid', Icon: LayoutGrid }, { mode: 'table', Icon: List }].map(({ mode, Icon }) => (
                            <button key={mode} className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all ${viewMode === mode ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`} onClick={() => setViewMode(mode)}><Icon size={18} /></button>
                        ))}
                    </div>
                    <button className="flex items-center gap-2 bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-600 transition-all shadow-[0_4px_12px_rgba(99,102,241,0.2)]" onClick={handleCreate}>
                        <Plus size={18} /><span>Add Venue</span>
                    </button>
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="py-16 flex flex-col items-center gap-3 text-slate-400">
                        <div className="w-10 h-10 border-[3px] border-slate-100 border-t-indigo-500 rounded-full animate-spin"></div>
                        <p className="text-sm">Fetching infrastructure details...</p>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
                        {paginatedVenues.length === 0 ? (
                            <div className="col-span-full text-center py-12 text-slate-400 font-medium text-sm">No venues match your search.</div>
                        ) : paginatedVenues.map((venue, idx) => {
                            const status = venue.status || 'available';
                            const hasIncharge = venue.incharge?.name || venue.owner_name;
                            return (
                                <motion.div key={venue.id || idx} className={`bg-white rounded-2xl border overflow-hidden shadow-sm cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all ${selectedVenue?.id === venue.id ? 'border-indigo-300 ring-2 ring-indigo-200' : 'border-slate-200'}`}
                                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.04 }} onClick={() => setSelectedVenue(venue)}>
                                    <div className="h-36 bg-slate-100 relative">
                                        {getImageUrl(venue.image_url || venue.image) ? (
                                            <img src={getImageUrl(venue.image_url || venue.image)} alt={venue.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300"><MapPin size={32} /></div>
                                        )}
                                        <div className="absolute top-3 right-3 flex gap-1.5">
                                            <button className="w-8 h-8 bg-white/90 backdrop-blur rounded-lg flex items-center justify-center text-slate-500 hover:text-indigo-500 shadow-sm" onClick={(e) => { e.stopPropagation(); handleEdit(venue); }}><Edit2 size={15} /></button>
                                            <button className="w-8 h-8 bg-white/90 backdrop-blur rounded-lg flex items-center justify-center text-slate-500 hover:text-red-500 shadow-sm" onClick={(e) => { e.stopPropagation(); handleDeleteClick(venue); }}><Trash2 size={15} /></button>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-base font-bold text-slate-800">{venue.name}</h3>
                                            <span className={`text-[0.7rem] font-bold uppercase px-2 py-0.5 rounded-md ${statusStyles[status] || statusStyles.available}`}>{status}</span>
                                        </div>
                                        <p className="text-xs text-slate-400 mb-3 line-clamp-2">{venue.description || 'No description available.'}</p>
                                        <div className="flex flex-col gap-1.5 mb-4">
                                            <div className="flex items-center gap-1.5 text-xs text-slate-500"><Box size={13} /><span>{venue.venue_type || venue.type || 'General'}</span></div>
                                            <div className="flex items-center gap-1.5 text-xs text-slate-500"><MapPin size={13} /><span>{venue.location || 'Main Campus'}</span></div>
                                            <div className="flex items-center gap-1.5 text-xs"><UserCheck size={13} className={hasIncharge ? 'text-emerald-500' : 'text-slate-400'} /><span className={hasIncharge ? 'text-emerald-600 font-semibold' : 'text-slate-400'}>{hasIncharge || 'Unassigned'}</span></div>
                                        </div>
                                        <button className="w-full py-2 bg-indigo-50 text-indigo-600 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 hover:bg-indigo-100 transition-all"
                                            onClick={(e) => { e.stopPropagation(); handleAssignIncharge(venue); }}>
                                            <UserPlus size={14} /><span>{hasIncharge ? 'Change Incharge' : 'Assign Incharge'}</span>
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full min-w-[800px]">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>{['Venue Name', 'Type & Location', 'Status', 'Owner / Incharge', 'Actions'].map((h, i) => (
                                        <th key={i} className={`px-4 py-3.5 text-[0.7rem] font-extrabold uppercase tracking-wide text-slate-400 ${i === 4 ? 'text-right' : 'text-left'}`}>{h}</th>
                                    ))}</tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {paginatedVenues.map((venue, idx) => {
                                        const status = venue.status || 'available';
                                        return (
                                            <tr key={venue.id || idx} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center text-slate-400 text-xs font-bold">
                                                            {getImageUrl(venue.image_url || venue.image) ? <img src={getImageUrl(venue.image_url || venue.image)} alt="" className="w-full h-full object-cover" /> : venue.name.substring(0, 2).toUpperCase()}
                                                        </div>
                                                        <div><p className="text-sm font-bold text-slate-800">{venue.name}</p><p className="text-xs text-slate-400 truncate max-w-[160px]">{venue.description ? venue.description.substring(0, 40) + '...' : 'No description'}</p></div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3.5"><p className="text-sm font-semibold text-slate-700">{venue.venue_type || venue.type || 'General'}</p><p className="text-xs text-slate-400">{venue.location || 'Main Campus'}</p></td>
                                                <td className="px-4 py-3.5">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[0.7rem] font-bold uppercase ${statusStyles[status] || statusStyles.available}`}>
                                                        {status === 'available' ? <CheckCircle2 size={12} /> : status === 'maintenance' ? <Clock size={12} /> : <XCircle size={12} />}{status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <span className={`text-sm font-semibold ${(venue.incharge?.name || venue.owner_name) ? 'text-slate-700' : 'text-slate-300'}`}>{venue.incharge?.name || venue.owner_name || 'Unassigned'}</span>
                                                </td>
                                                <td className="px-4 py-3.5 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        {[{ Icon: Edit2, fn: handleEdit, cls: 'hover:text-indigo-500 hover:border-indigo-300' }, { Icon: UserPlus, fn: handleAssignIncharge, cls: 'hover:text-emerald-500 hover:border-emerald-300' }, { Icon: Trash2, fn: handleDeleteClick, cls: 'hover:text-red-500 hover:border-red-300' }].map(({ Icon, fn, cls }, i) => (
                                                            <button key={i} className={`w-8 h-8 border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 transition-all ${cls}`} onClick={() => fn(venue)}><Icon size={15} /></button>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    onItemsPerPageChange={setItemsPerPage}
                    totalItems={filteredVenues.length}
                    showingCount={paginatedVenues.length}
                />

                <VenueModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} venueData={selectedVenue} mode={modalMode} onSuccess={() => { fetchVenues(); setIsModalOpen(false); }} />
                <DeleteConfirmModal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={handleDeleteConfirm} title="Delete Venue?" confirmText="Delete Venue"
                    message={<>Are you sure you want to remove <strong>{selectedVenue?.name}</strong>? This action will permanently remove the venue from the institutional infrastructure.</>} />
            </div>
        </motion.div>
    );
};

export default InfrastructurePage;
