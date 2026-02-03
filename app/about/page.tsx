import { Button } from "@/components/ui/Button";
import Link from "next/link";
import PhilosophySection from "../../components/AboutUs/PhilosophySection";
import ValuesSection from "../../components/AboutUs/ValuesSection";
import MeetTheTeam from "../../components/AboutUs/MeetTheTeam";
import SuccessStories from "../../components/AboutUs/SuccessStories";

export const metadata = {
    title: "About Us | World One Online School",
    description: "Learn about our mission, vision, and the educators shaping the future of online learning.",
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative py-24 bg-gradient-to-br from-deep-navy to-slate-900 text-white overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <div className="inline-block px-4 py-1 rounded-full bg-brand-gold/20 text-brand-gold border border-brand-gold/30 mb-6 font-medium">
                        Global • Inclusive • Future-Ready
                    </div>
                    <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6 leading-tight">
                        Education Without <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-yellow-200">
                            Boundaries
                        </span>
                    </h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Our mission is to democratize quality education, making world-class learning accessible to every student, everywhere.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/programs">
                            <Button className="bg-brand-gold hover:bg-yellow-500 text-deep-navy font-bold px-8 py-4 rounded-full text-lg shadow-lg hover:shadow-brand-gold/20 transition-all">
                                Explore Programs
                            </Button>
                        </Link>
                        <Link href="/contact">
                            <Button variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-4 rounded-full text-lg">
                                Contact Us
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Mission & Vision Grid */}
            <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="bg-slate-50 p-10 rounded-3xl border border-slate-100">
                        <h3 className="text-2xl font-bold text-deep-navy mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue">🎯</span>
                            Our Mission
                        </h3>
                        <p className="text-slate-600 leading-relaxed text-lg">
                            To provide a flexible, high-quality, and personalized education that helps students discover their unique potential and prepares them for success in a rapidly changing world.
                        </p>
                    </div>
                    <div className="bg-deep-navy p-10 rounded-3xl text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/10 rounded-full blur-3xl" />
                        <h3 className="text-2xl font-bold mb-4 flex items-center gap-3 relative z-10">
                            <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-brand-gold">🔭</span>
                            Our Vision
                        </h3>
                        <p className="text-slate-300 leading-relaxed text-lg relative z-10">
                            To be the world's leading online school, fostering a global community of lifelong learners, innovators, and compassionate leaders by 2030.
                        </p>
                    </div>
                </div>
            </section>

            {/* Components */}
            <PhilosophySection />

            {/* Accreditation Placeholder (Simple Banner) */}
            <section className="py-12 border-y border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-6">Accredited & Recognized By</p>
                    <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Placeholders for logos */}
                        <div className="text-2xl font-bold text-slate-800 flex items-center gap-2"><span className="text-brand-blue">CBSE</span> Curriculum</div>
                        <div className="text-2xl font-bold text-slate-800 flex items-center gap-2"><span className="text-red-600">Cambridge</span> International</div>
                        <div className="text-2xl font-bold text-slate-800 flex items-center gap-2"><span className="text-green-600">NIOS</span> Board</div>
                        <div className="text-2xl font-bold text-slate-800 flex items-center gap-2">Microsoft <span className="font-normal text-slate-500">Education</span></div>
                    </div>
                    <p className="mt-6 text-xs text-slate-400">
                        * Some accreditations may be in progress. Please contact admissions for specific localized validity.
                    </p>
                </div>
            </section>

            <ValuesSection />
            <MeetTheTeam />
            <SuccessStories />

            {/* CTA Footer */}
            <section className="py-24 bg-brand-gold text-deep-navy text-center">
                <div className="max-w-4xl mx-auto px-4">
                    <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6">Ready to Join the Future of Schooling?</h2>
                    <p className="text-xl mb-10 font-medium opacity-90">Admissions are open for the upcoming academic year.</p>
                    <Link href="/auth/signup">
                        <Button className="bg-deep-navy text-white hover:bg-slate-800 px-10 py-5 rounded-full text-xl shadow-xl hover:scale-105 transition-transform">
                            Apply Now
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
}
