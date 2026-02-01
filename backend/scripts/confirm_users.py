
import os
import httpx
from datetime import datetime
from dotenv import load_dotenv

# Load Environment Variables
load_dotenv('backend/.env')

url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print("Error: Missing credentials in backend/.env")
    exit(1)

# API Endpoints
AUTH_URL = f"{url}/auth/v1"
headers = {
    "apikey": key,
    "Authorization": f"Bearer {key}",
    "Content-Type": "application/json"
}

def confirm_all_users():
    print("Fetching users...")
    try:
        # 1. Fetch Users (List Users)
        # GET /admin/users
        resp = httpx.get(f"{AUTH_URL}/admin/users", headers=headers)
        
        if resp.status_code != 200:
            print(f"Failed to fetch users: {resp.status_code} {resp.text}")
            return

        users = resp.json().get('users', [])
        print(f"Found {len(users)} users.")

        count = 0
        for user in users:
            email = user.get('email')
            uid = user.get('id')
            confirmed_at = user.get('email_confirmed_at')

            if not confirmed_at:
                print(f"Confirming user: {email} ({uid})")
                
                # 2. Update User
                # PUT /admin/users/{id}
                update_payload = {
                    "email_confirm": True,
                    "user_metadata": {
                        "email_confirmed": True 
                    }
                }
                
                update_resp = httpx.put(
                    f"{AUTH_URL}/admin/users/{uid}", 
                    headers=headers, 
                    json=update_payload
                )

                if update_resp.status_code == 200:
                    print(f" - Success!")
                    count += 1
                else:
                    print(f" - Failed: {update_resp.status_code} {update_resp.text}")
            else:
                print(f"Skipping {email} (Already confirmed)")

        print(f"Job Complete. confirmed {count} users.")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    confirm_all_users()
