# dog_health.py

def get_health_advice(user_input):
    # Example advice function
    if "dog food" in user_input.lower():
        return "For a healthy dog, feed them balanced dog food suited to their age and breed."
    elif "exercise" in user_input.lower():
        return "Dogs need daily exercise to stay fit. A 30-minute walk or play session is a good start."
    else:
        return "Please provide more details on the health topic you're asking about."
