# Phase 2: Authentication & User Profiles

## 2.1 Overview
Implements secure user authentication, role-based access control (RBAC), and profile management. This phase enables the differentiation between Students, Parents, Teachers, and Admins.

## 2.2 Dependencies
*   Phase 1 (Infrastructure & Supabase connection).

## 2.3 Features & UI Components
*   **Auth UI:**
    *   Login Page (Email/Password + Google OAuth).
    *   Registration Page (with Role selection or default to Student).
    *   Forgot Password flow.
*   **Profile Management:**
    *   User Avatar upload (handled via FastAPI for resizing/validation).
    *   Profile Settings form (Name, Bio, Timezone).
*   **Backend Logic:**
    *   Custom Claims or Public Profile table to store Roles (`student`, `teacher`, `parent`, `admin`).

## 2.4 Technical Implementation

### Frontend (Next.js)
*   **Auth:** `auth-helpers-nextjs` (or currently recommended Supabase SSR package) for managing sessions in Cookies.
*   **Middleware:** `middleware.ts` to protect routes (e.g., `/dashboard/*`) based on authentication status.
*   **Context:** `AuthContext` to expose user object globally.

### Backend (FastAPI)
*   **Authentication Dependency:**
    *   Create a reusable dependency `get_current_user` that verifies the JWT token sent from Next.js (Supabase Auth Bearer Token).
    *   This ensures all FastAPI endpoints are secured effectively using Supabase's auth standards.
*   **Endpoints:**
    *   `POST /api/v1/users/setup`: Optional endpoint if complex initialization logic is needed post-signup.

### Database (Supabase)
*   **Schema:**
    *   `public.profiles` table linked to `auth.users` via triggers.
    *   Columns: `id` (uuid), `role` (enum), `full_name`, `avatar_url`, `created_at`.
*   **RLS Policies:**
    *   Enable RLS on `profiles`.
    *   Policy: "Users can view their own profile". "Public profiles area readable by authenticated users" (if social features exist).

## 2.5 Integration with Landing Page (Phase 0)
*   **Navbar Links:** Ensure the "Login" and "Get Started" buttons in the Phase 0 Navbar point to `/login` and `/register`.
*   **Redirects:**
    *   After Login -> Redirect to Dashboard (`/dashboard`).
    *   Admin Login from Footer -> Detect `admin` role -> Redirect to `/admin` (Phase 7).

## 2.6 Deliverables
*   Functional Login/Signup.
*   Protected Dashboard route.
*   Profile page showing user data.
*   FastAPI endpoint secured by JWT validation.
