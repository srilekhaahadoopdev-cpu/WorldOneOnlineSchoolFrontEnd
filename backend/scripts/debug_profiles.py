
import os
import sys
import httpx
from dotenv import load_dotenv

# Load Environment Variables
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
env_path = os.path.join(backend_dir, '.env')

load_dotenv(env_path)

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SERVICE_KEY:
    print("Error: Missing credentials")
    sys.exit(1)

# Strip trailing slash
SUPABASE_URL = SUPABASE_URL.rstrip('/')

def check_rls():
    headers = {
        "apikey": SERVICE_KEY,
        "Authorization": f"Bearer {SERVICE_KEY}",
        "Content-Type": "application/json"
    }

    # We can't easily check RLS definitions via API without SQL editor,
    # but we can check if we can read profiles as an authenticated user.
    # Actually, we can just print the current profiles to see if our user is there and has the correct role.
    
    print("Checking profiles with Service Role (Bypassing RLS)...")
    url = f"{SUPABASE_URL}/rest/v1/profiles?select=*"
    with httpx.Client() as client:
        resp = client.get(url, headers=headers)
        if resp.status_code == 200:
            profiles = resp.json()
            for p in profiles:
                print(f"User: {p.get('email', 'No Email')} - Role: {p.get('role')} - ID: {p.get('id')}")
        else:
            print(f"Error fetching profiles: {resp.status_code} {resp.text}")

if __name__ == "__main__":
    check_rls()
