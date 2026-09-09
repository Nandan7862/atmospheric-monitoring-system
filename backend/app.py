from flask import Flask, render_template_string, request, url_for
import pandas as pd
import math
import os
import shutil
import numpy as np
import requests
import minimalmodbus
from datetime import datetime, timedelta
import plotly.express as px
import plotly.io as pio
from plotly.subplots import make_subplots
import plotly.graph_objects as go
from threading import Timer
from sklearn.linear_model import LinearRegression
from dotenv import load_dotenv

# --- LOAD ENVIRONMENT VARIABLES (.env, see .env.example) ---
load_dotenv()

# --- INITIALIZE FLASK APP ---
app = Flask(__name__)

# --- CONFIGURATION & HARDCODED PARAMETERS ---
RAIN_THRESHOLD = 7500
LOG_FILE = os.environ.get("LOG_FILE", "/home/pi/weather_log.csv")
BACKUP_DIR = os.environ.get("BACKUP_DIR", "/home/pi/weather_backups/")
COLUMNS = ["time", "temp", "humidity", "pressure", "pm25", "pm10", "dew", "abs_h", "cloud", "cpu", "uv", "rain_raw", "pc03", "pc05", "no2", "co", "nh3", "wind_speed", "wind_dir"]

DIRECTION_MAP = {0: "North", 1: "North-East", 2: "East", 3: "South-East", 4: "South", 5: "South-West", 6: "West", 7: "North-West"}

try:
    anemo = minimalmodbus.Instrument('/dev/ttyUSB0', 1)
    anemo.serial.baudrate = 4800
    vane = minimalmodbus.Instrument('/dev/ttyUSB1', 1)
    vane.serial.baudrate = 4800
except: anemo, vane = None, None

# --- NOTIFICATION SETTINGS ---
# Loaded from environment — never hardcode credentials in source.
# Set these in a local .env file (see .env.example) or your shell environment.
BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID", "")

# --- SAFETY & HEALTH LIMITS ---
NO2_LIMIT, CO_LIMIT, NH3_LIMIT = 0.1, 2.0, 10.0
CPU_HEAT_LIMIT = 75.0

if not os.path.exists(BACKUP_DIR):
    os.makedirs(BACKUP_DIR)

# --- TELEGRAM NOTIFICATION ENGINE ---
def send_telegram(message):
    if not BOT_TOKEN or not CHAT_ID:
        return  # Alerts disabled — no credentials configured
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
    payload = {"chat_id": CHAT_ID, "text": message, "parse_mode": "HTML"}
    try:
        requests.post(url, json=payload, timeout=5)
    except: pass

# --- AUTOMATED DATA BACKUP SYSTEM ---
def auto_backup():
    try:
        if os.path.exists(LOG_FILE):
            timestamp = datetime.now().strftime("%Y%m%d")
            shutil.copy2(LOG_FILE, os.path.join(BACKUP_DIR, f"auto_daily_{timestamp}.csv"))
    except: pass
    Timer(86400, auto_backup).start()
auto_backup()

# --- ENVIRONMENTAL CALCULATIONS ---
def calculate_aqi(pm25):
    try:
        val = float(pm25)
        if val <= 12: return round((50/12) * val)
        elif val <= 35.4: return round(((100-51)/(35.4-12.1)) * (val-12.1) + 51)
        elif val <= 55.4: return round(((150-101)/(55.4-35.5)) * (val-35.5) + 101)
        else: return round(200)
    except: return 0

def get_aqi_category(aqi):
    if aqi <= 50: return "Good", "#00ffcc", "Air quality is satisfactory."
    if aqi <= 100: return "Moderate", "#ffff00", "Air quality is acceptable."
    if aqi <= 150: return "Unhealthy (Sens.)", "#ff9900", "Mask recommended for sensitive groups."
    return "Unhealthy", "#ff4444", "Everyone should wear a mask outdoors."

# --- MACHINE LEARNING PREDICTION ---
def predict_temp_2h(df):
    try:
        recent = df.tail(1440).copy()
        recent['temp_smooth'] = recent['temp'].rolling(20, min_periods=1).mean()
        y = recent['temp_smooth'].values
        if len(y) < 10:
            return "---"
        X = np.arange(len(y)).reshape(-1, 1)
        model = LinearRegression().fit(X, y)
        prediction = model.predict([[len(y) + 2400]])
        result = round(prediction[0], 1)
        current_t = float(df['temp'].iloc[-1])
        if abs(result - current_t) > 10:
            return round(current_t + np.sign(result - current_t) * 2.0, 1)
        return result
    except:
        return "---"

# --- HEAT INDEX ---
def calculate_heat_index(t, h):
    try:
        T = t * 9/5 + 32
        HI = (-42.379 + 2.04901523*T + 10.14333127*h
              - 0.22475541*T*h - 0.00683783*T*T
              - 0.05481717*h*h + 0.00122874*T*T*h
              + 0.00085282*T*h*h - 0.00000199*T*T*h*h)
        hi_c = round((HI - 32) * 5/9, 1)
        if hi_c < 27:   cat, col = "Comfortable", "#00ffcc"
        elif hi_c < 32: cat, col = "Caution",     "#ffff00"
        elif hi_c < 41: cat, col = "Extreme Caution", "#ff9900"
        elif hi_c < 54: cat, col = "Danger",      "#ff4444"
        else:           cat, col = "Extreme Danger", "#ff0000"
        return hi_c, cat, col
    except:
        return t, "Unknown", "#64748b"

# --- DAILY SUMMARY ---
def get_daily_summary(df):
    try:
        today = df[df['time'].dt.date == datetime.now().date()]
        if len(today) < 2:
            today = df.tail(200)
        return {
            "t_max": round(today['temp'].max(), 1),
            "t_min": round(today['temp'].min(), 1),
            "p_max": round(today['pressure'].max(), 1),
            "p_min": round(today['pressure'].min(), 1),
            "h_avg": round(today['humidity'].mean(), 1),
        }
    except:
        return {"t_max": "--", "t_min": "--", "p_max": "--", "p_min": "--", "h_avg": "--"}

