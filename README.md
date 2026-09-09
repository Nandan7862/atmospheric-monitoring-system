# Integrated Atmospheric Monitoring & Forecasting System

A real-time environmental monitoring station built on a Raspberry Pi, combining 6 sensor types (19 logged signals) with a Flask web dashboard, short-term temperature forecasting, storm detection, and pollution-hotspot tracking. Final-year engineering project (4-member team).

🎥 **[Demo video](#)** · 🛠 **[Setup walkthrough video](#)**
*(links to be added)*

---

## What it does

- **Reads 6 physical sensors every 3 seconds** on a Raspberry Pi: temperature/humidity/pressure (BME280), particulate matter (PMS5003), gas levels (MiCS-6814 for CO/NO2/NH3), UV index (GUVA-S12SD), rainfall, wind speed (RS-FSJT-N01), and wind direction (RS-FXJT-N01) — logged to CSV with automatic daily backups.
- **Serves a live web dashboard** (Flask + Plotly) with current readings, historical trends, an AQI breakdown, a heat-index/health page, and a 360° pollution map by wind direction.
- **Forecasts temperature 2 hours ahead** using a Linear Regression model trained on a rolling window of recent readings — achieved **0.48°C MAE / 0.55°C RMSE** in testing, benchmarked against a BLSTM baseline.
- **Detects incoming storms** with rule-based logic on pressure drop + humidity trend, and estimates **pollution plume arrival time and direction** from wind speed and PM2.5 deltas.
- **Sends Telegram alerts** for extreme readings (CPU overheat, gas thresholds, storm warnings).

## Repository structure

```
.
├── sensor-logger/     # Runs on the Raspberry Pi — reads all sensors, writes the CSV log
├── backend/           # Flask web app — dashboard, forecasting, alerts, pollution map
├── dashboard/         # Standalone React/TypeScript UI concept (see note below)
├── docs/
│   └── HARDWARE.md    # Wiring, sensor models, OS setup, UV calibration
└── README.md
```

> **Note on `dashboard/`:** This is a separate React + TypeScript + Recharts frontend, scaffolded via Google AI Studio, exploring an alternative UI for the same data (per-metric pages for air quality, wind, UV, device management, etc.). It is **not wired up to the Flask backend** — the deployed/demoed version of this project is the server-rendered dashboard in `backend/app.py`. The React app is kept here as a prototype/reference for a possible future frontend rewrite.

---

## Quick start

### 1. Sensor logger (on the Raspberry Pi)

See [`docs/HARDWARE.md`](docs/HARDWARE.md) for wiring and OS-level setup, then:

```bash
cd sensor-logger
python3 -m venv weather_env
source weather_env/bin/activate
pip install -r requirements.txt
python logger.py
```

This continuously appends readings to the CSV file at `LOG_FILE` (default `/home/pi/weather_log.csv`).

### 2. Backend dashboard

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in your Telegram bot token if you want alerts
python app.py
```

Visit `http://<pi-ip>:5000` (or `http://localhost:5000` if running locally against a copy of the CSV log).

**Routes:**
| Route | Purpose |
|---|---|
| `/` | Live readings, daily summary, current conditions |
| `/prediction` | 2-hour temperature forecast |
| `/health` | Heat index and health/safety guidance |
| `/alerts` | Active threshold alerts, Telegram bot status |
| `/map` | 360° pollution distribution by wind direction |
| `/backup` | Manually trigger a CSV backup |

### 3. React dashboard prototype (optional)

```bash
cd dashboard
npm install
npm run dev
```

Currently runs on mock/sample data — see the note above.

---

## Configuration

Secrets and machine-specific paths are loaded from environment variables, not hardcoded. See `backend/.env.example`:

| Variable | Purpose |
|---|---|
| `TELEGRAM_BOT_TOKEN` | Bot token for station alerts (create via [@BotFather](https://t.me/BotFather)) |
| `TELEGRAM_CHAT_ID` | Your Telegram chat ID to receive alerts |
| `LOG_FILE` | Path to the shared CSV log (must match between `sensor-logger` and `backend`) |

If these aren't set, the app still runs — Telegram alerts are simply disabled.

---

## Tech stack

**Sensor logger:** Python, minimalmodbus (RS485/Modbus), pyserial, smbus2, RPi.bme280
**Backend:** Flask, Pandas, NumPy, scikit-learn (Linear Regression), Plotly
**Dashboard prototype:** React 19, TypeScript, Vite, Recharts

---

## Team

Built as a 4-member final-year project. This repository is maintained by [Nandan S Ayyappan](https://github.com/Nandan7862), who was the primary contributor across the sensing, data-ingestion, and forecasting modules.
