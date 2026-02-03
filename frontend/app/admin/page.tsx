'use client';

import React, { useState, useEffect } from 'react'; // Client-side for charts
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

// Define types
interface Course {
    id: string;
    title: string;
    slug: string;
    level: string;
    price: number;
    is_published: boolean;
    thumbnail_url?: string;
}

interface Analytics {
    overview: {
        total_users: number;
        total_courses: number;
        total_revenue: number;
        total_enrollments: number;
    };
    top_courses: Array<{
        title: string;
        revenue: number;
        enrollment_count: number;
    }>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8002/api/v1';

export default function AdminDashboard() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [coursesRes, analyticsRes] = await Promise.all([
                    fetch(`${API_URL}/courses`),
                    fetch(`${API_URL}/analytics/admin`)
                ]);

                if (coursesRes.ok) setCourses(await coursesRes.json() as Course[]);
                if (analyticsRes.ok) setAnalytics(await analyticsRes.json() as Analytics);
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const COLORS = ['#0EA5E9', '#F59E0B', '#10B981', '#6366F1', '#EC4899'];

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Top Navigation Bar */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-4">
                            <Link href="/" className="font-heading font-bold text-xl text-deep-navy">
                                WorldOne <span className="text-brand-gold">Admin</span>
                            </Link>
                            <nav className="hidden md:flex space-x-4 ml-8">
                                <Link href="/admin" className="text-brand-blue font-medium px-3 py-2 rounded-md bg-blue-50">
                                    Dashboard
                                </Link>
                                <span className="text-slate-400 px-3 py-2 cursor-not-allowed">Users</span>
                                <span className="text-slate-400 px-3 py-2 cursor-not-allowed">Settings</span>
                            </nav>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link href="/">
                                <Button variant="ghost" size="sm">Exit Admin</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-deep-navy font-heading">Dashboard Overview</h1>
                        <p className="text-slate-500 mt-1">Platform performance and course management.</p>
                    </div>
                    <Link href="/admin/courses/create">
                        <Button className="bg-brand-blue hover:bg-blue-600 shadow-md shadow-blue-200">
                            + Create New Course
                        </Button>
                    </Link>
                </div>

                {/* KPI Cards */}
                {analytics && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <div className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-2">Total Revenue</div>
                            <div className="text-3xl font-bold text-teal-600">${analytics.overview.total_revenue.toLocaleString()}</div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <div className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-2">Total Enrollments</div>
                            <div className="text-3xl font-bold text-brand-blue">{analytics.overview.total_enrollments}</div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <div className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-2">Active Students</div>
                            <div className="text-3xl font-bold text-indigo-600">{analytics.overview.total_users}</div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <div className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-2">Total Courses</div>
                            <div className="text-3xl font-bold text-brand-gold">{analytics.overview.total_courses}</div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    {/* Chart */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-deep-navy mb-6">Top Revenue Courses</h3>
                        <div className="h-[300px] w-full">
                            {analytics && analytics.top_courses && analytics.top_courses.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={analytics.top_courses} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="title" type="category" width={150} tick={{ fontSize: 12 }} />
                                        <Tooltip formatter={(value?: number) => [`$${value || 0}`, 'Revenue']} />
                                        <Bar dataKey="revenue" radius={[0, 4, 4, 0]} barSize={32}>
                                            {analytics.top_courses.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-400">
                                    No data available to display chart.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Stats or Actions */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-deep-navy mb-4">Latest Enrollments</h3>
                        <div className="text-sm text-slate-500 italic mb-4">Real-time enrollment feed not yet connected.</div>
                        <div className="space-y-4">
                            {/* Placeholder items */}
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                    <div className="w-8 h-8 rounded-full bg-slate-200" />
                                    <div>
                                        <div className="text-sm font-bold text-deep-navy">Student #{i}</div>
                                        <div className="text-xs text-slate-500">Enrolled in Math 101</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <h2 className="text-xl font-bold text-deep-navy mb-6">Course Management</h2>

                {/* Course List */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center text-slate-500">Loading courses...</div>
                    ) : courses && courses.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold text-deep-navy">Title</th>
                                        <th className="px-6 py-4 font-semibold text-deep-navy">Level</th>
                                        <th className="px-6 py-4 font-semibold text-deep-navy">Price</th>
                                        <th className="px-6 py-4 font-semibold text-deep-navy">Status</th>
                                        <th className="px-6 py-4 font-semibold text-deep-navy text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {courses.map((course) => (
                                        <tr key={course.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-deep-navy">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded bg-slate-200 flex-shrink-0 bg-cover bg-center`}
                                                        style={{ backgroundImage: course.thumbnail_url?.startsWith('http') ? `url(${course.thumbnail_url})` : undefined }}
                                                    >
                                                        {!course.thumbnail_url?.startsWith('http') && <div className={`w-full h-full rounded ${course.thumbnail_url}`} />}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold">{course.title}</div>
                                                        <div className="text-xs text-slate-400 font-mono">/{course.slug}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">{course.level}</td>
                                            <td className="px-6 py-4 text-brand-blue font-bold">
                                                {course.price > 0 ? `$${course.price}` : 'Free'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${course.is_published
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {course.is_published ? 'Published' : 'Draft'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={`/admin/courses/${course.id}/edit`}>
                                                        <Button variant="ghost" size="sm" className="text-slate-500 hover:text-brand-blue">
                                                            Manage Content
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-20 px-4">
                            <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                <span className="text-2xl">📚</span>
                            </div>
                            <h3 className="text-lg font-medium text-deep-navy">No courses yet</h3>
                            <p className="text-slate-500 mt-2 mb-6 max-w-sm mx-auto">
                                Get started by creating your first course. It will appear here once created.
                            </p>
                            <Link href="/admin/courses/create">
                                <Button variant="outline">Create Course</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

