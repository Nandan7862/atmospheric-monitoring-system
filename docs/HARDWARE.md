# Hardware & Software Setup

Setup guide for the Raspberry Pi sensor node that powers `sensor-logger/logger.py` and feeds `backend/app.py`.

## Hardware Required

**Core components**
- Raspberry Pi 4 (8GB recommended)
- Power supply: 5V/3A for the Pi, plus a separate 12–24V DC supply for the industrial wind sensors
- 2× USB-to-RS485 adapters (one for the anemometer, one for the wind vane)

**Sensor suite**

| Component | Model | Purpose | Interface |
|---|---|---|---|
| Anemometer | RS-FSJT-N01 | Wind speed | Modbus RTU (RS485) |
| Wind Vane | RS-FXJT-N01 | Wind direction | Modbus RTU (RS485) |
| Air Quality | PMS5003 | PM2.5 & PM10 | Serial/UART |
| Atmospheric | BME280 | Temperature, humidity, pressure | I2C |
| ADC Modules | ADS1115 (×2) | Analog-to-digital conversion | I2C |
| UV Sensor | GUVA-S12SD | Ultraviolet index | Analog (via ADS1115) |
| Rain Sensor | Generic rain module | Precipitation detection | Analog (via ADS1115) |
| Gas Sensor | MiCS-6814 | CO, NO2, NH3 | Analog (via ADS1115) |

## Operating System

- Raspberry Pi OS, 64-bit (Lite or Desktop), based on Debian Trixie

## System Drivers (via `raspi-config`)

- **I2C interface** — required for the BME280 and both ADS1115 modules
- **Serial interface** — required for the PMS5003 dust sensor
- **i2c-tools** — for verifying wiring with `i2cdetect`

## Python Environment

- Python 3.11+
- A dedicated virtual environment (`weather_env`) to isolate hardware library versions from the system Python

## Installation

```bash
# Update system repositories
sudo apt update && sudo apt install -y i2c-tools python3-venv

# Create and activate the virtual environment
python3 -m venv weather_env
source weather_env/bin/activate

# Install sensor-logger dependencies
pip install -r sensor-logger/requirements.txt

# Verify I2C wiring — you should see the BME280 (0x76) and both
# ADS1115 modules (0x48, 0x49) listed
sudo i2cdetect -y 1
```

## UV Sensor Calibration

The GUVA-S12SD is read through the ADS1115 at a 6.144V full-scale gain. The logger converts raw ADC counts to a UV index using a dark-voltage offset and a counts-per-index scale factor, both defined at the top of `logger.py`:

```python
UV_DARK_COUNTS   = 4430   # ADC reading with the sensor fully covered (dark)
UV_COUNTS_PER_IX = 533    # ADC counts per 1.0 UV index unit
```

To recalibrate for a different sensor unit: cover the sensor completely, read the raw ADC value printed in the console HUD, and set that as `UV_DARK_COUNTS`.

## Data Output

- **Format:** CSV, appended every 3 seconds (`time.sleep(3)` in `logger.py`)
- **Columns (19):** timestamp, temperature, humidity, pressure, PM2.5, PM10, dew point, absolute humidity, cloud base, CPU temp, UV index, raw rain ADC, particle counts (0.3µm/0.5µm), NO2, CO, NH3, wind speed, wind direction
- **Location:** configurable via the `LOG_FILE` environment variable (defaults to `/home/pi/weather_log.csv`)
