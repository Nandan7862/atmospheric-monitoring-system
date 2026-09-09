
import { useState, useEffect } from 'react';
import { EdgeDevice, ApiServiceStatus, Report, Process, NetworkDataPoint } from '../types';

// --- Helper Functions ---
const generateRandomIp = () => `192.168.1.${Math.floor(Math.random() * 254) + 1}`;
const generateValue = (base: number, range: number, decimals = 1) => parseFloat((base + (Math.random() - 0.5) * range).toFixed(decimals));

// --- Initial State and Simulation Logic ---

const generateProcesses = (): Process[] => {
    const processes = [
        { pid: 1, name: 'systemd', cpu: 0.1, memory: 15.2, status: 'Running' as const },
        { pid: 152, name: 'sshd', cpu: 0.0, memory: 5.8, status: 'Running' as const },
        { pid: 310, name: 'data-aggregator', cpu: generateValue(5, 2), memory: 45.5, status: 'Running' as const },
        { pid: 311, name: 'mqtt-client', cpu: generateValue(2, 1), memory: 22.1, status: 'Running' as const },
        { pid: 450, name: 'python3', cpu: 0.0, memory: 18.9, status: 'Sleeping' as const },
        { pid: 455, name: 'cron', cpu: 0.0, memory: 2.1, status: 'Sleeping' as const },
    ];
    return processes.map(p => ({...p, cpu: generateValue(p.cpu, 0.1, 2), memory: generateValue(p.memory, 0.5, 2)}));
};

const generateInitialTraffic = (): NetworkDataPoint[] => 
    Array.from({length: 30}, (_, i) => ({
        time: Date.now() - (30 - i) * 5000,
        bytesIn: generateValue(1024, 512, 0),
        bytesOut: generateValue(512, 256, 0)
    }));


const initialDevices: EdgeDevice[] = [
    { id: 'RPi-Node-01', status: 'Online', ipAddress: '192.168.1.101', uptime: 7_283_400, cpuTemp: 45.2, memoryUsage: 25.8, firmwareVersion: 'v1.2.3', networkTraffic: generateInitialTraffic(), processes: generateProcesses() },
    { id: 'RPi-Node-02', status: 'Online', ipAddress: '192.168.1.105', uptime: 3_153_600, cpuTemp: 48.1, memoryUsage: 31.2, firmwareVersion: 'v1.2.1', networkTraffic: generateInitialTraffic(), processes: generateProcesses() },
    { id: 'RPi-Node-03', status: 'Offline', ipAddress: '192.168.1.112', uptime: 0, cpuTemp: 0, memoryUsage: 0, firmwareVersion: 'v1.1.0', networkTraffic: [], processes: [] },
    { id: 'RPi-Node-04', status: 'Online', ipAddress: '192.168.1.120', uptime: 12_200_000, cpuTemp: 42.5, memoryUsage: 22.5, firmwareVersion: 'v1.2.3', networkTraffic: generateInitialTraffic(), processes: generateProcesses() },
];


const initialServices: ApiServiceStatus[] = [
    { id: 'api-gateway', name: 'API Gateway (FastAPI)', status: 'Operational', uptimeHistory: Array.from({length: 90}, (_, i) => ({ day: i, up: Math.random() > 0.02 })) },
    { id: 'timescaledb', name: 'TimescaleDB', status: 'Operational', uptimeHistory: Array.from({length: 90}, (_, i) => ({ day: i, up: Math.random() > 0.01 })) },
    { id: 'ml-forecasting', name: 'ML Forecasting Module', status: 'Operational', uptimeHistory: Array.from({length: 90}, (_, i) => ({ day: i, up: Math.random() > 0.03 })) },
    { id: 'hotspot-detection', name: 'Pollution Hotspot Detection', status: 'Degraded', uptimeHistory: Array.from({length: 90}, (_, i) => ({ day: i, up: Math.random() > 0.05 })) },
    { id: 'geospatial-viz', name: 'Geospatial Visualization', status: 'Operational', uptimeHistory: Array.from({length: 90}, (_, i) => ({ day: i, up: true })) },
];


export const useSystemData = (updateInterval: number = 5000) => {
    const [devices, setDevices] = useState<EdgeDevice[]>(initialDevices);
    const [services, setServices] = useState<ApiServiceStatus[]>(initialServices);
    const [reports, setReports] = useState<Report[]>([]);
    const [apiLatency, setApiLatency] = useState<any[]>(() => 
        Array.from({length: 50}, (_,i) => ({ time: `-${50-i}s`, latency: generateValue(80, 40, 0) }))
    );

    useEffect(() => {
        const intervalId = setInterval(() => {
            // Update devices
            setDevices(prevDevices => prevDevices.map(d => {
                if (d.status === 'Online') {
                    const newTraffic: NetworkDataPoint[] = [...d.networkTraffic, {
                        time: Date.now(),
                        bytesIn: generateValue(1024, 512, 0),
                        bytesOut: generateValue(512, 256, 0),
                    }].slice(-30); // Keep last 30 points

                    return {
                        ...d,
                        uptime: d.uptime + updateInterval / 1000,
                        cpuTemp: generateValue(d.cpuTemp, 1.5),
                        memoryUsage: generateValue(d.memoryUsage, 2),
                        networkTraffic: newTraffic,
                        processes: generateProcesses(),
                    }
                }
                return d;
            }));
            
            // Update API Latency
            setApiLatency(prev => {
                const newHistory = [...prev, { time: 'now', latency: generateValue(80, 40, 0) }];
                 if (newHistory.length > 50) {
                    return newHistory.slice(newHistory.length - 50);
                }
                return newHistory;
            });

            // Update reports status
            setReports(prevReports => prevReports.map(r => {
                if (r.status === 'Pending') {
                    return { ...r, status: 'Generating' };
                }
                if (r.status === 'Generating') {
                     if (Math.random() > 0.2) {
                         return { ...r, status: 'Completed', downloadUrl: `/downloads/report-${r.id}.zip` };
                     } else {
                         return r;
                     }
                }
                return r;
            }));

        }, updateInterval);

        return () => clearInterval(intervalId);
    }, [updateInterval]);

    const createReport = (format: Report['format'], dateRange: string, sensors: string[]) => {
        const newReport: Report = {
            id: `${Date.now()}`,
            createdAt: new Date().toISOString(),
            status: 'Pending',
            format,
            dateRange,
            sensors,
        };
        setReports(prev => [newReport, ...prev]);
    };

    const deleteReport = (id: string) => {
        setReports(prev => prev.filter(r => r.id !== id));
    };

    const getDeviceById = (id: string): EdgeDevice | undefined => {
        return devices.find(d => d.id === id);
    };

    return { devices, services, reports, apiLatency, createReport, deleteReport, getDeviceById };
};
