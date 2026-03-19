import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, UserPlus, Check, AlertCircle, Info, Building, AlignLeft, Camera, Trash2, ChevronRight } from 'lucide-react';
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
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-5000 flex items-center justify-center p-4">
                <motion.div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-white/20"
                    initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}>
                    
                    {/* Header */}
                    <div className="flex justify-between items-center px-6 py-5 sm:px-8 sm:py-6 border-b border-slate-100 bg-white z-10 shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
                                {mode === 'assign' ? <UserPlus size={24} strokeWidth={2.5} /> : <MapPin size={24} strokeWidth={2.5} />}
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-xl sm:text-2xl font-black text-slate-800 m-0 leading-tight truncate">
                                    {mode === 'create' ? 'Establish Venue' : mode === 'edit' ? 'Update Infrastructure' : 'Delegate Authority'}
                                </h2>
                                <p className="text-xs sm:text-sm font-bold text-slate-400 m-0 mt-0.5 uppercase tracking-widest italic opacity-70 truncate">
                                    {mode === 'assign' ? `Assigned to ${name}` : 'Institutional Asset Management'}
                                </p>
                            </div>
                        </div>
                        <button className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all border-none bg-transparent cursor-pointer active:scale-90" onClick={onClose} aria-label="Close modal">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }} 
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-3 px-4 py-3.5 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-[0.75rem] font-black uppercase tracking-tight"
                            >
                                <AlertCircle size={18} />
                                <span>{error}</span>
                            </motion.div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className={labelCls}>Identity / Designation</label>
                                <div className="relative group">
                                    <Building size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                    <input type="text" className={`${inputCls} pl-11! border-2 border-slate-100 hover:border-slate-200 focus:border-indigo-500 rounded-[18px]`} placeholder="Einstein Seminar Hall" value={name} onChange={(e) => setName(e.target.value)} readOnly={mode === 'assign'} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className={labelCls}>Infrastructure Class</label>
                                <div className="relative group">
                                    <select className={`${selectCls} w-full h-[46px] border-2 border-slate-100 hover:border-slate-200 focus:border-indigo-500 rounded-[18px] appearance-none cursor-pointer font-bold`} value={type} onChange={(e) => setType(e.target.value)} disabled={mode === 'assign'}>
                                        {venueTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                    <ChevronRight size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none rotate-90" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className={labelCls}>Strategic Location</label>
                            <div className="relative group">
                                <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                <input type="text" className={`${inputCls} !pl-11 border-2 border-slate-100 hover:border-slate-200 focus:border-indigo-500 rounded-[18px]`} placeholder="Block A, 2nd Floor" value={location} onChange={(e) => setLocation(e.target.value)} readOnly={mode === 'assign'} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className={labelCls}>Visual Asset</label>
                            {imagePreview ? (
                                <div className="relative w-full h-48 rounded-[24px] overflow-hidden border-2 border-slate-100 group shadow-lg">
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                                    <button className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-md text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-xl active:scale-90" onClick={() => { setImagePreview(''); setImageFile(null); }}>
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ) : (
                                <label className="block border-2 border-dashed border-slate-200 rounded-[24px] p-10 text-center cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/50 transition-all group">
                                    <input type="file" accept="image/*" onChange={handleImageChange} hidden />
                                    <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                                        <Camera size={28} />
                                    </div>
                                    <span className="block text-[0.85rem] text-slate-600 font-black uppercase tracking-wider mb-1">Initialize Image</span>
                                    <span className="block text-[0.65rem] text-slate-400 font-bold uppercase tracking-widest opacity-60">HEIC, JPEG, PNG approved</span>
                                </label>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className={labelCls}>Operational Narrative</label>
                            <div className="relative group">
                                <AlignLeft size={16} className="absolute left-4 top-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                <textarea className="w-full py-3.5 pl-11 pr-4 rounded-[18px] border-2 border-slate-100 bg-white text-[0.9rem] font-medium outline-none hover:border-slate-200 focus:border-indigo-500 transition-all resize-none custom-scrollbar"
                                    placeholder="Define operational capacity and integrated equipment..." value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className={labelCls}>Administrative Delegate</label>
                            <div className="relative group">
                                <select className={`${selectCls} w-full h-[46px] border-2 border-slate-100 hover:border-slate-200 focus:border-indigo-500 rounded-[18px] appearance-none cursor-pointer font-bold`} value={selectedIncharge?.id?.toString() || ''}
                                    onChange={(e) => { const p = facultyList.find(f => f.id.toString() === e.target.value); setSelectedIncharge(p || null); }}>
                                    <option value="">Search for delegate...</option>
                                    {facultyList.map(p => <option key={p.id} value={p.id.toString()}>{p.name} — {p.reg_no}</option>)}
                                </select>
                                <ChevronRight size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none rotate-90" />
                                {isFacultyLoading && <p className="text-[10px] font-black text-indigo-500 mt-2 uppercase tracking-widest animate-pulse">Retrieving delegates...</p>}
                            </div>
                        </div>

                        {mode === 'assign' && (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-start gap-4 p-5 bg-indigo-50/50 border border-indigo-100/50 rounded-[24px]">
                                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                                    <Info size={20} />
                                </div>
                                <p className="text-[0.75rem] font-bold text-indigo-900/70 leading-relaxed uppercase tracking-tight">The assigned delegate will maintain absolute governance over resource scheduling and operational status updates for this facility.</p>
                            </motion.div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex flex-col sm:flex-row justify-end gap-3 px-6 py-5 sm:px-8 border-t border-slate-100 bg-slate-50/50 shrink-0">
                        <button className="w-full sm:w-auto px-8 py-3.5 rounded-[18px] border-2 border-slate-100 text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-white hover:border-slate-200 transition-all bg-transparent cursor-pointer active:scale-95" onClick={onClose}>Release</button>
                        <button className="w-full sm:w-auto px-8 py-3.5 rounded-[18px] bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all shadow-[0_15px_30px_-10px_rgba(0,0,0,0.2)] disabled:opacity-30 disabled:cursor-not-allowed border-none cursor-pointer active:scale-95"
                            onClick={handleSubmit} disabled={isLoading}>
                            {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (
                                <>
                                    <Check size={18} strokeWidth={3} />
                                    <span>{mode === 'create' ? 'Commit Entry' : mode === 'edit' ? 'Update State' : 'Confirm Delegate'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default VenueModal;
