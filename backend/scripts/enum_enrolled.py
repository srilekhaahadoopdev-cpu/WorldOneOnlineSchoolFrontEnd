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

def check_users():
    print("Enumerating Enrolled Users:")
    res = httpx.get(f"{url}/rest/v1/enrollments?select=user_id", headers=headers)
    if res.status_code == 200:
        uids = list(set([e['user_id'] for e in res.json()]))
        for uid in uids:
            pref = httpx.get(f"{url}/rest/v1/profiles?id=eq.{uid}&select=email,full_name", headers=headers)
            profile = pref.json()[0] if pref.status_code == 200 and pref.json() else {"email": "UNKNOWN"}
            print(f"User Enrolled: {uid} | Email: {profile.get('email')}")
    else:
        print(f"Error: {res.status_code}")

if __name__ == "__main__":
    check_users()
