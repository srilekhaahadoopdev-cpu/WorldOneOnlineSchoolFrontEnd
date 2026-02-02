import { notFound } from 'next/navigation';
// import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/utils/supabase-debug';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import CourseActionButtons from '@/components/courses/CourseActionButtons';
import CurriculumList from '@/components/courses/CurriculumList';

// Define the Course interface based on our database schema
interface Course {
    id: string;
    title: string;
    slug: string;
    description: string;
    price: number;
    level: string;
    thumbnail_url: string;
    is_published: boolean;
}

interface Lesson {
    id: string;
    title: string;
    lesson_type: string;
    is_free_preview: boolean;
    order: number;
    module_id: string;
}

interface Module {
    id: string;
    title: string;
    order: number;
    lessons: Lesson[];
}

interface CourseWithContent extends Course {
    modules: Module[];
}

export const revalidate = 0; // Ensure dynamic data fetch to reflect updates immediately

const API_URL = process.env.NEXT_PUBLIC_API_URL || (
    process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}/api/v1`
        : 'http://127.0.0.1:8002/api/v1'
);

import { createClient } from '@/lib/supabase/server';

async function getCourse(slug: string): Promise<CourseWithContent | null> {
    const cleanSlug = slug.trim();

    try {
        const res = await fetch(`${API_URL}/courses/slug/${cleanSlug}`, {
            cache: 'no-store',
            next: { revalidate: 0 }
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error(`❌ Backend returned ${res.status}: ${errorText} for slug: ${cleanSlug}`);
            if (res.status === 404) return null;
            return null;
        }

        const data = await res.json();
        console.log(`✅ Successfully fetched course: ${data.title}`);
        return data;
    } catch (error) {
        console.error("❌ Network error fetching course from backend:", error);
        console.error("Make sure the backend is running at:", API_URL);
        return null;
    }
}


export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    // In Next.js 15+ (and enabled in 13+ with turbopack sometimes), params is a Promise that must be awaited.
    const { slug } = await params;

    if (!slug) {
        console.error("No slug provided in params");
        notFound();
    }

    const course = await getCourse(slug);

    if (!course) {
        notFound();
    }

    // Dynamic background style
    const bgStyle = course.thumbnail_url?.startsWith('http')
        ? { backgroundImage: `url(${course.thumbnail_url})` }
        : {};

    const isGradient = !course.thumbnail_url?.startsWith('http');
    const gradientClass = isGradient ? course.thumbnail_url : '';

    // Check authentication and enrollment
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    let isAdmin = false;
    let isEnrolled = false;

    if (user) {
        // Check Admin
        if (user.user_metadata?.role === 'admin' || user.user_metadata?.role === 'instructor') {
            isAdmin = true;
        } else {
            const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
            if (profile?.role === 'admin' || profile?.role === 'instructor') {
                isAdmin = true;
            }
        }

        // Check Enrollment
        const { data: enrollment } = await supabase.from('enrollments').select('id').eq('user_id', user.id).eq('course_id', course.id).single();
        if (enrollment) {
            isEnrolled = true;
        }
    }

    // Filter modules for display if not enrolled/admin
    const visibleModules = (isAdmin || isEnrolled)
        ? course.modules
        : course.modules.slice(0, 2).map(m => ({
            ...m,
            lessons: m.lessons.slice(0, 3)
        }));

    const showFullCurriculum = isAdmin || isEnrolled;
    // ... existing return ...
    // Update the mapping to use visibleModules and handle clicks


    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {isAdmin && (
                <div className="fixed bottom-4 right-4 z-50">
                    <Link href={`/admin/courses/${course.id}/edit`}>
                        <Button className="shadow-xl bg-deep-navy text-white hover:bg-slate-800 border-2 border-brand-gold rounded-full px-6 py-4 flex items-center gap-2">
                            <span>✏️</span> Edit Course
                        </Button>
                    </Link>
                </div>
            )}
            {/* Hero Section */}
            <div className={`relative ${isGradient ? gradientClass : 'bg-deep-navy'} text-white overflow-hidden`}>
                <div className="absolute inset-0 bg-black/50 z-10" />
                {!isGradient && (
                    <div
                        className="absolute inset-0 bg-cover bg-center z-0"
                        style={bgStyle}
                    />
                )}

                <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
                    <div className="max-w-3xl">
                        <div className="inline-block px-3 py-1 rounded-full bg-brand-gold/20 text-brand-gold font-bold text-sm mb-6 border border-brand-gold/30 backdrop-blur-sm">
                            {course.level}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6 leading-tight drop-shadow-md">
                            {course.title}
                        </h1>
                        <p className="text-xl text-slate-100 mb-8 leading-relaxed drop-shadow-sm">
                            {course.description}
                        </p>
                        <CourseActionButtons course={course} />
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-30">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* About */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                            <h2 className="font-heading text-2xl font-bold text-deep-navy mb-4">About This Course</h2>
                            <div className="prose prose-slate max-w-none text-slate-600">
                                <p>{course.description}</p>
                                <p className="mt-4">
                                    This course offers a comprehensive curriculum designed to help students master the subject matter.
                                    With a mix of video lessons, interactive quizzes, and practical exercises, you will gain a deep understanding
                                    of the core concepts.
                                </p>
                                <h3 className="text-lg font-bold text-deep-navy mt-6 mb-2">What you'll learn</h3>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 list-none pl-0">
                                    {[
                                        "Comprehensive understanding of core principles",
                                        "Practical skills application",
                                        "Problem-solving techniques",
                                        "Real-world project experience"
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Curriculum Preview */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="font-heading text-2xl font-bold text-deep-navy">Curriculum</h2>
                                <span className="text-slate-500 text-sm">
                                    {course.modules?.length || 0} Modules • {course.modules?.reduce((acc, m) => acc + m.lessons.length, 0) || 0} Lessons
                                </span>
                            </div>

                            <CurriculumList
                                modules={course.modules}
                                visibleModules={visibleModules}
                                showFullCurriculum={showFullCurriculum}
                                isAdmin={isAdmin}
                                isEnrolled={isEnrolled}
                                slug={slug}
                            />
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-24">
                            <h3 className="font-heading text-lg font-bold text-deep-navy mb-6">Course Details</h3>
                            <ul className="space-y-4 text-slate-600">
                                <li className="flex justify-between items-center pb-3 border-b border-slate-50">
                                    <span className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                        Level
                                    </span>
                                    <span className="font-medium text-deep-navy">{course.level}</span>
                                </li>
                                <li className="flex justify-between items-center pb-3 border-b border-slate-50">
                                    <span className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        Price
                                    </span>
                                    <span className="font-medium text-brand-blue">{course.price > 0 ? `$${course.price}` : 'Free'}</span>
                                </li>
                                <li className="flex justify-between items-start pb-3 border-b border-slate-50">
                                    <span className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 19.477 5.754 20 7.5 20s3.332-.477 4.5-1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 19.477 18.247 20 16.5 20c-1.746 0-3.332-.477-4.5-1.253" /></svg>
                                        Description
                                    </span>
                                    <span className="font-medium text-deep-navy text-right w-1/2 text-xs truncate" title={course.slug}>
                                        {course.title}
                                    </span>
                                </li>
                            </ul>

                            <div className="mt-8 pt-6 border-t border-slate-100">
                                <Link href="/courses">
                                    <Button variant="outline" className="w-full">
                                        Browse Other Courses
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
