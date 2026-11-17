import requests
from utils.keys_loader import get_api_key

def get_location_name(lat, lon):
    try:
        opencage_key = get_api_key("GEOCODER_API_KEY")
        url = "https://api.opencagedata.com/geocode/v1/json"
        params = {
            "q": f"{lat},{lon}",
            "key": opencage_key,
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
