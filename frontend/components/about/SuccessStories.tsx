"use client";

import Image from "next/image";

const testimonials = [
    {
        name: "Priya Sharma",
        role: "Parent of Grade 10 Student",
        outcome: "Improved Math Score by 30%",
        quote: "The personalized attention my son receives here is unlike any school he has attended before. He actually looks forward to classes now.",
        image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=200"
    },
    {
        name: "Rahul Verma",
        role: "Grade 12 Student",
        outcome: "Accepted into Top University",
        quote: "The flexible schedule allowed me to pursue competitive coding alongside my studies. World One gave me the best of both worlds.",
        image: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&q=80&w=200&h=200"
    },
    {
        name: "Anita Desai",
        role: "Parent of Grade 6 Student",
        outcome: "Boosted Confidence",
        quote: "My daughter used to be shy in class. The online format and supportive teachers have helped her find her voice and confidence.",
        image: "https://images.unsplash.com/photo-1554151228-14d9def656ec?auto=format&fit=crop&q=80&w=200&h=200"
    }
];

export default function SuccessStories() {
    return (
        <section className="py-20 bg-deep-navy text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-gold/5 transform skew-x-12 translate-x-1/4" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
                        Student Success Stories
                    </h2>
                    <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                        Real outcomes from real families. Hear how World One is making a difference.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((t, index) => (
                        <div key={index} className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/10 hover:bg-white/20 transition-colors">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-brand-gold">
                                    <Image src={t.image} alt={t.name} fill className="object-cover" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white">{t.name}</h4>
                                    <p className="text-xs text-brand-gold uppercase tracking-wider">{t.role}</p>
                                </div>
                            </div>
                            <blockquote className="text-slate-200 italic mb-6">"{t.quote}"</blockquote>
                            <div className="inline-block bg-brand-blue/30 text-brand-blue px-3 py-1 rounded-full text-xs font-bold border border-brand-blue/50">
                                ⭐ {t.outcome}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
