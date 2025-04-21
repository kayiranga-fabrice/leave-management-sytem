// Voice Assistant for Vermicomposting System
class VoiceAssistant {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.voiceCommands = {
            'start': ['start', 'begin', 'launch', 'activate'],
            'stop': ['stop', 'end', 'quit', 'exit'],
            'bin': ['bin', 'bed', 'compost bin'],
            'feeding': ['feed', 'feeding', 'food', 'add food'],
            'harvest': ['harvest', 'collect', 'gather', 'yield'],
            'status': ['status', 'check', 'report', 'monitor'],
            'help': ['help', 'guide', 'assist', 'support']
        };
    }

    // Initialize speech recognition
    async init() {
        try {
            this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            
            // Set up event listeners
            this.recognition.onresult = (event) => this.onResult(event);
            this.recognition.onend = () => this.onEnd();
            this.recognition.onerror = (event) => this.onError(event);

            // Add UI elements
            this.addVoiceUI();
            
            return true;
        } catch (error) {
            console.error('Voice recognition not supported:', error);
            return false;
        }
    }

    // Add voice UI elements
    addVoiceUI() {
        const voiceContainer = document.createElement('div');
        voiceContainer.className = 'voice-assistant-container';
        voiceContainer.innerHTML = `
            <button id="voiceToggle" class="btn btn-primary">
                <i class="fas fa-microphone"></i> Voice Assistant
            </button>
            <div id="voiceStatus" class="voice-status">
                <div class="status-indicator">
                    <div class="mic-icon">
                        <i class="fas fa-microphone"></i>
                    </div>
                    <div class="mic-anim"></div>
                    <div class="mic-anim"></div>
                    <div class="mic-anim"></div>
                </div>
                <span class="status-text">Click to activate voice assistant</span>
            </div>
        `;
        
        document.body.appendChild(voiceContainer);
        
        // Add event listeners
        document.getElementById('voiceToggle').addEventListener('click', () => this.toggleListening());
    }

    // Toggle voice listening
    toggleListening() {
        if (!this.recognition) return;
        
        const button = document.getElementById('voiceToggle');
        const micIcon = button.querySelector('.fas');
        
        if (this.isListening) {
            this.stopListening();
            button.classList.remove('active');
            micIcon.classList.remove('fa-microphone-slash');
            micIcon.classList.add('fa-microphone');
            this.updateStatus('Click to activate voice assistant');
        } else {
            this.startListening();
            button.classList.add('active');
            micIcon.classList.remove('fa-microphone');
            micIcon.classList.add('fa-microphone-slash');
            this.updateStatus('Listening...');
        }
    }

    // Start listening
    startListening() {
        if (!this.recognition) return;
        
        this.isListening = true;
        this.recognition.start();
        this.updateStatus('Listening...');
        
        // Speak welcome message
        const utterance = new SpeechSynthesisUtterance('Voice assistant activated. Say "help" to see available commands.');
        window.speechSynthesis.speak(utterance);
    }

    // Stop listening
    stopListening() {
        if (!this.recognition) return;
        
        this.isListening = false;
        this.recognition.stop();
        this.updateStatus('Click to activate voice assistant');
    }

    // Handle speech recognition results
    onResult(event) {
        const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('');

        if (event.results[0].isFinal) {
            this.updateStatus(`Heard: ${transcript}`);
            this.processCommand(transcript.toLowerCase());
        }
    }

    // Handle speech recognition end
    onEnd() {
        if (this.isListening) {
            this.recognition.start();
        }
    }

    // Handle speech recognition error
    onError(event) {
        console.error('Speech recognition error:', event.error);
        this.updateStatus('Error: ' + event.error);
    }

    // Process voice commands
    processCommand(command) {
        // Speak the response
        const utterance = new SpeechSynthesisUtterance();
        
        // Match command keywords
        for (const [action, keywords] of Object.entries(this.voiceCommands)) {
            if (keywords.some(keyword => command.includes(keyword))) {
                switch (action) {
                    case 'start':
                        utterance.text = 'Voice assistant activated. How can I help you with your vermicomposting system?';
                        break;
                    case 'stop':
                        utterance.text = 'Voice assistant deactivated. Goodbye!';
                        this.stopListening();
                        break;
                    case 'bin':
                        utterance.text = 'I can help you with bin management. Would you like to check status or make changes?';
                        break;
                    case 'feeding':
                        utterance.text = 'I can help you with feeding records. Would you like to add a new record or check existing ones?';
                        break;
                    case 'harvest':
                        utterance.text = 'I can help you with harvest tracking. Would you like to record a new harvest or check your yield?';
                        break;
                    case 'status':
                        utterance.text = 'Let me check the current status of your vermicomposting system...';
                        // Add API call to get status
                        break;
                    case 'help':
                        utterance.text = 'I can help you with: bin management, feeding records, harvest tracking, and system status. What would you like assistance with?';
                        break;
                }
                
                window.speechSynthesis.speak(utterance);
                return;
            }
        }

        // If no command matched
        utterance.text = 'I didn't understand that command. Please try again or say "help" for available options.';
        window.speechSynthesis.speak(utterance);
    }

    // Update status text
    updateStatus(text) {
        const statusText = document.querySelector('.status-text');
        if (statusText) {
            statusText.textContent = text;
        }
    }
}

// Initialize the voice assistant when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const voiceAssistant = new VoiceAssistant();
    voiceAssistant.init().then(isSupported => {
        if (!isSupported) {
            alert('Voice assistant is not supported in your browser. Please use Chrome or Edge.');
        }
    });
});
