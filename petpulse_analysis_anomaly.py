import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from geopy.distance import geodesic
from sklearn.ensemble import IsolationForest

# ===============================
# Load the GPS dataset
# ===============================
df = pd.read_csv('petpulse_gps_data.csv')  # Ensure this file is in the same folder

# Convert timestamp to datetime
df['timestamp'] = pd.to_datetime(df['timestamp'])

# Sort data by timestamp
df = df.sort_values('timestamp')

# ===============================
# Calculate distance between GPS points
# ===============================
distances = [0]
for i in range(1, len(df)):
    prev = (df.iloc[i-1]['latitude'], df.iloc[i-1]['longitude'])
    curr = (df.iloc[i]['latitude'], df.iloc[i]['longitude'])
    distances.append(geodesic(prev, curr).meters)

df['distance_m'] = distances
df['hour'] = df['timestamp'].dt.hour
df['day'] = df['timestamp'].dt.date

# ===============================
# Anomaly Detection using Isolation Forest
# ===============================
model = IsolationForest(contamination=0.05, random_state=42)
df['anomaly'] = model.fit_predict(df[['distance_m']])
df['anomaly'] = df['anomaly'].apply(lambda x: 'Anomaly' if x == -1 else 'Normal')

# ===============================
# Plot Total Distance Walked Per Day
# ===============================
daily_distance = df.groupby('day')['distance_m'].sum().reset_index()

plt.figure(figsize=(10, 5))
sns.lineplot(data=daily_distance, x='day', y='distance_m', marker='o')
plt.title('Total Distance Walked Per Day')
plt.xlabel('Date')
plt.ylabel('Distance (meters)')
plt.grid(True)
plt.xticks(rotation=45)
plt.tight_layout()
plt.savefig('total_distance_per_day.png')
plt.close()

# ===============================
# Hourly Activity Distribution
# ===============================
hourly_activity = df.groupby('hour')['distance_m'].sum().reset_index()

plt.figure(figsize=(10, 5))
sns.barplot(data=hourly_activity, x='hour', y='distance_m', palette='coolwarm')
plt.title('Activity Distribution by Hour')
plt.xlabel('Hour of Day')
plt.ylabel('Total Distance (meters)')
plt.grid(True)
plt.tight_layout()
plt.savefig('hourly_activity_distribution.png')
plt.close()

# ===============================
# Plot Anomalies Detected
# ===============================
plt.figure(figsize=(12, 6))
sns.scatterplot(data=df, x='timestamp', y='distance_m', hue='anomaly',
                palette={'Anomaly': 'red', 'Normal': 'blue'})
plt.title('Anomaly Detection in Pet Movement')
plt.xlabel('Timestamp')
plt.ylabel('Distance Moved (meters)')
plt.xticks(rotation=45)
plt.tight_layout()
plt.savefig('anomaly_detection_plot.png')
plt.close()

# ===============================
# Save Processed Dataset
# ===============================
df.to_csv('processed_petpulse_data_with_anomalies.csv', index=False)

print("✅ Analysis with anomaly detection complete. Outputs saved.")
