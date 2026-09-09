import React from 'react';
import { useSensorData } from '../hooks/useSensorData';
import { SensorCard } from '../components/SensorCard';
import { MetricDisplay } from '../components/MetricDisplay';
import { HistoryChart } from '../components/HistoryChart';

const ThermometerIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.5 3.5c0-1.105.895-2 2-2s2 .895 2 2v9.277a4.5 4.5 0 11-4 0V3.5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M9.5 12.5v-2" /></svg>
);

export const EnvironmentPage: React.FC = () => {
  const { latestData, history } = useSensorData(3000);

  if (!latestData) {
    return <div className="text-center text-xl">Initializing Sensor Feed...</div>;
  }
  
  const { bme280 } = latestData.sensors;

  return (
    <div className="space-y-8">
       <SensorCard title="Current Environment Readings" icon={<ThermometerIcon />}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricDisplay label="Temperature" value={bme280.temperature_c?.toFixed(1) ?? null} unit="°C" valueClassName="text-cyan-600 dark:text-cyan-400" />
          <MetricDisplay label="Humidity" value={bme280.humidity_rh?.toFixed(1) ?? null} unit="%" valueClassName="text-blue-600 dark:text-blue-400" />
          <MetricDisplay label="Pressure" value={bme280.pressure_hpa?.toFixed(1) ?? null} unit="hPa" valueClassName="text-indigo-600 dark:text-indigo-400" />
        </div>
      </SensorCard>

      <HistoryChart
        title="Temperature & Humidity Over Time"
        data={history}
        yAxisLabel="Value"
        dataKeys={[
          { key: 'bme280.temperature_c', name: 'Temperature (°C)', color: '#2dd4bf' },
          { key: 'bme280.humidity_rh', name: 'Humidity (%)', color: '#38bdf8' }
        ]}
      />

      <HistoryChart
        title="Atmospheric Pressure Over Time"
        data={history}
        yAxisLabel="hPa"
        dataKeys={[
          { key: 'bme280.pressure_hpa', name: 'Pressure (hPa)', color: '#818cf8' }
        ]}
      />
    </div>
  );
};