# --- MICRO-CLIMATE TREND ANALYSIS ---
def get_micro_climate_logic(df):
    try:
        window = min(2400, len(df))
        recent = df.tail(window)
        if len(recent) < 10:
            return "Stable", "Collecting data...", 0

        p_now   = recent['pressure'].iloc[-1]
        p_start = recent['pressure'].iloc[0]
        h_now   = recent['humidity'].iloc[-1]
        h_start = recent['humidity'].iloc[0]
        p_delta = p_now - p_start
        h_delta = h_now - h_start

        rain_prob = 0

        if p_now < 1000:     rain_prob += 30
        elif p_now < 1003:   rain_prob += 20
        elif p_now < 1006:   rain_prob += 10

        if p_delta < -4.0:   rain_prob += 40
        elif p_delta < -3.0: rain_prob += 35
        elif p_delta < -2.0: rain_prob += 28
        elif p_delta < -1.0: rain_prob += 18
        elif p_delta < -0.5: rain_prob += 10
        elif p_delta < -0.2: rain_prob += 5

        if h_now > 90:       rain_prob += 20
        elif h_now > 80:     rain_prob += 14
        elif h_now > 70:     rain_prob += 8
        elif h_now > 60:     rain_prob += 4

        if h_delta > 10:     rain_prob += 10
        elif h_delta > 5:    rain_prob += 6
        elif h_delta > 2:    rain_prob += 3

        rain_prob = min(rain_prob, 100)

        if rain_prob >= 70:
            return "Expect Storm",     f"Pressure at {p_now:.1f} hPa (dropping {abs(p_delta):.1f}), humidity {h_now:.0f}%", rain_prob
        elif rain_prob >= 45:
            return "Rain Anticipated", f"Low pressure ({p_now:.1f} hPa), falling {abs(p_delta):.1f} hPa", rain_prob
        elif rain_prob >= 25:
            return "Showers Possible", f"Pressure {p_delta:+.2f} hPa trend, humidity {h_now:.0f}%", rain_prob
        elif p_delta > 1.0:
            return "Clearing Up",      f"Pressure rising {p_delta:.1f} hPa — improving", rain_prob
        else:
            return "Stable",           f"Pressure {p_now:.1f} hPa ({p_delta:+.2f} hPa trend), humidity {h_now:.0f}%", rain_prob

    except:
        return "Stable", "Analyzing trends...", 0

# --- GLOBAL STYLESHEET ---
BASE_CSS = """
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
<style>
    :root { --accent: #00f2ff; --glass: rgba(255, 255, 255, 0.03); --border: rgba(255, 255, 255, 0.1); }
    body { background: #020617; color: #f8fafc; font-family: 'Outfit', sans-serif; margin: 0; display: flex; height: 100vh; overflow: hidden; }
    .sidebar { width: 70px; background: rgba(0,0,0,0.4); border-right: 1px solid var(--border); display: flex; flex-direction: column; align-items: center; padding: 25px 0; transition: 0.3s; z-index: 100; }
    .sidebar:hover { width: 200px; align-items: flex-start; }
    .nav-item { color: #64748b; text-decoration: none; margin: 15px 0; display: flex; align-items: center; justify-content: center; width: 100%; height: 55px; transition: 0.3s; }
    .sidebar:hover .nav-item { justify-content: flex-start; padding-left: 20px; width: calc(100% - 20px); }
    .nav-icon { font-size: 1.6rem; min-width: 40px; text-align: center; display: flex; align-items: center; justify-content: center; }
    .nav-item:hover, .nav-item.active { color: var(--accent); }
    .nav-item.active .nav-icon { text-shadow: 0 0 15px var(--accent); }
    .nav-text { margin-left: 15px; opacity: 0; transition: 0.2s; white-space: nowrap; font-weight: 600; display: none; }
    .sidebar:hover .nav-text { opacity: 1; display: block; }
    .main-content { flex: 1; padding: 20px; overflow-y: auto; background: radial-gradient(circle at top right, #0f172a, #020617); }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; max-width: 1400px; margin: auto; }
    .glass { background: var(--glass); border: 1px solid var(--border); backdrop-filter: blur(20px); border-radius: 18px; padding: 18px; transition: 0.4s; position: relative; overflow: hidden; display: flex; flex-direction: column; min-height: 110px; }
    .label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1.2px; color: #64748b; margin-bottom: 6px; font-weight: 400; }
    .val { font-size: 1.6rem; font-weight: 600; color: var(--accent); }
    .sub-val { font-size: 0.85rem; color: #94a3b8; }
    .temp { font-size: 6rem; font-weight: 800; line-height: 1; margin: 10px 0; background: linear-gradient(#fff, #94a3b8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .backup-btn { background: rgba(255,255,255,0.05); border: 1px solid var(--border); color: #64748b; padding: 8px 16px; border-radius: 8px; cursor: pointer; text-decoration: none; font-size: 0.8rem; font-weight: 600; display: block; text-align: center; margin-top: auto; }
    .backup-btn:hover { background: var(--accent); color: #020617; border-color: var(--accent); }
    .range-btn { background: rgba(255,255,255,0.05); border: 1px solid var(--border); color: #64748b; padding: 6px 14px; border-radius: 8px; cursor: pointer; text-decoration: none; font-size: 0.8rem; font-weight: 600; }
    .range-btn.active { background: var(--accent); color: #020617; border-color: var(--accent); }
    .health-icon { color: #ff4444; font-size: 1.2rem; animation: pulse 2s infinite; }
    @keyframes pulse { 0% { opacity: 0.6; transform: scale(1); } 50% { opacity: 1; transform: scale(1.1); } 100% { opacity: 0.6; transform: scale(1); } }
    #poll-modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(2, 6, 23, 0.95); z-index: 1000; backdrop-filter: blur(10px); }
    #poll-modal:target { display: flex; align-items: center; justify-content: center; }
    .modal-content { width: 90%; max-width: 1000px; background: #0f172a; border: 1px solid var(--border); border-radius: 24px; padding: 30px; position: relative; }
    .close-btn { position: absolute; top: 20px; right: 20px; color: #64748b; font-size: 2rem; text-decoration: none; }
</style>
"""

def load_cleaned_df():
    df = pd.read_csv(LOG_FILE, names=COLUMNS, header=None, on_bad_lines="skip")
    numeric_cols = ["temp", "humidity", "pressure", "pm25", "pm10", "dew", "abs_h", "cpu", "uv", "rain_raw"]
    for col in numeric_cols:
        df[col] = pd.to_numeric(df[col], errors='coerce')
    df['time'] = pd.to_datetime(df['time'], format='mixed', errors='coerce')
    return df.dropna(subset=['time', 'temp', 'pressure'])

def detect_pollution_hotspot(df, current_wind_dir, current_pm25):
    try:
        recent_avg = df['pm25'].tail(30).mean()
        if current_pm25 > (recent_avg * 1.3):
            return {"status": "HOTSPOT DETECTED", "direction": current_wind_dir, "intensity": "High", "color": "#ff4444"}
        elif current_pm25 > (recent_avg * 1.1):
            return {"status": "MONITORING PLUME", "direction": current_wind_dir, "intensity": "Moderate", "color": "#ff9900"}
        return {"status": "CLEAR", "direction": "N/A", "intensity": "Low", "color": "#00ffcc"}
    except:
        return {"status": "Analyzing...", "direction": "--", "intensity": "Low", "color": "#64748b"}

