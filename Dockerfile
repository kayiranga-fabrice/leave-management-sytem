# Use the official Node.js image as a base image
FROM node:18

# Install Python and pip (for Python dependencies)
RUN apt-get update && apt-get install -y python3 python3-pip python3-venv build-essential libjpeg-dev libpng-dev libtiff-dev libavcodec-dev libavformat-dev libswscale-dev libv4l-dev libatlas-base-dev gfortran python3-dev ffmpeg

# Set the working directory for your app inside the container
WORKDIR /app

# Copy package.json and package-lock.json (for Node.js dependencies)
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy requirements.txt (for Python dependencies)
COPY requirements.txt ./

# Create a virtual environment for Python dependencies
RUN python3 -m venv /env

# Install Python dependencies in the virtual environment
RUN /env/bin/pip install --no-cache-dir -r requirements.txt

# Copy the entire project into the container
COPY . .

# Expose ports (3000 for Node.js, 5000 for Python if needed)
EXPOSE 3000
EXPOSE 5000

# Command to run the Node.js app
CMD ["node", "index.js"]

