import requests
import os
from dotenv import load_dotenv

load_dotenv()
OPENCAGE_API_KEY = os.getenv("GEOCODER_API_KEY")  # 🔑 Loaded from .env

def get_location_name(lat, lon):
    try:
        url = "https://api.opencagedata.com/geocode/v1/json"
        params = {
            "q": f"{lat},{lon}",
            "key": OPENCAGE_API_KEY,
            "language": "en",
            "pretty": 1,
            "no_annotations": 1
        }
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()

        if data["results"]:
            return data["results"][0]["formatted"]
        else:
            return "Unknown Location"
    except Exception as e:
        return f"Error fetching location: {e}"
