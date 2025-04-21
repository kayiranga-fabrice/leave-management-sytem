import os
from pathlib import Path

class Config:
    # Base directory
    BASE_DIR = Path(__file__).parent.parent
    
    # Upload settings
    UPLOAD_FOLDER = str(BASE_DIR / 'data' / 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
    
    # Model settings
    MODEL_PATH = str(BASE_DIR / 'models' / 'best.pt')
    
    # Camera settings
    CAMERA_WIDTH = 640
    CAMERA_HEIGHT = 480
    
    # Analysis settings
    CONFIDENCE_THRESHOLD = 0.5
    IOU_THRESHOLD = 0.45
    
    # Condition thresholds
    CONDITION_THRESHOLDS = {
        'worm_density': (0.3, 0.7),  # low, high
        'moisture_level': (0.3, 0.7),  # dry, wet
        'food_level': (0.2, 0.6),  # low, high
        'pest_detection': (0.1, 0.3)  # low, high
    }
    
    # Logging settings
    LOG_FILE = str(BASE_DIR / 'logs' / 'vermi_monitor.log')
    LOG_LEVEL = 'DEBUG'
    
    # API settings
    API_VERSION = 'v1'
    API_PREFIX = f'/api/{API_VERSION}'
    
    # Cache settings
    CACHE_TIMEOUT = 3600  # 1 hour
    
    # Database settings (if needed)
    DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///vermi_monitor.db')
    
    @staticmethod
    def init_app(app):
        # Create necessary directories
        os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
        os.makedirs(os.path.dirname(Config.LOG_FILE), exist_ok=True)
        
        # Set Flask config
        app.config.from_object(Config)
        
        # Initialize logging
        import logging
        from logging.handlers import RotatingFileHandler
        
        handler = RotatingFileHandler(
            Config.LOG_FILE,
            maxBytes=1024 * 1024 * 10,  # 10MB
            backupCount=5
        )
        
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        handler.setFormatter(formatter)
        
        app.logger.addHandler(handler)
        app.logger.setLevel(getattr(logging, Config.LOG_LEVEL))
        
        app.logger.info('Application started')
        app.logger.info(f'Config: {Config.__dict__}')
