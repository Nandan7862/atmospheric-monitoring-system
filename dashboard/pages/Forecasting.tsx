import React from 'react';
import { useAdvancedData } from '../hooks/useAdvancedData';
// FIX: Added `Label` to imports from recharts to correctly label the reference line.
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine, Label } from 'recharts';
import { ForecastDataPoint } from '../types';

interface ForecastChartProps {
  data: ForecastDataPoint[];
  title: string;
  yAxisLabel: string;
  color: string;
}

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const formattedDate = new Date(label).toLocaleString();
        return (
            <div className="bg-white/70 dark:bg-black/40 backdrop-blur-md p-3 rounded-lg border border-gray-200 dark:border-white/10 shadow-lg">
                <p className="label text-sm text-gray-700 dark:text-gray-300">{formattedDate}</p>
                <p className="intro" style={{ color: payload[0].color }}>
                    {`Value: ${payload[0].value?.toFixed(1)}`}
                    <span className={`ml-2 text-xs font-semibold ${data.type === 'forecast' ? 'text-yellow-600 dark:text-yellow-400' : 'text-cyan-600 dark:text-cyan-400'}`}>
                        ({data.type.charAt(0).toUpperCase() + data.type.slice(1)})
                    </span>
                </p>
            </div>
        );
    }
    return null;
};

const ForecastChart: React.FC<ForecastChartProps> = ({ data, title, yAxisLabel, color }) => {
    const forecastStartIndex = data.findIndex(d => d.type === 'forecast');
    const axisColor = "rgb(107 114 128)"; // gray-500, works on both themes

    return (
        <div className="bg-white/50 dark:bg-black/20 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-white/10 h-96">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-4">{title}</h3>
            <ResponsiveContainer width="100%" height="85%">
                <AreaChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <defs>
                        <linearGradient id={`color-${yAxisLabel}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.6}/>
                            <stop offset="95%" stopColor={color} stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                    <XAxis 
                        dataKey="timestamp" 
                        stroke={axisColor} 
                        tick={{fontSize: 12}}
                        tickFormatter={(unixTime) => new Date(unixTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        tickLine={false}
                        axisLine={{stroke: "rgba(128, 128, 128, 0.3)"}}
                    />
                    <YAxis 
                        stroke={axisColor}
                        tick={{fontSize: 12}} 
                        label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', fill: axisColor, fontSize: 14 }} 
                        tickLine={false}
                        axisLine={{stroke: "rgba(128, 128, 128, 0.3)"}}
                        domain={['dataMin - 1', 'dataMax + 1']}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                        verticalAlign="top" 
                        align="right" 
                        height={36} 
                        formatter={(value) => <span className="text-gray-700 dark:text-white">{value}</span>}
                    />
                    <Area type="monotone" dataKey="value" name="History" stroke={color} strokeWidth={2} fillOpacity={1} fill={`url(#color-${yAxisLabel})`} dot={false} connectNulls />
                    <Area type="monotone" dataKey={d => d.type === 'forecast' ? d.value : null} name="Forecast" stroke={color} strokeWidth={2} strokeDasharray="5 5" fill="transparent" dot={false} connectNulls />
                    
                    {forecastStartIndex > -1 && (
                        <ReferenceLine x={data[forecastStartIndex].timestamp} stroke="rgb(234 179 8)" strokeDasharray="3 3">
                             <Label value="Forecast Start" position="top" fill="rgb(234 179 8)" fontSize={12} />
                        </ReferenceLine>
                    )}
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};


export const ForecastingPage: React.FC = () => {
    const { forecasts } = useAdvancedData(5000);

    return (
        <div className="space-y-8">
            <ForecastChart 
                title="Temperature Forecast (12-hour projection)"
                data={forecasts.temperature}
                yAxisLabel="°C"
                color="#2dd4bf"
            />
            <ForecastChart 
                title="PM2.5 Forecast (12-hour projection)"
                data={forecasts.pm25}
                yAxisLabel="µg/m³"
                color="#f87171"
            />
            <ForecastChart 
                title="AQI Forecast (12-hour projection)"
                data={forecasts.aqi}
                yAxisLabel="ppm"
                color="#84cc16"
            />
        </div>
    );
};