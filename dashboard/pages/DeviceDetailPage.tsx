
import React, { useState } from 'react';
import { useSystemData } from '../hooks/useSystemData';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// --- Icons ---
const ChipIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h12A2.25 2.25 0 0020.25 14.25V3M3.75 16.5V21a2.25 2.25 0 002.25 2.25h12A2.25 2.25 0 0020.25 21v-4.5M3.75 16.5h16.5M10.5 6a.75.75 0 100 1.5.75.75 0 000-1.5zM13.5 6a.75.75 0 100 1.5.75.75 0 000-1.5z" /></svg>;
const RebootIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 20h5v-5M20 4h-5v5" /></svg>;
const ShutdownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>;
// --- End Icons ---

const formatUptimeDetail = (seconds: number) => {
    if (seconds === 0) return 'N/A';
    const d = Math.floor(seconds / (3600*24));
    const h = Math.floor(seconds % (3600*24) / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    const s = Math.floor(seconds % 60);
    return `${d}d ${h}h ${m}m ${s}s`;
};

const LivePerfChart: React.FC<{data: any[], dataKey: string, color: string, unit: string, name: string}> = ({ data, dataKey, color, unit, name }) => (
    <div className="h-24">
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id={`color-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.7}/>
                        <stop offset="95%" stopColor={color} stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <Tooltip 
                    contentStyle={{ 
                        background: 'rgba(5, 8, 22, 0.7)', 
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '0.75rem',
                        backdropFilter: 'blur(4px)'
                    }}
                    labelFormatter={(label) => new Date(label).toLocaleTimeString()}
                    formatter={(value: number) => [`${value.toFixed(1)} ${unit}`, name]}
                />
                <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fill={`url(#color-${dataKey})`} />
            </AreaChart>
        </ResponsiveContainer>
    </div>
);


export const DeviceDetailPage: React.FC<{ deviceId: string }> = ({ deviceId }) => {
    const { getDeviceById } = useSystemData(2000); // Faster updates for detail view
    const device = getDeviceById(deviceId);

    if (!device) {
        return (
            <div className="flex flex-col items-center justify-center h-96 bg-black/20 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-red-500/30">
                <h2 className="text-3xl font-bold text-red-400">Device Not Found</h2>
                <p className="text-gray-400 mt-2">Could not find a device with ID: <span className="font-semibold text-red-300">{deviceId}</span></p>
                <a href="#/device-management" className="mt-6 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:scale-105 transition-transform duration-200">
                    Back to Device Management
                </a>
            </div>
        );
    }
    
    const isOnline = device.status === 'Online';

    return (
        <div className="space-y-8">
            {/* Header Card */}
            <div className="bg-black/20 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/10 flex flex-col md:flex-row justify-between items-center">
                <div className="flex items-center">
                    <div className={isOnline ? 'text-cyan-400' : 'text-red-400'}><ChipIcon /></div>
                    <div className="ml-4">
                        <h2 className="text-2xl font-bold text-gray-100">{device.id}</h2>
                        <div className="flex items-center text-sm text-gray-400">
                           <div className={`w-2.5 h-2.5 rounded-full mr-2 ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-500'}`}></div>
                           {device.status} - {device.ipAddress}
                        </div>
                    </div>
                </div>
                <div className="flex items-center space-x-3 mt-4 md:mt-0">
                    <button className="flex items-center px-4 py-2 bg-yellow-500/20 text-yellow-300 font-semibold rounded-lg hover:bg-yellow-500/30 transition-colors disabled:opacity-50" disabled={!isOnline}><RebootIcon/> Reboot</button>
                    <button className="flex items-center px-4 py-2 bg-red-500/20 text-red-300 font-semibold rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50" disabled={!isOnline}><ShutdownIcon/> Shutdown</button>
                </div>
            </div>

            {/* Live Performance */}
            <div className="bg-black/20 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/10">
                <h3 className="text-xl font-semibold text-gray-200 mb-4">Live Performance</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <div className="flex justify-between items-baseline mb-1">
                            <h4 className="font-semibold text-gray-300">CPU Temperature</h4>
                            <p className="font-bold text-lg text-amber-300">{device.cpuTemp.toFixed(1)} °C</p>
                        </div>
                        <LivePerfChart data={device.networkTraffic} dataKey="cpuTemp" color="#fcd34d" unit="°C" name="CPU Temp" />
                    </div>
                     <div>
                        <div className="flex justify-between items-baseline mb-1">
                            <h4 className="font-semibold text-gray-300">Memory Usage</h4>
                            <p className="font-bold text-lg text-fuchsia-400">{device.memoryUsage.toFixed(1)} %</p>
                        </div>
                        <LivePerfChart data={device.networkTraffic} dataKey="memoryUsage" color="#c084fc" unit="%" name="Memory"/>
                    </div>
                     <div>
                        <div className="flex justify-between items-baseline mb-1">
                            <h4 className="font-semibold text-gray-300">Network Traffic</h4>
                             <p className="font-bold text-sm text-cyan-300">
                                In: {(device.networkTraffic.slice(-1)[0]?.bytesIn / 1024).toFixed(1)} KB/s
                             </p>
                        </div>
                        <LivePerfChart data={device.networkTraffic} dataKey="bytesIn" color="#67e8f9" unit="B/s" name="Bytes In"/>
                    </div>
                </div>
            </div>

            {/* Running Processes */}
            <div className="bg-black/20 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/10">
                 <h3 className="text-xl font-semibold text-gray-200 mb-4">Running Processes</h3>
                 <div className="overflow-x-auto max-h-96">
                    <table className="w-full text-left">
                        <thead className="sticky top-0 bg-black/30 backdrop-blur-sm">
                            <tr className="border-b border-white/10 text-sm text-gray-400">
                                <th className="p-3">PID</th>
                                <th className="p-3">Name</th>
                                <th className="p-3">CPU %</th>
                                <th className="p-3">Memory (MB)</th>
                                <th className="p-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {device.processes.map(p => (
                                <tr key={p.pid} className="border-b border-white/5 text-gray-300">
                                    <td className="p-3 font-mono">{p.pid}</td>
                                    <td className="p-3 font-semibold">{p.name}</td>
                                    <td className="p-3">{p.cpu.toFixed(2)}</td>
                                    <td className="p-3">{p.memory.toFixed(1)}</td>
                                    <td className="p-3">
                                        <span className={p.status === 'Running' ? 'text-green-400' : 'text-gray-500'}>{p.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
            </div>
            
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Configuration */}
                 <div className="bg-black/20 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/10">
                     <h3 className="text-xl font-semibold text-gray-200 mb-4">Configuration</h3>
                     <div className="space-y-3 text-sm">
                         <div className="flex justify-between"><span className="text-gray-400">Firmware Version:</span> <span className="font-semibold text-gray-200">{device.firmwareVersion}</span></div>
                         <div className="flex justify-between"><span className="text-gray-400">Uptime:</span> <span className="font-semibold text-gray-200">{formatUptimeDetail(device.uptime)}</span></div>
                         <div className="flex justify-between"><span className="text-gray-400">Kernel Version:</span> <span className="font-semibold text-gray-200">5.10.63-v7l+</span></div>
                         <div className="flex justify-between"><span className="text-gray-400">MQTT Endpoint:</span> <span className="font-semibold text-gray-200">mqtt.cloud.iot</span></div>
                     </div>
                </div>

                {/* Logs */}
                <div className="bg-black/20 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/10">
                    <h3 className="text-xl font-semibold text-gray-200 mb-4">Device Logs</h3>
                    <div className="bg-black/30 rounded-lg p-4 h-40 overflow-y-auto font-mono text-xs text-gray-400">
                        <p><span className="text-gray-600 mr-2">{new Date().toLocaleTimeString()}:</span> [INFO] Connection to MQTT broker successful.</p>
                        <p><span className="text-gray-600 mr-2">{new Date(Date.now()-2000).toLocaleTimeString()}:</span> [DEBUG] Reading sensor PMS5003...</p>
                        <p><span className="text-gray-600 mr-2">{new Date(Date.now()-4000).toLocaleTimeString()}:</span> [DEBUG] Sending payload, 128 bytes.</p>
                         <p><span className="text-gray-600 mr-2">{new Date(Date.now()-6000).toLocaleTimeString()}:</span> [INFO] System health check OK.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
