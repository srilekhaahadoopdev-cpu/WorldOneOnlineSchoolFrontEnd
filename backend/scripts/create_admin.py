import os
import sys
import httpx
import time
import argparse
from dotenv import load_dotenv

# Load Environment Variables
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
env_path = os.path.join(backend_dir, '.env')
frontend_env_path = os.path.join(os.path.dirname(backend_dir), 'frontend', '.env.local')

load_dotenv(env_path)
load_dotenv(frontend_env_path)

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SERVICE_KEY:
    print("Error: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
    sys.exit(1)

# Strip trailing slash
SUPABASE_URL = SUPABASE_URL.rstrip('/')

def create_and_promote(email, password):
    headers = {
        "apikey": SERVICE_KEY,
        "Authorization": f"Bearer {SERVICE_KEY}",
        "Content-Type": "application/json"
    }
    
    # 1. Create User in Auth
    auth_url = f"{SUPABASE_URL}/auth/v1/admin/users"
    payload = {
        "email": email,
        "password": password,
        "email_confirm": True,
        "user_metadata": {
            "full_name": "Admin User"
        }
    }
    
    user_id = None
    
    print(f"Attempting to create user {email} in Supabase Auth...")
    with httpx.Client() as client:
        response = client.post(auth_url, headers=headers, json=payload)
        
        if response.status_code == 200 or response.status_code == 201:
            data = response.json()
            # Handle standard Auth response
            user_id = data.get("id")
            if not user_id and "user" in data:
                user_id = data["user"].get("id")
            print(f"User created successfully. ID: {user_id}")
        else:
            # Check if user already exists
            if response.status_code == 422 or "already registered" in response.text:
                print("User likely already exists (Auth API returned error). Checking profiles...")
            else:
                print(f"Error creating user: {response.status_code} {response.text}")
                # We try one more thing: searching the user via Admin API to get ID
                # GET /admin/users is not always available or requires different endpoint
                # But we can just try to find them in profiles.
    
    # 2. Add/Update in Profiles
    # Wait for trigger if we just created
    if user_id:
        print("Waiting 3 seconds for profile trigger...")
        time.sleep(3)
        
    db_url = f"{SUPABASE_URL}/rest/v1/profiles"
    query_params = {
        "email": f"eq.{email}",
        "select": "*"
    }
    
    with httpx.Client() as client:
        # Check if profile exists
        response = client.get(db_url, headers=headers, params=query_params)
        profiles = response.json()
        
        if not profiles:
            print("Profile not found in public.profiles.")
            if user_id:
                print(f"Inserting profile manually for ID {user_id}...")
                profile_payload = {
                    "id": user_id,
                    "email": email,
                    "role": "admin",
                    "full_name": "Admin User"
                }
                headers["Prefer"] = "return=representation"
                resp = client.post(db_url, headers=headers, json=profile_payload)
                if resp.status_code < 300:
                    print(f"Profile created: {resp.json()}")
                    return
                else:
                    print(f"Failed to create profile: {resp.text}")
                    return
            else:
                 print("Cannot create profile without User ID (and User creation failed or user implies existing but not found).")
                 return

        user = profiles[0]
        print(f"Found profile for {email}. Current role: {user.get('role')}")
        
        if user.get("role") == "admin":
            print("User is already an admin.")
            return

        print(f"Promoting user {user['id']} to admin...")
        # Update
        patch_url = f"{SUPABASE_URL}/rest/v1/profiles" 
        params = {"id": f"eq.{user['id']}"}
        resp = client.patch(patch_url, headers=headers, json={"role": "admin"}, params=params)
        
        if resp.status_code < 300:
            print("Success! User is now an admin.")
        else:
            print(f"Failed to update role: {resp.text}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Create and promote admin user")
    parser.add_argument("email", help="Email of the user")
    parser.add_argument("--password", help="Password for the user", default="TemporaryPass123!")
    
    args = parser.parse_args()
    
    create_and_promote(args.email, args.password)
