
import os
import httpx
from dotenv import load_dotenv

load_dotenv()
# Load from backend .env
backend_env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(backend_env_path)

url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not service_key:
    print("Error: Missing Supabase credentials")
    exit(1)

headers = {
    "Authorization": f"Bearer {service_key}",
    "apikey": service_key,
    "Content-Type": "application/json"
}

def inspect_enrollments():
    print("Inspection Enrollments Table...")
    # Using PostgREST to inspect via RPC if possible or just infer from error
    
    # Let's try to fetch enrollments WITHOUT the join first
    print("\n1. Fetching enrollments (no join)...")
    try:
        resp = httpx.get(f"{url}/rest/v1/enrollments?select=*", headers=headers)
        if resp.status_code == 200:
            print("Success! Found enrollments:", len(resp.json()))
            if len(resp.json()) > 0:
                print("Sample:", resp.json()[0])
        else:
            print("Error fetching enrollments:", resp.text)
    except Exception as e:
        print("Exception:", e)

    # Let's try to fetch with join
    print("\n2. Fetching enrollments WITH join (courses)...")
    try:
        resp = httpx.get(f"{url}/rest/v1/enrollments?select=*,courses(*)", headers=headers)
        if resp.status_code == 200:
            print("Success! Join worked perfoectly.")
        else:
            print("Error fetching with join:", resp.text)
    except Exception as e:
        print("Exception:", e)

    # Let's try to fetch with join using singular 'course'
    print("\n3. Fetching enrollments WITH join (course)...")
    try:
        resp = httpx.get(f"{url}/rest/v1/enrollments?select=*,course(*)", headers=headers)
        if resp.status_code == 200:
            print("Success! Join worked with 'course'.")
        else:
            print("Error fetching with 'course' join:", resp.text)
    except Exception as e:
        print("Exception:", e)

if __name__ == "__main__":
    inspect_enrollments()
