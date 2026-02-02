-- Phase 7: Engagement & Assessment

-- 0. Update Lesson Types
-- We need to support 'assignment' in the lesson_type check constraint
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'course_lessons_lesson_type_check') THEN 
        ALTER TABLE public.course_lessons DROP CONSTRAINT course_lessons_lesson_type_check; 
    END IF; 
END $$;

ALTER TABLE public.course_lessons 
    ADD CONSTRAINT course_lessons_lesson_type_check 
    CHECK (lesson_type IN ('video', 'text', 'quiz', 'pdf', 'assignment'));

-- 1. Quizzes Tables
CREATE TABLE public.quizzes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lesson_id UUID REFERENCES public.course_lessons(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.quiz_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT DEFAULT 'multiple_choice', -- multiple_choice, true_false
    points INTEGER DEFAULT 1,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.quiz_options (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question_id UUID REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0
);

CREATE TABLE public.quiz_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    score INTEGER DEFAULT 0,
    max_score INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Assignments Tables
CREATE TABLE public.assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lesson_id UUID REFERENCES public.course_lessons(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.assignment_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    file_url TEXT,
    comments TEXT,
    grade INTEGER,
    feedback TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Live Sessions Tables
CREATE TABLE public.live_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    meeting_url TEXT,
    instructor_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies

-- Quizzes
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public quizzes viewable by enrolled" ON public.quizzes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.enrollments e
            JOIN public.course_lessons l ON l.id = public.quizzes.lesson_id
            JOIN public.course_modules m ON m.id = l.module_id
            WHERE e.course_id = m.course_id AND e.user_id = auth.uid()
        ) OR 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'instructor'))
    );

-- Quiz Questions
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Questions viewable by enrolled" ON public.quiz_questions
    FOR SELECT USING (true); -- Simplified for now, real logic filters by quiz access

-- Quiz Options
ALTER TABLE public.quiz_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Options viewable by enrolled" ON public.quiz_options
    FOR SELECT USING (true); 

-- Quiz Attempts
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own attempts" ON public.quiz_attempts
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own attempts" ON public.quiz_attempts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Assignments
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Assignments viewable by enrolled" ON public.assignments
    FOR SELECT USING (true); -- Add strict enrollment check later if needed

-- Assignment Submissions
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own submissions" ON public.assignment_submissions
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own submissions" ON public.assignment_submissions
    FOR INSERT WITH CHECK (auth.uid() = user_id);
