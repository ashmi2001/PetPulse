import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime
from geopy.distance import geodesic
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import IsolationForest
from sklearn.cluster import KMeans, DBSCAN
from sklearn.decomposition import PCA
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense
#test
gps_data = [
    {"Latitude": 40.751087, "Longitude": -74.042938, "Timestamp": "2025-03-23 01:10:44"},
    {"Latitude": 40.751095, "Longitude": -74.042946, "Timestamp": "2025-03-23 01:10:38"},
    {"Latitude": 40.751106, "Longitude": -74.042969, "Timestamp": "2025-03-23 01:10:33"},
    {"Latitude": 40.751141, "Longitude": -74.042999, "Timestamp": "2025-03-23 01:10:27"},
    {"Latitude": 40.751213, "Longitude": -74.043053, "Timestamp": "2025-03-23 01:10:22"},
]
df = pd.DataFrame(gps_data)
df["Timestamp"] = pd.to_datetime(df["Timestamp"])
df["Time_Diff"] = df["Timestamp"].diff().dt.total_seconds().fillna(0)

def extract_features(df):
    speeds, accels, restricted_flags = [0], [0], [0]
    for i in range(1, len(df)):
        coord1 = (df.loc[i - 1, "Latitude"], df.loc[i - 1, "Longitude"])
        coord2 = (df.loc[i, "Latitude"], df.loc[i, "Longitude"])
        time_diff = df.loc[i, "Time_Diff"]
        if time_diff > 0:
            dist = geodesic(coord1, coord2).meters
            speed = dist / time_diff
            acceleration = (speed - speeds[-1]) / time_diff
        else:
            speed, acceleration = 0, 0
        restricted_zone = 1 if geodesic(coord2, (40.751000, -74.043000)).meters <= 10 else 0
        speeds.append(speed)
        accels.append(acceleration)
        restricted_flags.append(restricted_zone)
    df["Speed"], df["Acceleration"], df["Restricted_Zone"] = speeds, accels, restricted_flags
    return df.drop(columns=["Timestamp"])

df = extract_features(df)

scaler = StandardScaler()
X_scaled = scaler.fit_transform(df.drop(columns=["Restricted_Zone"]))
iso_model = IsolationForest(contamination=0.1, random_state=42)
iso_preds = iso_model.fit_predict(X_scaled)
df["Anomaly"] = ["Anomaly" if p == -1 else "Normal" for p in iso_preds]

sns.set_style("whitegrid")

plt.figure(figsize=(8, 6))
plt.plot(df["Longitude"], df["Latitude"], linestyle="--", marker="o", alpha=0.5)
anomalies = df[df["Anomaly"] == "Anomaly"]
plt.scatter(anomalies["Longitude"], anomalies["Latitude"], color="red", s=150, edgecolor="black", label="Anomaly")
plt.plot(df["Longitude"].iloc[0], df["Latitude"].iloc[0], marker="D", color="green", label="Start")
plt.plot(df["Longitude"].iloc[-1], df["Latitude"].iloc[-1], marker="X", color="blue", label="End")
plt.title("🐕 Path & Anomaly Detection")
plt.legend()
plt.show()

colors = np.where(df["Anomaly"] == "Anomaly", "red", "green")
plt.figure(figsize=(10, 4))
plt.bar(df.index, df["Speed"], color=colors)
plt.title("Speed Analysis")
plt.ylabel("Speed (m/s)")
plt.show()

plt.figure(figsize=(10, 4))
plt.scatter(df.index, df["Acceleration"], c=colors, s=100)
plt.title("Acceleration Analysis")
plt.ylabel("Acceleration (m/s²)")
plt.show()

df["Energy Level"] = ["Low", "Moderate", "High", "Moderate", "Low"]
df["Behavior"] = ["Resting", "Walking", "Running", "Erratic", "Walking"]
df["Mood"] = ["Normal", "Happy", "Excited", "Anxious", "Normal"]
df["State"] = ["Safe", "Safe", "Mild Alert", "High Alert", "Safe"]

