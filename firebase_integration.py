# firebase_integration.py
import firebase_admin
from firebase_admin import credentials, db

# Initialize Firebase
cred = credentials.Certificate('firebase_config.json')

try:
    firebase_admin.get_app()  # Check if Firebase is initialized
except ValueError:
    firebase_admin.initialize_app(cred, {'databaseURL': 'https://petpulse17-default-rtdb.firebaseio.com/'})

def get_dog_data():
    # Your code to fetch dog data from Firebase
    ref = db.reference('dog_tracking')
    return ref.get()  # Fetch the data from Firebase
