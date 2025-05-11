from flask import Flask, jsonify
from flask_cors import CORS
from voice_welcome import speak_welcome

app = Flask(__name__)
CORS(app)

@app.route('/welcome', methods=['POST'])
def welcome():
    try:
        result = speak_welcome()
        return jsonify(result)
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Server error: {str(e)}"
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"}), 200

if __name__ == '__main__':
    print("Starting Flask server...")
    app.run(host='0.0.0.0', port=5000, debug=True) 