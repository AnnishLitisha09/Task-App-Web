import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, UserPlus, Check, AlertCircle, Info, Building, AlignLeft, Camera, Trash2 } from 'lucide-react';
import api from '../../../utils/api';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface VenueModalProps {
    isOpen: boolean;
    onClose: () => void;
    venueData?: any;
    mode: 'create' | 'edit' | 'assign';
    onSuccess: () => void;
}

const venueTypes = ['Class', 'Laboratory', 'Auditorium', 'Conference Room', 'Others'];
const inputCls = "w-full py-2.5 pl-10 pr-3 rounded-xl border border-slate-200 bg-white text-[0.9rem] text-slate-800 outline-none transition-all focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)]";
const selectCls = "w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-white text-[0.9rem] text-slate-700 outline-none focus:border-indigo-500";
const labelCls = "block text-[0.75rem] font-bold text-slate-500 uppercase tracking-wide mb-1.5";

const VenueModal: React.FC<VenueModalProps> = ({ isOpen, onClose, venueData, mode, onSuccess }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState('Class');
    const [imagePreview, setImagePreview] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [selectedIncharge, setSelectedIncharge] = useState<any>(null);
    const [facultyList, setFacultyList] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFacultyLoading, setIsFacultyLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (venueData) {
                setName(venueData.name || '');
                const matchedType = venueTypes.find(t => t.toLowerCase() === (venueData.venue_type || '').toLowerCase());
                setType(matchedType || venueTypes[0]);
                let img = venueData.image_url || venueData.image || '';
                if (img && img.startsWith('/') && !img.startsWith('http')) img = `${BASE_URL}${img}`;
                setImagePreview(img); setImageFile(null);
                setLocation(venueData.location || ''); setDescription(venueData.description || '');
                const incharge = venueData.incharge || venueData.owner;
                if (incharge) setSelectedIncharge({ id: incharge.id || incharge.user_id, name: incharge.name, role: incharge.role || incharge.role_name });
                else if (venueData.user_id) setSelectedIncharge({ id: venueData.user_id, name: venueData.user_name || venueData.owner_name, role: venueData.role || venueData.role_name });
                else setSelectedIncharge(null);
            } else {
                setName(''); setType(venueTypes[0]); setImagePreview(''); setImageFile(null);
                setLocation(''); setDescription(''); setSelectedIncharge(null);
            }
            setError(''); fetchFaculty();
        }
    }, [isOpen, venueData]);

    const fetchFaculty = async () => {
        setIsFacultyLoading(true);
        try {
            const response = await api('/users/incharges');
            const incList = Array.isArray(response) ? response : (response.incharges || []);
            setFacultyList(incList.map((i: any) => ({ id: i.id || i.user_id, name: i.name || 'Unknown User', reg_no: i.venue_name || 'Incharge', role: i.role || 'Incharge' })));
        } catch (err) { console.error(err); }
        finally { setIsFacultyLoading(false); }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) { setImageFile(file); const reader = new FileReader(); reader.onloadend = () => setImagePreview(reader.result as string); reader.readAsDataURL(file); }
    };

    const handleSubmit = async () => {
        if (!name && mode !== 'assign') { setError('Venue name is required'); return; }
        setIsLoading(true); setError('');
        try {
            const formData = new FormData();
            formData.append('name', name); formData.append('venue_type', type.toLowerCase());
            formData.append('location', location); formData.append('description', description);
            if (imageFile) formData.append('image', imageFile);
            if (selectedIncharge?.id) { formData.append('user_id', selectedIncharge.id.toString()); formData.append('role_name', selectedIncharge.role || 'VENUE_INCHARGE'); }
            if (mode === 'create') await api('/resources/venues', { method: 'POST', body: formData });
            else { const vid = venueData.id || venueData.venue_id; await api(`/resources/venues/${vid}`, { method: 'PUT', body: formData }); }
            onSuccess();
        } catch (err: any) { setError(err.message || 'Operation failed'); }
        finally { setIsLoading(false); }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-1000 flex items-center justify-center p-4">
                <motion.div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
                    initial={{ opacity: 0, scale: 0.98, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: 10 }}>
                    <div className="flex justify-between items-center px-7 py-5 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-500 text-white rounded-xl flex items-center justify-center">
                                {mode === 'assign' ? <UserPlus size={20} /> : <MapPin size={20} />}
                            </div>
                            <div>
                                <h2 className="text-base font-extrabold text-slate-900">
                                    {mode === 'create' ? 'Add New Venue' : mode === 'edit' ? 'Edit Venue Details' : 'Assign Venue Incharge'}
                                </h2>
                                <p className="text-[0.75rem] text-slate-400">{mode === 'assign' ? `Assigning authority for ${name}` : 'Institutional infrastructure management'}</p>
                            </div>
                        </div>
                        <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-slate-100 rounded-lg" onClick={onClose}><X size={20} /></button>
                    </div>

                    <div className="px-7 py-6 space-y-5 max-h-[65vh] overflow-y-auto">
                        {error && <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm"><AlertCircle size={16} /><span>{error}</span></div>}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelCls}>Venue Name</label>
                                <div className="relative"><Building size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input type="text" className={inputCls} placeholder="e.g. Einstein Seminar Hall" value={name} onChange={(e) => setName(e.target.value)} readOnly={mode === 'assign'} /></div>
                            </div>
                            <div>
                                <label className={labelCls}>Venue Type</label>
                                <select className={selectCls} value={type} onChange={(e) => setType(e.target.value)} disabled={mode === 'assign'}>
                                    {venueTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className={labelCls}>Location / Floor</label>
                            <div className="relative"><MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input type="text" className={inputCls} placeholder="e.g. Block A, 2nd Floor" value={location} onChange={(e) => setLocation(e.target.value)} readOnly={mode === 'assign'} /></div>
                        </div>

                        <div>
                            <label className={labelCls}>Venue Image</label>
                            {imagePreview ? (
                                <div className="relative w-full h-40 rounded-xl overflow-hidden border border-slate-200">
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    <button className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-lg flex items-center justify-center hover:bg-red-600" onClick={() => { setImagePreview(''); setImageFile(null); }}><Trash2 size={14} /></button>
                                </div>
                            ) : (
                                <label className="block border-2 border-dashed border-slate-200 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-all">
                                    <input type="file" accept="image/*" onChange={handleImageChange} hidden />
                                    <Camera size={28} className="mx-auto text-slate-300 mb-2" />
                                    <span className="block text-sm text-slate-500 font-semibold">Upload Venue Image</span>
                                    <span className="block text-xs text-slate-400 mt-1">or click to browse files</span>
                                </label>
                            )}
                        </div>

                        <div>
                            <label className={labelCls}>Brief Description</label>
                            <div className="relative"><AlignLeft size={16} className="absolute left-3 top-3 text-slate-400" />
                                <textarea className="w-full py-2.5 pl-10 pr-3 rounded-xl border border-slate-200 bg-white text-[0.9rem] outline-none focus:border-indigo-500 resize-none"
                                    placeholder="Add details about capacity, equipment, etc..." value={description} onChange={(e) => setDescription(e.target.value)} rows={3} /></div>
                        </div>

                        <div>
                            <label className={labelCls}>Assign Incharge (Owner)</label>
                            <select className={selectCls} value={selectedIncharge?.id?.toString() || ''}
                                onChange={(e) => { const p = facultyList.find(f => f.id.toString() === e.target.value); setSelectedIncharge(p || null); }}>
                                <option value="">Select Incharge...</option>
                                {facultyList.map(p => <option key={p.id} value={p.id.toString()}>{p.name} ({p.reg_no})</option>)}
                            </select>
                            {isFacultyLoading && <p className="text-xs text-indigo-400 mt-1">Loading incharges...</p>}
                        </div>

                        {mode === 'assign' && (
                            <div className="flex items-start gap-2.5 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                                <Info size={16} className="text-blue-500 mt-0.5 shrink-0" />
                                <p className="text-[0.8rem] text-blue-700">The assigned incharge will receive notifications for all booking requests and maintenance alerts for this venue.</p>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 px-7 py-5 border-t border-slate-100 bg-slate-50/50">
                        <button className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-100" onClick={onClose}>Discard</button>
                        <button className="px-5 py-2.5 rounded-xl bg-indigo-500 text-white font-bold text-sm flex items-center gap-2 hover:bg-indigo-600 transition-all disabled:opacity-60"
                            onClick={handleSubmit} disabled={isLoading}>
                            {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Check size={18} /><span>{mode === 'create' ? 'Create Venue' : mode === 'edit' ? 'Save Changes' : 'Confirm Incharge'}</span></>}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default VenueModal;
