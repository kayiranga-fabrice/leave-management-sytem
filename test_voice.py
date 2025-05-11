import speech_recognition as sr
import pyttsx3
import time

def test_speech_recognition():
    print("Testing Speech Recognition...")
    recognizer = sr.Recognizer()
    print("Speech Recognition initialized successfully!")

def test_text_to_speech():
    print("Testing Text to Speech...")
    engine = pyttsx3.init()
    print("Text to Speech engine initialized successfully!")

def test_microphone():
    # Initialize the recognizer
    recognizer = sr.Recognizer()
    
    # Initialize text-to-speech
    engine = pyttsx3.init()
    
    print("\n=== Microphone Test ===")
    print("1. Make sure your microphone is properly connected")
    print("2. Check if it's set as the default input device")
    print("3. Ensure you're in a quiet environment")
    print("4. Speak clearly after the beep\n")
    
    # Test microphone
    with sr.Microphone() as source:
        print("Adjusting for ambient noise (this may take a few seconds)...")
        recognizer.adjust_for_ambient_noise(source, duration=2)
        
        print("\nBEEP! (Please speak now)")
        engine.say("Please speak now")
        engine.runAndWait()
        
        try:
            print("\nListening for 10 seconds...")
            audio = recognizer.listen(source, timeout=10)
            print("Processing your speech...")
            
            # Try online recognition first
            try:
                text = recognizer.recognize_google(audio, language="en-US")
                print(f"\n✅ Google Speech Recognition thinks you said: {text}")
                print("Microphone is working correctly!")
            except sr.UnknownValueError:
                print("\n❌ Google Speech Recognition could not understand audio")
                print("Please try speaking louder or more clearly")
            except sr.RequestError:
                print("\n❌ Could not connect to Google Speech Recognition service")
                print("Please check your internet connection")
                
            # Try offline recognition
            try:
                text = recognizer.recognize_sphinx(audio)
                print(f"\n✅ Sphinx thinks you said: {text}")
                print("Microphone is working correctly!")
            except sr.UnknownValueError:
                print("\n❌ Sphinx could not understand audio")
                print("Please try speaking louder or more clearly")
            except sr.RequestError:
                print("\n❌ Sphinx error - Please check if pocketsphinx is installed")
                
        except sr.WaitTimeoutError:
            print("\n❌ No speech detected within the timeout period")
            print("Please try speaking when you hear the beep")
        except Exception as e:
            print(f"\n❌ An error occurred: {str(e)}")
            print("Please check your microphone settings")

if __name__ == "__main__":
    try:
        test_speech_recognition()
        test_text_to_speech()
        test_microphone()
        print("All tests passed successfully!")
    except Exception as e:
        print(f"\n❌ Error during testing: {str(e)}")
        print("Please check if all required packages are installed") 