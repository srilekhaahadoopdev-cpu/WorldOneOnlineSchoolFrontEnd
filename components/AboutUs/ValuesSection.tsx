"use client";

import { motion } from "framer-motion";

const values = [
    {
        icon: "🌍",
        title: "Inclusion",
        description: "We believe education should be accessible to everyone, everywhere, regardless of background."
    },
    {
        icon: "🎓",
        title: "Student-First",
        description: "Every decision we make puts the student's growth and well-being at the center."
    },
    {
        icon: "🚀",
        title: "Global Mindset",
        description: "Preparing students not just for exams, but for a connected, global future."
    },
    {
        icon: "💻",
        title: "Digital Fluency",
        description: "Mastering the tools of tomorrow through immersive, technology-driven learning."
    },
    {
        icon: "⚖️",
        title: "Academic Integrity",
        description: "Fostering honesty, responsibility, and ethical behavior in all pursuits."
    }
];

export default function ValuesSection() {
    return (
        <section className="py-20 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-heading font-bold text-deep-navy mb-4">
                        Our Values & Culture
                    </h2>
                    <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                        We stand for more than just grades. Our culture is built on principles that shape responsible, future-ready citizens.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {values.map((value, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
                        >
                            <div className="text-4xl mb-4">{value.icon}</div>
                            <h3 className="text-xl font-bold text-deep-navy mb-2">{value.title}</h3>
                            <p className="text-slate-600 leading-relaxed">{value.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
