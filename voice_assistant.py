import speech_recognition as sr
import pyttsx3
import requests
import json
from datetime import datetime
import logging
from typing import Optional, Dict, Any
from flask import Flask, request, jsonify
from flask_cors import CORS
import threading
import time
import os
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Initialize text-to-speech engine
engine = pyttsx3.init()

# Set properties for the voice
voices = engine.getProperty('voices')
for voice in voices:
    if "female" in voice.name.lower():
        engine.setProperty('voice', voice.id)
        break

# Load knowledge base
with open('knowledge_base.json', 'r') as f:
    knowledge_base = json.load(f)

# Initialize TF-IDF vectorizer
vectorizer = TfidfVectorizer()
corpus = [item['question'] for item in knowledge_base]
X = vectorizer.fit_transform(corpus)

class VermicompostAssistant:
    def __init__(self):
        # Initialize the speech recognizer
        self.recognizer = sr.Recognizer()
        
        # Initialize text-to-speech engine
        self.engine = pyttsx3.init()
        
        # Set properties for the voice
        self.engine.setProperty('rate', 150)    # Speed of speech
        self.engine.setProperty('volume', 0.9)  # Volume (0-1)
        
        # Get available voices and set to female voice if available
        voices = self.engine.getProperty('voices')
        for voice in voices:
            if "female" in voice.name.lower():
                self.engine.setProperty('voice', voice.id)
                break

        # Vermicomposting information dictionary
        self.info = {
            "1": {
                "title": "Worm Care and Feeding",
                "content": """
                Here are the key points for worm care and feeding:
                - Feed your worms a mix of green and brown materials
                - Green materials include fruit and vegetable scraps, coffee grounds
                - Brown materials include paper, cardboard, and dry leaves
                - Avoid meat, dairy, oils, and citrus
                - Feed small amounts every 3-4 days
                - Monitor the bin to prevent overfeeding
                """
            },
            "2": {
                "title": "Bin Maintenance",
                "content": """
                Important bin maintenance tips:
                - Keep moisture level similar to a wrung-out sponge
                - Ensure good air flow through ventilation holes
                - Maintain temperature between 55-77°F (13-25°C)
                - Add fresh bedding materials monthly
                - Fluff up bedding to prevent compaction
                - Clean drainage tray if using one
                """
            },
            "3": {
                "title": "Troubleshooting Issues",
                "content": """
                Common issues and solutions:
                - Bad odors: Reduce feeding, add dry bedding
                - Fruit flies: Bury food scraps deeper
                - Escaping worms: Adjust moisture and temperature
                - Mold: Improve ventilation, reduce moisture
                - Slow processing: Check temperature and feeding amount
                - Dead worms: Check moisture, temperature, and toxic foods
                """
            },
            "4": {
                "title": "Harvesting Techniques",
                "content": """
                Methods for harvesting vermicompost:
                - Light method: Expose to light, worms move down
                - Migration method: Place fresh food on one side
                - Hand sorting: Gentle manual separation
                - Screen method: Use mesh screens to separate
                - Allow 3-6 months before first harvest
                - Harvest when material is dark and uniform
                """
            },
            "5": {
                "title": "Best Practices",
                "content": """
                Best practices for successful vermicomposting:
                - Start with appropriate number of worms
                - Use red wigglers (Eisenia fetida)
                - Keep bin in stable environment
                - Monitor moisture and temperature regularly
                - Balance carbon to nitrogen ratio
                - Keep records of feeding and maintenance
                """
            }
        }

    def speak(self, text):
        """Convert text to speech"""
        print(f"Assistant: {text}")
        self.engine.say(text)
        self.engine.runAndWait()

    def listen(self):
        """Listen for voice input and return recognized text"""
        with sr.Microphone() as source:
            print("\nListening...")
            self.recognizer.adjust_for_ambient_noise(source, duration=1)
            try:
                audio = self.recognizer.listen(source, timeout=5)
                text = self.recognizer.recognize_google(audio, language="en-US")
                print(f"You said: {text}")
                return text.lower()
            except sr.WaitTimeoutError:
                self.speak("No speech detected. Please try again.")
                return None
            except sr.UnknownValueError:
                self.speak("Sorry, I couldn't understand that. Please try again.")
                return None
            except sr.RequestError:
                self.speak("Offline mode: Using local recognition.")
                try:
                    # Fallback to local recognition if internet is not available
                    text = self.recognizer.recognize_sphinx(audio)
                    print(f"You said: {text}")
                    return text.lower()
                except:
                    self.speak("Sorry, I'm having trouble understanding you.")
                    return None

    def get_number_from_speech(self, text):
        """Extract number from speech text"""
        number_words = {
            'one': '1', 'two': '2', 'three': '3', 'four': '4', 'five': '5',
            '1': '1', '2': '2', '3': '3', '4': '4', '5': '5'
        }
        
        for word, num in number_words.items():
            if word in text:
                return num
        return None

    def process_command(self, command):
        """Process a voice command and return the response"""
        try:
            if not command:
                return """
                Hello and welcome to VermiTech, your smart vermicomposting assistant.
                I'm here to help you take care of your composting worms and turn kitchen waste into rich, organic fertilizer.
                With just your voice, you can learn how to feed your worms, keep your bin clean, fix problems, and harvest castings easily.
                Whether you're just starting out or already composting, VermiTech makes the process simple and effective.
                Let's grow greener together!

                Please say a number between 1 and 5:
                1 - Worm Care and Feeding
                2 - Bin Maintenance
                3 - Troubleshooting Issues
                4 - Harvesting Techniques
                5 - Best Practices
                """
            
            # Convert command to lowercase for easier matching
            command = command.lower()
            
            # Check for exit commands
            if any(word in command for word in ['exit', 'quit', 'stop']):
                return "Goodbye! Happy vermicomposting!"
            
            # Get number from command
            number = self.get_number_from_speech(command)
            
            if number in self.info:
                info = self.info[number]
                return f"{info['title']}:\n{info['content']}"
            else:
                return """
                Please say a number between 1 and 5, or say 'exit' to quit:
                1 - Worm Care and Feeding
                2 - Bin Maintenance
                3 - Troubleshooting Issues
                4 - Harvesting Techniques
                5 - Best Practices
                """
        except Exception as e:
            return f"Error processing command: {str(e)}"

    def run(self):
        """Main loop for the voice assistant"""
        self.speak("""
        Hello and welcome to VermiTech, your smart vermicomposting assistant.
        I'm here to help you take care of your composting worms and turn kitchen waste into rich, organic fertilizer.
        With just your voice, you can learn how to feed your worms, keep your bin clean, fix problems, and harvest castings easily.
        Whether you're just starting out or already composting, VermiTech makes the process simple and effective.
        Let's grow greener together!

        You can ask for information by saying a number between 1 and 5:
        1 - Worm Care and Feeding
        2 - Bin Maintenance
        3 - Troubleshooting Issues
        4 - Harvesting Techniques
        5 - Best Practices
        """)

        while True:
            text = self.listen()
            if text:
                if "exit" in text or "quit" in text or "stop" in text:
                    self.speak("Goodbye! Happy vermicomposting!")
                    break
                    
                number = self.get_number_from_speech(text)
                if number in self.info:
                    info = self.info[number]
                    self.speak(f"{info['title']}:")
                    self.speak(info['content'])
                else:
                    self.speak("""
                    Please say a number between 1 and 5, or say 'exit' to quit:
                    1 - Worm Care and Feeding
                    2 - Bin Maintenance
                    3 - Troubleshooting Issues
                    4 - Harvesting Techniques
                    5 - Best Practices
                    """)

