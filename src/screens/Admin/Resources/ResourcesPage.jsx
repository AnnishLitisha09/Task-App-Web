import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Plus, Box, User, Monitor,
    LayoutGrid, List, MoreVertical, Edit2, UserPlus, 
    CheckCircle2, Clock, XCircle, MapPin, Cpu, ArrowRightLeft, 
    Save, X, Settings2, Info, AlertTriangle, Hammer, Wrench, Layers, Activity, Check, Upload, FileText
} from 'lucide-react';
import api from '../../../utils/api';
import ResourceModal from '../../../components/UI/ResourceModal/ResourceModal';
import DeleteConfirmModal from '../../../components/UI/DeleteConfirmModal/DeleteConfirmModal';
import Pagination from '../../../components/UI/Pagination/Pagination';
import UniversalModal from '../../../components/UI/UniversalModal';

const ResourcesPage = () => {
    const [viewType, setViewType] = useState('assets'); // 'assets' | 'venues' | 'maintenance'
    const [resources, setResources] = useState([]);
    const [venues, setVenues] = useState([]);
    const [maintenanceLogs, setMaintenanceLogs] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedResource, setSelectedResource] = useState(null);
    const [selectedVenue, setSelectedVenue] = useState(null);
    const [selectedMasterId, setSelectedMasterId] = useState('');
    const [assignmentCount, setAssignmentCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    // Incident Logging State
    const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
    const [incidentData, setIncidentData] = useState({
        venue_id: '',
        issue_title: '',
        category: 'general',
        description: '',
        location: '',
        cost: 0,
        status: 'pending',
        start_time: new Date().toISOString().split('T')[0]
    });
    
    // Detail View State
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [detailResources, setDetailResources] = useState([]);
    const [isDetailLoading, setIsDetailLoading] = useState(false);

    // Removal Modal State
    const [isRemovalOpen, setIsRemovalOpen] = useState(false);
    const [removalTarget, setRemovalTarget] = useState(null);
    const [removalQty, setRemovalQty] = useState(1);
    
    // Global Alert State
    const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: '', description: '', type: 'info' });
    const [bulkResult, setBulkResult] = useState(null);
    const [isBulkUploading, setIsBulkUploading] = useState(false);
    const [fromDate, setFromDate] = useState(new Date(new Date().setDate(new Date().getDate() - 90)).toISOString().split('T')[0]);
    const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
    const bulkInputRef = useRef(null);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(viewType === 'assets' ? 10 : 8);

    useEffect(() => {
        fetchData();
        setCurrentPage(1);
    }, [viewType]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            if (viewType === 'assets') {
                const data = await api('/resources/master');
                setResources(Array.isArray(data) ? data : (data.resources || []));
            } else if (viewType === 'venues') {
                const venueResponse = await api('/resources/venues');
                const venueData = Array.isArray(venueResponse) ? venueResponse : (venueResponse.venues || []);
                setVenues(venueData);
                
                // Also need master resources for assignment in assignment modal
                const masterData = await api('/resources/master');
                setResources(Array.isArray(masterData) ? masterData : (masterData.resources || []));
            } else if (viewType === 'maintenance') {
                const venueResponse = await api('/resources/venues');
                const venueData = Array.isArray(venueResponse) ? venueResponse : (venueResponse.venues || []);
                setVenues(venueData);
                
                const logData = await api('/resources/maintenance/logs');
                setMaintenanceLogs(Array.isArray(logData.logs) ? logData.logs : (logData || []));
            }
        } catch (err) {
            console.error('Failed to fetch data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Filter Logic
    const filteredItems = useMemo(() => {
        const query = searchQuery.toLowerCase();
        if (viewType === 'assets') {
            return resources.filter(res => 
                (res.name || '').toLowerCase().includes(query) ||
                (res.description || '').toLowerCase().includes(query)
            );
        } else if (viewType === 'venues') {
            return venues.filter(v => 
                (v.name || '').toLowerCase().includes(query) ||
                (v.location || '').toLowerCase().includes(query)
            );
        }
        return [];
    }, [resources, venues, searchQuery, viewType]);

    // Paginated Items
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const paginatedItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredItems.length / (itemsPerPage || 1)) || 1;

    // Handlers for Assets
    const handleCreate = () => { setSelectedResource(null); setModalMode('create'); setIsModalOpen(true); };
    const handleEdit = (resource) => { setSelectedResource(resource); setModalMode('edit'); setIsModalOpen(true); };
    
    const handleDeleteClick = (e, resource) => {
        e.stopPropagation();
        setSelectedResource(resource);
        setIsDeleteOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedResource) return;
        try {
            const rid = selectedResource.id || selectedResource.resource_id;
            await api(`/resources/${rid}`, { method: 'DELETE' });
            fetchData();
        } catch (err) {
            console.error('Failed to delete resource:', err);
        } finally {
            setIsDeleteOpen(false);
            setSelectedResource(null);
        }
    };

    // Handlers for Venues
    const handleUpdateAllocation = async () => {
        const vid = selectedVenue?.id || selectedVenue?.venue_id;
        const mid = parseInt(selectedMasterId);
        const qty = parseInt(assignmentCount);

        if (!vid || !mid || qty <= 0) {
            alert("Please select an asset and quantity.");
            return;
        }

        setIsSaving(true);
        try {
            await api(`/resources/assign?venue-id=${vid}`, {
                method: 'POST',
                body: { 
                    venue_id: vid,
                    master_resource_id: mid, 
                    quantity: qty
                }
            });
            setSelectedVenue(null);
            fetchData();
        } catch (err) {
            console.error('Failed to assign resource:', err);
            alert(err.message || 'Failed to assign resource.');
        } finally { setIsSaving(false); }
    };

    const handleLogIncident = async () => {
        if (!incidentData.venue_id || !incidentData.issue_title) {
            alert("Please fill in the required fields.");
            return;
        }

        setIsSaving(true);
        try {
            await api('/resources/maintenance/logs', {
                method: 'POST',
                body: incidentData
            });
            setIsIncidentModalOpen(false);
            setIncidentData({
                venue_id: '',
                issue_title: '',
                category: 'general',
                description: '',
                location: '',
                cost: 0,
                status: 'pending',
                start_time: new Date().toISOString().split('T')[0]
            });
            fetchData();
        } catch (err) {
            console.error('Failed to log incident:', err);
            alert(err.message || 'Failed to log incident.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleViewDetails = async (venue) => {
        const vid = venue.id || venue.venue_id;
        setSelectedVenue(venue);
        setIsDetailOpen(true);

        // Use already-loaded available_resources as immediate data, then refresh from API
        const immediate = venue.available_resources || venue.assets?.map(name => ({ name })) || [];
        setDetailResources(immediate);
        setIsDetailLoading(immediate.length === 0); // only show spinner if no immediate data

        try {
            const res = await api(`/resources/venue/${vid}`);
            // API returns { resources: [...] } where each resource has name, quantity, status, etc.
            const loaded = res.resources || res.available_resources || res || [];
            setDetailResources(Array.isArray(loaded) ? loaded : []);
        } catch (err) {
            console.error('Failed to fetch venue details:', err);
        } finally {
            setIsDetailLoading(false);
        }
    };

    const handleRemoveAssignment = (venueResourceId, currentQty, resourceName) => {
        setRemovalTarget({ id: venueResourceId, max: currentQty, name: resourceName });
        setRemovalQty(currentQty);
        setIsRemovalOpen(true);
    };

    const confirmRemoval = async () => {
        if (!removalTarget || removalQty <= 0) return;
        if (removalQty > removalTarget.max) {
            alert("Quantity exceeds current stock.");
            return;
        }

        setIsSaving(true);
        try {
            await api('/resources/remove-assignment', {
                method: 'POST',
                body: { resource_id: removalTarget.id, quantity: removalQty }
            });
            
            setIsRemovalOpen(false);
            if (selectedVenue) handleViewDetails(selectedVenue);
            fetchData();
        } catch (err) {
            console.error('Failed to remove assignment:', err);
            alert(err.message || 'Failed to remove assignment.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleModalSuccess = () => {
        fetchData();
        setIsModalOpen(false);
        setAlertConfig({
            isOpen: true,
            title: "Inventory Synced",
            description: "The resource record has been successfully committed to the global master catalog.",
            type: "success"
        });
    };

    const handleBulkUploadAssets = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsBulkUploading(true);
        setBulkResult(null);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await api('/resources/bulk', { method: 'POST', body: formData });
            setBulkResult(res);
            fetchData();
        } catch (err) {
            setBulkResult({ error: err.message });
        } finally {
            setIsBulkUploading(false);
            e.target.value = '';
        }
    };

    const handleDownloadReport = async () => {
        try {
            const blob = await api(`resources/export?from=${fromDate}&to=${toDate}`);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `resource_utilization_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error('Download failed:', err);
            alert('Failed to download resource report: ' + err.message);
        }
    };

    const getVenueCount = (v) => {
        const raw = v.total_resource_count ?? v.systems_count ?? v.resource_count ?? v.count ?? 0;
        return parseInt(raw) || 0;
    };

    const stats = viewType === 'assets' ? [
        { label: 'Master Assets', value: resources.length, icon: Box, color: '#6366f1' },
        { label: 'Total Stock', value: resources.reduce((acc, r) => acc + (parseInt(r.quantity) || 0), 0), icon: Layers, color: '#10b981' },
        { label: 'In Maintenance', value: resources.filter(r => r.status === 'maintenance').length, icon: Hammer, color: '#f59e0b' },
    ] : [
        { label: 'Total Venues', value: venues.length, icon: MapPin, color: '#6366f1' },
        { label: 'Assigned Systems', value: venues.reduce((acc, v) => acc + getVenueCount(v), 0), icon: Monitor, color: '#3b82f6' },
        { label: 'Active Reports', value: maintenanceLogs.length, icon: AlertTriangle, color: '#ef4444' }, 
    ];

    return (
        <div className="h-full flex flex-col bg-[#fcfcfd] overflow-hidden font-sans text-slate-600">
            {/* --- HEADER --- */}
            <div className="flex-none px-10 max-lg:px-8 max-md:px-6 max-sm:px-4 pt-8 pb-6 bg-white border-b border-slate-100">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
                    <div className="space-y-1">
                        <h1 className="text-3xl max-md:text-2xl font-bold text-slate-900 tracking-tight">Resource <span className="text-indigo-600">Management</span></h1>
                        <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-[0.2em] font-bold opacity-70">Strategic Asset Governance & Infrastructure Logic</p>
                    </div>
                    
                    <div className="flex bg-slate-50 p-1.5 rounded-[22px] border border-slate-100 shadow-inner w-full lg:w-auto overflow-x-auto no-scrollbar pb-1.5 lg:pb-1.5">
                        {[
                            { id: 'assets', label: 'Asset Master', icon: Box },
                            { id: 'venues', label: 'Allocation', icon: MapPin },
                            { id: 'maintenance', label: 'Maintenance', icon: Wrench }
                        ].map(tab => (
                            <button 
                                key={tab.id}
                                onClick={() => setViewType(tab.id)}
                                className={`px-6 sm:px-8 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 shrink-0 ${viewType === tab.id ? 'bg-white text-indigo-600 shadow-[0_10px_25px_-5px_rgba(99,102,241,0.2)]' : 'text-slate-400 hover:text-slate-600 active:scale-95'}`}
                            >
                                <tab.icon size={16} strokeWidth={2.5} />
                                <span className="max-sm:hidden">{tab.label}</span>
                                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mb-10 max-sm:gap-4">
                    {stats.map((stat, idx) => (
                        <motion.div key={idx} 
                            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                            className="bg-white p-6 max-sm:p-5 rounded-[32px] border border-slate-100 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.03)] flex items-center gap-6 hover:border-indigo-100 hover:shadow-[0_25px_50px_-15px_rgba(0,0,0,0.07)] transition-all group"
                        >
                            <div className="w-16 h-16 max-sm:w-14 max-sm:h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                                <stat.icon size={32} strokeWidth={2.5} className="max-sm:w-6 max-sm:h-6" />
                            </div>
                            <div className="flex-1">
                                <span className="block text-[0.65rem] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</span>
                                <h3 className="text-3xl max-sm:text-2xl font-black text-slate-900 tracking-tighter leading-none">{stat.value}</h3>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="relative w-full md:max-w-md group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder={viewType === 'assets' ? "Query master catalog..." : "Query regional inventory..."}
                            className="w-full pl-14 pr-6 py-4 bg-slate-50/50 border-2 border-slate-100 rounded-[22px] focus:outline-none focus:border-indigo-400 focus:bg-white focus:shadow-[0_15px_30px_-10px_rgba(99,102,241,0.1)] transition-all text-[0.95rem] font-bold text-slate-700 placeholder:text-slate-300"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        {viewType === 'assets' ? (
                            <>
                                <input ref={bulkInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleBulkUploadAssets} />
                                <button
                                    onClick={() => bulkInputRef.current?.click()}
                                    disabled={isBulkUploading}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-3 border-2 border-indigo-100 text-indigo-600 bg-white px-8 py-4 rounded-[22px] text-xs font-black uppercase tracking-widest hover:bg-indigo-50 hover:border-indigo-300 transition-all disabled:opacity-50 active:scale-95 shadow-sm"
                                >
                                    <Upload size={18} strokeWidth={2.5} />
                                    <span>{isBulkUploading ? 'Syncing…' : 'Batch Sync'}</span>
                                </button>
                                <div className="hidden sm:flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                                    <input 
                                        type="date" 
                                        value={fromDate} 
                                        onChange={(e) => setFromDate(e.target.value)}
                                        className="bg-transparent border-none text-[10px] font-bold text-slate-600 outline-none"
                                    />
                                    <span className="text-[10px] font-bold text-slate-400">TO</span>
                                    <input 
                                        type="date" 
                                        value={toDate} 
                                        onChange={(e) => setToDate(e.target.value)}
                                        className="bg-transparent border-none text-[10px] font-bold text-slate-600 outline-none"
                                    />
                                </div>
                                <button
                                    onClick={handleDownloadReport}
                                    className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-emerald-600 px-4 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-emerald-50 hover:border-emerald-300 transition-all active:scale-95 shadow-sm whitespace-nowrap"
                                >
                                    <FileText size={15} className="shrink-0" />
                                    <span className="hidden sm:inline">Export Report</span>
                                </button>
                                <button
                                    onClick={handleCreate}
                                    className="flex-1 md:flex-none bg-slate-900 hover:bg-indigo-600 text-white px-8 py-4 rounded-[22px] text-xs font-black uppercase tracking-[0.2em] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] transition-all flex items-center justify-center gap-3 active:scale-95 border-none cursor-pointer"
                                >
                                    <Plus size={20} strokeWidth={3} /> 
                                    <span>Register New</span>
                                </button>
                            </>
                        ) : viewType === 'venues' ? (
                            <button className="w-full md:w-auto flex items-center justify-center gap-3 bg-slate-900 hover:bg-indigo-600 text-white px-8 py-4 rounded-[22px] text-xs font-black uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 border-none cursor-pointer">
                                <ArrowRightLeft size={20} strokeWidth={2.5} />
                                <span>Batch Allocate</span>
                            </button>
                        ) : (
                            <button 
                                onClick={() => setIsIncidentModalOpen(true)}
                                className="w-full md:w-auto bg-rose-600 hover:bg-rose-700 text-white px-8 py-4 rounded-[22px] text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-rose-100 transition-all flex items-center justify-center gap-3 border-none cursor-pointer"
                            >
                                <Plus size={20} strokeWidth={3} /> 
                                <span>Log Protocol Incident</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Bulk Upload Result Banner */}
            <AnimatePresence>
                {bulkResult && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                        className={`mx-10 max-md:mx-6 max-sm:mx-4 mt-6 p-6 rounded-[28px] flex items-start gap-4 border-2 ${bulkResult.error ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-emerald-50 border-emerald-100 text-emerald-800'} shadow-lg`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bulkResult.error ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'}`}>
                            {bulkResult.error ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
                        </div>
                        <div className="flex-1 pt-1">
                            {bulkResult.error
                                ? <p className="font-black uppercase tracking-tight text-sm">Deployment Failure: {bulkResult.error}</p>
                                : <>
                                    <p className="font-black uppercase tracking-tight text-sm">Batch Ingestion Successful</p>
                                    <div className="flex gap-4 mt-2">
                                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /> <span className="text-[10px] font-black uppercase">Created: {(bulkResult.results || []).filter(r => r.status === 'created').length}</span></div>
                                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500" /> <span className="text-[10px] font-black uppercase">Skipped: {(bulkResult.results || []).filter(r => r.status === 'skipped').length}</span></div>
                                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500" /> <span className="text-[10px] font-black uppercase">Failed: {(bulkResult.results || []).filter(r => r.status === 'failed').length}</span></div>
                                    </div>
                                    <p className="text-[9px] font-bold uppercase tracking-widest mt-3 opacity-60 flex items-center gap-2 italic"><Info size={10} /> Schema: name, quantity, [status], [venue_name]</p>
                                </>
                            }
                        </div>
                        <button onClick={() => setBulkResult(null)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-white hover:text-slate-900 transition-all border-none bg-transparent cursor-pointer"><X size={20} /></button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- CONTENT --- */}
            <div className="flex-1 px-8 py-8 min-h-0 overflow-y-auto custom-scrollbar">
                {isLoading ? (
                    <div className="h-full flex flex-col items-center justify-center gap-4 py-20">
                        <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-500 rounded-full animate-spin"></div>
                        <p className="text-sm font-black text-slate-400 animate-pulse uppercase tracking-widest">Accessing Secure Vault...</p>
                    </div>
                ) : viewType === 'assets' ? (
                    /* --- ASSET MASTER VIEW --- */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <AnimatePresence>
                            {paginatedItems.map((res, idx) => (
                                <AssetCard key={res.id || res.resource_id || idx} res={res} onEdit={() => handleEdit(res)} onDelete={(e) => handleDeleteClick(e, res)} />
                            ))}
                        </AnimatePresence>
                    </div>
                ) : viewType === 'venues' ? (
                    /* --- VENUES ASSIGNMENT VIEW --- */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        <AnimatePresence mode="popLayout">
                            {paginatedItems.map((venue, idx) => (
                                <VenueCard 
                                    key={venue.id || venue.venue_id || `venue-${idx}`} 
                                    venue={venue} 
                                    onAssign={() => { setSelectedVenue(venue); setSelectedMasterId(''); setAssignmentCount(0); }}
                                    onViewDetails={() => handleViewDetails(venue)}
                                    delay={idx % 8}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    /* --- MAINTENANCE LOGS VIEW --- */
                    <div className="space-y-6">
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Recent Status Reports</h3>
                            <div className="flex flex-col gap-4">
                                {maintenanceLogs.length > 0 ? maintenanceLogs.map(log => (
                                    <MaintenanceLogRow 
                                        key={log.log_id || log.id}
                                        venue={log.Venue?.name || `Venue ${log.venue_id}`}
                                        issue={log.issue_title}
                                        status={log.status}
                                        category={log.category}
                                        cost={log.cost}
                                    />
                                )) : (
                                    <div className="py-10 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                                        No active maintenance logs found.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* --- PAGINATION --- */}
            {viewType !== 'maintenance' && (
                <div className="px-8 py-4 bg-white border-t border-slate-50">
                    <Pagination
                        currentPage={currentPage} totalPages={totalPages}
                        onPageChange={setCurrentPage} itemsPerPage={itemsPerPage}
                        onItemsPerPageChange={setItemsPerPage}
                        totalItems={filteredItems.length} showingCount={paginatedItems.length}
                    />
                </div>
            )}

            {/* --- MODALS --- */}
            <ResourceModal
                isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
                resourceData={selectedResource} mode={modalMode} onSuccess={handleModalSuccess}
            />

            <UniversalModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Wipe Master Record"
                description={`Are you sure you want to delete "${selectedResource?.name}"? This will remove all trace from the master catalog.`}
                type="danger"
                confirmText="Terminate Record"
                isLoading={isSaving}
            />

            <AllocationModal 
                isOpen={!!selectedVenue} onClose={() => setSelectedVenue(null)}
                venue={selectedVenue} 
                masterResources={resources}
                selectedMasterId={selectedMasterId}
                setSelectedMasterId={setSelectedMasterId}
                count={assignmentCount} setCount={setAssignmentCount}
                onSave={handleUpdateAllocation}
                isSaving={isSaving}
            />

            <VenueDetailModal 
                isOpen={isDetailOpen} 
                onClose={() => { setIsDetailOpen(false); setSelectedVenue(null); }}
                venue={selectedVenue}
                resources={detailResources}
                isLoading={isDetailLoading}
                onRemove={handleRemoveAssignment}
            />

            <IncidentModal 
                isOpen={isIncidentModalOpen}
                onClose={() => setIsIncidentModalOpen(false)}
                venues={venues}
                data={incidentData}
                setData={setIncidentData}
                onSave={handleLogIncident}
                isSaving={isSaving}
            />

            <UniversalModal
                isOpen={alertConfig.isOpen}
                onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })}
                onConfirm={() => setAlertConfig({ ...alertConfig, isOpen: false })}
                title={alertConfig.title}
                description={alertConfig.description}
                type={alertConfig.type}
                confirmText="Acknowledge"
            />

            <UniversalModal
                isOpen={isRemovalOpen}
                onClose={() => setIsRemovalOpen(false)}
                onConfirm={confirmRemoval}
                title="Removal Registry"
                description={`You are about to subtract units of "${removalTarget?.name}" from this venue's active inventory.`}
                type="warning"
                confirmText="Execute Removal"
                isLoading={isSaving}
            >
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Quantity to Withdraw</label>
                    <div className="flex items-center gap-4">
                        <input
                            type="number"
                            min="1"
                            max={removalTarget?.max}
                            value={removalQty}
                            onChange={(e) => setRemovalQty(parseInt(e.target.value) || 0)}
                            className="flex-1 bg-white border border-slate-200 h-14 rounded-2xl px-5 font-black text-lg focus:outline-none focus:border-indigo-500 transition-all shadow-inner"
                        />
                        <div className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tight">
                            Max {removalTarget?.max}
                        </div>
                    </div>
                </div>
            </UniversalModal>
        </div>
    );
};

const AssetCard = ({ res, onEdit, onDelete }) => (
    <motion.div
        layout layoutId={res.id}
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="group bg-white rounded-3xl border border-slate-100 p-6 flex flex-col hover:shadow-2xl hover:shadow-indigo-50 hover:-translate-y-2 transition-all duration-500"
    >
        <div className="flex justify-between items-start mb-5">
            <div className="p-4 rounded-2xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-500 shadow-sm">
                <Box size={24} />
            </div>
            <StatusBadge status={res.status} />
        </div>
        <h3 className="text-lg font-black text-slate-800 line-clamp-1 mb-2 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{res.name}</h3>
        <p className="text-[11px] text-slate-400 mb-6 line-clamp-2 min-h-[3em] font-medium leading-relaxed italic">
            {res.description || 'Master specification not defined.'}
        </p>
        <div className="mt-auto grid grid-cols-2 gap-4 pb-4">
            <div className="bg-slate-50 rounded-2xl p-3 flex flex-col items-center">
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Total Qty</span>
                <span className="text-sm font-black text-slate-700">{res.quantity || 0}</span>
            </div>
            <div className="bg-slate-50 rounded-2xl p-3 flex flex-col items-center">
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">In Use</span>
                <span className="text-sm font-black text-indigo-500">{res.assigned_quantity || 0}</span>
            </div>
        </div>
        <div className="flex gap-2">
            <button onClick={onEdit} className="flex-1 py-3 bg-slate-50 rounded-xl text-[10px] font-black text-slate-500 hover:bg-slate-900 hover:text-white transition-all uppercase tracking-widest">Edit</button>
            <button onClick={onDelete} className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:bg-rose-500 hover:text-white transition-all"><XCircle size={18} /></button>
        </div>
    </motion.div>
);

const MaintenanceLogRow = ({ venue, issue, status, category, cost }) => (
    <div className="flex items-center justify-between p-6 bg-slate-50/50 rounded-3xl border border-white hover:border-slate-200 hover:bg-white transition-all group">
        <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm text-slate-400 group-hover:text-indigo-500 transition-colors">
                <Hammer size={24} />
            </div>
            <div>
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">{venue} • {issue}</h4>
                <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{category}</span>
                    <div className="w-1 h-1 rounded-full bg-slate-200" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">EST: ₹{cost}</span>
                </div>
            </div>
        </div>
        <div className="flex items-center gap-6">
            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                'bg-blue-50 text-blue-600 border-blue-100'
            }`}>
                {status}
            </span>
            <button className="p-3 bg-white rounded-xl text-slate-300 hover:text-slate-900 shadow-sm"><MoreVertical size={16} /></button>
        </div>
    </div>
);

const StatusBadge = ({ status }) => {
    const s = status?.toLowerCase();
    const styles = {
        'available': 'bg-emerald-50 text-emerald-600 border-emerald-100',
        'maintenance': 'bg-amber-50 text-amber-600 border-amber-100',
        'out_of_stock': 'bg-rose-50 text-rose-600 border-rose-100',
    };
    return (
        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${styles[s] || styles['available']} flex w-fit items-center gap-2`}>
            <div className={`w-1.5 h-1.5 rounded-full ${s === 'available' ? 'bg-emerald-500 animate-pulse' : s === 'maintenance' ? 'bg-amber-500' : 'bg-rose-500'}`} />
            {(s || 'Active').replace('_', ' ')}
        </span>
    );
};

