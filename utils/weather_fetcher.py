import requests
from dotenv import load_dotenv
import os

load_dotenv()
API_KEY = os.getenv("OPENWEATHER_API_KEY")  # ⬅️ Loaded from .env

def get_forecast_by_coords(lat, lon):
    try:
        url = "https://api.openweathermap.org/data/2.5/forecast"
        params = {
            "lat": lat,
            "lon": lon,
            "appid": API_KEY,
            "units": "metric"
        }

        res = requests.get(url, params=params)
        res.raise_for_status()
        return res.json()
    except Exception as e:
        return {"error": str(e)}
