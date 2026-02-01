# World One Online School - Development Blueprint

## 🌍 Project Overview
This blueprint outlines the 9-phase development strategy for **World One Online School**, a premium global EdTech platform. Each phase is designed to be largely self-contained while building sequentially towards the final vision.

## 🛠 Tech Stack (Strictly Enforced)
*   **Frontend:** Next.js 14+ (App Router, TypeScript)
*   **Database & Auth:** Supabase (PostgreSQL, GoTrue, Storage)
*   **Backend API:** FastAPI (Python)
    *   *Role:* Handles complex business logic, Payments (Stripe), Media Uploads, and Report Generation.

## 📅 Phase Summary

| Phase | Title | Status | Key Outcome |
| :--- | :--- | :--- | :--- |
| **00** | [Design System & Landing Page Logic](./00-phase-landing-design.md) | ✅ **Done** | Mandatory UI Specs, Landing Page. |
| **01** | [Foundation & Infrastructure](./01-phase-foundation.md) | ✅ **Done** | Project setup, FastAPI connection, Env vars. |
| **02** | [Auth & User Profiles](./02-phase-auth.md) | ✅ **Done** | Login/Register, Middleware, Dashboard. |
| **03** | [Public Website & Catalog](./03-phase-public-catalog.md) | 🚧 **In Progress** | **Catalog Page Live**, Course Schema. Next: Detail Pages. |
| **04** | [Course Management](./04-phase-course-management.md) | ⏳ Pending | Course Builder, Content Uploads. |
| **05** | [E-commerce & Payments](./05-phase-ecommerce.md) | ⏳ Pending | Stripe Integration, Cart, Checkout. |
| **06** | [LMS & Learning Exp](./06-phase-lms.md) | ⏳ Pending | Video Player, Progress Tracking. |
| **07** | [Engagement & Assessment](./07-phase-engagement.md) | ⏳ Pending | Quizzes, Assignments, Live Classes. |
| **08** | [Dashboards & Reporting](./08-phase-dashboards.md) | ⏳ Pending | Analytics, Grading, PDF Reports. |
| **09** | [Global Scaling](./09-phase-scaling.md) | ⏳ Pending | i18n, Performance, Security. |

## 🚀 Execution Guide
1.  **Sequential Order:** Do not skip phases. Phase 2 depends on Phase 1's infrastructure. Phase 5 depends on Phase 4's content.
2.  **FastAPI Role:** Remember that while Supabase handles simple CRUD, **FastAPI** is the brain for process-heavy tasks (Payments, Files, PDFs).
3.  **UI/UX:** Every phase must strictly adhere to the "World One" Premium Design System defined in **Phase 0**.

---
*Refer to individual Phase files for strict implementation details.*
