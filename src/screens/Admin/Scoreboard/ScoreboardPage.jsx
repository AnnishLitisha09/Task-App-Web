import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trophy, Crown, Calendar, Search, Users,
    Award, Medal, ChevronLeft, ChevronRight
} from 'lucide-react';
import api from '../../../utils/api';

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
    const itemsPerPage = 8;

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
            <div className="flex-none px-8 pt-6 pb-4">
                <header className="flex justify-between items-end mb-6">
                    <div>
                        <div className="flex items-center gap-2 text-indigo-500 text-[10px] uppercase tracking-[0.3em] mb-2 font-medium">
                            <Calendar size={12} /> Academic Session 2026
                        </div>
                        <h1 className="text-3xl font-light text-slate-900 tracking-tight">
                            Performance <span className="font-semibold">Scoreboard</span>
                        </h1>
                    </div>

                    {/* TABS */}
                    <div className="bg-slate-50 p-1 rounded-xl border border-slate-200 shadow-sm flex gap-1">
                        <button
                            onClick={() => { setActiveTab('students'); setDeptFilter('All Departments'); setYearFilter('All Years'); }}
                            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'students' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Students
                        </button>
                        <button
                            onClick={() => { setActiveTab('faculty'); setDeptFilter('All Departments'); }}
                            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'faculty' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Faculty
                        </button>
                    </div>
                </header>
            </div>

            {/* --- DASHBOARD CONTENT --- */}
            <div className="flex-1 min-h-0 px-8 pb-8 grid grid-cols-12 gap-6">

                {/* --- LEFT PANEL: TABLE (65%) --- */}
                <div className="col-span-12 lg:col-span-8 flex flex-col bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* Toolbar */}
                    <div className="flex-none p-4 border-b border-slate-100 flex gap-3 bg-white z-10">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                            <input
                                type="text"
                                placeholder={`Search ${activeTab}...`}
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50 transition-all text-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <select
                            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-300 text-slate-600 cursor-pointer"
                            value={deptFilter}
                            onChange={(e) => setDeptFilter(e.target.value)}
                        >
                            <option>All Departments</option>
                            {departments.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>

                        {activeTab === 'students' && (
                            <select
                                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-300 text-slate-600 cursor-pointer"
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

                    {/* Table Body */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                        <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 grid grid-cols-12 px-6 py-3 text-[10px] uppercase tracking-widest text-slate-400 font-bold border-b border-slate-100 shadow-sm">
                            <div className="col-span-1">Rank</div>
                            <div className="col-span-4">Name</div>
                            <div className="col-span-3">Department</div>
                            <div className="col-span-2 text-center">Score</div>
                            <div className="col-span-2 text-right">Total</div>
                        </div>

                        <div className="divide-y divide-slate-50">
                            <AnimatePresence mode='wait'>
                                {paginatedData.map((user) => (
                                    <motion.div
                                        key={user.id}
                                        layout
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -5 }}
                                        transition={{ duration: 0.2 }}
                                        className="grid grid-cols-12 items-center px-6 py-3 hover:bg-slate-50 transition-colors group cursor-default"
                                    >
                                        <div className="col-span-1">
                                            <RankBadge rank={user.rank} />
                                        </div>
                                        <div className="col-span-4 flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm ${user.rank === 1 ? 'bg-yellow-400' :
                                                user.rank === 2 ? 'bg-slate-300' :
                                                    user.rank === 3 ? 'bg-orange-300' : 'bg-indigo-100 text-indigo-500'
                                                }`}>
                                                {user.avatar}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-slate-900">{user.name}</div>
                                                <div className="text-[10px] text-slate-400">{activeTab === 'students' ? `${user.year}${['st', 'nd', 'rd', 'th'][(user.year - 1) % 10] || 'th'} Year` : (user.type || 'Faculty Member')}</div>
                                            </div>
                                        </div>
                                        <div className="col-span-3 text-xs text-slate-500 font-medium">
                                            <span className="bg-slate-100 px-2 py-1 rounded-md">{user.department}</span>
                                        </div>
                                        <div className="col-span-2 text-center">
                                            <div className="text-xs font-semibold text-slate-700">{user.score}</div>
                                            <div className="text-[9px] text-rose-400">-{user.penalty} pen</div>
                                        </div>
                                        <div className="col-span-2 text-right font-bold text-indigo-600 text-sm">
                                            {user.total_score}
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Pagination Footer */}
                    <div className="flex-none p-3 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <span className="text-xs text-slate-400 font-medium ml-2">
                            Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredData.length)} - {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length}
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-1.5 rounded-lg hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent text-slate-500 transition-colors"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-xs font-bold text-slate-700 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm">
                                {currentPage} / {Math.min(totalPages, 99)}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-1.5 rounded-lg hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent text-slate-500 transition-colors"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- RIGHT PANEL: PODIUM & INFO (35%) --- */}
                <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 pr-1 pb-2">
                    {/* Podium Card - Fixed Layout */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 relative overflow-visible mt-2">
                        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                            <Trophy size={100} className="text-indigo-500" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800 mb-8 flex items-center gap-2">
                            <Crown size={18} className="text-yellow-500" /> Top Performers
                        </h2>

                        <div className="flex items-end justify-center gap-3 h-60 mb-2">
                            {topThree[1] && <PodiumStep user={topThree[1]} rank={2} color="bg-slate-100" height="h-24" />}
                            {topThree[0] && <PodiumStep user={topThree[0]} rank={1} color="bg-indigo-100" height="h-36" isGold />}
                            {topThree[2] && <PodiumStep user={topThree[2]} rank={3} color="bg-orange-50" height="h-16" />}
                        </div>
                    </div>

                    {/* Quick Stats - Dynamic Label */}
                    <div className="grid grid-cols-2 gap-4">
                        <StatCard
                            icon={<Users size={18} className="text-indigo-600" />}
                            label={`Total ${activeTab === 'students' ? 'Students' : 'Faculty'}`}
                            value={activeTab === 'students' ? stats.total_students : stats.total_faculty}
                            bg="bg-indigo-50"
                        />
                        <StatCard
                            icon={<Award size={18} className="text-emerald-600" />}
                            label="Top Score"
                            value={activeTab === 'students' ? stats.student_top_score : stats.faculty_top_score}
                            bg="bg-emerald-50"
                        />
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
                {user.avatar}
            </div>
        </div>
        <div className={`w-full ${height} ${color} rounded-t-lg flex items-start justify-center pt-2 transition-all hover:opacity-90`}>
            <span className={`text-lg font-bold ${rank === 1 ? 'text-indigo-900' : 'text-slate-600'}`}>{rank}</span>
        </div>
        <div className="mt-2 text-center">
            <div className="text-[10px] font-bold text-slate-700 truncate w-full">{user.name}</div>
            <div className="text-[9px] font-semibold text-indigo-500">{user.total_score}</div>
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