import os
import logging
import httpx
from fastapi import FastAPI, Depends, HTTPException, status, Request
import stripe
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import Optional, List, Any

# Load environment variables
# Logger setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# START VERCEL HACK: Add current directory to path so 'models' can be imported
import sys
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)
# END VERCEL HACK

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

frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow ALL origins for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Phase 9: Rate Limiting for Security
try:
    from slowapi import Limiter, _rate_limit_exceeded_handler
    from slowapi.util import get_remote_address
    from slowapi.errors import RateLimitExceeded
    
    limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"])
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    logger.info("Rate limiting enabled")
except Exception as e:
    logger.warning(f"Rate limiting disabled due to error: {e}")
    limiter = None


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
        self.headers = headers.copy() # CRITICAL FIX: Copy headers to avoid poisoning the client
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

    def single(self):
        # In real supabase-py this sets header Accept: application/vnd.pgrst.object+json
        # Here we can simulate or just return self and handle list vs obj in execute if needed
        self.headers["Accept"] = "application/vnd.pgrst.object+json"
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
            # Add timeout to prevent hanging
            timeout = httpx.Timeout(30.0, connect=10.0)
            with httpx.Client(timeout=timeout) as client:
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

# ... existing models ...

class PaymentIntentRequest(BaseModel):
    items: List[str] # List of course IDs
    user_id: str

# API V1 Router
@app.get("/api/v1/health")
def health_check():
    return {"status": "ok", "service": "World One API", "version": "1.0.0"}

# ... (rest of the file until Payment Endpoints)

# Payment Endpoints


# Progress Endpoints

# Import models after path hack setup
from models.progress import ProgressUpdate

from datetime import datetime

@app.get("/api/v1/courses/{course_id}/progress/{user_id}")
async def get_course_progress(course_id: str, user_id: str):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not configured")
    
    try:
        response = supabase.table("progress")\
            .select("*")\
            .eq("course_id", course_id)\
            .eq("user_id", user_id)\
            .execute()
        
        return response.data if hasattr(response, 'data') else []
    except Exception as e:
        logger.error(f"Error fetching progress: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/progress/update")
async def update_progress(update: ProgressUpdate):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not configured")
    
    try:
        # Check if record exists
        existing = supabase.table("progress")\
            .select("id")\
            .eq("user_id", update.user_id)\
            .eq("lesson_id", update.lesson_id)\
            .execute()
        
        data = {
            "user_id": update.user_id,
            "lesson_id": update.lesson_id,
            "course_id": update.course_id,
            "is_completed": update.is_completed,
            "last_position_seconds": update.last_position_seconds,
            "updated_at": datetime.utcnow().isoformat()
        }
        
        if update.is_completed:
             data["completed_at"] = datetime.utcnow().isoformat()

        if existing.data and len(existing.data) > 0:
            # Update
            res = supabase.table("progress").update(data).eq("id", existing.data[0]['id']).execute()
        else:
            # Insert
            res = supabase.table("progress").insert(data).execute()
            
        return {"status": "success"}

    except Exception as e:
        logger.error(f"Error updating progress: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/payments/create-intent")
async def create_payment_intent(request: PaymentIntentRequest):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not configured")
    
    if not os.environ.get("STRIPE_SECRET_KEY"):
         raise HTTPException(status_code=500, detail="Stripe API key not configured")

    stripe.api_key = os.environ.get("STRIPE_SECRET_KEY")

    try:
        # Calculate total amount safely from server
        amount = 0
        description = []
        
        for course_id in request.items:
            # Fetch course price from DB
             response = supabase.table("courses").select("price, title").eq("id", course_id).single().execute()
             if hasattr(response, 'data') and response.data:
                 course = response.data
                 price = course.get('price', 0)
                 # Stripe expects amount in cents
                 amount += int(price * 100) 
                 description.append(course.get('title'))
        
        if amount == 0:
             raise HTTPException(status_code=400, detail="Total amount is 0")

        intent = stripe.PaymentIntent.create(
            amount=amount,
            currency="usd", # Make dynamic if needed
            automatic_payment_methods={"enabled": True},
            metadata={
                "course_ids": ",".join(request.items),
                "user_id": request.user_id
            }
        )
        
        return {
            "clientSecret": intent.client_secret,
            "dpmCheckerLink": f"https://dashboard.stripe.com/settings/payment_methods/review?transaction_currency=usd&client_secret={intent.client_secret}"
        }

    except Exception as e:
        logger.error(f"Error creating payment intent: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/v1/payments/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body().decode("utf-8") # payload typically bytes
    sig_header = request.headers.get('stripe-signature')
    webhook_secret = os.environ.get("STRIPE_WEBHOOK_SECRET")
    
    if not webhook_secret:
         logger.warning("Stripe webhook secret not configured")
         raise HTTPException(status_code=500, detail="Webhook secret not configured")

    event = None

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )
    except ValueError as e:
        # Invalid payload
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        raise HTTPException(status_code=400, detail="Invalid signature")

    # Handle the event
    if event['type'] == 'payment_intent.succeeded':
        payment_intent = event['data']['object']
        # Fulfill the purchase...
        handle_payment_success(payment_intent)
    
    return {"status": "success"}

