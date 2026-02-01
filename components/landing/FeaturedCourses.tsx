import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export function FeaturedCourses() {
    const courses = [
        {
            title: "Introduction to Artificial Intelligence",
            slug: "intro-to-ai",
            level: "High School",
            price: "$199",
            image: "bg-gradient-to-br from-indigo-500 to-purple-600"
        },
        {
            title: "Creative Writing Workshop",
            slug: "creative-writing",
            level: "Middle School",
            price: "$149",
            image: "bg-gradient-to-br from-orange-400 to-pink-500"
        },
        {
            title: "Foundations of Mathematics",
            slug: "math-foundations",
            level: "Primary School",
            price: "$129",
            image: "bg-gradient-to-br from-blue-400 to-cyan-500"
        }
    ];

    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                    <div className="max-w-2xl">
                        <h2 className="font-heading text-3xl md:text-4xl font-bold text-deep-navy mb-4">
                            Featured Courses
                        </h2>
                        <p className="text-slate-600 text-lg">
                            Explore our most popular courses designed to inspire and challenge students.
                        </p>
                    </div>
                    <Link href="/courses" className="hidden md:block">
                        <Button variant="outline">View All Courses</Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {courses.map((course, index) => (
                        <div key={index} className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                            {/* Image Placeholder */}
                            <div className={`h-48 w-full ${course.image} relative`}>
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-deep-navy shadow-sm">
                                    {course.level}
                                </div>
                            </div>

                            <div className="p-6">
                                <h3 className="font-heading text-xl font-bold text-deep-navy mb-2 line-clamp-2 min-h-[3.5rem]">
                                    {course.title}
                                </h3>
                                <div className="flex items-center justify-between mt-4">
                                    <span className="text-brand-blue font-bold text-lg">{course.price}</span>
                                    <Link href={`/courses/${course.slug}`} className="text-slate-500 hover:text-brand-blue font-medium text-sm transition-colors">
                                        View Details →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 text-center md:hidden">
                    <Link href="/courses">
                        <Button variant="outline" className="w-full">View All Courses</Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
