-- Diagnostic queries to check enrollment issue

-- 1. Check total enrollments
SELECT COUNT(*) as total_enrollments FROM enrollments;

-- 2. Check enrollments with user and course details
SELECT 
    e.id as enrollment_id,
    e.user_id,
    p.full_name as student_name,
    p.email as student_email,
    e.course_id,
    c.title as course_title,
    e.enrolled_at
FROM enrollments e
LEFT JOIN profiles p ON e.user_id = p.id
LEFT JOIN courses c ON e.course_id = c.id
ORDER BY e.enrolled_at DESC
LIMIT 10;

-- 3. Check for orphaned enrollments (enrollments with no matching course)
SELECT 
    e.id as enrollment_id,
    e.user_id,
    e.course_id,
    e.enrolled_at,
    CASE WHEN c.id IS NULL THEN 'ORPHANED - Course does not exist' ELSE 'OK' END as status
FROM enrollments e
LEFT JOIN courses c ON e.course_id = c.id
WHERE c.id IS NULL;

-- 4. Check RLS policies on courses table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'courses';

-- 5. Check RLS policies on enrollments table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'enrollments';

-- 6. Check foreign key constraints
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name='enrollments';

-- 7. Count enrollments per user
SELECT 
    p.full_name,
    p.email,
    p.role,
    COUNT(e.id) as enrollment_count
FROM profiles p
LEFT JOIN enrollments e ON p.id = e.user_id
GROUP BY p.id, p.full_name, p.email, p.role
HAVING COUNT(e.id) > 0
ORDER BY enrollment_count DESC;
