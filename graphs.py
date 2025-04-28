import time
import numpy as np
import pandas as pd
import firebase_admin
from firebase_admin import credentials, db
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.cluster import KMeans
from sklearn.ensemble import IsolationForest

# Constants for anomaly detection (match these with your anomaly detector settings)
TRAINING_SAMPLE_SIZE = 20
REALTIME_CHECK_INTERVAL = 5
CONTAMINATION_RATE = 0.05

# Initialize Firebase Admin SDK
cred = credentials.Certificate('firebase_config.json')  # Path to your Firebase credentials
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://petpulse17-default-rtdb.firebaseio.com/'  # Your Firebase URL
})

# Firebase database reference
ref = db.reference('dog_tracking')  # Your Firebase path

# Initialize the anomaly detection model
model = IsolationForest(contamination=CONTAMINATION_RATE, random_state=42)
model_trained = False

def fetch_coordinates():
    """Fetch all coordinates from Firebase."""
    try:
        data = ref.get()
        if data:
            coords = []
            for key, value in data.items():
                lat = value.get('latitude')
                lon = value.get('longitude')
                if lat is not None and lon is not None:
                    coords.append([lat, lon])
            return coords
        else:
            print("No data available yet.")
            return []
    except Exception as e:
        print(f"Error fetching coordinates: {e}")
        return []

def train_model(training_data):
    """Train Isolation Forest model on initial batch of data."""
    global model, model_trained
    X_train = np.array(training_data)
    model.fit(X_train)
    model_trained = True
    print(f"Model trained on {len(X_train)} samples.")

def detect_anomalies(new_data):
    """Detect anomalies in new incoming data."""
    X_new = np.array(new_data)
    preds = model.predict(X_new)
    anomalies = X_new[preds == -1]
    return anomalies

# Fetch data for graphing
def get_data_for_graphing():
    """Fetch data and return as a DataFrame."""
    coords = fetch_coordinates()
    if len(coords) > 0:
        df = pd.DataFrame(coords, columns=['latitude', 'longitude'])
        return df
    return pd.DataFrame()  # Return empty dataframe if no data

# --- Graph 1: Movement Over Time ---
def plot_movement_over_time():
    """Plot pet movement (latitude and longitude) over time."""
    df = get_data_for_graphing()
    if not df.empty:
        df['timestamp'] = pd.to_datetime(df.index)
        plt.figure(figsize=(10, 6))
        plt.plot(df['timestamp'], df['latitude'], label='Latitude')
        plt.plot(df['timestamp'], df['longitude'], label='Longitude')
        plt.xlabel('Time')
        plt.ylabel('Coordinates')
        plt.title('Pet Movement Over Time')
        plt.legend()
        plt.xticks(rotation=45)
        plt.grid(True)
        plt.show()  # Display the plot

# --- Graph 2: Anomaly Detection Alerts ---
def plot_anomalies():
    """Plot detected anomalies."""
    df = get_data_for_graphing()
    if not df.empty:
        anomalies = detect_anomalies(df[['latitude', 'longitude']].values)
        if len(anomalies) > 0:
            plt.figure(figsize=(10, 6))
            plt.scatter(anomalies[:, 0], anomalies[:, 1], color='red', label='Anomalies')
            plt.xlabel('Latitude')
            plt.ylabel('Longitude')
            plt.title('Detected Anomalies in Pet Movement')
            plt.legend()
            plt.grid(True)
            plt.show()  # Display the plot

# --- Graph 3: Movement Clusters ---
def plot_clusters():
    """Plot clusters in pet movement using KMeans."""
    df = get_data_for_graphing()
    if not df.empty:
        kmeans = KMeans(n_clusters=3)
        df['cluster'] = kmeans.fit_predict(df[['latitude', 'longitude']])
        plt.figure(figsize=(10, 6))
        plt.scatter(df['latitude'], df['longitude'], c=df['cluster'], cmap='viridis')
        plt.xlabel('Latitude')
        plt.ylabel('Longitude')
        plt.title('Pet Movement Clusters')
        plt.colorbar(label='Cluster')
        plt.show()  # Display the plot

# --- Graph 4: Heatmap of Movement ---
def plot_heatmap():
    """Generate a heatmap of pet movement."""
    df = get_data_for_graphing()
    if not df.empty:
        plt.figure(figsize=(10, 6))
        sns.kdeplot(x=df['longitude'], y=df['latitude'], cmap='Blues', shade=True, bw_adjust=0.5)
        plt.xlabel('Longitude')
        plt.ylabel('Latitude')
        plt.title('Heatmap of Pet Movement')
        plt.show()  # Display the plot

# --- Main function to generate all graphs ---
def generate_graphs():
    """Generate all the required graphs."""
    plot_movement_over_time()
    plot_anomalies()
    plot_clusters()
    plot_heatmap()
    print("Graphs have been displayed.")

if __name__ == "__main__":
    generate_graphs()
