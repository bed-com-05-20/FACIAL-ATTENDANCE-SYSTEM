import cv2
import sys
import time
import os

# Get filename from command line or use default
filename = sys.argv[1] if len(sys.argv) > 1 else 'image.jpg'

# Define output directory
output_dir = "C:/software/projects/FACIAL-ATTENDANCE-SYSTEM/images"
os.makedirs(output_dir, exist_ok=True)  # Ensure directory exists

# Full path for image
filepath = os.path.join(output_dir, filename)

# Open the default webcam (device 0)
cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print(" Error: Camera not detected or in use.")
    sys.exit(2)

# Wait 5 seconds to give time for camera exposure and user preparation
print("Preparing camera. Please wait 5 seconds...")
time.sleep(10)

# Read one frame from the camera
ret, frame = cap.read()

if ret:
    cv2.imwrite(filepath, frame)
    print(f" Image saved at: {filepath}")
else:
    print(" Failed to capture image.")

# Always release the camera resource
cap.release()
