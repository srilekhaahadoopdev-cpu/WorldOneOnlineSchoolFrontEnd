import os
import httpx
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
frontend_env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'frontend', '.env.local')
load_dotenv(frontend_env_path)

url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
# Use service role key if available, otherwise anon key
service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
anon_key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

key = service_key if service_key and len(service_key) > 20 else anon_key

headers = {
    "apikey": key,
    "Authorization": f"Bearer {key}",
    "Content-Type": "application/json"
}

def check_db():
    print(f"Checking Supabase at: {url}")
    
    # 1. Check enrollments
    print("\n--- Enrollments ---")
    try:
        res = httpx.get(f"{url}/rest/v1/enrollments?select=id,user_id,course_id", headers=headers)
        if res.status_code == 200:
            data = res.json()
            print(f"Total Enrollments: {len(data)}")
            for item in data[:5]:
                print(f"  Enr: {item['id']} | User: {item['user_id']} | Course: {item['course_id']}")
        else:
            print(f"Error fetching enrollments: {res.status_code} - {res.text}")
    except Exception as e:
        print(f"Exception: {e}")

    # 2. Check courses
    print("\n--- Courses ---")
    try:
        res = httpx.get(f"{url}/rest/v1/courses?select=id,title", headers=headers)
        if res.status_code == 200:
            data = res.json()
            print(f"Total Courses: {len(data)}")
            for item in data[:5]:
                print(f"  Course: {item['id']} | Title: {item['title']}")
        else:
            print(f"Error fetching courses: {res.status_code} - {res.text}")
    except Exception as e:
        print(f"Exception: {e}")

    # 3. Test Join (what frontend does)
    print("\n--- Join Test (Enrollments + Courses) ---")
    try:
        res = httpx.get(f"{url}/rest/v1/enrollments?select=id,user_id,course_id,courses(id,title)", headers=headers)
        if res.status_code == 200:
            data = res.json()
            print(f"Join Results: {len(data)}")
            for item in data[:5]:
                c_data = item.get('courses')
                print(f"  Enr: {item['id']} | User: {item['user_id']} | Joined Course: {c_data}")
        else:
            print(f"Error testing join: {res.status_code} - {res.text}")
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    check_db()
