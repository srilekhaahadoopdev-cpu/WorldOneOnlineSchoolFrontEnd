
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

def list_files():
    # Supabase Storage List API: POST /storage/v1/object/list/{bucket}
    api_url = f"{url}/storage/v1/object/list/course-content"
    
    payload = {
        "limit": 100,
        "offset": 0,
        "prefix": "", 
        "sortBy": {
            "column": "created_at",
            "order": "desc"
        }
    }

    print(f"Listing files in 'course-content'...")
    try:
        response = httpx.post(api_url, headers=headers, json=payload)
        if response.status_code == 200:
            files = response.json()
            print(f"\nFound {len(files)} files:")
            for f in files:
                name = f.get('name')
                size = f.get('metadata', {}).get('size', 0) / 1024 / 1024 # MB
                print(f"- {name} ({size:.2f} MB)")
                
                # Public URL
                public_url = f"{url}/storage/v1/object/public/course-content/{name}"
                print(f"  URL: {public_url}")
        else:
            print(f"Error {response.status_code}: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    list_files()
