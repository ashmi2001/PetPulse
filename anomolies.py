import pandas as pd
from scipy.stats import zscore
from geopy.distance import geodesic
import matplotlib.pyplot as plt

# Load CSV
file_path = "GPS_Report.csv"  # Replace with your path
df = pd.read_csv(file_path)

# Convert timestamp to datetime and sort
df['timestamp'] = pd.to_datetime(df['timestamp'])
df = df.sort_values(by='timestamp')

# Detect location outliers using z-score
df['lat_zscore'] = zscore(df['latitude'])
df['lon_zscore'] = zscore(df['longitude'])
df['location_outlier'] = (df['lat_zscore'].abs() > 3) | (df['lon_zscore'].abs() > 3)

# Detect speed anomalies
df['prev_lat'] = df['latitude'].shift()
df['prev_lon'] = df['longitude'].shift()
df['prev_time'] = df['timestamp'].shift()
df['distance_km'] = df.apply(
    lambda row: geodesic((row['latitude'], row['longitude']), (row['prev_lat'], row['prev_lon'])).km
    if pd.notnull(row['prev_lat']) else 0, axis=1)
df['time_diff_sec'] = (df['timestamp'] - df['prev_time']).dt.total_seconds()
df['speed_kmh'] = df.apply(
    lambda row: (row['distance_km'] / (row['time_diff_sec'] / 3600)) if row['time_diff_sec'] > 0 else 0,
    axis=1)
df['speed_anomaly'] = df['speed_kmh'] > 150

# Combine anomalies
df['is_anomaly'] = df['location_outlier'] | df['speed_anomaly']

# Save anomalies to file
df[df['is_anomaly']].to_csv("anomaly_report.csv", index=False)
print("Anomalies saved to 'anomaly_report.csv'.")

# Plot anomalies on map
plt.figure(figsize=(10, 8))
normal = df[~df['is_anomaly']]
anomalies = df[df['is_anomaly']]

plt.scatter(normal['longitude'], normal['latitude'], c='blue', s=10, label='Normal')
plt.scatter(anomalies['longitude'], anomalies['latitude'], c='red', s=20, label='Anomaly')

plt.xlabel("Longitude")
plt.ylabel("Latitude")
plt.title("GPS Anomalies")
plt.legend()
plt.grid(True)
plt.tight_layout()
plt.show()
