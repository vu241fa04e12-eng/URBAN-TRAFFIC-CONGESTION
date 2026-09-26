import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.metrics import classification_report, r2_score
from sklearn.model_selection import train_test_split

print("Generating 6,144-row traffic telemetry dataset...")
np.random.seed(42)

junctions = [
    {
        "id": "J-01",
        "name": "Metro Central Interchange",
        "lanes": 8,
        "base_cap": 3600,
        "free_flow": 90,
        "type": "Highway",
    },
    {
        "id": "J-02",
        "name": "Westside Arterial Crossing",
        "lanes": 6,
        "base_cap": 2400,
        "free_flow": 60,
        "type": "Arterial",
    },
    {
        "id": "J-03",
        "name": "Financial Tech Corridor",
        "lanes": 4,
        "base_cap": 1600,
        "free_flow": 50,
        "type": "Downtown",
    },
    {
        "id": "J-04",
        "name": "Harbor Tunnel Approach",
        "lanes": 4,
        "base_cap": 1800,
        "free_flow": 70,
        "type": "Tunnel",
    },
    {
        "id": "J-05",
        "name": "North Ring Expressway Exit 4",
        "lanes": 6,
        "base_cap": 2700,
        "free_flow": 80,
        "type": "Highway",
    },
    {
        "id": "J-06",
        "name": "University District Boulevard",
        "lanes": 4,
        "base_cap": 1500,
        "free_flow": 45,
        "type": "Downtown",
    },
    {
        "id": "J-07",
        "name": "Industrial Logistics Beltway",
        "lanes": 6,
        "base_cap": 2600,
        "free_flow": 75,
        "type": "Beltway",
    },
    {
        "id": "J-08",
        "name": "South Bay Causeway Bridge",
        "lanes": 4,
        "base_cap": 1900,
        "free_flow": 65,
        "type": "Bridge",
    },
]

days = 32
hours = 24
records = []

for d in range(days):
  is_weekend = 1 if (d % 7) in [5, 6] else 0
  for h in range(hours):
    for j in junctions:
      rush_mult = 1.0
      if not is_weekend:
        if 7 <= h <= 9:
          rush_mult = 2.1
        elif 16 <= h <= 19:
          rush_mult = 2.3
        elif 11 <= h <= 14:
          rush_mult = 1.4
        elif h <= 5:
          rush_mult = 0.35
      else:
        if 12 <= h <= 20:
          rush_mult = 1.3
        elif h <= 6:
          rush_mult = 0.3

      weather = np.random.choice(
          ["Clear", "Cloudy", "Rain", "Fog"], p=[0.60, 0.25, 0.12, 0.03]
      )
      weather_drag = {
          "Clear": 1.0,
          "Cloudy": 0.96,
          "Rain": 0.78,
          "Fog": 0.70,
      }[weather]
      incident = 1 if np.random.rand() < 0.035 else 0

      target_vol = int(
          j["base_cap"] * 0.45 * rush_mult * np.random.uniform(0.85, 1.15)
      )
      if incident:
        target_vol = int(target_vol * 1.15)
      volume = max(100, min(j["base_cap"] * 1.35, target_vol))

      vol_cap_ratio = volume / j["base_cap"]
      raw_speed = (
          j["free_flow"] * (1 - 0.5 * (vol_cap_ratio**2.2)) * weather_drag
      )
      if incident:
        raw_speed -= np.random.uniform(15, 25)
      speed = max(8.0, min(j["free_flow"], raw_speed + np.random.normal(0, 2.5)))

      tti = j["free_flow"] / max(5.0, speed)
      occ = min(
          98.0,
          max(
              5.0,
              (vol_cap_ratio * 65.0) + (1.0 - speed / j["free_flow"]) * 30.0,
          ),
      )

      if speed < 22 or tti > 2.2:
        cong = "Severe"
      elif speed < 38 or tti > 1.6:
        cong = "High"
      elif speed < 52 or tti > 1.2:
        cong = "Moderate"
      else:
        cong = "Low"

      records.append({
          "junction_id": j["id"],
          "junction_name": j["name"],
          "road_type": j["type"],
          "lanes": j["lanes"],
          "hour": h,
          "is_weekend": is_weekend,
          "is_rush_hour": (
              1 if (7 <= h <= 9 or 16 <= h <= 19) and not is_weekend else 0
          ),
          "weather": weather,
          "incident_reported": incident,
          "vehicle_volume": volume,
          "free_flow_speed_kmh": j["free_flow"],
          "average_speed_kmh": round(speed, 1),
          "travel_time_index": round(tti, 2),
          "occupancy_pct": round(occ, 1),
          "congestion_level": cong,
      })

df = pd.DataFrame(records)
os.makedirs("data", exist_ok=True)
df.to_csv("data/urban_traffic_dataset_6144_rows.csv", index=False)
print(f"Generated {len(df):,} rows -> data/urban_traffic_dataset_6144_rows.csv")

df["sin_hour"] = np.sin(2 * np.pi * df["hour"] / 24)
df["cos_hour"] = np.cos(2 * np.pi * df["hour"] / 24)

df_encoded = pd.get_dummies(
    df, columns=["road_type", "weather"], drop_first=True
)
features = [
    c
    for c in df_encoded.columns
    if c
    not in [
        "junction_id",
        "junction_name",
        "hour",
        "congestion_level",
        "average_speed_kmh",
        "travel_time_index",
    ]
]

X = df_encoded[features]
y_speed = df_encoded["average_speed_kmh"]
y_cong = df_encoded["congestion_level"]

X_train, X_test, y_speed_train, y_speed_test, y_cong_train, y_cong_test = (
    train_test_split(
        X, y_speed, y_cong, test_size=0.20, random_state=42, stratify=y_cong
    )
)

print("Training Random Forest Speed Regressor...")
reg = RandomForestRegressor(
    n_estimators=100, max_depth=12, random_state=42, n_jobs=-1
)
reg.fit(X_train, y_speed_train)
speed_pred = reg.predict(X_test)
print(f"-> Speed R2 Score: {r2_score(y_speed_test, speed_pred):.3f}")

print("\nTraining Random Forest Congestion Classifier...")
clf = RandomForestClassifier(
    n_estimators=100, max_depth=12, random_state=42, n_jobs=-1
)
clf.fit(X_train, y_cong_train)
cong_pred = clf.predict(X_test)
print(classification_report(y_cong_test, cong_pred))

os.makedirs("models", exist_ok=True)
joblib.dump(reg, "models/speed_regressor.pkl")
joblib.dump(clf, "models/congestion_classifier.pkl")
joblib.dump(features, "models/feature_names.pkl")
print("Saved trained models into 'models/' folder successfully!")