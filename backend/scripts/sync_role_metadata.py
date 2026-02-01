
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

def update_user_metadata(email):
    headers = {
        "apikey": SERVICE_KEY,
        "Authorization": f"Bearer {SERVICE_KEY}",
        "Content-Type": "application/json"
    }
    
    # 1. Get User ID by searching profiles (since we know profiles has the email)
    print(f"Finding user {email}...")
    db_url = f"{SUPABASE_URL}/rest/v1/profiles"
    query_params = {
        "email": f"eq.{email}",
        "select": "id, role"
    }
    
    user_id = None
    role = "student"
    
    with httpx.Client() as client:
        resp = client.get(db_url, headers=headers, params=query_params)
        if resp.status_code != 200 or not resp.json():
            print("User not found in profiles.")
            return
        
        user_data = resp.json()[0]
        user_id = user_data['id']
        role = user_data.get('role', 'student')
        
    print(f"Found User ID: {user_id}, Role in Profile: {role}")
    
    if role != 'admin' and role != 'instructor':
        print("User is not an admin/instructor in profiles. Promoting in profiles first...")
        # (Optional: Promote in profiles if needed, but we focus on metadata here)
    
    # 2. Update Auth User Metadata
    print("Updating Auth User Metadata...")
    auth_url = f"{SUPABASE_URL}/auth/v1/admin/users/{user_id}"
    
    payload = {
        "user_metadata": {
            "role": role # Sync role from profile to metadata
        }
    }
    
    with httpx.Client() as client:
        resp = client.put(auth_url, headers=headers, json=payload)
        
        if resp.status_code == 200:
            print("Success! User metadata updated.")
            print(f"New Metadata: {resp.json().get('user_metadata')}")
        else:
            print(f"Failed to update auth metadata: {resp.status_code} {resp.text}")

if __name__ == "__main__":
    email = "sujisrilu@gmail.com"
    if len(sys.argv) > 1:
        email = sys.argv[1]
    update_user_metadata(email)
