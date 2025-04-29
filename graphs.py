import time
import numpy as np
import pandas as pd
import firebase_admin
from firebase_admin import credentials, firestore
import matplotlib.pyplot as plt
from datetime import datetime

# Constants
REALTIME_CHECK_INTERVAL = 5  # Interval for real-time updates in seconds

# Initialize Firebase Admin SDK
cred = credentials.Certificate('firebase_config.json')  # Path to your Firebase service account
firebase_admin.initialize_app(cred)

# Initialize Firestore
firestore_db = firestore.client()

def fetch_anomalies():
    """Fetch all anomaly data from Firestore."""
    try:
        docs = firestore_db.collection('Anomalies').stream()  # Assuming 'Anomalies' collection
        anomalies = []
        for doc in docs:
            data = doc.to_dict()
            pet_id = data.get('petID')
            reason = data.get('reason')
            severity = data.get('severity')
            timestamp = data.get('timestamp')  # Unix timestamp in milliseconds (could be string)
            
            # Ensure timestamp is an integer before processing
            if isinstance(timestamp, str):
                timestamp = int(timestamp)  # Convert string to int

            if pet_id and reason and severity and timestamp:
                anomalies.append({
                    'petID': pet_id,
                    'reason': reason,
                    'severity': severity,
                    'timestamp': datetime.utcfromtimestamp(timestamp / 1000)  # Convert to datetime
                })
        if anomalies:
            return anomalies
        else:
            print("No anomalies available yet.")
            return []
    except Exception as e:
        print(f"Error fetching anomalies: {e}")
        return []

# --- Graph: Plot Anomalies ---
def plot_anomalies():
    """Plot detected anomalies."""
    anomalies = fetch_anomalies()
    
    if anomalies:
        # Convert anomalies list to DataFrame for easier plotting
        df = pd.DataFrame(anomalies)

        # Map severity to colors
        severity_colors = {
            'low': 'green',
            'medium': 'yellow',
            'high': 'red'
        }
        
        # Plot the anomalies
        plt.figure(figsize=(10, 6))

        for _, row in df.iterrows():
            severity = row['severity']
            plt.scatter(row['timestamp'], row['petID'], color=severity_colors.get(severity, 'gray'),
                        label=f"{row['reason']} - {row['severity']}", s=100)

        # Remove duplicate labels in the legend
        handles, labels = plt.gca().get_legend_handles_labels()
        by_label = dict(zip(labels, handles))
        plt.legend(by_label.values(), by_label.keys(), loc='upper left', title="Anomaly Types")
        
        # Labels for the plot
        plt.xlabel('Timestamp')
        plt.ylabel('Pet ID')
        plt.title('Detected Anomalies in Pet Movement')
        plt.xticks(rotation=45)
        plt.grid(True)
        plt.tight_layout()
        plt.show()
    else:
        print("No anomalies to display.")

# --- Main Function ---
def generate_graphs():
    """Generate anomaly graph."""
    print("Real-Time Dog Movement Tracker Started...")
    plot_anomalies()
    print("Anomalies graph has been displayed.")

if __name__ == "__main__":
    while True:
        generate_graphs()
        time.sleep(REALTIME_CHECK_INTERVAL)  # Wait before fetching new data and updating
