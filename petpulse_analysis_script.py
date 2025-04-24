import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from geopy.distance import geodesic

# ===============================
# Load the GPS dataset
# ===============================
df = pd.read_csv('petpulse_gps_data.csv')  # Make sure your CSV is named like this

# Convert timestamp to datetime
df['timestamp'] = pd.to_datetime(df['timestamp'])

# Sort data by timestamp
df = df.sort_values('timestamp')

# ===============================
# Calculate distance between GPS points
# ===============================
distances = [0]  # First point has no previous
for i in range(1, len(df)):
    prev = (df.iloc[i-1]['latitude'], df.iloc[i-1]['longitude'])
    curr = (df.iloc[i]['latitude'], df.iloc[i]['longitude'])
    distances.append(geodesic(prev, curr).meters)  # in meters

df['distance_m'] = distances

# Extract day and hour from timestamp
df['hour'] = df['timestamp'].dt.hour
df['day'] = df['timestamp'].dt.date

# ===============================
# Distance Traveled Per Day
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
plt.savefig('total_distance_per_day.png')  # Output image
plt.close()

# ===============================
# Hourly Movement Distribution
# ===============================
hourly_activity = df.groupby('hour')['distance_m'].sum().reset_index()

plt.figure(figsize=(10, 5))
sns.barplot(data=hourly_activity, x='hour', y='distance_m', palette='coolwarm')
plt.title('Activity Distribution by Hour')
plt.xlabel('Hour of Day')
plt.ylabel('Total Distance (meters)')
plt.grid(True)
plt.tight_layout()
plt.savefig('hourly_activity_distribution.png')  # Output image
plt.close()

# ===============================
# Save the processed dataset
# ===============================
df.to_csv('processed_petpulse_data.csv', index=False)

print("✅ Analysis complete. Charts and processed data have been saved.")
