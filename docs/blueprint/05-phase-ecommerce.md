# Phase 5: E-commerce & Payments

## 5.1 Overview
Integration of e-commerce functionality using Stripe, completely managed via **FastAPI** to ensure secure handling of financial intents and webhooks.

## 5.2 Dependencies
*   Phase 3 (Catalog prices).
*   Phase 4 (Course existence).

## 5.3 Features & UI Components
*   **Cart:** Client-side cart state (Zustand).
*   **Checkout:** Stripe Elements embedded form.
*   **Order History:** User dashboard view of receipts.

## 5.4 Technical Implementation

### Backend (FastAPI - CRITICAL)
*   **Payment Gateway:**
    *   `POST /api/v1/payments/create-intent`: Receives cart items, calculates total *server-side* (secure price lookup from DB), returns `client_secret`.
*   **Webhook Handler:**
    *   `POST /api/v1/payments/webhook`: Stripe calls this.
    *   **Logic:**
        1.  Verify Stripe Signature.
        2.  On `checkout.session.completed`, insert record into `enrollments`.
        3.  Trigger email confirmation (via email service).

### Frontend (Next.js)
*   **Stripe:** `@stripe/react-stripe-js`.
*   **Flow:**
    1.  User clicks Checkout.
    2.  Frontend calls FastAPI `create-intent`.
    3.  Frontend loads Stripe Element with secret.
    4.  User pays -> Stripe confirms -> Redirect to Success page.

### Database (Supabase)
*   **Schema:**
    *   `orders`: `id`, `user_id`, `total`, `status`, `stripe_session_id`.
    *   `enrollments`: `user_id`, `course_id`, `created_at`.
*   **RLS:**
    *   `enrollments`: Users can select their own enrollments.

## 5.5 Integration with Landing Page (Phase 0)
*   **Pricing Cards:** The "Subscribe" or "But Now" buttons on the Landing Page pricing section must initiate the Stripe Checkout flow defined here.
*   **Currency:** Ensure the Landing Page pricing reflects the same multi-currency logic as the checkout.

## 5.6 Deliverables
*   Secure Checkout Flow.
*   FastAPI Stripe Webhook listener.
*   Automated enrollment upon payment.
