import os
import sys
import csv
import math
import time
import serial
import smbus2
import bme280
import minimalmodbus
from datetime import datetime

# --- CONFIGURATION ---
LOG_FILE = "/home/pi/weather_log.csv"
USB_ANEMO = '/dev/ttyUSB0'   # RS-FSJT-N01 Anemometer
USB_VANE  = '/dev/ttyUSB1'   # RS-FXJT-N01 Wind Vane
I2C_ADDR_BME  = 0x76
I2C_ADDR_ADS1 = 0x48
I2C_ADDR_ADS2 = 0x49

# 📘 UV FIX: ADS1115 is configured at gain=6.144V full scale (PGA=000 from 0x83 config byte)
# GUVA-S12SD dark voltage ~0.83V → 0.83/6.144 * 32767 ≈ 4430 ADC counts
# Sensitivity: 0.1V per UV index → 0.1/6.144 * 32767 ≈ 533 counts per UV index unit
# To calibrate: cover the sensor in full dark, note the ADC raw value, set as UV_DARK_COUNTS
UV_DARK_COUNTS   = 4430   # dark-voltage offset in raw ADC counts
UV_COUNTS_PER_IX = 533    # ADC counts per 1.0 UV index unit

RAIN_THRESHOLD = 12000
SEA_LEVEL_P    = 1013.25

# RS-FXJT-N01 direction gear code → compass label
DIR_MAP = {
    0: "North",      1: "North-East",
    2: "East",       3: "South-East",
    4: "South",      5: "South-West",
    6: "West",       7: "North-West"
}

# ─────────────────────────────────────────────
# SYSTEM HELPERS
# ─────────────────────────────────────────────
def get_cpu_temp():
    try:
        with open("/sys/class/thermal/thermal_zone0/temp", "r") as f:
            return round(int(f.read()) / 1000.0, 1)
    except:
        return 0.0

def get_dew_point(t, h):
    try:
        a, b  = 17.27, 237.7
        alpha = ((a * t) / (b + t)) + math.log(h / 100.0)
        return round((b * alpha) / (a - alpha), 1)
    except:
        return 0.0

def calibrate_gas(raw, gtype):
    if raw < 50: return 0.0
    if gtype == "NO2": return round((raw / 15000) * 0.5, 3)
    if gtype == "CO":  return round((raw / 500)   * 1.1, 2)
    if gtype == "NH3": return round((raw / 720)   * 1.0, 2)
    return raw

# ─────────────────────────────────────────────
# HARDWARE INITIALIZATION
# ─────────────────────────────────────────────
bus   = smbus2.SMBus(1)
calib = bme280.load_calibration_params(bus, I2C_ADDR_BME)

# ── RS-FSJT-N01 Anemometer ───────────────────
anemo = None
try:
    anemo = minimalmodbus.Instrument(USB_ANEMO, 1)
    anemo.serial.baudrate            = 4800
    anemo.serial.timeout             = 1.0
    anemo.serial.inter_byte_timeout  = 0.1
    anemo.mode = minimalmodbus.MODE_RTU
    print(f"✅ Anemometer RS-FSJT-N01 on {USB_ANEMO}  addr=1  baud=4800")
except Exception as e:
    print(f"⚠️  Anemometer OFFLINE: {e}")

# ── RS-FXJT-N01 Wind Vane ────────────────────
vane = None
try:
    vane = minimalmodbus.Instrument(USB_VANE, 1)
    vane.serial.baudrate             = 4800
    vane.serial.timeout              = 1.0
    vane.serial.inter_byte_timeout   = 0.1
    vane.mode = minimalmodbus.MODE_RTU
    print(f"✅ Wind Vane  RS-FXJT-N01 on {USB_VANE}   addr=1  baud=4800")
except Exception as e:
    print(f"⚠️  Wind Vane OFFLINE: {e}")

