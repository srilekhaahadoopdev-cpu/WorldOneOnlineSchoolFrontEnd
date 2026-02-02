
import os
import httpx
from dotenv import load_dotenv
import json

load_dotenv()
frontend_env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'frontend', '.env.local')
load_dotenv(frontend_env_path)

url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not service_key or "YOUR_SERVICE" in service_key:
    service_key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

headers = {
    "Authorization": f"Bearer {service_key}",
    "apikey": service_key,
    "Content-Type": "application/json"
}

def list_courses():
    api_url = f"{url}/rest/v1/courses?select=title,slug,is_published,id"
    try:
        response = httpx.get(api_url, headers=headers)
        if response.status_code == 200:
            courses = response.json()
            print("COURSES FOUND:")
            for c in courses:
                print(f"\nTitle: {c['title']}")
                print(f"Slug: {c['slug']}")
                print(f"ID: {c['id']}")
                print(f"Published: {c['is_published']}")
        else:
            print(f"Error {response.status_code}: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    list_courses()
