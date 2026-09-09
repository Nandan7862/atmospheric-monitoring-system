import React from 'react';
import { useSensorData } from '../hooks/useSensorData';
import { SensorCard } from './SensorCard';
import { MetricDisplay } from './MetricDisplay';
import { HistoryChart } from './HistoryChart';
import { Map } from './Map';

// --- SVG Icons ---
const ThermometerIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.5 3.5c0-1.105.895-2 2-2s2 .895 2 2v9.277a4.5 4.5 0 11-4 0V3.5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M9.5 12.5v-2" /></svg>
);
const CloudIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21.25a8.25 8.25 0 01-6.23-13.434 5.25 5.25 0 0110.435 2.126 5.25 5.25 0 013.795 4.068A8.25 8.25 0 0112 21.25z" /></svg>
);
const LeafIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.13 5.423a6.75 6.75 0 0110.154 5.293c.045.438-.11.87-.417 1.177l-4.75 4.75a.75.75 0 01-1.06 0l-4.75-4.75a.75.75 0 010-1.06l4.75-4.75a.75.75 0 01.073-.083zM12 21.75a9.75 9.75 0 01-9.75-9.75c0-3.35 1.69-6.323 4.29-8.127" /></svg>
);
const SunIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707-.707M6.343 17.657l-.707-.707m12.728 0l-.707.707M6.343 6.343l-.707.707M12 12a5 5 0 100-10 5 5 0 000 10z" /></svg>
);
const WindIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.75h16.5m-16.5 4.5h16.5M3.75 6h16.5M3.75 18h16.5" /></svg>
);
// --- End SVG Icons ---

const getUvIndexGradient = (uvIndex: number | null) => {
    if (uvIndex === null) return 'from-gray-600 to-gray-500';
    if (uvIndex < 3) return 'from-green-500 to-green-400';
    if (uvIndex < 6) return 'from-yellow-500 to-yellow-400';
    if (uvIndex < 8) return 'from-orange-500 to-orange-400';
    if (uvIndex < 11) return 'from-red-500 to-red-400';
    return 'from-purple-500 to-purple-400';
};

export const Dashboard: React.FC = () => {
  const { latestData, history } = useSensorData(3000);

  if (!latestData) {
    return <div className="text-center text-xl">Initializing Sensor Feed...</div>;
  }

  const { bme280, pms5003, mq7, mq135, veml6075, anemometer } = latestData.sensors;
  const uvIndex = veml6075.uv_index;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-6 px-1 tracking-tight">Current Conditions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            <SensorCard title="Environment" icon={<ThermometerIcon />}>
                <div className="space-y-4">
                    <MetricDisplay label="Temperature" value={bme280.temperature_c?.toFixed(1) ?? null} unit="°C" />
                    <MetricDisplay label="Humidity" value={bme280.humidity_rh?.toFixed(1) ?? null} unit="%" />
                    <MetricDisplay label="Pressure" value={bme280.pressure_hpa?.toFixed(0) ?? null} unit="hPa" />
                </div>
            </SensorCard>
             <SensorCard title="Particulates" icon={<CloudIcon />}>
                <div className="space-y-4">
                    <MetricDisplay label="PM2.5" value={pms5003.pm25?.toFixed(1) ?? null} unit="µg/m³" />
                    <MetricDisplay label="PM10" value={pms5003.pm10?.toFixed(1) ?? null} unit="µg/m³" />
                </div>
            </SensorCard>
             <SensorCard title="Air Quality" icon={<LeafIcon />}>
                <div className="space-y-4">
                    <MetricDisplay label="CO" value={mq7.co_ppm?.toFixed(1) ?? null} unit="ppm" />
                    <MetricDisplay label="General AQI" value={mq135.air_quality_ppm?.toFixed(1) ?? null} unit="ppm" />
                </div>
            </SensorCard>
            <SensorCard title="UV Radiation" icon={<SunIcon />}>
                <div className="space-y-3">
                     <MetricDisplay label="UV Index" value={uvIndex?.toFixed(1) ?? null} unit="" />
                    <div className="w-full bg-gray-200 dark:bg-gray-700/50 rounded-full h-2.5 mt-1">
                        <div 
                            className={`bg-gradient-to-r ${getUvIndexGradient(uvIndex)} h-2.5 rounded-full transition-all duration-500`} 
                            style={{ width: `${uvIndex !== null ? Math.min(uvIndex / 11, 1) * 100 : 0}%` }}
                        ></div>
                    </div>
                     <MetricDisplay label="UVA" value={veml6075.uva?.toFixed(0) ?? null} unit="" />
                     <MetricDisplay label="UVB" value={veml6075.uvb?.toFixed(1) ?? null} unit="" />
                </div>
            </SensorCard>
            <SensorCard title="Wind" icon={<WindIcon />}>
                 <div className="space-y-4">
                    <MetricDisplay label="Wind Speed" value={anemometer.wind_speed_mps?.toFixed(1) ?? null} unit="m/s" />
                 </div>
            </SensorCard>
        </div>
      </div>
       <div>
        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-6 px-1 tracking-tight">Location &amp; Historical Data</h2>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
                <Map />
            </div>
            <div className="lg:col-span-3">
                <HistoryChart 
                    title="Temperature & Humidity"
                    data={history}
                    yAxisLabel="Value"
                    dataKeys={[
                        {key: 'bme280.temperature_c', name: 'Temperature (°C)', color: '#2dd4bf'},
                        {key: 'bme280.humidity_rh', name: 'Humidity (%)', color: '#38bdf8'}
                    ]}
                />
            </div>
        </div>
        <div className="mt-8">
            <HistoryChart 
                title="Particulate Matter"
                data={history}
                yAxisLabel="µg/m³"
                dataKeys={[
                    {key: 'pms5003.pm25', name: 'PM2.5', color: '#f87171'},
                    {key: 'pms5003.pm10', name: 'PM10', color: '#fb923c'}
                ]}
            />
        </div>
      </div>
    </div>
  );
};