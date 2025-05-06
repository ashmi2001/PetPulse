from flask import Flask, render_template, request, redirect, url_for
import threading
from chatbot import DogChatbot
from map import plot_dynamic_dog_path  # Import map plotting from map.py
from distance_tracker import compute_total_distance_and_footsteps  # Import track_distance from distance_tracker.py
from graphs import generate_graphs  # Assuming graphs.py has a function to generate graphs
from firebase_integration import generate_report

app = Flask(__name__)

# Initialize chatbot
chatbot = DogChatbot()

@app.route('/')
def home():
    plot_dynamic_dog_path(map_filename="dog_movement_map.html")
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    if request.method == 'POST':
        user_input = request.form['user_input']
        response = chatbot.get_response(user_input)
        return render_template('chat.html', response=response, user_input=user_input)
    

@app.route('/generate_report', methods=['POST'])
def generate_monthly_report():
    month = request.form['month']
    report_data = generate_report(month)  # Call the generate_report function from firebase_integration.py
    return render_template('index.html', report=report_data)

@app.route('/track_distance', methods=['POST'])
def track_distance():
    compute_total_distance_and_footsteps()  # Call the distance tracking function
    return render_template('index.html', message="Tracking initiated!")

@app.route('/generate_graphs', methods=['POST'])
def generate_graph():
    generate_graphs()  # Generate graph for display
    return render_template('index.html', message="Graph generation initiated!")

def run_flask():
    app.run(debug=True, use_reloader=False)

if __name__ == "__main__":
    threading.Thread(target=run_flask).start()
    app.run(debug=True, use_reloader=False, port=5002)
