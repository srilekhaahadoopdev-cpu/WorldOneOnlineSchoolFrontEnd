
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

def verify_fix():
    print("=" * 50)
    print("VERIFYING ENROLLMENT DASHBOARD FIX")
    print("=" * 50)
    
    # Check FK join
    print("\n1. Testing 'enrollments' -> 'courses' join...")
    try:
        # We limit to 1 to be fast
        resp = httpx.get(f"{url}/rest/v1/enrollments?select=*,courses(*)&limit=1", headers=headers)
        if resp.status_code == 200:
            data = resp.json()
            if len(data) > 0:
                enrollment = data[0]
                course = enrollment.get('courses')
                if course:
                    print("✅ SUCCESS! Foreign key join is WORKING.")
                    print(f"   Fetched enrollment for course: {course.get('title')}")
                else:
                    print("⚠️  Enrollment fetched, but 'courses' is null.")
                    print("   This might mean the course_id in enrollment doesn't match any course,")
                    print("   OR the foreign key is still missing.")
            else:
                print("ℹ️  No enrollments found to test (Table is empty).")
                print("   Please enroll in a course first.")
        else:
            print("❌ FAIL. API Error:", resp.text)
            print("\n   POSSIBLE CAUSE: The Foreign Key 'enrollments_course_id_fkey' is missing.")
            print("   ACTION: Run the SQL in EXECUTE_THIS_SQL.md")
    except Exception as e:
        print("Exception:", e)

if __name__ == "__main__":
    verify_fix()
