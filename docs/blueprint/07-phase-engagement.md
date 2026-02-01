# Phase 7: Engagement & Assessment

## 7.1 Overview
Features to test student knowledge (Quizzes) and allow real-time interaction (Live Classes), primarily leveraging **FastAPI** for logic and scheduling.

## 7.2 Dependencies
*   Phase 6 (LMS Interface).

## 7.3 Features & UI Components
*   **Quizzes:** Multiple-choice questions embedded in the lesson flow.
*   **Assignments:** File upload submission for teacher grading.
*   **Live Classes:** Calendar integration and Zoom/Jitsi link handling.

## 7.4 Technical Implementation

### Backend (FastAPI)
*   **Assessment Service:**
    *   `POST /api/v1/assessments/submit`: Auto-grades multiple choice questions immediately to prevent cheating via client-side code inspection.
    *   `POST /api/v1/assessments/upload-assignment`: Handles homework file uploads.
*   **Scheduling:**
    *   Integration with Zoom API (optional) to generate meeting links dynamically.

### Database (Supabase)
*   **Schema:**
    *   `quiz_questions`, `quiz_options`, `quiz_attempts`.
    *   `assignments`: `student_id`, `lesson_id`, `file_url`, `grade`, `feedback`.
    *   `live_sessions`: `course_id`, `start_time`, `meeting_url`.

### Frontend (Next.js)
*   **Components:**
    *   `QuizRunner`: State machine for question traversal.
    *   `FileDropzone`: Drag-and-drop assignment submission.

## 7.5 Deliverables
*   Working Quiz engine.
*   Assignment submission system via FastAPI.
*   Live Class schedule view.