def calculate_plume_arrival(current_pm25, recent_df, wind_speed, wind_dir):
    try:
        baseline = recent_df['pm25'].mean()
        if current_pm25 > (baseline * 1.2):
            speed = float(wind_speed)
            if speed < 0.5: return {"status": "STAGNANT", "msg": "Pollution lingering locally.", "color": "#ff9900"}
            distance_m = 1000
            arrival_seconds = distance_m / speed
            arrival_minutes = round(arrival_seconds / 60, 1)
            TARGET_MAP = {"North": "South", "South": "North", "East": "West", "West": "East",
                          "North-East": "South-West", "South-West": "North-East",
                          "North-West": "South-East", "South-East": "North-West"}
            target_area = TARGET_MAP.get(wind_dir, "Downwind")
            return {"status": "PLUME TRACKING", "msg": f"Front hitting {distance_m}m {target_area} in {arrival_minutes} min.", "color": "#ff9900"}
        return {"status": "CLEAR", "msg": "No significant plume detected.", "color": "#00ffcc"}
    except:
        return {"status": "IDLE", "msg": "Awaiting plume detection...", "color": "#64748b"}

def get_simulated_plume(wind_speed, wind_dir):
    speed = float(wind_speed) if float(wind_speed) > 0 else 5.0
    distance_m = 1000
    arrival_min = round((distance_m / speed) / 60, 1)
    TARGET_MAP = {"North": "South", "South": "North", "East": "West", "West": "East",
                  "North-East": "South-West", "South-West": "North-East",
                  "North-West": "South-East", "South-East": "North-West"}
    target_area = TARGET_MAP.get(wind_dir, "Downwind")
    return {"status": "🚨 PLUME DETECTED (SIM)", "msg": f"Pollution front moving at {speed}m/s. Impacting {distance_m}m {target_area} in ~{arrival_min} min.", "color": "#ff4444"}

def generate_pollution_map(df):
    try:
        ALL_DIRS = ["North", "North-East", "East", "South-East", "South", "South-West", "West", "North-West"]
        df = df.copy()
        df['wind_dir'] = df['wind_dir'].astype(str).str.strip()
        grouped = df.groupby('wind_dir')['pm25'].mean()
        map_df = grouped.reindex(ALL_DIRS, fill_value=0).reset_index()
        map_df.columns = ['wind_dir', 'pm25']

        def pm_color(val):
            if val <= 12: return "#00ffcc"
            elif val <= 35: return "#ffff00"
            elif val <= 55: return "#ff9900"
            else: return "#ff4444"

        bar_colors = [pm_color(v) for v in map_df['pm25']]

        fig = go.Figure(go.Barpolar(
            r=map_df['pm25'], theta=map_df['wind_dir'],
            marker_color=bar_colors,
            marker_line_color="rgba(255,255,255,0.15)",
            marker_line_width=1,
            name='Pollution Intensity (μg/m³)'
        ))
        fig.update_layout(
            title=dict(text="360° Spatial Pollution Distribution", font=dict(color="#94a3b8", size=14)),
            font_color="#64748b", paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)',
            polar=dict(
                bgcolor='rgba(0,0,0,0)',
                angularaxis=dict(tickmode='array', tickvals=ALL_DIRS, direction='clockwise', rotation=90,
                                 linecolor='rgba(255,255,255,0.15)', gridcolor='rgba(255,255,255,0.08)',
                                 tickfont=dict(color="#94a3b8", size=11)),
                radialaxis=dict(linecolor='rgba(255,255,255,0.1)', gridcolor='rgba(255,255,255,0.08)',
                                tickfont=dict(color="#64748b", size=9), side='counterclockwise', showticklabels=True)
            ),
            margin=dict(l=40, r=40, t=50, b=40), showlegend=False
        )
        return pio.to_html(fig, full_html=False, config={'displayModeBar': False})
    except Exception as e:
        return f"<p style='color:#64748b; padding:20px;'>Insufficient data to generate spatial map: {e}</p>"

