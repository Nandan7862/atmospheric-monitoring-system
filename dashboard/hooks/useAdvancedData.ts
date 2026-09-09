
import { useState, useEffect } from 'react';
import { ForecastDataPoint, PollutionHotspot, Alert } from '../types';

// --- Helper Functions ---
const generateValue = (base: number, range: number) => base + (Math.random() - 0.5) * range;

// --- Forecast Data Simulation ---
const generateForecastData = (metric: string, base: number, range: number): ForecastDataPoint[] => {
    const now = Date.now();
    const history: ForecastDataPoint[] = Array.from({ length: 24 }, (_, i) => ({
        timestamp: now - (24 - i) * 3600 * 1000,
        value: parseFloat(generateValue(base, range).toFixed(1)),
        type: 'history',
    }));
    
    const lastValue = history[history.length - 1].value;
    const forecast: ForecastDataPoint[] = Array.from({ length: 12 }, (_, i) => ({
        timestamp: now + (i + 1) * 3600 * 1000,
        value: parseFloat(generateValue(lastValue + (i * range/24), range * 0.8).toFixed(1)),
        type: 'forecast',
    }));

    return [...history, ...forecast];
};


// --- Pollution Hotspot Simulation ---
const initialHotspots: PollutionHotspot[] = [
    { id: 'hs-1', name: 'Downtown Core', coordinates: { top: '45%', left: '55%' }, intensity: 0.8 },
    { id: 'hs-2', name: 'Industrial Park', coordinates: { top: '70%', left: '30%' }, intensity: 0.95 },
    { id: 'hs-3', name: 'Highway Intersection', coordinates: { top: '30%', left: '75%' }, intensity: 0.7 },
    { id: 'hs-4', name: 'Residential Area West', coordinates: { top: '50%', left: '15%' }, intensity: 0.4 },
];

const generateHotspots = (): PollutionHotspot[] => {
    return initialHotspots.map(hs => ({
        ...hs,
        intensity: Math.max(0.1, Math.min(1, hs.intensity + (Math.random() - 0.5) * 0.1)),
    }));
};

// --- Static Alerts Data based on Screenshot ---
const staticAlerts: Alert[] = [];


export const useAdvancedData = (updateInterval: number = 7000) => {
    const [forecasts, setForecasts] = useState({
        temperature: generateForecastData('temperature', 22, 5),
        pm25: generateForecastData('pm25', 15, 10),
        aqi: generateForecastData('aqi', 8, 4),
    });
    const [hotspots, setHotspots] = useState<PollutionHotspot[]>(generateHotspots());
    const [alerts] = useState<Alert[]>(staticAlerts);


    useEffect(() => {
        const intervalId = setInterval(() => {
            setForecasts({
                temperature: generateForecastData('temperature', 22, 5),
                pm25: generateForecastData('pm25', 15, 10),
                aqi: generateForecastData('aqi', 8, 4),
            });
            setHotspots(generateHotspots());
        }, updateInterval);

        return () => clearInterval(intervalId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [updateInterval]);

    return { forecasts, hotspots, alerts };
};