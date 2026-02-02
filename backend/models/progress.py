from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ProgressUpdate(BaseModel):
    user_id: str
    lesson_id: str
    course_id: str
    is_completed: bool = False
    last_position_seconds: int = 0
