export function Stats() {
    const stats = [
        { label: "Active Students", value: "10k+" },
        { label: "Countries", value: "85+" },
        { label: "Expert Teachers", value: "500+" },
        { label: "Accreditation", value: "Global" },
    ];

    return (
        <section className="py-12 bg-white border-y border-slate-100">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                    {stats.map((stat, index) => (
                        <div key={index} className="flex flex-col items-center justify-center text-center">
                            <div className="font-heading font-bold text-4xl text-deep-navy mb-2">
                                {stat.value}
                            </div>
                            <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
