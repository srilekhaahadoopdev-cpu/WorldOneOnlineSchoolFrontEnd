'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface Course {
    id: string;
    title: string;
    level: string;
    thumbnail_url?: string;
}

export default function TeacherDashboard() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001/api/v1';

    useEffect(() => {
        async function fetchCourses() {
            try {
                const res = await fetch(`${API_URL}/courses`);
                if (res.ok) {
                    setCourses(await res.json());
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        fetchCourses();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-heading font-bold text-deep-navy">Teacher Dashboard</h1>
                        <p className="text-slate-500">Manage your classes and view student performance.</p>
                    </div>
                    <Button variant="primary">Create Assignment</Button>
                </header>

                {/* KPI Strip */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-brand-blue">
                        <div className="text-sm text-slate-500 font-bold uppercase">Total Classes</div>
                        <div className="text-3xl font-bold text-deep-navy">{courses.length}</div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-teal-500">
                        <div className="text-sm text-slate-500 font-bold uppercase">Active Students</div>
                        <div className="text-3xl font-bold text-deep-navy">--</div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-brand-gold">
                        <div className="text-sm text-slate-500 font-bold uppercase">Assignments to Grade</div>
                        <div className="text-3xl font-bold text-deep-navy">0</div>
                    </div>
                </div>

                <h2 className="text-xl font-bold text-deep-navy mb-6">My Classrooms</h2>

                {loading ? (
                    <div className="text-center py-12 text-slate-500">Loading classrooms...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map(course => (
                            <div key={course.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group">
                                <div className="h-32 bg-slate-200 relative">
                                    {course.thumbnail_url && (
                                        <div
                                            className="absolute inset-0 bg-cover bg-center"
                                            style={{ backgroundImage: `url(${course.thumbnail_url})` }}
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                    <div className="absolute bottom-4 left-4 text-white font-bold text-lg max-w-[90%] truncate">
                                        {course.title}
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <span className="bg-blue-50 text-brand-blue px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
                                            {course.level}
                                        </span>
                                        <span className="text-slate-400 text-sm">-- Students</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <Button variant="outline" className="w-full text-xs">
                                            Gradebook
                                        </Button>
                                        <Button variant="outline" className="w-full text-xs">
                                            Assignments
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
