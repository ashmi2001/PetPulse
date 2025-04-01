import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.ensemble import IsolationForest
from sklearn.model_selection import train_test_split
import joblib
import kagglehub
import os
import logging
import time

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')

# Download dataset from Kaggle
logging.info("Downloading dataset from Kaggle...")
path = kagglehub.dataset_download("frasonfrancis/animal-tracking-data-set")
logging.info(f"Path to dataset files: {path}")

# Get the first CSV file in the downloaded path
csv_file = [f for f in os.listdir(path) if f.endswith('.csv')][0]
data = pd.read_csv(os.path.join(path, csv_file))

logging.info(f"Loaded file: {csv_file}")
logging.info(f"Available columns: {data.columns}")

# Selecting relevant columns
columns = ['location-lat', 'location-long', 'argos:sensor-1', 'argos:sensor-2', 'argos:sensor-3']
data = data[columns].dropna()

# Train-test split
X_train, X_test = train_test_split(data, test_size=0.2, random_state=42)

# Train Isolation Forest for anomaly detection
model = IsolationForest(n_estimators=100, contamination=0.05, random_state=42)
model.fit(X_train)

# Predict anomalies
X_test['anomaly'] = model.predict(X_test)
X_test['anomaly'] = X_test['anomaly'].map({1: 0, -1: 1})

# Visualize anomalies
plt.figure(figsize=(10, 6))
anomalies = X_test[X_test['anomaly'] == 1]
plt.scatter(X_test['location-long'], X_test['location-lat'], label='Normal', alpha=0.6)
plt.scatter(anomalies['location-long'], anomalies['location-lat'], color='red', label='Anomaly')
plt.title('Animal Tracking Anomalies (GPS)')
plt.legend()
plt.show()

# Save model for backend use
joblib.dump(model, 'kaggle_anomaly_detection_model.pkl')
logging.info("Model training complete. Saved as 'kaggle_anomaly_detection_model.pkl'")

# Evaluate model
from sklearn.metrics import classification_report
print(classification_report(X_test['anomaly'], model.predict(X_test.drop('anomaly', axis=1))))

# Real-time data simulation
def generate_real_time_data(n=1):
    real_time_data = pd.DataFrame({
        'location-lat': np.random.uniform(data['location-lat'].min(), data['location-lat'].max(), n),
        'location-long': np.random.uniform(data['location-long'].min(), data['location-long'].max(), n),
        'argos:sensor-1': np.random.uniform(data['argos:sensor-1'].min(), data['argos:sensor-1'].max(), n),
        'argos:sensor-2': np.random.uniform(data['argos:sensor-2'].min(), data['argos:sensor-2'].max(), n),
        'argos:sensor-3': np.random.uniform(data['argos:sensor-3'].min(), data['argos:sensor-3'].max(), n),
    })
    return real_time_data

# Load trained model
model = joblib.load('kaggle_anomaly_detection_model.pkl')

# Real-time anomaly detection loop
logging.info("Running real-time anomaly detection... (Press Ctrl+C to stop)")
try:
    while True:
        new_data = generate_real_time_data()
        prediction = model.predict(new_data)
        new_data['anomaly'] = np.where(prediction == -1, 'Anomaly', 'Normal')
        logging.info(new_data)
        time.sleep(5)  # Adjust for desired frequency of checks
except KeyboardInterrupt:
    logging.info("Real-time detection stopped.")

import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')
logging.info("Real-time anomaly detection started...")
plt.ion() 
