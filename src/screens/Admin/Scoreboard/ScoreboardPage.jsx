import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trophy, Crown, Calendar, Search, Users,
    Award, Medal, ChevronLeft, ChevronRight
} from 'lucide-react';
import api from '../../../utils/api';
import Pagination from '../../../components/UI/Pagination/Pagination';

const ScoreboardPage = () => {
    const [activeTab, setActiveTab] = useState('students');
    const [searchQuery, setSearchQuery] = useState('');
    const [deptFilter, setDeptFilter] = useState('All Departments');
    const [yearFilter, setYearFilter] = useState('All Years');
    const [isLoading, setIsLoading] = useState(true);
    const [departments, setDepartments] = useState([]);

    // Leaderboard Data State
    const [studentLeaderboard, setStudentLeaderboard] = useState([]);
    const [facultyLeaderboard, setFacultyLeaderboard] = useState([]);
    const [stats, setStats] = useState({
        total_students: 0,
        student_top_score: 0,
        total_faculty: 0,
        faculty_top_score: 0
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        fetchLeaderboards();
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const data = await api('/resources/departments');
            const list = Array.isArray(data) ? data : (data.departments || []);
            setDepartments(list.map(d => d.name));
        } catch (err) {
            console.error('Failed to fetch departments:', err);
        }
    };

    const fetchLeaderboards = async () => {
        setIsLoading(true);
        try {
            const [studentRes, facultyRes] = await Promise.all([
                api('/users/dashboard/students/leaderboard'),
                api('/users/dashboard/faculty/leaderboard')
            ]);

            if (studentRes.success) {
                setStudentLeaderboard(studentRes.leaderboard.map((u, i) => ({
                    ...u,
                    rank: i + 1,
                    avatar: u.name.split(' ').map(n => n[0]).join('').toUpperCase()
                })));
                setStats(prev => ({
                    ...prev,
                    total_students: studentRes.total_students,
                    student_top_score: studentRes.top_score
                }));
            }

            if (facultyRes.success) {
                setFacultyLeaderboard(facultyRes.leaderboard.map((u, i) => ({
                    ...u,
                    rank: i + 1,
                    avatar: u.name.split(' ').map(n => n[0]).join('').toUpperCase()
                })));
                setStats(prev => ({
                    ...prev,
                    total_faculty: facultyRes.total_faculty,
                    faculty_top_score: facultyRes.top_score
                }));
            }
        } catch (err) {
            console.error('Failed to fetch leaderboards:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Reset pagination on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, deptFilter, yearFilter, activeTab]);

    // Get current active data
    const currentData = activeTab === 'students' ? studentLeaderboard : facultyLeaderboard;

    // Filter Logic
    const filteredData = useMemo(() => {
        return currentData.filter(user => {
            const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesDept = deptFilter === 'All Departments' || user.department === deptFilter;
            const matchesYear = activeTab === 'faculty' || yearFilter === 'All Years' || (user.year && user.year.toString() === yearFilter.split(' ')[0]);
            return matchesSearch && matchesDept && matchesYear;
        });
    }, [searchQuery, deptFilter, yearFilter, currentData, activeTab]);

    const topThree = filteredData.slice(0, 3);

    // Pagination Logic
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="h-full flex flex-col bg-white overflow-hidden font-sans text-slate-600">
            {/* --- HEADER SECTION --- */}
            <div className="flex-none px-10 max-lg:px-8 max-md:px-6 max-sm:px-4 pt-10 pb-6 bg-white border-b border-slate-100">
                <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 mb-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-indigo-500 text-[10px] uppercase tracking-[0.3em] mb-2 font-bold opacity-80">
                            <Calendar size={12} strokeWidth={3} /> Academic Inception 2026
                        </div>
                        <h1 className="text-3xl max-md:text-2xl font-bold text-slate-900 tracking-tight leading-none">
                            Elite <span className="text-indigo-600">Scoreboard</span>
                        </h1>
                    </div>

                    {/* TABS */}
                    <div className="bg-slate-50 p-1.5 rounded-[22px] border border-slate-100 shadow-inner flex gap-1.5 w-full xl:w-auto overflow-x-auto no-scrollbar">
                        <button
                            onClick={() => { setActiveTab('students'); setDeptFilter('All Departments'); setYearFilter('All Years'); }}
                            className={`px-10 py-3 rounded-[18px] text-[10px] font-bold uppercase tracking-[0.15em] transition-all flex-1 xl:flex-none flex items-center justify-center gap-3 ${activeTab === 'students' ? 'bg-white text-indigo-600 shadow-[0_10px_25px_-5px_rgba(99,102,241,0.2)] border border-indigo-50/50' : 'text-slate-400 hover:text-slate-600 active:scale-95'}`}
                        >
                            <Users size={16} strokeWidth={2.5} />
                            Students
                        </button>
                        <button
                            onClick={() => { setActiveTab('faculty'); setDeptFilter('All Departments'); }}
                            className={`px-10 py-3 rounded-[18px] text-[10px] font-bold uppercase tracking-[0.15em] transition-all flex-1 xl:flex-none flex items-center justify-center gap-3 ${activeTab === 'faculty' ? 'bg-white text-indigo-600 shadow-[0_10px_25px_-5px_rgba(99,102,241,0.2)] border border-indigo-50/50' : 'text-slate-400 hover:text-slate-600 active:scale-95'}`}
                        >
                            <Trophy size={16} strokeWidth={2.5} />
                            Faculty Members
                        </button>
                    </div>
                </header>
            </div>

            {/* --- DASHBOARD CONTENT --- */}
            <div className="flex-1 min-h-0 px-10 max-lg:px-8 max-md:px-4 py-8 overflow-y-auto custom-scrollbar">
                <div className="max-w-[1600px] mx-auto grid grid-cols-12 gap-8 max-xl:flex max-xl:flex-col">

                    {/* --- LEFT PANEL: TABLE (70%) --- */}
                    <div className="col-span-12 xl:col-span-8 flex flex-col bg-white rounded-[40px] border border-slate-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.03)] overflow-hidden min-h-[600px] max-md:min-h-0">
                        {/* Toolbar */}
                        <div className="flex-none p-6 border-b border-slate-50 flex flex-col md:flex-row gap-4 bg-white z-10">
                            <div className="relative flex-1 group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                <input
                                    type="text"
                                    placeholder={`Filter ${activeTab} via cipher or nomenclature...`}
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-[20px] focus:outline-none focus:border-indigo-400 focus:bg-white focus:shadow-[0_10px_20px_-10px_rgba(99,102,241,0.1)] transition-all text-sm font-bold text-slate-700 placeholder:text-slate-300"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-3 max-sm:grid max-sm:grid-cols-2">
                                <select
                                    className="px-5 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-[18px] text-[10px] font-bold uppercase tracking-wider text-slate-600 focus:border-indigo-400 focus:outline-none transition-all cursor-pointer min-w-[160px] shadow-sm appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%207.5L10%2012.5L15%207.5%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-size-[20px_20px] bg-position-[right_12px_center] bg-no-repeat"
                                    value={deptFilter}
                                    onChange={(e) => setDeptFilter(e.target.value)}
                                >
                                    <option>All Departments</option>
                                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>

                                {activeTab === 'students' && (
                                    <select
                                        className="px-5 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-[18px] text-[10px] font-bold uppercase tracking-wider text-slate-600 focus:border-indigo-400 focus:outline-none transition-all cursor-pointer min-w-[120px] shadow-sm appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%207.5L10%2012.5L15%207.5%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-size-[20px_20px] bg-position-[right_12px_center] bg-no-repeat"
                                        value={yearFilter}
                                        onChange={(e) => setYearFilter(e.target.value)}
                                    >
                                        <option>All Years</option>
                                        <option value="1">1st Year</option>
                                        <option value="2">2nd Year</option>
                                        <option value="3">3rd Year</option>
                                        <option value="4">4th Year</option>
                                    </select>
                                )}
                            </div>
                        </div>

                        {/* Table Body */}
                        <div className="flex-1 overflow-x-auto relative custom-scrollbar bg-white">
                            <div className="min-w-[900px]">
                                <div className="sticky top-0 bg-white/95 backdrop-blur-md z-10 grid grid-cols-12 px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-400 border-b border-slate-50 shadow-sm">
                                    <div className="col-span-1">Rank</div>
                                    <div className="col-span-4">Candidate Profile</div>
                                    <div className="col-span-3">Core Department</div>
                                    <div className="col-span-2 text-center">Score Delta</div>
                                    <div className="col-span-2 text-right">Aggr. Points</div>
                                </div>

                                <div className="divide-y divide-slate-50/50">
                                    <AnimatePresence mode='wait'>
                                        {paginatedData.map((user) => (
                                            <motion.div
                                                key={user.id}
                                                layout
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 10 }}
                                                transition={{ duration: 0.3 }}
                                                className="grid grid-cols-12 items-center px-8 py-4 hover:bg-white transition-all group cursor-default"
                                            >
                                                <div className="col-span-1">
                                                    <RankBadge rank={user.rank} />
                                                </div>
                                                <div className="col-span-4 flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-bold text-white shadow-xl rotate-3 group-hover:rotate-0 transition-transform ${user.rank === 1 ? 'bg-linear-to-br from-yellow-300 to-yellow-500' :
                                                        user.rank === 2 ? 'bg-linear-to-br from-slate-200 to-slate-400' :
                                                            user.rank === 3 ? 'bg-linear-to-br from-orange-200 to-orange-400' : 'bg-linear-to-br from-indigo-50 to-indigo-100 text-indigo-500 shadow-none'
                                                        }`}>
                                                        {user.avatar}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-slate-900 leading-none mb-1 uppercase tracking-tight">{user.name}</div>
                                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{activeTab === 'students' ? `${user.year}${['st', 'nd', 'rd', 'th'][(user.year - 1) % 10] || 'th'} Batch` : (user.type || 'Council Member')}</div>
                                                    </div>
                                                </div>
                                                <div className="col-span-3">
                                                    <span className="bg-slate-50 text-slate-600 px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-tight border border-slate-100">{user.department}</span>
                                                </div>
                                                <div className="col-span-2 text-center">
                                                    <div className="text-xs font-bold text-slate-900">+{user.score}</div>
                                                    <div className="text-[9px] text-rose-500 font-bold opacity-60">-{user.penalty} PEN</div>
                                                </div>
                                                <div className="col-span-2 text-right">
                                                    <span className="text-lg font-bold text-indigo-600 tracking-tighter">{user.total_score}</span>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                    {paginatedData.length === 0 && (
                                        <div className="py-24 text-center">
                                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
                                                <Users size={24} className="text-slate-300" />
                                            </div>
                                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-relaxed">No Data Detected in Current Sector</h3>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Pagination Footer */}
                        <div className="p-6 bg-slate-50/30 border-t border-slate-50">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                itemsPerPage={itemsPerPage}
                                onItemsPerPageChange={setItemsPerPage}
                                totalItems={filteredData.length}
                                showingCount={paginatedData.length}
                            />
                        </div>
                    </div>

                    {/* --- RIGHT PANEL: PODIUM & INFO (30%) --- */}
                    <div className="col-span-12 xl:col-span-4 flex flex-col gap-8">
                        {/* Podium Card */}
                        <div className="bg-white rounded-[40px] border border-slate-100 shadow-[0_25px_70px_-20px_rgba(99,102,241,0.1)] p-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/30 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-indigo-100/40" />
                            
                            <h2 className="text-xl font-bold text-slate-900 mb-10 flex items-center justify-between uppercase tracking-tight">
                                <span>Hall of Valor</span>
                                <Crown size={22} className="text-yellow-500 animate-pulse" />
                            </h2>

                            <div className="flex items-end justify-center gap-4 h-72 mb-4">
                                {topThree[1] && <PodiumStep user={topThree[1]} rank={2} color="bg-slate-50" height="h-28" />}
                                {topThree[0] && <PodiumStep user={topThree[0]} rank={1} color="bg-indigo-50" height="h-44" isGold />}
                                {topThree[2] && <PodiumStep user={topThree[2]} rank={3} color="bg-orange-50" height="h-20" />}
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 xl:grid-cols-1 gap-4">
                            <StatCard
                                icon={<Users size={20} />}
                                label={`Global ${activeTab === 'students' ? 'Students' : 'Faculty'}`}
                                value={activeTab === 'students' ? stats.total_students : stats.total_faculty}
                                color="text-indigo-600"
                                bg="bg-indigo-50/50"
                            />
                            <StatCard
                                icon={<Award size={20} />}
                                label="Peak Performance"
                                value={activeTab === 'students' ? stats.student_top_score : stats.faculty_top_score}
                                color="text-emerald-600"
                                bg="bg-emerald-50/50"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- HELPER COMPONENTS ---

const RankBadge = ({ rank }) => {
    if (rank === 1) return <Medal size={16} className="text-yellow-500" />;
    if (rank === 2) return <Medal size={16} className="text-slate-400" />;
    if (rank === 3) return <Medal size={16} className="text-orange-400" />;
    return <span className="text-xs font-semibold text-slate-400 w-4 text-center">{rank}</span>;
};

const PodiumStep = ({ user, rank, color, height, isGold }) => (
    <div className="flex flex-col items-center flex-1 max-w-[80px]">
        <div className="mb-2 relative">
            {isGold && <Crown size={16} className="absolute -top-5 left-1/2 -translate-x-1/2 text-yellow-400 animate-bounce" />}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border-2 ${isGold ? 'border-yellow-200' : 'border-white'} shadow-sm bg-white text-slate-700`}>
                {user?.avatar || 'U'}
            </div>
        </div>
        <div className={`w-full ${height} ${color} rounded-t-lg flex items-start justify-center pt-2 transition-all hover:opacity-90`}>
            <span className={`text-lg font-bold ${rank === 1 ? 'text-indigo-900' : 'text-slate-600'}`}>{rank}</span>
        </div>
        <div className="mt-2 text-center w-full">
            <div className="text-[10px] font-bold text-slate-700 truncate w-full px-1">{user?.name}</div>
            <div className="text-[9px] font-semibold text-indigo-500">{user?.total_score}</div>
        </div>
    </div>
);

const StatCard = ({ icon, value, label, bg }) => (
    <div className={`${bg} p-4 rounded-2xl border border-transparent hover:border-indigo-100 transition-colors`}>
        <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                {icon}
            </div>
        </div>
        <div className="text-2xl font-bold text-slate-800">{value}</div>
        <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">{label}</div>
    </div>
);

export default ScoreboardPage;