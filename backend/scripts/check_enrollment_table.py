
import os
import httpx
from dotenv import load_dotenv

load_dotenv('backend/.env')

url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

headers = {
    "apikey": key,
    "Authorization": f"Bearer {key}",
    "Content-Type": "application/json"
}

print("Checking for 'enrollments' table...")
try:
    resp = httpx.get(f"{url}/rest/v1/enrollments?select=*&limit=1", headers=headers)
    if resp.status_code == 200:
        print("Table 'enrollments' exists.")
    else:
        print(f"Table 'enrollments' likely missing. Status: {resp.status_code}")
except Exception as e:
    print(e)