# ── PMS5003 Dust Sensor ───────────────────────
try:
    pms = serial.Serial('/dev/serial0', 9600, timeout=1)
    print("✅ PMS5003 connected")
except Exception as e:
    pms = None
    print(f"⚠️  PMS5003 OFFLINE: {e}")

# ─────────────────────────────────────────────
# SENSOR READING HELPERS
# ─────────────────────────────────────────────
def read_adc(addr, chan):
    try:
        bus.write_i2c_block_data(addr, 0x01, [(0xC1 + (chan * 0x10)), 0x83])
        time.sleep(0.02)
        v = bus.read_i2c_block_data(addr, 0x00, 2)
        return (v[0] << 8) + v[1]
    except:
        return 0

def get_dust_robust():
    if not pms:
        return [0, 0, 0, 0]
    try:
        pms.reset_input_buffer()
        for _ in range(64):
            if pms.read() == b'\x42' and pms.read() == b'\x4d':
                d = pms.read(30)
                return [(d[10] << 8) | d[11],
                        (d[12] << 8) | d[13],
                        (d[16] << 8) | d[17],
                        (d[18] << 8) | d[19]]
    except:
        pass
    return [0, 0, 0, 0]

def read_wind_speed():
    if anemo is None:
        return 0.0, "NO_HW"
    try:
        anemo.serial.reset_input_buffer()
        raw   = anemo.read_register(0x0000, 0, functioncode=3)
        speed = round(raw / 10.0, 1)
        return speed, "LIVE"
    except Exception as e:
        return 0.0, f"ERR:{e}"

def read_wind_dir():
    if vane is None:
        return "ERR", -1, "NO_HW"
    try:
        vane.serial.reset_input_buffer()
        raw   = int(vane.read_register(0x0000, 0, functioncode=3))
        label = DIR_MAP.get(raw, f"UNK({raw})")
        return label, raw, "LIVE"
    except Exception as e:
        return "ERR", -1, f"ERR:{e}"

# ─────────────────────────────────────────────
# MAIN LOOP
# ─────────────────────────────────────────────
wind_speed_errors = 0
wind_dir_errors   = 0

