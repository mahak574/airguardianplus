import pandas as pd
from sklearn.linear_model import LinearRegression
import numpy as np

def train_and_predict_from_csv(csv_file="aqi_log.csv", hours_to_predict=12):
    df = pd.read_csv(csv_file, parse_dates=["date_utc"])
    df = df.sort_values("date_utc")
    df = df.dropna()

    df["timestamp"] = (df["date_utc"] - df["date_utc"].min()).dt.total_seconds() / 3600.0
    X = df["timestamp"].values.reshape(-1, 1)
    y = df["pm25"].values

    model = LinearRegression()
    model.fit(X, y)

    last_time = df["timestamp"].max()
    future_times = np.array([last_time + i for i in range(1, hours_to_predict + 1)]).reshape(-1, 1)
    preds = model.predict(future_times)

    future_dates = [df["date_utc"].max() + pd.Timedelta(hours=i) for i in range(1, hours_to_predict + 1)]
    forecast_df = pd.DataFrame({"datetime": future_dates, "predicted_pm25": preds})
    return forecast_df
