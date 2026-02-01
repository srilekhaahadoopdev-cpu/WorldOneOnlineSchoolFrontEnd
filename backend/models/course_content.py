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