while True:
    now   = datetime.now()
    cpu_t = get_cpu_temp()

    # ── 1. BME280 ─────────────────────────────
    try:
        b = bme280.sample(bus, I2C_ADDR_BME, calib)
        t, h, p = b.temperature, b.humidity, b.pressure
    except:
        t = h = p = 0.0

    # ── 2. Dust ───────────────────────────────
    pm = get_dust_robust()

    # ── 3. Gas / UV / Rain ────────────────────
    # ADS1 channel map: 0=rain, 1=CO, 2=UV, 3=NH3
    r_raw, co_raw, uv_raw, nh_raw = [read_adc(I2C_ADDR_ADS1, i) for i in range(4)]
    no2_raw = read_adc(I2C_ADDR_ADS2, 0)

    # ── 4. Wind ───────────────────────────────
    w_speed, spd_src         = read_wind_speed()
    w_dir, w_code, dir_src   = read_wind_dir()

    wind_speed_errors = wind_speed_errors + 1 if "ERR" in spd_src else 0
    wind_dir_errors   = wind_dir_errors   + 1 if "ERR" in dir_src else 0

    # ── 5. Derived values ─────────────────────
    dp     = get_dew_point(t, h)
    feels  = round(t + 0.55 * (6.11 * math.exp(5417 * (1/273 - 1/(273+t))) * (h/100) - 10), 1)
    alt    = round(44330 * (1 - (p / SEA_LEVEL_P) ** (1 / 5.255)), 1)
    abs_h  = round((6.112 * math.exp((17.67 * t) / (t + 243.5)) * h * 2.1674) / (273.15 + t), 1)
    cloud  = int((t - dp) * 125)

    # 📘 UV FIX: Correct formula using proper ADS1115 gain=6.144V scaling
    # Raw ADC range: 0–32767 at 6.144V full scale
    # Subtract dark-voltage offset first, then divide by counts-per-index
    uv_idx = round(max(0.0, (uv_raw - UV_DARK_COUNTS) / UV_COUNTS_PER_IX), 1)

    # ── 6. HUD ────────────────────────────────
    spd_tag   = "●" if spd_src == "LIVE" else "✗"
    dir_tag   = "●" if dir_src == "LIVE" else "✗"
    wind_warn = ""
    if wind_speed_errors > 3: wind_warn += " ⚠ SPEED FAIL"
    if wind_dir_errors   > 3: wind_warn += " ⚠ VANE FAIL"

    row1     = f"TEMP: {t:.1f}C | FEELS: {feels:.1f}C | HUM: {h:.1f}%"
    row2     = f"PRES: {p:.1f}hPa | ALT: {alt:.1f}m | DEW: {dp:.1f}C"
    row3     = f"CLOUD BASE: {cloud}m | ABS HUM: {abs_h}g/m3"
    row4     = f"PM2.5: {pm[0]} | PM10: {pm[1]} | RAIN: {'YES' if r_raw < RAIN_THRESHOLD else 'NO'}"
    row5     = f"PC 0.3u: {pm[2]} | PC 0.5u: {pm[3]}"
    row6     = f"NO2: {calibrate_gas(no2_raw,'NO2'):.3f} | CO: {calibrate_gas(co_raw,'CO'):.2f} | NH3: {calibrate_gas(nh_raw,'NH3'):.2f}"
    row_wind = f"WIND: {spd_tag}{w_speed} m/s | DIR: {dir_tag}{w_dir} (code={w_code}){wind_warn}"
    row_uv   = f"UV IDX: {uv_idx} | UV RAW ADC: {uv_raw} | DARK OFFSET: {UV_DARK_COUNTS}"

    if sys.stdout.isatty():
        os.system('clear')

    print("╔" + "═" * 66 + "╗")
    print(f"║ {('WEATHER STATION | ' + now.strftime('%H:%M:%S')).center(64)} ║")
    print("╠" + "═" * 66 + "╣")
    print(f"║{row1.center(66)}║")
    print(f"║{row2.center(66)}║")
    print(f"║{row3.center(66)}║")
    print("╠" + "═" * 66 + "╣")
    print(f"║{row4.center(66)}║")
    print(f"║{row5.center(66)}║")
    print("╠" + "═" * 66 + "╣")
    print(f"║{row_wind.center(66)}║")
    print("╠" + "═" * 66 + "╣")
    print(f"║{row6.center(66)}║")
    print("╠" + "═" * 66 + "╣")
    print(f"║{(f'CPU: {cpu_t}C | UV IDX: {uv_idx} | UV RAW: {uv_raw} | RAIN RAW: {r_raw}').center(66)}║")
    print(f"║{row_uv.center(66)}║")
    print(f"║{('!! CRITICAL HEAT !!' if cpu_t > 75 else 'SYSTEM STABLE').center(66)}║")
    print("╚" + "═" * 66 + "╝")

    # ── 7. CSV Log (19 columns) ───────────────
    # Column 11 (index 10) = uv_idx — already the final UV index value
    # app.py reads this directly, no re-conversion needed
    try:
        with open(LOG_FILE, 'a', newline='') as f:
            csv.writer(f).writerow([
                now.strftime('%Y-%m-%d %H:%M:%S'),
                round(t, 2), round(h, 2), round(p, 2),
                pm[0], pm[1],
                dp, abs_h, cloud, cpu_t, uv_idx, r_raw,
                pm[2], pm[3],
                calibrate_gas(no2_raw, 'NO2'),
                calibrate_gas(co_raw,  'CO'),
                calibrate_gas(nh_raw,  'NH3'),
                w_speed,
                w_dir
            ])
            f.flush()
    except Exception as e:
        print(f"⚠️  LOG WRITE FAILED: {e}")

    time.sleep(3)
