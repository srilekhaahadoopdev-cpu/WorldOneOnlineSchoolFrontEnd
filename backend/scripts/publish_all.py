
import os
import httpx
from dotenv import load_dotenv

load_dotenv()
frontend_env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'frontend', '.env.local')
load_dotenv(frontend_env_path)

url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

headers = {
    "Authorization": f"Bearer {service_key}",
    "apikey": service_key,
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

def publish_all():
    print("Publishing all courses...")
    api_url = f"{url}/rest/v1/courses?is_published=is.false"
    
    # Update all courses where is_published is false
    payload = { "is_published": True }
    
    try:
        response = httpx.patch(api_url, headers=headers, json=payload)
        if response.status_code in [200, 204]:
            print("Successfully published all courses!")
        else:
            print(f"Failed. Status: {response.status_code}, Error: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    publish_all()
