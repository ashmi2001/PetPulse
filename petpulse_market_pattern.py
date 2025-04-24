import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from geopy.distance import geodesic

# Load data
df = pd.read_csv('petpulse_gps_data.csv')
df['timestamp'] = pd.to_datetime(df['timestamp'])
df = df.sort_values('timestamp')

# Distance calculation
distances = [0]
for i in range(1, len(df)):
    prev = (df.iloc[i-1]['latitude'], df.iloc[i-1]['longitude'])
    curr = (df.iloc[i]['latitude'], df.iloc[i]['longitude'])
    distances.append(geodesic(prev, curr).meters)
df['distance_m'] = distances
df['day'] = df['timestamp'].dt.date

# Daily totals
daily_stats = df.groupby('day')['distance_m'].sum().reset_index()
daily_stats['distance_km'] = daily_stats['distance_m'] / 1000

# FitBark benchmark: 4.5 km/day average
industry_avg = 4.5  # kilometers

# Plot comparison
plt.figure(figsize=(10, 5))
sns.lineplot(data=daily_stats, x='day', y='distance_km', marker='o', label='Your Pet')
plt.axhline(industry_avg, color='red', linestyle='--', label='Industry Avg (FitBark)')
plt.title('Pet Distance Comparison with Market Benchmark')
plt.xlabel('Date')
plt.ylabel('Distance (km)')
plt.xticks(rotation=45)
plt.legend()
plt.tight_layout()
plt.savefig('distance_vs_market_average.png')
plt.close()

# Identify below-average days
below_avg_days = daily_stats[daily_stats['distance_km'] < industry_avg]

# Future Vision Output
print("📉 Below-average activity days:")
print(below_avg_days)

print("\n🚀 Future Feature Ideas Based on Analysis:")
print("- AI health warnings when activity drops multiple days in a row.")
print("- Dynamic goal setting based on breed, age, weather.")
print("- Suggest new walking routes based on favorite locations.")
print("- Create wellness score using movement, rest, and deviation from norms.")