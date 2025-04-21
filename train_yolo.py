import os
import yaml
import argparse
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def create_dataset_yaml(dataset_dir):
    """Create YOLO dataset configuration file"""
    categories = ['worms', 'moisture', 'food', 'pests']
    
    config = {
        'path': str(dataset_dir),
        'train': 'images/train',
        'val': 'images/val',
        'nc': len(categories),
        'names': categories
    }
    
    yaml_path = dataset_dir / 'data.yaml'
    with open(yaml_path, 'w') as f:
        yaml.dump(config, f)
    
    logger.info(f'Created dataset configuration: {yaml_path}')
    return yaml_path

def prepare_dataset(dataset_dir, train_ratio=0.8):
    """Prepare dataset by splitting into train/val sets"""
    categories = ['worms', 'moisture', 'food', 'pests', 'empty']
    
    for category in categories:
        # Get all images in category
        images = list((dataset_dir / 'images' / 'train' / category).glob('*.jpg'))
        
        # Shuffle and split
        import random
        random.shuffle(images)
        split_idx = int(len(images) * train_ratio)
        
        # Move validation images
        for img_path in images[split_idx:]:
            # Create corresponding paths
            rel_path = img_path.relative_to(dataset_dir / 'images' / 'train')
            val_path = dataset_dir / 'images' / 'val' / rel_path
            label_path = img_path.with_suffix('.txt')
            val_label_path = val_path.with_suffix('.txt')
            
            # Ensure directories exist
            val_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Move files
            img_path.rename(val_path)
            if label_path.exists():
                label_path.rename(val_label_path)
    
    logger.info('Dataset preparation complete')

def train_model(dataset_yaml, epochs=100, batch_size=16):
    """Train the YOLO model"""
    import subprocess
    
    # Run training command
    command = [
        'python',
        'yolov5/train.py',
        '--img', '640',
        '--batch', str(batch_size),
        '--epochs', str(epochs),
        '--data', str(dataset_yaml),
        '--weights', 'yolov5s.pt',
        '--project', 'models',
        '--name', f'vermicomposting_{datetime.now().strftime("%Y%m%d_%H%M%S")}'
    ]
    
    logger.info('Starting model training')
    process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    
    # Log training output
    while True:
        output = process.stdout.readline()
        if output == '' and process.poll() is not None:
            break
        if output:
            logger.info(output.strip())
    
    rc = process.poll()
    logger.info(f'Training complete with return code: {rc}')

def main():
    parser = argparse.ArgumentParser(description='Train YOLO model for vermicomposting monitoring')
    parser.add_argument('--dataset', default='data/dataset', help='Path to dataset directory')
    parser.add_argument('--epochs', type=int, default=100, help='Number of training epochs')
    parser.add_argument('--batch-size', type=int, default=16, help='Batch size')
    
    args = parser.parse_args()
    
    # Create paths
    dataset_dir = Path(args.dataset)
    
    # Create dataset structure if needed
    if not (dataset_dir / 'images' / 'train').exists():
        logger.info('Creating dataset structure')
        create_dataset_structure(str(dataset_dir))
    
    # Create dataset configuration
    dataset_yaml = create_dataset_yaml(dataset_dir)
    
    # Prepare dataset
    prepare_dataset(dataset_dir)
    
    # Train model
    train_model(dataset_yaml, args.epochs, args.batch_size)

if __name__ == '__main__':
    main()
