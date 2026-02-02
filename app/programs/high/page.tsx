
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

const CURRICULUM = [
    { subject: "English Literature", topics: ["World Literature", "American Literature", "Research Writing", "Journalism"] },
    { subject: "Mathematics", topics: ["Algebra II", "Trigonometry", "Pre-Calculus", "Calculus"] },
    { subject: "Science", topics: ["Biology", "Chemistry", "Physics", "Environmental Science"] },
    { subject: "History & Social Sciences", topics: ["Modern World History", "Economics", "Psychology", "Global Politics"] },
    { subject: "Electives", topics: ["Business Management", "Computer Science Principles", "Graphic Design", "Foreign Languages"] },
    { subject: "Physical Education & Health", topics: ["Personal Fitness", "Nutrition", "Sports Medicine", "Health Education"] },
    { subject: "Fine Arts", topics: ["Studio Art", "Art History", "Music Theory", "Theater Production"] },
];

export default function HighSchoolPage() {
    return (
        <div className="bg-slate-50 min-h-screen">
            <div className="bg-vibrant-teal text-white py-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 font-heading">High School Curriculum</h1>
                    <p className="text-xl opacity-90">Grades 9 - 12 • College & Career Ready</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto">
                    <p className="text-lg text-slate-700 mb-10 text-center leading-relaxed">
                        Our High School program provides rigorous academic preparation for university and beyond.
                        Students can choose from a wide range of electives and Advanced Placement (AP) courses to tailor their path.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {CURRICULUM.map((item, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                <h3 className="text-xl font-bold text-deep-navy mb-3">{item.subject}</h3>
                                <ul className="space-y-2">
                                    {item.topics.map((topic, tIdx) => (
                                        <li key={tIdx} className="flex items-start text-slate-600">
                                            <span className="text-purple-500 mr-2">✓</span>
                                            {topic}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 text-center">
                        <Link href="/register">
                            <Button className="bg-brand-gold hover:bg-yellow-500 text-deep-navy font-bold text-lg px-8 py-4 rounded-full shadow-lg">
                                Enroll in High School
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