# --- ROUTE: HOME DASHBOARD ---
@app.route("/")
def index():
    try:
        demo_mode = request.args.get('demo', 'false').lower() == 'true'
        refresh_state = request.args.get('refresh', 'on')
        refresh_content = "3" if refresh_state == "on" else "3600"

        df = load_cleaned_df()
        last = df.tail(1).iloc[0]

        wind_source = "CSV"
        if demo_mode:
            live_w = 5.0
            live_dir = "South-West"
            wind_source = "DEMO"
        else:
            try:
                raw_speed = anemo.read_register(0, 0)
                live_w = round(raw_speed / 10.0, 1)
                wind_source = "LIVE"
            except:
                live_w = round(float(last['wind_speed']), 1)
            try:
                raw_dir = int(vane.read_register(0, 0))
                live_dir = DIRECTION_MAP.get(raw_dir, "North")
                wind_source = "LIVE" if wind_source == "LIVE" else "LIVE(dir)"
            except:
                live_dir = str(last['wind_dir']).strip()
                wind_source = "CSV" if wind_source != "LIVE" else "LIVE(spd)"

        aqi_val = int(calculate_aqi(last['pm25']))
        _, aqi_color, _ = get_aqi_category(aqi_val)
        status, detail, rain_prob = get_micro_climate_logic(df)

        recent = df.tail(30)
        spike_val = round(recent['pm25'].max() - recent['pm25'].min(), 2)
        hot_status = "DETECTED" if spike_val > 2.0 else "NONE"

        window = min(2400, len(df))
        recent_trend = df.tail(window)
        press_delta = recent_trend['pressure'].iloc[-1] - recent_trend['pressure'].iloc[0]

        t_val, h_val, p_val, cpu_val = float(last['temp']), float(last['humidity']), float(last['pressure']), float(last['cpu'])

        dew_point = t_val - ((100 - h_val) / 5)
        dp_gap = abs(t_val - dew_point)

        l_prob = rain_prob
        s_status = "Stable"
        if l_prob > 80:   s_status = "Severe Convective Risk"
        elif l_prob > 50: s_status = "Thunderstorm Possible"
        elif l_prob > 20: s_status = "Unstable Air"

        confidence = 0
        if window > 1000: confidence += 30
        if abs(press_delta) > 0.5: confidence += 30
        if h_val > 70: confidence += 20
        if dp_gap < 3: confidence += 20
        c_text = "Low" if confidence < 40 else "Medium" if confidence < 70 else "High"

        STATION_LAT, STATION_LON = 10.1422, 76.5342
        DIR_VECTOR = {
            "North":      (-0.002,  0.000), "North-East": (-0.0014,-0.0014),
            "East":       ( 0.000, -0.002), "South-East": ( 0.0014,-0.0014),
            "South":      ( 0.002,  0.000), "South-West": ( 0.0014, 0.0014),
            "West":       ( 0.000,  0.002), "North-West": (-0.0014, 0.0014),
        }

        now_ts = datetime.now()
        hist = df[df['time'] > (now_ts - timedelta(hours=24))].copy()
        hist['wind_dir'] = hist['wind_dir'].astype(str).str.strip()
        hist['pm25']     = pd.to_numeric(hist['pm25'], errors='coerce')
        hist = hist[hist['pm25'] > 0].dropna(subset=['pm25', 'wind_dir'])

        dir_groups = hist.groupby('wind_dir').agg(
            avg_pm25=('pm25', 'mean'), count=('pm25', 'count')
        ).reset_index()

        current_pm = float(last['pm25'])
        hmap_rows = [{'lat': STATION_LAT, 'lon': STATION_LON, 'pm25': current_pm * 1.5}]

        for _, row in dir_groups.iterrows():
            vec = DIR_VECTOR.get(str(row['wind_dir']).strip())
            if vec is None: continue
            weight = min(row['count'] / max(dir_groups['count'].max(), 1), 1.0)
            dist   = 1.0 - weight * 0.5
            hmap_rows.append({'lat': STATION_LAT + vec[0] * dist, 'lon': STATION_LON + vec[1] * dist, 'pm25': round(float(row['avg_pm25']), 1)})

        heatmap_data = pd.DataFrame(hmap_rows)
        fig_hmap = px.density_mapbox(
            heatmap_data, lat='lat', lon='lon', z='pm25', radius=40,
            color_continuous_scale=[[0.0,"#001f7a"],[0.2,"#00bfff"],[0.45,"#00ffcc"],[0.65,"#ffff00"],[0.82,"#ff9900"],[1.0,"#ff2200"]],
            labels={'pm25': 'PM2.5 (μg/m³)'}
        )
        fig_hmap.update_layout(
            mapbox=dict(style="carto-darkmatter", center=dict(lat=STATION_LAT, lon=STATION_LON), zoom=14, uirevision='constant'),
            coloraxis_colorbar=dict(title=dict(text="PM2.5<br>(μg/m³)", font=dict(color="#94a3b8")), tickfont=dict(color="#94a3b8")),
            margin={"r":0,"t":0,"l":0,"b":0}, paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)'
        )
        heatmap_html = pio.to_html(fig_hmap, full_html=False, config={'displayModeBar': False})

        is_raining_status = "RAINING" if int(last['rain_raw']) < RAIN_THRESHOLD else "DRY"

        hotspot = detect_pollution_hotspot(df, live_dir, float(last['pm25']))

        if demo_mode:
            plume = get_simulated_plume(live_w, live_dir)
        else:
            plume = calculate_plume_arrival(float(last['pm25']), df.tail(50), live_w, live_dir)

        # 📘 UV FIX: The uv column in CSV already stores the final calculated UV index
        # (computed correctly in logger.py). Read it directly — no re-conversion needed.
        uv_index = round(float(last['uv']), 1)

        # UV risk label
        if uv_index < 3:    uv_risk, uv_col = "Low",        "#00ffcc"
        elif uv_index < 6:  uv_risk, uv_col = "Moderate",   "#ffff00"
        elif uv_index < 8:  uv_risk, uv_col = "High",       "#ff9900"
        elif uv_index < 11: uv_risk, uv_col = "Very High",  "#ff4444"
        else:               uv_risk, uv_col = "Extreme",    "#ff0000"

        hi_val, hi_cat, hi_col = calculate_heat_index(t_val, h_val)
        daily = get_daily_summary(df)

        return render_template_string(BASE_CSS + HOME_TEMPLATE,
            page="home",
            t=round(last['temp'], 1),
            h=round(last['humidity'], 1),
            feels=round(t_val + 0.33 * (math.exp(0.031 * t_val) * (h_val / 100 * 6.105)) - 4.0, 1),
            p=round(last['pressure'], 1),
            aqi=aqi_val, aqi_color=aqi_color,
            pm25=int(last['pm25']), pm10=int(last['pm10']),
            no2=last['no2'], co=last['co'], nh3=last['nh3'],
            w=live_w, dir=live_dir, wind_source=wind_source,
            cpu=round(last['cpu'], 1),
            uv=last['uv'],
            is_raining=is_raining_status,
            hot=hot_status, spike=spike_val,
            heatmap_html=heatmap_html,
            time=str(last['time']).split()[-1],
            alt=round(44330*(1-math.pow(last['pressure']/1013.25, 0.1903)), 1),
            cloud=int(last['cloud']),
            abs_h=round(float(last['abs_h']), 1),
            pc03=int(last['pc03']), pc05=int(last['pc05']),
            rain_raw=last['rain_raw'],
            h_status=hotspot['status'], h_dir=hotspot['direction'],
            h_color=hotspot['color'], h_level=hotspot['intensity'],
            p_status=plume['status'], p_msg=plume['msg'], p_color=plume['color'],
            refresh_timer=refresh_content, refresh_status=refresh_state,
            lightning_prob=l_prob, storm_status=s_status, conf_text=c_text,
            dew=round(dew_point, 1),
            f_status=status, f_detail=detail,
            hi_val=hi_val, hi_cat=hi_cat, hi_col=hi_col,
            uv_index=uv_index, uv_risk=uv_risk, uv_col=uv_col,
            daily=daily)
    except Exception as e: return f"Error: {e}"

