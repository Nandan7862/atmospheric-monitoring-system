
import React from 'react';
import { useAdvancedData } from '../hooks/useAdvancedData';
import { Alert } from '../types';

const ExclamationTriangleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
    </svg>
);
const ExclamationCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
);
const InformationCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
);

const AlertIcon: React.FC<{ severity: Alert['severity'] }> = ({ severity }) => {
    const baseClasses = "h-6 w-6 mr-4 mt-0.5 flex-shrink-0";
    if (severity === 'Critical') {
        return <ExclamationTriangleIcon className={`${baseClasses} text-red-400/80`} />;
    }
    if (severity === 'Warning') {
        return <ExclamationCircleIcon className={`${baseClasses} text-amber-400/80`} />;
    }
    return <InformationCircleIcon className={`${baseClasses} text-sky-400/80`} />;
};

const getSeverityStyles = (severity: Alert['severity']): string => {
    switch(severity) {
        case 'Critical': return 'bg-red-950/70';
        case 'Warning': return 'bg-amber-950/70';
        case 'Info': return 'bg-blue-950/70';
        default: return 'bg-gray-900/70';
    }
};

export const AlertsPage: React.FC = () => {
    const { alerts } = useAdvancedData();
    
    return (
        <div className="animate-fade-in-down">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-200">System Alerts Feed</h3>
            </div>
            <div className="space-y-3">
                {alerts.length > 0 ? (
                    alerts.map(alert => (
                        <div key={alert.id} className={`p-4 rounded-lg flex items-start ${getSeverityStyles(alert.severity)}`}>
                            <AlertIcon severity={alert.severity} />
                            <div className="flex-grow">
                                <div className="flex justify-between items-start">
                                    <p className="font-bold text-gray-200/90 pr-4">
                                        {alert.message}
                                    </p>
                                    <span className="text-xs text-gray-500 flex-shrink-0 whitespace-nowrap">{new Date(alert.timestamp).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit' })}</span>
                                </div>
                                <p className="text-sm text-gray-400/80 mt-1">
                                    {alert.details}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-16 bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 dark:border-white/10">
                        <InformationCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-200">No Active Alerts</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">The system is currently operating normally.</p>
                    </div>
                )}
            </div>
        </div>
    );
};