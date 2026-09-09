import React from 'react';
import { useSensorData } from '../hooks/useSensorData';
import { SensorCard } from '../components/SensorCard';
import { MetricDisplay } from '../components/MetricDisplay';
import { HistoryChart } from '../components/HistoryChart';

const LeafIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.13 5.423a6.75 6.75 0 0110.154 5.293c.045.438-.11.87-.417 1.177l-4.75 4.75a.75.75 0 01-1.06 0l-4.75-4.75a.75.75 0 010-1.06l4.75-4.75a.75.75 0 01.073-.083zM12 21.75a9.75 9.75 0 01-9.75-9.75c0-3.35 1.69-6.323 4.29-8.127" /></svg>
);

export const AirQualityPage: React.FC = () => {
  const { latestData, history } = useSensorData(3000);

  if (!latestData) {
    return <div className="text-center text-xl">Initializing Sensor Feed...</div>;
  }
  
  const { mq7, mq135 } = latestData.sensors;

  return (
    <div className="space-y-8">
      <SensorCard title="Current Air Quality" icon={<LeafIcon />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MetricDisplay label="Carbon Monoxide" value={mq7.co_ppm?.toFixed(1) ?? null} unit="ppm" valueClassName="text-amber-600 dark:text-amber-400" />
          <MetricDisplay label="General AQI" value={mq135.air_quality_ppm?.toFixed(1) ?? null} unit="ppm" valueClassName="text-lime-600 dark:text-lime-400" />
        </div>
      </SensorCard>
      
      <HistoryChart 
          title="Air Quality History"
          data={history}
          yAxisLabel="ppm"
          dataKeys={[
              {key: 'mq7.co_ppm', name: 'CO (ppm)', color: '#f59e0b'},
              {key: 'mq135.air_quality_ppm', name: 'General AQI (ppm)', color: '#84cc16'}
          ]}
      />
    </div>
  );
};