
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

const CURRICULUM = [
    { subject: "Language Arts", topics: ["Literary Analysis", "Advanced Grammar", "Persuasive Writing", "Public Speaking"] },
    { subject: "Mathematics", topics: ["Pre-Algebra", "Algebra I", "Geometry", "Statistics & Probability"] },
    { subject: "Science", topics: ["Life Science", "Physical Science", "Earth & Space", "intro to Chemistry"] },
    { subject: "Social Studies", topics: ["World History", "Civics & Government", "Geography", "Ancient Civilizations"] },
    { subject: "Computer Science", topics: ["Intro to Coding (Python)", "Digital Citizenship", "Web Basics", "App Design"] },
    { subject: "World Languages", topics: ["Spanish I", "French I", "Cultural Studies", "Conversational Skills"] },
    { subject: "Visual & Performing Arts", topics: ["Drawing & Painting", "Theater Arts", "Music Appreciation", "Band/Orchestra"] },
];

export default function MiddleSchoolPage() {
    return (
        <div className="bg-slate-50 min-h-screen">
            <div className="bg-deep-navy text-white py-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 font-heading">Middle School Curriculum</h1>
                    <p className="text-xl opacity-90">Grades 6 - 8 • Fostering Independence</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto">
                    <p className="text-lg text-slate-700 mb-10 text-center leading-relaxed">
                        Our Middle School program is designed to bridge the gap between elementary and high school.
                        We emphasize critical thinking, independent study skills, and real-world application of knowledge.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {CURRICULUM.map((item, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                <h3 className="text-xl font-bold text-deep-navy mb-3">{item.subject}</h3>
                                <ul className="space-y-2">
                                    {item.topics.map((topic, tIdx) => (
                                        <li key={tIdx} className="flex items-start text-slate-600">
                                            <span className="text-blue-500 mr-2">✓</span>
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
                                Enroll in Middle School
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
