# 🚨 CRITICAL FIX REQUIRED (Attempt 2) 🚨

**Please run this updated script to Force-Fix Permissions**

```sql
DO $$ 
BEGIN
  -- 1. FORCE RLS Refresh on Enrollments
  ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
  
  -- 2. FORCE RLS Refresh on Courses
  ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
  
  -- 3. Grant Explicit Select Permissions
  GRANT SELECT ON public.enrollments TO authenticated, anon;
  GRANT SELECT ON public.courses TO authenticated, anon;
  
  -- 4. Re-create Policies (Robust)
  
  -- Enrollments: View Own
  DROP POLICY IF EXISTS "Users can view own enrollments" ON public.enrollments;
  CREATE POLICY "Users can view own enrollments" ON public.enrollments
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

  -- Courses: Public View
  DROP POLICY IF EXISTS "Courses are viewable by everyone" ON public.courses;
  CREATE POLICY "Courses are viewable by everyone" ON public.courses
  FOR SELECT TO authenticated, anon USING (true);

  -- 5. Fix Foreign Key (Just in case)
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'enrollments_course_id_fkey') THEN
    ALTER TABLE public.enrollments 
    ADD CONSTRAINT enrollments_course_id_fkey 
    FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;
  END IF;
  
END $$;

-- 6. Reload Supabase Schema Cache (Crucial)
NOTIFY pgrst, 'reload config';
```

---

# SQL Queries to Execute in Supabase


## Phase 8: Dashboards & Reporting

Please execute the following SQL in your Supabase SQL Editor:

```sql
-- Phase 8: Dashboards & Reporting

-- 1. Parent-Student Relationship
CREATE TABLE IF NOT EXISTS public.parent_student_links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending', -- pending, active
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(parent_id, student_id)
);

-- RLS
ALTER TABLE public.parent_student_links ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Parents can view linked students" ON public.parent_student_links;
DROP POLICY IF EXISTS "Parents can create links" ON public.parent_student_links;

-- Create policies
CREATE POLICY "Parents can view linked students" ON public.parent_student_links
    FOR SELECT USING (auth.uid() = parent_id);

CREATE POLICY "Parents can create links" ON public.parent_student_links
    FOR INSERT WITH CHECK (auth.uid() = parent_id);
    
-- 2. SQL Views for Analytics

-- View: Admin Overview Stats
-- Simplifies fetching total users, revenue (mock), and courses
CREATE OR REPLACE VIEW public.view_admin_stats AS
SELECT 
    (SELECT COUNT(*) FROM auth.users) as total_users,
    (SELECT COUNT(*) FROM public.courses) as total_courses,
    (SELECT COUNT(*) FROM public.enrollments) as total_enrollments,
    (SELECT COALESCE(SUM(c.price), 0) FROM public.enrollments e JOIN public.courses c ON e.course_id = c.id) as total_revenue;

-- View: Instructor Performance
-- Shows per-course enrollment numbers
CREATE OR REPLACE VIEW public.view_course_performance AS
SELECT 
    c.id as course_id,
    c.title,
    COUNT(e.id) as enrollment_count,
    COALESCE(SUM(c.price), 0) as revenue
FROM public.courses c
LEFT JOIN public.enrollments e ON c.id = e.course_id
GROUP BY c.id, c.title;

-- View: Student Progress Summary
-- Aggregates % completion for students (simplified)
CREATE OR REPLACE VIEW public.view_student_progress AS
SELECT 
    e.user_id,
    e.course_id,
    c.title as course_title,
    COUNT(DISTINCT p.lesson_id) FILTER (WHERE p.is_completed = true) as completed_lessons,
    (SELECT COUNT(*) FROM public.course_lessons cl 
     JOIN public.course_modules cm ON cl.module_id = cm.id 
     WHERE cm.course_id = c.id) as total_lessons
FROM public.enrollments e
JOIN public.courses c ON e.course_id = c.id
LEFT JOIN public.progress p ON e.user_id = p.user_id AND e.course_id = p.course_id
GROUP BY e.user_id, e.course_id, c.id;
```

## Phase 9: Database Optimization

Execute these indexes for better performance:

```sql
-- Phase 9: Database Indexing for Performance

-- Index on enrollments for faster user lookups
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON public.enrollments(user_id);

-- Index on enrollments for faster course lookups
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON public.enrollments(course_id);

-- Index on progress for faster user lookups
CREATE INDEX IF NOT EXISTS idx_progress_user_id ON public.progress(user_id);

-- Index on progress for faster lesson lookups
CREATE INDEX IF NOT EXISTS idx_progress_lesson_id ON public.progress(lesson_id);

-- Index on courses for category filtering (if you add categories later)
CREATE INDEX IF NOT EXISTS idx_courses_level ON public.courses(level);

-- Index on course_modules for faster course lookups
CREATE INDEX IF NOT EXISTS idx_course_modules_course_id ON public.course_modules(course_id);

-- Index on course_lessons for faster module lookups
CREATE INDEX IF NOT EXISTS idx_course_lessons_module_id ON public.course_lessons(module_id);

-- Composite index for progress queries
CREATE INDEX IF NOT EXISTS idx_progress_user_course ON public.progress(user_id, course_id);
```

After executing these queries, the database will be ready for Phase 8 and Phase 9 features.