# --- ROUTE: TREND FORECAST ---
@app.route("/prediction")
def prediction():
    try:
        period = request.args.get('period', '24h')
        df = load_cleaned_df()
        now = datetime.now()

        if period == "24h":
            display_df = df[df['time'] > (now - timedelta(hours=24))]
            period_label = "Last 24 Hours"
        elif period == "week":
            display_df = df[df['time'] > (now - timedelta(days=7))]
            period_label = "Last 7 Days"
        elif period == "month":
            display_df = df[df['time'] > (now - timedelta(days=30))]
            period_label = "Last 30 Days"
        elif period == "year":
            display_df = df[df['time'] > (now - timedelta(days=365))]
            period_label = "Last 365 Days"
        else:
            display_df = df.copy()
            period_label = "All Time"

        if len(display_df) >= 2:
            data_start = display_df['time'].min().strftime("%d %b %Y %H:%M")
            data_end   = display_df['time'].max().strftime("%d %b %Y %H:%M")
            data_note  = f"{data_start} → {data_end}  ({len(display_df)} raw points)"
        else:
            data_note = "Insufficient data for this range"

        if len(display_df) >= 2:
            actual_span_hours = (display_df['time'].max() - display_df['time'].min()).total_seconds() / 3600
            target_points = 400
            seconds_per_bucket = max(3, (actual_span_hours * 3600) / target_points)

            if seconds_per_bucket < 60:
                resample_rule = f"{max(1, int(seconds_per_bucket))}s"
            elif seconds_per_bucket < 3600:
                resample_rule = f"{max(1, int(seconds_per_bucket / 60))}min"
            elif seconds_per_bucket < 86400:
                resample_rule = f"{max(1, int(seconds_per_bucket / 3600))}h"
            else:
                resample_rule = f"{max(1, int(seconds_per_bucket / 86400))}D"

            display_df = (display_df
                          .set_index('time')[['pressure', 'humidity']]
                          .resample(resample_rule).mean()
                          .dropna()
                          .reset_index())

        ml_temp = predict_temp_2h(df)
        pred, detail, prob = get_micro_climate_logic(df)

        fig = make_subplots(specs=[[{"secondary_y": True}]])

        if len(display_df) >= 2:
            p_min = display_df['pressure'].min()
            p_max = display_df['pressure'].max()
            h_min = display_df['humidity'].min()
            h_max = display_df['humidity'].max()
            p_pad = max((p_max - p_min) * 0.2, 0.5)
            h_pad = max((h_max - h_min) * 0.2, 2.0)

            fig.add_trace(go.Scatter(x=display_df['time'], y=display_df['pressure'],
                name="Pressure (hPa)", line=dict(color='#00f2ff', width=2.5), mode='lines'), secondary_y=False)
            fig.add_trace(go.Scatter(x=display_df['time'], y=display_df['humidity'],
                name="Humidity (%)", line=dict(color='#3b82f6', width=2.5), mode='lines'), secondary_y=True)

            baseline_p = 1010.0
            if p_min < baseline_p < p_max + p_pad:
                fig.add_hline(y=baseline_p, line_dash="dot", line_color="rgba(255,255,0,0.3)",
                    annotation_text="Normal baseline (1010 hPa)", annotation_font_color="rgba(255,255,0,0.5)",
                    annotation_position="bottom right", secondary_y=False)

            fig.update_yaxes(range=[p_min - p_pad, p_max + p_pad], secondary_y=False,
                title_text="Pressure (hPa)", gridcolor='rgba(255,255,255,0.05)', zeroline=False)
            fig.update_yaxes(range=[h_min - h_pad, h_max + h_pad], secondary_y=True,
                title_text="Humidity (%)", gridcolor='rgba(255,255,255,0.05)', zeroline=False)
        else:
            fig.add_annotation(
                text=f"No data in this range yet.<br>Station started: {df['time'].min().strftime('%d %b %Y') if len(df) else 'N/A'}",
                xref="paper", yref="paper", x=0.5, y=0.5, showarrow=False, font=dict(color="#64748b", size=14))

        fig.update_layout(
            title_text=f"Atmospheric Correlation — {period_label}",
            hovermode="x unified", paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)',
            font_color="#64748b", margin=dict(l=10, r=10, t=50, b=10),
            legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1)
        )

        return render_template_string(BASE_CSS + PRED_TEMPLATE,
            page="prediction", ml_temp=ml_temp, pred=pred, prob=prob,
            data_note=data_note,
            chart=pio.to_html(fig, full_html=False, config={
                'displayModeBar': True,
                'toImageButtonOptions': {'format': 'png', 'filename': 'atmospheric_trend_export', 'height': 700, 'width': 1200, 'scale': 2}
            }), period=period)
    except Exception as e: return f"Error: {e}"

# --- ROUTE: HEALTH ADVISORY ---
@app.route("/health")
def health():
    try:
        df = pd.read_csv(LOG_FILE, names=COLUMNS, header=None, on_bad_lines="skip")
        last = df.tail(1).iloc[0]
        aqi_val = calculate_aqi(last['pm25'])
        cat, color, adv = get_aqi_category(aqi_val)
        ratio = float(last['pc03'])/float(last['pc05']) if last['pc05']>0 else 0
        src = "Combustion Smoke" if ratio > 5.5 else "Natural Dust"
        return render_template_string(BASE_CSS + HEALTH_TEMPLATE, page="health", aqi=aqi_val, cat=cat, color=color, adv=adv, src=src)
    except Exception as e: return f"Error: {e}"

# --- ROUTE: SMART ALERTS ---
alerts_enabled = True

@app.route("/alerts")
def alerts():
    global alerts_enabled
    try:
        action = request.args.get('action')
        if action == "pause": alerts_enabled = False
        elif action == "resume": alerts_enabled = True

        df = pd.read_csv(LOG_FILE, names=COLUMNS, header=None, on_bad_lines="skip")
        last = df.tail(1).iloc[0]

        aqi_val = calculate_aqi(last['pm25'])
        _, _, advice = get_aqi_category(aqi_val)

        active_alerts = []

        no2_val = float(last['no2'])
        if no2_val > 0.1:
            active_alerts.append({"type": "Gas Alert", "msg": f"NO2 levels: {last['no2']}", "advice": "Dangerous exhaust levels. Ventilate immediately.", "color": "#ff4444", "severity": "CRITICAL"})
        elif no2_val > 0.05:
            active_alerts.append({"type": "Gas Alert", "msg": f"NO2 levels: {last['no2']}", "advice": "Elevated exhaust detected. Monitor closely.", "color": "#ff9900", "severity": "WARNING"})

        if aqi_val > 150:
            active_alerts.append({"type": "Pollution Event", "msg": f"AQI is {aqi_val}", "advice": advice, "color": "#ff4444", "severity": "CRITICAL"})
        elif aqi_val > 100:
            active_alerts.append({"type": "Pollution Event", "msg": f"AQI is {aqi_val}", "advice": advice, "color": "#ff9900", "severity": "WARNING"})
        elif aqi_val > 50:
            active_alerts.append({"type": "Pollution Event", "msg": f"AQI is {aqi_val}", "advice": advice, "color": "#ffff00", "severity": "MODERATE"})

        cpu_val_a = float(last['cpu'])
        if cpu_val_a > 85.0:
            active_alerts.append({"type": "System Thermal", "msg": f"Pi CPU: {last['cpu']}°C", "advice": "Critical overheating! Check cooling immediately.", "color": "#ff4444", "severity": "CRITICAL"})
        elif cpu_val_a > 75.0:
            active_alerts.append({"type": "System Thermal", "msg": f"Pi CPU: {last['cpu']}°C", "advice": "High CPU temperature detected.", "color": "#ff9900", "severity": "WARNING"})

        if active_alerts and alerts_enabled:
            for alert in active_alerts:
                msg = f"⚠️ <b>STATION ALERT</b>\n{alert['type']}: {alert['msg']}"
                send_telegram(msg)

        return render_template_string(BASE_CSS + ALERTS_TEMPLATE,
            page="alerts", alerts=active_alerts, bot_active=alerts_enabled)
    except Exception as e: return f"Error: {e}"

