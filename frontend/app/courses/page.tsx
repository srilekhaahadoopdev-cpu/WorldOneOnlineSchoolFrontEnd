import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export const revalidate = 0; // Ensure dynamic data fetch

async function getCourses(searchQuery: string | undefined) {
    const supabase = await createClient();
    let query = supabase
        .from('courses')
        .select('*')
        .eq('is_published', true);

    if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
}

export default async function CatalogPage({
    searchParams,
}: {
    searchParams: { q?: string };
}) {
    const courses = await getCourses(searchParams.q);

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-8">
                    <div>
                        <h1 className="font-heading text-3xl font-bold text-deep-navy">Course Catalog</h1>
                        <p className="text-slate-600 mt-2">Explore our world-class curriculum designed for every stage.</p>
                    </div>

                    {/* Search Bar - Simple Implementation */}
                    <form className="mt-4 md:mt-0 w-full md:w-auto">
                        <input
                            name="q"
                            defaultValue={searchParams.q}
                            type="text"
                            placeholder="Search courses..."
                            className="w-full md:w-80 px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none"
                        />
                    </form>
                </div>

                {/* Course Grid */}
                {courses && courses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {courses.map((course) => (
                            <div key={course.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-100 flex flex-col h-full">
                                {/* Thumbnail */}
                                <div className={`h-48 w-full ${course.thumbnail_url.startsWith('http') ? 'bg-slate-200' : course.thumbnail_url} relative`}>
                                    {course.thumbnail_url.startsWith('http') && (
                                        <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                                    )}
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-deep-navy shadow-sm">
                                        {course.level}
                                    </div>
                                </div>

                                <div className="p-6 flex flex-col flex-grow">
                                    <h3 className="font-heading text-xl font-bold text-deep-navy mb-2 line-clamp-2">
                                        {course.title}
                                    </h3>
                                    <p className="text-slate-600 text-sm mb-4 line-clamp-3 flex-grow">
                                        {course.description}
                                    </p>

                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                                        <span className="text-brand-blue font-bold text-lg">
                                            {course.price > 0 ? `$${course.price}` : 'Free'}
                                        </span>
                                        <Link href={`/courses/${course.slug}`}>
                                            <Button variant="outline" size="sm">View Details</Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                        <h3 className="text-xl font-medium text-slate-400">No courses found matching "{searchParams.q}"</h3>
                        <Link href="/courses">
                            <Button variant="ghost" className="mt-4">Clear Search</Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
