import os
import logging
import httpx
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import Optional, List, Any

# Load environment variables
# Logger setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
# 1. Load from backend .env (Explicit path to ensure it is found)
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_env_path = os.path.join(current_dir, '.env')
load_dotenv(backend_env_path)
logger.info(f"Loaded backend env from: {backend_env_path}")

# 2. Load from frontend .env.local (fallback/supplement)
frontend_env_path = os.path.join(os.path.dirname(current_dir), 'frontend', '.env.local')
load_dotenv(frontend_env_path)
logger.info(f"Loaded frontend env from: {frontend_env_path}")

app = FastAPI(
    title="World One Online School API",
    description="Backend API for World One Online School",
    version="1.0.0",
    docs_url="/api/v1/docs",
    openapi_url="/api/v1/openapi.json"
)

# CORS Configuration
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow ALL origins for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ... (omitting unchanged client code) ...




# Mini Supabase Client (Replacement for supabase-py due to installation issues)
class SupabaseClient:
    def __init__(self, url: str, key: str):
        self.url = url.rstrip('/')
        self.key = key
        self.headers = {
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }

    def table(self, name: str):
        return SupabaseQueryBuilder(self.url, self.headers, name)

class SupabaseQueryBuilder:
    def __init__(self, base_url, headers, table_name):
        self.table_url = f"{base_url}/rest/v1/{table_name}"
        self.headers = headers
        self.query_params = {}
        self.json_data = None
        self.method = "GET"

    def select(self, columns="*"):
        self.method = "GET"
        self.query_params["select"] = columns
        return self

    def eq(self, column: str, value: Any):
        self.query_params[f"{column}"] = f"eq.{value}"
        return self
    def order(self, column: str, desc: bool = False):
        direction = "desc" if desc else "asc"
        new_order = f"{column}.{direction}"
        if "order" in self.query_params:
            self.query_params["order"] += f",{new_order}"
        else:
            self.query_params["order"] = new_order
        return self

    def insert(self, data: Any):
        self.method = "POST"
        self.json_data = data
        return self

    def update(self, data: Any):
        self.method = "PATCH"
        self.json_data = data
        return self


    def delete(self):
        self.method = "DELETE"
        return self

    def execute(self):
        try:
            with httpx.Client() as client:
                if self.method == "POST":
                    response = client.post(self.table_url, headers=self.headers, json=self.json_data)
                elif self.method == "PATCH":
                    response = client.patch(self.table_url, headers=self.headers, json=self.json_data, params=self.query_params)
                elif self.method == "DELETE":
                    response = client.delete(self.table_url, headers=self.headers, params=self.query_params)
                else:
                    response = client.get(self.table_url, headers=self.headers, params=self.query_params)
                
                # Check for 204 No Content separately as it has no JSON
                if response.status_code == 204:
                   class EmptyResponse:
                       data = []
                   return EmptyResponse()

                response.raise_for_status()
                
                # Mimic supabase-py response object
                class Response:
                    def __init__(self, data):
                        self.data = data
                
                return Response(response.json())
        except httpx.HTTPStatusError as e:
            logger.error(f"Supabase API HTTP Error: {e.response.text}")
            raise Exception(f"Supabase API Error: {e.response.text}")
        except Exception as e:
            logger.error(f"Supabase Connection Error: {e}")
            raise e

# Initialize Client
url: str = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
service_key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
anon_key: str = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

# Determine valid key
key = None
if service_key and "YOUR_SERVICE_ROLE_KEY" not in service_key and len(service_key) > 20:
    key = service_key
    logger.info("Using Service Role Key")
elif anon_key and len(anon_key) > 20:
    key = anon_key
    logger.info("Using Anon Key")
else:
    logger.warning("No valid Supabase key found (Checked SERVICE_ROLE and ANON_KEY)")

supabase: Optional[SupabaseClient] = None

if not url or not key:
    logger.warning("Supabase credentials not set or invalid. Database operations will fail.")
else:
    logger.info(f"Supabase Client initialized with URL: {url}")
    supabase = SupabaseClient(url, key)

# Models
class CourseCreate(BaseModel):
    title: str
    description: str
    price: float = 0.0
    level: str = "Primary School"
    thumbnail_url: Optional[str] = None
    slug: str

class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    level: Optional[str] = None
    is_published: Optional[bool] = None
    thumbnail_url: Optional[str] = None

class ModuleCreate(BaseModel):
    course_id: str
    title: str
    description: Optional[str] = None
    order: int = 0

class LessonCreate(BaseModel):
    module_id: str
    title: str
    lesson_type: str = "text" # video, text, quiz, pdf
    content: Optional[str] = None
    video_url: Optional[str] = None
    resource_url: Optional[str] = None
    duration: int = 0
    is_free_preview: bool = False
    order: int = 0

