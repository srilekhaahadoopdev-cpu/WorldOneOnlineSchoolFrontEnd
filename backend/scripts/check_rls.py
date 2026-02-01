
import os
import httpx
from dotenv import load_dotenv

load_dotenv()
frontend_env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'frontend', '.env.local')
load_dotenv(frontend_env_path)

url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
anon_key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

def check_access(table_name, key_name, key_value):
    print(f"\n--- Checking '{table_name}' with {key_name} key ---")
    headers = {
        "Authorization": f"Bearer {key_value}",
        "apikey": key_value,
        "Content-Type": "application/json"
    }
    
    api_url = f"{url}/rest/v1/{table_name}?select=count"
    try:
        response = httpx.get(api_url, headers=headers)
        if response.status_code == 200:
            print(f"Success! Count: {response.text}")
        else:
            print(f"Failed! Status: {response.status_code}, Error: {response.text}")
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    tables = ["courses", "course_modules", "course_lessons"]
    
    print(">>> TESTING ANON ACCESS (What the student sees)")
    for t in tables:
        check_access(t, "ANON", anon_key)
        
    print("\n>>> TESTING SERVICE ACCESS (What the DB actually has)")
    for t in tables:
        check_access(t, "SERVICE", service_key)
