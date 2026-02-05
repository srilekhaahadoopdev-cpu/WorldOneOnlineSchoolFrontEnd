import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export function Programs() {
    const programs = [
        {
            title: "Primary School",
            description: "Building strong foundations with engaging, interactive learning for young minds.",
            grades: "Grades 1-5",
            link: "/programs/primary"
        },
        {
            title: "Middle School",
            description: "Fostering critical thinking and independence as students transition to advanced topics.",
            grades: "Grades 6-8",
            link: "/programs/middle"
        },
        {
            title: "High School",
            description: "Comprehensive college-prep curriculum designed to prepare students for global success.",
            grades: "Grades 9-12",
            link: "/programs/high"
        }
    ];

    return (
        <section className="py-20 bg-slate-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="font-heading text-3xl md:text-4xl font-bold text-deep-navy mb-4">
                        Academic Programs
                    </h2>
                    <p className="text-slate-600 text-lg">
                        Tailored education for every stage of your child's development, following trusted international standards.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {programs.map((program, index) => (
                        <div
                            key={index}
                            className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-100"
                        >
                            <div className="inline-block px-3 py-1 bg-blue-50 text-brand-blue text-xs font-semibold rounded-full mb-4">
                                {program.grades}
                            </div>
                            <h3 className="font-heading text-2xl font-bold text-deep-navy mb-3 group-hover:text-brand-blue transition-colors">
                                {program.title}
                            </h3>
                            <p className="text-slate-600 mb-8 leading-relaxed">
                                {program.description}
                            </p>
                            <Link href={program.link}>
                                <span className="inline-flex items-center text-brand-blue font-semibold hover:text-blue-700 transition-colors">
                                    View Curriculum
                                    <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </span>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