# API V1 Router
@app.get("/api/v1/health")
def health_check():
    return {"status": "ok", "service": "World One API", "version": "1.0.0"}

@app.get("/")
def read_root():
    return {"message": "Welcome to World One Online School API."}

@app.get("/api/v1/courses")
def get_courses():
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not configured")
    
    try:
        # Fetch all courses
        response = supabase.table("courses").select("*").execute()
        return response.data
    except Exception as e:
        logger.error(f"Error fetching courses: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/courses", status_code=status.HTTP_201_CREATED)
def create_course(course: CourseCreate):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not configured")
    
    data = course.dict()
    data['is_published'] = False # Default to draft
    
    try:
        response = supabase.table("courses").insert(data).execute()
        if hasattr(response, 'data') and response.data:
            return response.data[0]
        return {"message": "Course created", "data": data}
            
    except Exception as e:
        logger.error(f"Error creating course: {e}")
        if "duplicate key" in str(e).lower():
             raise HTTPException(status_code=400, detail="Course with this slug already exists.")
        raise HTTPException(status_code=400, detail=str(e))
# ... existing code ...


# ... existing endpoints ...



@app.get("/api/v1/courses/{course_id}/modules")
def get_course_modules(course_id: str):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not configured")
    
    try:
        # Fetch modules ordered by 'order'
        response = supabase.table("course_modules")\
            .select("*")\
            .eq("course_id", course_id)\
            .order("order")\
            .order("created_at")\
            .execute()
        return response.data
        return response.data
    except Exception as e:
        logger.error(f"Error fetching modules: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.patch("/api/v1/courses/{course_id}")
def update_course(course_id: str, course_update: CourseUpdate):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not configured")
    
    # Filter out None values
    update_data = {k: v for k, v in course_update.dict().items() if v is not None}
    
    if not update_data:
         raise HTTPException(status_code=400, detail="No data content to update")

    try:
        response = supabase.table("courses").update(update_data).eq("id", course_id).execute()
        
        if hasattr(response, 'data') and response.data:
            return response.data[0]
        # Fallback if no data return or different format
        return {"message": "Course updated", "data": update_data}
            
    except Exception as e:
        logger.error(f"Error updating course: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/courses/slug/{slug}")

def get_course_by_slug(slug: str):
    if not supabase:
         raise HTTPException(status_code=500, detail="Database connection not configured")
    
    try:
        # 1. Fetch Course by slug
        response = supabase.table("courses").select("*").eq("slug", slug).execute()
        
        course = None
        if hasattr(response, 'data') and response.data:
            if isinstance(response.data, list) and len(response.data) > 0:
                course = response.data[0]
            elif isinstance(response.data, dict):
                 course = response.data
        
        if not course:
             raise HTTPException(status_code=404, detail="Course not found")

        # 2. Fetch Modules
        mod_response = supabase.table("course_modules")\
            .select("*")\
            .eq("course_id", course['id'])\
            .order("order")\
            .order("created_at")\
            .execute()
        modules = mod_response.data if hasattr(mod_response, 'data') else []

        # 3. Fetch Lessons
        # We need to fetch all lessons for these modules
        # This is a bit inefficient (N+1) if we loop, so let's try to fetch all lessons for the course's modules
        # but Supabase-py simple client might not support complex joins easily. 
        # Let's just fetch all lessons where module_id IN (...)
        
        full_modules = []
        for mod in modules:
            less_response = supabase.table("course_lessons")\
                .select("*")\
                .eq("module_id", mod['id'])\
                .order("order")\
                .order("created_at")\
                .execute()
            mod['lessons'] = less_response.data if hasattr(less_response, 'data') else []
            full_modules.append(mod)

        course['modules'] = full_modules
        return course

    except Exception as e:
         logger.error(f"Error fetching course by slug: {e}")
         raise HTTPException(status_code=404, detail=str(e))

@app.get("/api/v1/courses/{course_id}")
def get_course(course_id: str):
    if not supabase:
         raise HTTPException(status_code=500, detail="Database connection not configured")
    
    try:
        response = supabase.table("courses").select("*").eq("id", course_id).single().execute()
        try:
             # Supabase-py v2 might return object directly or via .data
             return response.data
        except:
             return response
    except Exception as e:
         logger.error(f"Error fetching course details: {e}")
         raise HTTPException(status_code=404, detail="Course not found")

@app.post("/api/v1/lessons", status_code=status.HTTP_201_CREATED)
def create_lesson(lesson: LessonCreate):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not configured")
    
    try:
        logger.info(f"Creating lesson with payload: {lesson.dict()}")
        response = supabase.table("course_lessons").insert(lesson.dict()).execute()
        if hasattr(response, 'data') and response.data:
            return response.data[0]
        return {"message": "Lesson created", "data": lesson.dict()}
    except Exception as e:
        logger.error(f"Error creating lesson: {e}")
        # Print full stack trace
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=f"Insert failed: {str(e)}")


