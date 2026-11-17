# 🌫️ AirGuardian+ — Localized Atmospheric & Environmental Intelligence

A real-time air quality, meteorological monitoring, and predictive intelligence web platform. AirGuardian+ detects your location, fetches live multi-pollutant data, predicts PM2.5 concentrations over the next 12 hours using **Machine Learning (Linear Regression with diurnal atmospheric modeling)**, and visualizes local exposure on a geospatial map.

Available as both a **modern React single-page application** featuring an editorial light theme with an earthy, non-blue color palette, and a **Python Streamlit dashboard**.

---

## 🎨 Design & Palette (Non-Blue Light Theme)

Designed with an organic, climate-journalism aesthetic that intentionally moves away from standard corporate blue-and-white layouts:

- **Canvas & Background**: Warm Alabaster (`#F7F5F0`) & Soft Oat (`#F0ECE4`)
- **Card Surfaces**: Warm Ivory Paper (`#FFFDF9`) with delicate sandstone borders (`#E6E0D4`)
- **Primary Accent**: Botanical Forest Pine (`#1C422F` / `#27573E`) symbolizing clean air and nature
- **Secondary Accent**: Warm Terracotta & Clay (`#B8532C` / `#D06941`) for key metrics, solar conditions, and warnings
- **Tiers & Highlights**: Warm Ochre & Amber (`#B87B28` / `#FEF8EE`) for moderate AQI levels
- **Typography**: Editorial serif headings (*Fraunces*) paired with clean UI sans (*Plus Jakarta Sans*) and data readouts (*JetBrains Mono*)

---

## ✨ Features

- 📍 **Intelligent Geolocation & Presets**:
  - 1-Click GPS auto-detection with high-accuracy browser geolocation (`navigator.geolocation`).
  - Manual latitude/longitude coordinate inputs with numerical range validation.
  - Quick preset city selector (*New Delhi, Sonipat DCRUST, Amritsar Punjab, Mumbai, Bengaluru, London, New York, Tokyo*).
  - Reverse geocoding of coordinates into human-readable city names via OpenCage & OpenStreetMap.
  - Automatic URL query parameter synchronization (`?lat=...&lon=...`).

- 🏭 **US EPA AQI & Real-Time PM2.5 Gauge**:
  - Custom radial arc gauge mapping AQI from 0 to 500 across EPA breakpoints (*Good, Moderate, Sensitive, Unhealthy, Very Unhealthy, Hazardous*).
  - Live PM2.5 reading (`µg/m³`) with dynamic **WHO Guideline comparison** against the 15 µg/m³ 24-hour limit.
  - Actionable health guidance cards: *Outdoor Exercise*, *Home Ventilation*, *N95 Mask Advice*, and *Sensitive Groups*.

- 🔬 **Comprehensive Pollutants Matrix**:
  - Live concentration meters for **PM2.5, PM10, Nitrogen Dioxide (NO₂), Ground Ozone (O₃), Sulfur Dioxide (SO₂), and Carbon Monoxide (CO)** with threshold safety indicators.

- 🌤 **Current Weather & Atmospheric Parameters**:
  - Ambient Temperature (°C), "Feels like" index, Relative Humidity (%), Wind Speed & Heading, Atmospheric Pressure (hPa), and Visibility (km).

- 📅 **5-Day Interactive Atmospheric Forecast**:
  - Interactive SVG chart toggling between **Temperature curve (°C)** and **Precipitation volume (mm)**.
  - Day-by-day forecast cards with high/low temperatures and weather conditions.

- 🔮 **12-Hour PM2.5 Predictive AI Model**:
  - Machine Learning implementation of **Ordinary Least Squares (OLS) Linear Regression** combined with diurnal thermal boundary-layer inversion dynamics.
  - Displays shaded **95% confidence bands**, trend projection (*Rising*, *Clearing*, or *Steady*), and expected peak pollution hour.

- 📊 **Historical Sensor Trend & Local Logging**:
  - Seeded with verified historical pollution records (`aqi_log.csv`).
  - Filters for *Past 24 Hours*, *Past 7 Days*, and *All History* with calculated period average, peak, and cleanest readings.
  - Automatically records and persists fresh readings to browser storage (`localStorage`).

- 🗺 **Geospatial Map View**:
  - Interactive Leaflet map powered by **CARTO Positron** basemap tiles with authenticated API key support.
  - Automatic fallback to OpenStreetMap street tiles to ensure coverage across all rural and urban regions.
  - Custom terracotta marker pin with coordinate popup and a **500m local sensor radius ring**.

- ⚠️ **Seasonal & Regional Environmental Advisories**:
  - Dynamic **Diwali fireworks pollution advisory** during November.
  - **Agricultural stubble burning smog advisory** for North India (Oct–Nov).
  - Extreme ambient heat alert (≥ 35°C) and elevated humidity moisture advisory (> 80%).

---

## 🏗 Project Structure

