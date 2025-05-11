from gtts import gTTS
import os
import pygame
from time import sleep

class VoiceWelcome:
    def __init__(self):
        self.audio_dir = 'static/audio'
        self.audio_file = os.path.join(self.audio_dir, 'welcome.mp3')
        self.welcome_message = (
            "Hello and welcome to VermiTech, your smart vermicomposting assistant. "
            "I'm here to help you take care of your composting worms and turn kitchen waste into rich, organic fertilizer. "
            "With just your voice, you can learn how to feed your worms, keep your bin clean, fix problems, and harvest castings easily. "
            "Whether you're just starting out or already composting, VermiTech makes the process simple and effective. "
            "Let's grow greener together!"
        )
        self._ensure_audio_file_exists()
        
    def _ensure_audio_file_exists(self):
        """Ensure the audio file exists, create if it doesn't"""
        try:
            if not os.path.exists(self.audio_dir):
                os.makedirs(self.audio_dir)
                
            if not os.path.exists(self.audio_file):
                print("Generating welcome message...")
                tts = gTTS(text=self.welcome_message, lang='en', slow=False)
                tts.save(self.audio_file)
                print("Welcome message generated successfully!")
        except Exception as e:
            print(f"Error creating audio file: {str(e)}")
            raise
    
    def speak(self):
        """Play the welcome message"""
        try:
            # Initialize pygame mixer
            pygame.mixer.quit()  # Quit any existing pygame mixer
            pygame.mixer.init(frequency=44100)
            
            # Load and play the audio
            print("Playing welcome message...")
            pygame.mixer.music.load(self.audio_file)
            pygame.mixer.music.play()
            
            # Wait for the audio to finish
            while pygame.mixer.music.get_busy():
                sleep(0.1)
            
            # Clean up
            pygame.mixer.quit()
            
            return {"status": "success", "message": "Welcome message played successfully"}
            
        except Exception as e:
            error_msg = f"Error playing audio: {str(e)}"
            print(error_msg)
            return {"status": "error", "message": error_msg}

# Create a global instance
voice_welcome = VoiceWelcome()

def speak_welcome():
    """Function to be called from Flask"""
    return voice_welcome.speak()

if __name__ == "__main__":
    speak_welcome() 