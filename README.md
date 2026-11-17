# AirGuardian+ 🌫️

A real-time localized atmospheric & environmental intelligence dashboard converted to **React** with a clean, bespoke **light theme** (featuring warm alabaster, botanical forest pine, and terracotta/amber accents — intentionally steering away from generic blue-and-white palettes).

It detects your location, fetches live PM2.5 and pollutant data, predicts future air quality using Machine Learning (Linear Regression), and visualizes everything on an interactive geospatial map.

---

## 🎨 Design & Aesthetic
- **Theme**: Warm Naturalist Light Theme
- **Color Palette**:
  - **Canvas & Cards**: Warm Alabaster (`#F7F5F0`), Ivory Paper (`#FFFDF9`), Sandstone Border (`#E6E0D4`)
  - **Primary Botanical Pine**: `#1C422F` / `#27573E` (clean air, foliage, nature)
  - **Warm Terracotta & Clay**: `#B8532C` / `#D06941` (heat, key metrics, solar indicators)
  - **Warm Ochre & Amber**: `#B87B28` / `#FEF8EE` (moderate levels, warnings)
  - **Deep Charcoal Mocha**: `#232826` / `#4D5451` (editorial-grade readability)
- **Zero generic white-and-blue**: Designed for an organic, tactile, climate-journalism aesthetic.

---

## 🚀 Key Features

1. **📍 Intelligent Location Detection**:
   - 1-Click GPS auto-detection with high-accuracy browser geolocation.
   - Manual latitude and longitude coordinate entry with validation.
   - Fast preset cities (New Delhi, Amritsar Punjab, Sonipat DCRUST, Mumbai, Bengaluru, London, New York, Tokyo).
   - Reverse geocoding of coordinates into human-readable city names (OpenCage & OpenStreetMap).

2. **🏭 EPA AQI & Real-Time PM2.5 Gauge**:
   - Beautiful custom radial arc gauge mapping 0–500 AQI.
   - Real-time PM2.5 concentration with WHO safety benchmark comparisons.
   - Actionable health recommendations for outdoor exercise, home ventilation, N95 masks, and sensitive groups.

3. **🔬 Multi-Pollutant Sensor Matrix**:
   - Live breakdown for PM2.5, PM10, Nitrogen Dioxide (NO₂), Ground Ozone (O₃), Sulfur Dioxide (SO₂), and Carbon Monoxide (CO) with safety limit indicators.

4. **🌤 Weather & Atmospheric Conditions**:
   - Live Temperature (°C), Feels-like, Humidity (%), Wind Speed & Direction, Barometric Pressure (hPa), and Visibility (km).

5. **📅 5-Day Interactive Atmospheric Forecast**:
   - Interactive SVG chart toggling between Temperature curve (°C) and Precipitation volume (mm).
   - 5 daily summary cards with weather condition descriptions.

6. **🔮 PM2.5 Predictive AI (Next 12 Hours)**:
   - Client-side Machine Learning port of Ordinary Least Squares (OLS) Linear Regression with diurnal boundary-layer inversion modeling.
   - Shaded 95% confidence bands and projected peak pollution hour.

7. **📊 7-Day & 24-Hour Historical Sensor Trend**:
   - Seeded with the project's real historical logs (`aqi_log.csv`).
   - Automatically records and persists every new reading in `localStorage`.

8. **🗺 Geospatial Leaflet Map**:
   - Interactive map rendered in light-theme CartoDB Positron tiles.
   - Custom terracotta pin marker at exact coordinates with 500m sensor radius circle.

9. **⚠️ Seasonal & Regional Environmental Advisories**:
   - Dynamic Diwali fireworks surge warning (November).
   - Crop residue & stubble burning alert (Oct-Nov for North Indian agricultural belt).
   - High heat warning (≥ 35°C) and high humidity fungal/moisture alert (> 80%).

---

## 💻 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons
- **Mapping**: Leaflet with CartoDB Positron
- **Forecasting / ML**: Ordinary Least Squares (OLS) Linear Regression
- **Data APIs**: OpenWeatherMap Air Pollution & 5-Day Forecast, OpenCage Geocoder

---

## 🛠 Setup & Running the React App

```bash
# 1. Install dependencies
cd frontend
npm install

# 2. Start the development server
npm run dev
```

The application will be live at:
👉 **http://localhost:3000**

---

Built by **Mahak Singh** | B.Tech CSE | DCRUST '27
