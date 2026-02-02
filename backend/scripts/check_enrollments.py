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

def check_enrollments():
    print("=" * 60)
    print("CHECKING ENROLLMENTS")
    print("=" * 60)
    
    # Get all enrollments
    api_url = f"{url}/rest/v1/enrollments?select=*"
    try:
        response = httpx.get(api_url, headers=headers, timeout=10.0)
        if response.status_code == 200:
            enrollments = response.json()
            print(f"\nTotal Enrollments: {len(enrollments)}")
            
            if len(enrollments) == 0:
                print("\n⚠️  NO ENROLLMENTS FOUND!")
                print("\nThis is why the dashboard shows 'Enrolled Courses will appear here'")
                print("\nTo fix this:")
                print("1. Go to http://localhost:3000/courses")
                print("2. Click 'View Details' on a course")
                print("3. Click 'Enroll Now' button")
                print("4. Complete the mock payment")
                print("5. Return to dashboard to see enrolled courses")
            else:
                print("\n✓ Enrollments found:")
                for i, enrollment in enumerate(enrollments, 1):
                    print(f"\n{i}. Enrollment ID: {enrollment['id']}")
                    print(f"   User ID: {enrollment['user_id']}")
                    print(f"   Course ID: {enrollment['course_id']}")
                    print(f"   Enrolled At: {enrollment.get('enrolled_at', 'N/A')}")
        else:
            print(f"Error {response.status_code}: {response.text}")
    except Exception as e:
        print(f"Error: {e}")
    
    # Get all users
    print("\n" + "=" * 60)
    print("CHECKING USERS")
    print("=" * 60)
    
    api_url = f"{url}/rest/v1/profiles?select=id,full_name,role"
    try:
        response = httpx.get(api_url, headers=headers, timeout=10.0)
        if response.status_code == 200:
            users = response.json()
            print(f"\nTotal Users: {len(users)}")
            for i, user in enumerate(users, 1):
                print(f"\n{i}. User: {user.get('full_name', 'No name')}")
                print(f"   ID: {user['id']}")
                print(f"   Role: {user.get('role', 'student')}")
        else:
            print(f"Error {response.status_code}: {response.text}")
    except Exception as e:
        print(f"Error: {e}")
    
    print("\n" + "=" * 60)

if __name__ == "__main__":
    check_enrollments()
