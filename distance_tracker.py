from math import radians, sin, cos, sqrt, atan2
from datetime import datetime
import firebase_admin
from firebase_admin import firestore,credentials

# Initialize Firebase only once
cred = credentials.Certificate("firebase_config.json")  # Provide your Firebase service account key JSON file
firebase_admin.initialize_app(cred)
db = firestore.client()

def haversine(lat1, lon1, lat2, lon2):
    R = 3958.8  # Earth radius in miles
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    return R * 2 * atan2(sqrt(a), sqrt(1 - a))

def fetch_coordinates():
    collection_ref = db.collection('GPSData')
    docs = collection_ref.order_by("timestamp", direction=firestore.Query.DESCENDING).get()  # Order by most recent timestamp

    coordinates = []
    last_date = None
    for doc in docs:
        data = doc.to_dict()
        if "latitude" in data and "longitude" in data:
            timestamp_ms = data.get("timestamp")
            
            # Convert timestamp from milliseconds to seconds
            timestamp = datetime.utcfromtimestamp(timestamp_ms / 1000)
            date_only = timestamp.date()  # Extract just the date part (year-month-day)
            
            # If the timestamp date is different from the last one, break the loop
            if last_date and date_only != last_date:
                break
            
            # Debug: print out the timestamp and corresponding coordinates
            print(f"Timestamp: {timestamp}, Latitude: {data['latitude']}, Longitude: {data['longitude']}")
            
            coordinates.append((data["latitude"], data["longitude"], timestamp))
            last_date = date_only  # Set the current date as the last date
    
    print(f"Fetched {len(coordinates)} coordinates for the last day.")
    return coordinates

def compute_total_distance_and_footsteps():
    coords = fetch_coordinates()
    if len(coords) < 2:
        print("Not enough GPS points.")
        return 0, 0

    total_distance = 0
    for i in range(1, len(coords)):
        total_distance += haversine(coords[i-1][0], coords[i-1][1], coords[i][0], coords[i][1])
    
    # Estimate footsteps (2,000 footsteps per mile)
    footsteps_per_mile = 2000
    total_footsteps = total_distance * footsteps_per_mile

    print(f"Total distance traveled by the dog on the last day: {total_distance:.2f} miles")
    print(f"Total footsteps taken by the dog on the last day: {int(total_footsteps)} footsteps")

    return total_distance, total_footsteps

if __name__ == "__main__":
    compute_total_distance_and_footsteps()
