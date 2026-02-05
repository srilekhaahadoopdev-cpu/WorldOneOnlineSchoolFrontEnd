import Link from 'next/link';

export function Footer() {
    return (
        <footer className="bg-deep-navy text-slate-300 py-12 border-t border-slate-800">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-brand-blue flex items-center justify-center text-white font-bold text-xl">
                                W
                            </div>
                            <span className="font-heading font-bold text-xl text-white tracking-tight">
                                World One
                            </span>
                        </Link>
                        <p className="text-slate-400 leading-relaxed max-w-sm">
                            Empowering students worldwide with access to premium education, anytime, anywhere.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h3 className="font-heading font-bold text-white mb-4">Platform</h3>
                        <ul className="space-y-3">
                            <li><Link href="/programs" className="hover:text-brand-blue transition-colors">Programs</Link></li>
                            <li><Link href="/courses" className="hover:text-brand-blue transition-colors">Courses</Link></li>
                            <li><Link href="/pricing" className="hover:text-brand-blue transition-colors">Tuition & Pricing</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-heading font-bold text-white mb-4">Support</h3>
                        <ul className="space-y-3">
                            <li><Link href="/about" className="hover:text-brand-blue transition-colors">About Us</Link></li>
                            <li><Link href="/contact" className="hover:text-brand-blue transition-colors">Contact Support</Link></li>
                            <li><Link href="/privacy" className="hover:text-brand-blue transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-brand-blue transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-slate-500">
                        © {new Date().getFullYear()} World One Online School. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-sm">
                        <Link href="/login" className="text-slate-500 hover:text-white transition-colors">
                            Teacher Login
                        </Link>
                        <Link href="/login?role=admin" className="text-slate-600 hover:text-slate-500 transition-colors cursor-default">
                            Admin Portal
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
