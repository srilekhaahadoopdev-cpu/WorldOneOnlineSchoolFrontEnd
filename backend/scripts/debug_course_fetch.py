
import os
import httpx
from dotenv import load_dotenv

load_dotenv()
frontend_env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'frontend', '.env.local')
load_dotenv(frontend_env_path)

url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not service_key or "YOUR_SERVICE" in service_key:
    service_key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

headers = {
    "Authorization": f"Bearer {service_key}",
    "apikey": service_key,
    "Content-Type": "application/json"
}

def check_course_lookup(slug):
    # Mimic frontend logic
    clean_slug = slug.lower().strip()
    
    print(f"Checking for slug: '{clean_slug}'")
    
    # 1. Exact match
    api_url = f"{url}/rest/v1/courses?slug=eq.{clean_slug}&select=*"
    try:
        response = httpx.get(api_url, headers=headers)
        data = response.json()
        if data:
            print("Found by exact match:", data[0]['title'])
            return
        else:
            print("Exact match failed.")
            
        # 2. Relaxed title check (approximate)
        # Using ilike operator
        title_query = clean_slug.replace('-', ' ')
        api_url = f"{url}/rest/v1/courses?title=ilike.{title_query}&select=*"
        response = httpx.get(api_url, headers=headers)
        data = response.json()
        if data:
            print("Found by title match:", data[0]['title'])
        else:
            print(f"Title match failed for '{title_query}'")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_course_lookup("Introduction-to-Artificial-Intelligence")