def handle_payment_success(payment_intent):
    if not supabase:
        logger.error("Supabase not initialized in webhook handler")
        return

    metadata = payment_intent.get("metadata", {})
    course_ids_str = metadata.get("course_ids", "")
    user_id = metadata.get("user_id", "")

    if not course_ids_str or not user_id:
        logger.warning("Missing metadata in payment intent, cannot enroll")
        return
        
    course_ids = course_ids_str.split(",")
    
    for course_id in course_ids:
        try:
            # Check if already enrolled?
            # Insert enrollment
            data = {
                "user_id": user_id,
                "course_id": course_id
            }
            # Add created_at automatically by DB or explicit? DB default is now().
            supabase.table("enrollments").insert(data).execute()
            logger.info(f"Enrolled user {user_id} in course {course_id}")
        except Exception as e:
            logger.error(f"Failed to enroll user {user_id} in course {course_id}: {e}")

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
    from urllib.parse import unquote
    slug = unquote(slug)
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

        # 3. Fetch ALL Lessons for this course in a SINGLE query (optimized)
        # Build a list of module IDs
        module_ids = [mod['id'] for mod in modules]
        
        # Fetch all lessons for all modules at once
        all_lessons = []
        if module_ids:
            # Use 'in' filter to get all lessons for all modules in one query
            # Note: Supabase REST API uses 'in.(val1,val2,...)' syntax
            module_ids_str = ','.join(f'"{mid}"' for mid in module_ids)
            lessons_response = supabase.table("course_lessons")\
                .select("*")\
                .execute()
            
            # Filter lessons that belong to our modules
            if hasattr(lessons_response, 'data') and lessons_response.data:
                all_lessons = [l for l in lessons_response.data if l.get('module_id') in module_ids]
        
        # Group lessons by module_id
        lessons_by_module = {}
        for lesson in all_lessons:
            mid = lesson.get('module_id')
            if mid not in lessons_by_module:
                lessons_by_module[mid] = []
            lessons_by_module[mid].append(lesson)
        
        # Sort lessons within each module by order, then created_at
        for mid in lessons_by_module:
            lessons_by_module[mid].sort(key=lambda x: (x.get('order', 0), x.get('created_at', '')))
        
        # Attach lessons to modules
        full_modules = []
        for mod in modules:
            mod['lessons'] = lessons_by_module.get(mod['id'], [])
            full_modules.append(mod)

        course['modules'] = full_modules
        return course

    except HTTPException as he:
        raise he
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        logger.error(f"❌ Error fetching course by slug '{slug}':\n{error_details}")
        raise HTTPException(
            status_code=500, 
            detail=f"Internal Server Error while fetching course: {str(e)}"
        )

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
            new_lesson = response.data[0]
            
            # --- Auto-create specific record based on type ---
            if lesson.lesson_type == 'assignment':
                try:
                    assign_data = {
                        "lesson_id": new_lesson['id'],
                        "title": lesson.title,
                        "description": "Please upload your submission here.",
                         # Default due date +7 days? Leave null for now.
                    }
                    supabase.table("assignments").insert(assign_data).execute()
                    logger.info("Auto-created assignment record")
                except Exception as e:
                    logger.error(f"Failed to auto-create assignment: {e}")

            elif lesson.lesson_type == 'quiz':
                try:
                    quiz_data = {
                        "lesson_id": new_lesson['id'],
                        "title": lesson.title,
                        "description": "Assessment Quiz"
                    }
                    supabase.table("quizzes").insert(quiz_data).execute()
                    logger.info("Auto-created quiz record")
                except Exception as e:
                    logger.error(f"Failed to auto-create quiz: {e}")
            
            return new_lesson
            
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



