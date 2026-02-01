# Phase 1: Foundation & Infrastructure Setup

## 1.1 Overview
Establishes the core technical architecture, sets up the development environment for Frontend (Next.js), Backend (FastAPI), and Database (Supabase), and implements the initial Design System.

## 1.2 Objectives
*   Initialize Next.js 14+ (App Router) project with TypeScript.
*   Setup Supabase project (Auth, DB, Storage).
*   Initialize FastAPI Python service for custom business logic.
*   implement the **Phase 0 Global Design System** (mandatory Tailwind config).
*   Establish connection between Frontend, Backend, and Database.

## 1.3 Features & UI Components
*   **Design System Implementation (See Phase 0):**
    *   Setup `tailwind.config.ts` with `brand-blue`, `deep-navy`, etc.
    *   Create `components/ui/button.tsx` with the hover/active states defined in Phase 0.
*   **Infrastructure:**
    *   Docker Compose file (optional) or local setup instructions for running Next.js and FastAPI concurrently.
    *   Gateway/Proxy setup (e.g., Next.js Rewrites) to route `/api/python/*` to FastAPI.

## 1.4 Technical Implementation

### Frontend (Next.js)
*   **Tech:** Next.js 14, Tailwind CSS, Lucide React (Icons).
*   **Config:**
    *   `tailwind.config.ts`: Define primary colors (`brand-blue`, `deep-navy`), border radius, and font families.
    *   `next.config.js`: Configure rewrites for FastAPI calls if strictly necessary to avoid CORS or expose uniform API.
*   **Structure:**
    *   `components/ui`: Shadcn/ui installation.
    *   `lib/api`: Axios/Fetch wrapper for talking to FastAPI.
    *   `lib/supabase`: Supabase Client creation.

### Backend (FastAPI)
*   **Tech:** Python 3.10+, FastAPI, Uvicorn.
*   **Setup:**
    *   Basic `main.py` with specific route prefix (e.g., `/api/v1`).
    *   Health check endpoint `/health`.
    *   CORS configuration to allow Next.js origin.
    *   Dependency injection for Supabase Client (using `supabase-py` to interact with DB from Python if needed).

### Database (Supabase)
*   **Setup:**
    *   Create new Project.
    *   Get API Credentials (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` for FastAPI).

## 1.5 Deliverables
*   Working local environment where Next.js talks to Supabase and FastAPI.
*   Global `layout.tsx` with basic provider wrapping.
*   Documented Design System with 5 core components.
