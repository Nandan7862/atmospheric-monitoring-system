import React from 'react';
import { useSensorData } from '../hooks/useSensorData';
import { SensorCard } from '../components/SensorCard';
import { MetricDisplay } from '../components/MetricDisplay';
import { HistoryChart } from '../components/HistoryChart';

const SunIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707-.707M6.343 17.657l-.707-.707m12.728 0l-.707.707M6.343 6.343l-.707.707M12 12a5 5 0 100-10 5 5 0 000 10z" /></svg>
);

const getUvIndexInfo = (uvIndex: number | null): {label: string, color: string, gradient: string} => {
    if (uvIndex === null) return {label: 'Unknown', color: 'text-gray-500 dark:text-gray-400', gradient: 'from-gray-600 to-gray-500'};
    if (uvIndex < 3) return {label: 'Low', color: 'text-green-600 dark:text-green-400', gradient: 'from-green-500 to-green-400'};
    if (uvIndex < 6) return {label: 'Moderate', color: 'text-yellow-600 dark:text-yellow-400', gradient: 'from-yellow-500 to-yellow-400'};
    if (uvIndex < 8) return {label: 'High', color: 'text-orange-600 dark:text-orange-400', gradient: 'from-orange-500 to-orange-400'};
    if (uvIndex < 11) return {label: 'Very High', color: 'text-red-600 dark:text-red-400', gradient: 'from-red-500 to-red-400'};
    return {label: 'Extreme', color: 'text-purple-600 dark:text-purple-400', gradient: 'from-purple-500 to-purple-400'};
};

export const UVRadiationPage: React.FC = () => {
  const { latestData, history } = useSensorData(3000);

  if (!latestData) {
    return <div className="text-center text-xl">Initializing Sensor Feed...</div>;
  }
  
  const { veml6075 } = latestData.sensors;
  const uvIndex = veml6075.uv_index;
  const uvInfo = getUvIndexInfo(uvIndex);
  const uvProgress = uvIndex !== null ? Math.min(uvIndex / 11, 1) * 100 : 0;

  return (
    <div className="space-y-8">
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <SensorCard title="UV Index" icon={<SunIcon />} className="lg:col-span-1">
                <div className="flex flex-col items-center justify-center space-y-4 h-full p-4">
                    <div className="relative w-48 h-48">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                            <circle
                                className="text-gray-200 dark:text-gray-700"
                                strokeWidth="8"
                                stroke="currentColor"
                                fill="transparent"
                                r="42"
                                cx="50"
                                cy="50"
                            />
                            <circle
                                className={uvInfo.color}
                                strokeWidth="8"
                                strokeDasharray={2 * Math.PI * 42}
                                strokeDashoffset={2 * Math.PI * 42 * (1 - uvProgress / 100)}
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="transparent"
                                r="42"
                                cx="50"
                                cy="50"
                                style={{transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.5s ease-in-out'}}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className={`text-6xl font-bold ${uvInfo.color}`}>{uvIndex?.toFixed(1) ?? '--'}</span>
                        </div>
                    </div>
                     <span className={`px-4 py-1 text-base font-semibold rounded-full bg-gradient-to-r ${uvInfo.gradient} text-white shadow-md`}>{uvInfo.label}</span>
                </div>
            </SensorCard>

             <SensorCard title="UVA & UVB Readings" icon={<div />} className="lg:col-span-2">
                 <div className="grid grid-cols-2 gap-6 h-full content-center p-4">
                    <MetricDisplay label="UVA" value={veml6075.uva?.toFixed(0) ?? null} unit="mW/cm²" valueClassName="text-purple-600 dark:text-purple-300" />
                    <MetricDisplay label="UVB" value={veml6075.uvb?.toFixed(2) ?? null} unit="mW/cm²" valueClassName="text-fuchsia-600 dark:text-fuchsia-400" />
                 </div>
             </SensorCard>
       </div>


      <HistoryChart 
          title="UVA & UVB History"
          data={history}
          yAxisLabel="mW/cm²"
          dataKeys={[
              {key: 'veml6075.uva', name: 'UVA', color: '#a78bfa'},
              {key: 'veml6075.uvb', name: 'UVB', color: '#c084fc'}
          ]}
      />
    </div>
  );
};