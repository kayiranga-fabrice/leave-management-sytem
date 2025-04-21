import cv2
import torch
from PIL import Image
from datetime import datetime
import exifread
import numpy as np
import logging
import os
from pathlib import Path

class VermiDetector:
    def __init__(self, model_path=None):
        try:
            self.model_path = model_path or str(Path(__file__).parent.parent / 'models' / 'best.pt')
            self.model = torch.hub.load('ultralytics/yolov5', 'custom', path=self.model_path)
            self.model.conf = 0.5  # Confidence threshold
            self.model.iou = 0.45  # IOU threshold
            
            # Initialize logger
            self.logger = logging.getLogger('VermiDetector')
            self.logger.setLevel(logging.DEBUG)
            
            # Define condition thresholds
            self.condition_thresholds = {
                'worm_density': (0.3, 0.7),  # low, high
                'moisture_level': (0.3, 0.7),  # dry, wet
                'food_level': (0.2, 0.6),  # low, high
                'pest_detection': (0.1, 0.3)  # low, high
            }
            
            self.logger.info(f'Initialized VermiDetector with model: {self.model_path}')
            
        except Exception as e:
            self.logger.error(f'Failed to initialize VermiDetector: {str(e)}')
            raise

    def analyze_image(self, image_path):
        """
        Analyze an image and return vermicomposting conditions
        """
        try:
            self.logger.info(f'Analyzing image: {image_path}')
            
            # Validate image path
            if not os.path.exists(image_path):
                raise FileNotFoundError(f'Image not found: {image_path}')
                
            # Load and preprocess image
            img = cv2.imread(image_path)
            if img is None:
                raise ValueError(f'Failed to load image: {image_path}')
                
            results = self.model(img)
            
            # Extract EXIF data
            exif_data = self._extract_exif(image_path)
            
            # Analyze conditions
            conditions = self._analyze_conditions(results, img)
            
            # Generate recommendations
            recommendations = self._generate_recommendations(conditions)
            
            self.logger.info(f'Analysis complete. Conditions: {conditions}')
            
            return {
                'timestamp': exif_data.get('timestamp', datetime.now().isoformat()),
                'image_path': image_path,
                'conditions': conditions,
                'recommendations': recommendations,
                'success': True
            }
            
        except Exception as e:
            self.logger.error(f'Error analyzing image: {str(e)}', exc_info=True)
            return {
                'error': str(e),
                'success': False
            }

    def analyze_image(self, image_path):
        """
        Analyze an image and return vermicomposting conditions
        """
        try:
            # Load and preprocess image
            img = cv2.imread(image_path)
            results = self.model(img)
            
            # Extract EXIF data
            exif_data = self._extract_exif(image_path)
            
            # Analyze conditions
            conditions = self._analyze_conditions(results, img)
            
            return {
                'timestamp': exif_data.get('timestamp', datetime.now().isoformat()),
                'conditions': conditions,
                'recommendations': self._generate_recommendations(conditions)
            }
            
        except Exception as e:
            return {'error': str(e)}

    def _extract_exif(self, image_path):
        """
        Extract EXIF data from image
        """
        try:
            with open(image_path, 'rb') as f:
                tags = exifread.process_file(f)
                
            exif_data = {}
            if 'Image DateTime' in tags:
                exif_data['timestamp'] = str(tags['Image DateTime'])
                
            # Extract other useful EXIF data
            if 'EXIF DateTimeOriginal' in tags:
                exif_data['original_timestamp'] = str(tags['EXIF DateTimeOriginal'])
                
            if 'Image Make' in tags:
                exif_data['camera_make'] = str(tags['Image Make'])
                
            if 'Image Model' in tags:
                exif_data['camera_model'] = str(tags['Image Model'])
                
            self.logger.debug(f'Extracted EXIF data: {exif_data}')
            return exif_data
            
        except Exception as e:
            self.logger.warning(f'Failed to extract EXIF data: {str(e)}')
            return {'error': str(e)}

    def _analyze_conditions(self, results, img):
        """
        Analyze image conditions based on detected objects
        """
        try:
            conditions = {}
            
            # Get image dimensions
            h, w, _ = img.shape
            
            # Count worms
            worm_detections = len([x for x in results.xyxy[0] if x[5] == 0])
            conditions['worm_density'] = worm_detections / (h * w)
            
            # Analyze moisture (based on color analysis)
            hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
            moisture_mask = cv2.inRange(hsv, (0, 0, 0), (180, 255, 100))
            moisture_ratio = cv2.countNonZero(moisture_mask) / (h * w)
            conditions['moisture_level'] = moisture_ratio
            
            # Analyze food level (based on color analysis)
            food_mask = cv2.inRange(hsv, (30, 40, 40), (90, 255, 255))
            food_ratio = cv2.countNonZero(food_mask) / (h * w)
            conditions['food_level'] = food_ratio
            
            # Analyze pest detection
            pest_detections = len([x for x in results.xyxy[0] if x[5] == 3])
            conditions['pest_detection'] = pest_detections / (h * w)
            
            # Normalize conditions to 0-1 range
            for condition, value in conditions.items():
                if condition in self.condition_thresholds:
                    low, high = self.condition_thresholds[condition]
                    normalized = (value - low) / (high - low)
                    conditions[condition] = max(0, min(1, normalized))
            
            self.logger.debug(f'Analyzed conditions: {conditions}')
            return conditions
            
        except Exception as e:
            self.logger.error(f'Error analyzing conditions: {str(e)}', exc_info=True)
            return {'error': str(e)}

    def _generate_recommendations(self, conditions):
        """
        Generate recommendations based on conditions
        """
        try:
            recommendations = []
            
            # Check worm density
            if 'worm_density' in conditions:
                density = conditions['worm_density']
                if density < self.condition_thresholds['worm_density'][0]:
                    recommendations.append('Add more worms to the bin')
                elif density > self.condition_thresholds['worm_density'][1]:
                    recommendations.append('Consider splitting the worm population')
            
            # Check moisture level
            if 'moisture_level' in conditions:
                moisture = conditions['moisture_level']
                if moisture < self.condition_thresholds['moisture_level'][0]:
                    recommendations.append('Add more water to maintain moisture')
                elif moisture > self.condition_thresholds['moisture_level'][1]:
                    recommendations.append('Reduce watering or add more bedding')
            
            # Check food level
            if 'food_level' in conditions:
                food = conditions['food_level']
                if food < self.condition_thresholds['food_level'][0]:
                    recommendations.append('Add more food waste')
                elif food > self.condition_thresholds['food_level'][1]:
                    recommendations.append('Reduce food additions to prevent overfeeding')
            
            # Check pest detection
            if 'pest_detection' in conditions:
                pests = conditions['pest_detection']
                if pests > self.condition_thresholds['pest_detection'][1]:
                    recommendations.append('Check for and remove pests from the bin')
            
            self.logger.debug(f'Generated recommendations: {recommendations}')
            return recommendations
            
        except Exception as e:
            self.logger.error(f'Error generating recommendations: {str(e)}', exc_info=True)
            return ['Error generating recommendations']

    def visualize_results(self, image_path, results, output_path=None):
        """
        Visualize the analysis results on the image and optionally save it
        """
        try:
            img = cv2.imread(image_path)
            if img is None:
                raise ValueError(f'Failed to load image: {image_path}')
                
            # Draw bounding boxes
            for box in results.xyxy[0]:
                x1, y1, x2, y2, conf, cls = box
                x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
                
                # Define colors based on class
                colors = {
                    0: (0, 255, 0),  # worms (green)
                    1: (255, 0, 0),  # food (blue)
                    2: (0, 0, 255),  # moisture (red)
                    3: (0, 255, 255) # pests (yellow)
                }
                
                color = colors.get(int(cls), (255, 255, 255))
                
                cv2.rectangle(img, (x1, y1), (x2, y2), color, 2)
                cv2.putText(img, f'Conf: {conf:.2f}', (x1, y1-10), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
            
            # Save or return the image
            if output_path:
                cv2.imwrite(output_path, img)
                self.logger.info(f'Saved visualization to: {output_path}')
            
            return img
            
        except Exception as e:
            self.logger.error(f'Error visualizing results: {str(e)}', exc_info=True)
            return None
