
import requests

url = "http://127.0.0.1:8000/api/v1/upload"
files = {'file': open('test.txt', 'rb')}

try:
    response = requests.post(url, files=files)
    print(f"Status Code: {response.status_code}")
    print(f"Response Body: {response.text}")
except Exception as e:
    print(f"Error: {e}")
