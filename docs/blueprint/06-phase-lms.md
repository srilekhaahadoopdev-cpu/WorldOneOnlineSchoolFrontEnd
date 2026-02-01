# Phase 6: Student Learning Experience (LMS)

## 6.1 Overview
The core value product: the video player and learning interface where students consume content.

## 6.2 Dependencies
*   Phase 4 (Content).
*   Phase 5 (Enrollment verification).

## 6.3 Features & UI Components
*   **LMS Player Layout:**
    *   Sidebar: Collapsible module/lesson list with checkmarks for completion.
    *   Main Stage: Video Player (Mux/Vimeo/Raw) or Content Viewer.
*   **Progress Tracking:** "Mark as Complete" functionality.
*   **Navigation:** Auto-advance to next lesson.

## 6.4 Technical Implementation

### Frontend (Next.js)
*   **Logic:**
    *   Check `enrollments` table before rendering page. Redirect if not enrolled.
    *   **State:** Optimistic UI updates for "Mark Complete".
*   **Player:** Custom wrapper around HTML5 `<video>` or iframe.

### Backend (FastAPI)
*   **Secure Content Delivery (Optional but recommended):**
    *   `GET /api/v1/courses/{id}/lesson/{lesson_id}/stream`:
    *   Generates a signed URL (e.g., CloudFront/Supabase Storage Signed URL) valid for 1 hour.
    *   Prevents hotlinking of premium course videos.

### Database (Supabase)
*   **Schema:**
    *   `progress`: `user_id`, `lesson_id`, `completed_at`, `last_position_seconds`.
*   **RLS:**
    *   `progress`: Users can insert/update their own records.

## 6.5 Deliverables
*   Distraction-free Learning Interface.
*   Real-time progress saving.
*   Secure video playback.
