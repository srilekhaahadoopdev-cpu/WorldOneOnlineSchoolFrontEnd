import os
import httpx
from dotenv import load_dotenv

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
    "Content-Type": "application/json",
    "Prefer": "count=exact"
}

def count_records():
    tables = ["courses", "course_modules", "course_lessons"]
    
    for table in tables:
        api_url = f"{url}/rest/v1/{table}?select=id"
        try:
            response = httpx.get(api_url, headers=headers, timeout=10.0)
            if response.status_code == 200:
                count = response.headers.get('Content-Range', 'unknown')
                data = response.json()
                print(f"{table}: {len(data)} records (Content-Range: {count})")
            else:
                print(f"{table}: Error {response.status_code}")
        except Exception as e:
            print(f"{table}: Error - {e}")

if __name__ == "__main__":
    count_records()
