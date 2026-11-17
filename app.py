import streamlit as st
import pandas as pd
import folium
from streamlit_folium import st_folium
import streamlit.components.v1 as components
from datetime import datetime, timedelta, timezone, date

from utils.weather_fetcher import get_forecast_by_coords
from utils.aqi_fetcher import get_aqi_by_coords
from utils.reverse_geocoder import get_location_name
from utils.pm25_predictor import train_and_predict_from_csv
from utils.logger import log_pm25


# ── Location detection from URL params ──────────────────────────────────────
def get_coords():
    query = st.query_params
    if "lat" in query and "lon" in query:
        lat_val = query["lat"]
        lon_val = query["lon"]
        if isinstance(lat_val, list):
            lat_val = lat_val[0]
        if isinstance(lon_val, list):
            lon_val = lon_val[0]
        try:
            lat = float(lat_val)
            lon = float(lon_val)
            if lat == 0.0 and lon == 0.0:
                return None, None
            return lat, lon
        except (ValueError, TypeError):
            pass
    return None, None


# ── PM2.5 → AQI converter ───────────────────────────────────────────────────
def convert_pm25_to_aqi(pm25):
    breakpoints = [
        (0.0,   12.0,    0,  50),
        (12.1,  35.4,   51, 100),
        (35.5,  55.4,  101, 150),
        (55.5,  150.4, 151, 200),
        (150.5, 250.4, 201, 300),
        (250.5, 500.0, 301, 500),
    ]
    for c_low, c_high, aqi_low, aqi_high in breakpoints:
        if c_low <= pm25 <= c_high:
            return round(((aqi_high - aqi_low) / (c_high - c_low)) * (pm25 - c_low) + aqi_low)
    return None


# ── Page config ─────────────────────────────────────────────────────────────
st.set_page_config(page_title="AirGuardian+", layout="wide")
st.title("🌫️ AirGuardian+ — Localized Pollution & Weather Advisor")

lat, lon = get_coords()

# ── Location screen ─────────────────────────────────────────────────────────
if lat is None or lon is None:
    st.info("📍 Allow location access so AirGuardian+ can detect your position automatically.")

    # Native Streamlit button — JS fires on real user gesture (no iframe sandbox issues)
    detect_clicked = st.button("📍 Detect My Location Automatically")

    if detect_clicked:
        # height=0 keeps iframe invisible; top-level navigation works on user-gesture
        components.html("""
        <script>
        (function() {
            if (!navigator.geolocation) {
                window.top.document.body.innerHTML =
                    '<p style="color:red">❌ Geolocation not supported by your browser.</p>';
                return;
            }
            navigator.geolocation.getCurrentPosition(
                function(pos) {
                    var lat = pos.coords.latitude;
                    var lon = pos.coords.longitude;
                    window.top.location.href =
                        window.top.location.pathname + "?lat=" + lat + "&lon=" + lon;
                },
                function(err) {
                    var msgs = {
                        1: "❌ Permission denied. Please enter coordinates manually below.",
                        2: "❌ Location unavailable. Try manual entry below.",
                        3: "❌ Timed out. Try manual entry below."
                    };
                    alert(msgs[err.code] || "❌ Unknown error.");
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        })();
        </script>
        """, height=0)
        st.info("⏳ Waiting for browser location permission…")

    st.markdown("---")
    st.markdown("**Or enter coordinates manually:**")

    col1, col2 = st.columns(2)
    with col1:
        lat_input = st.text_input("Latitude", placeholder="e.g. 28.6139")
    with col2:
        lon_input = st.text_input("Longitude", placeholder="e.g. 77.2090")

    if st.button("Submit Location"):
        try:
            lat_parsed = float(lat_input.strip())
            lon_parsed = float(lon_input.strip())
            if lat_parsed == 0.0 and lon_parsed == 0.0:
                st.error("⚠️ 0.0, 0.0 is not a valid location. Please enter your actual coordinates.")
            else:
                st.query_params["lat"] = str(lat_parsed)
                st.query_params["lon"] = str(lon_parsed)
                st.rerun()
        except ValueError:
            st.error("⚠️ Invalid input. Please enter valid numbers for latitude and longitude.")

    st.stop()


# ── Main dashboard ───────────────────────────────────────────────────────────
location_name = get_location_name(lat, lon)
if "Error" in location_name or location_name == "Unknown Location":
    location_name = f"{lat:.4f}, {lon:.4f}"

st.markdown(f"### 📍 Location: `{location_name}`")

# Add a reset button so user can change location
if st.button("🔄 Change Location"):
    st.query_params.clear()
    st.rerun()

# Seasonal alerts
today = date.today()
if today.month == 11:
    st.warning("🎆 Diwali season — pollution may spike due to fireworks.")
elif today.month in [10, 11] and "Punjab" in location_name:
    st.warning("🌾 Crop burning season — air quality may be poor.")

# Fetch data
weather = get_forecast_by_coords(lat, lon)
aqi     = get_aqi_by_coords(lat, lon)

# Weather error guard
if "error" in weather:
    st.error(f"❌ Weather API error: {weather['error']}")
    if "401" in weather["error"] or "Unauthorized" in weather["error"]:
        st.warning(
            "💡 **Tips to fix this:**\n"
            "1. Check that `OPENWEATHER_API_KEY` is set in `.env` or Streamlit Secrets.\n"
            "2. New keys can take 2–3 hours to activate.\n"
            "3. On Streamlit Community Cloud, add the key under **App Settings → Secrets**."
        )
    st.stop()

# AQI error (non-fatal — show warning but continue)
if "error" in aqi:
    st.warning(f"⚠️ AQI fetch error: {aqi['error']}")

