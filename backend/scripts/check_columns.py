
import os
import httpx
from dotenv import load_dotenv

# Load Environment Variables
# Need to be careful with paths as we are running from root usually
load_dotenv('backend/.env')

url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    # Try frontend env
    load_dotenv('frontend/.env.local')
    url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not url or not key:
    print("No credentials found")
    exit(1)

headers = {
    "apikey": key,
    "Authorization": f"Bearer {key}",
    "Content-Type": "application/json"
}

print("Checking course_modules columns based on URL:", url)
try:
    # Fetch 1 record to see keys
    resp = httpx.get(f"{url}/rest/v1/course_modules?select=*&limit=1", headers=headers)
    if resp.status_code == 200:
        data = resp.json()
        if len(data) > 0:
            print("Keys:", data[0].keys())
        else:
            print("Table empty, cannot infer keys from data.")
    else:
        print(f"Error: {resp.status_code} {resp.text}")
except Exception as e:
    print(e)