# --- ROUTE: POLLUTION MAP ---
@app.route("/map")
def pollution_map():
    try:
        df = load_cleaned_df()
        recent_df = df[df['time'] > (datetime.now() - timedelta(hours=24))]
        map_html = generate_pollution_map(recent_df)
        return render_template_string(BASE_CSS + MAP_TEMPLATE, page="map", map_html=map_html)
    except Exception as e: return f"Map Error: {e}"

@app.route("/backup")
def backup():
    try:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_path = os.path.join(BACKUP_DIR, f"manual_backup_{timestamp}.csv")
        shutil.copy2(LOG_FILE, backup_path)
        return f"Backup Successful! <a href='/'>Go Home</a>"
    except Exception as e: return f"Error: {e}"

# --- TEMPLATE: NAVIGATION BAR ---
NAV = """
<div class="sidebar">
    <a href="/" class="nav-item {{ 'active' if page == 'home' }}"><span class="nav-icon">⌂</span><span class="nav-text">Home</span></a>
    <a href="/prediction" class="nav-item {{ 'active' if page == 'prediction' }}"><span class="nav-icon">◈</span><span class="nav-text">Forecast</span></a>
    <a href="/map" class="nav-item {{ 'active' if page == 'map' }}"><span class="nav-icon">📍</span><span class="nav-text">Map</span></a>
    <a href="/health" class="nav-item {{ 'active' if page == 'health' }}"><span class="nav-icon">♥</span><span class="nav-text">Health</span></a>
    <a href="/alerts" class="nav-item {{ 'active' if page == 'alerts' }}"><span class="nav-icon">🔔</span><span class="nav-text">Station Bot</span></a>
</div>
"""

