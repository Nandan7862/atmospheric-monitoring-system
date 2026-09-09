import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TelemetryData, SensorData } from '../types';

interface HistoryChartProps {
  data: TelemetryData[];
  dataKeys: { key: string; color: string; name: string }[];
  title: string;
  yAxisLabel: string;
}

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/70 dark:bg-black/40 backdrop-blur-md p-3 rounded-lg border border-gray-200 dark:border-white/10 shadow-lg">
                <p className="label text-sm text-gray-700 dark:text-gray-300">{`${label}`}</p>
                {payload.map((pld: any) => (
                    <p key={pld.dataKey} className="intro" style={{ color: pld.color }}>
                        {`${pld.name}: ${pld.value?.toFixed(1)}`}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};


export const HistoryChart: React.FC<HistoryChartProps> = ({ data, dataKeys, title, yAxisLabel }) => {
  const formattedData = data.map(item => {
    const flatData: { [key: string]: any } = {
        timestamp: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    dataKeys.forEach(dk => {
        const [sensor, metric] = dk.key.split('.') as [keyof SensorData, string];
        const sensorGroup = item.sensors[sensor];
        if (sensorGroup && metric in sensorGroup) {
            flatData[dk.key] = (sensorGroup as any)[metric];
        } else {
            flatData[dk.key] = null;
        }
    });
    return flatData;
  });

  return (
    <div className="bg-white/50 dark:bg-black/20 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-white/10 h-96">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={formattedData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <defs>
              {dataKeys.map((dk, index) => (
                  <linearGradient key={`colorUv-${index}`} id={`color-${dk.key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={dk.color} stopOpacity={0.6}/>
                      <stop offset="95%" stopColor={dk.color} stopOpacity={0}/>
                  </linearGradient>
              ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
          <XAxis 
            dataKey="timestamp" 
            stroke="rgb(107 114 128)" 
            tick={{fontSize: 12}}
            tickLine={false}
            axisLine={{stroke: "rgba(128, 128, 128, 0.3)"}}
          />
          <YAxis 
            stroke="rgb(107 114 128)" 
            tick={{fontSize: 12}} 
            label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', fill: 'rgb(107 114 128)', fontSize: 14 }} 
            tickLine={false}
            axisLine={{stroke: "rgba(128, 128, 128, 0.3)"}}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '10px' }} />
          {dataKeys.map(dk => (
            <Area key={dk.key} type="monotone" dataKey={dk.key} name={dk.name} stroke={dk.color} strokeWidth={2} fillOpacity={1} fill={`url(#color-${dk.key})`} dot={false} />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};