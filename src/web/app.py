from flask import Flask, request, jsonify, render_template
from werkzeug.utils import secure_filename
import os
from datetime import datetime
from ai.vermi_detector import VermiDetector
import logging
import traceback

app = Flask(__name__)
app.config.from_object('web.config.Config')

# Initialize logger
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Initialize the detector
vermi_detector = VermiDetector()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def get_error_response(error, status_code=400):
    """Create a standardized error response"""
    logger.error(f'Error: {str(error)}\n{traceback.format_exc()}')
    return jsonify({
        'error': str(error),
        'success': False,
        'timestamp': datetime.now().isoformat()
    }), status_code

@app.route('/')
def index():
    try:
        logger.info('Rendering index page')
        return render_template('index.html', title='Home')
    except Exception as e:
        return get_error_response(e)

@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        logger.info('Received analyze request')
        
        # Validate request
        if 'image' not in request.files:
            return get_error_response('No image provided')
            
        file = request.files['image']
        if file.filename == '':
            return get_error_response('No selected file')
            
        if not file or not allowed_file(file.filename):
            return get_error_response('Invalid file type')
            
        # Save image
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        save_path = os.path.join(app.config['UPLOAD_FOLDER'], f'{timestamp}_{filename}')
        
        # Create upload directory if it doesn't exist
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        
        file.save(save_path)
        logger.info(f'Saved image to: {save_path}')
        
        # Analyze the image
        results = vermi_detector.analyze_image(save_path)
        
        if not results.get('success', True):
            return get_error_response(results.get('error', 'Analysis failed'))
            
        logger.info('Analysis complete')
        return jsonify(results)
        
    except Exception as e:
        return get_error_response(e, 500)

@app.route('/health')
def health_check():
    """Health check endpoint"""
    try:
        logger.info('Health check requested')
        return jsonify({
            'status': 'healthy',
            'timestamp': datetime.now().isoformat(),
            'model_path': vermi_detector.model_path,
            'config': {
                'confidence_threshold': vermi_detector.model.conf,
                'iou_threshold': vermi_detector.model.iou
            }
        })
    except Exception as e:
        return get_error_response(e)

@app.errorhandler(404)
def not_found_error(error):
    logger.warning(f'404 error: {str(error)}')
    return jsonify({
        'error': 'Not Found',
        'success': False,
        'timestamp': datetime.now().isoformat()
    }), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f'500 error: {str(error)}')
    return jsonify({
        'error': 'Internal Server Error',
        'success': False,
        'timestamp': datetime.now().isoformat()
    }), 500

if __name__ == '__main__':
    logger.info('Starting application')
    app.run(debug=True)
