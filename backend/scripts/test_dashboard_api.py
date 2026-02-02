import requests
import json

API_URL = "http://localhost:8000/api/v1"

print("Testing Admin Dashboard Endpoint...")
try:
    res = requests.get(f"{API_URL}/analytics/admin")
    print(f"Status Code: {res.status_code}")
    print(f"Response: {json.dumps(res.json(), indent=2)}")
except Exception as e:
    print(f"Error: {e}")

print("\n" + "="*50 + "\n")

print("Testing Courses Endpoint...")
try:
    res = requests.get(f"{API_URL}/courses")
    print(f"Status Code: {res.status_code}")
    data = res.json()
    print(f"Number of courses: {len(data)}")
    if len(data) > 0:
        print(f"First course: {data[0].get('title', 'N/A')}")
except Exception as e:
    print(f"Error: {e}")
