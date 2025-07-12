import streamlit as st
import pandas as pd
import folium
from streamlit_folium import st_folium
import streamlit.components.v1 as components
from datetime import datetime, timedelta, timezone

from utils.weather_fetcher import get_forecast_by_coords
from utils.aqi_fetcher import get_aqi_by_coords
from utils.reverse_geocoder import get_location_name
from utils.pm25_predictor import train_and_predict_from_csv
from utils.logger import log_pm25

# Location detection by Coordinates
def get_coords():
    query = st.query_params
    if "lat" in query and "lon" in query:
        return float(query["lat"][0]), float(query["lon"][0])

    if "location_requested" not in st.session_state:
        components.html("""
        <script>
        navigator.geolocation.getCurrentPosition(
            function(pos) {
                const lat = pos.coords.latitude;
                const lon = pos.coords.longitude;
                window.location.search = `?lat=${lat}&lon=${lon}`;
            },
            function(err) {
                document.body.innerHTML += "<p>⚠️ Location denied: " + err.message + "</p>";
            }
        );
        </script>
        """, height=0)
        st.session_state.location_requested = True

    return None, None

# PM25 To AQI Conveter
def convert_pm25_to_aqi(pm25):
    breakpoints = [
        (0.0, 12.0, 0, 50),
        (12.1, 35.4, 51, 100),
        (35.5, 55.4, 101, 150),
        (55.5, 150.4, 151, 200),
        (150.5, 250.4, 201, 300),
        (250.5, 500.0, 301, 500)
    ]
    for c_low, c_high, aqi_low, aqi_high in breakpoints:
        if c_low <= pm25 <= c_high:
            return round(((aqi_high - aqi_low) / (c_high - c_low)) * (pm25 - c_low) + aqi_low)
    return None

# Body
st.set_page_config(page_title="AirGuardian+", layout="wide")
st.title("AirGuardian — Localized Pollution & Weather Advisor")

# Enter Coordinates
lat, lon = get_coords()

if not lat or not lon:
    st.warning("📍 Location access blocked or failed. Please enter manually:")
    col1, col2 = st.columns(2)
    with col1:
        lat = st.number_input("Latitude", value=None, format="%.6f", placeholder="Enter latitude")
    with col2:
        lon = st.number_input("Longitude", value=None, format="%.6f", placeholder="Enter longitude")

    if lat is None or lon is None:
        st.stop()

    if st.button("Submit Location"):
        st.query_params["lat"] = str(lat)
        st.query_params["lon"] = str(lon)
        st.rerun()

# Showing Data Based on Coordinates or locations
if lat and lon:
    #location Name
    location_name = get_location_name(lat, lon)
    st.markdown(f"### 📍 Location: `{location_name}`")
    
    #Current Weather, Temperature, humidity, wind speed, Condition
    weather = get_forecast_by_coords(lat, lon)
    aqi = get_aqi_by_coords(lat, lon)

    if "error" in weather:
        st.error(f"❌ Weather API error: {weather['error']}")
        st.stop()

    if "error" in aqi:
        st.warning(f"⚠️ AQI error: {aqi['error']}")

    st.subheader("🌤 Current Weather")
    current = weather["list"][0]
    st.metric("🌡 Temperature", f"{current['main']['temp']} °C")
    st.metric("💧 Humidity", f"{current['main']['humidity']} %")
    st.metric("🌬 Wind", f"{current['wind']['speed']} m/s")
    st.metric("🌥 Condition", current['weather'][0]['description'].title())

    if current["main"]["humidity"] > 80:
        st.info("💧 High humidity — may cause fungal infections.")
    if current["main"]["temp"] >= 35:
        st.warning("☀️ Very hot — stay hydrated.")

    # AQI
    if "pm25" in aqi:
        st.subheader("🏭 PM2.5 Air Quality")
        pm25 = aqi["pm25"]
        aqi_index = convert_pm25_to_aqi(pm25)

        if aqi_index is not None:
            if aqi_index <= 50:
                status = "✅ Good — Clean air"
            elif aqi_index <= 100:
                status = "😐 Moderate — Acceptable"
            elif aqi_index <= 150:
                status = "⚠️ Unhealthy for sensitive groups"
            elif aqi_index <= 200:
                status = "😷 Unhealthy — Limit outdoor time"
            elif aqi_index <= 300:
                status = "☠️ Very Unhealthy — Avoid going out"
            else:
                status = "☠️ Hazardous — Stay indoors!"
        else:
            status = "Unknown"

        st.metric(f"{aqi['location']} - PM2.5", f"{pm25} {aqi['unit']}")
        st.metric("🔢 AQI Index", f"{aqi_index}")
        st.markdown(f"**Status:** {status}")
        st.caption(f"📅 Last updated: {aqi['last_updated']}")

    # Next 5 days Forecast
    st.subheader("📅 5-Day Forecast")
    daily_data = {}
    for entry in weather["list"]:
        date = entry["dt_txt"].split(" ")[0]
        temp = entry["main"]["temp"]
        rain = entry.get("rain", {}).get("3h", 0)
        daily_data.setdefault(date, {"temps": [], "rain": []})
        daily_data[date]["temps"].append(temp)
        daily_data[date]["rain"].append(rain)

    df = pd.DataFrame({
        "Day": list(daily_data.keys())[:5],
        "Temp °C": [sum(v["temps"]) / len(v["temps"]) for v in list(daily_data.values())[:5]],
        "Rain (mm)": [sum(v["rain"]) for v in list(daily_data.values())[:5]]
    }).set_index("Day")

    if not df.replace([float("inf"), float("-inf")], pd.NA).dropna().empty:
        st.line_chart(df)
    else:
        st.warning("📉 No valid forecast data to plot.")

    # --- PM2.5 Logging for ML
    if "pm25" in aqi and "raw_timestamp" in aqi:
        log_pm25(aqi["pm25"], aqi["raw_timestamp"])

    # Next 12 hours Prediction
    st.subheader("🔮 PM2.5 Prediction (Next 12 hrs) — From Logged OpenWeather Data")
    try:
        forecast_df = train_and_predict_from_csv("aqi_log.csv", hours_to_predict=12)
        if not forecast_df.empty:
            st.line_chart(forecast_df.set_index("datetime"))
        else:
            st.warning("📉 Not enough data to predict yet. Please reload the app a few more times.")
    except Exception as e:
        st.warning(f"Prediction unavailable: {e}")

    # Past Readings Trends
    st.subheader("📊 PM2.5 Trend (Past Readings)")
    try:
        df_trend = pd.read_csv("aqi_log.csv", parse_dates=["date_utc"])
        df_trend = df_trend.sort_values("date_utc")
        last_week = datetime.now(timezone.utc) - timedelta(days=7)
        df_trend = df_trend[df_trend["date_utc"] >= last_week]
        st.line_chart(df_trend.set_index("date_utc")["pm25"])
    except Exception as e:
        st.warning(f"Trend chart not available: {e}")

    # Location on map by coordinates
    st.subheader("🗺 Your Location on Map")
    m = folium.Map(location=[lat, lon], zoom_start=8)
    folium.Marker([lat, lon], tooltip="📍 You are here").add_to(m)
    st_folium(m, height=400, key="map_view")

# --- Download CSV Button
st.subheader("⬇️ Download PM2.5 Log Data")
try:
    with open("aqi_log.csv", "rb") as f:
        st.download_button(
            label="Download aqi_log.csv",
            data=f,
            file_name="aqi_log.csv",
            mime="text/csv"
        )
except FileNotFoundError:
    st.info("📄 No log file found yet. Reload the app to generate data.")
