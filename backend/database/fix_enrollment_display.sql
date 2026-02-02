-- Fix for Enrollment Display Issue
-- This SQL fixes the issue where enrolled courses show as 0 even though students have enrollments

-- ISSUE: The nested query in the frontend (enrollments with courses) returns NULL for the courses field
-- CAUSE: RLS policies on the courses table are blocking the join query

-- SOLUTION: Add RLS policies to allow reading courses for enrolled users

-- 1. First, ensure RLS is enabled on courses table
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can view published courses" ON public.courses;
DROP POLICY IF EXISTS "Public can view courses" ON public.courses;
DROP POLICY IF EXISTS "Allow public read access to courses" ON public.courses;

-- 3. Create a comprehensive read policy for courses
-- This allows anyone (authenticated or not) to read all courses
CREATE POLICY "Allow public read access to courses" ON public.courses
    FOR SELECT
    USING (true);

-- 4. Verify enrollments table has proper RLS policies
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- Drop existing enrollment policies
DROP POLICY IF EXISTS "Users can view their own enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Users can insert their own enrollments" ON public.enrollments;

-- Create enrollment policies
CREATE POLICY "Users can view their own enrollments" ON public.enrollments
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own enrollments" ON public.enrollments
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 5. Verify the foreign key constraint exists
-- If this fails, it means the foreign key is missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'enrollments_course_id_fkey'
        AND table_name = 'enrollments'
    ) THEN
        -- Add the foreign key constraint
        ALTER TABLE public.enrollments
        ADD CONSTRAINT enrollments_course_id_fkey
        FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Added missing foreign key constraint';
    ELSE
        RAISE NOTICE 'Foreign key constraint already exists';
    END IF;
END $$;

-- 6. Test query to verify the fix
-- Run this after executing the above to confirm it works:
-- SELECT 
--     e.id,
--     e.course_id,
--     e.enrolled_at,
--     c.id as course_id_from_join,
--     c.title,
--     c.description
-- FROM enrollments e
-- LEFT JOIN courses c ON e.course_id = c.id
-- LIMIT 5;

-- If the above query returns NULL for course fields, the issue persists
-- If it returns course data, the fix worked!
