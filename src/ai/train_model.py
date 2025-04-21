import os
import yaml
from pathlib import Path
from datetime import datetime

# Define dataset structure
def create_dataset_structure():
    """
    Create the necessary directory structure for the dataset
    """
    base_dir = Path('src/data/dataset')
    
    # Create directories
    (base_dir / 'images' / 'train').mkdir(parents=True, exist_ok=True)
    (base_dir / 'images' / 'val').mkdir(parents=True, exist_ok=True)
    (base_dir / 'labels' / 'train').mkdir(parents=True, exist_ok=True)
    (base_dir / 'labels' / 'val').mkdir(parents=True, exist_ok=True)
    
    # Create classes.txt
    classes = [
        'worm',
        'food',
        'moisture',
        'pest'
    ]
    
    with open(base_dir / 'classes.txt', 'w') as f:
        f.write('\n'.join(classes))
    
    return base_dir

def create_yolo_config():
    """
    Create YOLO configuration file
    """
    config = {
        'train': 'src/data/dataset/images/train',
        'val': 'src/data/dataset/images/val',
        'nc': 4,  # Number of classes
        'names': ['worm', 'food', 'moisture', 'pest']
    }
    
    with open('src/data/dataset/data.yaml', 'w') as f:
        yaml.dump(config, f)

def train_model():
    """
    Train the YOLO model
    """
    # Create necessary directories
    base_dir = create_dataset_structure()
    create_yolo_config()
    
    # Define training parameters
    training_params = {
        'imgsz': 640,
        'batch': 16,
        'epochs': 100,
        'data': 'src/data/dataset/data.yaml',
        'weights': 'yolov5s.pt',
        'project': 'src/models',
        'name': f'worm_detection_{datetime.now().strftime('%Y%m%d_%H%M%S')}'
    }
    
    # Run training
    os.system(f"python yolov5/train.py \
        --img {training_params['imgsz']} \
        --batch {training_params['batch']} \
        --epochs {training_params['epochs']} \
        --data {training_params['data']} \
        --weights {training_params['weights']} \
        --project {training_params['project']} \
        --name {training_params['name']}")

if __name__ == '__main__':
    train_model()