@app.delete("/api/v1/modules/{module_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_module(module_id: str):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not configured")
    try:
        supabase.table("course_modules").delete().eq("id", module_id).execute()
        return None
    except Exception as e:
         logger.error(f"Error deleting module: {e}")
         raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/v1/lessons/{lesson_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_lesson(lesson_id: str):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not configured")
    try:
        supabase.table("course_lessons").delete().eq("id", lesson_id).execute()
        return None
    except Exception as e:
         logger.error(f"Error deleting lesson: {e}")
         raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/modules/{module_id}/lessons")
def get_module_lessons(module_id: str):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not configured")
    
    try:
        response = supabase.table("course_lessons")\
            .select("*")\
            .eq("module_id", module_id)\
            .order("order")\
            .order("created_at")\
            .execute()
        return response.data
    except Exception as e:
        logger.error(f"Error fetching lessons: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/v1/lessons/{lesson_id}")
def update_lesson(lesson_id: str, lesson: LessonCreate):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not configured")
    
    try:
        response = supabase.table("course_lessons")\
            .update(lesson.dict())\
            .eq("id", lesson_id)\
            .execute()
        
        if hasattr(response, 'data') and response.data:
            return response.data[0]
        return {"message": "Lesson updated", "data": lesson.dict()}
    except Exception as e:
        logger.error(f"Error updating lesson: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/v1/modules", status_code=status.HTTP_201_CREATED)
def create_module(module: ModuleCreate):
    logger.info(f"Attempting to create module: {module.dict()}")
    if not supabase:
        logger.error("Database connection missing")
        raise HTTPException(status_code=500, detail="Database connection not configured")
    
    try:
        response = supabase.table("course_modules").insert(module.dict()).execute()
        if hasattr(response, 'data') and response.data:
            logger.info("Module created successfully")
            return response.data[0]
        return {"message": "Module created", "data": module.dict()}
    except Exception as e:
        logger.error(f"Error creating module: {e}")
        # Return the specific error to the frontend for debugging
        raise HTTPException(status_code=400, detail=f"DB Error: {str(e)}")

# Upload Endpoint
from fastapi import UploadFile, File

@app.post("/api/v1/upload")

async def upload_file(file: UploadFile = File(...)):
    if not supabase:
        print("ERROR: Database connection not configured")
        raise HTTPException(status_code=500, detail="Database connection not configured")
    
    try:
        # Generate unique filename to prevent collisions and handle special chars
        import uuid
        import time
        
        # Clean filename: replace spaces and keep safe chars
        original_name = file.filename.replace(' ', '_')
        # Add timestamp/uuid
        timestamp = int(time.time())
        filename = f"{timestamp}_{original_name}"
        
        # Determine content type
        content_type = file.content_type or "application/octet-stream"
        
        print(f"Uploading file: {filename}, type: {content_type}")

        # Upload via REST API directly (Supabase Storage) using streaming
        storage_url = f"{supabase.url}/storage/v1/object/course-content/{filename}"
        
        headers = {
            "Authorization": f"Bearer {supabase.key}",
            "Content-Type": content_type
        }
        
        # Define a generator to stream the file content
        async def file_generator(file_obj):
            while True:
                chunk = await file_obj.read(1024 * 1024) # 1MB chunks
                if not chunk:
                    break
                yield chunk

        # Increase timeout for large file uploads
        timeout = httpx.Timeout(600.0, connect=60.0) # 10 minutes
        async with httpx.AsyncClient(timeout=timeout) as client:
            # Note: client.post(..., content=iterable) streams the request body
            res = await client.post(storage_url, content=file_generator(file), headers=headers)
            
            print(f"Supabase response: {res.status_code}")
            
            if res.status_code != 200:
                 print(f"Storage Upload Error: {res.text}")
                 logger.error(f"Storage Upload Error: {res.text}")
                 raise HTTPException(status_code=500, detail=f"Upload failed: {res.text}")
            
        # Construct Public URL
        public_url = f"{supabase.url}/storage/v1/object/public/course-content/{filename}"
        return {"url": public_url}
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Upload Internal Error repr: {repr(e)}")
        logger.error(f"Upload Internal Error: {repr(e)}")
        raise HTTPException(status_code=500, detail=f"Server Error: {repr(e)}")



