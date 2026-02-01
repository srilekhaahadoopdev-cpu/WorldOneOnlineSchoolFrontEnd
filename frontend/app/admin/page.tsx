import Link from 'next/link';
import { Button } from '@/components/ui/Button';

// Force dynamic rendering to fetch the latest data
export const dynamic = 'force-dynamic';

async function getCourses() {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';
        const res = await fetch(`${apiUrl}/courses`, {
            cache: 'no-store',
            next: { revalidate: 0 }
        });

        if (!res.ok) {
            console.error("Failed to fetch courses:", res.status, res.statusText);
            return [];
        }

        return res.json();
    } catch (error) {
        console.error("Error connecting to backend:", error);
        return [];
    }
}

export default async function AdminDashboard() {
    const courses = await getCourses();

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
                                    Courses
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
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-deep-navy font-heading">Course Management</h1>
                        <p className="text-slate-500 mt-1">Manage your courses, curriculum, and students.</p>
                    </div>
                    <Link href="/admin/courses/create">
                        <Button className="bg-brand-blue hover:bg-blue-600 shadow-md shadow-blue-200">
                            + Create New Course
                        </Button>
                    </Link>
                </div>

                {/* Course List */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {courses && courses.length > 0 ? (
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
                                    {courses.map((course: any) => (
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
                                                            Edit
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
