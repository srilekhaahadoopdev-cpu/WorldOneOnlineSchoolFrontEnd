import requests
import json

API_URL = "http://localhost:8000/api/v1"

print("="*60)
print("TESTING ADMIN ANALYTICS ENDPOINT")
print("="*60)
try:
    res = requests.get(f"{API_URL}/analytics/admin")
    print(f"Status Code: {res.status_code}\n")
    data = res.json()
    print("Full Response:")
    print(json.dumps(data, indent=2))
    
    print("\n" + "="*60)
    print("INTERPRETATION:")
    print("="*60)
    if 'overview' in data:
        print(f"✓ Overview data exists")
        print(f"  - Total Users: {data['overview'].get('total_users', 'N/A')}")
        print(f"  - Total Courses: {data['overview'].get('total_courses', 'N/A')}")
        print(f"  - Total Enrollments: {data['overview'].get('total_enrollments', 'N/A')}")
        print(f"  - Total Revenue: ${data['overview'].get('total_revenue', 'N/A')}")
    
    if 'top_courses' in data:
        print(f"\n✓ Top courses data exists")
        print(f"  - Number of top courses: {len(data['top_courses'])}")
        for i, course in enumerate(data['top_courses'][:3], 1):
            print(f"  {i}. {course.get('title', 'N/A')} - ${course.get('revenue', 0)}")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "="*60)
print("FRONTEND ACCESS TEST")
print("="*60)
print("Try opening http://localhost:3000/admin in your browser")
print("You should see:")
print("  1. KPI cards with numbers")
print("  2. A bar chart showing top courses")
print("  3. A table of all courses at the bottom")
