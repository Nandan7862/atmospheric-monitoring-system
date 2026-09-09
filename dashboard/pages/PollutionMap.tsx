
import React from 'react';
import { useAdvancedData } from '../hooks/useAdvancedData';
import { PollutionHotspot } from '../types';

const HotspotMarker: React.FC<{ hotspot: PollutionHotspot }> = ({ hotspot }) => (
    <div className="absolute transition-all duration-1000" style={{ top: hotspot.coordinates.top, left: hotspot.coordinates.left }}>
        <div className="relative group">
            <div 
                className="absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-red-500/50 animate-ping"
                style={{ animationDuration: `${2.5 - hotspot.intensity * 1.5}s`}}
            ></div>
            <div className="absolute -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-red-500 border-2 border-white/80"></div>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-1 bg-gray-900/60 dark:bg-black/50 backdrop-blur-md text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {hotspot.name} - Intensity: {(hotspot.intensity * 100).toFixed(0)}%
            </div>
        </div>
    </div>
);


export const PollutionMapPage: React.FC = () => {
    const { hotspots } = useAdvancedData(3000);

    const heatmapStyle = {
        background: `radial-gradient(circle at 30% 75%, rgba(239, 68, 68, ${hotspots[2]?.intensity * 0.4}), transparent 40%),
                     radial-gradient(circle at 70% 30%, rgba(239, 68, 68, ${hotspots[1]?.intensity * 0.6}), transparent 35%),
                     radial-gradient(circle at 55% 45%, rgba(239, 68, 68, ${hotspots[0]?.intensity * 0.5}), transparent 30%),
                     radial-gradient(circle at 15% 50%, rgba(249, 115, 22, ${hotspots[3]?.intensity * 0.3}), transparent 35%)`
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[75vh]">
            <div className="lg:col-span-3 h-full bg-white/50 dark:bg-black/20 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-gray-200 dark:border-white/10 flex flex-col">
                 <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-4 px-2">Geospatial Hotspot Detection</h3>
                 <div className="flex-grow rounded-lg overflow-hidden relative bg-gray-300 dark:bg-[#1a2c42]">
                    {/* Stylized Map Background */}
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj48cGF0aCBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU5LDAuMDUpIiBkPSJNMTYgMCBMMCAxNiAxNiAzMiAzMiAxNiIvPjwvc3ZnPg==')] opacity-50 dark:opacity-100"></div>
                    <div className="absolute inset-0 dark:bg-transparent bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj48cGF0aCBmaWxsPSJyZ2JhKDAsMCwwLDAuMDMpIiBkPSJNMTYgMCBMMCAxNiAxNiAzMiAzMiAxNiIvPjwvc3ZnPg==')] opacity-100"></div>


                    {/* Heatmap Overlay */}
                    <div className="absolute inset-0 transition-all duration-1000 ease-in-out" style={heatmapStyle}></div>

                    {/* Hotspot Markers */}
                    {hotspots.map(hs => <HotspotMarker key={hs.id} hotspot={hs} />)}
                 </div>
            </div>
            <div className="lg:col-span-1 h-full bg-white/50 dark:bg-black/20 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-white/10 flex flex-col">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-4 border-b border-gray-200 dark:border-white/10 pb-3">Active Hotspots</h3>
                <ul className="space-y-4 overflow-y-auto">
                    {hotspots.sort((a,b) => b.intensity - a.intensity).map(hs => (
                        <li key={hs.id} className="flex items-center">
                           <div className="w-3 h-3 rounded-full mr-3" style={{backgroundColor: `rgba(239, 68, 68, ${hs.intensity})`}}></div>
                           <div>
                                <p className="font-medium text-gray-800 dark:text-gray-200">{hs.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Intensity: {(hs.intensity * 100).toFixed(0)}%</p>
                           </div>
                        </li>
                    ))}
                </ul>
                 <div className="mt-auto pt-4 border-t border-gray-200 dark:border-white/10">
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Legend</h4>
                    <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full bg-gradient-to-r from-green-500 to-red-500"></div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Low to High Intensity</span>
                    </div>
                </div>
            </div>
        </div>
    );
};