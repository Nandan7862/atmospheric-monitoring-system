
import React, { useState } from 'react';
import { useSystemData } from '../hooks/useSystemData';
import { Report } from '../types';

// Icons
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.067-2.09.921-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>;
const SpinnerIcon = () => <svg className="animate-spin h-4 w-4 text-cyan-500 dark:text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;

const getStatusBadge = (status: Report['status']) => {
    switch (status) {
        case 'Completed': return <span className="px-3 py-1 text-xs font-semibold text-green-800 dark:text-green-300 bg-green-200 dark:bg-green-500/20 rounded-full">Completed</span>;
        case 'Generating': return <span className="flex items-center px-3 py-1 text-xs font-semibold text-cyan-800 dark:text-cyan-300 bg-cyan-200 dark:bg-cyan-500/20 rounded-full"><SpinnerIcon/> <span className="ml-2">Generating</span></span>;
        case 'Pending': return <span className="px-3 py-1 text-xs font-semibold text-yellow-800 dark:text-yellow-300 bg-yellow-200 dark:bg-yellow-500/20 rounded-full">Pending</span>;
        case 'Failed': return <span className="px-3 py-1 text-xs font-semibold text-red-800 dark:text-red-300 bg-red-200 dark:bg-red-500/20 rounded-full">Failed</span>;
    }
}

const selectStyles = "w-full bg-gray-200/50 dark:bg-[#1C243A] border border-gray-300 dark:border-slate-700/80 rounded-lg px-4 py-3 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors placeholder:text-gray-500 dark:placeholder:text-gray-400";

export const ReportsPage: React.FC = () => {
    const { reports, createReport, deleteReport } = useSystemData();
    const [format, setFormat] = useState<Report['format']>('PDF');
    
    const handleGenerate = (e: React.FormEvent) => {
        e.preventDefault();
        createReport(format, 'Last 24 hours', ['All Sensors']);
    };
    
    const handleDownload = (report: Report) => {
        if (report.status !== 'Completed') return;

        // Simulate file generation based on format
        let blob: Blob;
        let filename = `report-${report.id}.${format.toLowerCase()}`;
        let content = `
            Report ID: ${report.id}
            Created At: ${new Date(report.createdAt).toLocaleString()}
            Format: ${report.format}
            Date Range: ${report.dateRange}
            Sensors: ${report.sensors.join(', ')}

            --- Simulated Data ---
            Timestamp, Temp(C), PM2.5(ug/m3)
            ${new Date().toISOString()}, 22.5, 15.2
            ${new Date(Date.now() - 3600000).toISOString()}, 22.1, 14.8
        `;

        if (format === 'PDF') {
            // For PDF, we create a simple text file and give it a .pdf extension
            // A real implementation would use a library like jsPDF.
            blob = new Blob([`This is a simulated PDF document.\n\n${content}`], { type: 'application/pdf' });
        } else if (format === 'JSON') {
            blob = new Blob([JSON.stringify({ reportId: report.id, data: content }, null, 2)], { type: 'application/json' });
        } else { // CSV
            blob = new Blob([content.replace(/ /g, '').replace(/\t/g,'')], { type: 'text/csv' });
        }

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-8">
            <div className="bg-white/50 dark:bg-black/20 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-white/10">
                <form onSubmit={handleGenerate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Date Range</label>
                            <select className={selectStyles}>
                                <option>Last 24 hours</option>
                                <option>Last 7 days</option>
                                <option>Last 30 days</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Sensors</label>
                            <select className={selectStyles}>
                                <option>All Sensors</option>
                                <option>Environment Only</option>
                                <option>Air Quality Only</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Export Format</label>
                        <div className="grid grid-cols-3 gap-3 p-1 rounded-lg bg-gray-200/60 dark:bg-[#1C243A]">
                            {(['CSV', 'JSON', 'PDF'] as Report['format'][]).map(f => (
                                <button key={f} type="button" onClick={() => setFormat(f)} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 ${format === f ? 'bg-white text-gray-800 shadow-sm dark:bg-slate-700/80 dark:text-cyan-300' : 'text-gray-500 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-slate-800/50'}`}>{f}</button>
                            ))}
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg py-3 hover:scale-[1.02] active:scale-100 transform transition-transform duration-200 shadow-lg shadow-cyan-500/20 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-[#050816]">
                        Generate
                    </button>
                </form>
            </div>
            
            <div className="bg-white/50 dark:bg-black/20 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-white/10">
                 <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-4">Generated Reports</h3>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-gray-200 dark:border-white/10 text-sm text-gray-500 dark:text-gray-400">
                            <tr>
                                <th className="p-3 font-semibold">Status</th>
                                <th className="p-3 font-semibold">Created At</th>
                                <th className="p-3 font-semibold">Format</th>
                                <th className="p-3 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map(r => (
                                <tr key={r.id} className="border-b border-gray-200/50 dark:border-white/5 last:border-0">
                                    <td className="p-3 align-middle">{getStatusBadge(r.status)}</td>
                                    <td className="p-3 text-gray-700 dark:text-gray-300 align-middle whitespace-nowrap">{new Date(r.createdAt).toLocaleString()}</td>
                                    <td className="p-3 text-gray-700 dark:text-gray-300 align-middle">{r.format}</td>
                                    <td className="p-3 align-middle">
                                        <div className="flex justify-end items-center space-x-2">
                                            <button 
                                                onClick={() => handleDownload(r)}
                                                disabled={r.status !== 'Completed'} 
                                                className="p-2 rounded-md text-gray-500 dark:text-green-300 bg-gray-200 dark:bg-green-500/20 hover:enabled:bg-gray-300 dark:hover:enabled:bg-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                aria-label="Download Report"
                                            >
                                                <DownloadIcon/>
                                            </button>
                                            <button 
                                                onClick={() => deleteReport(r.id)} 
                                                className="p-2 rounded-md text-gray-500 dark:text-red-300 bg-gray-200 dark:bg-red-500/20 hover:bg-gray-300 dark:hover:bg-red-500/30 transition-colors"
                                                aria-label="Delete Report"
                                            >
                                                <TrashIcon/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                             {reports.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-center py-12 text-gray-500 dark:text-gray-400">No reports generated yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                 </div>
            </div>
        </div>
    );
};
