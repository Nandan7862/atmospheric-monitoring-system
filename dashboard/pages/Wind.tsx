import React from 'react';
import { useSensorData } from '../hooks/useSensorData';
import { SensorCard } from '../components/SensorCard';
import { MetricDisplay } from '../components/MetricDisplay';
import { HistoryChart } from '../components/HistoryChart';

const WindIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.75h16.5m-16.5 4.5h16.5M3.75 6h16.5M3.75 18h16.5" /></svg>
);

export const WindPage: React.FC = () => {
  const { latestData, history } = useSensorData(3000);

  if (!latestData) {
    return <div className="text-center text-xl">Initializing Sensor Feed...</div>;
  }
  
  const { anemometer } = latestData.sensors;

  return (
    <div className="space-y-8">
      <SensorCard title="Current Wind Speed" icon={<WindIcon />}>
        <div className="flex justify-center items-center p-8">
          <MetricDisplay label="Wind Speed" value={anemometer.wind_speed_mps?.toFixed(1) ?? null} unit="m/s" className="items-center" valueClassName="text-7xl text-cyan-600 dark:text-cyan-300" />
        </div>
      </SensorCard>

      <HistoryChart 
          title="Wind Speed History"
          data={history}
          yAxisLabel="m/s"
          dataKeys={[
              {key: 'anemometer.wind_speed_mps', name: 'Wind Speed (m/s)', color: '#67e8f9'}
          ]}
      />
    </div>
  );
};