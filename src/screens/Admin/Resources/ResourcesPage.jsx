import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Plus, Box, User, Monitor,
    LayoutGrid, List, MoreVertical, Edit2, UserPlus, CheckCircle2, Clock, XCircle
} from 'lucide-react';
import ResourceModal from '../../../components/UI/ResourceModal/ResourceModal';

// --- MOCK DATA ---
const initialResources = [
    { id: '1', name: 'Dell XPS 15', status: 'Assigned', assignedTo: 'John Doe (Faculty)', details: 'Service Tag: XYZ123' },
    { id: '2', name: 'School Bus 04', status: 'Available', assignedTo: '-', details: 'Route: North Campus' },
    { id: '3', name: 'Projector A1', status: 'Available', assignedTo: '-', details: 'Room 304' },
    { id: '4', name: 'MacBook Pro M2', status: 'Assigned', assignedTo: 'Jane Smith (Staff)', details: 'Service Tag: ABC789' },
    { id: '5', name: 'Lab Kit 01', status: 'Maintenance', assignedTo: '-', details: 'Physics Lab' },
    { id: '6', name: 'Conference Room B', status: 'Available', assignedTo: '-', details: '2nd Floor, Main Building' },
];

const ResourcesPage = () => {
    const [resources, setResources] = useState(initialResources);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedResource, setSelectedResource] = useState(null);

    // Filter Logic
    const filteredResources = useMemo(() => {
        return resources.filter(res => {
            const matchesSearch = res.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                res.assignedTo.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesSearch;
        });
    }, [resources, searchQuery]);

    // Handlers
    const handleCreate = () => {
        setSelectedResource(null);
        setModalMode('create');
        setIsModalOpen(true);
    };

    const handleEdit = (resource) => {
        setSelectedResource(resource);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleAssign = (resource) => {
        setSelectedResource(resource);
        setModalMode('assign');
        setIsModalOpen(true);
    };

    const handleModalSuccess = (data) => {
        if (modalMode === 'create') {
            const newRes = {
                id: Date.now().toString(),
                ...data,
                status: data.assignedTo !== '-' ? 'Assigned' : 'Available'
            };
            setResources(prev => [newRes, ...prev]);
        } else {
            // Update existing
            setResources(prev => prev.map(r => {
                if (r.id === selectedResource.id) {
                    const updated = { ...r, ...data };
                    // Auto update status based on assignment
                    if (data.assignedTo !== '-' && updated.status === 'Available') updated.status = 'Assigned';
                    if (data.assignedTo === '-' && updated.status === 'Assigned') updated.status = 'Available';
                    return updated;
                }
                return r;
            }));
        }
        setIsModalOpen(false);
    };

    const stats = [
        { label: 'Total Resources', value: resources.length, icon: Box, color: '#6366f1' },
        { label: 'Available', value: resources.filter(r => r.status === 'Available').length, icon: CheckCircle2, color: '#10b981' },
        { label: 'Assigned', value: resources.filter(r => r.status === 'Assigned').length, icon: User, color: '#3b82f6' },
    ];

    return (
        <div className="h-full flex flex-col bg-white overflow-hidden font-sans text-slate-600">
            {/* --- HEADER --- */}
            <div className="flex-none px-8 pt-6 pb-4">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                                <stat.icon size={24} />
                            </div>
                            <div>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</span>
                                <h3 className="text-xl font-bold text-slate-800">{stat.value}</h3>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Resource Management</h1>
                        <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-medium">Manage & Assign Assets</p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* View Toggle */}
                        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                                <LayoutGrid size={18} />
                            </button>
                            <button onClick={() => setViewMode('table')} className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                                <List size={18} />
                            </button>
                        </div>

                        <button
                            onClick={handleCreate}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-indigo-200 transition-all flex items-center gap-2"
                        >
                            <Plus size={18} /> Add Resource
                        </button>
                    </div>
                </div>
            </div>

            {/* --- TOOLBAR --- */}
            <div className="flex-none px-8 pb-4 z-10">
                <div className="relative max-w-lg">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input
                        type="text"
                        placeholder="Search resources, assigned users..."
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50 transition-all text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* --- CONTENT --- */}
            <div className="flex-1 px-8 pb-8 min-h-0 overflow-y-auto custom-scrollbar">
                {filteredResources.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 text-sm">No resources found.</div>
                ) : viewMode === 'grid' ? (
                    /* --- GRID VIEW --- */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <AnimatePresence>
                            {filteredResources.map((res) => (
                                <motion.div
                                    layout key={res.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="group bg-white rounded-2xl border border-slate-200 p-5 flex flex-col hover:shadow-xl hover:shadow-indigo-100 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                                    onClick={() => handleEdit(res)}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                                            <Monitor size={20} />
                                        </div>
                                        <StatusBadge status={res.status} />
                                    </div>

                                    <h3 className="text-lg font-bold text-slate-800 line-clamp-1 mb-1 group-hover:text-indigo-600 transition-colors">{res.name}</h3>
                                    <p className="text-xs text-slate-500 mb-4 line-clamp-2 min-h-[2.5em] leading-relaxed">
                                        {res.details}
                                    </p>

                                    <div className="mt-auto pt-4 border-t border-slate-100 space-y-3">
                                        <div className="flex items-center gap-2 text-xs">
                                            <User size={14} className={res.assignedTo !== '-' ? "text-indigo-500" : "text-slate-300"} />
                                            <span className={res.assignedTo !== '-' ? "font-medium text-slate-700" : "text-slate-400 italic"}>
                                                {res.assignedTo !== '-' ? res.assignedTo : 'Unassigned'}
                                            </span>
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleAssign(res); }}
                                            className="w-full py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-500 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 transition-all flex items-center justify-center gap-2"
                                        >
                                            <UserPlus size={14} /> {res.assignedTo === '-' ? 'Assign Incharge' : 'Manage Assignment'}
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    /* --- TABLE VIEW --- */
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                                <tr>
                                    <th className="px-6 py-4">Resource Name</th>
                                    <th className="px-6 py-4">Details</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Assigned To</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredResources.map((res) => (
                                    <tr key={res.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600"><Box size={16} /></div>
                                                <span className="text-sm font-semibold text-slate-800">{res.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-500 max-w-[200px] truncate">{res.details}</td>
                                        <td className="px-6 py-4"><StatusBadge status={res.status} /></td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs flex items-center gap-2">
                                                <span className={res.assignedTo !== '-' ? "font-medium text-slate-700" : "text-slate-400 italic"}>
                                                    {res.assignedTo}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleEdit(res)} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50"><Edit2 size={16} /></button>
                                                <button onClick={() => handleAssign(res)} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50"><UserPlus size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* --- MODAL --- */}
            <ResourceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                resourceData={selectedResource}
                mode={modalMode}
                onSuccess={handleModalSuccess}
            />
        </div>
    );
};

const StatusBadge = ({ status }) => {
    const styles = {
        'Available': 'bg-emerald-50 text-emerald-600 border-emerald-100',
        'Assigned': 'bg-blue-50 text-blue-600 border-blue-100',
        'Maintenance': 'bg-orange-50 text-orange-600 border-orange-100',
    };
    return (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${styles[status] || styles['Available']} flex w-fit items-center gap-1.5`}>
            <div className={`w-1.5 h-1.5 rounded-full ${status === 'Available' ? 'bg-emerald-500' : status === 'Assigned' ? 'bg-blue-500' : 'bg-orange-500'}`} />
            {status}
        </span>
    );
};

export default ResourcesPage;
