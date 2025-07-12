from datetime import datetime
import requests
import os
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("OPENWEATHER_API_KEY")

def get_aqi_by_coords(lat, lon):
    try:
        url = "http://api.openweathermap.org/data/2.5/air_pollution"
        params = {
            "lat": lat,
            "lon": lon,
            "appid": API_KEY
        }
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()

        if "list" not in data or not data["list"]:
            return {"error": "No AQI data available."}

        result = data["list"][0]
        pm25 = result["components"]["pm2_5"]
        timestamp = datetime.utcfromtimestamp(result["dt"]).strftime("%Y-%m-%d %H:%M:%S UTC")

        return {
            "location": f"{lat:.2f}, {lon:.2f}",
            "pm25": pm25,
            "unit": "µg/m³",
            "last_updated": timestamp,
            "raw_timestamp": result["dt"]
        }

    except requests.exceptions.HTTPError as e:
        return {"error": f"{e.response.status_code} - {e.response.text}"}
    except Exception as e:
        return {"error": str(e)}
