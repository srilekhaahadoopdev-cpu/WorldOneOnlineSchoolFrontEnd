@app.post("/api/v1/modules", status_code=status.HTTP_201_CREATED)
def create_module(module: ModuleCreate):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not configured")
    
    try:
        response = supabase.table("course_modules").insert(module.dict()).execute()
        if hasattr(response, 'data') and response.data:
            return response.data[0]
        return {"message": "Module created", "data": module.dict()}
    except Exception as e:
        logger.error(f"Error creating module: {e}")
        raise HTTPException(status_code=400, detail=str(e))

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
            .execute()
        return response.data
    except Exception as e:
        logger.error(f"Error fetching modules: {e}")
        raise HTTPException(status_code=500, detail=str(e))
