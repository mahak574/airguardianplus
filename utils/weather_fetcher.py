import requests
from utils.keys_loader import get_api_key

def get_forecast_by_coords(lat, lon):
    try:
        api_key = get_api_key("OPENWEATHER_API_KEY")
        url = "https://api.openweathermap.org/data/2.5/forecast"
        params = {
            "lat": lat,
            "lon": lon,
            "appid": api_key,
            "units": "metric"
        }

        res = requests.get(url, params=params)
        res.raise_for_status()
        return res.json()
    except Exception as e:
        return {"error": str(e)}

