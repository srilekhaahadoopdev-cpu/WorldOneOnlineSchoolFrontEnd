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

def check_orphans():
    print("Checking Orphaned Modules/Lessons")
    
    # Get all course IDs
    res = httpx.get(f"{url}/rest/v1/courses?select=id,title", headers=headers)
    courses = res.json() if res.status_code == 200 else []
    course_ids = {c['id'] for c in courses}
    print(f"Courses in DB: {len(course_ids)}")
    
    # Get all modules
    res = httpx.get(f"{url}/rest/v1/course_modules?select=id,course_id,title", headers=headers)
    modules = res.json() if res.status_code == 200 else []
    module_ids = {m['id'] for m in modules}
    
    orphaned_modules = [m for m in modules if m['course_id'] not in course_ids]
    print(f"Modules in DB: {len(modules)}")
    print(f"Orphaned Modules: {len(orphaned_modules)}")
    for m in orphaned_modules:
        print(f"  Mod: {m['title']} | Parent Course ID: {m['course_id']}")
        
    # Get all lessons
    res = httpx.get(f"{url}/rest/v1/course_lessons?select=id,module_id,title", headers=headers)
    lessons = res.json() if res.status_code == 200 else []
    
    orphaned_lessons = [l for l in lessons if l['module_id'] not in module_ids]
    print(f"Lessons in DB: {len(lessons)}")
    print(f"Orphaned Lessons: {len(orphaned_lessons)}")
    for l in orphaned_lessons:
        print(f"  Lesson: {l['title']} | Parent Module ID: {l['module_id']}")

if __name__ == "__main__":
    check_orphans()
