import React from 'react';
import { useSensorData } from '../hooks/useSensorData';
import { SensorCard } from '../components/SensorCard';
import { MetricDisplay } from '../components/MetricDisplay';
import { HistoryChart } from '../components/HistoryChart';

const CloudIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21.25a8.25 8.25 0 01-6.23-13.434 5.25 5.25 0 0110.435 2.126 5.25 5.25 0 013.795 4.068A8.25 8.25 0 0112 21.25z" /></svg>
);

export const ParticulatesPage: React.FC = () => {
  const { latestData, history } = useSensorData(3000);

  if (!latestData) {
    return <div className="text-center text-xl">Initializing Sensor Feed...</div>;
  }
  
  const { pms5003 } = latestData.sensors;

  return (
    <div className="space-y-8">
      <SensorCard title="Current Particulate Matter" icon={<CloudIcon />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MetricDisplay label="PM2.5" value={pms5003.pm25?.toFixed(1) ?? null} unit="µg/m³" valueClassName="text-red-600 dark:text-red-400" />
          <MetricDisplay label="PM10" value={pms5003.pm10?.toFixed(1) ?? null} unit="µg/m³" valueClassName="text-orange-600 dark:text-orange-400" />
        </div>
      </SensorCard>

      <HistoryChart 
          title="Particulate Matter History"
          data={history}
          yAxisLabel="µg/m³"
          dataKeys={[
              {key: 'pms5003.pm25', name: 'PM2.5', color: '#f87171'},
              {key: 'pms5003.pm10', name: 'PM10', color: '#fb923c'}
          ]}
      />
    </div>
  );
};