import time
import numpy as np
from sklearn.ensemble import IsolationForest
import firebase_admin
from firebase_admin import credentials, db, messaging

# Constants
TRAINING_SAMPLE_SIZE = 20  # Number of points to train initially
REALTIME_CHECK_INTERVAL = 5  # seconds
CONTAMINATION_RATE = 0.05  # Estimated % of anomalies in training data
FCM_TOPIC = 'dog_tracking_alerts'  # Firebase Cloud Messaging topic for notifications

# Initialize Firebase Admin SDK
cred = credentials.Certificate('firebase_config.json')
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://petpulse17-default-rtdb.firebaseio.com/'
})

# Firebase database reference
ref = db.reference('dog_tracking')

# Initialize model globally
model = IsolationForest(contamination=CONTAMINATION_RATE, random_state=42)
model_trained = False

def fetch_coordinates():
    """Fetch all coordinates currently in the database."""
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
            print("No data available yet in dog_tracking.")
            return []
    except Exception as e:
        print(f"Error fetching coordinates: {e}")
        return []

def train_model(training_data):
    """Train Isolation Forest model on initial clean batch."""
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

def send_notification(message):
    """Send Firebase Cloud Message notification for detected anomaly."""
    try:
        message = messaging.Message(
            notification=messaging.Notification(
                title="Dog Tracking Alert",
                body=message
            ),
            topic=FCM_TOPIC
        )
        response = messaging.send(message)
        print(f"Successfully sent message: {response}")
    except Exception as e:
        print(f"Error sending notification: {e}")

def log_anomaly(coords, message):
    """Log anomaly details into Firebase for future analysis."""
    try:
        ref.child("anomalies").push({
            'timestamp': time.time(),
            'coordinates': coords,
            'message': message
        })
    except Exception as e:
        print(f"Error logging anomaly: {e}")

def run_detection_loop():
    """Main loop for real-time anomaly detection."""
    global model_trained

    print("Dog Anomaly Detector Started...")

    # Phase 1: Training Phase
    print("Fetching initial batch for training...")
    while True:
        coords = fetch_coordinates()
        if len(coords) >= TRAINING_SAMPLE_SIZE:
            train_model(coords[:TRAINING_SAMPLE_SIZE])
            break
        else:
            print(f"Waiting for at least {TRAINING_SAMPLE_SIZE} samples... Current: {len(coords)}")
            time.sleep(REALTIME_CHECK_INTERVAL)

    # Phase 2: Real-Time Detection
    seen_keys = set()  # Track already processed coordinates
    while True:
        data = ref.get()
        new_coords = []
        if data:
            for key, value in data.items():
                if key not in seen_keys:
                    lat = value.get('latitude')
                    lon = value.get('longitude')
                    if lat is not None and lon is not None:
                        new_coords.append([lat, lon])
                        seen_keys.add(key)

        if len(new_coords) > 0:
            anomalies = detect_anomalies(new_coords)
            if len(anomalies) > 0:
                # For each detected anomaly, send a notification and log the anomaly
                for anomaly in anomalies:
                    message = f"Anomalous movement detected: Coordinates: {anomaly.tolist()}"
                    send_notification(message)
                    log_anomaly(anomaly.tolist(), message)
                    print(f"Anomalies detected: {anomaly.tolist()}")
            else:
                print("No anomalies detected in new batch.")
        else:
            print("No new coordinates detected.")

        time.sleep(REALTIME_CHECK_INTERVAL)

if __name__ == "__main__":
    run_detection_loop()
