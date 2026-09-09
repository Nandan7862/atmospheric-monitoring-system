
import React from 'react';
import { useSystemData } from '../hooks/useSystemData';
import { EdgeDevice } from '../types';

// Icons
const ChipIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h12A2.25 2.25 0 0020.25 14.25V3M3.75 16.5V21a2.25 2.25 0 002.25 2.25h12A2.25 2.25 0 0020.25 21v-4.5M3.75 16.5h16.5M10.5 6a.75.75 0 100 1.5.75.75 0 000-1.5zM13.5 6a.75.75 M10.5 6a.75.75 0 100 1.5.75.75 0 000-1.5zM13.5 6a.75.75 0 100 1.5.75.75 0 000-1.5z" /></svg>;
const DeviceMetric: React.FC<{label: string, value: string | number, unit?: string}> = ({label, value, unit}) => (
    <div>
        <div className="text-sm text-gray-400">{label}</div>
        <div className="text-lg font-semibold text-gray-200">
            {value} <span className="text-sm font-normal text-gray-400">{unit}</span>
        </div>
    </div>
);

const formatUptime = (seconds: number) => {
    if (seconds === 0) return 'N/A';
    const d = Math.floor(seconds / (3600*24));
    const h = Math.floor(seconds % (3600*24) / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    return `${d}d ${h}h ${m}m`;
};


const DeviceCard: React.FC<{device: EdgeDevice}> = ({ device }) => {
    const isOnline = device.status === 'Online';
    return (
        <div className={`w-full h-full bg-black/20 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/10 transition-colors duration-300 ${isOnline ? 'group-hover:border-cyan-400/50' : 'border-red-500/30'}`}>
            <div className="flex justify-between items-start">
                <div className="flex items-center">
                     <div className={isOnline ? 'text-cyan-400' : 'text-red-400'}><ChipIcon/></div>
                     <h3 className="text-lg font-semibold text-gray-200 ml-4">{device.id}</h3>
                </div>
                <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-500'}`}></div>
                    <span className={`font-semibold ${isOnline ? 'text-green-400' : 'text-red-400'}`}>{device.status}</span>
                </div>
            </div>
            <div className="mt-6 border-t border-white/10 pt-4">
                <p className="text-sm text-gray-400 mb-4">{device.ipAddress}</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <DeviceMetric label="Uptime" value={formatUptime(device.uptime)} />
                    <DeviceMetric label="CPU Temp" value={isOnline ? device.cpuTemp.toFixed(1) : '--'} unit="°C" />
                    <DeviceMetric label="Memory" value={isOnline ? device.memoryUsage.toFixed(1) : '--'} unit="%" />
                </div>
            </div>
        </div>
    );
}

export const DeviceManagementPage: React.FC = () => {
    const { devices } = useSystemData();

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {devices.map(device => (
                    <a 
                        key={device.id} 
                        href={`#/device/${device.id}`} 
                        className="block group transition-transform duration-300 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded-2xl"
                        aria-label={`View details for ${device.id}`}
                    >
                        <DeviceCard device={device} />
                    </a>
                ))}
            </div>
        </div>
    );
};