# Payment Endpoints

class MockPaymentRequest(BaseModel):
    items: List[str]
    user_id: str

@app.post("/api/v1/payments/mock-process")
async def mock_payment_process(request: MockPaymentRequest):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not configured")
    
    logger.info(f"Processing mock payment for user {request.user_id} with items {request.items}")

    try:
        results = []
        for course_id in request.items:
            # Check if course exists
            course_res = supabase.table("courses").select("id").eq("id", course_id).execute()
            if not (hasattr(course_res, 'data') and course_res.data and len(course_res.data) > 0):
                logger.warning(f"Course {course_id} not found, skipping enrollment")
                continue

            # Check for existing enrollment
            existing = supabase.table("enrollments").select("*").eq("user_id", request.user_id).eq("course_id", course_id).execute()
            if existing.data and len(existing.data) > 0:
                logger.info(f"User {request.user_id} already enrolled in {course_id}")
                results.append({"course_id": course_id, "status": "already_enrolled"})
                continue
                
            # Enroll
            data = {
                "user_id": request.user_id,
                "course_id": course_id
            }
            # Note: The database 'enrollments' table must exist.
            res = supabase.table("enrollments").insert(data).execute()
            results.append({"course_id": course_id, "status": "enrolled"})
            
        return {"status": "success", "results": results}

    except Exception as e:
        logger.error(f"Error in mock payment: {e}")
        # Print stack trace for debugging
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Mock payment failed: {str(e)}")


# ==================================================================================
# PHASE 7: ENGAGEMENT & ASSESSMENT (Quizzes, Assignments)
# ==================================================================================

# --- Models ---
class QuizQuestionBase(BaseModel):
    question_text: str
    question_type: str = 'multiple_choice'
    points: int = 1
    order_index: int = 0

class QuizOptionBase(BaseModel):
    option_text: str
    is_correct: bool = False
    order_index: int = 0

class QuizCreate(BaseModel):
    lesson_id: str
    title: str
    description: Optional[str] = None
    questions: List[dict] # Nested structure: [{text, options: [{text, is_correct}]}]

class QuizSubmit(BaseModel):
    quiz_id: str
    user_id: str
    answers: dict # {question_id: option_id}

class AssignmentCreate(BaseModel):
    lesson_id: str
    title: str
    description: Optional[str] = None
    due_date: Optional[str] = None

class AssignmentSubmit(BaseModel):
    assignment_id: str
    user_id: str
    file_url: str
    comments: Optional[str] = None

# --- Endpoints ---

@app.post("/api/v1/quizzes", status_code=status.HTTP_201_CREATED)
def create_quiz(quiz: QuizCreate):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not configured")
    
    try:
        # 1. Create Quiz Header
        quiz_data = {
            "lesson_id": quiz.lesson_id,
            "title": quiz.title,
            "description": quiz.description
        }
        res_quiz = supabase.table("quizzes").insert(quiz_data).execute()
        
        if not (hasattr(res_quiz, 'data') and res_quiz.data):
             raise HTTPException(status_code=500, detail="Failed to create quiz record")
        
        quiz_id = res_quiz.data[0]['id']
        
        # 2. Create Questions & Options
        for q_idx, q in enumerate(quiz.questions):
            q_data = {
                "quiz_id": quiz_id,
                "question_text": q['question_text'],
                "question_type": q.get('question_type', 'multiple_choice'),
                "points": q.get('points', 1),
                "order_index": q_idx
            }
            res_q = supabase.table("quiz_questions").insert(q_data).execute()
            
            if hasattr(res_q, 'data') and res_q.data:
                question_id = res_q.data[0]['id']
                
                # Options
                if 'options' in q:
                    for o_idx, opt in enumerate(q['options']):
                        opt_data = {
                            "question_id": question_id,
                            "option_text": opt['option_text'],
                            "is_correct": opt.get('is_correct', False),
                            "order_index": o_idx
                        }
                        supabase.table("quiz_options").insert(opt_data).execute()
                        
        return {"message": "Quiz created successfully", "quiz_id": quiz_id}

    except Exception as e:
        logger.error(f"Error creating quiz: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/lessons/{lesson_id}/quiz")
