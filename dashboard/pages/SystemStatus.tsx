
import React, { useState, useEffect } from 'react';
import { SensorCard } from '../components/SensorCard';
import { MetricDisplay } from '../components/MetricDisplay';

const ChipIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 21v-1.5m.75-18h6m-6 18h6M12 6.75h.008v.008H12V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM12 12h.008v.008H12V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.008v.008H12v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M3 8.25V12m0 3.75V12M12 3v4.5m0 9V21m-3.75-18h7.5c.621 0 1.125.504 1.125 1.125v16.5c0 .621-.504 1.125-1.125 1.125h-7.5c-.621 0-1.125-.504-1.125-1.125V4.125c0-.621.504-1.125 1.125-1.125z" /></svg>;

const LogIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
const generateLog = (level: string, message: string) => ({ timestamp: new Date().toISOString(), level, message });

export const SystemStatusPage: React.FC = () => {
    const [uptime, setUptime] = useState(123456);
    const [logs, setLogs] = useState([
        generateLog('INFO', 'System Initialized.'),
        generateLog('INFO', 'MQTT Connection established.'),
        generateLog('DEBUG', 'Reading BME280 sensor.'),
    ]);

    useEffect(() => {
        const uptimeInterval = setInterval(() => setUptime(u => u + 1), 1000);
        const logInterval = setInterval(() => {
            setLogs(l => {
                const newLog = generateLog('DEBUG', `Sensor read successful. Next read in 5s.`);
                const updatedLogs = [newLog, ...l];
                return updatedLogs.slice(0, 100);
            });
        }, 5000);

        return () => {
            clearInterval(uptimeInterval);
            clearInterval(logInterval);
        };
    }, []);

    const formatUptime = (seconds: number) => {
        const d = Math.floor(seconds / (3600*24));
        const h = Math.floor(seconds % (3600*24) / 3600);
        const m = Math.floor(seconds % 3600 / 60);
        const s = Math.floor(seconds % 60);
        return `${d}d ${h}h ${m}m ${s}s`;
    };

    const getLogLevelStyles = (level: string): {dot: string, text: string} => {
        if (level === 'INFO') return {dot: 'bg-blue-400', text: 'text-blue-300'};
        if (level === 'WARN') return {dot: 'bg-yellow-400', text: 'text-yellow-300'};
        if (level === 'ERROR') return {dot: 'bg-red-400', text: 'text-red-300'};
        return {dot: 'bg-gray-500', text: 'text-gray-400'};
    }

    return (
        <div className="space-y-8">
            <SensorCard title="Edge Node Health" icon={<ChipIcon />}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <MetricDisplay label="Device ID" value="RPi-Node-01" unit="" />
                    <MetricDisplay label="Uptime" value={formatUptime(uptime)} unit="" />
                    <MetricDisplay label="CPU Temp" value="45.2" unit="°C" />
                    <MetricDisplay label="Memory" value="25.8" unit="% used" />
                </div>
            </SensorCard>

             <div className="bg-black/20 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/10">
                <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center"><LogIcon/>Live System Logs</h3>
                <div className="bg-black/30 rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm">
                    {logs.map((log, i) => {
                        const styles = getLogLevelStyles(log.level);
                        return (
                            <div key={i} className="flex items-start mb-1">
                                <span className="text-gray-500 mr-4 whitespace-nowrap">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                <div className="flex items-center w-20 flex-shrink-0">
                                    <span className={`w-2 h-2 rounded-full mr-2 ${styles.dot}`}></span>
                                    <span className={`font-semibold ${styles.text}`}>{log.level}</span>
                                </div>
                                <span className="text-gray-300">{log.message}</span>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};