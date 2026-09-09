
import React from 'react';
import { useSystemData } from '../hooks/useSystemData';
import { ApiServiceStatus } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Icons
const SignalIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8.25V18a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 18V8.25m-18 0V6a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 6v2.25m-18 0h18M5.25 6h.008v.008H5.25V6zM7.5 6h.008v.008H7.5V6zm2.25 0h.008v.008H9.75V6z" /></svg>;

const getStatusStyles = (status: ApiServiceStatus['status']) => {
    switch(status) {
        case 'Operational': return { text: 'text-green-400', bg: 'bg-green-500/10' };
        case 'Degraded': return { text: 'text-yellow-400', bg: 'bg-yellow-500/10' };
        case 'Outage': return { text: 'text-red-400', bg: 'bg-red-500/10' };
    }
};

const UptimeHistory: React.FC<{history: {day: number; up: boolean}[]}> = ({ history }) => (
    <div className="grid grid-cols-30 grid-rows-3 gap-px">
        {history.map(day => (
            <div key={day.day} className={`w-full h-2 rounded-sm ${day.up ? 'bg-green-500' : 'bg-red-500'}`} title={`Day ${day.day + 1}: ${day.up ? 'Operational' : 'Outage'}`}></div>
        ))}
    </div>
);

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-black/40 backdrop-blur-md p-3 rounded-lg border border-white/10 shadow-lg">
                <p className="intro text-cyan-300">
                    {`P95 Latency: ${payload[0].value?.toFixed(0)} ms`}
                </p>
            </div>
        );
    }
    return null;
};

export const APIStatusPage: React.FC = () => {
    const { services, apiLatency } = useSystemData();

    return (
        <div className="space-y-8">
            <div className="bg-black/20 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/10">
                <div className="flex items-center mb-6">
                    <div className="text-cyan-400 mr-4"><SignalIcon/></div>
                    <h3 className="text-xl font-semibold text-gray-200">Backend Services Health</h3>
                </div>
                <div className="space-y-4">
                    {services.map(service => {
                        const styles = getStatusStyles(service.status);
                        return (
                            <div key={service.id} className={`p-4 rounded-lg border border-white/10 ${styles.bg}`}>
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-gray-200">{service.name}</span>
                                    <span className={`font-bold ${styles.text}`}>{service.status}</span>
                                </div>
                                <div className="mt-4">
                                    <UptimeHistory history={service.uptimeHistory} />
                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                        <span>90 days ago</span>
                                        <span>Today</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            
             <div className="bg-black/20 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/10 h-96">
                <h3 className="text-lg font-semibold text-gray-200 mb-4">API Gateway Latency (P95)</h3>
                 <ResponsiveContainer width="100%" height="85%">
                    <AreaChart data={apiLatency}>
                        <defs>
                            <linearGradient id="latencyColor" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.6}/>
                                <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="time" stroke="#A0AEC0" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                        <YAxis stroke="#A0AEC0" tick={{fontSize: 12}} label={{ value: 'ms', angle: -90, position: 'insideLeft', fill: '#A0AEC0' }} domain={[0, 'dataMax + 20']} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="latency" stroke="#2dd4bf" strokeWidth={2} fill="url(#latencyColor)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
