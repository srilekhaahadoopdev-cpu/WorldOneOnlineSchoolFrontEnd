
import os
import httpx
from dotenv import load_dotenv

# Load env
load_dotenv()
frontend_env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'frontend', '.env.local')
load_dotenv(frontend_env_path)

url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url:
    print("Error: NEXT_PUBLIC_SUPABASE_URL not found")
    exit(1)

if not service_key or "YOUR_SERVICE" in service_key:
    print("Warning: SUPABASE_SERVICE_ROLE_KEY not found or default. Trying ANON key (might fail for bucket creation).")
    service_key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

headers = {
    "Authorization": f"Bearer {service_key}",
    "apikey": service_key,
    "Content-Type": "application/json"
}

bucket_id = "course-content"

def create_bucket():
    api_url = f"{url}/storage/v1/bucket"
    payload = {
        "id": bucket_id,
        "name": bucket_id,
        "public": True,
        "file_size_limit": 52428800, # 50MB
        "allowed_mime_types": ["image/*", "video/*", "application/pdf"]
    }
    
    print(f"Attempting to create bucket '{bucket_id}' at {api_url}...")
    try:
        response = httpx.post(api_url, headers=headers, json=payload)
        if response.status_code == 200:
            print("Success: Bucket created.")
        elif response.status_code == 400 and "already exists" in response.text:
            print("Info: Bucket already exists.")
        else:
            print(f"Failed: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    create_bucket()
