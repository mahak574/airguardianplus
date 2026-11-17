def log_pm25(pm25, timestamp, filename="aqi_log.csv"):
    from datetime import datetime, timezone
    import os
    import pandas as pd

    entry_time = datetime.fromtimestamp(timestamp, tz=timezone.utc)

    new_entry = pd.DataFrame([{
        "date_utc": entry_time,
        "pm25": pm25
    }])

    if os.path.exists(filename) and os.path.getsize(filename) > 0:
        try:
            df = pd.read_csv(filename, parse_dates=["date_utc"])

            if df["date_utc"].dt.tz is None:
                df["date_utc"] = df["date_utc"].dt.tz_localize("UTC")

            df = pd.concat([df, new_entry])
            df = df.drop_duplicates(subset=["date_utc"])
            df = df.sort_values("date_utc").tail(100)

        except Exception as e:
            print("⚠️ CSV corrupted, rewriting fresh:", e)
            df = new_entry
    else:
        df = new_entry

    df.to_csv(filename, index=False)
