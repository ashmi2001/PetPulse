import google.generativeai as genai

GEMINI_API_KEY = 'AIzaSyDBPo51gmdYtxlzHKGYIclwq5_H7r4Mb_o'  # Replace with your actual key!

class DogChatbot:
    def __init__(self):
        self.context = "You are a chatbot focused on dog health, care, food, and anomalies."
        genai.configure(api_key=GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-1.5-flash')

    def get_response(self, user_input):
        prompt = f"{self.context} Answer the following question: {user_input}"

        try:
            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            return f"Error: {e}"

    def start_chat(self):
        print("Chatbot: Hello! I'm here to help you with dog care, health, and food-related questions. How can I assist you today?")
        
        while True:
            user_input = input("You: ").strip().lower()

            # Check for exit conditions
            if user_input in ["exit", "quit", "bye", "thanks", "thank you", "thankyou"]:
                print("Chatbot: Thank you for chatting with me! Goodbye! 🐶")
                break

            # Handle chatbot response
            response = self.get_response(user_input)
            print(f"Chatbot: {response}")

# Main execution
if __name__ == "__main__":
    chatbot = DogChatbot()  # Create chatbot object
    chatbot.start_chat()  # Start the chatbot interaction
