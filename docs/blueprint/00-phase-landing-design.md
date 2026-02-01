# Phase 0: Global UI/UX Design System & Landing Page

## 0.1 Overview
This phase establishes the **Mandatory Design System** for the entire platform and details the specifications for the **Public Landing Page**. 
**Crucial:** All subsequent phases (1-9) must strictly inherit these specific design tokens and rules.

## 0.2 Global UI/UX Design System (MANDATORY)

### 1. Design Style & Philosophy
*   **Aesthetic:** Modern, Minimal, Premium Institute.
*   **Layout:** Clean layouts with strong visual hierarchy (Whitespace is King).
*   **Typography:** Bold headlines for impact, clean sans-serif for long-form content.

### 2. Color Palette (Tailwind Tokens)
Configure these in `tailwind.config.ts`:
*   `brand-blue`: `#2563EB` (Primary Actions, Links)
*   `deep-navy`: `#0F172A` (Global Backgrounds, Headers, Fooers - Dark Mode Base)
*   `vibrant-teal`: `#06B6D4` (Accents, Success, Progress Bars)
*   `warm-coral`: `#F43F5E` (Alerts, "Urgent" badges)
*   `glass-white`: `rgba(255, 255, 255, 0.7)` (Backdrop blur overlays)

### 3. Typography
*   **Headings:** `Outfit` (Google Font)
    *   `h1`: Bold, Tight tracking.
    *   `h2`: Semi-bold, Clear hierarchy.
*   **Body:** `Inter` (Google Font)
    *   High legibility for educational content.

### 4. Components & Interaction Rules
*   **Buttons (Re-usable Component):**
    *   **Primary:** `bg-brand-blue` -> Hover: `bg-blue-700` -> Active: `scale-95`.
    *   **Shadows:** Soft colored shadows (`shadow-blue-500/20`) for depth.
*   **Cards:**
    *   Rounded corners (`rounded-2xl`).
    *   Hover Lift: `hover:-translate-y-1` (Subtle).
*   **Inputs:**
    *   Focus rings are mandatory (`ring-2 ring-brand-blue`).

### 5. Animations & Motion
*   **Guideline:** Motion must improve clarity, not distract.
*   **Allowed:**
    *   **Page Transitions:** Smooth Fade Up (`opacity-0 translate-y-4` -> `opacity-100 translate-y-0`).
    *   **Micro-interactions:** Button presses, Heart toggles, Accordion slides.
    *   **Loading:** Skeleton screens (Pulse effect) - *Avoid generic spinners*.
*   **Forbidden:** Heavy parallax, bouncing intro animations.

---

## 0.3 Landing Page Specifications (Home Route)

### 1. Navigation Bar (Global)
*   **Style:** Sticky, Glassmorphism (`backdrop-blur-md`).
*   **Links:** Home, Programs, About, Contact.
*   **Auth Actions:**
    *   `Login`: Ghost button -> Links to `/login` (Phase 2).
    *   `Get Started`: Primary button -> Links to `/register` (Phase 2).

### 2. Hero Section
*   **Headline:** "World Class Education, Anywhere."
*   **Sub-headline:** "The global online school that adapts to your child's needs."
*   **CTAs:**
    *   `Explore Courses`: Links to `/courses` (Phase 3).
    *   `Join Now`: Links to `/register` (Phase 2).

### 3. Key Sections
*   **Stats Strip:** "10k+ Students", "Accredited".
*   **Programs Grid:** Highlighting "Primary", "Middle", "High School".
*   **Featured Courses:** Dynamic fetch of top 3 courses (Phase 3 Integration).
*   **Pricing Plans:** Displaying "Single Course" vs "Subscription" (Phase 5 Integration).

### 4. Footer
*   **Links:** Privacy, Terms.
*   **Role Access:**
    *   `Admin Portal`: Discrete link in footer -> Links to `/login` (detects Admin role).
    *   `Teacher Login`: Links to `/login`.

## 0.4 Inter-Phase Connections
*   **Phase 2 (Auth):** Navbar & Hero buttons must route to Auth pages.
*   **Phase 3 (Catalog):** "Explore" buttons routes to Course Catalog.
*   **Phase 5 (E-commerce):** Pricing cards must trigger Checkout intent.
*   **Phase 7 (Admin):** Footer link provides backdoor access to Admin panel (via Auth).
