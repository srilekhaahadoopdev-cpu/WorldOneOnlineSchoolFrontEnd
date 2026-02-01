# Phase 3: Public Website & Course Catalog

## 3.1 Overview
Development of the public-facing marketing pages and the browsable course catalog. This is the "storefront" of World One Online School.

## 3.2 Dependencies
*   Phase 1 (Design System).
*   Phase 2 (Auth - for functional "Join" buttons).

## 3.3 Features & UI Components
*   **Deep Branding:**
    *   Consistent header/footer from Phase 0.
*   **Pages:**
    *   `Catalog`: Grid with filters (Grade, Subject, Price) - accessed via "Explore Courses" in Phase 0.
    *   `Course Detail (PDP)`: Rich text description, curriculum preview (read-only), Instructor bio.
*   **Components:**
    *   `CourseCard`: Reusable component displaying thumbnail, title, price, and rating.
    *   `FilterSidebar`: Accordion-style filters.

## 3.4 Technical Implementation

### Frontend (Next.js)
*   **Data Fetching:**
    *   Use Server Components for SEO-critical pages (`page.tsx`).
    *   Fetch course data from Supabase directly in Server Components for maximum speed.
*   **Search:** Implement client-side filtering or debounced server-side search.

### Backend (FastAPI)
*   *Minimal involvement in this phase.*
*   Optional: `GET /api/v1/public/recommendations` if using an AI recommendation engine later.

### Database (Supabase)
*   **Schema:** `public.courses`
    *   Columns: `title`, `slug` (unique), `description`, `price`, `thumbnail_url`, `instructor_id` (FK to profiles), `is_published`.
*   **RLS Policies:**
    *   `courses`: Select allowed for `anon` role (public) where `is_published = true`.

## 3.5 Integration with Landing Page (Phase 0)
*   **Featured Courses:** Provide an API endpoint or Server Component to render the "Top 3 Courses" on the Landing Page.
*   **Search Bar:** If the Landing Page has a search input, it should redirect to `/courses?q={query}`.

## 3.6 Deliverables
*   High-performance Catalog page.
*   Dynamic Course Detail pages generated from DB.
*   SEO metadata implementation.
