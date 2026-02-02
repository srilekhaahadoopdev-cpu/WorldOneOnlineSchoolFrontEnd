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
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

def fix_course_slugs():
    # Get all courses
    api_url = f"{url}/rest/v1/courses?select=id,title,slug"
    try:
        response = httpx.get(api_url, headers=headers)
        if response.status_code == 200:
            courses = response.json()
            print(f"Found {len(courses)} courses")
            
            for course in courses:
                # Generate proper slug from title
                title = course['title']
                # Create slug: lowercase, replace spaces with hyphens, remove special chars
                slug = title.lower()
                slug = slug.replace(' ', '-')
                slug = ''.join(c for c in slug if c.isalnum() or c == '-')
                slug = '-'.join(filter(None, slug.split('-')))  # Remove multiple hyphens
                
                print(f"\nCourse: {title}")
                print(f"Current slug: '{course['slug']}'")
                print(f"New slug: '{slug}'")
                
                # Update the course
                update_url = f"{url}/rest/v1/courses?id=eq.{course['id']}"
                update_data = {"slug": slug}
                update_response = httpx.patch(update_url, headers=headers, json=update_data)
                
                if update_response.status_code == 200:
                    print("✓ Updated successfully")
                else:
                    print(f"✗ Update failed: {update_response.status_code} - {update_response.text}")
        else:
            print(f"Error {response.status_code}: {response.text}")
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    fix_course_slugs()
