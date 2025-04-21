import os
import unittest
from datetime import datetime
import requests
from PIL import Image
import numpy as np
from ai.vermi_detector import VermiDetector
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

class TestVermiMonitor(unittest.TestCase):
    def setUp(self):
        """Set up test environment"""
        self.test_dir = 'test_data'
        self.test_image = 'test_image.jpg'
        
        # Create test directory if it doesn't exist
        os.makedirs(self.test_dir, exist_ok=True)
        
        # Create a test image (green background with red square)
        img = Image.new('RGB', (640, 480), color = (0, 255, 0))  # green background
        pixels = np.array(img)
        pixels[100:200, 100:200] = [255, 0, 0]  # red square
        img = Image.fromarray(pixels)
        self.test_image_path = os.path.join(self.test_dir, self.test_image)
        img.save(self.test_image_path)
        
        # Initialize detector
        self.detector = VermiDetector()
        
    def tearDown(self):
        """Clean up test environment"""
        if os.path.exists(self.test_image_path):
            os.remove(self.test_image_path)
        
    def test_image_analysis(self):
        """Test image analysis functionality"""
        logger.info('Testing image analysis')
        
        try:
            results = self.detector.analyze_image(self.test_image_path)
            self.assertTrue(results.get('success', False), 'Analysis failed')
            
            # Check if all expected conditions are present
            expected_conditions = ['worm_density', 'moisture_level', 'food_level', 'pest_detection']
            for condition in expected_conditions:
                self.assertIn(condition, results['conditions'], f'Missing condition: {condition}')
                
            # Check if recommendations are present
            self.assertIsInstance(results['recommendations'], list)
            
            logger.info('Image analysis test passed')
            
        except Exception as e:
            logger.error(f'Image analysis test failed: {str(e)}')
            self.fail(str(e))
            
    def test_api_endpoint(self):
        """Test API endpoint"""
        logger.info('Testing API endpoint')
        
        try:
            # Start Flask app
            from web.app import app
            app.config['TESTING'] = True
            self.client = app.test_client()
            
            # Test health check
            response = self.client.get('/health')
            self.assertEqual(response.status_code, 200)
            data = response.get_json()
            self.assertEqual(data['status'], 'healthy')
            
            # Test image analysis
            with open(self.test_image_path, 'rb') as img:
                response = self.client.post(
                    '/analyze',
                    data={'image': (img, self.test_image)},
                    content_type='multipart/form-data'
                )
                
            self.assertEqual(response.status_code, 200)
            data = response.get_json()
            self.assertTrue(data.get('success', False), 'API analysis failed')
            
            logger.info('API endpoint test passed')
            
        except Exception as e:
            logger.error(f'API endpoint test failed: {str(e)}')
            self.fail(str(e))
            
    def test_error_handling(self):
        """Test error handling"""
        logger.info('Testing error handling')
        
        try:
            # Test with non-existent file
            with self.assertRaises(FileNotFoundError):
                self.detector.analyze_image('non_existent_file.jpg')
                
            # Test with invalid file type
            with self.assertRaises(ValueError):
                self.detector.analyze_image('test.txt')
                
            logger.info('Error handling test passed')
            
        except Exception as e:
            logger.error(f'Error handling test failed: {str(e)}')
            self.fail(str(e))
            
    def test_exif_extraction(self):
        """Test EXIF data extraction"""
        logger.info('Testing EXIF extraction')
        
        try:
            # Create a test image with EXIF data
            img = Image.new('RGB', (640, 480))
            img.save(self.test_image_path, format='JPEG', exif=b'\x00' * 10)  # Add some EXIF data
            
            # Test EXIF extraction
            exif_data = self.detector._extract_exif(self.test_image_path)
            self.assertIn('error', exif_data, 'Expected error in EXIF extraction')
            
            logger.info('EXIF extraction test passed')
            
        except Exception as e:
            logger.error(f'EXIF extraction test failed: {str(e)}')
            self.fail(str(e))

if __name__ == '__main__':
    unittest.main()
