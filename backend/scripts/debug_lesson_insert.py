
import os
import sys
import httpx
from dotenv import load_dotenv
import json

# Load Environment Variables
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
env_path = os.path.join(backend_dir, '.env')

load_dotenv(env_path)

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SERVICE_KEY:
    print("Error: Missing credentials")
    sys.exit(1)

# Strip trailing slash
SUPABASE_URL = SUPABASE_URL.rstrip('/')

def debug_insert():
    headers = {
        "apikey": SERVICE_KEY,
        "Authorization": f"Bearer {SERVICE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }

    # 1. Get a valid module ID
    print("Fetching a module...")
    with httpx.Client() as client:
        resp = client.get(f"{SUPABASE_URL}/rest/v1/course_modules?limit=1", headers=headers)
        if resp.status_code != 200:
            print(f"Error fetching modules: {resp.text}")
            return
        
        modules = resp.json()
        if not modules:
            print("No modules found. Cannot test lesson insert.")
            return
        
        module_id = modules[0]['id']
        print(f"Using Module ID: {module_id}")

        # 2. Try to insert a lesson
        print("Attempting to insert lesson...")
        payload = {
            "module_id": module_id,
            "title": "Debug Lesson",
            "lesson_type": "text",
            "order": 1,
            "content": "Debug content"
        }
        
        insert_url = f"{SUPABASE_URL}/rest/v1/course_lessons"
        resp = client.post(insert_url, headers=headers, json=payload)
        
        if resp.status_code in [200, 201]:
            print("Success! Lesson inserted.")
            print(resp.json())
        else:
            print(f"Failed to insert lesson: {resp.status_code}")
            print(resp.text)

if __name__ == "__main__":
    debug_insert()
