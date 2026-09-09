import React from 'react';

const MapPinIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-cyan-500 dark:text-cyan-400 drop-shadow-lg">
    <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 005.16-4.242 12.082 12.082 0 00-11.48 0 16.975 16.975 0 005.16 4.242zM12 10a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" clipRule="evenodd" />
  </svg>
);

// Default location as device geolocation is not available in this context.
const SENSOR_LOCATION = {
    lat: 10.0577,
    lng: 76.6293,
    name: "Kothamangalam, Ernakulam"
};

export const Map: React.FC = () => {
  // A static position for the marker on our stylized map.
  const markerPosition = { top: '50%', left: '50%' };

  return (
    <div className="bg-white/50 dark:bg-black/20 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-white/10 h-96 flex flex-col">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-4">Sensor Location</h3>
      <div className="flex-grow rounded-lg overflow-hidden relative bg-[#e2e8f0] dark:bg-[#1a2c42] bg-[radial-gradient(ellipse_at_center,_rgba(148,163,184,0.3)_0%,_transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,_rgba(58,95,142,0.3)_0%,_transparent_70%)]">
        
        {/* Pulsing marker for sensor location */}
        <div className="absolute" style={markerPosition}>
          <div className="relative">
             {/* The pinging circle */}
            <div className="absolute top-0 left-0 w-8 h-8 -translate-x-1/2 -translate-y-1/2">
                <div className="w-full h-full rounded-full bg-cyan-500/50 animate-ping"></div>
            </div>
            {/* The pin icon itself */}
            <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-full">
                <MapPinIcon />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10 text-center">
        <p className="font-semibold text-gray-800 dark:text-white">{SENSOR_LOCATION.name}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">Lat: {SENSOR_LOCATION.lat}, Lng: {SENSOR_LOCATION.lng}</p>
      </div>
    </div>
  );
};