import React from 'react';

interface SensorCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const SensorCard: React.FC<SensorCardProps> = ({ title, icon, children, className = '' }) => {
  return (
    <div className={`relative bg-white/50 dark:bg-black/20 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-white/10 group hover:border-blue-500/50 dark:hover:border-cyan-400/50 transition-all duration-300 ${className}`}>
      <div className="absolute -top-px -left-px -right-px h-1/2 bg-gradient-to-b from-blue-500/10 dark:from-cyan-400/20 to-transparent rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="flex items-center mb-4">
        <div className="text-blue-600 dark:text-cyan-400 mr-4">{icon}</div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200">{title}</h3>
      </div>
      <div>{children}</div>
    </div>
  );
};