'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';

// Mock Data structure for development if DB is empty
interface Child {
    id: string;
    full_name: string;
    avatar_url?: string;
}

interface StudentAnalytics {
    courses: Array<{
        course_title: string;
        completed_lessons: number;
        total_lessons: number;
    }>;
    summary: {
        avg_progress: number;
        total_courses: number;
    };
}

export default function ParentDashboard() {
    const [children, setChildren] = useState<Child[]>([]);
    const [selectedChild, setSelectedChild] = useState<Child | null>(null);
    const [analytics, setAnalytics] = useState<StudentAnalytics | null>(null);
    const [loading, setLoading] = useState(true);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001/api/v1';

    useEffect(() => {
        // In a real app, fetch linked children from `parent_student_links`
        // For prototype, we will fetch the current logged in user as if they are the student (or mock it)
        // OR, let's just mock a "Child" for the demo since connecting 2 accounts is complex UI.

        const mockChild = {
            id: 'mock-student-id', // We need a real ID to fetch analytics. Let's try to get the current user's ID for testing.
            full_name: 'Alex Student',
            avatar_url: ''
        };

        async function init() {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                // For demo purposes, treat the logged in user as the "Child" if no links exist
                // Ideally, we query /api/v1/parents/children
                mockChild.id = user.id;
                mockChild.full_name = user.email?.split('@')[0] || 'Student';
                setChildren([mockChild]);
                setSelectedChild(mockChild);
            }
            setLoading(false);
        }
        init();
    }, []);

    useEffect(() => {
        if (!selectedChild) return;

        async function fetchStats() {
            try {
                const res = await fetch(`${API_URL}/analytics/student/${selectedChild?.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setAnalytics(data);
                }
            } catch (e) {
                console.error(e);
            }
        }
        fetchStats();
    }, [selectedChild]);

    const handleDownloadReport = () => {
        if (!selectedChild) return;
        window.open(`${API_URL}/reports/pdf/${selectedChild.id}`, '_blank');
    };

    if (loading) return <div className="p-12 text-center text-slate-500">Loading Parent Portal...</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-heading font-bold text-deep-navy">Parent Portal</h1>
                        <p className="text-slate-500">Track your child's academic progress.</p>
                    </div>
                    <Button variant="outline">+ Add Child</Button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar: Children List */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-1 h-fit">
                        <h3 className="font-bold text-slate-700 mb-4">Your Children</h3>
                        <div className="space-y-3">
                            {children.map(child => (
                                <div
                                    key={child.id}
                                    onClick={() => setSelectedChild(child)}
                                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${selectedChild?.id === child.id ? 'bg-blue-50 border border-brand-blue' : 'hover:bg-slate-50 border border-transparent'}`}
                                >
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                        {child.full_name[0].toUpperCase()}
                                    </div>
                                    <div className="font-medium text-deep-navy">{child.full_name}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Main Content: Stats */}
                    <div className="lg:col-span-3 space-y-6">
                        {selectedChild && analytics ? (
                            <>
                                {/* Overview Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                        <div className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-2">Overall Progress</div>
                                        <div className="text-4xl font-bold text-brand-blue">{analytics.summary.avg_progress}%</div>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                        <div className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-2">Active Courses</div>
                                        <div className="text-4xl font-bold text-deep-navy">{analytics.summary.total_courses}</div>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
                                        <Button onClick={handleDownloadReport} className="w-full bg-brand-gold text-deep-navy hover:bg-yellow-500 font-bold">
                                            📄 Download Report Card
                                        </Button>
                                    </div>
                                </div>

                                {/* Deep Dive */}
                                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                                    <h3 className="font-bold text-xl text-deep-navy mb-6">Course Performance</h3>

                                    <div className="space-y-6">
                                        {analytics.courses.length > 0 ? analytics.courses.map((course, idx: number) => {
                                            const progress = course.total_lessons > 0 ? Math.round((course.completed_lessons / course.total_lessons) * 100) : 0;
                                            return (
                                                <div key={idx} className="border-b border-slate-50 last:border-0 pb-6 last:pb-0">
                                                    <div className="flex justify-between mb-2">
                                                        <span className="font-bold text-lg text-deep-navy">{course.course_title}</span>
                                                        <span className="font-mono text-brand-blue">{progress}%</span>
                                                    </div>
                                                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${progress}%` }}
                                                            className="h-full bg-brand-blue"
                                                        />
                                                    </div>
                                                    <div className="mt-2 text-sm text-slate-400">
                                                        {course.completed_lessons} of {course.total_lessons} lessons completed
                                                    </div>
                                                </div>
                                            );
                                        }) : (
                                            <div className="text-slate-500 italic">No courses enrolled yet.</div>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 text-center">
                                <p className="text-slate-500">Select a child to view their report.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
