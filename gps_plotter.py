import webbrowser
import os

# Path to the map HTML file
map_filename = "dog_movement_map.html"

# Open the map in the default web browser
webbrowser.open("file://" + os.path.abspath(map_filename))  # Open with absolute path
