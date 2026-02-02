import os
import httpx
from dotenv import load_dotenv

load_dotenv()
frontend_env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'frontend', '.env.local')
load_dotenv(frontend_env_path)

url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

headers = {
    "apikey": key,
    "Authorization": f"Bearer {key}",
    "Content-Type": "application/json"
}

def check_structure():
    print(f"URL: {url}")
    
    tables = ['courses', 'course_modules', 'course_lessons']
    for table in tables:
        print(f"\n--- Table: {table} ---")
        try:
            res = httpx.get(f"{url}/rest/v1/{table}?limit=1", headers=headers)
            if res.status_code == 200:
                data = res.json()
                if data:
                    print(f"Columns: {list(data[0].keys())}")
                else:
                    print("Empty table")
            else:
                print(f"Error: {res.status_code} - {res.text}")
        except Exception as e:
            print(f"Exception: {e}")

if __name__ == "__main__":
    check_structure()
