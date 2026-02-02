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

def list_courses_modules():
    print("Courses and Module Counts")
    
    # Get all courses
    res = httpx.get(f"{url}/rest/v1/courses?select=id,title,slug", headers=headers)
    courses = res.json() if res.status_code == 200 else []
    
    for c in courses:
        # Get count of modules
        res_m = httpx.get(f"{url}/rest/v1/course_modules?course_id=eq.{c['id']}&select=count", headers=headers, params={"select": "count", "head": "true"})
        # Wait, Supabase head=true returns count in header
        # Let's just fetch them
        res_m = httpx.get(f"{url}/rest/v1/course_modules?course_id=eq.{c['id']}&select=id", headers=headers)
        modules = res_m.json() if res_m.status_code == 200 else []
        print(f"Title: {c['title']} | Slug: {c['slug']} | Modules: {len(modules)}")

if __name__ == "__main__":
    list_courses_modules()
