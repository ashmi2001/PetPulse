import firebase_admin
from firebase_admin import credentials, firestore
import folium
import webbrowser
from datetime import datetime

# Initialize Firebase Admin SDK
cred = credentials.Certificate('firebase_config.json')  # Use your Firebase service account file
firebase_admin.initialize_app(cred)

# Firestore database reference
db = firestore.client()
collection_ref = db.collection('GPSData')  # Reference to the GPSData collection in Firestore

# Function to fetch GPS data from Firestore
def fetch_gps_data():
    gps_data = []
    # Fetch documents from Firestore collection
    docs = collection_ref.stream()

    for doc in docs:
        data = doc.to_dict()
        gps_data.append(data)

    # Return the fetched GPS data
    return gps_data

# Function to plot the dog's path dynamically on a map with start, stop, and end points
def plot_dynamic_dog_path(map_filename="dog_movement_map.html"):
    gps_data = fetch_gps_data()  # Fetch live GPS data from Firestore

    if not gps_data:
        print("No GPS data to plot.")
        return

    # Convert timestamps if needed
    for point in gps_data:
        if isinstance(point['timestamp'], int):  # If timestamp is in milliseconds
            point['timestamp'] = datetime.fromtimestamp(point['timestamp'] / 1000).strftime("%Y-%m-%d %H:%M:%S")

    # Center map at the first point
    start_point = gps_data[0]
    m = folium.Map(location=[start_point['latitude'], start_point['longitude']], zoom_start=17)

    # Define a threshold for identifying "stopped" points (e.g., less than 10 meters moved)
    stop_threshold = 10  # meters

    # Create a list to store the stop points (points where the dog stopped)
    stop_points = []

    for i in range(1, len(gps_data)):
        point = gps_data[i]
        prev_point = gps_data[i - 1]

        # Calculate the distance between consecutive points using Haversine formula
        lat1, lon1 = prev_point['latitude'], prev_point['longitude']
        lat2, lon2 = point['latitude'], point['longitude']

        # Haversine formula to calculate distance between two points
        from math import radians, sin, cos, sqrt, atan2
        R = 6371  # Radius of the Earth in kilometers
        dlat = radians(lat2 - lat1)
        dlon = radians(lon2 - lon1)
        a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
        c = 2 * atan2(sqrt(a), sqrt(1 - a))
        distance = R * c * 1000  # distance in meters

        # If the distance is less than the stop threshold, consider this a "stopped" point
        if distance < stop_threshold:
            stop_points.append(point)

    # Mark start and end points
    folium.Marker(
        location=[start_point['latitude'], start_point['longitude']],
        popup="Start",
        icon=folium.Icon(color="green")
    ).add_to(m)

    # Mark stop points
    for stop_point in stop_points:
        folium.Marker(
            location=[stop_point['latitude'], stop_point['longitude']],
            popup="Stopped",
            icon=folium.Icon(color="blue")
        ).add_to(m)

    # Mark the last point as the end point
    end_point = gps_data[-1]
    folium.Marker(
        location=[end_point['latitude'], end_point['longitude']],
        popup="End",
        icon=folium.Icon(color="red")
    ).add_to(m)

    # Save the map
    m.save(map_filename)
    print(f"✅ Map saved as {map_filename}")

    # Optionally, open the map automatically in the default web browser
    webbrowser.open(map_filename)

# Call the function to plot the dog's path
plot_dynamic_dog_path()
