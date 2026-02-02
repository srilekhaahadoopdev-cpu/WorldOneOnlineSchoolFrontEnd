import os
import httpx
from dotenv import load_dotenv

load_dotenv()
backend_env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(backend_env_path)

url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

headers = {
    "Authorization": f"Bearer {service_key}",
    "apikey": service_key,
    "Content-Type": "application/json"
}

def check_views():
    print("Checking for Phase 8 Views...")
    views = ["view_admin_stats", "view_course_performance", "view_student_progress"]
    
    for view in views:
        try:
            # Try to select 1 record from the view
            response = httpx.get(f"{url}/rest/v1/{view}?select=*&limit=1", headers=headers, timeout=5.0)
            if response.status_code == 200:
                print(f"✅ View '{view}' exists and is accessible.")
            elif response.status_code == 404:
                print(f"❌ View '{view}' NOT FOUND. (404)")
            else:
                print(f"⚠️  View '{view}' returned status {response.status_code}: {response.text}")
        except Exception as e:
            print(f"Error checking {view}: {e}")

if __name__ == "__main__":
    check_views()
