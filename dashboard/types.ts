
export interface BME280Data {
  temperature_c: number | null;
  humidity_rh: number | null;
  pressure_hpa: number | null;
}

export interface PMS5003Data {
  pm25: number | null;
  pm10: number | null;
}

export interface MQ7Data {
  co_ppm: number | null;
}

export interface MQ135Data {
  air_quality_ppm: number | null;
}

export interface VEML6075Data {
  uva: number | null;
  uvb: number | null;
  uv_index: number | null;
}

export interface AnemometerData {
  wind_speed_mps: number | null;
}

export interface SensorData {
  bme280: BME280Data;
  pms5003: PMS5003Data;
  mq7: MQ7Data;
  mq135: MQ135Data;
  veml6075: VEML6075Data;
  anemometer: AnemometerData;
}

export interface TelemetryData {
  deviceId: string;
  timestamp: string;
  sensors: SensorData;
}

// --- New Types for Advanced Modules ---

export interface ForecastDataPoint {
  timestamp: number;
  value: number;
  type: 'history' | 'forecast';
}

export interface PollutionHotspot {
  id: string;
  name: string;
  coordinates: { top: string; left: string };
  intensity: number; // 0 to 1
}

export interface Alert {
    id: string;
    timestamp: string;
    severity: 'Critical' | 'Warning' | 'Info';
    message: string;
    details: string;
}

// --- New Types for System Management Modules ---

export interface Process {
  pid: number;
  name: string;
  cpu: number; // percentage
  memory: number; // MB
  status: 'Running' | 'Sleeping';
}

export interface NetworkDataPoint {
  time: number; // timestamp
  bytesIn: number;
  bytesOut: number;
}

export interface EdgeDevice {
  id: string;
  status: 'Online' | 'Offline';
  ipAddress: string;
  uptime: number; // in seconds
  cpuTemp: number; // in Celsius
  memoryUsage: number; // percentage
  // --- New exhaustive fields ---
  firmwareVersion: string;
  networkTraffic: NetworkDataPoint[];
  processes: Process[];
}

export interface ApiServiceStatus {
  id: string;
  name: string;
  status: 'Operational' | 'Degraded' | 'Outage';
  uptimeHistory: { day: number; up: boolean }[]; // 90 days
}

export interface Report {
  id: string;
  createdAt: string;
  status: 'Pending' | 'Generating' | 'Completed' | 'Failed';
  format: 'CSV' | 'JSON' | 'PDF';
  dateRange: string;
  sensors: string[];
  downloadUrl?: string;
}
