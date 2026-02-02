'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { User } from '@supabase/supabase-js';

interface Course {
    id: string;
    title: string;
    description: string;
    slug: string;
    level: string;
    thumbnail_url: string;
    price: number;
}

interface Enrollment {
    id: string;
    course_id: string;
    created_at: string;
    courses: Course | null; // Allow null if join fails
}

interface Progress {
    course_id: string;
    completed_lessons: number;
    total_lessons: number;
}


interface Profile {
    id: string;
    full_name: string | null;
    role: string | null;
    email?: string;
}

export default function DashboardPage() {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [progress, setProgress] = useState<Record<string, Progress>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            const supabase = createClient();

            // Get User
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (user) {
                // Get Profile
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                setProfile(profile as Profile);

                // Get Enrollments with course details
                console.log('Fetching enrollments for user:', user.id);
                const { data: enrollmentsData, error: enrollError } = await supabase
                    .from('enrollments')
                    .select(`
                        id,
                        course_id,
                        created_at,
                        courses (
                            id,
                            title,
                            description,
                            slug,
                            level,
                            thumbnail_url,
                            price
                        )
                    `)
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (enrollError) {
                    console.error('❌ Supabase Enrollment Error:', JSON.stringify(enrollError, null, 2));
                    // Also try to alert strictly for debugging if needed
                    // alert(`Error: ${enrollError.message}`);
                }

                if (enrollmentsData) {
                    // Cast the data to Enrollment[] as we know the shape matches
                    setEnrollments(enrollmentsData as unknown as Enrollment[]);

                    // Fetch progress for each course
                    const progressMap: Record<string, Progress> = {};

                    for (const enrollment of enrollmentsData) {
                        const courseId = enrollment.course_id;

                        // Get total lessons for this course
                        const { data: modules } = await supabase
                            .from('course_modules')
                            .select('id')
                            .eq('course_id', courseId);

                        if (modules && modules.length > 0) {
                            const moduleIds = modules.map(m => m.id);

                            const { count: totalLessons } = await supabase
                                .from('course_lessons')
                                .select('id', { count: 'exact', head: true })
                                .in('module_id', moduleIds);

                            // Get completed lessons
                            const { count: completedLessons } = await supabase
                                .from('progress')
                                .select('id', { count: 'exact', head: true })
                                .eq('user_id', user.id)
                                .eq('course_id', courseId)
                                .eq('is_completed', true);

                            progressMap[courseId] = {
                                course_id: courseId,
                                completed_lessons: completedLessons || 0,
                                total_lessons: totalLessons || 0
                            };
                        }
                    }

                    setProgress(progressMap);
                }
            }
            setLoading(false);
        };

        fetchUserData();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
            </div>
        );
    }

    const calculateProgress = (courseId: string) => {
        const prog = progress[courseId];
        if (!prog || prog.total_lessons === 0) return 0;
        return Math.round((prog.completed_lessons / prog.total_lessons) * 100);
    };

    const getDashboardHeader = () => {
        const role = profile?.role?.toLowerCase();
        if (role === 'admin') {
            return { title: 'Admin Dashboard', subtitle: 'Manage the learning platform and users.' };
        } else if (role === 'teacher' || role === 'instructor') {
            return { title: 'Teacher Dashboard', subtitle: 'Manage your classes and student performance.' };
        }
        return { title: 'Student Dashboard', subtitle: 'Track your progress and continue learning.' };
    };

    const header = getDashboardHeader();

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-heading font-bold text-deep-navy">{header.title}</h1>
                    <p className="text-slate-600 mt-2">{header.subtitle}</p>
                </header>

                {/* Welcome Card */}
                <div className="bg-white shadow-sm rounded-2xl p-6 border border-slate-100 mb-8">
                    <h2 className="text-xl font-semibold text-deep-navy mb-4">
                        Welcome back, {profile?.full_name || user?.email}!
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-slate-600">
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="font-bold block text-slate-400 text-xs uppercase mb-1">Email</span>
                            <span className="text-deep-navy truncate" title={user?.email}>{user?.email}</span>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="font-bold block text-slate-400 text-xs uppercase mb-1">Role</span>
                            <span className="text-deep-navy capitalize">{profile?.role || 'Student'}</span>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="font-bold block text-slate-400 text-xs uppercase mb-1">Enrolled Courses</span>
                            <span className="text-2xl font-bold text-brand-blue">{enrollments.length}</span>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="font-bold block text-slate-400 text-xs uppercase mb-1">Status</span>
                            {profile ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                    Active
                                </span>
                            ) : (
                                <span className="text-red-500">Profile Missing</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Enrolled Courses */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-heading font-bold text-deep-navy">My Courses</h2>
                        <Link href="/courses">
                            <Button variant="outline">Browse Catalog</Button>
                        </Link>
                    </div>

                    {enrollments.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {enrollments.map((enrollment) => {
                                const course = enrollment.courses;

                                // Handle case where course JOIN fails matches nothing
                                if (!course) {
                                    return (
                                        <div key={enrollment.id} className="bg-red-50 rounded-2xl p-6 border border-red-100">
                                            <div className="text-red-500 font-bold mb-2">Course Unavailable</div>
                                            <p className="text-xs text-red-400">
                                                Enrollment ID: {enrollment.id}<br />
                                                Course ID: {enrollment.course_id}
                                            </p>
                                        </div>
                                    );
                                }

                                const progressPercent = calculateProgress(enrollment.course_id);
                                const prog = progress[enrollment.course_id];

                                return (
                                    <div key={enrollment.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-300 group">
                                        {/* Thumbnail */}
                                        <div className="h-40 w-full relative overflow-hidden bg-slate-100">
                                            {course.thumbnail_url ? (
                                                <div
                                                    className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                                                    style={{ backgroundImage: `url(${course.thumbnail_url})` }}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300">
                                                    <span className="text-4xl">🎓</span>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                                            <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end">
                                                <span className="inline-block px-2 py-1 bg-white/90 backdrop-blur-sm rounded text-[10px] font-bold text-deep-navy uppercase tracking-wider">
                                                    {course.level}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-5">
                                            <h3 className="font-heading text-lg font-bold text-deep-navy mb-2 line-clamp-1" title={course.title}>
                                                {course.title}
                                            </h3>
                                            <p className="text-sm text-slate-600 mb-4 line-clamp-2 h-10">
                                                {course.description}
                                            </p>

                                            {/* Progress Bar */}
                                            <div className="mb-4">
                                                <div className="flex justify-between text-xs text-slate-500 mb-1">
                                                    <span>Progress</span>
                                                    <span className="font-bold text-brand-blue">{progressPercent}%</span>
                                                </div>
                                                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                    <div
                                                        className="bg-brand-blue h-full transition-all duration-300 rounded-full"
                                                        style={{ width: `${progressPercent}%` }}
                                                    />
                                                </div>
                                                <div className="text-[10px] text-slate-400 mt-1 text-right">
                                                    {prog ? `${prog.completed_lessons}/${prog.total_lessons} lessons` : '0/0 lessons'}
                                                </div>
                                            </div>

                                            {/* Action Button */}
                                            <Link href={`/courses/${course.slug}/learn`}>
                                                <Button className="w-full bg-brand-blue hover:bg-blue-600 text-white shadow-sm shadow-blue-200">
                                                    {progressPercent > 0 ? 'Continue Learning' : 'Start Course'}
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="border-2 border-dashed border-slate-200 rounded-2xl h-64 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
                            <span className="text-4xl mb-3 opacity-50">📚</span>
                            <span className="text-lg font-medium mb-2 text-slate-600">No courses yet</span>
                            <p className="text-sm mb-6 max-w-xs text-center text-slate-500">
                                Explore our catalog and enroll in your first course to start learning.
                            </p>
                            <Link href="/courses">
                                <Button className="bg-brand-blue text-white shadow-md shadow-blue-200">Browse Catalog</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
