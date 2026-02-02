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

def verify_courses():
    # Get all courses
    api_url = f"{url}/rest/v1/courses?select=id,title,slug,is_published"
    try:
        response = httpx.get(api_url, headers=headers)
        if response.status_code == 200:
            courses = response.json()
            print(f"=== COURSE VERIFICATION ===\n")
            print(f"Total courses: {len(courses)}\n")
            
            for i, course in enumerate(courses, 1):
                print(f"{i}. {course['title']}")
                print(f"   Slug: {course['slug']}")
                print(f"   Published: {course['is_published']}")
                print(f"   URL: /courses/{course['slug']}")
                
                # Test the API endpoint
                test_url = f"http://127.0.0.1:8000/api/v1/courses/slug/{course['slug']}"
                print(f"   Testing API: {test_url}")
                try:
                    test_response = httpx.get(test_url, timeout=5.0)
                    if test_response.status_code == 200:
                        print(f"   ✓ API works!")
                    else:
                        print(f"   ✗ API failed: {test_response.status_code}")
                except Exception as e:
                    print(f"   ✗ API error: {e}")
                print()
        else:
            print(f"Error {response.status_code}: {response.text}")
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    verify_courses()
