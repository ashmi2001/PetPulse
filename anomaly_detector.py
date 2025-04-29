import time
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.metrics.pairwise import haversine_distances
import firebase_admin
from firebase_admin import credentials, firestore, messaging
from datetime import datetime
import math

# Constants
TRAINING_SAMPLE_SIZE = 100  # Number of points to train initially
REALTIME_CHECK_INTERVAL = 60  # seconds
CONTAMINATION_RATE = 0.05  # Estimated % of anomalies in training data
FCM_TOPIC = 'dog_tracking_alerts'  # Firebase Cloud Messaging topic for notifications
GEOFENCE_RADIUS = 0.01  # Example geofence radius in degrees (~1.11 km)

# Initialize Firebase Admin SDK only if not initialized
try:
    firebase_admin.get_app()  # Check if Firebase app is already initialized
except ValueError:
    cred = credentials.Certificate('firebase_config.json')
    firebase_admin.initialize_app(cred)

# Firestore database reference
db = firestore.client()
collection_ref = db.collection('GPSData')

# Initialize model globally
model = IsolationForest(contamination=CONTAMINATION_RATE, random_state=42)
model_trained = False

# Sample geofence center (latitude, longitude)
GEOFENCE_CENTER = (37.7749, -122.4194)  # Example: San Francisco coordinates

def fetch_coordinates():
    """Fetch all coordinates currently in Firestore collection."""
    try:
        docs = collection_ref.stream()
        coords = []
        for doc in docs:
            data = doc.to_dict()
            lat = data.get('latitude')
            lon = data.get('longitude')
            if lat is not None and lon is not None:
                coords.append([lat, lon])
        return coords
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

def haversine_distance(coord1, coord2):
    """Calculate the Haversine distance between two GPS coordinates."""
    lat1, lon1 = coord1
    lat2, lon2 = coord2
    lat1, lon1, lat2, lon2 = map(np.radians, [lat1, lon1, lat2, lon2])
    return haversine_distances([[lat1, lon1], [lat2, lon2]])[0][1] * 6371000  # Returns distance in meters

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

def log_anomaly(coords, message, anomaly_type):
    """Log anomaly details into Firestore for future analysis."""
    try:
        anomaly_data = {
            'timestamp': time.time(),
            'coordinates': coords,
            'message': message,
            'anomaly_type': anomaly_type,
            'datetime': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        db.collection('dog_tracking_anomalies').add(anomaly_data)
    except Exception as e:
        print(f"Error logging anomaly: {e}")

def classify_anomaly(last_coords, new_coords):
    """Classify anomaly based on movement and geofence violation."""
    lat1, lon1 = last_coords
    lat2, lon2 = new_coords

    # Calculate distance traveled
    distance = haversine_distance(last_coords, new_coords)
    
    # Classify based on distance
    if distance > 1000:  # If traveled more than 1km in a short time
        return "High Movement"
    elif distance < 1:  # If very small movement
        return "No Movement"
    else:
        return "Normal Movement"
    

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
    seen_docs = set()  # Track already processed document IDs
    last_coords = None  # To keep track of previous coordinates for movement analysis
    
    while True:
        docs = collection_ref.stream()
        new_coords = []
        for doc in docs:
            if doc.id not in seen_docs:
                data = doc.to_dict()
                lat = data.get('latitude')
                lon = data.get('longitude')
                if lat is not None and lon is not None:
                    new_coords.append([lat, lon])
                    seen_docs.add(doc.id)

        if len(new_coords) > 0:
            # Classify anomalies based on movement
            if last_coords is not None:
                for coord in new_coords:
                    anomaly_type = classify_anomaly(last_coords, coord)
                    if anomaly_type != "Normal Movement":
                        message = f"Anomalous movement detected: {anomaly_type} at {coord}"
                        send_notification(message)
                        log_anomaly(coord, message, anomaly_type)
                        print(f"Anomaly detected: {anomaly_type} at {coord}")
                    last_coords = coord
            else:
                last_coords = new_coords[0]  # Initialize first set of coordinates
            
        else:
            print("No new coordinates detected.")
        
        time.sleep(REALTIME_CHECK_INTERVAL)

if __name__ == "__main__":
    run_detection_loop()
