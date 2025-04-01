from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def generate_response(user_input):
    user_input = user_input.lower()
    if "hello" in user_input:
        return "Hi there! How can I help you with your pet today?"
    elif "hungry" in user_input:
        return "You can check the hunger alert in the app dashboard."
    else:
        return "I'm not sure about that. Try asking about hunger, health, or features!"

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    message = data.get("message", "")
    reply = generate_response(message)
    return jsonify({"response": reply})

if __name__ == '__main__':
    app.run(debug=True, port=5001)
