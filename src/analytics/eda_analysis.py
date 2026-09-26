import os
import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns

sns.set_theme(style="darkgrid")
df = pd.read_csv("data/urban_traffic_dataset_6144_rows.csv")

print("\n=== LEVEL 1: URBAN TRAFFIC ANALYTICS ===")
print(f"Total Telemetry Records: {len(df):,}")
print(f"Citywide Mean Speed:     {df['average_speed_kmh'].mean():.1f} km/h")
print(f"Mean Travel Time Index:  {df['travel_time_index'].mean():.2f}x")
print(
    "Congestion Rate:        "
    f" {(df['congestion_level'].isin(['High', 'Severe'])).mean()*100:.1f}%"
)

# Calculate Hotspot Score per Junction
df["hotspot_score"] = (
    df["travel_time_index"] * 40
    + df["occupancy_pct"] * 0.4
    + df["incident_reported"] * 20
)

hotspots = (
    df.groupby(["junction_id", "junction_name"])
    .agg(
        avg_hotspot_score=("hotspot_score", "mean"),
        avg_speed=("average_speed_kmh", "mean"),
        max_tti=("travel_time_index", "max"),
        severe_count=("congestion_level", lambda x: (x == "Severe").sum()),
    )
    .reset_index()
    .sort_values(by="avg_hotspot_score", ascending=False)
)

print("\nTop Identified Urban Hotspots:")
print(hotspots.to_string(index=False))

# Plot Diurnal Waveform Curve
hourly = (
    df.groupby("hour")
    .agg(volume=("vehicle_volume", "mean"), speed=("average_speed_kmh", "mean"))
    .reset_index()
)

os.makedirs("reports", exist_ok=True)
fig, ax1 = plt.subplots(figsize=(10, 5))
ax2 = ax1.twinx()

ax1.bar(
    hourly["hour"],
    hourly["volume"],
    color="skyblue",
    alpha=0.6,
    label="Volume (vph)",
)
ax2.plot(
    hourly["hour"],
    hourly["speed"],
    color="crimson",
    linewidth=2.5,
    marker="o",
    label="Speed (km/h)",
)
ax1.set_xlabel("Hour of Day (00:00 - 23:00)")
ax1.set_ylabel("Vehicle Volume (veh/hr)", color="steelblue")
ax2.set_ylabel("Average Speed (km/h)", color="crimson")
plt.title("Level 1 Analytics: 24-Hour Diurnal Traffic Waveform")
plt.tight_layout()
plt.savefig("reports/diurnal_traffic_waveform.png", dpi=200)
print("\nSaved chart to reports/diurnal_traffic_waveform.png")