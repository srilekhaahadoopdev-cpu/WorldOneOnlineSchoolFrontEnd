import os
import httpx
from dotenv import load_dotenv

load_dotenv()
backend_env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(backend_env_path)

url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

headers = {
    "Authorization": f"Bearer {service_key}",
    "apikey": service_key,
    "Content-Type": "application/json"
}

def check_columns():
    print("Fetching one enrollment to inspect columns...")
    try:
        # Fetch 1 record
        resp = httpx.get(f"{url}/rest/v1/enrollments?select=*&limit=1", headers=headers, timeout=5.0)
        if resp.status_code == 200:
            data = resp.json()
            if len(data) > 0:
                print("Columns found:", data[0].keys())
            else:
                print("Table is empty, cannot infer columns from data.")
                # We can try to infer from error if we select a wrong column, 
                # but better to assume standard 'created_at' if 'enrolled_at' is missing.
        else:
            print("Error:", resp.text)
    except Exception as e:
        print("Exception:", e)

if __name__ == "__main__":
    check_columns()