const VenueCard = ({ venue, onAssign, onViewDetails, delay }) => {
    // Support both old (assets: string[]) and new (available_resources: object[]) API shapes
    const assets = venue.available_resources
        ? venue.available_resources.map(r => r.name)
        : (venue.assets || []);
    const count = parseInt(venue.total_resource_count ?? venue.systems_count ?? 0) || 0;
    return (
        <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: delay * 0.05 }}
            className="group bg-white rounded-4xl border border-slate-100 p-8 flex flex-col shadow-sm hover:shadow-[0_20px_60px_-15px_rgba(99,102,241,0.15)] hover:-translate-y-3 transition-all duration-700"
        >
            <div className="flex justify-between items-start mb-6">
                <div className="p-4 rounded-2xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-sm">
                    <MapPin size={24} />
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1.5">Zone Verified</span>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600`}>
                        {venue.status || 'Active'}
                    </span>
                </div>
            </div>
            <div className="mb-6">
                <h3 className="text-xl font-black text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{venue.name}</h3>
                <div className="flex items-center gap-2 mt-2 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                    <Settings2 size={12} /> <span>{venue.location || 'Central Campus'}</span>
                </div>
            </div>
            <div className="bg-[#fcfcfd] rounded-3xl p-6 mb-8 border border-slate-50 relative overflow-hidden group/box min-h-[140px] flex flex-col" onClick={onViewDetails}>
                <div className="flex justify-between items-center mb-4 cursor-pointer">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Cpu size={14} className="text-slate-300" /> Active Registry
                    </span>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-1">
                    {assets.length > 0 ? (
                        <>
                            {assets.slice(0, 2).map((assetName, idx) => (
                                <div key={idx} className="px-3 py-1.5 bg-white border border-slate-100 rounded-xl shadow-sm text-[9px] font-black text-slate-600 uppercase tracking-tighter flex items-center gap-1.5 hover:border-indigo-200 hover:text-indigo-600 transition-all duration-300">
                                    <div className="w-1 h-1 rounded-full bg-indigo-400" />
                                    {assetName}
                                </div>
                            ))}
                            {assets.length > 2 && (
                                <div className="px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-xl shadow-sm text-[9px] font-black text-indigo-600 uppercase tracking-tighter flex items-center gap-1.5 hover:bg-indigo-600 hover:text-white transition-all duration-300">
                                    +{assets.length - 2} More
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="w-full flex flex-col items-center justify-center py-4 text-slate-300 border-2 border-dashed border-slate-100 rounded-2xl">
                             <Box size={16} className="mb-1 opacity-50" />
                             <span className="text-[8px] font-black uppercase tracking-[2px]">Empty Zone</span>
                        </div>
                    )}
                </div>

                <div className="absolute inset-0 bg-indigo-600/0 group-hover/box:bg-indigo-600/5 flex items-center justify-center opacity-0 group-hover/box:opacity-100 transition-all cursor-pointer backdrop-blur-[1px]">
                    <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest bg-white px-4 py-2 rounded-full shadow-lg border border-indigo-50">Exploration Required</span>
                </div>
            </div>
            <div className="mt-auto space-y-4">
                <button onClick={onAssign}
                    className="w-full py-4 bg-slate-900 rounded-2xl text-[10px] font-black text-white shadow-xl shadow-slate-100 hover:bg-indigo-600 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
                >
                    <UserPlus size={16} /> Assign Assets
                </button>
            </div>
        </motion.div>
    );
};