# Create a global instance
assistant = VermicompostAssistant()

@app.route('/')
def home():
    return "VermiTech AI Voice Assistant API is running"

@app.route('/start', methods=['POST', 'OPTIONS'])
def start_assistant():
    if request.method == 'OPTIONS':
        return '', 200
    try:
        assistant.run()
        return jsonify({
            "status": "success",
            "message": "Hello! I am your VermiTech AI Assistant. How can I help you with vermicomposting today?",
            "type": "greeting"
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/stop', methods=['POST', 'OPTIONS'])
def stop_assistant():
    if request.method == 'OPTIONS':
        return '', 200
    try:
        assistant.run()
        return jsonify({"status": "success", "message": "Voice assistant stopped"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/voice/process', methods=['POST', 'OPTIONS'])
def process_voice_command():
    if request.method == 'OPTIONS':
        return '', 200
    try:
        data = request.json
        command = data.get('command', '')
        response = assistant.process_command(command)
        return jsonify({"status": "success", "message": response})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/voice/status', methods=['GET'])
def get_assistant_status():
    return jsonify({
        "status": "running" if assistant.is_listening else "stopped",
        "message": "Voice assistant is running" if assistant.is_listening else "Voice assistant is stopped"
    })

@app.route('/')
def index():
    return jsonify({
        "status": "ok",
        "message": "Voice Assistant API is running",
        "endpoints": {
            "/start": "Start the voice assistant",
            "/stop": "Stop the voice assistant",
            "/api/voice/process": "Process voice commands",
            "/api/voice/status": "Get voice assistant status"
        }
    })

if __name__ == '__main__':
    app.run(debug=True, port=5001)