def get_lesson_quiz(lesson_id: str):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not configured")
    
    try:
        # Fetch quiz (assuming 1 per lesson for now)
        res_quiz = supabase.table("quizzes").select("*").eq("lesson_id", lesson_id).single().execute()
        
        if not (hasattr(res_quiz, 'data') and res_quiz.data):
             return None # No quiz found
             
        quiz = res_quiz.data
        
        # Fetch Questions
        res_qs = supabase.table("quiz_questions").select("*").eq("quiz_id", quiz['id']).order('order_index').execute()
        questions = res_qs.data if (hasattr(res_qs, 'data') and res_qs.data) else []
        
        # Fetch Options for each Question
        full_questions = []
        for q in questions:
            res_opts = supabase.table("quiz_options").select("*").eq("question_id", q['id']).execute()
            # For client-side, we might want to hide 'is_correct' if it's an exam, 
            # but for self-paced immediate feedback, we can send it or check on server. 
            # Let's send it for now to allow easier client-side grading or check.
            q['options'] = res_opts.data if (hasattr(res_opts, 'data') and res_opts.data) else []
            full_questions.append(q)
            
        quiz['questions'] = full_questions
        return quiz
        
    except Exception as e:
        logger.error(f"Error fetching quiz: {e}")
        # Return 404 if not found logic, but here we just return None logic usually handled by frontend
        # but let's return 404 if specific error
        if "No rows found" in str(e) or "JSON object requested" in str(e):
             return None
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/assessments/submit")
async def submit_quiz(attempt: QuizSubmit):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not configured")
        
    try:
        # 1. Fetch correct answers to grade server-side
        # This prevents cheating.
        
        score = 0
        max_score = 0
        
        # Get all questions for this quiz
        res_qs = supabase.table("quiz_questions").select("id, points").eq("quiz_id", attempt.quiz_id).execute()
        questions = {q['id']: q['points'] for q in res_qs.data} if res_qs.data else {}
        
        # Get all correct options
        # In a real app, optimize this query
        res_opts = supabase.table("quiz_options").select("id, question_id").eq("is_correct", True).execute()
        correct_map = {o['question_id']: o['id'] for o in res_opts.data} if res_opts.data else {}
        
        for q_id, points in questions.items():
            max_score += points
            user_answer_id = attempt.answers.get(q_id)
            if user_answer_id and user_answer_id == correct_map.get(q_id):
                score += points
        
        # 2. Save Attempt
        attempt_data = {
            "quiz_id": attempt.quiz_id,
            "user_id": attempt.user_id,
            "score": score,
            "max_score": max_score,
            "completed_at": datetime.utcnow().isoformat()
        }
        
        res = supabase.table("quiz_attempts").insert(attempt_data).execute()
        
        return {
            "status": "success",
            "score": score,
            "max_score": max_score,
            "percentage": (score / max_score * 100) if max_score > 0 else 0
        }
        
    except Exception as e:
        logger.error(f"Error submitting quiz: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/assignments", status_code=status.HTTP_201_CREATED)
def create_assignment(assignment: AssignmentCreate):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not configured")
    
    try:
        data = {
            "lesson_id": assignment.lesson_id,
            "title": assignment.title,
            "description": assignment.description,
            "due_date": assignment.due_date
        }
        res = supabase.table("assignments").insert(data).execute()
        if hasattr(res, 'data') and res.data:
            return res.data[0]
        return {"message": "Assignment created", "data": data}
    except Exception as e:
        logger.error(f"Error creating assignment: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/lessons/{lesson_id}/assignment")
def get_lesson_assignment(lesson_id: str):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not configured")
    try:
        res = supabase.table("assignments").select("*").eq("lesson_id", lesson_id).single().execute()
        if hasattr(res, 'data') and res.data:
            return res.data
        return None
    except Exception as e:
        # 404 is fine
        return None

@app.get("/api/v1/quizzes/{quiz_id}/attempts/{user_id}")
def get_quiz_attempts(quiz_id: str, user_id: str):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not configured")
    try:
        res = supabase.table("quiz_attempts")\
            .select("*")\
            .eq("quiz_id", quiz_id)\
            .eq("user_id", user_id)\
            .order("completed_at", desc=True)\
            .execute()
        return res.data if hasattr(res, 'data') and res.data else []
    except Exception as e:
        logger.error(f"Error fetching quiz attempts: {e}")
        return []

