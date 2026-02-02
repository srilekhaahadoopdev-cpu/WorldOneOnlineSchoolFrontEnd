'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart';

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const { items } = useCartStore();

    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        setMounted(true);
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user || null);
            setLoading(false);
        };
        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.refresh();
        setUser(null);
    };

    return (
        <nav className="fixed top-0 w-full z-50 glass-panel border-b border-white/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-brand-blue flex items-center justify-center text-white font-bold text-xl">
                                W
                            </div>
                            <span className="font-heading font-bold text-xl text-deep-navy tracking-tight">
                                World One
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="/" className="text-slate-600 hover:text-brand-blue font-medium transition-colors">
                            Home
                        </Link>
                        <Link href="/courses" className="text-slate-600 hover:text-brand-blue font-medium transition-colors">
                            Courses
                        </Link>
                        <Link href="/programs" className="text-slate-600 hover:text-brand-blue font-medium transition-colors">
                            Programs
                        </Link>
                        <Link href="/about" className="text-slate-600 hover:text-brand-blue font-medium transition-colors">
                            About
                        </Link>
                        {user?.email === 'admin@worldone.com' && (
                            <Link href="/admin" className="text-brand-gold hover:text-yellow-600 font-bold transition-colors">
                                Admin
                            </Link>
                        )}
                    </div>

                    {/* Desktop Right Section (Cart + Auth) */}
                    <div className="hidden md:flex items-center space-x-4">

                        {/* Cart Icon */}
                        {mounted && items.length > 0 && (
                            <Link href="/checkout" className="relative p-2 text-slate-600 hover:text-brand-blue transition-colors mr-2">
                                <ShoppingCart className="w-6 h-6" />
                                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                                    {items.length}
                                </span>
                            </Link>
                        )}

                        {loading ? (
                            <div className="h-8 w-20 bg-slate-100 animate-pulse rounded"></div>
                        ) : user ? (
                            <>
                                <Link href="/dashboard">
                                    <Button variant="ghost" size="sm">
                                        Dashboard
                                    </Button>
                                </Link>
                                <Button variant="outline" size="sm" onClick={handleSignOut}>
                                    Sign Out
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link href="/login">
                                    <Button variant="ghost" size="sm">
                                        Login
                                    </Button>
                                </Link>
                                <Link href="/register">
                                    <Button variant="primary" size="sm">
                                        Get Started
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        {mounted && items.length > 0 && (
                            <Link href="/checkout" className="relative p-2 text-slate-600 hover:text-brand-blue transition-colors mr-4">
                                <ShoppingCart className="w-6 h-6" />
                                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                                    {items.length}
                                </span>
                            </Link>
                        )}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-slate-600 hover:text-brand-blue focus:outline-none"
                        >
                            <span className="sr-only">Open main menu</span>
                            {!isOpen ? (
                                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            ) : (
                                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden glass-panel border-t border-white/20">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-brand-blue hover:bg-blue-50">
                            Home
                        </Link>
                        <Link href="/courses" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-brand-blue hover:bg-blue-50">
                            Courses
                        </Link>
                        <Link href="/programs" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-brand-blue hover:bg-blue-50">
                            Programs
                        </Link>
                        <Link href="/about" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-brand-blue hover:bg-blue-50">
                            About
                        </Link>
                        {user && (
                            <Link href="/dashboard" className="block px-3 py-2 rounded-md text-base font-bold text-brand-blue hover:bg-blue-50">
                                Dashboard
                            </Link>
                        )}

                        <div className="pt-4 flex flex-col space-y-2 px-3">
                            {user ? (
                                <Button variant="outline" className="w-full" onClick={handleSignOut}>Sign Out</Button>
                            ) : (
                                <>
                                    <Link href="/login" className="w-full">
                                        <Button variant="ghost" className="w-full justify-start">Login</Button>
                                    </Link>
                                    <Link href="/register" className="w-full">
                                        <Button variant="primary" className="w-full">Get Started</Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
