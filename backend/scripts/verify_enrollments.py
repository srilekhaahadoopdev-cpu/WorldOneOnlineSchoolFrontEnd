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

def verify_enrollments():
    print(f"Checking Supabase: {url}")
    
    # 1. Get Enrollments
    res = httpx.get(f"{url}/rest/v1/enrollments?select=id,user_id,course_id", headers=headers)
    if res.status_code == 200:
        enrollments = res.json()
        print(f"\nTotal Enrollments found in DB: {len(enrollments)}")
        
        # 2. Who are these users?
        user_ids = list(set([e['user_id'] for e in enrollments]))
        print(f"Unique Users Enrolled: {len(user_ids)}")
        
        for uid in user_ids:
            # Check profile
            pref = httpx.get(f"{url}/rest/v1/profiles?id=eq.{uid}&select=full_name,email,role", headers=headers)
            profile = pref.json()[0] if pref.status_code == 200 and pref.json() else {"full_name": "No Profile"}
            
            # Count enrollments for this user
            user_enr = [e for e in enrollments if e['user_id'] == uid]
            print(f"User: {uid} | {profile.get('full_name')} | Enrollments: {len(user_enr)}")
            for e in user_enr:
                print(f"  - Course ID: {e['course_id']}")
                
    else:
        print(f"Failed to fetch enrollments: {res.status_code} - {res.text}")

if __name__ == "__main__":
    verify_enrollments()