# ── Current Weather ──────────────────────────────────────────────────────────
st.subheader("🌤 Current Weather")
current = weather["list"][0]

c1, c2, c3, c4 = st.columns(4)
c1.metric("🌡 Temperature",  f"{current['main']['temp']} °C")
c2.metric("💧 Humidity",     f"{current['main']['humidity']} %")
c3.metric("🌬 Wind Speed",   f"{current['wind']['speed']} m/s")
c4.metric("🌥 Condition",    current["weather"][0]["description"].title())

if current["main"]["humidity"] > 80:
    st.info("💧 High humidity — may promote fungal infections. Keep indoors ventilated.")
if current["main"]["temp"] >= 35:
    st.warning("☀️ Very hot outside — stay hydrated and avoid peak sun hours.")

# ── PM2.5 / AQI ─────────────────────────────────────────────────────────────
if "pm25" in aqi:
    st.subheader("🏭 PM2.5 Air Quality")
    pm25      = aqi["pm25"]
    aqi_index = convert_pm25_to_aqi(pm25)

    if aqi_index is not None:
        if aqi_index <= 50:
            status = "✅ Good — Clean air"
            color  = "green"
        elif aqi_index <= 100:
            status = "😐 Moderate — Acceptable"
            color  = "yellow"
        elif aqi_index <= 150:
            status = "⚠️ Unhealthy for sensitive groups"
            color  = "orange"
        elif aqi_index <= 200:
            status = "😷 Unhealthy — Limit outdoor time"
            color  = "red"
        elif aqi_index <= 300:
            status = "☠️ Very Unhealthy — Avoid going out"
            color  = "purple"
        else:
            status = "☠️ Hazardous — Stay indoors!"
            color  = "maroon"
    else:
        status = "Unknown"
        color  = "grey"

    a1, a2 = st.columns(2)
    a1.metric(f"PM2.5 ({aqi['location']})", f"{pm25} {aqi['unit']}")
    a2.metric("🔢 AQI Index", f"{aqi_index if aqi_index else 'N/A'}")

    st.markdown(f"**Status:** :{color}[{status}]")
    st.caption(f"📅 Last updated: {aqi['last_updated']}")
    st.caption("📡 Source: OpenWeatherMap Air Pollution API")

# ── 5-Day Forecast Chart ─────────────────────────────────────────────────────
st.subheader("📅 5-Day Weather Forecast")
daily_data = {}
for entry in weather["list"]:
    day  = entry["dt_txt"].split(" ")[0]
    temp = entry["main"]["temp"]
    rain = entry.get("rain", {}).get("3h", 0)
    daily_data.setdefault(day, {"temps": [], "rain": []})
    daily_data[day]["temps"].append(temp)
    daily_data[day]["rain"].append(rain)

df_forecast = pd.DataFrame({
    "Day":      list(daily_data.keys())[:5],
    "Temp °C":  [sum(v["temps"]) / len(v["temps"]) for v in list(daily_data.values())[:5]],
    "Rain (mm)":[sum(v["rain"])                     for v in list(daily_data.values())[:5]],
}).set_index("Day")

clean = df_forecast.replace([float("inf"), float("-inf")], pd.NA).dropna()
if not clean.empty:
    st.line_chart(clean)
else:
    st.warning("📉 No valid forecast data to plot.")

# ── Log PM2.5 for ML ─────────────────────────────────────────────────────────
if "pm25" in aqi and "raw_timestamp" in aqi:
    log_pm25(aqi["pm25"], aqi["raw_timestamp"])

# ── PM2.5 12-Hour Prediction ─────────────────────────────────────────────────
st.subheader("🔮 PM2.5 Prediction — Next 12 Hours")
try:
    forecast_df = train_and_predict_from_csv("aqi_log.csv", hours_to_predict=12)
    if not forecast_df.empty:
        st.line_chart(forecast_df.set_index("datetime"))
    else:
        st.warning("📉 Not enough logged data yet. Reload the app a few more times to build history.")
except Exception as e:
    st.warning(f"Prediction unavailable: {e}")

# ── Past PM2.5 Trend ─────────────────────────────────────────────────────────
st.subheader("📊 PM2.5 Trend — Past 7 Days")
try:
    df_trend = pd.read_csv("aqi_log.csv", parse_dates=["date_utc"])
    df_trend = df_trend.sort_values("date_utc")
    if df_trend["date_utc"].dt.tz is None:
        df_trend["date_utc"] = df_trend["date_utc"].dt.tz_localize("UTC")
    last_week = datetime.now(timezone.utc) - timedelta(days=7)
    df_trend  = df_trend[df_trend["date_utc"] >= last_week]
    if not df_trend.empty:
        st.line_chart(df_trend.set_index("date_utc")["pm25"])
    else:
        st.info("No readings in the past 7 days yet.")
except Exception as e:
    st.warning(f"Trend chart not available: {e}")

# ── Map with custom pin ───────────────────────────────────────────────────────
st.subheader("🗺 Your Location on Map")

m = folium.Map(location=[lat, lon], zoom_start=13)

# Custom red pin icon
pin_icon = folium.Icon(
    color="red",
    icon="map-marker",
    prefix="fa",
)

folium.Marker(
    location=[lat, lon],
    tooltip=f"📍 {location_name}",
    popup=folium.Popup(
        f"<b>{location_name}</b><br>Lat: {lat:.4f}<br>Lon: {lon:.4f}",
        max_width=200
    ),
    icon=pin_icon,
).add_to(m)

# Accuracy circle around pin
folium.Circle(
    location=[lat, lon],
    radius=500,
    color="#1f77b4",
    fill=True,
    fill_opacity=0.15,
    tooltip="~500m radius",
).add_to(m)

st_folium(m, height=450, use_container_width=True, key="map_view")