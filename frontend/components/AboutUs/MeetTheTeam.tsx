"use client";

import Image from "next/image";

const educators = [
    {
        name: "Dr. Sarah Mitchell",
        role: "Head of Sciences",
        experience: "15+ Years Experience",
        specialization: "Physics & Chemistry",
        philosophy: "I believe in learning by doing—experiments are the heart of science.",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400&h=400"
    },
    {
        name: "James Rodriguez",
        role: "Mathematics Lead",
        experience: "10+ Years Experience",
        specialization: "Calculus & Statistics",
        philosophy: "Math isn't just numbers; it's a language to understand the universe.",
        image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400&h=400"
    },
    {
        name: "Emily Chen",
        role: "Humanities Coordinator",
        experience: "8 Years Experience",
        specialization: "History & Literature",
        philosophy: "Storytelling is the key to connecting past wisdom with future action.",
        image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400&h=400"
    },
    {
        name: "Michael Chang",
        role: "Technology & Coding",
        experience: "12 Years Industry Exp.",
        specialization: "Computer Science",
        philosophy: "Coding is the new literacy. Everyone should have the power to create.",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400&h=400"
    }
];

export default function MeetTheTeam() {
    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-heading font-bold text-deep-navy mb-4">
                        Meet Our Educators
                    </h2>
                    <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                        Qualified, passionate, and experienced professionals dedicated to your success.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {educators.map((edu, index) => (
                        <div key={index} className="group text-center">
                            <div className="relative w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden shadow-lg border-4 border-slate-50 group-hover:border-brand-gold transition-colors duration-300">
                                <Image
                                    src={edu.image}
                                    alt={edu.name}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                            <h3 className="text-xl font-bold text-deep-navy">{edu.name}</h3>
                            <p className="text-brand-blue font-medium mb-2">{edu.role}</p>
                            <p className="text-sm text-slate-500 mb-3">{edu.experience} • {edu.specialization}</p>
                            <p className="text-sm text-slate-600 italic px-4">"{edu.philosophy}"</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
