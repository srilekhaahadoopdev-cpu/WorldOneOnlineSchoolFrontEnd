'use client';

import { useState, useEffect, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import QuizRunner from '@/components/courses/QuizRunner';
import AssignmentUpload from '@/components/courses/AssignmentUpload';

export default function CoursePlayerPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const searchParams = useSearchParams();
    const router = useRouter();
    const [course, setCourse] = useState<any>(null);
    const [activeLesson, setActiveLesson] = useState<any>(null);
    const [progress, setProgress] = useState<Record<string, boolean>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const supabase = createClient();

    useEffect(() => {
        async function fetchCourseData() {
            try {
                // 1. Fetch Course by Slug
                const cleanSlug = decodeURIComponent(slug).toLowerCase().trim();
                let { data: courseData, error: courseError } = await supabase
                    .from('courses')
                    .select('*')
                    .eq('slug', cleanSlug)
                    .single();

                // Fallback search
                if (!courseData) {
                    const { data: courseByTitle } = await supabase
                        .from('courses')
                        .select('*')
                        .ilike('title', cleanSlug.replace(/-/g, ' '))
                        .single();
                    if (courseByTitle) {
                        courseData = courseByTitle;
                        courseError = null;
                    }
                }

                if (courseError || !courseData) throw new Error("Course not found");

                // 2. Fetch Modules
                const { data: modules, error: modulesError } = await supabase
                    .from('course_modules')
                    .select('*')
                    .eq('course_id', courseData.id)
                    .order('order', { ascending: true })
                    .order('created_at', { ascending: true });

                if (modulesError) throw modulesError;

                // 3. Fetch Lessons separately (Robust Manual Join)
                const moduleIds = (modules || []).map((m: any) => m.id);
                let lessons: any[] = [];

                if (moduleIds.length > 0) {
                    const { data: l, error: lessonsError } = await supabase
                        .from('course_lessons')
                        .select('*')
                        .in('module_id', moduleIds)
                        .order('order', { ascending: true })
                        .order('created_at', { ascending: true });

                    if (lessonsError) throw lessonsError;
                    lessons = l || [];
                }

                // Merge lessons into modules
                const modulesWithSortedLessons = (modules || []).map((m: any) => ({
                    ...m,
                    lessons: lessons
                        .filter((l: any) => l.module_id === m.id)
                        .sort((a: any, b: any) => a.order - b.order || new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                }));

                const fullCourse = { ...courseData, modules: modulesWithSortedLessons };
                setCourse(fullCourse);


                // 3. Determine Active Lesson
                // Check URL param 'lessonId' first, otherwise defaulting to first lesson
                const lessonIdParam = searchParams.get('lesson');
                let foundLesson = null;

                if (lessonIdParam) {
                    for (const m of fullCourse.modules) {
                        const l = m.lessons.find((l: any) => l.id === lessonIdParam);
                        if (l) { foundLesson = l; break; }
                    }
                }

                if (!foundLesson && fullCourse.modules.length > 0) {
                    // Try to find first lesson in any module
                    for (const m of fullCourse.modules) {
                        if (m.lessons && m.lessons.length > 0) {
                            foundLesson = m.lessons[0];
                            break;
                        }
                    }
                }

                console.log("Setting active lesson:", foundLesson);
                setActiveLesson(foundLesson);

            } catch (error) {
                console.error("Error loading course:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchCourseData();
    }, [slug, searchParams]);

    // Check Enrollment & Protect Content
    useEffect(() => {
        if (!course || !activeLesson) return;

        const protectContent = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            // If actively viewing a specific lesson
            if (activeLesson) {
                // 1. If it's a free preview, allow access
                if (activeLesson.is_free_preview) {
                    return;
                }

                // 2. If no user, redirect to login
                if (!user) {
                    router.push(`/auth/login?next=/courses/${slug}/learn?lesson=${activeLesson.id}`);
                    return;
                }

                // 3. Check Enrollment for paid content
                const { data: enrollment } = await supabase
                    .from('enrollments')
                    .select('id')
                    .eq('user_id', user.id)
                    .eq('course_id', course.id)
                    .single();

                // If not enrolled and it's not a free preview -> ACCESS DENIED
                if (!enrollment) {
                    console.warn("Access denied: Not enrolled");
                    // Redirect to sales page
                    router.push(`/courses/${course.slug}`);
                }
            }
        }

        protectContent();
    }, [course, activeLesson, router, supabase, slug]);

    // Fetch Progress
    useEffect(() => {
        if (!course || !course.id) return;

        const fetchProgress = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api/v1'}/courses/${course.id}/progress/${user.id}`);
                if (res.ok) {
                    const data = await res.json();
                    const newProgress: Record<string, boolean> = {};
                    data.forEach((p: any) => {
                        if (p.is_completed) newProgress[p.lesson_id] = true;
                    });
                    setProgress(newProgress);
                }
            } catch (e) {
                console.error("Error fetching progress", e);
            }
        };
        fetchProgress();
    }, [course?.id, supabase]);

    const handleToggleComplete = async () => {
        if (!activeLesson || !course) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const isComplete = !progress[activeLesson.id];

        // Optimistic update
        setProgress(prev => ({ ...prev, [activeLesson.id]: isComplete }));

        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api/v1'}/progress/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    lesson_id: activeLesson.id,
                    course_id: course.id,
                    is_completed: isComplete,
                    last_position_seconds: 0 // meaningful for video position later
                })
            });

            // Auto-advance if completing
            if (isComplete) {
                findNextLesson(activeLesson.id);
            }

        } catch (e) {
            console.error("Error updating progress", e);
            // Revert
            setProgress(prev => ({ ...prev, [activeLesson.id]: !isComplete }));
        }
    };

    const findNextLesson = (currentId: string) => {
        let found = false;
        for (const mod of course.modules) {
            for (const lesson of mod.lessons) {
                if (found) {
                    router.push(`/courses/${slug}/learn?lesson=${lesson.id}`);
                    return;
                }
                if (lesson.id === currentId) found = true;
            }
        }
    };

    if (isLoading) return <div className="flex h-screen items-center justify-center">Loading Classroom...</div>;
    if (!course) return <div className="flex h-screen items-center justify-center">Course not found</div>;

    return (
        <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
            {/* DEBUG PANEL - Remove later */}
            <div className="fixed bottom-0 right-0 p-4 bg-black/80 text-white text-xs z-[100] max-h-40 overflow-auto">
                <p>Slug: {slug}</p>
                <p>Modules: {course?.modules?.length || 0}</p>
                <p>Active Lesson: {activeLesson?.title || 'None'}</p>
                <p>Active ID: {activeLesson?.id}</p>
            </div>

            {/* Sidebar (Curriculum) */}
            <div className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0 h-full overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50">
                    <h2 className="font-bold text-deep-navy text-sm md:text-base line-clamp-1" title={course.title}>
                        {course.title}
                    </h2>
                    <Link href={`/courses/${slug}`}>
                        <span className="text-xs text-brand-blue hover:underline mt-1 block">← Back to Course Home</span>
                    </Link>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-4">
                    {course.modules.map((module: any) => (
                        <div key={module.id} className="mb-4">
                            <h3 className="px-2 font-bold text-slate-700 text-xs uppercase tracking-wider mb-2">
                                {module.title}
                            </h3>
                            <div className="space-y-1">
                                {module.lessons.map((lesson: any) => (
                                    <Link
                                        key={lesson.id}
                                        href={`/courses/${slug}/learn?lesson=${lesson.id}`}
                                        className={`block px-3 py-2 rounded-md text-sm cursor-pointer transition-colors border select-none no-underline ${activeLesson?.id === lesson.id
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105'
                                            : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className={`flex-shrink-0 w-4 h-4 rounded-full border flex items-center justify-center ${progress[lesson.id]
                                                ? (activeLesson?.id === lesson.id ? 'bg-white border-white' : 'bg-green-500 border-green-500')
                                                : 'border-current'}`}>
                                                {progress[lesson.id] && <div className={`w-2 h-2 rounded-full ${activeLesson?.id === lesson.id ? 'bg-blue-600' : 'bg-white'}`} />}
                                            </div>
                                            <span className="truncate flex-1">{lesson.title}</span>
                                            <span className="opacity-70 text-xs">{
                                                lesson.lesson_type === 'video' ? '🎥' : lesson.lesson_type === 'pdf' ? '📄' : '📝'
                                            }</span>
                                        </div>
                                    </Link>
                                ))}
                                {module.lessons.length === 0 && (
                                    <div className="text-xs text-slate-400 px-3 italic">No lessons</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-white">
                <header className="h-14 border-b border-slate-100 flex items-center px-6 justify-between bg-white shadow-sm z-10">
                    <h1 className="text-lg font-bold text-slate-800 truncate">
                        {activeLesson?.title || "Select a lesson"}
                    </h1>
                    {activeLesson && (
                        <Button
                            onClick={handleToggleComplete}
                            variant={progress[activeLesson.id] ? "outline" : "primary"}
                            size="sm"
                            className={progress[activeLesson.id] ? "text-green-600 border-green-600 hover:bg-green-50" : ""}
                        >
                            {progress[activeLesson.id] ? "✓ Completed" : "Mark as Complete"}
                        </Button>
                    )}
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50">
                    <div className="max-w-4xl mx-auto bg-white p-1 shadow-sm rounded-2xl min-h-[500px]">
                        {activeLesson ? (
                            <div className="p-4 md:p-8 space-y-6">
                                {/* Type: VIDEO */}
                                {activeLesson.lesson_type === 'video' && (
                                    activeLesson.video_url || activeLesson.resource_url ? (
                                        <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-lg relative">
                                            <video
                                                src={activeLesson.video_url || activeLesson.resource_url}
                                                controls
                                                className="w-full h-full"
                                                autoPlay={false}
                                                controlsList="nodownload"
                                                onEnded={() => {
                                                    // Optional: auto-complete on video end
                                                    // handleToggleComplete();
                                                }}
                                            >
                                                <source src={activeLesson.video_url} type="video/mp4" />
                                                Your browser does not support the video tag.
                                            </video>
                                        </div>
                                    ) : (
                                        <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                                            Video not available
                                        </div>
                                    )
                                )}

                                {/* Type: PDF */}
                                {activeLesson.lesson_type === 'pdf' && (
                                    <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                                        <div className="text-4xl mb-4">📄</div>
                                        <h2 className="text-xl font-bold text-slate-700 mb-2">{activeLesson.title}</h2>

                                        {activeLesson.video_url || activeLesson.resource_url ? (
                                            <div className="mt-6 flex flex-col items-center gap-4">
                                                <a
                                                    href={activeLesson.video_url || activeLesson.resource_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
                                                >
                                                    View / Download PDF
                                                </a>
                                                <p className="text-xs text-slate-500">Opens in new tab</p>
                                            </div>
                                        ) : (
                                            <p className="text-red-500">No PDF uploaded for this lesson.</p>
                                        )}
                                    </div>
                                )}

                                {/* Type: QUIZ */}
                                {activeLesson.lesson_type === 'quiz' && (
                                    <QuizRunner
                                        lessonId={activeLesson.id}
                                        onComplete={(score, max) => {
                                            // Optional: Mark as complete automatically if passed
                                            if (score / max >= 0.7) handleToggleComplete();
                                        }}
                                    />
                                )}

                                {/* Type: ASSIGNMENT */}
                                {activeLesson.lesson_type === 'assignment' && (
                                    <AssignmentUpload lessonId={activeLesson.id} />
                                )}

                                {/* Type: TEXT/OTHER */}
                                {['video', 'pdf', 'quiz', 'assignment'].indexOf(activeLesson.lesson_type) === -1 && (
                                    <div className="prose max-w-none">
                                        {activeLesson.content || <p className="text-slate-500 italic">No content available.</p>}
                                    </div>
                                )}

                                <div className="pt-8 border-t border-slate-100 flex justify-end">
                                    <Button
                                        onClick={handleToggleComplete}
                                        size="lg"
                                        className={progress[activeLesson.id] ? "bg-green-600 hover:bg-green-700" : "bg-brand-blue"}
                                    >
                                        {progress[activeLesson.id] ? "Completed" : "Complete & Continue →"}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 p-10">
                                <div className="text-4xl mb-4">👈</div>
                                <p>Please select a lesson from the sidebar.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
