const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'src/components/UI/CreateUserModal/CreateUserModal.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

const replacements = {
    'className="modal-overlay"': 'className="fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"',
    'className="modal-card"': 'className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"',
    'className="modal-header"': 'className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white z-10 shrink-0"',
    'className="header-info"': 'className="flex items-center gap-3"',
    'className="icon-badge"': 'className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center"',
    'className="close-x-btn"': 'className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"',
    'className="step-tracker"': 'className="flex items-center gap-2 px-6 py-4 bg-slate-50 border-b border-slate-100 shrink-0"',
    'className="modal-body-scroll"': 'className="p-6 overflow-y-auto flex-1 custom-scrollbar"',
    'className="form-container"': 'className="flex flex-col gap-6"',
    'className="form-section"': 'className="flex flex-col gap-4"',
    'className="form-section-title"': 'className="text-sm font-bold text-slate-800 uppercase tracking-wider"',
    'className="input-grid"': 'className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-y-5"',
    'className="input-group"': 'className="flex flex-col gap-1.5"',
    'className="modern-input"': 'className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[0.9rem] outline-none transition-all focus:border-indigo-500 focus:shadow-[0_0_0_4px_rgba(99,102,241,0.1)] placeholder:text-slate-400"',
    'className="modern-select"': 'className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[0.9rem] outline-none transition-all focus:border-indigo-500 focus:shadow-[0_0_0_4px_rgba(99,102,241,0.1)] cursor-pointer appearance-none"',
    'modern-input readonly-field': 'w-full px-4 py-2.5 border rounded-xl text-[0.9rem] outline-none bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed',
    'className={`modern-input ${isEdit \\? \'readonly-field\' : \'\'}`}': 'className={`w-full px-4 py-2.5 border rounded-xl text-[0.9rem] outline-none transition-all ${isEdit ? \'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed\' : \'bg-white border-slate-200 focus:border-indigo-500 focus:shadow-[0_0_0_4px_rgba(99,102,241,0.1)] placeholder:text-slate-400\'}`',
    'className="search-wrapper"': 'className="relative"',
    'className="search-input-box"': 'className="relative"',
    'className="search-icon-sm"': 'className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"',
    'className="dropdown-panel"': 'className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto"',
    'className="dropdown-loading"': 'className="p-4 text-sm text-slate-500 text-center"',
    'className="dropdown-no-results"': 'className="p-4 text-sm text-slate-500 text-center"',
    'className="dropdown-item"': 'className="px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 cursor-pointer flex justify-between items-center transition-colors"',
    'className="item-name"': 'className="font-medium text-slate-700"',
    'className="item-id"': 'className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md font-mono"',
    'className="no-items"': 'className="text-center py-12 text-slate-500"',
    'className="modal-footer"': 'className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0"',
    'className="error-container"': 'className="flex-1"',
    'className="error-alert"': 'className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg w-fit"',
    'className="footer-actions"': 'className="flex gap-3"',
    'className="secondary-btn"': 'className="px-5 py-2.5 rounded-xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-800 transition-colors"',
    'className="primary-btn"': 'className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-indigo-500 border-none hover:bg-indigo-600 transition-all shadow-[0_4px_12px_rgba(99,102,241,0.2)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-indigo-500 disabled:hover:translate-y-0 disabled:shadow-none"',
    '<h2>': '<h2 className="text-xl font-bold text-slate-800 m-0">',
    '<p>': '<p className="text-sm text-slate-500 m-0 mt-0.5">',
    '<label>': '<label className="text-[0.85rem] font-bold text-slate-700">',
    'className={`step-item \\$\\{step >= 1 \\? \'active\' : \'\'\\}`}': 'className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${step >= 1 ? \'text-indigo-600 bg-white shadow-sm\' : \'text-slate-400\'}`}',
    'className={`step-item \\$\\{step === 2 \\? \'active\' : \'\'\\}`}': 'className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${step === 2 ? \'text-indigo-600 bg-white shadow-sm\' : \'text-slate-400\'}`}',
    'className="step-circle"': 'className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold"',
    '<div className="step-circle">\\$\\{step > 1 \\? <Check size=\\{14\\} /> : \'1\'\\}</div>': '<div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? \'bg-indigo-500 text-white\' : \'bg-slate-200 text-slate-500\'}`}>{step > 1 ? <Check size={14} /> : \'1\'}</div>',
    '<div className="step-circle">2</div>': '<div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${step === 2 ? \'bg-indigo-500 text-white\' : \'bg-slate-200 text-slate-500\'}`}>2</div>',
    'className={`step-connector \\$\\{step > 1 \\? \'active\' : \'\'\\}`}': 'className={`h-[2px] w-8 transition-colors ${step > 1 ? \'bg-indigo-500\' : \'bg-slate-200\'}`}'
};

for (const [key, value] of Object.entries(replacements)) {
    const regex = new RegExp(key, 'g');
    content = content.replace(regex, value);
}

fs.writeFileSync(targetFile, content);
console.log('Styles updated.');