# --- TEMPLATE: HOME PAGE ---
HOME_TEMPLATE = """
<!DOCTYPE html><html><head><meta http-equiv="refresh" content="{{refresh_timer}}"></head><body>
""" + NAV + """
<div class="main-content"><div class="grid">
    <div class="glass hero {{ 'raining-bg' if is_raining == 'RAINING' }}" style="grid-column: span 2; grid-row: span 2;">
        <div style="position:absolute; top:20px; right:20px; padding:5px 15px; border-radius:20px; font-weight:bold; background:{{ '#0077ff' if is_raining == 'RAINING' else 'rgba(255,255,255,0.1)' }}; z-index:2;">{{is_raining}}</div>
        <div class="label" style="position:relative; z-index:2;">WEATHER STATION • {{time}}</div><div class="temp">{{t}}°C</div>
        <div style="display:flex; gap:35px; position:relative; z-index:2;"><div><div class="label">Feels Like</div><div class="val" style="font-size:1.8rem">{{feels}}°C</div></div><div><div class="label">Humidity</div><div class="val" style="font-size:1.8rem">{{h}}%</div></div></div>
        <div style="font-size: 1.8rem; font-weight: 600; color: #00f2ff; position:relative; z-index:2; margin-top:15px;">{{f_status}}</div>
        <div style="opacity:0.6; position:relative; z-index:2; font-weight: 400;">{{f_detail}}</div>
    </div>
    <div class="glass">
        <div style="display: flex; justify-content: space-between; align-items: center;"><div class="label">Air Quality</div><div style="padding:4px 12px; border-radius:8px; font-weight:bold; border:1px solid; color:{{aqi_color}}; border-color:{{aqi_color}}; background:{{aqi_color}}15;">AQI {{aqi}}</div></div>
        <div style="margin-top:10px;"><div class="label" style="font-size:0.75rem">PM2.5 / PM10</div><div class="val" style="font-size:1.4rem; color:var(--accent)">{{pm25}} <span class="sub-val">/ {{pm10}} μg/m³</span></div><div class="label" style="margin-top:10px; font-size:0.75rem">Count: 0.3μ | 0.5μ</div><div class="val" style="font-size:1.4rem; color:#f8fafc">{{pc03}} | {{pc05}}</div></div>
    </div>

    <a href="#poll-modal" style="text-decoration:none; color:inherit; display:contents;">
        <div class="glass" style="cursor:pointer; border: 1px solid var(--border);">
            <div class="label">Pollution Intelligence</div>
            <div class="label" style="margin-top:12px">Hotspot Status</div>
            <div class="val">{{hot}}</div>
            <div style="font-size:0.75rem; color:#64748b; margin-top:5px;">Click for Deep-Dive</div>
        </div>
    </a>

    <div class="glass" style="border-color: {{p_color}};">
        <div class="label">Plume Tracking & Arrival Forecast</div>
        <div class="val" style="color: {{p_color}}; font-size: 1.3rem;">{{p_status}}</div>
        <div style="margin-top: 12px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1);">
            <div class="label">Vector Intelligence</div>
            <div style="font-size: 1.1rem; line-height: 1.4; color: #fff;">{{p_msg}}</div>
        </div>
        {% if p_status == 'PLUME TRACKING' %}
            <div style="margin-top: 10px; font-size: 0.75rem; color: #64748b;">Calculation: Based on current wind velocity of {{w}} m/s.</div>
        {% endif %}
    </div>

    <div class="glass" style="border-color: {{h_color}};">
        <div class="label">Hotspot Detection Engine</div>
        <div class="val" style="color: {{h_color}}; font-size: 1.4rem; margin-top: 5px;">{{h_status}}</div>
        {% if h_status != 'CLEAR' %}
            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.05);">
                <div class="label">Source Vector</div>
                <div class="val" style="font-size: 1.6rem; color: #fff;">Incoming from {{h_dir}}</div>
                <div class="sub-val" style="color: {{h_color}};">Intensity: {{h_level}}</div>
            </div>
        {% else %}
            <div class="sub-val" style="margin-top: 10px; opacity: 0.6;">Vector Analysis: Local air is stable.</div>
        {% endif %}
    </div>

    <div class="glass"><div><div class="label">Atmospheric Gases</div><div style="display:grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size:0.85rem; margin-top:5px;"><div>NO2: <b>{{no2}}</b></div><div>CO: <b>{{co}}</b></div><div>NH3: <b>{{nh3}}</b></div><div style="color:#00f2ff">UV: <b>{{uv}}</b></div></div></div><div style="margin-top:12px;"><div class="label">Rain Sensor (Raw)</div><div class="val" style="font-size:1.4rem">{{rain_raw}}</div></div></div>
    <div class="glass"><div><div style="display:flex; justify-content:space-between; align-items:center;"><div class="label">Wind Velocity</div><div style="font-size:0.6rem; font-weight:700; padding:2px 8px; border-radius:10px; color:{{ '#00ffcc' if wind_source == 'LIVE' else '#ff9900' }}; border:1px solid {{ '#00ffcc' if wind_source == 'LIVE' else '#ff9900' }};">{{ wind_source }}</div></div><div class="val">{{w}} m/s</div><div class="sub-val">{{dir}}</div></div></div>
    <div class="glass"><div><div class="label">Barometer</div><div class="val">{{p}} hPa</div><div class="sub-val" style="color:var(--accent); font-weight:600">20.5m Elevation</div></div></div>
    <div class="glass"><div><div class="label">Cloud Base</div><div class="val">{{cloud}}m</div><div class="label" style="margin-top:12px">Dew Point</div><div class="val">{{dew}}°C</div></div></div>
    <div class="glass"><div><div class="label">Absolute Humidity</div><div class="val">{{abs_h}} g/m³</div><div class="sub-val">Calculated Moisture</div></div></div>

    <div class="glass" style="border-color: {{hi_col}};">
        <div class="label">Heat Index</div>
        <div class="val" style="color:{{hi_col}}; font-size:1.8rem;">{{hi_val}}°C</div>
        <div class="sub-val" style="color:{{hi_col}}; font-weight:600; margin-top:4px;">{{hi_cat}}</div>
        <div style="font-size:0.7rem; color:#64748b; margin-top:6px;">Feels due to humidity + temp</div>
    </div>

    <div class="glass" style="border-color: {{uv_col}};">
        <div class="label">UV Index</div>
        <div class="val" style="color:{{uv_col}}; font-size:2rem;">{{uv_index}}</div>
        <div class="sub-val" style="color:{{uv_col}}; font-weight:600;">{{uv_risk}}</div>
        <div style="font-size:0.65rem; color:#64748b; margin-top:4px;">GUVA-S12SD via ADS1115</div>
        <div style="font-size:0.7rem; color:#64748b; margin-top:2px;">
            {% if uv_index >= 6 %}☀️ Apply SPF 30+ sunscreen{% elif uv_index >= 3 %}🕶️ Sunglasses recommended{% else %}✅ No protection needed{% endif %}
        </div>
    </div>

    <div class="glass" style="grid-column: span 2;">
        <div class="label">Today's Summary</div>
        <div style="display:grid; grid-template-columns: repeat(5, 1fr); gap:10px; margin-top:8px; text-align:center;">
            <div><div class="label" style="font-size:0.65rem;">TEMP MAX</div><div class="val" style="color:#ff9900; font-size:1.2rem;">{{daily.t_max}}°C</div></div>
            <div><div class="label" style="font-size:0.65rem;">TEMP MIN</div><div class="val" style="color:#00f2ff; font-size:1.2rem;">{{daily.t_min}}°C</div></div>
            <div><div class="label" style="font-size:0.65rem;">PRESSURE MAX</div><div class="val" style="color:#94a3b8; font-size:1.2rem;">{{daily.p_max}}</div></div>
            <div><div class="label" style="font-size:0.65rem;">PRESSURE MIN</div><div class="val" style="color:#94a3b8; font-size:1.2rem;">{{daily.p_min}}</div></div>
            <div><div class="label" style="font-size:0.65rem;">AVG HUMIDITY</div><div class="val" style="color:#3b82f6; font-size:1.2rem;">{{daily.h_avg}}%</div></div>
        </div>
    </div>

    <div class="glass" style="border-color: {{ '#ff4444' if lightning_prob > 70 else 'var(--border)' }};">
        <div class="label">Storm Severity</div>
        <div class="val" style="color: {{ '#ff4444' if lightning_prob > 70 else '#00ffcc' }};">{{ lightning_prob }}%</div>
        <div class="sub-val" style="font-weight: bold;">{{ storm_status }}</div>
        <div style="margin-top: 8px; font-size: 0.7rem; opacity: 0.7;">Dew Point: {{ dew }}°C <br>Confidence: {{ conf_text }}</div>
    </div>

    <div class="glass">
        <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
            <div class="label">System Health</div>
            <div class="health-icon">♥</div>
        </div>
        <div class="val">{{cpu}}°C CPU</div>
        <a href="/backup" class="backup-btn">Manual Backup</a>
    </div>
</div></div>

<div class="glass">
    <div style="display:flex; justify-content:space-between; align-items:center;">
        <div class="label">Display Sync</div>
        <div style="font-size:0.7rem; color:{{ '#00ffcc' if refresh_status == 'on' else '#ff4444' }};">{{ 'LIVE' if refresh_status == 'on' else 'PAUSED' }}</div>
    </div>
    {% if refresh_status == 'on' %}
        <a href="/?refresh=off" class="backup-btn" style="border-color:#ff4444; color:#ff4444;">⏸ Pause Refresh</a>
    {% else %}
        <a href="/?refresh=on" class="backup-btn" style="border-color:#00ffcc; color:#00ffcc;">▶ Resume Live</a>
    {% endif %}
    <div class="sub-val" style="margin-top:5px; font-size:0.7rem;">Prevents modal auto-close</div>
</div>

<div id="poll-modal">
    <div class="modal-content">
        <a href="#" class="close-btn">&times;</a>
        <h2 style="color:var(--accent); margin-top:0;">Pollution Deep-Dive Analytics</h2>
        <div style="height:400px; border-radius:15px; overflow:hidden; border: 1px solid var(--border);">{{heatmap_html|safe}}</div>
        <div style="margin-top:20px; padding:20px; background:rgba(255,255,255,0.03); border-radius:15px; border-left:4px solid var(--accent);">
            <div class="label" style="color:var(--accent)">Station Bot Analysis</div>
            <p style="font-size:1.1rem; line-height:1.6; margin:10px 0;">
                Hotspot status: <b>{{hot}}</b>. Detected a <b>{{spike}}μg/m³ PM2.5 variation</b> in the last 30 readings.
                Wind is currently from <b>{{dir}}</b>. Heatmap shows PM2.5 intensity mapped from 24h of wind-correlated sensor data.
            </p>
        </div>
    </div>
</div>
</body></html>
"""

