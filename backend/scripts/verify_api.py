
import requests
import os

API_URL = "http://localhost:8000/api/v1"

def test_slug(slug):
    print(f"Testing slug: {slug}")
    try:
        res = requests.get(f"{API_URL}/courses/slug/{slug}")
        print(f"Status: {res.status_code}")
        if res.status_code != 200:
            print(f"Error Body: {res.text}")
        else:
            data = res.json()
            print(f"Success! Title: {data.get('title')}")
            print(f"Modules: {len(data.get('modules', []))}")
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    # Test the AI course we know exists
    test_slug("intro-to-ai")
