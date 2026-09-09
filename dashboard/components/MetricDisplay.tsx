import React from 'react';

interface MetricDisplayProps {
  label: string;
  value: string | number | null;
  unit: string;
  className?: string;
  valueClassName?: string;
}

export const MetricDisplay: React.FC<MetricDisplayProps> = ({ label, value, unit, className = '', valueClassName = '' }) => {
  return (
    <div className={`flex flex-col ${className}`}>
      <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</span>
      <div className="flex items-baseline">
          <span className={`text-3xl font-bold text-gray-800 dark:text-white ${valueClassName}`}>
            {value !== null && value !== undefined ? value : '--'}
          </span>
          <span className="text-base ml-1 text-gray-600 dark:text-gray-300 font-medium">{unit}</span>
      </div>
    </div>
  );
};