# --- TEMPLATE: PREDICTION PAGE ---
PRED_TEMPLATE = """
<!DOCTYPE html><html><head></head><body>
""" + NAV + """
<div class="main-content"><div class="grid" style="grid-template-columns: 1fr 1.5fr;">
    <div class="glass" style="text-align:center; display:flex; flex-direction:column; justify-content:center; align-items:center;">
        <div class="label">ML Temp Forecast (2h)</div><div style="font-size:4.5rem; font-weight:800; color:#00f2ff;">{{ml_temp}}°C</div>
        <div class="label" style="margin-top:20px;">Micro-Climate</div><div style="font-size:1.8rem; font-weight:600; margin:10px 0;">{{pred}}</div>
        <div class="glass" style="display:inline-block; align-self:center; margin-top:20px; background:rgba(0,119,255,0.1); border-color:#0077ff; padding: 20px;"><div class="label">Rain Prob.</div><div style="font-size:3rem; font-weight:800; color:#0077ff;">{{prob}}%</div></div>
    </div>
    <div class="glass">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;"><div class="label">Trend</div><div style="gap:8px; display:flex;">
            <a href="/prediction?period=24h" class="range-btn {{ 'active' if period == '24h' }}">24H</a>
            <a href="/prediction?period=week" class="range-btn {{ 'active' if period == 'week' }}">WEEK</a>
            <a href="/prediction?period=month" class="range-btn {{ 'active' if period == 'month' }}">MONTH</a>
            <a href="/prediction?period=year" class="range-btn {{ 'active' if period == 'year' }}">YEAR</a>
            <a href="/prediction?period=5year" class="range-btn {{ 'active' if period == '5year' }}">5Y</a>
        </div></div>
        <div style="font-size:0.7rem; color:#64748b; margin-bottom:10px; padding:6px 12px; background:rgba(255,255,255,0.03); border-radius:8px; border-left:2px solid var(--accent);">
            📅 Data coverage: <b style="color:#94a3b8;">{{ data_note }}</b>
        </div>
        {{chart|safe}}
        <div style="margin-top: 15px; border-top: 1px solid var(--border); padding-top: 15px;">
            <button onclick="Plotly.downloadImage(document.querySelector('.js-plotly-plot'), {format: 'png', width: 1200, height: 700, filename: 'weather_trend_report'})"
                    class="backup-btn" style="width: 100%; border-color: var(--accent); color: var(--accent); cursor: pointer;">
                🚀 SAVE HIGH-RES REPORT (.PNG)
            </button>
        </div>
    </div>
</div></body></html>
"""

MAP_TEMPLATE = """
<!DOCTYPE html><html><head></head><body>
""" + NAV + """
<div class="main-content">
    <div class="glass" style="height: 85vh; display: flex; flex-direction: column;">
        <div class="label">Spatial Hotspot Analysis</div>
        <div style="flex: 1;">{{map_html|safe}}</div>
        <div style="padding: 15px; border-top: 1px solid var(--border); font-size: 0.9rem; color: #64748b;">
            💡 <b>Insight:</b> The length of the bars indicates pollution intensity from that specific compass heading. Longer bars point directly toward the suspected pollution sources.
        </div>
    </div>
</div>
</body></html>
"""

# --- TEMPLATE: HEALTH PAGE ---
HEALTH_TEMPLATE = """
<!DOCTYPE html><html><head></head><body>
""" + NAV + """
<div class="main-content"><div class="grid" style="grid-template-columns: 1.5fr 1fr;">
    <div class="glass" style="text-align:center; align-items:center; justify-content:center;">
        <div class="label">Health Advisor</div><div style="font-size:4rem; font-weight:800; color:{{color}};">AQI {{aqi}}</div><div style="font-size:2rem; font-weight:600;">{{cat}}</div>
        <div class="glass" style="margin-top:25px; border-color:{{color}}; background:{{color}}05; padding: 20px; width: 80%;"><div class="label">Advice</div><div style="font-size:1.3rem; font-weight: 400;">{{adv}}</div></div>
    </div>
    <div class="glass" style="text-align:center; display:flex; flex-direction:column; justify-content:center; align-items:center;">
        <div class="label">Particle Source</div><div style="font-size:2.2rem; font-weight:800; color:#00f2ff; margin:20px 0;">{{src}}</div><div style="opacity:0.6; font-size:0.95rem; font-weight: 400;">Analyzing particles.</div>
    </div>
</div></div></body></html>
"""

# --- TEMPLATE: ALERTS PAGE ---
ALERTS_TEMPLATE = """
<!DOCTYPE html><html><head></head><body>
""" + NAV + """
<div class="main-content"><div class="grid" style="grid-template-columns: repeat(2, 1fr);">
    {% for alert in alerts %}
    <div class="glass" style="border-color: {{alert.color}}; border-width: 2px; background: {{alert.color}}08;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <div class="label" style="color:{{alert.color}}; margin-bottom:0;">{{alert.type}}</div>
            <div style="font-size:0.65rem; font-weight:700; padding:3px 10px; border-radius:20px; color:{{alert.color}}; border:1px solid {{alert.color}}; background:{{alert.color}}15;">{{alert.severity}}</div>
        </div>
        <div class="val" style="color:#fff; font-size:1.4rem;">{{alert.msg}}</div>
        <div class="sub-val" style="color:{{alert.color}}; margin-top:10px;">{{alert.advice}}</div>
    </div>
    {% else %}
    <div class="glass" style="grid-column: span 2; text-align:center;">
        <div class="val" style="color:#00ffcc;">✓ SYSTEM SECURE</div>
        <div class="label">All parameters within safe limits. Bot is monitoring.</div>
    </div>
    {% endfor %}
</div>
<div style="position: fixed; bottom: 30px; right: 30px; z-index: 1000; text-align: right;">
    <div class="label" style="font-size: 0.65rem; margin-bottom: 5px; opacity: 0.8;">Bot: {{ 'ACTIVE' if bot_active else 'PAUSED' }}</div>
    {% if bot_active %}
        <a href="/alerts?action=pause" class="backup-btn" style="border-color: #ff4444; color: #ff4444; padding: 10px 20px; border-radius: 30px; background: rgba(255,68,68,0.1);">⏸ Pause Bot</a>
    {% else %}
        <a href="/alerts?action=resume" class="backup-btn" style="border-color: #00ffcc; color: #00ffcc; padding: 10px 20px; border-radius: 30px; background: rgba(0,255,204,0.1);">▶ Resume</a>
    {% endif %}
</div>
</div></body></html>
"""

# --- SERVER START ---
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