@app.post("/api/v1/assessments/upload-assignment")
def submit_assignment(submission: AssignmentSubmit):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not configured")
    
    try:
        data = {
            "assignment_id": submission.assignment_id,
            "user_id": submission.user_id,
            "file_url": submission.file_url,
            "comments": submission.comments,
            "submitted_at": datetime.utcnow().isoformat()
        }
        
        # Upsert? Or Insert? Let's Insert for history, but typically 1 active submission
        # Check existing
        existing = supabase.table("assignment_submissions").select("id").eq("assignment_id", submission.assignment_id).eq("user_id", submission.user_id).execute()
        
        if existing.data and len(existing.data) > 0:
            # Update
            res = supabase.table("assignment_submissions").update(data).eq("id", existing.data[0]['id']).execute()
            status_msg = "updated"
        else:
            res = supabase.table("assignment_submissions").insert(data).execute()
            status_msg = "submitted"
            
        return {"status": "success", "action": status_msg}

    except Exception as e:
        logger.error(f"Error submitting assignment: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/live-sessions")
def get_live_sessions(user_id: str):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not configured")
    
    try:
        # 1. Get enrolled courses
        res_enroll = supabase.table("enrollments").select("course_id").eq("user_id", user_id).execute()
        if not (hasattr(res_enroll, 'data') and res_enroll.data):
            return []
            
        course_ids = [e['course_id'] for e in res_enroll.data]
        
        if not course_ids:
            return []

        # 2. Get sessions for these courses
        # supabase-py doesn't strictly support "in" array cleanly in all versions via query builder like this without exact syntax
        # Using filter=course_id=in.(...)
        
        # Manually constructing filter string for 'in' not always easy with this mini-client wrapper if not implemented.
        # My mini-client has `eq`. It likely doesn't have `in_`.
        # I'll loop or use raw query if possible. Or just fetch all and filter in python (inefficient but works for prototype).
        
        res_sessions = supabase.table("live_sessions").select("*").order("start_time").execute()
        sessions = res_sessions.data if (hasattr(res_sessions, 'data') and res_sessions.data) else []
        
        # Filter in python
        user_sessions = [s for s in sessions if s['course_id'] in course_ids]
        return user_sessions

    except Exception as e:
        logger.error(f"Error fetching live sessions: {e}")
        return [] # Return empty on error for now

# ==================================================================================
# PHASE 8: DASHBOARDS & REPORTING
# ==================================================================================

from fastapi.responses import StreamingResponse
from reports import generate_student_report_pdf


