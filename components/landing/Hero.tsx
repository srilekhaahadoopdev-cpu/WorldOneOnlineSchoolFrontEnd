import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export function Hero() {
    return (
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 -z-10 opacity-30 translate-x-1/3 -translate-y-1/4">
                <div className="w-[800px] h-[800px] bg-gradient-to-br from-brand-blue/30 to-vibrant-teal/30 rounded-full blur-3xl animate-pulse" />
            </div>
            <div className="absolute bottom-0 left-0 -z-10 opacity-20 -translate-x-1/3 translate-y-1/4">
                <div className="w-[600px] h-[600px] bg-gradient-to-tr from-warm-coral/30 to-brand-blue/30 rounded-full blur-3xl" />
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                {/* Badge */}
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-brand-blue text-sm font-semibold mb-8 animate-fade-in-up">
                    <span className="flex h-2 w-2 rounded-full bg-brand-blue mr-2"></span>
                    Accepting New Students for 2026
                </div>

                {/* Headlines */}
                <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold text-deep-navy tracking-tight mb-6 leading-tight max-w-4xl mx-auto">
                    World Class Education, <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-vibrant-teal">
                        Anywhere.
                    </span>
                </h1>

                <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                    The global online school that adapts to your child's needs. Experience a curriculum designed for the future, accessible from the comfort of your home.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href="/register">
                        <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-xl shadow-brand-blue/20">
                            Join Now
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