energy_map = {"Low": 0, "Moderate": 1, "High": 2}
behavior_map = {"Resting": 0, "Walking": 1, "Running": 2, "Erratic": 3}
mood_map = {"Happy": 2, "Normal": 1, "Excited": 3, "Anxious": 0}
state_map = {"Safe": 0, "Mild Alert": 1, "High Alert": 2}

df["Energy Level"] = df["Energy Level"].map(energy_map)
df["Behavior"] = df["Behavior"].map(behavior_map)
df["Mood"] = df["Mood"].map(mood_map)
df["State"] = df["State"].map(state_map)

plt.figure(figsize=(12, 6))
plt.plot(df.index, df["Energy Level"], marker="o", label="Energy")
plt.plot(df.index, df["Behavior"], marker="s", label="Behavior")
plt.plot(df.index, df["Mood"], marker="^", label="Mood")
plt.plot(df.index, df["State"], marker="x", label="State")
plt.title("Dog's Behavior & State")
plt.legend()
plt.grid(True)
plt.show()

url = 'https://archive.ics.uci.edu/ml/machine-learning-databases/00193/CTG.xls'
df_raw = pd.read_excel(url, sheet_name='Raw Data')
df_ctg = df_raw.iloc[2:-3].copy()
df_ctg = df_ctg.loc[:, ~df_ctg.columns.str.contains("Unnamed")]
df_ctg = df_ctg.apply(pd.to_numeric, errors="coerce").dropna(axis=1, how="all")
df_ctg.fillna(df_ctg.mean(), inplace=True)

X_ctg = StandardScaler().fit_transform(df_ctg)

# KMeans
kmeans = KMeans(n_clusters=3, random_state=42)
dists = np.min(kmeans.fit_transform(X_ctg), axis=1)
anomalies_kmeans = dists > np.percentile(dists, 95)

# DBSCAN
dbscan = DBSCAN(eps=2.0, min_samples=5)
anomalies_dbscan = dbscan.fit_predict(X_ctg) == -1

# Isolation Forest
iso_preds = IsolationForest(contamination=0.05, random_state=42).fit_predict(X_ctg)
anomalies_iso = iso_preds == -1

# Autoencoder
input_dim = X_ctg.shape[1]
autoencoder = Sequential([
    Dense(32, activation='relu', input_shape=(input_dim,)),
    Dense(16, activation='relu'),
    Dense(32, activation='relu'),
    Dense(input_dim, activation='linear')
])
autoencoder.compile(optimizer='adam', loss='mse')
autoencoder.fit(X_ctg, X_ctg, epochs=50, batch_size=32, verbose=0)

reconstructions = autoencoder.predict(X_ctg)
mse = np.mean(np.square(X_ctg - reconstructions), axis=1)
anomalies_auto = mse > np.percentile(mse, 95)

# PCA Visualization
def plot_anomalies(X, anomaly_mask, title):
    pca = PCA(n_components=2)
    X_pca = pca.fit_transform(X)
    plt.figure(figsize=(8, 6))
    plt.scatter(X_pca[:, 0], X_pca[:, 1], c='blue', label="Normal", alpha=0.3)
    plt.scatter(X_pca[anomaly_mask, 0], X_pca[anomaly_mask, 1], c='red', label="Anomaly", alpha=0.7)
    plt.title(title)
    plt.legend()
    plt.grid(True)
    plt.show()

plot_anomalies(X_ctg, anomalies_kmeans, "K-Means Anomaly Detection")
plot_anomalies(X_ctg, anomalies_dbscan, "DBSCAN Anomaly Detection")
plot_anomalies(X_ctg, anomalies_iso, "Isolation Forest Detection")
plot_anomalies(X_ctg, anomalies_auto, "Autoencoder Detection")
