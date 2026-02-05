
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Hero } from '@/components/landing/Hero';

const CURRICULUM = [
    { subject: "English Language Arts", topics: ["Reading Comprehension", "Grammar & Vocabulary", "Creative Writing", "Phonics"] },
    { subject: "Mathematics", topics: ["Number Sense", "Basic Operations", "Geometry Shapes", "Data & Graphs"] },
    { subject: "Science", topics: ["Plants & Animals", "Earth Science", "Physical Science", "Scientific Inquiry"] },
    { subject: "Social Studies", topics: ["Community Helpers", "Geography Basics", "History of World", "Culture & Traditions"] },
    { subject: "Arts & Creativity", topics: ["Drawing & Painting", "Music Theory", "Digital Arts", "Crafts"] },
    { subject: "Physical Education", topics: ["Motor Skills", "Team Games", "Health & Hygiene", "Outdoor Activities"] },
    { subject: "Computer Basics", topics: ["Keyboarding", "Digital Safety", "Educational Games", "Intro to Coding"] },
];

export default function PrimarySchoolPage() {
    return (
        <div className="bg-slate-50 min-h-screen">
            <div className="bg-brand-blue text-white py-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 font-heading">Primary School Curriculum</h1>
                    <p className="text-xl opacity-90">Grades 1 - 5 • Building Strong Foundations</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto">
                    <p className="text-lg text-slate-700 mb-10 text-center leading-relaxed">
                        Our Primary School program focuses on essential literacy and numeracy skills while fostering curiosity through science and social studies.
                        We create a supportive environment where young learners develop a love for learning.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {CURRICULUM.map((item, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                <h3 className="text-xl font-bold text-deep-navy mb-3">{item.subject}</h3>
                                <ul className="space-y-2">
                                    {item.topics.map((topic, tIdx) => (
                                        <li key={tIdx} className="flex items-start text-slate-600">
                                            <span className="text-green-500 mr-2">✓</span>
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
                                Enroll in Primary School
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
