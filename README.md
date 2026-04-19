# AirGuardian+ 🌫️

A real-time air quality and weather monitoring web app that detects your
location, fetches live PM2.5 pollution data, predicts future air quality
using Machine Learning, and visualizes everything on an interactive map.

## Features

- 📍 Auto-detects location via browser GPS
- 🏭 Real-time PM2.5 air quality from OpenWeatherMap API
- 🌤 Current weather — temperature, humidity, wind speed
- 📅 5-day weather forecast with charts
- 🔮 12-hour PM2.5 prediction using Linear Regression (scikit-learn)
- 📊 Past PM2.5 trend chart from logged readings
- 🗺 Interactive map showing your location (Folium)
- ⚠️ Health advisories based on AQI levels
- 🎆 Seasonal alerts for Diwali and crop burning season

## Tech Stack

- Python
- Streamlit
- scikit-learn (Linear Regression)
- Pandas & NumPy
- Folium + streamlit-folium
- OpenWeatherMap API
- python-dotenv

## Setup

### 1. Clone the repo
git clone https://github.com/mahak574/airguardianplus.git
cd airguardianplus

### 2. Install dependencies
pip install -r requirements.txt

### 3. Configure environment
cp .env.example .env

Add your API key in .env:
OPENWEATHER_API_KEY=your_api_key_here

Get a free API key at: https://openweathermap.org/api

### 4. Run the app
streamlit run app.py

App will open at http://localhost:8501

## Project Structure

airguardianplus/
├── app.py                  # Main Streamlit app
├── aqi_log.csv             # Logged PM2.5 readings for ML training
├── requirements.txt
├── .env.example
└── utils/
    ├── aqi_fetcher.py      # Fetches PM2.5 from OpenWeatherMap
    ├── weather_fetcher.py  # Fetches weather forecast
    ├── pm25_predictor.py   # Linear Regression ML model
    ├── logger.py           # Logs PM2.5 readings to CSV
    └── reverse_geocoder.py # Converts coordinates to location name

## Environment Variables

OPENWEATHER_API_KEY=your_key_here

## Live Demo

https://mahak574-airguardianplus.streamlit.app

---

Built by Mahak Singh | B.Tech CSE | DCRUST '27
