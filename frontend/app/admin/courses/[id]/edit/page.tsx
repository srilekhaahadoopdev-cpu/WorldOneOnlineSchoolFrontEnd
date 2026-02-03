'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { AddLessonModal } from '@/components/admin/AddLessonModal';
import { EditLessonModal } from '@/components/admin/EditLessonModal';

interface Lesson {
    id: string;
    title: string;
    lesson_type: string;
    order: number;
    content?: string;
    video_url?: string;
    is_free_preview?: boolean;
    module_id: string;
}

interface Module {
    id: string;
    title: string;
    description?: string;
    order: number;
}

interface Course {
    id: string;
    title: string;
    description?: string;
    is_published: boolean;
    // Add other fields as needed
}


const getApiUrl = () => {
    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    if (typeof window !== 'undefined') {
        if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            if (envUrl && (envUrl.includes('localhost') || envUrl.includes('127.0.0.1'))) {
                return '/api/v1';
            }
        }
    }
    return envUrl || '/api/v1';
};
const API_URL = getApiUrl();

export default function CourseEditPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: courseId } = use(params);
    const router = useRouter();

    const [modules, setModules] = useState<Module[]>([]);
    const [lessonsByModule, setLessonsByModule] = useState<Record<string, Lesson[]>>({});
    const [newModuleTitle, setNewModuleTitle] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [activeModuleId, setActiveModuleId] = useState<string | null>(null); // For Add modal
    const [editingLesson, setEditingLesson] = useState<Lesson | null>(null); // For Edit modal
    const [course, setCourse] = useState<Course | null>(null); // Store course details

    // Fetch Modules
    useEffect(() => {
        async function fetchModulesAndLessons() {
            try {
                // 0. Fetch Course Details
                const cRes = await fetch(`${API_URL}/courses/${courseId}`);
                if (cRes.ok) {
                    const cData = await cRes.json();
                    setCourse(cData);
                }

                // 1. Fetch Modules
                const res = await fetch(`${API_URL}/courses/${courseId}/modules`);
                if (!res.ok) return;
                const modulesData = await res.json();
                setModules(modulesData || []);

                // 2. Fetch Lessons for each module (in parallel)
                const lessonsMap: Record<string, Lesson[]> = {};
                await Promise.all(modulesData.map(async (m: Module) => {
                    const lRes = await fetch(`${API_URL}/modules/${m.id}/lessons`);
                    if (lRes.ok) {
                        lessonsMap[m.id] = await lRes.json();
                    }
                }));
                setLessonsByModule(lessonsMap);

            } catch (error) {
                console.error("Failed to fetch curriculum", error);
            } finally {
                setIsFetching(false);
            }
        }
        fetchModulesAndLessons();
    }, [courseId]);

    const handleAddModule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newModuleTitle.trim()) return;
        setIsLoading(true);

        try {
            console.log("Submitting module:", { course_id: courseId, title: newModuleTitle });
            const res = await fetch(`${API_URL}/modules`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    course_id: courseId,
                    title: newModuleTitle,
                    order: modules.length + 1,
                }),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                console.error("Backend Error Details:", errData);
                throw new Error(errData.detail || 'Failed to create module');
            }

            const newModule = await res.json();
            setModules([...modules, newModule]);
            setLessonsByModule({ ...lessonsByModule, [newModule.id]: [] }); // Init empty lessons
            setNewModuleTitle('');
        } catch (error) {
            console.error(error);
            alert("Failed to add module");
        } finally {
            setIsLoading(false);
        }
    };

    const handleLessonAdded = (lesson: Lesson) => {
        const moduleId = lesson.module_id;
        setLessonsByModule(prev => ({
            ...prev,
            [moduleId]: [...(prev[moduleId] || []), lesson]
        }));
    };

    const handleLessonUpdated = (updatedLesson: Lesson) => {
        const moduleId = updatedLesson.module_id;
        setLessonsByModule(prev => ({
            ...prev,
            [moduleId]: prev[moduleId].map(l => l.id === updatedLesson.id ? updatedLesson : l)
        }));
    };


    const handlePublishToggle = async () => {
        if (!course) return;
        const newStatus = !course.is_published;
        try {
            const res = await fetch(`${API_URL}/courses/${courseId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_published: newStatus })
            });
            if (res.ok) {
                setCourse({ ...course, is_published: newStatus });
            } else {
                alert("Failed to update status");
            }
        } catch (e) {
            console.error(e);
            alert("Error updating status");
        }
    };
    // Handlers for deleting
    const handleDeleteModule = async (moduleId: string) => {
        if (!confirm("Are you sure? All lessons in this module will be deleted.")) return;
        try {
            const res = await fetch(`${API_URL}/modules/${moduleId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error("Status " + res.status);
            setModules(modules.filter(m => m.id !== moduleId));
        } catch (e) {
            console.error(e);
            alert("Failed to delete module");
        }
    }

    const handleDeleteLesson = async (lessonId: string, moduleId: string) => {
        if (!confirm("Delete this lesson?")) return;
        try {
            const res = await fetch(`${API_URL}/lessons/${lessonId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error("Status " + res.status);
            setLessonsByModule(prev => ({
                ...prev,
                [moduleId]: prev[moduleId].filter(l => l.id !== lessonId)
            }));
        } catch (e) {
            console.error(e);
            alert("Failed to delete lesson");
        }
    }


    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <Button variant="ghost" onClick={() => router.back()} className="mb-2 text-slate-500">← Back</Button>
                        <h1 className="text-3xl font-heading font-bold text-deep-navy">Edit Course Curriculum</h1>
                        <p className="text-slate-500">Add modules and lessons to structure your course.</p>
                        {course && (
                            <div className="mt-2 text-sm text-slate-400">
                                Editing: <span className="font-semibold text-slate-600">{course.title}</span>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-4 items-center">
                        {course && (
                            <div className="flex items-center gap-2 mr-4">
                                <span className={`text-sm font-bold ${course.is_published ? 'text-green-600' : 'text-amber-500'}`}>
                                    {course.is_published ? 'PUBLISHED' : 'DRAFT'}
                                </span>
                                <Button
                                    size="sm"
                                    variant={course.is_published ? 'outline' : 'primary'}
                                    onClick={handlePublishToggle}
                                >
                                    {course.is_published ? 'Unpublish' : 'Publish Course'}
                                </Button>
                            </div>
                        )}
                        <Button variant="primary" onClick={() => document.getElementById('add-module-form')?.scrollIntoView({ behavior: 'smooth' })}>
                            + Add Module
                        </Button>
                    </div>
                </div>{/* Module List */}
                <div className="space-y-6">
                    {isFetching ? (
                        <div className="text-center py-10">Loading modules...</div>
                    ) : (
                        modules.map((module) => (
                            <div key={module.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-4">
                                    <h3 className="text-lg font-bold text-deep-navy">{module.title}</h3>
                                    <div className="flex items-center gap-2">
                                        <div className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Module {module.order}</div>
                                        <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => handleDeleteModule(module.id)}>
                                            ✕
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    {lessonsByModule[module.id]?.length > 0 ? (
                                        lessonsByModule[module.id].map((lesson) => (
                                            <div key={lesson.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                                                <div className="flex items-center gap-3">
                                                    <span className={`text-xs font-bold px-2 py-1 rounded ${getLessonTypeBadge(lesson.lesson_type)}`}>
                                                        {lesson.lesson_type}
                                                    </span>
                                                    <span className="font-medium text-slate-700">{lesson.title}</span>
                                                    {lesson.is_free_preview && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Free</span>}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {lesson.lesson_type === 'video' && (
                                                        lesson.video_url ? (
                                                            <a
                                                                href={lesson.video_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                title="Watch Preview"
                                                            >
                                                                <Button size="sm" variant="ghost" className="text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100">
                                                                    📺 Watch
                                                                </Button>
                                                            </a>
                                                        ) : (
                                                            <span className="text-xs text-red-400 italic px-2">No Video</span>
                                                        )
                                                    )}
                                                    <Button size="sm" variant="outline" onClick={() => setEditingLesson(lesson)}>Edit</Button>
                                                    <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50" onClick={() => handleDeleteLesson(lesson.id, module.id)}>✕</Button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-slate-500 text-sm italic py-2">No lessons yet.</p>
                                    )}
                                </div>

                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full border-dashed"
                                    onClick={() => setActiveModuleId(module.id)}
                                >
                                    + Add Lesson
                                </Button>
                            </div>
                        ))
                    )}
                </div>

                {/* Add Module Form */}
                <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-lg font-bold text-deep-navy mb-4">Add New Module</h3>
                    <form onSubmit={handleAddModule} className="flex gap-4">
                        <input
                            type="text"
                            value={newModuleTitle}
                            onChange={(e) => setNewModuleTitle(e.target.value)}
                            placeholder="e.g. Introduction to Derivatives"
                            className="flex-1 px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-blue outline-none"
                            required
                        />
                        <Button type="submit" variant="primary" disabled={isLoading}>
                            {isLoading ? 'Adding...' : 'Add Module'}
                        </Button>
                    </form>
                </div>
            </div>

            {/* Modals */}
            {activeModuleId && (
                <AddLessonModal
                    moduleId={activeModuleId}
                    onClose={() => setActiveModuleId(null)}
                    onLessonAdded={handleLessonAdded}
                />
            )}

            {editingLesson && (
                <EditLessonModal
                    lesson={editingLesson}
                    onClose={() => setEditingLesson(null)}
                    onLessonUpdated={handleLessonUpdated}
                />
            )}
        </div>

    );
}

function getLessonTypeBadge(type: string) {
    switch (type) {
        case 'video': return 'bg-blue-100 text-blue-800';
        case 'quiz': return 'bg-purple-100 text-purple-800';
        case 'assignment': return 'bg-pink-100 text-pink-800';
        case 'pdf': return 'bg-orange-100 text-orange-800';
        default: return 'bg-slate-200 text-slate-700';
    }
}
