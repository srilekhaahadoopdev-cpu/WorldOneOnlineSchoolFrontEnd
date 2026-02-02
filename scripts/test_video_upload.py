
import requests
import os

url = "http://127.0.0.1:8000/api/v1/upload"
filename = "large.mp4"

if not os.path.exists(filename):
    print("File missing")
    exit(1)

print(f"Uploading {filename} ({os.path.getsize(filename)} bytes)...")
try:
    with open(filename, 'rb') as f:
        # Tuple format: (filename, file_object, content_type)
        files = {'file': (filename, f, 'video/mp4')}
        response = requests.post(url, files=files, timeout=300)
        print(f"Status Code: {response.status_code}")
        print(f"Response Body: {response.text}")
except Exception as e:
    print(f"Error: {e}")
