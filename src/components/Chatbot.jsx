import React, { useState } from 'react';

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ sender: 'bot', text: 'Hi there! Need help with tracking?' }]);
  const [input, setInput] = useState('');

  const responses = {
    hello: "Hello! 👋",
    "where's my dog?": "Your dog is near the last seen location.",
    help: "You can click on Live Tracking or ask about your pet location.",
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const lowerInput = input.toLowerCase();
    const response = responses[lowerInput] || "Sorry, I didn't understand that.";

    setMessages([...messages, { sender: 'you', text: input }, { sender: 'bot', text: response }]);
    setInput('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open ? (
        <div className="w-80 bg-white rounded-xl shadow-xl p-4 border border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-lg">💬 Chat with Us</h3>
            <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-red-500">✖</button>
          </div>
          <div className="h-60 overflow-y-auto space-y-2 mb-2 bg-gray-50 p-2 rounded">
            {messages.map((msg, i) => (
              <div key={i} className={`text-sm ${msg.sender === 'bot' ? 'text-gray-700' : 'text-right text-pink-500'}`}>
                <strong>{msg.sender === 'bot' ? 'Bot' : 'You'}:</strong> {msg.text}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              className="flex-1 border px-3 py-1 rounded-lg focus:outline-none"
            />
            <button onClick={handleSend} className="bg-pink-500 text-white px-4 py-1 rounded-lg">Send</button>
          </div>
        </div>
      ) : (
        <button
          className="bg-pink-500 hover:bg-pink-600 text-white px-5 py-3 rounded-full shadow-lg text-sm font-semibold"
          onClick={() => setOpen(true)}
        >
          🐶 Chat with Us
        </button>
      )}
    </div>
  );
}
