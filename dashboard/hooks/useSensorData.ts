
import { useState, useEffect } from 'react';
import { TelemetryData, SensorData } from '../types';

const MAX_HISTORY_LENGTH = 50;

// Helper to generate a random value within a range, with some noise
const generateValue = (base: number, range: number, noise: number) => {
    return parseFloat((base + (Math.random() - 0.5) * range + (Math.random() - 0.5) * noise).toFixed(1));
};

// Generates a new, realistic-looking data point
const generateTelemetryData = (): TelemetryData => {
    const now = new Date();
    return {
        deviceId: "RPi-Node-01",
        timestamp: now.toISOString(),
        sensors: {
            bme280: {
                temperature_c: generateValue(22, 2, 0.5),
                humidity_rh: generateValue(45, 5, 1),
                pressure_hpa: generateValue(1012, 2, 0.2),
            },
            pms5003: {
                pm25: Math.max(0, generateValue(15, 10, 3)),
                pm10: Math.max(0, generateValue(28, 15, 5)),
            },
            mq7: {
                co_ppm: Math.max(0, generateValue(5, 3, 0.5)),
            },
            mq135: {
                air_quality_ppm: Math.max(0, generateValue(8, 4, 1)),
            },
            veml6075: {
                uva: Math.max(0, generateValue(150, 50, 10)),
                uvb: Math.max(0, generateValue(2.5, 1, 0.2)),
                uv_index: Math.max(0, generateValue(3, 2, 0.5)),
            },
            anemometer: {
                wind_speed_mps: Math.max(0, generateValue(2.5, 2, 0.3)),
            }
        }
    };
};

export const useSensorData = (updateInterval: number = 5000) => {
    const [history, setHistory] = useState<TelemetryData[]>([]);
    const [latestData, setLatestData] = useState<TelemetryData | null>(null);

    useEffect(() => {
        const initialDataPoints = Array.from({ length: MAX_HISTORY_LENGTH }, (_, i) => {
            const data = generateTelemetryData();
            data.timestamp = new Date(Date.now() - (MAX_HISTORY_LENGTH - i) * updateInterval).toISOString();
            return data;
        });

        setLatestData(initialDataPoints[initialDataPoints.length - 1]);
        setHistory(initialDataPoints);

        const intervalId = setInterval(() => {
            const newData = generateTelemetryData();
            setLatestData(newData);
            setHistory(prevHistory => {
                const newHistory = [...prevHistory, newData];
                if (newHistory.length > MAX_HISTORY_LENGTH) {
                    return newHistory.slice(newHistory.length - MAX_HISTORY_LENGTH);
                }
                return newHistory;
            });
        }, updateInterval);

        return () => clearInterval(intervalId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [updateInterval]);

    return { latestData, history };
};
