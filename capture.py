import cv2
import sys

# Get the filename from command-line args
filename = sys.argv[1] if len(sys.argv) > 1 else 'image.jpg'

# Initialize webcam (0 is usually the default camera)
cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Failed to open camera")
    sys.exit(1)

# Read a frame
ret, frame = cap.read()

if ret:
    cv2.imwrite(filename, frame)
    print(f"Image saved as {filename}")
else:
    print("Failed to capture image")

# Release the webcam
cap.release()
