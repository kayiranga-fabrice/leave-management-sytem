from flask import Flask, request, Response, jsonify
from twilio.twiml.voice_response import VoiceResponse, Gather
from twilio.jwt.access_token import AccessToken
from twilio.jwt.access_token.grants import VoiceGrant
import json
from voice_assistant import VoiceAssistant
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
assistant = VoiceAssistant()

# Load knowledge base
with open('knowledge_base.json', 'r') as f:
    knowledge_base = json.load(f)

@app.route("/token", methods=['GET'])
def token():
    """Generate a capability token for Twilio Client"""
    account_sid = os.environ.get('TWILIO_ACCOUNT_SID')
    auth_token = os.environ.get('TWILIO_AUTH_TOKEN')
    twilio_number = os.environ.get('TWILIO_PHONE_NUMBER')

    # Create access token with credentials
    token = AccessToken(account_sid, auth_token)
    token.identity = 'user'

    # Create a Voice grant and add to token
    voice_grant = VoiceGrant(
        outgoing_application_sid=os.environ.get('TWILIO_APP_SID'),
        incoming_allow=True
    )
    token.add_grant(voice_grant)

    return jsonify({
        'token': token.to_jwt().decode(),
        'identity': 'user'
    })

@app.route("/voice", methods=['GET', 'POST'])
def voice():
    """Handle incoming voice calls"""
    response = VoiceResponse()
    
    # Start with a welcome message
    gather = Gather(
        input='speech dtmf',
        timeout=3,
        action='/handle-input',
        method='POST'
    )
    gather.say("Welcome to VermiTech IVR. Press 1 for worm care instructions, 2 for compost quality information, 3 for feeding guidelines, or ask your question directly.")
    response.append(gather)
    
    return str(response)

@app.route("/handle-input", methods=['GET', 'POST'])
def handle_input():
    """Process user input from the call"""
    response = VoiceResponse()
    user_input = request.values.get('SpeechResult', '').lower()
    digits = request.values.get('Digits', '')
    
    # Handle DTMF input
    if digits:
        if digits == '1':
            response.say("For worm care, maintain a temperature between 55 and 77 degrees Fahrenheit, keep the bedding moist but not wet, and ensure proper ventilation.")
        elif digits == '2':
            response.say("Good compost should be dark, crumbly, and have an earthy smell. It should be free of large food scraps and have a balanced moisture content.")
        elif digits == '3':
            response.say("Feed your worms small amounts of fruit and vegetable scraps, coffee grounds, and crushed eggshells. Avoid meat, dairy, and oily foods.")
        else:
            response.say("I didn't understand that option. Please try again.")
    # Handle speech input
    elif user_input:
        # Use the existing voice assistant to process the query
        answer = assistant.find_best_match(user_input)
        response.say(answer)
    else:
        response.say("I didn't catch that. Please try again.")
    
    # Add a gather to continue the conversation
    gather = Gather(
        input='speech dtmf',
        timeout=3,
        action='/handle-input',
        method='POST'
    )
    response.append(gather)
    
    return str(response)

if __name__ == "__main__":
    app.run(debug=True, port=5001) 