@app.get("/api/v1/reports/pdf/{user_id}")
def download_student_report(user_id: str):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not configured")
    
    try:
        # 1. Get Student Name
        res_user = supabase.table("profiles").select("full_name").eq("id", user_id).single().execute()
        user_name = "Student"
        if hasattr(res_user, 'data') and res_user.data:
            user_name = res_user.data.get('full_name', 'Student')
            
        # 2. Get Progress Data
        res_prog = supabase.table("view_student_progress").select("*").eq("user_id", user_id).execute()
        courses = res_prog.data if (hasattr(res_prog, 'data') and res_prog.data) else []
        
        # Format for PDF
        report_data = []
        for c in courses:
            total = c.get('total_lessons', 0)
            comp = c.get('completed_lessons', 0)
            pct = round((comp / total * 100) if total > 0 else 0)
            
            # Mock Grade logic (in real app, calculate based on quizzes)
            grade = "A" if pct > 90 else "B" if pct > 75 else "C" if pct > 60 else "In Progress"
            
            report_data.append({
                "title": c.get('course_title', 'Unknown'),
                "progress": pct,
                "grade": grade
            })
            
        pdf_buffer = generate_student_report_pdf(user_name, report_data)
        
        return StreamingResponse(
            pdf_buffer, 
            media_type="application/pdf", 
            headers={"Content-Disposition": f"attachment; filename=report_{user_id}.pdf"}
        )

    except Exception as e:
        logger.error(f"Error generating PDF: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==================================================================================
# PHASE 8: ANALYTICS & DASHBOARD ENDPOINTS
# ==================================================================================

@app.get("/api/v1/analytics/admin")
async def get_admin_analytics():
    """
    Get admin dashboard analytics including overview stats and top courses
    Uses SQL views for optimized queries
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not configured")
    
    try:
        # 1. Get Overview Stats from view
        stats_response = supabase.table("view_admin_stats").select("*").execute()
        overview = {
            "total_users": 0,
            "total_courses": 0,
            "total_enrollments": 0,
            "total_revenue": 0
        }
        
        if hasattr(stats_response, 'data') and stats_response.data and len(stats_response.data) > 0:
            stats = stats_response.data[0]
            overview = {
                "total_users": stats.get('total_users', 0),
                "total_courses": stats.get('total_courses', 0),
                "total_enrollments": stats.get('total_enrollments', 0),
                "total_revenue": float(stats.get('total_revenue', 0))
            }
        
        # 2. Get Top Courses by Revenue from view
        top_courses_response = supabase.table("view_course_performance")\
            .select("*")\
            .order("revenue", desc=True)\
            .execute()
        
        top_courses = []
        if hasattr(top_courses_response, 'data') and top_courses_response.data:
            # Take top 5 courses
            for course in top_courses_response.data[:5]:
                top_courses.append({
                    "title": course.get('title', 'Unknown'),
                    "revenue": float(course.get('revenue', 0)),
                    "enrollment_count": course.get('enrollment_count', 0)
                })
        
        return {
            "overview": overview,
            "top_courses": top_courses
        }
        
    except Exception as e:
        logger.error(f"Error fetching admin analytics: {e}")
        import traceback
        traceback.print_exc()
        # Return empty data instead of error to prevent dashboard crash
        return {
            "overview": {
                "total_users": 0,
                "total_courses": 0,
                "total_enrollments": 0,
                "total_revenue": 0
            },
            "top_courses": []
        }

@app.get("/api/v1/analytics/student/{user_id}")
async def get_student_analytics(user_id: str):
    """
    Get student progress analytics for parent dashboard
    Uses view_student_progress for optimized queries
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not configured")
    
    try:
        # Get student progress from view
        progress_response = supabase.table("view_student_progress")\
            .select("*")\
            .eq("user_id", user_id)\
            .execute()
        
        courses = []
        total_progress = 0
        
        if hasattr(progress_response, 'data') and progress_response.data:
            for item in progress_response.data:
                total_lessons = item.get('total_lessons', 0)
                completed_lessons = item.get('completed_lessons', 0)
                
                courses.append({
                    "course_title": item.get('course_title', 'Unknown'),
                    "completed_lessons": completed_lessons,
                    "total_lessons": total_lessons
                })
                
                if total_lessons > 0:
                    total_progress += (completed_lessons / total_lessons) * 100
        
        avg_progress = round(total_progress / len(courses)) if len(courses) > 0 else 0
        
        return {
            "courses": courses,
            "summary": {
                "total_courses": len(courses),
                "avg_progress": avg_progress
            }
        }
        
    except Exception as e:
        logger.error(f"Error fetching student analytics: {e}")
        import traceback
        traceback.print_exc()
        return {
            "courses": [],
            "summary": {
                "total_courses": 0,
                "avg_progress": 0
            }
        }

@app.get("/api/v1/parents/children")
async def get_parent_children(user_id: str):
    """
    Get list of children linked to a parent account
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not configured")
    
    try:
        # Get linked students
        links_response = supabase.table("parent_student_links")\
            .select("student_id")\
            .eq("parent_id", user_id)\
            .eq("status", "active")\
            .execute()
        
        if not hasattr(links_response, 'data') or not links_response.data:
            return []
        
        # Get student details
        student_ids = [link['student_id'] for link in links_response.data]
        children = []
        
        for student_id in student_ids:
            profile_response = supabase.table("profiles")\
                .select("id, full_name, avatar_url")\
                .eq("id", student_id)\
                .single()\
                .execute()
            
            if hasattr(profile_response, 'data') and profile_response.data:
                children.append(profile_response.data)
        
        return children
        
    except Exception as e:
        logger.error(f"Error fetching parent children: {e}")
        return []

@app.post("/api/v1/parents/link-child")
async def link_child_to_parent(parent_id: str, student_email: str):
    """
    Link a child to a parent account by email
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not configured")
    
    try:
        # Find student by email
        # Note: This requires querying auth.users which might not be directly accessible
        # Alternative: Use profiles table with email field
        
        # For now, return a placeholder
        raise HTTPException(status_code=501, detail="Link child feature not yet implemented")
        
    except Exception as e:
        logger.error(f"Error linking child: {e}")
        raise HTTPException(status_code=500, detail=str(e))





if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8002)
