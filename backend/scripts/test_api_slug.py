import httpx

def test_api():
    base_url = "http://127.0.0.1:8000/api/v1"
    slug = "iit-foundation-7th-to-10th-graders"
    
    print(f"Testing slug: {slug}")
    try:
        res = httpx.get(f"{base_url}/courses/slug/{slug}")
        print(f"Status: {res.status_code}")
        if res.status_code == 200:
            data = res.json()
            print(f"Course Found: {data['title']}")
            print(f"Modules: {len(data.get('modules', []))}")
            for m in data.get('modules', []):
                print(f"  Module: {m['title']} | Lessons: {len(m.get('lessons', []))}")
        else:
            print(f"Error: {res.text}")
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    test_api()