```text
airguardianplus/
├── package.json              # Root scripts (npm run dev, npm run build)
├── requirements.txt          # Python dependencies
├── aqi_log.csv               # Historical PM2.5 logged readings
├── app.py                    # Streamlit dashboard
├── .env                      # Python environment variables
├── utils/                    # Python utility modules
│   ├── aqi_fetcher.py        # OpenWeatherMap Air Pollution API client
│   ├── weather_fetcher.py    # OpenWeatherMap 5-Day Forecast API client
│   ├── pm25_predictor.py     # Scikit-learn Linear Regression model
│   ├── logger.py             # Appends PM2.5 readings to aqi_log.csv
│   └── reverse_geocoder.py   # OpenCage reverse geocoder
│
└── frontend/                 # React 18 + Vite Web Application
    ├── package.json          # Frontend dependencies & scripts
    ├── vite.config.js        # Vite configuration (port 3000)
    ├── tailwind.config.js    # Custom earthy light theme palette
    ├── index.html            # Entry HTML with Leaflet & Google Fonts
    ├── .env                  # Frontend environment variables (VITE_*)
    └── src/
        ├── main.jsx          # React DOM entry point
        ├── index.css         # Tailwind & custom scrollbar styles
        ├── App.jsx           # Main application state & layout coordinator
        ├── components/
        │   ├── Header.jsx           # Brand header, location trigger, time
        │   ├── LocationModal.jsx    # GPS auto-detect, manual coords, presets
        │   ├── AdvisoryBanner.jsx   # Diwali, crop burning, heat & humidity alerts
        │   ├── AqiHeroCard.jsx      # EPA AQI arc gauge & WHO health advice
        │   ├── PollutantsGrid.jsx   # PM2.5, PM10, NO2, O3, SO2, CO metrics
        │   ├── WeatherCard.jsx      # Current atmospheric readings
        │   ├── ForecastSection.jsx  # 5-day temp & rain interactive chart
        │   ├── PredictionSection.jsx# 12-hour ML regression chart & peak hour
        │   ├── HistorySection.jsx   # Past 7-day trend & local logging
        │   ├── MapView.jsx          # Leaflet map with CARTO Positron tiles
        │   └── Footer.jsx           # Attribution & API source credits
        ├── services/
        │   └── api.js               # OpenWeather, OpenCage, EPA AQI calculations
        └── utils/
            ├── mlPredictor.js       # OLS Linear Regression & diurnal atmospheric math
            └── historyLogger.js     # Persistent localStorage logging
```

---

## 🔑 Environment Variables Setup

Create or update your `.env` and `frontend/.env` files with your API keys:

### 1. `frontend/.env` (For React)
```env
VITE_OPENWEATHER_API_KEY=your_openweather_api_key
VITE_GEOCODER_API_KEY=your_opencage_api_key
VITE_OPENAQ_API_KEY=your_openaq_api_key
VITE_CARTO_API_KEY=your_carto_basemaps_api_key
```

### 2. `.env` (For Python / Streamlit)
```env
OPENWEATHER_API_KEY=your_openweather_api_key
GEOCODER_API_KEY=your_opencage_api_key
OPENAQ_API_KEY=your_openaq_api_key
CARTO_API_KEY=your_carto_basemaps_api_key
```

> **API Key Providers**:
> - OpenWeatherMap (Weather & Air Pollution): [openweathermap.org/api](https://openweathermap.org/api)
> - OpenCage (Reverse Geocoding): [opencagedata.com](https://opencagedata.com/)
> - CARTO (Basemap Tiles): [carto.com/basemaps/apikey](https://carto.com/basemaps/apikey) *(use query parameter `?key=YOUR_KEY`)*

---

## 🚀 Running the Project

### Option A: Modern React App (Recommended)

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Start the development server**:
   ```bash
   # From root:
   npm run dev

   # Or inside frontend/:
   cd frontend
   npm run dev
   ```

3. **Open in browser**:
   👉 **http://localhost:3000**

---

### Option B: Streamlit Python App

1. **Activate virtual environment & install requirements**:
   ```bash
   # Windows:
   .venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Run Streamlit**:
   ```bash
   streamlit run app.py
   ```

3. **Open in browser**:
   👉 **http://localhost:8501**

---

## 📦 Production Build

To build the React application for production deployment (e.g. Vercel, Netlify, Cloudflare Pages):

```bash
npm run build
```

The optimized static assets will be generated in `frontend/dist/`.

---

## 👨‍💻 Author & Credits

Built by **Mahak Singh** | B.Tech CSE | DCRUST '27

- **Data Sources**: [OpenWeatherMap API](https://openweathermap.org/), [OpenCage Geocoding](https://opencagedata.com/), [OpenStreetMap](https://www.openstreetmap.org/)
- **Map Tiles**: [CARTO Positron](https://carto.com/basemaps/)
- **Standard**: US EPA Air Quality Index (AQI) Breakpoints & WHO 2021 Global Air Quality Guidelines