const AllocationModal = ({ isOpen, onClose, venue, masterResources, selectedMasterId, setSelectedMasterId, count, setCount, onSave, isSaving }) => {
    if (!isOpen || !venue) return null;
    return (
        <div className="fixed inset-0 z-1000 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={onClose} />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="relative bg-white w-full max-w-sm rounded-[3rem] shadow-2xl overflow-hidden">
                <div className="p-8 pb-0 flex justify-between items-start">
                    <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600"><Monitor size={32} /></div>
                    <button onClick={onClose} className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all"><X size={20} /></button>
                </div>
                <div className="p-10">
                    <div className="mb-8 text-center">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-none">{venue.name}</h2>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center justify-center gap-2 mt-2"><MapPin size={12} /> Resource Allocation</p>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Select Master Asset</label>
                            <select 
                                className="w-full py-4 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:border-indigo-500 transition-all appearance-none"
                                value={selectedMasterId}
                                onChange={(e) => setSelectedMasterId(e.target.value)}
                            >
                                <option value="">Choose an asset type...</option>
                                {masterResources.map(res => (
                                    <option key={res.id || res.resource_id} value={res.id || res.resource_id}>
                                        {res.name} (Stock: {res.quantity})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="bg-[#fcfcfd] rounded-[2.5rem] p-8 border border-slate-50 flex flex-col items-center">
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-[3px] mb-6">Quantity to Deploy</span>
                            <div className="flex items-center gap-8">
                                <button onClick={() => setCount(Math.max(0, parseInt(count) - 1))} className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all font-black active:scale-75 text-xl">-</button>
                                <input 
                                    type="number"
                                    className="text-6xl font-black text-slate-900 tracking-tighter w-24 text-center bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    value={count}
                                    onChange={(e) => setCount(Math.max(0, parseInt(e.target.value) || 0))}
                                />
                                <button onClick={() => setCount(parseInt(count) + 1)} className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all font-black active:scale-75 text-xl">+</button>
                            </div>
                        </div>

                        <button onClick={onSave} disabled={isSaving || !selectedMasterId || count <= 0} className="w-full bg-indigo-600 py-6 rounded-3xl text-xs font-black text-white shadow-2xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-30 flex items-center justify-center gap-3 uppercase tracking-widest">
                            {isSaving ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <><Check size={20} /> Authorize Deployment</>}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const VenueDetailModal = ({ isOpen, onClose, venue, resources, isLoading, onRemove }) => {
    if (!isOpen || !venue) return null;

    return (
        <div className="fixed inset-0 z-1000 flex items-center justify-center p-6">
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
                onClick={onClose} 
            />
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 40 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                className="relative bg-white w-full max-w-2xl rounded-4xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
                <div className="p-8 pb-0 flex justify-between items-start flex-none">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-slate-100">
                            <Monitor size={32} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-none">{venue.name}</h2>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-2 mt-2">
                                <MapPin size={12} /> {venue.location || 'Venue Inventory'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all shadow-sm">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                    {isLoading ? (
                        <div className="py-20 flex flex-col items-center gap-4 text-slate-400">
                            <div className="w-10 h-10 border-4 border-slate-100 border-t-indigo-500 rounded-full animate-spin"></div>
                            <span className="text-[10px] font-black uppercase tracking-widest">Scanning Network...</span>
                        </div>
                    ) : resources.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                            {resources.map((item, idx) => (
                                <motion.div 
                                    key={item.resource_id || idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="p-5 bg-slate-50/50 rounded-3xl border border-slate-100 hover:border-indigo-100 hover:bg-white transition-all flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors shadow-sm">
                                            <Box size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">{item.name}</h4>
                                            <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1 italic">{item.description || 'Deployed equipment'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <span className="block text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Status</span>
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                                item.status === 'available' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                            }`}>
                                                {item.status}
                                            </span>
                                        </div>
                                        <div className="text-right border-l border-slate-200 pl-6 flex items-center gap-4">
                                            <div>
                                                <span className="block text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Qty</span>
                                                <span className="text-lg font-black text-slate-900">{item.quantity}</span>
                                            </div>
                                            <button 
                                                onClick={() => onRemove(item.resource_id, item.quantity, item.name)}
                                                className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                                title="Remove Assets"
                                            >
                                                <XCircle size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center flex flex-col items-center">
                            <Box size={48} className="text-slate-100 mb-4" />
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[2px]">No physical assets deployed to this zone.</p>
                        </div>
                    )}
                </div>

                <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                            <Info size={14} />
                        </div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Verification Required</span>
                    </div>
                    <button 
                        onClick={onClose}
                        className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                    >
                        Close Registry
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

const IncidentModal = ({ isOpen, onClose, venues, data, setData, onSave, isSaving }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-1000 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="relative bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-8 pb-4 flex justify-between items-center bg-white border-b border-slate-50 flex-none">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 shadow-sm">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-none">Log Incident</h2>
                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">Report Infrastructure Issue</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all shadow-sm"><X size={20} /></button>
                </div>
                
                <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Affected Zone *</label>
                            <select 
                                className="w-full py-4 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:border-indigo-500 transition-all appearance-none shadow-sm"
                                value={data.venue_id}
                                onChange={(e) => setData({...data, venue_id: e.target.value})}
                            >
                                <option value="">Select a venue...</option>
                                {venues.map(v => (
                                    <option key={v.venue_id} value={v.venue_id}>{v.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="col-span-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Issue Title *</label>
                            <input 
                                type="text"
                                className="w-full py-4 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-indigo-500 transition-all shadow-sm"
                                placeholder="e.g., Projector bulb exploded"
                                value={data.issue_title}
                                onChange={(e) => setData({...data, issue_title: e.target.value})}
                            />
                        </div>

                        <div>
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Category</label>
                            <select 
                                className="w-full py-4 px-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:border-indigo-500 transition-all appearance-none shadow-sm"
                                value={data.category}
                                onChange={(e) => setData({...data, category: e.target.value})}
                            >
                                <option value="electrical">Electrical</option>
                                <option value="plumbing">Plumbing</option>
                                <option value="network">Network / IT</option>
                                <option value="civil">Civil / Structural</option>
                                <option value="furniture">Furniture</option>
                                <option value="general">General</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Specific Location</label>
                            <input 
                                type="text"
                                className="w-full py-4 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-indigo-500 transition-all shadow-sm"
                                placeholder="e.g., Classroom 201"
                                value={data.location}
                                onChange={(e) => setData({...data, location: e.target.value})}
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Issue Details</label>
                            <textarea 
                                className="w-full py-4 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-indigo-500 transition-all h-24 resize-none shadow-sm"
                                placeholder="Describe the failure or requirement..."
                                value={data.description}
                                onChange={(e) => setData({...data, description: e.target.value})}
                            />
                        </div>

                        <div>
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Estimated Cost (₹)</label>
                            <input 
                                type="number"
                                className="w-full py-4 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-indigo-500 transition-all shadow-sm"
                                value={data.cost}
                                onChange={(e) => setData({...data, cost: e.target.value})}
                            />
                        </div>

                        <div>
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Reporting Date</label>
                            <input 
                                type="date"
                                className="w-full py-4 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500 transition-all shadow-sm"
                                value={data.start_time}
                                onChange={(e) => setData({...data, start_time: e.target.value})}
                            />
                        </div>
                    </div>
                </div>

                <div className="p-8 bg-slate-50 border-t border-slate-100 flex-none">
                    <button onClick={onSave} disabled={isSaving || !data.venue_id || !data.issue_title} className="w-full bg-slate-900 py-6 rounded-3xl text-[10px] font-black text-white shadow-2xl shadow-slate-200 hover:bg-rose-600 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-30 disabled:hover:bg-slate-900 disabled:hover:translate-y-0 flex items-center justify-center gap-3 uppercase tracking-widest">
                        {isSaving ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <><Check size={20} /> Authorize Maintenance Request</>}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default ResourcesPage;
