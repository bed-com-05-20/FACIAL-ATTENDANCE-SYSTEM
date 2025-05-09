import cv2
import requests # type: ignore
import time

url = 'http://localhost:3000/face-recognition/detect-frame'

cap = cv2.VideoCapture(0)  # 0 = default camera

while True:
    ret, frame = cap.read()
    if not ret:
        break

    _, img_encoded = cv2.imencode('.jpg', frame)
    response = requests.post(
        url,
        files={'file': ('frame.jpg', img_encoded.tobytes(), 'image/jpeg')}
    )

    print(response.json())

    # Sleep or exit logic can go here
    time.sleep(2)  # detect every 2 seconds

cap.release()
cv2.destroyAllWindows()
