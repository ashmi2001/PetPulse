import firebase_admin
from firebase_admin import credentials, firestore
import time
import math
from geopy.distance import geodesic

# Initialize Firebase Admin SDK (only once)
cred = credentials.Certificate('firebase_config.json')
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

# Firestore database reference
db = firestore.client()
collection_ref = db.collection('GPSData')

# Function to fetch data from Firestore by month
import time

def fetch_data_by_month(month):
    start_time = time.mktime(time.strptime(f"{month}-01", "%Y-%m-%d"))  # Convert to timestamp (seconds)
    end_time = start_time + (30 * 24 * 60 * 60)  # Roughly one month later

    # Convert start and end times to milliseconds (since Firestore stores timestamps in ms)
    start_time_ms = int(start_time * 1000)  # Convert to milliseconds
    end_time_ms = int(end_time * 1000)  # Convert to milliseconds

    # Use Firestore query with converted milliseconds
    query = collection_ref.where("timestamp", ">", start_time_ms).where("timestamp", "<", end_time_ms)
    docs = query.stream()
    
    # Print out each document's content for debugging
    data = []
    for doc in docs:
        doc_data = doc.to_dict()
        print(f"Fetched Document: {doc_data}")  # Debugging line to check data structure
        data.append(doc_data)
    
    return data



# Function to calculate the haversine distance
def haversine_distance(coord1, coord2):
    """Calculate the Haversine distance between two GPS coordinates."""
    lat1, lon1 = coord1
    lat2, lon2 = coord2
    return geodesic(coord1, coord2).meters

# Function to generate a report based on data for a specific month
def generate_report(month):
    # Fetch data for the given month
    data = fetch_data_by_month(month)
    
    # Process the data to generate the report (e.g., total movement, idle time)
    total_movement = 0
    idle_count = 0
    prev_coords = None  # Keep track of previous coordinates for movement calculation

    for entry in data:
        lat = entry.get('latitude')
        lon = entry.get('longitude')
        
        if lat and lon:
            if prev_coords:
                distance = haversine_distance(prev_coords, (lat, lon))
                if distance > 10:  # If movement is greater than 10 meters
                    total_movement += 1
            prev_coords = (lat, lon)
        else:
            idle_count += 1
    
    # Generate a simple text report
    report = f"Report for {month}:\n"
    report += f"Total movement events: {total_movement}\n"
    report += f"Total idle events: {idle_count}\n"
    
    return report
