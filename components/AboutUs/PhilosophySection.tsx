"use client";

const philosophies = [
    {
        title: "Personalized Learning",
        description: "We adapt to each student's pace and style, ensuring no one is left behind and everyone is challenged.",
        icon: "🎯"
    },
    {
        title: "Project-Based Learning",
        description: "Students learn by doing real-world projects, not just maximizing test scores.",
        icon: "🏗️"
    },
    {
        title: "Role of Technology",
        description: "We use AI and advanced analytics to provide instant feedback and custom learning paths.",
        icon: "🤖"
    },
    {
        title: "Teacher-Student Interaction",
        description: "Small mentorship groups ensure every student is known, heard, and supported personally.",
        icon: "🤝"
    }
];

export default function PhilosophySection() {
    return (
        <section className="py-20 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-heading font-bold text-deep-navy mb-6">
                            How We Teach
                        </h2>
                        <div className="prose prose-lg text-slate-600 mb-8">
                            <p>
                                Traditional schools often use a "one size fits all" approach. At World One, we believe learning should be distinct, engaging, and relevant to the modern world.
                            </p>
                            <p>
                                Our philosophy blends academic rigor with the freedom to explore, ensuring students build not just knowledge, but character and competency.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {philosophies.map((item, index) => (
                            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                                <div className="text-3xl mb-3">{item.icon}</div>
                                <h3 className="text-lg font-bold text-deep-navy mb-2">{item.title}</h3>
                                <p className="text-sm text-slate-600">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
