import os
import cv2
import argparse
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def create_dataset_structure(base_dir):
    """Create the necessary directory structure for the dataset"""
    categories = ['worms', 'moisture', 'food', 'pests', 'empty']
    
    for category in categories:
        os.makedirs(os.path.join(base_dir, 'images', 'train', category), exist_ok=True)
        os.makedirs(os.path.join(base_dir, 'images', 'val', category), exist_ok=True)
        os.makedirs(os.path.join(base_dir, 'labels', 'train', category), exist_ok=True)
        os.makedirs(os.path.join(base_dir, 'labels', 'val', category), exist_ok=True)
    
    logger.info('Created dataset directory structure')

def capture_images(output_dir, category, num_images=10):
    """Capture images from webcam and save them"""
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        logger.error('Could not open webcam')
        return
    
    logger.info(f'Capturing {num_images} images for category: {category}')
    
    for i in range(num_images):
        ret, frame = cap.read()
        if not ret:
            logger.error('Failed to capture frame')
            continue
            
        # Create filename with timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'{timestamp}_{category}.jpg'
        
        # Save image
        image_path = os.path.join(output_dir, 'images', 'train', category, filename)
        cv2.imwrite(image_path, frame)
        logger.info(f'Saved image: {image_path}')
        
        # Add small delay between captures
        cv2.waitKey(1000)
    
    cap.release()
    cv2.destroyAllWindows()
    logger.info('Image capture complete')

def main():
    parser = argparse.ArgumentParser(description='Collect training data for vermicomposting monitoring')
    parser.add_argument('--output', default='data/dataset', help='Output directory for dataset')
    parser.add_argument('--category', required=True, help='Category to collect (worms, moisture, food, pests, empty)')
    parser.add_argument('--num-images', type=int, default=10, help='Number of images to capture')
    
    args = parser.parse_args()
    
    # Create dataset structure
    create_dataset_structure(args.output)
    
    # Capture images
    capture_images(args.output, args.category, args.num_images)

if __name__ == '__main__':
    main()
