from gtts import gTTS

welcome_message = (
    "Hello and welcome to VermiTech, your smart vermicomposting assistant. "
    "I'm here to help you take care of your composting worms and turn kitchen waste into rich, organic fertilizer. "
    "With just your voice, you can learn how to feed your worms, keep your bin clean, fix problems, and harvest castings easily. "
    "Whether you're just starting out or already composting, VermiTech makes the process simple and effective. "
    "Let's grow greener together!"
)

# Create audio file
tts = gTTS(text=welcome_message, lang='en', slow=False)

# Save the audio file
tts.save('public/audio/welcome.mp3')
print("Welcome message audio file created successfully!") 