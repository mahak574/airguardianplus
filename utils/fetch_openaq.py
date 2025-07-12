import requests
import pandas as pd
import os
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("OPENAQ_API_KEY")

def get_pm25_history(lat=28.6139, lon=77.2090, limit=100):
    try:
        url = "https://api.openaq.org/v2/measurements"
        headers = {
            "x-api-key": API_KEY
        }
        params = {
            "coordinates": f"{lat},{lon}",
            "radius": 50000,
            "parameter": "pm25",
            "limit": limit
            # 🚫 no sort, no page
        }

        res = requests.get(url, headers=headers, params=params)
        res.raise_for_status()

        data = res.json().get("results", [])
        if not data:
            return pd.DataFrame()

        df = pd.DataFrame(data)
        df["date_utc"] = pd.to_datetime(df["date"].apply(lambda d: d["utc"]))
        df = df.sort_values("date_utc")
        return df[["date_utc", "value"]].rename(columns={"value": "pm25"})

    except Exception as e:
        print(f"Error fetching PM2.5 data: {e}")
        return pd.DataFrame()
