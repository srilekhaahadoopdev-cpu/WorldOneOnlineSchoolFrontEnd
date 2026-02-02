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

def print_all():
    print("--- ALL PROFILES ---")
    res = httpx.get(f"{url}/rest/v1/profiles?select=id,full_name,email", headers=headers)
    profiles = res.json() if res.status_code == 200 else []
    for p in profiles:
        print(f"ID: {p['id']} | Name: {p['full_name']} | Email: {p['email']}")
        
    print("\n--- ALL ENROLLMENTS ---")
    res = httpx.get(f"{url}/rest/v1/enrollments?select=user_id,course_id", headers=headers)
    enrollments = res.json() if res.status_code == 200 else []
    for e in enrollments:
        user = next((p for p in profiles if p['id'] == e['user_id']), None)
        u_info = f"{user['email']}" if user else "UNKNOWN"
        print(f"User: {e['user_id']} ({u_info}) | Course: {e['course_id']}")

if __name__ == "__main__":
    print_all()
