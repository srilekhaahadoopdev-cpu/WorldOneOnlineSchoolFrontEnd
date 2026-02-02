import os
import requests
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
frontend_env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'frontend', '.env.local')
load_dotenv(frontend_env_path)

url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

headers = {
    "apikey": key,
    "Authorization": f"Bearer {key}",
    "Content-Type": "application/json"
}

def debug_enrollments():
    print("\n" + "=" * 80)
    print("DEBUGGING ENROLLMENT DISPLAY ISSUE")
    print("=" * 80)
    
    # Step 1: Check total enrollments
    print("\n1. Checking enrollments table...")
    try:
        response = requests.get(
            f"{url}/rest/v1/enrollments?select=id,user_id,course_id,enrolled_at",
            headers=headers
        )
        response.raise_for_status()
        enrollments = response.json()
        print(f"   ✓ Total enrollments in database: {len(enrollments)}")
        
        if len(enrollments) == 0:
            print("\n   ⚠️  NO ENROLLMENTS FOUND!")
            print("   Students need to enroll in courses first.")
            return
        
        print(f"\n   First 3 enrollments:")
        for i, e in enumerate(enrollments[:3], 1):
            print(f"   {i}. User: {e['user_id'][:12]}... | Course: {e['course_id'][:12]}...")
            
    except Exception as e:
        print(f"   ✗ Error: {e}")
        return
    
    # Step 2: Test the nested query (like frontend uses)
    print("\n2. Testing nested query (enrollments with course details)...")
    try:
        # Get first user to test with
        test_user_id = enrollments[0]['user_id']
        print(f"   Testing with user: {test_user_id[:12]}...")
        
        response = requests.get(
            f"{url}/rest/v1/enrollments?select=id,course_id,enrolled_at,courses(id,title,description,slug,level,thumbnail_url,price)&user_id=eq.{test_user_id}",
            headers=headers
        )
        response.raise_for_status()
        data = response.json()
        print(f"   ✓ Query returned {len(data)} enrollments")
        
        if len(data) > 0:
            print(f"\n   Sample enrollment:")
            sample = data[0]
            print(f"   - Enrollment ID: {sample.get('id', 'N/A')[:12]}...")
            print(f"   - Course ID: {sample.get('course_id', 'N/A')[:12]}...")
            
            courses_data = sample.get('courses')
            if courses_data is None:
                print(f"   - Courses field: NULL ❌")
                print("\n   ⚠️  PROBLEM IDENTIFIED: The 'courses' field is NULL!")
                print("   This means the foreign key relationship is not working properly.")
                print("\n   POSSIBLE CAUSES:")
                print("   1. RLS policy on 'courses' table is blocking the join")
                print("   2. Foreign key constraint is missing or broken")
                print("   3. The course referenced by enrollment doesn't exist")
            elif isinstance(courses_data, dict):
                print(f"   - Courses field: ✓ (has data)")
                print(f"     Title: {courses_data.get('title', 'N/A')}")
                print("   ✓ Courses data is being fetched correctly!")
            else:
                print(f"   - Courses field: {type(courses_data)} (unexpected type)")
        else:
            print("   ⚠️  No enrollments returned for this user!")
            
    except Exception as e:
        print(f"   ✗ Error: {e}")
        if hasattr(e, 'response'):
            print(f"   Response: {e.response.text}")
    
    # Step 3: Check if courses exist
    print("\n3. Checking courses table...")
    try:
        response = requests.get(
            f"{url}/rest/v1/courses?select=id,title",
            headers=headers
        )
        response.raise_for_status()
        courses = response.json()
        print(f"   ✓ Total courses in database: {len(courses)}")
        
        if len(courses) > 0:
            print(f"   Sample courses:")
            for i, c in enumerate(courses[:3], 1):
                print(f"   {i}. {c['title']} (ID: {c['id'][:12]}...)")
                
            # Step 4: Check for orphaned enrollments
            print("\n4. Checking for orphaned enrollments...")
            course_ids = [c['id'] for c in courses]
            orphaned = [e for e in enrollments if e['course_id'] not in course_ids]
            
            if len(orphaned) > 0:
                print(f"   ⚠️  Found {len(orphaned)} orphaned enrollments (course doesn't exist)")
                for e in orphaned[:3]:
                    print(f"   - Enrollment {e['id'][:12]}... points to non-existent course {e['course_id'][:12]}...")
            else:
                print(f"   ✓ All enrollments have valid course references")
        else:
            print("   ⚠️  No courses found in database!")
            
    except Exception as e:
        print(f"   ✗ Error: {e}")
    
    print("\n" + "=" * 80)
    print("DIAGNOSIS COMPLETE")
    print("=" * 80 + "\n")

if __name__ == "__main__":
    debug_enrollments()
