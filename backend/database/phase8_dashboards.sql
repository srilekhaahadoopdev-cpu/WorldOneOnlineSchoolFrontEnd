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
    COUNT(DISTINCT p.lesson_id) as completed_lessons,
    (SELECT COUNT(*) FROM public.course_lessons cl 
     JOIN public.course_modules cm ON cl.module_id = cm.id 
     WHERE cm.course_id = c.id) as total_lessons
FROM public.enrollments e
JOIN public.courses c ON e.course_id = c.id
LEFT JOIN public.progress p ON e.user_id = p.user_id AND e.course_id = p.course_id AND p.is_completed = true
GROUP BY e.user_id, e.course_id, c.id;
