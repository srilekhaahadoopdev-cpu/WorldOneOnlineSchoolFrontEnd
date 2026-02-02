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

def get_full_slugs():
    res = httpx.get(f"{url}/rest/v1/courses?select=slug,title", headers=headers)
    if res.status_code == 200:
        for c in res.json():
            print(f"'{c['slug']}' -> {c['title']}")
    else:
        print(f"Error: {res.status_code}")

if __name__ == "__main__":
    get_full_slugs()
