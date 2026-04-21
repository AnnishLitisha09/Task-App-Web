import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const Pagination = ({
    currentPage,
    totalPages,
    onPageChange,
    itemsPerPage,
    onItemsPerPageChange,
    totalItems,
    showingCount
}) => {
    if (totalPages <= 1 && totalItems <= itemsPerPage) {
        return (
            <div className="flex justify-between items-center px-6 py-4 bg-white border-t border-slate-100 rounded-b-[20px]">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Showing all {totalItems} items
                </p>
            </div>
        );
    }

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            let start = Math.max(1, currentPage - 2);
            let end = Math.min(totalPages, start + maxVisible - 1);

            if (end === totalPages) start = Math.max(1, end - maxVisible + 1);

            for (let i = start; i <= end; i++) pages.push(i);
        }
        return pages;
    };

    return (
        <div className="flex flex-wrap justify-between items-center gap-y-4 gap-x-6 px-6 py-5 bg-white border-t border-slate-100 rounded-b-[24px] max-sm:px-4 max-sm:py-4">
            <div className="flex items-center gap-4 max-[500px]:w-full max-[500px]:justify-between">
                <p className="text-[0.7rem] font-bold text-slate-400 uppercase tracking-wider">
                    Showing <span className="text-slate-800">{showingCount}</span> <span className="max-sm:hidden">of</span><span className="sm:hidden">/</span> <span className="text-slate-800">{totalItems}</span> <span className="max-[400px]:hidden">Items</span>
                </p>

                <div className="h-4 w-px bg-slate-200 max-[500px]:hidden"></div>

                <div className="flex items-center gap-2">
                    <span className="text-[0.7rem] font-bold text-slate-400 uppercase tracking-wider max-[400px]:hidden">Per Page:</span>
                    <select
                        value={itemsPerPage}
                        onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-[0.7rem] font-bold text-slate-600 outline-none cursor-pointer focus:border-indigo-500 hover:border-indigo-300 transition-all"
                    >
                        {[5, 10, 20, 50].map(size => (
                            <option key={size} value={size}>{size}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex items-center gap-1.5 max-sm:w-full max-sm:justify-center">
                <button
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-all"
                    title="First Page"
                >
                    <ChevronsLeft size={16} />
                </button>
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-all"
                    title="Previous Page"
                >
                    <ChevronLeft size={16} />
                </button>

                <div className="flex items-center gap-1 mx-1">
                    {getPageNumbers().map(number => (
                        <button
                            key={number}
                            onClick={() => onPageChange(number)}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${currentPage === number
                                    ? 'bg-indigo-500 text-white shadow-sm shadow-indigo-100'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
                                }`}
                        >
                            {number}
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-all"
                    title="Next Page"
                >
                    <ChevronRight size={16} />
                </button>
                <button
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-all"
                    title="Last Page"
                >
                    <ChevronsRight size={16} />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
