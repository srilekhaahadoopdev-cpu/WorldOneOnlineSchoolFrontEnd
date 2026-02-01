
import requests

url = "http://127.0.0.1:8000/api/v1/upload"
# Create a large dummy file (10MB) if it doesn't exist
try:
    with open('large_test.video', 'rb') as f:
        files = {'file': ('large_test.video', f, 'video/mp4')}
        print("Uploading 10MB file...")
        response = requests.post(url, files=files)
        print(f"Status Code: {response.status_code}")
        print(f"Response Body: {response.text}")
except FileNotFoundError:
    print("File not found.")
except Exception as e:
    print(f"Error: {e}")
