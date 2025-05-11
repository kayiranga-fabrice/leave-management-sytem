# Offline Voice Assistant for Vermicomposting

A voice-controlled assistant that provides information about vermicomposting. It works offline and is perfect for Raspberry Pi or desktop setups.

## Features

- Voice-controlled interface
- Works offline (with fallback to local recognition)
- Provides information on 5 key vermicomposting topics:
  1. Worm Care and Feeding
  2. Bin Maintenance
  3. Troubleshooting Issues
  4. Harvesting Techniques
  5. Best Practices

## Installation

1. Clone this repository:
```bash
git clone <repository-url>
cd vermicompost-voice-assistant
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install required packages:
```bash
pip install -r requirements.txt
```

### System Dependencies

#### Windows
- No additional dependencies required

#### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install python3-espeak
sudo apt-get install portaudio19-dev python3-pyaudio
```

#### macOS
```bash
brew install portaudio
brew install espeak
```

## Usage

1. Run the voice assistant:
```bash
python voice_assistant.py
```

2. When prompted, speak a number between 1 and 5 to get information about:
   - 1: Worm Care and Feeding
   - 2: Bin Maintenance
   - 3: Troubleshooting Issues
   - 4: Harvesting Techniques
   - 5: Best Practices

3. To exit, say "quit", "exit", or "stop"

## Features

- Text-to-speech output with adjustable speed and volume
- Automatic female voice selection (if available)
- Ambient noise adjustment
- Offline speech recognition fallback
- Clear, categorized vermicomposting information
- Simple number-based navigation

## Troubleshooting

If you encounter issues:

1. Check your microphone is properly connected and set as default
2. Ensure you're in a relatively quiet environment
3. Speak clearly and at a normal pace
4. If online recognition fails, the system will automatically switch to offline mode

## Contributing

Feel free to submit issues, fork the repository, and create pull requests for any improvements.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
