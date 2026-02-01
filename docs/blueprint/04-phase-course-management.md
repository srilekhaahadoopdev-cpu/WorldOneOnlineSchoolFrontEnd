# Phase 4: Course Management (Admin/Creator)

## 4.1 Overview
Enables Teachers and Admins to create and structure courses. This phase introduces complex file handling using **FastAPI**.

## 4.2 Dependencies
*   Phase 2 (Auth/Permissions).
*   Phase 3 (public.courses table existing).

## 4.3 Features & UI Components
*   **Course Builder UI:**
    *   Drag-and-drop Curriculum editor (Sections > Lessons).
    *   Rich Text Editor for Lesson content.
*   **Media Center:**
    *   Video Uploader (Progress bar, chunked upload).
    *   PDF/Resource manager.
*   **Dashboards:**
    *   Teacher "My Created Courses" view.

## 4.4 Technical Implementation

### Frontend (Next.js)
*   **UI:** React Sortable HOC or similar for drag-and-drop.
*   **Uploads:**
    *   File uploads are **not** sent directly to Supabase Storage.
    *   frontend POSTs file to FastAPI endpoint (or requests presigned URL).

### Backend (FastAPI)
*   **Media Handler Service:**
    *   `POST /api/v1/media/upload`: Accepts file, validates MIME type and size.
    *   **Logic:**
        1.  Receive file stream.
        2.  (Optional) Compress image or transcode start.
        3.  Upload to Supabase Storage (boto3 or supabase-py).
        4.  Return public URL to frontend.
*   **Course Logic:**
    *   Validating course structure integrity before publishing.

### Database (Supabase)
*   **Schema:**
    *   `course_modules`: `id`, `course_id`, `title`, `order`.
    *   `course_lessons`: `id`, `module_id`, `type` (video/text/quiz), `content_url`, `order`.
*   **Storage:**
    *   Bucket `course-content`.
    *   Policy: Authenticated Uploads only.

## 4.5 Deliverables
*   Functional Course Builder.
*   FastAPI Video/File Upload endpoint integration.
*   Persistence of complex Course hierarchy.
