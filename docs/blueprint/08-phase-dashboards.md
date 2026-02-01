# Phase 8: Dashboards & Reporting

## 8.1 Overview
Specialized dashboards for different user roles to track performance, sales, and academic progress.

## 8.2 Dependencies
*   Phase 7 (Assessments & Data generation).

## 8.3 Features & UI Components
*   **Parent Dashboard:** "Add Child", View Grade Report (PDF).
*   **Teacher Dashboard:** Gradebook grid, Student Analytics.
*   **Admin Dashboard:** Revenue charts, User growth stats.

## 8.4 Technical Implementation

### Frontend (Next.js)
*   **Visualization:** Recharts or Chart.js for graphs.
*   **DataTables:** TanStack Table for sorting/filtering large student lists.

### Backend (FastAPI)
*   **Reporting Engine:**
    *   `GET /api/v1/reports/pdf/{student_id}`: Generates a PDF report card using a library like `ReportLab` or `WeasyPrint`.
    *   `GET /api/v1/analytics/admin`: Aggregates heavy stats (SQL `COUNT`, `SUM`) via optimized queries to Supabase, keeping the frontend light.

### Database (Supabase)
*   **Views:**
    *   Create SQL Views (e.g., `view_instructor_revenue`) to simplify complex dashboard queries.

## 8.5 Deliverables
*   Parent Portal (Child linking).
*   Teacher Gradebook.
*   Admin Analytics Dashboard.
*   PDF Report generation.
